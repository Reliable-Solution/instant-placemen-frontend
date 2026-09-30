"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GitBranch, ChevronRight, CheckCircle2, Clock, AlertTriangle, RefreshCw,
  FileText, UserCheck, ShieldCheck, IndianRupee, Plus, X, ChevronDown,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

const API_BASE = getApiBaseUrl();


const TIER_CONFIG = {
  module_1_resumes: {
    label: "Module 1", name: "Instant Resumes", color: "blue",
    icon: FileText, stages: ["VACANCY_LOGGED", "SOURCING", "RESUMES_DELIVERED", "CLOSED"],
  },
  module_2_hiring: {
    label: "Module 2", name: "End-to-End Hiring", color: "blue",
    icon: UserCheck, stages: ["VACANCY_LOGGED", "SOURCING", "SCREENING", "INTERVIEWS_SCHEDULED", "OFFER_ACCEPTED", "DAY_1_JOINED", "CLOSED"],
  },
  module_3_guarantee: {
    label: "Module 3", name: "90-Day Guarantee", color: "emerald",
    icon: ShieldCheck, stages: ["VACANCY_LOGGED", "SOURCING", "SCREENING", "INTERVIEWS_SCHEDULED", "OFFER_ACCEPTED", "DAY_1_JOINED", "RETENTION_30D_CHECK", "RETENTION_60D_CHECK", "GUARANTEE_90D_COMPLETED", "REPLACEMENT_TRIGGERED", "CLOSED"],
  },
};

const STAGE_LABELS: Record<string, string> = {
  VACANCY_LOGGED: "Vacancy Logged",
  SOURCING: "Sourcing",
  SCREENING: "Screening",
  RESUMES_DELIVERED: "Resumes Delivered",
  INTERVIEWS_SCHEDULED: "Interviews Scheduled",
  OFFER_ACCEPTED: "Offer Accepted",
  DAY_1_JOINED: "Day 1 Joined",
  RETENTION_30D_CHECK: "30-Day Check ✓",
  RETENTION_60D_CHECK: "60-Day Check ✓",
  GUARANTEE_90D_COMPLETED: "90-Day Complete ✓",
  REPLACEMENT_TRIGGERED: "⚠ Replacement",
  CLOSED: "Closed",
};

const PAYMENT_BADGE: Record<string, { label: string; cls: string }> = {
  NOT_APPLICABLE_YET: { label: "No Invoice Yet", cls: "bg-slate-100 text-slate-600" },
  INVOICE_PENDING: { label: "Invoice Pending", cls: "bg-amber-100 text-amber-800" },
  PAID: { label: "Paid ✓", cls: "bg-emerald-100 text-emerald-800" },
};

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ip_token");
}

