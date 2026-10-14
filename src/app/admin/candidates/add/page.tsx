"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  RefreshCw,
  Plus,
  X,
  Eye,
  Check,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  GraduationCap,
  IndianRupee,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Users,
  Building,
  Copy,
  ExternalLink,
  MessageSquare,
  BadgeCheck,
  Edit3,
  Download,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import {
  DEFAULT_CANDIDATE,
  extractTextFromPdf,
  scrapeCandidateDataFromText,
  COMMON_CITIES,
  COMMON_SKILLS,
} from "@/lib/pdfParser";
import type { CandidateFormData } from "@/lib/pdfParser";
import {
  useUploadCandidateResumeMutation,
  useImportCandidatesMutation,
  useParseResumeWithAiMutation,
} from "@/services/api/adminApi";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CandidateDetailModal } from "@/components/admin/CandidateDetailModal";
import { getApiBaseUrl } from "@/lib/config";

export default function AddCandidatePage() {
  const router = useRouter();

  // RTK Query Mutations
  const [uploadResume, { isLoading: isUploadingResume }] = useUploadCandidateResumeMutation();
  const [importCandidates, { isLoading: isImporting }] = useImportCandidatesMutation();
  const [parseWithServerAi] = useParseResumeWithAiMutation();
  const [serverProvider, setServerProvider] = useState<string | null>(null);
  const [parseNeedsReview, setParseNeedsReview] = useState(false);

  // Parsing & File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [candidateData, setCandidateData] = useState<CandidateFormData>(DEFAULT_CANDIDATE);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [usedAiParser, setUsedAiParser] = useState(false);

  // Skill Input & Accordions
  const [newSkill, setNewSkill] = useState("");
  const [showRawText, setShowRawText] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  // Status & Submission State
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null);
  const [importedRecord, setImportedRecord] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // URL & Token helpers for Resume
  const API_BASE = getApiBaseUrl();
  const SERVER_BASE = API_BASE.replace("/api/v1", "");
  const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : "";

  const getFullResumeUrl = (url?: string) => {
    if (!url) return "";
    const raw = url.startsWith("http") ? url : `${SERVER_BASE}${url}`;
    return token ? `${raw}${raw.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}` : raw;
  };

  const handleCopySummary = (rec: any) => {
    const summaryText = `*Candidate Profile - Instant Placement*
Name: ${rec.name}
Role: ${rec.currentRole || "Candidate"}
Phone: +91 ${rec.phone}
Email: ${rec.email || "N/A"}
Location: ${rec.city || "Surat"}${rec.locality ? `, ${rec.locality}` : ""}
Experience: ${rec.experience} (${rec.totalExperienceYears || 0} yrs)
Qualification: ${rec.qualification}${rec.qualificationDetail ? ` (${rec.qualificationDetail})` : ""}
Expected Salary: ₹${Number(rec.expectedSalaryMonthly || 0).toLocaleString("en-IN")}/mo
Notice Period: ${rec.noticePeriod || "IMMEDIATE"}
Skills: ${(rec.skills || []).join(", ") || "None"}
Status: ${rec.status === "duplicate" ? "Duplicate Record" : "Enrolled"}
ID: ${rec._id || "N/A"}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // PDF Dropzone handler
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setSelectedFile(file);
      setIsParsing(true);
      setParseError(null);
      setSubmitError(null);
      setSubmitSuccess(null);
      setImportedRecord(null);

      try {
        const text = await extractTextFromPdf(file);
        setRawText(text);

        // Instant client-side parse; server AI then upgrades it (client regex
        // misses spaced Canva text, role titles, degree details, skill lists).
        const parsed: CandidateFormData = scrapeCandidateDataFromText(text);
        setUsedAiParser(false);
        setServerProvider(null);

        setCandidateData(parsed);

        // Server AI upgrade (always): backend runs OCR + strong parser + AI chain
        // (groq -> openrouter -> deepseek -> gemini -> ollama) with result cache.
        // Same CV twice costs zero tokens. Failures keep the client result.
        try {
          const fd = new FormData();
          fd.append("file", file);
          const serverRes = await parseWithServerAi(fd).unwrap();
          if (serverRes?.success && serverRes.candidate) {
              setCandidateData((prev) => ({ ...prev, ...serverRes.candidate }));
              setUsedAiParser(serverRes.provider !== "regex");
              setParseNeedsReview(!!serverRes.needsReview);
              setServerProvider(
                serverRes.provider
                  ? `${serverRes.provider}${serverRes.cached ? " (cached, 0 tokens)" : ""}`
                  : null
              );
              if (serverRes.manualReview) {
                setParseError(
                  "All AI providers failed - regex result below. Please review/edit every field manually before saving."
                );
              } else if (serverRes.needsReview) {
                setParseError(
                  (prev) =>
                    prev ||
                    "Low-confidence extraction - please review every field before saving."
                );
              }
            }
          } catch (serverErr) {
            console.warn("Server AI parse unavailable, keeping client result:", serverErr);
          }
      } catch (err: any) {
        setParseError(err?.message || "Failed to read or parse PDF file.");
      } finally {
        setIsParsing(false);
      }
    },
    [parseWithServerAi]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const updateField = (field: keyof CandidateFormData, value: any) => {
    setCandidateData((prev) => ({ ...prev, [field]: value }));
  };

  // Single experience input -> tier derived automatically (no double fields)
  const experienceTierForYears = (yrs: number): string => {
    if (!yrs || yrs <= 0) return "Fresher";
    if (yrs < 1) return "Less than 1 Year";
    if (yrs < 3) return "1-3 Years";
    if (yrs < 5) return "3-5 Years";
    return "5+ Years";
  };

  const handleYearsChange = (yrs: number) => {
    const safe = Number.isFinite(yrs) && yrs >= 0 ? Math.min(40, yrs) : 0;
    setCandidateData((prev) => ({ ...prev, totalExperienceYears: safe, experience: experienceTierForYears(safe) }));
  };

  // Single qualification input -> tier derived automatically (no double fields)
  const qualificationTierForDegree = (degree: string): string => {
    const d = degree.toLowerCase();
    if (/mba|mca|m\.?tech|m\.?sc|m\.?com|post graduate|master|phd|master\s*of\s*business\s*administration|master\s*of\s*computer\s*applications|master\s*of\s*commerce|master\s*of\s*science/.test(d)) return "Post Graduate";
    if (/b\.?tech|b\.?e\b|bca|b\.?sc|b\.?com|bba|graduate|bachelor|b\.?pharm|llb|bachelor\s*of\s*business\s*administration|bachelor\s*of\s*computer\s*applications|bachelor\s*of\s*commerce|bachelor\s*of\s*science|bachelor\s*of\s*technology/.test(d)) return "Graduate";
    if (/diploma|iti/.test(d)) return "Diploma";
    if (/12th|hsc|higher secondary/.test(d)) return "12th Pass";
    if (/10th|ssc/.test(d)) return "10th Pass";
    return "12th Pass";
  };

  const handleDegreeChange = (degree: string) => {
    setCandidateData((prev) => ({
      ...prev,
      qualificationDetail: degree,
      qualification: degree.trim() ? qualificationTierForDegree(degree) : prev.qualification,
    }));
  };

  const handleAddSkill = (skillToAdd?: string) => {
    const skill = (skillToAdd || newSkill).trim();
    if (skill && !candidateData.skills.includes(skill)) {
      setCandidateData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
      if (!skillToAdd) setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setCandidateData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleReset = () => {
    setSelectedFile(null);
    setRawText("");
    setCandidateData(DEFAULT_CANDIDATE);
    setParseError(null);
    setSubmitError(null);
    setSubmitSuccess(null);
    setImportedRecord(null);
    setUsedAiParser(false);
    setServerProvider(null);
    setParseNeedsReview(false);
    setShowEditForm(false);
  };

  // Submit Candidate directly to Admin Database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    // Basic Validation
    if (!candidateData.name.trim()) {
      setSubmitError("Candidate full name is required.");
      return;
    }
    const cleanPhone = String(candidateData.phone).replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setSubmitError("A valid 10-digit mobile number is required.");
      return;
    }

    try {
      let uploadedResumeFilename = candidateData.resumeFile;

      // 1. Upload PDF file to server if file is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await uploadResume(formData).unwrap();
        if (uploadRes?.success && uploadRes.resumeFile) {
          uploadedResumeFilename = uploadRes.resumeFile;
        }
      }

      // 2. Prepare candidate record payload
      const candidatePayload = {
        name: candidateData.name.trim(),
        phone: cleanPhone,
        email: candidateData.email ? candidateData.email.trim().toLowerCase() : undefined,
        city: candidateData.city || "Surat",
        locality: candidateData.locality?.trim() || undefined,
        currentRole: candidateData.currentRole?.trim() || undefined,
        experience: candidateData.experience || "Fresher",
        totalExperienceYears: Number(candidateData.totalExperienceYears) || 0,
        qualification: candidateData.qualification || "12th Pass",
        qualificationDetail: candidateData.qualificationDetail?.trim() || undefined,
        skills: candidateData.skills,
        expectedSalaryMonthly: Number(candidateData.expectedSalaryMonthly) || 15000,
        noticePeriod: candidateData.noticePeriod || "IMMEDIATE",
        consentToShareProfile: candidateData.consentToShareProfile === true,
        resumeFile: uploadedResumeFilename,
        resumeSummary: candidateData.resumeSummary?.trim() || undefined,
        resumeParsedText: candidateData.resumeParsedText || undefined,
      };

      // 3. Save candidate into system
      const importRes = await importCandidates({
        candidates: [candidatePayload],
      }).unwrap();

      if (importRes?.success) {
        const resultItem = importRes.results?.[0];
        const returnedCandidate = resultItem?.candidate || {};
        const isDuplicate =
          resultItem?.status === "duplicate" ||
          ((importRes.summary?.duplicate ?? 0) > 0 && (importRes.summary?.created ?? 0) === 0);

        const finalImported = {
          ...candidatePayload,
          ...returnedCandidate,
          _id: resultItem?.userId || returnedCandidate?._id || returnedCandidate?.id,
          status: resultItem?.status || (isDuplicate ? "duplicate" : "created"),
          reason: resultItem?.reason,
          needsReview: returnedCandidate?.needsReview ?? parseNeedsReview ?? false,
          resumeUrl:
            returnedCandidate?.resumeUrl ||
            (uploadedResumeFilename ? `/api/v1/resumes/file/${uploadedResumeFilename}` : undefined),
          resumeFile:
            returnedCandidate?.resumeFile || uploadedResumeFilename || candidateData.resumeFile,
        };

        setImportedRecord(finalImported);
        setSubmitSuccess(importRes);
        setShowEditForm(false);
      } else {
        setSubmitError(importRes?.message || "Failed to add candidate. Please verify the details.");
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to add candidate.";
      setSubmitError(msg);
    }
  };

  const isWorking = isParsing || isUploadingResume || isImporting;

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/candidates"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Candidates</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Add Candidate</span>
            <span className="text-xs uppercase px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              CV Importer
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload a PDF resume for instant ATS auto-extraction, review details, or enter candidate manually into the database.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/admin/aiparser"
            className="px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <span>AI Parser Settings</span>
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear / Reset</span>
          </button>
        </div>
      </div>

      {/* ─── IMPORTED CANDIDATE CONFIRMATION & DOSSIER VIEW ─── */}
      {submitSuccess && importedRecord && !showEditForm ? (
        <div className="space-y-4">
          {/* Status Alert Banner */}
          <div
            className={`p-5 rounded-2xl border shadow-xs ${
              importedRecord.status === "duplicate"
                ? "bg-amber-50/90 border-amber-200 text-amber-950"
                : "bg-emerald-50/90 border-emerald-200 text-emerald-950"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    importedRecord.status === "duplicate"
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {importedRecord.status === "duplicate" ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-extrabold tracking-tight">
                      {importedRecord.status === "duplicate"
                        ? "Candidate Already Exists in Database"
                        : "Candidate Successfully Imported & Enrolled!"}
                    </h2>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        importedRecord.status === "duplicate"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300"
                      }`}
                    >
                      {importedRecord.status === "duplicate" ? "Duplicate Record" : "Active in Talent Pool"}
                    </span>
                      {importedRecord.needsReview && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-300">
                          Needs review - verify role & details
                        </span>
                      )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {importedRecord.status === "duplicate"
                      ? `A record with matching phone (+91 ${importedRecord.phone})${
                          importedRecord.email ? ` or email (${importedRecord.email})` : ""
                        } was already registered in the system.`
                      : "Candidate profile, contact credentials, and ATS resume intelligence have been successfully saved into the Talent Pool database."}
                  </p>
                  {importedRecord._id && (
                    <div className="flex items-center gap-2 pt-1 text-xs flex-wrap">
                      <span className="text-slate-500 font-semibold">Candidate ID:</span>
                      <code className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[11px] text-slate-800 font-bold">
                        {importedRecord._id}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyId(importedRecord._id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Copy Candidate ID"
                      >
                        {copiedId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Link from Status Banner */}
              <div className="shrink-0 sm:self-center">
                <Link
                  href={`/admin/candidates?search=${encodeURIComponent(
                    importedRecord.phone || importedRecord.name
                  )}`}
                  className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
                    importedRecord.status === "duplicate"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>View in Talent Pool</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                Candidate Actions:
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Full Dossier Modal</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopySummary(importedRecord)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Copy candidate details"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Summary Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowEditForm(true)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Import Another Candidate</span>
              </button>
            </div>
          </div>

          {/* ─── Candidate Dossier Card ─── */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header / Identity Banner */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-lg border border-white/20">
                      {importedRecord.name ? importedRecord.name.charAt(0).toUpperCase() : "C"}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-indigo-950 rounded-full shadow-xs"
                      title="Enrolled Candidate"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <span>{importedRecord.name}</span>
                        <BadgeCheck className="w-5 h-5 text-blue-400 shrink-0" />
                      </h1>
                      {importedRecord.noticePeriod === "IMMEDIATE" && (
                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
                          Immediate Joiner
                        </span>
                      )}
                      {importedRecord.consentToShareProfile && (
                        <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Consent Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-blue-200 font-medium flex-wrap pt-0.5">
                      <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md">
                        {importedRecord.currentRole || "Candidate"}
                      </span>
                      <span className="text-blue-400/60">•</span>
                      <span className="flex items-center gap-1 text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{importedRecord.locality ? `${importedRecord.locality}, ` : ""}{importedRecord.city || "Surat"}</span>
                      </span>
                      <span className="text-blue-400/60">•</span>
                      <span className="flex items-center gap-1 text-slate-200">
                        <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{importedRecord.experience} ({importedRecord.totalExperienceYears || 0} yrs)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Contact CTAs */}
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`tel:+91${importedRecord.phone}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call +91 {importedRecord.phone}</span>
                  </a>

                  <a
                    href={`https://wa.me/91${importedRecord.phone}?text=Hello%20${encodeURIComponent(
                      importedRecord.name || ""
                    )},%20we%20reviewed%20your%20profile%20on%20Instant%20Placement.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {importedRecord.email && (
                    <a
                      href={`mailto:${importedRecord.email}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/10"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Information Grid: 3 Pillars */}
            <div className="p-6 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Contact & Identity */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Contact & Location
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Mobile Number</span>
                      <div className="flex items-center justify-between mt-0.5 font-bold text-slate-800">
                        <span>+91 {importedRecord.phone}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyId(importedRecord.phone)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy phone"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Email Address</span>
                      <div className="flex items-center justify-between mt-0.5 font-bold text-slate-800 truncate">
                        <span className="truncate">{importedRecord.email || "Not provided"}</span>
                        {importedRecord.email && (
                          <button
                            type="button"
                            onClick={() => handleCopyId(importedRecord.email)}
                            className="text-slate-400 hover:text-slate-700 ml-1 shrink-0 cursor-pointer"
                            title="Copy email"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">City & Area</span>
                      <p className="mt-0.5 font-bold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {importedRecord.city || "Surat"}
                          {importedRecord.locality ? ` • ${importedRecord.locality}` : ""}
                        </span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Consent to Share</span>
                      <p className="mt-0.5 font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{importedRecord.consentToShareProfile ? "Granted" : "Not Provided"}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Employment & Experience */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Role & Experience
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Current / Target Role</span>
                      <p className="mt-0.5 font-bold text-slate-900 text-sm">
                        {importedRecord.currentRole || "Candidate"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Experience Level</span>
                      <p className="mt-0.5 font-bold text-slate-800">
                        {importedRecord.experience || "Fresher"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Total Experience</span>
                      <p className="mt-0.5 font-bold text-slate-800">
                        {importedRecord.totalExperienceYears ?? 0} Year
                        {importedRecord.totalExperienceYears === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Notice Period</span>
                      <p className="mt-0.5 font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {importedRecord.noticePeriod === "IMMEDIATE"
                            ? "Immediate Joiner"
                            : importedRecord.noticePeriod === "15_DAYS"
                            ? "15 Days"
                            : importedRecord.noticePeriod === "30_DAYS"
                            ? "30 Days"
                            : importedRecord.noticePeriod || "Immediate"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Education & Salary */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Education & Salary
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Highest Qualification</span>
                      <p className="mt-0.5 font-bold text-slate-800">
                        {importedRecord.qualification || "12th Pass"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Degree / Stream</span>
                      <p className="mt-0.5 font-bold text-slate-800">
                        {importedRecord.qualificationDetail || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Expected Monthly Salary</span>
                      <p className="mt-0.5 font-bold text-emerald-700 text-sm flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>
                          {Number(importedRecord.expectedSalaryMonthly || 0).toLocaleString("en-IN")}{" "}
                          <span className="text-[11px] text-slate-500 font-normal">/ month</span>
                        </span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Database ID</span>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-600 truncate font-semibold">
                        {importedRecord._id || "Assigned by DB"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Technologies Section */}
              <div className="space-y-3 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Skills & Technologies</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold">
                      {importedRecord.skills?.length || 0}
                    </span>
                  </h3>
                </div>

                {importedRecord.skills && importedRecord.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {importedRecord.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold shadow-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No skills specified.</p>
                )}
              </div>

              {/* Resume Document & ATS Summary Section */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Resume Attachment & ATS Intelligence
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Attachment Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {importedRecord.resumeFile || "Resume.pdf"}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          ✓ Stored in Private Cloud Storage
                        </p>
                      </div>
                    </div>

                    {(importedRecord.resumeUrl || importedRecord.resumeFile) && (
                      <a
                        href={getFullResumeUrl(
                          importedRecord.resumeUrl ||
                            `/api/v1/resumes/file/${importedRecord.resumeFile}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View / Download</span>
                      </a>
                    )}
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      ATS Extracted Profile Summary
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      {importedRecord.resumeSummary
                        ? `"${importedRecord.resumeSummary}"`
                        : "No profile summary provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Audit Details & JSON Payload Accordion */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-4 flex-wrap">
                  <span>
                    Import Source: <strong className="text-slate-700">CV ATS Parser</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Timestamp:{" "}
                    <strong className="text-slate-700">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })},{" "}
                      {new Date().toLocaleDateString()}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="font-bold text-slate-600 hover:text-slate-900 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  {showRawJson ? "Hide Raw JSON" : "Inspect Raw JSON"}
                </button>
              </div>

              {showRawJson && (
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-200 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Raw Imported Candidate JSON
                  </span>
                  <pre className="text-[10px] font-mono overflow-x-auto text-emerald-400">
                    {JSON.stringify(importedRecord, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Editing Mode Banner (when user clicked 'Edit Details' from imported view) */}
      {submitSuccess && showEditForm && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-950 text-xs">
          <div className="flex items-center gap-2.5">
            <Edit3 className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold">Editing Mode: </span>
              <span>
                You are modifying details for <strong>{candidateData.name}</strong>. Re-saving will update this record.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowEditForm(false)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            Back to Dossier Summary
          </button>
        </div>
      )}

      {/* Error Banner */}
      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error: </span>
            <span>{submitError}</span>
          </div>
          <button onClick={() => setSubmitError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Upload & File Status (Left) / Candidate Form (Right) */}
      {(!submitSuccess || showEditForm) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dropzone & Parse Status */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                1. Upload Resume (PDF)
              </span>
              {usedAiParser && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]">
                  {serverProvider ? `Parsed by ${serverProvider}` : "Parsed by Gemini"}
                </Badge>
              )}
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50/70"
                  : selectedFile
                  ? "border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70"
                  : "border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    selectedFile
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {isParsing ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  ) : selectedFile ? (
                    <FileText className="w-6 h-6" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>

                {isParsing ? (
                  <div>
                    <p className="text-xs font-bold text-slate-800">Reading & parsing resume...</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Auto-extracting candidate data</p>
                  </div>
                ) : selectedFile ? (
                  <div className="max-w-[240px]">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Drag & drop PDF resume here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      or click to browse (.pdf up to 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {parseError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Quick manual entry info */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">💡 Tip:</span>
              <p>
                Uploading a resume auto-fills the candidate form on the right. You can still modify any field manually before saving.
              </p>
            </div>
          </div>

          {/* Collapsible Extracted Raw Text */}
          {rawText && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setShowRawText(!showRawText)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Extracted Resume Text ({rawText.length} chars)</span>
                {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showRawText && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/70">
                  <pre className="text-[10px] text-slate-700 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto bg-white p-3 rounded-xl border border-slate-200">
                    {rawText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Candidate Form */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                  2. Review & Edit Candidate Details
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify extracted details and save into the talent pool.
                </p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Full Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={candidateData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mobile Phone (10 digits)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-xs font-bold text-slate-500 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl">
                    +91
                  </span>
                  <Input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={candidateData.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className="h-10 text-xs rounded-l-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <Input
                  type="email"
                  placeholder="rahul@example.com"
                  value={candidateData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              {/* Current / Target Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Current / Target Role</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Sales Executive, Frontend Dev"
                  value={candidateData.currentRole}
                  onChange={(e) => updateField("currentRole", e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>City</span>
                </label>
                <Input
                  type="text"
                  placeholder="Surat"
                  list="city-suggestions"
                  value={candidateData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="h-10 text-xs"
                />
                <datalist id="city-suggestions">
                  {COMMON_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              {/* Locality */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Locality / Area</label>
                <Input
                  type="text"
                  placeholder="e.g. Varachha, Adajan, Vesu"
                  value={candidateData.locality}
                  onChange={(e) => updateField("locality", e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              {/* Experience: single input, tier auto-derived */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Total Experience (Years)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={40}
                    step={0.5}
                    placeholder="e.g. 2"
                    value={candidateData.totalExperienceYears}
                    onChange={(e) => handleYearsChange(Number(e.target.value))}
                    className="h-10 text-xs"
                  />
                  <span className="inline-flex items-center px-3 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl whitespace-nowrap">
                    {candidateData.experience}
                  </span>
                </div>
              </div>

              {/* Qualification: single input, tier auto-derived */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>Qualification (Degree / Stream)</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g. BCA, B.Com, B.Tech CS, 12th"
                    value={candidateData.qualificationDetail}
                    onChange={(e) => handleDegreeChange(e.target.value)}
                    className="h-10 text-xs"
                  />
                  <span className="inline-flex items-center px-3 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl whitespace-nowrap">
                    {candidateData.qualification}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills Tag Management */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Skills & Technologies ({candidateData.skills.length})
              </label>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type a skill and press Enter or Add..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="h-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Active Skill Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1 min-h-[32px]">
                {candidateData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-600 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Popular Skill Quick Adds */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Quick Add:</span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_SKILLS.slice(0, 10)
                    .filter((s) => !candidateData.skills.includes(s))
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddSkill(s)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] rounded-md transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Resume Summary */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700">Resume Summary / Recruiter Notes</label>
              <textarea
                rows={3}
                placeholder="Brief candidate overview or extracted profile summary..."
                value={candidateData.resumeSummary || ""}
                onChange={(e) => updateField("resumeSummary", e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Consent to share */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="consentCheck"
                checked={candidateData.consentToShareProfile}
                onChange={(e) => updateField("consentToShareProfile", e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <label htmlFor="consentCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                Candidate has given consent to share profile with hiring employers
              </label>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold self-start sm:self-auto"
              >
                {showRawJson ? "Hide Payload Preview" : "View JSON Payload"}
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/admin/candidates"
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isWorking}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                >
                  {isWorking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Candidate...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Save Candidate to Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* JSON Payload Inspector */}
            {showRawJson && (
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-200 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  Payload Preview
                </span>
                <pre className="text-[10px] font-mono overflow-x-auto text-emerald-400">
                  {JSON.stringify(candidateData, null, 2)}
                </pre>
              </div>
            )}
          </form>
        </div>
      </div>
      )}
      </div>

      {/* Candidate Profile Dossier Modal */}
      {importedRecord && (
        <CandidateDetailModal
          candidate={importedRecord}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
