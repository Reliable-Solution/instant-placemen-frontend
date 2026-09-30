"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  ExternalLink,
  Trash2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

/* ─── Constants ─────────────────────────────────────────────────── */

const API_BASE = getApiBaseUrl();
const SERVER_BASE = API_BASE.replace("/api/v1", "");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ─── Page Component ────────────────────────────────────────────── */

export default function CandidateResumePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"view" | "upload">("view");

  // Upload state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Blob preview state for authenticated PDF display
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);
  const [blobError, setBlobError] = useState<string | null>(null);

  /* ── Load user on mount ── */

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("ip_user") : null;
    const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : null;

    if (!raw && !token) {
      router.replace("/");
      return;
    }

    const u = raw ? JSON.parse(raw) : {};
    setUser(u);
    if (!u.resumeUrl) {
      setActiveTab("upload");
    }

    // Fetch fresh profile from backend if token exists
    if (token) {
      fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch profile");
          return res.json();
        })
        .then((data) => {
          if (data?.user) {
            const bu = data.user;
            setUser((prev: any) => {
              const merged = { ...prev, ...bu };
              localStorage.setItem("ip_user", JSON.stringify(merged));
              if (!merged.resumeUrl) {
                setActiveTab("upload");
              }
              return merged;
            });
          }
        })
        .catch((err) => {
          console.error("Failed to fetch profile:", err);
        })
        .finally(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [router]);

  /* ── Load authenticated resume blob for iframe preview ── */
  useEffect(() => {
    if (!user?.resumeUrl) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }

    let isCancelled = false;
    let localBlobUrl: string | null = null;
    setIsLoadingBlob(true);
    setBlobError(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : null;
    const targetUrl = user.resumeUrl.startsWith("http")
      ? user.resumeUrl
      : `${SERVER_BASE}${user.resumeUrl}`;

    const fetchUrl = token
      ? `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
      : targetUrl;

    fetch(fetchUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to load resume (HTTP ${res.status})`);
        }
        return res.blob();
      })
      .then((blob) => {
        if (isCancelled) return;
        localBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(localBlobUrl);
      })
      .catch((err: any) => {
        if (isCancelled) return;
        setBlobError(err?.message || "Failed to load resume preview.");
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingBlob(false);
      });

    return () => {
      isCancelled = true;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [user?.resumeUrl]);

  /* ── Helpers ── */

  const clearMessages = () => {
    setUploadMsg("");
    setUploadError("");
  };

  /* ── File Validation ── */

  const validateFile = (file: File): string | null => {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && file.type !== "application/pdf") {
      return "Please upload a PDF document only.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum allowed size is 10MB.";
    }
    return null;
  };

  /* ── Handle File Selection ── */

  const handleFileSelect = useCallback((file: File) => {
    clearMessages();
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }
    setCvFile(file);
  }, []);

  /* ── Handle Direct Upload (No scanning overhead) ── */

  const handleUpload = async () => {
    if (!cvFile) return;
    setIsUploading(true);
    clearMessages();

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const base64 = (ev.target?.result as string)?.split(",")[1];
        const token = localStorage.getItem("ip_token");

        const res = await fetch(`${API_BASE}/candidates/upload-cv`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            base64Data: base64,
            filename: cvFile.name,
            candidateId: user?._id || user?.id,
            phone: user?.phone,
          }),
        });

        const data = await res.json();

        if (data?.success) {
          const newResumeUrl = data.resumeUrl;
          const newResumeFile = data.resumeFile || cvFile.name;

          // Merge updates into user local state and storage
          const updated = {
            ...user,
            resumeUrl: newResumeUrl,
            resumeFile: newResumeFile,
          };
          setUser(updated);
          localStorage.setItem("ip_user", JSON.stringify(updated));

          setUploadMsg("Resume uploaded successfully!");
          setCvFile(null);
          // Automatically switch to the "View CV" tab so candidate can see their uploaded CV
          setActiveTab("view");
        } else {
          setUploadError(data?.message || "Upload failed. Please try again.");
        }
      } catch (err: any) {
        setUploadError(err?.message || "Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(cvFile);
  };

  /* ── Handle Remove Current Resume ── */

  const handleRemoveResume = async () => {
    if (!confirm("Are you sure you want to remove your uploaded resume?")) return;
    clearMessages();

    const updated = { ...user, resumeUrl: null, resumeFile: null };
    setUser(updated);
    localStorage.setItem("ip_user", JSON.stringify(updated));

    const token = localStorage.getItem("ip_token");
    if (token) {
      try {
        await fetch(`${API_BASE}/candidates/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phone: user?.phone,
            candidateId: user?._id || user?.id,
            resumeUrl: null,
            resumeFile: null,
          }),
        });
      } catch (err) {
        console.error("Failed to sync resume removal:", err);
      }
    }

    setUploadMsg("Resume removed successfully.");
    setActiveTab("upload");
  };

  /* ── Drag & Drop Handlers ── */

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  /* ── Loading skeleton ── */

  if (!user || !isReady) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Loading your resume…</p>
        </div>
      </div>
    );
  }

  const hasResume = Boolean(user?.resumeUrl);
  const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : "";
  const rawResumeUrl = user?.resumeUrl?.startsWith("http")
    ? user.resumeUrl
    : (user?.resumeUrl ? `${SERVER_BASE}${user.resumeUrl}` : "");

  const authenticatedResumeUrl = token && rawResumeUrl
    ? `${rawResumeUrl}${rawResumeUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
    : rawResumeUrl;

  const previewSource = blobUrl || authenticatedResumeUrl;
  const displayName = user?.resumeFile || user?.resumeUrl?.split("/").pop() || "Resume.pdf";

  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank");
      return;
    }
    if (authenticatedResumeUrl) {
      window.open(authenticatedResumeUrl, "_blank");
    }
  };

  const handleDownload = () => {
    if (blobUrl) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = displayName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    if (authenticatedResumeUrl) {
      const a = document.createElement("a");
      a.href = authenticatedResumeUrl;
      a.download = displayName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Resume &amp; CV</h1>
            <p className="text-xs text-slate-500">
              Upload and manage your CV document for employer applications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasResume ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Resume Attached
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              No Resume Uploaded
            </span>
          )}
        </div>
      </div>

      {/* ─── Tab Navigation Bar ─── */}
      <div className="flex border-b border-slate-200 bg-white px-3 rounded-xl shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("view")}
          className={`flex items-center gap-2 py-3.5 px-5 font-bold text-sm border-b-2 transition-all ${
            activeTab === "view"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>View My CV</span>
          {hasResume && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" title="Resume attached" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 py-3.5 px-5 font-bold text-sm border-b-2 transition-all ${
            activeTab === "upload"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>{hasResume ? "Replace / Upload New" : "Upload Resume"}</span>
        </button>
      </div>

      {/* ─── Feedback Messages ─── */}
      {uploadError && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-800 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{uploadError}</span>
          <button
            onClick={() => setUploadError("")}
            className="ml-auto text-red-400 hover:text-rose-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-900 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadMsg}</span>
          <button
            onClick={() => setUploadMsg("")}
            className="ml-auto text-emerald-400 hover:text-emerald-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── TAB 1: VIEW MY CV ─── */}
      {activeTab === "view" && (
        <div className="space-y-4">
          {hasResume ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Document Header & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/80 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {displayName}
                    </h2>
                    <p className="text-xs text-slate-500">PDF Document • Active on Candidate Profile</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* Embedded Document Viewer */}
              <div className="w-full bg-slate-100/50 p-2 sm:p-4">
                <div className="w-full bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden min-h-[600px] flex flex-col justify-center items-center">
                  {isLoadingBlob ? (
                    <div className="py-24 text-center space-y-3">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-slate-600 text-sm font-medium">Loading your CV document preview…</p>
                    </div>
                  ) : blobError ? (
                    <div className="py-16 px-6 text-center space-y-4 max-w-md">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Preview Could Not Be Loaded Directly</h3>
                        <p className="text-xs text-slate-500 mt-1">{blobError}</p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleOpenInNewTab}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in New Tab</span>
                        </button>
                      </div>
                    </div>
                  ) : previewSource ? (
                    <iframe
                      src={`${previewSource}#navpanes=0&pagemode=none&view=FitH`}
                      className="w-full h-[850px] border-0 bg-white"
                      title="Resume Document Viewer"
                    />
                  ) : null}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-xs text-slate-500">
                    If the document preview does not load on your browser,{" "}
                    <button
                      type="button"
                      onClick={handleOpenInNewTab}
                      className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      click here to open in full screen
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto border border-blue-100">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h2 className="text-base font-bold text-slate-900">No Resume Uploaded Yet</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Employers and recruiters review your resume when you apply for jobs. Upload your
                  PDF CV to maximize interview call chances.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resume Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: UPLOAD / REPLACE RESUME ─── */}
      {activeTab === "upload" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Upload className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-bold text-slate-900 text-sm">
              {hasResume ? "Replace Your Resume" : "Upload PDF Resume"}
            </h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Drag & Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                  : "border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-slate-800">
                {cvFile ? cvFile.name : "Drag & drop your PDF resume here"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {cvFile
                  ? `${(cvFile.size / 1024 / 1024).toFixed(2)} MB — ready to upload`
                  : "or click to browse from device (PDF format, up to 10MB)"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Selected File Actions */}
            {cvFile && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-blue-500/20"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading Resume…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Resume</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCvFile(null);
                    clearMessages();
                  }}
                  disabled={isUploading}
                  className="h-12 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}

            {/* Practical Tips */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Candidate Resume Guidelines
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>Only valid PDF documents up to 10MB are supported.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>Your resume is stored securely and directly accessible by verified hiring employers.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>You can update or replace your resume anytime with one click.</span>
                </li>
              </ul>
            </div>

            {/* Profile Navigation Tip */}
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-700 font-medium">
                Want to edit your target role, experience, education, skills, or locality?
              </span>
              <Link
                href="/candidate/profile"
                className="font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap hover:underline"
              >
                Edit Profile Details →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