async function apiCall(path: string, method = "GET", body?: any) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export default function AdminPipelinePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [payFilter, setPayFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modals
  const [modal, setModal] = useState<null | "stage" | "joining" | "resumes" | "retention" | "replacement" | "markPaid" | "deliverCv">(null);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal fields
  const [stageInput, setStageInput] = useState("");
  const [stageNote, setStageNote] = useState("");
  const [joiningName, setJoiningName] = useState("");
  const [joiningPhone, setJoiningPhone] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [joiningSalary, setJoiningSalary] = useState("");
  const [resumeCount, setResumeCount] = useState(5);
  const [resumeNote, setResumeNote] = useState("");
  const [retentionDay, setRetentionDay] = useState<30 | 60 | 90>(30);
  const [retentionFeedback, setRetentionFeedback] = useState("");
  const [replacementReason, setReplacementReason] = useState("");
  const [paidRef, setPaidRef] = useState("");

  // Deliver CV modal fields
  const [cvCandidateName, setCvCandidateName] = useState("");
  const [cvCandidatePhone, setCvCandidatePhone] = useState("");
  const [cvCandidateEmail, setCvCandidateEmail] = useState("");
  const [cvCandidateRole, setCvCandidateRole] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tierFilter !== "all") params.set("serviceTier", tierFilter);
      if (stageFilter !== "all") params.set("stage", stageFilter);
      if (payFilter !== "all") params.set("paymentStatus", payFilter);
      const data = await apiCall(`/pipeline?${params.toString()}`);
      setJobs(data.jobs || []);
    } finally {
      setLoading(false);
    }
  }, [tierFilter, stageFilter, payFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const openModal = (type: typeof modal, job: any) => {
    setActiveJob(job);
    setModal(type);
    setStageInput("");
    setStageNote("");
    setJoiningName(""); setJoiningPhone(""); setJoiningSalary("");
    setResumeCount(5); setResumeNote("");
    setRetentionFeedback(""); setReplacementReason(""); setPaidRef("");
    setCvCandidateName(""); setCvCandidatePhone(""); setCvCandidateEmail(""); setCvCandidateRole("");
    if (type === "stage") {
      const cfg = TIER_CONFIG[job.serviceTier as keyof typeof TIER_CONFIG];
      const idx = cfg?.stages.indexOf(job.pipelineStage) ?? -1;
      setStageInput(cfg?.stages[idx + 1] || job.pipelineStage);
    }
    if (type === "retention") {
      const rt = job.retentionTracking || {};
      if (!rt.day30Check?.done) setRetentionDay(30);
      else if (!rt.day60Check?.done) setRetentionDay(60);
      else setRetentionDay(90);
    }
  };

  const closeModal = () => { setModal(null); setActiveJob(null); };

  const submitAction = async () => {
    if (!activeJob) return;
    setActionLoading(true);
    try {
      let result;
      if (modal === "stage") {
        result = await apiCall(`/pipeline/${activeJob._id}/stage`, "PATCH", { stage: stageInput, note: stageNote });
      } else if (modal === "joining") {
        result = await apiCall(`/pipeline/${activeJob._id}/confirm-joining`, "POST", {
          candidateName: joiningName, candidatePhone: joiningPhone,
          joiningDate, offeredSalary: Number(joiningSalary),
        });
      } else if (modal === "resumes") {
        result = await apiCall(`/pipeline/${activeJob._id}/resumes-count`, "POST", { count: resumeCount, note: resumeNote });
      } else if (modal === "deliverCv") {
        result = await apiCall(`/pipeline/${activeJob._id}/deliver-cv`, "POST", {
          candidateName: cvCandidateName,
          candidatePhone: cvCandidatePhone,
          candidateEmail: cvCandidateEmail,
          note: cvCandidateRole,
        });
      } else if (modal === "retention") {
        result = await apiCall(`/pipeline/${activeJob._id}/retention-check`, "POST", { day: retentionDay, feedback: retentionFeedback });
      } else if (modal === "replacement") {
        result = await apiCall(`/pipeline/${activeJob._id}/trigger-replacement`, "POST", { exitReason: replacementReason });
      } else if (modal === "markPaid") {
        result = await apiCall(`/pipeline/${activeJob._id}/manual-mark-paid`, "POST", { paymentRef: paidRef });
      }

      if (result?.success) {
        closeModal();
        fetchJobs();
      } else {
        alert(result?.message || "Action failed");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const tierList = Object.entries(TIER_CONFIG);

  // Day-of-90 calculation
  const getRetentionDay = (job: any): number | null => {
    if (job.serviceTier !== "module_3_guarantee" || job.pipelineStage === "VACANCY_LOGGED") return null;
    const joined = job.joinedCandidates?.[job.joinedCandidates.length - 1]?.joiningDate;
    if (!joined) return null;
    const diff = Math.floor((Date.now() - new Date(joined).getTime()) / 86400000);
    return Math.min(diff, 90);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-blue-600" /> Operations Pipeline
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage all active vacancy workflows — M1 (Resumes) · M2 (E2E Hiring) · M3 (90-Day Guarantee)
            </p>
          </div>
          <button onClick={fetchJobs} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all border border-slate-200">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          {/* Tier filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {[
              { value: "all", label: "All Tiers" },
              ...tierList.map(([k, v]) => ({ value: k, label: v.label + " — " + v.name })),
            ].map(opt => (
              <button key={opt.value} onClick={() => { setTierFilter(opt.value); setStageFilter("all"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tierFilter === opt.value ? "bg-blue-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Payment filter */}
            <select className="h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-600"
              value={payFilter} onChange={e => setPayFilter(e.target.value)}>
              <option value="all">All Payments</option>
              <option value="NOT_APPLICABLE_YET">Not Invoiced</option>
              <option value="INVOICE_PENDING">Invoice Pending</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map(n => <div key={n} className="h-44 rounded-2xl bg-white border border-slate-200 animate-pulse" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No vacancies found in pipeline</p>
            <p className="text-sm">Active vacancies will appear here once employers post jobs with a service tier.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map(job => {
              const cfg = TIER_CONFIG[job.serviceTier as keyof typeof TIER_CONFIG];
              const pay = PAYMENT_BADGE[job.paymentStatus] || PAYMENT_BADGE.NOT_APPLICABLE_YET;
              const isExpanded = expandedId === job._id;
              const retDay = getRetentionDay(job);
              const stageIdx = cfg?.stages.indexOf(job.pipelineStage) ?? -1;
              const progress = cfg ? Math.round(((stageIdx + 1) / cfg.stages.length) * 100) : 0;

              return (
                <div key={job._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${job.paymentStatus === "INVOICE_PENDING" ? "border-amber-300" : job.serviceTier === "module_3_guarantee" ? "border-emerald-200" : "border-slate-200"}`}>
                  {/* Card Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg?.color === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                            {cfg?.label || job.serviceTier}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pay.cls}`}>{pay.label}</span>
                          {job.paymentStatus === "INVOICE_PENDING" && (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              ₹{job.billedAmount?.toLocaleString("en-IN")} DUE
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 truncate">{job.title}</h3>
                        <p className="text-xs text-slate-500">{job.company} · {job.city}</p>
                      </div>
                      <button onClick={() => setExpandedId(isExpanded ? null : job._id)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>

                    {/* Stage progress bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>{STAGE_LABELS[job.pipelineStage] || job.pipelineStage}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${cfg?.color === "emerald" ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    {/* M3 Retention Clock */}
                    {retDay !== null && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold mt-1 ${retDay >= 80 ? "bg-emerald-100 text-emerald-800" : retDay >= 50 ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                        <Clock className="w-3.5 h-3.5" />
                        Day {retDay} of 90 — Retention Tracking Active
                      </div>
                    )}

                    {/* Module 1 / Purchased Plan Order Progress */}
                    {(job.purchasedPlan || job.serviceTier === "module_1_resumes") && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-blue-700 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span>
                              {job.purchasedPlan?.tier === "module_1_resumes" || job.serviceTier === "module_1_resumes"
                                ? "Module 1 (Resumes)"
                                : "Hiring Plan"}
                            </span>
                            {job.purchasedPlan?.durationTier && (
                              <span className="text-xs text-slate-500 font-normal">
                                ({job.purchasedPlan.durationTier === "1_week" ? "1-Wk Express" : "1-Mo Value"})
                              </span>
                            )}
                          </span>
                          <span className="font-extrabold text-slate-800">
                            {job.purchasedPlan?.deliveredQuantity || job.resumesDeliveredCount || 0} /{" "}
                            {job.purchasedPlan?.orderedQuantity || 10} CVs
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  ((job.purchasedPlan?.deliveredQuantity || job.resumesDeliveredCount || 0) /
                                    (job.purchasedPlan?.orderedQuantity || 10)) *
                                    100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <button onClick={() => openModal("stage", job)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                        <ChevronRight className="w-3 h-3" /> Advance Stage
                      </button>

                      {(job.serviceTier === "module_1_resumes" || job.purchasedPlan?.tier === "module_1_resumes") && (
                        <>
                          <button
                            onClick={() => openModal("deliverCv", job)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-xs"
                          >
                            <Plus className="w-3 h-3" /> Deliver CV
                          </button>
                          <button
                            onClick={() => openModal("resumes", job)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
                          >
                            Log Batch
                          </button>
                        </>
                      )}

                      {(job.serviceTier === "module_2_hiring" || job.serviceTier === "module_3_guarantee") && job.pipelineStage !== "DAY_1_JOINED" && (
                        <button onClick={() => openModal("joining", job)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
                          <CheckCircle2 className="w-3 h-3" /> Confirm Joining
                        </button>
                      )}

                      {job.serviceTier === "module_3_guarantee" && job.pipelineStage?.includes("RETENTION") && (
                        <button onClick={() => openModal("retention", job)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-all">
                          <CheckCircle2 className="w-3 h-3" /> Log Check-in
                        </button>
                      )}

                      {job.serviceTier === "module_3_guarantee" && ["DAY_1_JOINED", "RETENTION_30D_CHECK", "RETENTION_60D_CHECK"].includes(job.pipelineStage) && (
                        <button onClick={() => openModal("replacement", job)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all">
                          <AlertTriangle className="w-3 h-3" /> Trigger Replacement
                        </button>
                      )}

                      {job.paymentStatus === "INVOICE_PENDING" && (
                        <button onClick={() => openModal("markPaid", job)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all">
                          <IndianRupee className="w-3 h-3" /> Mark Paid
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded: Notes & History */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4 space-y-3">
                      {job.joinedCandidates?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Candidate History</p>
                          {job.joinedCandidates.map((c: any, i: number) => (
                            <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs mb-1 ${c.isReplacement ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"}`}>
                              <span className="font-semibold text-slate-800">{c.name} · {c.phone}</span>
                              <span className="text-slate-500">₹{c.offeredSalary?.toLocaleString("en-IN")}/mo{c.isReplacement ? " (Replacement)" : ""}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {job.pipelineNotes?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Activity Log</p>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {[...job.pipelineNotes].reverse().slice(0, 5).map((n: any, i: number) => (
                              <div key={i} className="flex gap-2 text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                <div>
                                  <span className="text-slate-700">{n.note}</span>
                                  <span className="text-slate-500 ml-2">{n.author} · {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-IN") : ""}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal && activeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {modal === "stage" && "Advance Pipeline Stage"}
                {modal === "joining" && "Confirm Day 1 Joining"}
                {modal === "resumes" && "Log Resumes Delivered"}
                {modal === "retention" && `Log Day ${retentionDay} Retention Check-in`}
                {modal === "replacement" && "⚠ Trigger Free Replacement"}
                {modal === "markPaid" && "Mark Invoice as Paid"}
              </h3>
              <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            <div className="text-xs text-slate-500 font-medium pb-1 border-b border-slate-100">
              {activeJob.title} · {activeJob.company} · {activeJob.city}
            </div>

            <div className="space-y-3">
              {modal === "stage" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Move to Stage</label>
                    <select className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm" value={stageInput} onChange={e => setStageInput(e.target.value)}>
                      {(TIER_CONFIG[activeJob.serviceTier as keyof typeof TIER_CONFIG]?.stages || []).map(s => (
                        <option key={s} value={s}>{STAGE_LABELS[s] || s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Activity Note (optional)</label>
                    <textarea className="w-full h-20 px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none" placeholder="Add a note for this stage change..." value={stageNote} onChange={e => setStageNote(e.target.value)} />
                  </div>
                </>
              )}

              {modal === "joining" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Candidate Name *</label>
                      <input className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm" value={joiningName} onChange={e => setJoiningName(e.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Phone *</label>
                      <input className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm" value={joiningPhone} onChange={e => setJoiningPhone(e.target.value)} placeholder="+91 XXXXX" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Joining Date *</label>
                      <input type="date" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Offered Salary (₹/mo) *</label>
                      <input type="number" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm" value={joiningSalary} onChange={e => setJoiningSalary(e.target.value)} placeholder="e.g. 30000" />
                    </div>
                  </div>
                  {activeJob.serviceTier === "module_2_hiring" && joiningSalary && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      Invoice will be generated for <strong>₹10,000</strong> (fixed Module 2 fee) upon saving.
                    </div>
                  )}
                  {activeJob.serviceTier === "module_3_guarantee" && joiningSalary && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                      Invoice will be generated for <strong>₹{Number(joiningSalary).toLocaleString("en-IN")}</strong> (1 month CTC) upon saving.
                    </div>
                  )}
                </>
              )}

              {modal === "resumes" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Number of Resumes Delivered *</label>
                    <input type="number" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm" value={resumeCount} onChange={e => setResumeCount(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Note</label>
                    <textarea className="w-full h-20 px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none" value={resumeNote} onChange={e => setResumeNote(e.target.value)} placeholder="e.g. Batch of 5 tele-screened profiles shared via WhatsApp" />
                  </div>
                </>
              )}

              {modal === "deliverCv" && (
                <>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium mb-1">
                    Delivering a verified CV to <strong>{activeJob.title}</strong>. This candidate will be instantly unlocked for the employer and increment their delivered count.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Candidate Full Name *</label>
                      <input className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm" value={cvCandidateName} onChange={e => setCvCandidateName(e.target.value)} placeholder="e.g. Rahul Sharma" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Candidate Phone *</label>
                      <input className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm" value={cvCandidatePhone} onChange={e => setCvCandidatePhone(e.target.value)} placeholder="+91 9876543210" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Candidate Email</label>
                    <input type="email" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm" value={cvCandidateEmail} onChange={e => setCvCandidateEmail(e.target.value)} placeholder="rahul@example.com" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Key Skills / Verification Note</label>
                    <textarea className="w-full h-18 px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none" value={cvCandidateRole} onChange={e => setCvCandidateRole(e.target.value)} placeholder="e.g. Verified 2 yrs React &amp; Node.js exp. Ready to join immediately." />
                  </div>
                </>
              )}

              {modal === "retention" && (
                <>
                  <div className="flex gap-2">
                    {([30, 60, 90] as const).map(d => (
                      <button key={d} onClick={() => setRetentionDay(d)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${retentionDay === d ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50"}`}>
                        Day {d}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Client Feedback / Notes</label>
                    <textarea className="w-full h-20 px-3 py-2 text-sm rounded-xl border border-slate-200 resize-none" value={retentionFeedback} onChange={e => setRetentionFeedback(e.target.value)} placeholder="Candidate is performing well. Client satisfied." />
                  </div>
                </>
              )}

              {modal === "replacement" && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Exit Reason *</label>
                  <textarea className="w-full h-24 px-3 py-2 text-sm rounded-xl border border-rose-200 resize-none" value={replacementReason} onChange={e => setReplacementReason(e.target.value)} placeholder="e.g. Candidate resigned on Day 47 citing personal relocation" />
                  <p className="text-xs text-rose-600 mt-1.5">This will re-open the pipeline for sourcing a free replacement candidate.</p>
                </div>
              )}

              {modal === "markPaid" && (
                <div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium mb-3">
                    Mark ₹{activeJob.billedAmount?.toLocaleString("en-IN")} invoice as received.
                  </div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Reference (optional)</label>
                  <input className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm" value={paidRef} onChange={e => setPaidRef(e.target.value)} placeholder="Bank UTR / Razorpay Payment ID" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={closeModal} className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={submitAction} disabled={actionLoading}
                className={`flex-[2] py-2.5 text-sm font-bold text-white rounded-xl transition-all ${modal === "replacement" ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-60`}>
                {actionLoading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
