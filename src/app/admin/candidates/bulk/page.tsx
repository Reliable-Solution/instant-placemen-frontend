"use client";

// Bulk CV import: up to 20 PDFs. Each file gets instant client parse + exactly
// one server AI call (cached repeats cost zero tokens), 2 files at a time for
// free-tier rate limits. Review all fields per row, then one PDF upload each +
// one bulk import call. One bad file never stops the batch.

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
  Layers,
} from "lucide-react";
import {
  DEFAULT_CANDIDATE,
  extractTextFromPdf,
  scrapeCandidateDataFromText,
} from "@/lib/pdfParser";
import type { CandidateFormData } from "@/lib/pdfParser";
import {
  useUploadCandidateResumeMutation,
  useImportCandidatesMutation,
  useParseResumeWithAiMutation,
} from "@/services/api/adminApi";

type RowStatus = "queued" | "parsing" | "review" | "uploading" | "done" | "error";

interface BulkRow {
  id: string;
  file: File;
  text: string;
  data: CandidateFormData;
  status: RowStatus;
  error?: string | null;
  provider?: string | null;
  cached?: boolean;
  expanded?: boolean;
  resultStatus?: string;
  resultReason?: string;
  resultId?: string;
}

const MAX_FILES = 20;
const CONCURRENCY = 2;

let rowSeq = 0;
const newId = () => `bulk-${Date.now()}-${rowSeq++}`;

const tierForYears = (yrs: number): string => {
  if (!yrs || yrs <= 0) return "Fresher";
  if (yrs < 1) return "Less than 1 Year";
  if (yrs < 3) return "1-3 Years";
  if (yrs < 5) return "3-5 Years";
  return "5+ Years";
};

const tierForDegree = (degree: string): string => {
  const d = degree.toLowerCase();
  if (/mba|mca|m\.?tech|m\.?sc|m\.?com|post graduate|master|phd|master\s*of\s*business\s*administration|master\s*of\s*computer\s*applications|master\s*of\s*commerce|master\s*of\s*science/.test(d)) return "Post Graduate";
  if (/b\.?tech|b\.?e\b|bca|b\.?sc|b\.?com|bba|graduate|bachelor|b\.?pharm|llb|bachelor\s*of\s*business\s*administration|bachelor\s*of\s*computer\s*applications|bachelor\s*of\s*commerce|bachelor\s*of\s*science|bachelor\s*of\s*technology/.test(d)) return "Graduate";
  if (/diploma|iti/.test(d)) return "Diploma";
  if (/12th|hsc|higher secondary/.test(d)) return "12th Pass";
  if (/10th|ssc/.test(d)) return "10th Pass";
  return "12th Pass";
};

