"use client";

import React, { useState, useEffect, Suspense, useRef, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useGetEmployerApplicantsQuery,
  useGetEmployerJobsQuery,
  useUpdateApplicantStageMutation,
} from "@/services/api/employerApi";
import {
  Users,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Briefcase,
  MapPin,
  Filter,
  Lock,
  Unlock,
  ShieldCheck,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  UserCheck,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ChatButton from "@/components/chat/ChatButton";
import { Pagination } from "@/components/ui/pagination";
import { useGetSettingsQuery } from "@/services/api/settingsApi";
import { getApiBaseUrl } from "@/lib/config";

export interface PipelineStage {
  id: string;
  title: string;
  color: string;
  border: string;
  badgeBg: string;
  isCustom?: boolean;
}

const KANBAN_STORAGE_KEY = "ip_kanban_custom_stages_v2";

const DEFAULT_KANBAN_STAGES: PipelineStage[] = [
  { id: "NEW", title: "New Applied", color: "bg-blue-500", border: "border-blue-200", badgeBg: "bg-blue-50 text-blue-700" },
  { id: "SCREENED", title: "Screened", color: "bg-indigo-500", border: "border-indigo-200", badgeBg: "bg-indigo-50 text-indigo-700" },
  { id: "SHARED_WITH_CLIENT", title: "Shared with Client", color: "bg-slate-500", border: "border-slate-200", badgeBg: "bg-slate-100 text-slate-700" },
  { id: "INTERVIEW_SCHEDULED", title: "Interview", color: "bg-amber-500", border: "border-amber-200", badgeBg: "bg-amber-50 text-amber-700" },
  { id: "SELECTED", title: "Shortlisted / Offer", color: "bg-emerald-500", border: "border-emerald-200", badgeBg: "bg-emerald-50 text-emerald-700" },
  { id: "JOINED", title: "Joined", color: "bg-teal-600", border: "border-teal-200", badgeBg: "bg-teal-50 text-teal-700" },
  { id: "REJECTED", title: "Rejected", color: "bg-rose-500", border: "border-rose-200", badgeBg: "bg-rose-50 text-rose-700" },
];

// Legacy statuses mapped onto current columns (old builds / admin actions).
const LEGACY_STATUS_MAP: Record<string, string> = {
  OFFER: "SELECTED",
  HIRED: "JOINED",
};

const COLOR_OPTIONS = [
  { label: "Indigo", color: "bg-indigo-500", border: "border-indigo-200", badgeBg: "bg-indigo-50 text-indigo-700" },
  { label: "Cyan", color: "bg-cyan-500", border: "border-cyan-200", badgeBg: "bg-cyan-50 text-cyan-700" },
  { label: "Pink", color: "bg-pink-500", border: "border-pink-200", badgeBg: "bg-pink-50 text-pink-700" },
  { label: "Orange", color: "bg-orange-500", border: "border-orange-200", badgeBg: "bg-orange-50 text-orange-700" },
  { label: "Emerald", color: "bg-emerald-500", border: "border-emerald-200", badgeBg: "bg-emerald-50 text-emerald-700" },
  { label: "Violet", color: "bg-violet-500", border: "border-violet-200", badgeBg: "bg-violet-50 text-violet-700" },
];

function ApplicantsContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "ALL";

  const [jobIdFilter, setJobIdFilter] = useState(initialJobId);
  const [stageFilter, setStageFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;

  // Pipeline Stages state (stored locally so each user/employer can customize)
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_KANBAN_STAGES);
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  // Local optimistic applicants state
  const [localApplicants, setLocalApplicants] = useState<any[]>([]);

  // Kanban Horizontal Slider scroll controls
  const kanbanScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (kanbanScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = kanbanScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, [stages, localApplicants, viewMode]);

  const handleScrollLeft = () => {
    if (kanbanScrollRef.current) {
      kanbanScrollRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (kanbanScrollRef.current) {
      kanbanScrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  // Drag and Drop State for Kanban Cards
  const [draggedApplicantId, setDraggedApplicantId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData("text/plain", appId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedApplicantId(appId);
  };

  const handleDragEnd = () => {
    setDraggedApplicantId(null);
    setDragOverStageId(null);
  };

  const handleColumnDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent, stageId: string) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverStageId === stageId) {
        setDragOverStageId(null);
      }
    }
  };

  const handleColumnDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData("text/plain") || draggedApplicantId;
    setDragOverStageId(null);
    setDraggedApplicantId(null);

    if (appId) {
      const current = localApplicants.find((a) => a._id === appId);
      const currentStage = current ? (LEGACY_STATUS_MAP[current.status] || current.status) : null;
      if (currentStage !== targetStageId) {
        handleStageChange(appId, targetStageId);
      }
    }
  };

  // Load custom stages from localStorage (v2 key; legacy v1 without the
  // Shared-with-Client column is discarded so no applicant goes invisible)
  useEffect(() => {
    try {
      const savedStages = localStorage.getItem(KANBAN_STORAGE_KEY);
      if (savedStages) {
        const parsed = JSON.parse(savedStages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStages(parsed);
        }
      }
      localStorage.removeItem("ip_kanban_custom_stages");
    } catch (e) {
      console.error("Failed to load custom stages", e);
    }
  }, []);

  const saveStages = (newStages: PipelineStage[]) => {
    setStages(newStages);
    try {
      localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(newStages));
    } catch (e) {
      console.error("Failed to save custom stages", e);
    }
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    const chosenColor = COLOR_OPTIONS[selectedColorIdx];
    const newId = `STAGE_${Date.now()}`;
    const newStage: PipelineStage = {
      id: newId,
      title: newStageName.trim(),
      color: chosenColor.color,
      border: chosenColor.border,
      badgeBg: chosenColor.badgeBg,
      isCustom: true,
    };

    // Insert before Rejected or at the end
    const rejectedIdx = stages.findIndex((s) => s.id === "REJECTED");
    let updated: PipelineStage[];
    if (rejectedIdx !== -1) {
      updated = [...stages.slice(0, rejectedIdx), newStage, ...stages.slice(rejectedIdx)];
    } else {
      updated = [...stages, newStage];
    }

    saveStages(updated);
    setNewStageName("");
    setIsAddStageOpen(false);
  };

  const handleDeleteStage = (stageId: string) => {
    if (confirm("Remove this custom pipeline stage? Candidates in this stage will revert to New Applied.")) {
      const updated = stages.filter((s) => s.id !== stageId);
      saveStages(updated);
      // Revert candidates with this stage to NEW
      setLocalApplicants((prev) =>
        prev.map((a) => (a.status === stageId ? { ...a, status: "NEW" } : a))
      );
    }
  };

  const handleResetStages = () => {
    if (confirm("Reset pipeline stages to default 6 recruitment stages?")) {
      saveStages(DEFAULT_KANBAN_STAGES);
    }
  };

  const { data: settingsData } = useGetSettingsQuery();

  useEffect(() => {
    setCurrentPage(1);
  }, [jobIdFilter, stageFilter]);

  const { data: jobs = [] } = useGetEmployerJobsQuery();
  const { data: applicants = [], isLoading, refetch } = useGetEmployerApplicantsQuery({
    jobId: jobIdFilter !== "ALL" ? jobIdFilter : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const applicantList = useMemo(
    () => (Array.isArray(applicants) ? applicants : (applicants as any)?.data || []),
    [applicants]
  );

  // Sync server applicants to local optimistic state (normalize legacy statuses).
  // Guarded by a content signature: RTK's `= []` fallback and transformResponse
  // produce a fresh array identity on renders where data is unchanged/undefined,
  // which retriggered this effect forever ("Maximum update depth exceeded").
  const applicantsSig = useMemo(
    () =>
      JSON.stringify(
        (applicantList as any[]).map(
          (a: any) => `${a?._id}:${a?.status}:${a?.updatedAt || ""}`
        )
      ),
    [applicantList]
  );
  const lastApplicantsSig = useRef("");
  useEffect(() => {
    if (lastApplicantsSig.current === applicantsSig) return;
    lastApplicantsSig.current = applicantsSig;
    setLocalApplicants(
      (applicantList as any[]).map((a: any) => ({
        ...a,
        status: LEGACY_STATUS_MAP[a.status] || a.status,
      }))
    );
  }, [applicantsSig, applicantList]);

  const [updateStage] = useUpdateApplicantStageMutation();

  const handleStageChange = async (appId: string, newStatus: string) => {
    // Instant optimistic update
    setLocalApplicants((prev) =>
      prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
    );

    try {
      await updateStage({ id: appId, status: newStatus }).unwrap();
      refetch();
    } catch (e) {
      console.error("Failed to update candidate stage:", e);
      refetch();
    }
  };

  const handleQuickAdvance = (appId: string, currentStatus: string) => {
    const normalized = LEGACY_STATUS_MAP[currentStatus] || currentStatus;
    const currentIdx = stages.findIndex((s) => s.id === normalized);
    if (currentIdx !== -1 && currentIdx < stages.length - 1) {
      const nextStage = stages[currentIdx + 1];
      handleStageChange(appId, nextStage.id);
    }
  };

  const filtered = localApplicants.filter((a: any) =>
    stageFilter === "ALL" ? true : a.status === stageFilter
  );

  const [downloadingResumeId, setDownloadingResumeId] = useState<string | null>(null);

  const handleDownloadResume = async (app: any) => {
    try {
      setDownloadingResumeId(app._id);
      const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : null;
      const apiBase = getApiBaseUrl();
      const resumeUrl = app.resumeFile
        ? `${apiBase}/resumes/file/${encodeURIComponent(app.resumeFile)}`
        : `${apiBase}/resumes/${app._id}`;

      const res = await fetch(resumeUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 402) {
        alert("Active plan required: An active hiring plan is required to download or view candidate resumes. Please upgrade your plan.");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || "Failed to download candidate resume.");
        return;
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err: any) {
      alert(err?.message || "Failed to download candidate resume.");
    } finally {
      setDownloadingResumeId(null);
    }
  };

  const openWhatsApp = (phone: string, candidateName: string, jobTitle: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${candidateName}, regarding your application for ${jobTitle} via Instant Placement, we would like to invite you for an interview. Please let us know your availability.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Applicant Pipeline & Kanban</span>
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-2.5 py-0.5 font-bold">
              {filtered.length} Applicants
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track candidates through recruitment stages. Drag &amp; drop cards between columns or use quick stage controls.
          </p>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {viewMode === "kanban" && (
            <div className="flex items-center gap-1.5">
              {/* Slider Left / Right Navigation Controls */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  disabled={!canScrollLeft}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-white disabled:opacity-30 disabled:hover:text-slate-700 disabled:hover:bg-transparent transition-all"
                  title="Slide Kanban Left"
                  aria-label="Slide Kanban Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollRight}
                  disabled={!canScrollRight}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-white disabled:opacity-30 disabled:hover:text-slate-700 disabled:hover:bg-transparent transition-all"
                  title="Slide Kanban Right"
                  aria-label="Slide Kanban Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddStageOpen(true)}
                className="h-8 px-2.5 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1 rounded-xl shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stage</span>
              </Button>
              {stages.some((s) => s.isCustom) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetStages}
                  className="h-8 px-2 text-xs text-slate-500 hover:text-slate-800 gap-1 rounded-xl"
                  title="Reset to default stages"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Stage Modal */}
      {isAddStageOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Add Custom Pipeline Stage</span>
              </h3>
              <button
                onClick={() => setIsAddStageOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStage} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Stage Name / Step Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Round, Manager Interview, Background Check"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Theme Color
                </label>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {COLOR_OPTIONS.map((c, i) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setSelectedColorIdx(i)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedColorIdx === i
                          ? "ring-2 ring-indigo-500 border-indigo-400 font-bold shadow-xs bg-slate-50"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${c.color}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddStageOpen(false)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4"
                >
                  Add Pipeline Stage
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-600 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Target Role:</span>
          </label>
          <select
            value={jobIdFilter}
            onChange={(e) => setJobIdFilter(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
          >
            <option value="ALL">All Active Roles ({jobs.length})</option>
            {jobs.map((j: any) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.city})
              </option>
            ))}
          </select>
        </div>

        {viewMode === "table" && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
            <button
              onClick={() => setStageFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                stageFilter === "ALL"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              ALL
            </button>
            {stages.map((st) => (
              <button
                key={st.id}
                onClick={() => setStageFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  stageFilter === st.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {st.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KANBAN BOARD VIEW (Spacious, Roomy Columns with Horizontal Slider Navigation) */}
      {viewMode === "kanban" && (
        <div className="relative group/kanban">
          {/* Floating Left Slider Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={handleScrollLeft}
              className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl text-slate-800 hover:text-indigo-600 hover:scale-110 active:scale-95 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Slide Left"
              aria-label="Slide Left"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Floating Right Slider Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={handleScrollRight}
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl text-slate-800 hover:text-indigo-600 hover:scale-110 active:scale-95 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Slide Right"
              aria-label="Slide Right"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          <div
            ref={kanbanScrollRef}
            onScroll={checkScroll}
            className="w-full overflow-x-auto pb-6 pt-1 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400"
          >
            <div className="flex gap-5 min-w-max items-start">
            {stages.map((col, colIdx) => {
              const colApps = localApplicants.filter((a: any) => {
                const normalized = LEGACY_STATUS_MAP[a.status] || a.status;
                return normalized === col.id;
              });

              const isLastStage = colIdx === stages.length - 1;
              const isColumnDropTarget = dragOverStageId === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleColumnDragOver(e, col.id)}
                  onDragLeave={(e) => handleColumnDragLeave(e, col.id)}
                  onDrop={(e) => handleColumnDrop(e, col.id)}
                  className={`w-80 min-w-[320px] max-w-[340px] shrink-0 rounded-2xl border p-4 flex flex-col min-h-[580px] max-h-[820px] transition-all duration-200 ${
                    isColumnDropTarget
                      ? "bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-500 ring-offset-2 shadow-lg scale-[1.01]"
                      : "bg-slate-50/90 border-slate-200/90 shadow-2xs"
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/90 mb-3.5 px-0.5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${col.color}`} />
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider truncate">
                        {col.title}
                      </h3>
                      {col.isCustom && (
                        <button
                          onClick={() => handleDeleteStage(col.id)}
                          className="text-slate-500 hover:text-rose-600 p-0.5 rounded transition-colors shrink-0"
                          title="Delete custom stage"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      {isColumnDropTarget && draggedApplicantId && (
                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-100/90 border border-indigo-300 px-1.5 py-0.5 rounded-md animate-pulse">
                          Drop Here
                        </span>
                      )}
                    </div>
                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shadow-2xs shrink-0">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards Scroll Container */}
                  <div className="space-y-3.5 overflow-y-auto flex-1 pr-1.5">
                    {colApps.length === 0 ? (
                      <div
                        className={`py-12 text-center text-xs font-semibold border-2 border-dashed rounded-xl transition-all ${
                          isColumnDropTarget && draggedApplicantId
                            ? "border-indigo-400 bg-indigo-100/70 text-indigo-700 ring-2 ring-indigo-300 animate-pulse"
                            : "border-slate-200 bg-white/50 text-slate-500"
                        }`}
                      >
                        {isColumnDropTarget && draggedApplicantId
                          ? "Drop candidate here"
                          : "No candidates"}
                      </div>
                    ) : (
                      colApps.map((app: any) => {
                        // Server pre-masks contacts without a paid plan (contactMasked flag).
                        const isContactUnlocked = app.contactMasked === false;
                        const rawPhone = app.candidatePhone || "";
                        const displayPhone = rawPhone || "••••••••••";
                        const isBeingDragged = draggedApplicantId === app._id;

                        return (
                          <div
                            key={app._id}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, app._id)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white border rounded-xl p-4 shadow-xs transition-all space-y-3 group relative select-none ${
                              isBeingDragged
                                ? "opacity-35 scale-[0.98] border-dashed border-indigo-500 ring-2 ring-indigo-300 bg-indigo-50/40 cursor-grabbing shadow-inner"
                                : "border-slate-200 hover:shadow-md hover:border-indigo-300 cursor-grab active:cursor-grabbing"
                            }`}
                          >
                            {/* Candidate Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                  {app.candidateName}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                  <span>{app.candidateCity || "Surat"}</span>
                                  {app.experience && (
                                    <>
                                      <span>•</span>
                                      <span>{app.experience}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                {isContactUnlocked && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                    Verified
                                  </span>
                                )}
                                <span
                                  className="text-slate-400 group-hover:text-indigo-600 transition-colors p-0.5"
                                  title="Drag candidate to move stage"
                                >
                                  <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing" />
                                </span>
                              </div>
                            </div>

                            {/* Job Name Badge */}
                            <div className="text-xs font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-100/80 px-2.5 py-1 rounded-lg truncate">
                              {app.job?.title || "Job Mandate"}
                            </div>

                            {/* Commute Tag */}
                            {app.commuteConfirmed && (
                              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Commute Verified</span>
                              </div>
                            )}

                            {/* Phone & Direct Fast Actions */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 font-mono text-xs">
                                {!isContactUnlocked && <Lock className="w-3 h-3 text-amber-500" />}
                                <span
                                  className={
                                    isContactUnlocked
                                      ? "text-emerald-700 font-bold"
                                      : "text-slate-500 font-medium"
                                  }
                                >
                                  {displayPhone}
                                </span>
                              </div>

                              {isContactUnlocked ? (
                                <div className="flex items-center gap-1.5">
                                  <ChatButton applicationId={String(app._id)} label="Chat" />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openWhatsApp(
                                        rawPhone,
                                        app.candidateName,
                                        app.job?.title || "role"
                                      )
                                    }
                                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
                                    title="WhatsApp Candidate"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <a
                                    href={`tel:${rawPhone}`}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                    title="Call"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              ) : (
                                <Link
                                  href="/employer/plans"
                                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
                                >
                                  Unlock
                                </Link>
                              )}
                            </div>

                            {/* Resume Download / View */}
                            <div className="pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => handleDownloadResume(app)}
                                disabled={downloadingResumeId === app._id}
                                className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                title="Download or View Resume"
                              >
                                {downloadingResumeId === app._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                )}
                                <span>{isContactUnlocked ? "View Resume" : "Resume (Plan Required)"}</span>
                              </button>
                            </div>

                            {/* Stage Action Controls */}
                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              <div className="flex items-center justify-between gap-1 text-xs text-slate-500 font-semibold">
                                <span>Move to Stage:</span>
                                {!isLastStage && col.id !== "REJECTED" && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAdvance(app._id, app.status)}
                                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 text-xs"
                                    title="Advance to next stage"
                                  >
                                    <span>Advance</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <select
                                value={app.status}
                                onChange={(e) => handleStageChange(app._id, e.target.value)}
                                className="w-full h-8 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                              >
                                {stages.map((st) => (
                                  <option key={st.id} value={st.id}>
                                    → Move to {st.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Visual Drop Zone Indicator when dragging over a populated column */}
                    {draggedApplicantId && isColumnDropTarget && colApps.length > 0 && (
                      <div className="border-2 border-dashed border-indigo-400 bg-indigo-50/80 rounded-xl p-3 text-center text-xs font-bold text-indigo-700 animate-pulse flex items-center justify-center gap-1.5 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Drop to move into {col.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading applicants...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No applicants found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 pl-6">Candidate Details</th>
                    <th className="p-4">Applied Role</th>
                    <th className="p-4">Experience & Edu</th>
                    <th className="p-4">Current Stage</th>
                    <th className="p-4">Fast Connect</th>
                    <th className="p-4 text-right pr-6">Stage Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filtered.map((app: any) => {
                    // Server pre-masks contacts without a paid plan (contactMasked flag).
                    const isContactUnlocked = app.contactMasked === false;
                    const rawPhone = app.candidatePhone || "";
                    const displayPhone = rawPhone || "••••••••••";

                    const currentStageObj = stages.find((s) => s.id === app.status);

                    return (
                      <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{app.candidateName}</span>
                            {isContactUnlocked && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-1 py-0 font-bold">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs font-semibold mt-0.5 flex items-center gap-1">
                            {!isContactUnlocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                            <span
                              className={
                                isContactUnlocked
                                  ? "text-emerald-600 font-mono"
                                  : "text-slate-500 font-mono"
                              }
                            >
                              {displayPhone}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 block">
                            {app.candidateCity || "Surat"}
                          </span>

                          {app.commuteConfirmed && (
                            <div className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 bg-emerald-50/80 border border-emerald-200/80 px-1.5 py-0.5 rounded-md w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>Commute Verified</span>
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-indigo-600 text-xs">
                            {app.job?.title || "Job Mandate"}
                          </div>
                          <span className="text-xs text-slate-500 block">
                            {app.job?.city}
                          </span>
                        </td>

                        <td className="p-4 text-slate-700">
                          <div>{app.experience || "Fresher"}</div>
                          <span className="text-xs text-slate-500 block">
                            {app.qualification || "12th Pass"}
                          </span>
                        </td>

                        <td className="p-4">
                          <Badge
                            className={`text-xs font-bold ${
                              currentStageObj?.badgeBg || "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {currentStageObj?.title || app.status.replace(/_/g, " ")}
                          </Badge>
                        </td>

                        <td className="p-4">
                          {isContactUnlocked ? (
                            <div className="flex items-center gap-1.5">
                              <ChatButton applicationId={String(app._id)} label="Chat" />
                              <Button
                                size="sm"
                                onClick={() =>
                                  openWhatsApp(
                                    rawPhone,
                                    app.candidateName,
                                    app.job?.title || "our role"
                                  )
                                }
                                className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 rounded-xl shadow-xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </Button>
                              <a href={`tel:${rawPhone}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2.5 border-slate-200 text-slate-700 text-xs rounded-xl hover:bg-slate-50"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </Button>
                              </a>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadResume(app)}
                                disabled={downloadingResumeId === app._id}
                                className="h-8 px-2.5 border-slate-200 text-slate-700 text-xs rounded-xl hover:bg-slate-50 gap-1"
                                title="Download or View Resume"
                              >
                                {downloadingResumeId === app._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                )}
                                <span>Resume</span>
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Link
                                href="/employer/plans"
                                className="h-8 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs gap-1.5 rounded-xl shadow-xs font-bold inline-flex items-center"
                              >
                                <Lock className="w-3.5 h-3.5 text-amber-300" />
                                <span>Unlock Phone</span>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadResume(app)}
                                disabled={downloadingResumeId === app._id}
                                className="h-8 px-2.5 border-slate-200 text-slate-700 text-xs rounded-xl hover:bg-slate-50 gap-1"
                                title="Download or View Resume"
                              >
                                {downloadingResumeId === app._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                )}
                                <span>Resume</span>
                              </Button>
                            </div>
                          )}
                        </td>

                        <td className="p-4 text-right pr-6">
                          <select
                            value={app.status}
                            onChange={(e) => handleStageChange(app._id, e.target.value)}
                            className="h-8 px-2.5 bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl focus:border-indigo-500 shadow-xs cursor-pointer"
                          >
                            {stages.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.title}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default function EmployerApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading applicants...
        </div>
      }
    >
      <ApplicantsContent />
    </Suspense>
  );
}