export default function BulkImportPage() {
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSummary, setSubmitSummary] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [skillInputs, setSkillInputs] = useState<Record<string, string>>({});
  const runningRef = useRef(false);

  const [uploadResume] = useUploadCandidateResumeMutation();
  const [importCandidates] = useImportCandidatesMutation();
  const [parseWithServerAi] = useParseResumeWithAiMutation();

  const patchRow = (id: string, patch: Partial<BulkRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const updateField = (id: string, field: keyof CandidateFormData, value: any) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, data: { ...r.data, [field]: value } } : r)));

  const updateYears = (id: string, yrs: number) => {
    const safe = Number.isFinite(yrs) && yrs >= 0 ? Math.min(40, yrs) : 0;
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, data: { ...r.data, totalExperienceYears: safe, experience: tierForYears(safe) } } : r))
    );
  };

  const updateDegree = (id: string, degree: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              data: {
                ...r.data,
                qualificationDetail: degree,
                qualification: degree.trim() ? tierForDegree(degree) : r.data.qualification,
              },
            }
          : r
      )
    );
  };

  const addSkill = (id: string) => {
    const v = (skillInputs[id] || "").trim();
    if (!v) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === id && !r.data.skills.includes(v) ? { ...r, data: { ...r.data, skills: [...r.data.skills, v] } } : r
      )
    );
    setSkillInputs((prev) => ({ ...prev, [id]: "" }));
  };

  const removeSkill = (id: string, skill: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, data: { ...r.data, skills: r.data.skills.filter((s) => s !== skill) } } : r))
    );

  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const pdfs = acceptedFiles.filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      setRows((prev) => {
        const room = Math.max(0, MAX_FILES - prev.length);
        const mapped: BulkRow[] = pdfs.slice(0, room).map((file) => ({
          id: newId(),
          file,
          text: "",
          data: { ...DEFAULT_CANDIDATE },
          status: "queued" as RowStatus,
        }));
        return [...prev, ...mapped];
      });
      if (acceptedFiles.length > pdfs.length) {
        setSubmitError("Only PDF files are accepted - others were skipped.");
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  // Parse one row: instant client regex first, then server AI upgrade (cached = free).
  const parseRow = async (row: BulkRow) => {
    patchRow(row.id, { status: "parsing", error: null });
    try {
      const text = await extractTextFromPdf(row.file);
      const client = scrapeCandidateDataFromText(text);
      patchRow(row.id, { text, data: { ...client }, status: "parsing" });
      try {
        const fd = new FormData();
        fd.append("file", row.file);
        const serverRes = await parseWithServerAi(fd).unwrap();
        if (serverRes?.success && serverRes.candidate) {
          patchRow(row.id, {
            data: { ...client, ...serverRes.candidate },
            provider: serverRes.provider
              ? `${serverRes.provider}${serverRes.cached ? " (cached)" : ""}`
              : null,
            cached: !!serverRes.cached,
            status: "review",
            error: serverRes.needsReview ? "Low confidence - review fields." : null,
          });
          return;
        }
      } catch (serverErr: any) {
        // fall through to client result
      }
      patchRow(row.id, { status: "review", provider: "regex (client)" });
    } catch (err: any) {
      patchRow(row.id, { status: "error", error: err?.message || "Could not read PDF." });
    }
  };

  // Worker pool: 2 files at a time (free-tier friendly).
  const runAll = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    setSubmitSummary(null);
    try {
      const pending = rows.filter((r) => r.status === "queued" || r.status === "error");
      const queue = [...pending];
      const workers = Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length > 0) {
          const row = queue.shift();
          if (!row) break;
          await parseRow(row);
        }
      });
      await Promise.all(workers);
    } finally {
      runningRef.current = false;
      setIsRunning(false);
    }
  };

  const validRows = rows.filter(
    (r) => r.status === "review" && r.data.name.trim() && String(r.data.phone).replace(/\D/g, "").length === 10
  );

  const handleSubmitAll = async () => {
    setSubmitError(null);
    setSubmitSummary(null);
    if (validRows.length === 0) {
      setSubmitError("No valid rows to import. Each needs a name + 10-digit phone.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Step 1: upload each PDF (sequential, rate-limit friendly)
      const payloads: Array<{ row: BulkRow; resumeFile: string }> = [];
      for (const row of validRows) {
        patchRow(row.id, { status: "uploading" });
        try {
          const fd = new FormData();
          fd.append("file", row.file);
          const up = await uploadResume(fd).unwrap();
          const resumeFile = up?.resumeFile;
          if (!resumeFile) throw new Error("Upload returned no filename.");
          payloads.push({ row, resumeFile });
          patchRow(row.id, { status: "uploading" });
        } catch (e: any) {
          patchRow(row.id, { status: "error", error: e?.data?.message || e?.message || "Upload failed." });
        }
      }
      // Step 2: single bulk import call
      const candidates = payloads.map(({ row, resumeFile }) => ({
        name: row.data.name.trim(),
        phone: String(row.data.phone).replace(/\D/g, "").slice(-10),
        email: row.data.email ? row.data.email.trim().toLowerCase() : undefined,
        city: row.data.city || "Surat",
        locality: row.data.locality?.trim() || undefined,
        currentRole: row.data.currentRole?.trim() || undefined,
        experience: row.data.experience || "Fresher",
        totalExperienceYears: Number(row.data.totalExperienceYears) || 0,
        qualification: row.data.qualification || "12th Pass",
        qualificationDetail: row.data.qualificationDetail?.trim() || undefined,
        skills: row.data.skills,
        expectedSalaryMonthly: Number(row.data.expectedSalaryMonthly) || 15000,
        noticePeriod: row.data.noticePeriod || "IMMEDIATE",
        consentToShareProfile: row.data.consentToShareProfile === true,
        resumeFile,
        resumeSummary: row.data.resumeSummary?.trim() || undefined,
        resumeParsedText: row.data.resumeParsedText || undefined,
      }));
      if (candidates.length === 0) throw new Error("All uploads failed - nothing to import.");
      const res = await importCandidates({ candidates }).unwrap();
      if (!res?.success) throw new Error(res?.message || "Bulk import failed.");
      (res.results || []).forEach((item: any, i: number) => {
        const row = payloads[i]?.row;
        if (!row) return;
        patchRow(row.id, {
          status: "done",
          resultStatus: item.status,
          resultReason: item.reason,
          resultId: item.userId || item.candidate?._id,
        });
      });
      setSubmitSummary(res.summary);
    } catch (e: any) {
      setSubmitError(e?.data?.message || e?.message || "Bulk import failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRows([]);
    setSubmitSummary(null);
    setSubmitError(null);
  };

  const reviewed = rows.filter((r) => r.status === "review").length;
  const errored = rows.filter((r) => r.status === "error").length;
  const done = rows.filter((r) => r.status === "done").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="border-b border-slate-200 pb-5">
        <Link
          href="/admin/candidates/add"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          ← Back to Add Candidate
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-1">
          <Layers className="w-6 h-6 text-blue-600" />
          <span>Bulk CV Import</span>
          <span className="text-xs uppercase px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
            up to {MAX_FILES} PDFs
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Drop many resumes. Each gets instant parsing + server AI upgrade (cached repeats cost zero tokens, 2 at a time). Review, then import all in one call.
        </p>
      </div>

      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{submitError}</span>
          <button onClick={() => setSubmitError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {submitSummary && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-3 flex-wrap">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="font-bold">
            Imported: {submitSummary.created} created • {submitSummary.duplicate} duplicates • {submitSummary.invalid} invalid (of {submitSummary.total})
          </span>
          <Link href="/admin/candidates" className="ml-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg">
            View Talent Pool
          </Link>
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all bg-white ${
          isDragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-300 hover:border-blue-400"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-10 h-10 text-blue-600 mx-auto" />
        <p className="text-sm font-extrabold text-slate-900 mt-2">Drag & drop up to {MAX_FILES} PDF CVs here</p>
        <p className="text-xs text-slate-500 mt-0.5">or click to browse • {rows.length}/{MAX_FILES} added</p>
      </div>

      {/* Actions */}
      {rows.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={runAll}
            disabled={isRunning || isSubmitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isRunning ? "Extracting..." : "Extract All"}</span>
          </button>
          <button
            type="button"
            onClick={handleSubmitAll}
            disabled={isRunning || isSubmitting || validRows.length === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{isSubmitting ? "Importing..." : `Import All Valid (${validRows.length})`}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isRunning || isSubmitting}
            className="px-4 py-2.5 bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-xl flex items-center gap-1.5 hover:bg-slate-50"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
          <span className="ml-auto text-xs text-slate-500 font-semibold">
            {reviewed} ready • {done} imported • {errored} errors
          </span>
        </div>
      )}

      {/* Queue table */}
      {rows.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    row.status === "done" ? "bg-emerald-100 text-emerald-700"
                    : row.status === "error" ? "bg-rose-100 text-rose-700"
                    : row.status === "review" ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-500"
                  }`}>
                    {(row.status === "parsing" || row.status === "uploading") ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : row.status === "done" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : row.status === "error" ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{row.file.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {row.status === "review" && row.data.name
                        ? `${row.data.name} • ${row.data.phone || "no phone"} • ${row.data.currentRole || ""}`
                        : row.status === "done"
                        ? `${row.resultStatus === "duplicate" ? "Duplicate" : "Created"}${row.resultReason ? ` - ${row.resultReason}` : ""}`
                        : row.status}
                      {row.provider ? ` • ${row.provider}` : ""}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                    row.status === "done" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : row.status === "error" ? "bg-rose-50 text-rose-700 border-rose-200"
                    : row.status === "review" ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {row.status}
                  </span>
                  {(row.status === "review" || row.status === "error") && (
                    <button
                      type="button"
                      onClick={() => patchRow(row.id, { expanded: !row.expanded })}
                      className="p-1.5 text-slate-400 hover:text-slate-700"
                    >
                      {row.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                  {(row.status === "queued" || row.status === "error") && (
                    <button type="button" onClick={() => removeRow(row.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {row.error && (
                  <p className="mt-2 ml-12 text-[11px] text-rose-600 font-semibold">{row.error}</p>
                )}

                {row.expanded && (row.status === "review" || row.status === "error") && (
                  <div className="mt-3 ml-12 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="text-[11px] font-bold text-slate-600">
                      Full Name *
                      <input
                        value={row.data.name}
                        onChange={(e) => updateField(row.id, "name", e.target.value)}
                        className="mt-1 w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="text-[11px] font-bold text-slate-600">
                      Phone (10 digits) *
                      <input
                        value={row.data.phone}
                        onChange={(e) => updateField(row.id, "phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="mt-1 w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="text-[11px] font-bold text-slate-600">
                      Role
                      <input
                        value={row.data.currentRole}
                        onChange={(e) => updateField(row.id, "currentRole", e.target.value)}
                        className="mt-1 w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="text-[11px] font-bold text-slate-600">
                      City
                      <input
                        value={row.data.city}
                        onChange={(e) => updateField(row.id, "city", e.target.value)}
                        className="mt-1 w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="text-[11px] font-bold text-slate-600">
                      Email
                      <input
                        value={row.data.email}
                        onChange={(e) => updateField(row.id, "email", e.target.value)}
                        className="mt-1 w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="text-[11px] font-bold text-slate-600">
                      Locality
                      <input
                        value={row.data.locality}
                        onChange={(e) => updateField(row.id, "locality", e.target.value)}
                        className="mt-1 w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="text-[11px] font-bold text-slate-600">
                      Total Years ({row.data.experience})
                      <input
                        type="number"
                        min={0}
                        max={40}
                        step={0.5}
                        value={row.data.totalExperienceYears}
                        onChange={(e) => updateYears(row.id, Number(e.target.value))}
                        className="mt-1 w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <label className="text-[11px] font-bold text-slate-600">
                      Qualification ({row.data.qualification})
                      <input
                        value={row.data.qualificationDetail}
                        onChange={(e) => updateDegree(row.id, e.target.value)}
                        placeholder="e.g. BCA, B.Com"
                        className="mt-1 w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">
                        Skills ({row.data.skills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-lg min-h-[40px]">
                        {row.data.skills.map((s) => (
                          <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-[11px] font-bold">
                            <span>{s}</span>
                            <button type="button" onClick={() => removeSkill(row.id, s)} className="text-slate-400 hover:text-rose-500">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          value={skillInputs[row.id] || ""}
                          onChange={(e) => setSkillInputs((prev) => ({ ...prev, [row.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill(row.id);
                            }
                          }}
                          placeholder="Add skill + Enter"
                          className="flex-1 min-w-[110px] px-1 py-0.5 text-[11px] bg-transparent outline-none"
                        />
                      </div>
                    </div>
                    {row.data.resumeSummary && (
                      <p className="sm:col-span-2 text-[11px] text-slate-500 italic leading-relaxed">
                        {row.data.resumeSummary}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
