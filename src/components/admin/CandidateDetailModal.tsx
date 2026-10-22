"use client";

import React, { useState } from "react";
import {
  X,
  Phone,
  Mail,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";
import {

  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  BadgeCheck,
  CheckCircle2,
  Building2,
  FileText,
  MessageSquare,
  ShieldCheck,
  User,
  Sparkles,
  Send,
  ChevronDown,
  Loader2,
  Plus,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetAdminJobsQuery, useSendCandidateJobAlertMutation, useUpdateCandidateSkillsMutation } from "@/services/api/adminApi";

interface CandidateDetailModalProps {
  candidate: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCandidate?: (updatedCandidate: any) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onUpdateCandidate,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "cv">("profile");
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [alertStatus, setAlertStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Skill management state
  const [localSkills, setLocalSkills] = useState<string[]>(candidate?.skills || []);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [skillSaveError, setSkillSaveError] = useState<string | null>(null);
  const [skillSaveSuccess, setSkillSaveSuccess] = useState(false);

  // Sync skills when candidate prop changes
  React.useEffect(() => {
    setLocalSkills(candidate?.skills || []);
    setIsAddingSkill(false);
    setNewSkillInput("");
    setSkillSaveError(null);
  }, [candidate]);

  // Fetch active jobs for the picker
  const { data: adminJobs = [] } = useGetAdminJobsQuery({ status: "ACTIVE", limit: 100 });
  const [sendJobAlert, { isLoading: isSending }] = useSendCandidateJobAlertMutation();
  const [updateCandidateSkills, { isLoading: isUpdatingSkills }] = useUpdateCandidateSkillsMutation();

  const handleAddSkill = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;

    if (localSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillSaveError(`"${trimmed}" already exists.`);
      return;
    }

    const updatedSkills = [...localSkills, trimmed];
    setLocalSkills(updatedSkills);
    setNewSkillInput("");
    setSkillSaveError(null);

    try {
      const candidateId = candidate._id || candidate.id;
      await updateCandidateSkills({ id: candidateId, skills: updatedSkills }).unwrap();
      setSkillSaveSuccess(true);
      setTimeout(() => setSkillSaveSuccess(false), 2500);
      onUpdateCandidate?.({ ...candidate, skills: updatedSkills });
    } catch (err: any) {
      setLocalSkills(candidate?.skills || []);
      setSkillSaveError(err?.data?.message || err?.message || "Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedSkills = localSkills.filter((s) => s !== skillToRemove);
    setLocalSkills(updatedSkills);
    setSkillSaveError(null);

    try {
      const candidateId = candidate._id || candidate.id;
      await updateCandidateSkills({ id: candidateId, skills: updatedSkills }).unwrap();
      onUpdateCandidate?.({ ...candidate, skills: updatedSkills });
    } catch (err: any) {
      setLocalSkills(candidate?.skills || []);
      setSkillSaveError(err?.data?.message || err?.message || "Failed to remove skill");
    }
  };

  if (!isOpen || !candidate) return null;

  const cleanPhone = String(candidate.phone || "").replace(/\D/g, "").slice(-10);
  const whatsappNumber = String(candidate.whatsappNumber || candidate.phone || "").replace(/\D/g, "").slice(-10);

  const API_BASE = getApiBaseUrl();
  const SERVER_BASE = API_BASE.replace("/api/v1", "");

  const hasResume = Boolean(candidate.resumeUrl);
  const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : "";
  const rawResumeUrl = candidate.resumeUrl?.startsWith("http")
    ? candidate.resumeUrl
    : (candidate.resumeUrl ? `${SERVER_BASE}${candidate.resumeUrl}` : "");
  const resumeUrl = token && rawResumeUrl
    ? `${rawResumeUrl}${rawResumeUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
    : rawResumeUrl;
  
  const resumeDisplayName = candidate.resumeFile || candidate.resumeUrl?.split("/").pop() || "Resume.pdf";

  const handleSendJobAlert = async () => {
    if (!selectedJobId) {
      setAlertStatus({ type: "error", msg: "Please select a job first." });
      return;
    }
    setAlertStatus(null);
    try {
      const result = await sendJobAlert({ candidateId: candidate._id || candidate.id, jobId: selectedJobId }).unwrap();
      setAlertStatus({ type: "success", msg: result.message || "WhatsApp job alert sent successfully!" });
      setShowJobPicker(false);
      setSelectedJobId("");
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to send alert. Check WhatsApp token.";
      setAlertStatus({ type: "error", msg });
    }
  };

  return (
    <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* ─── Modal Sticky Header ─── */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-4">
            {/* Avatar / Profile Image */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 overflow-hidden">
                {candidate.avatar ? (
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{candidate.name ? candidate.name.charAt(0).toUpperCase() : "C"}</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-indigo-950 rounded-full shadow-xs" title="Active Candidate" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-1.5">
                  <span>{candidate.name || "Candidate Profile"}</span>
                  <BadgeCheck className="w-5 h-5 text-blue-400 shrink-0" />
                </h2>
                {candidate.isImmediateJoiner !== false && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
                    Immediate Joiner
                  </span>
                )}
                {candidate.consentToShareProfile && (
                  <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Consent Verified
                  </span>
                )}
              </div>

              <div className="text-xs text-blue-200 font-semibold flex items-center gap-2 flex-wrap pt-0.5">
                <span className="text-white font-bold">{candidate.currentRole || "Candidate"}</span>
                {candidate.currentCompany && (
                  <>
                    <span className="text-blue-400/60">•</span>
                    <span className="flex items-center gap-1 text-blue-300">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{candidate.currentCompany}</span>
                    </span>
                  </>
                )}
                <span className="text-blue-400/60">•</span>
                <span className="flex items-center gap-1 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{candidate.locality ? `${candidate.locality}, ` : ""}{candidate.city || "Surat"}</span>
                </span>
              </div>

              {/* Direct Quick Actions */}
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <a
                  href={`tel:+91${cleanPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call +91 {cleanPhone}</span>
                </a>

                <a
                  href={`https://wa.me/91${whatsappNumber}?text=Hello%20${encodeURIComponent(candidate.name || "")},%20we%20reviewed%20your%20profile%20on%20Instant%20Placement.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                {candidate.email && (
                  <a
                    href={`mailto:${candidate.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}

                {/* ── Send Job Alert Button ── */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setShowJobPicker((v) => !v); setAlertStatus(null); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Job Alert</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showJobPicker ? "rotate-180" : ""}`} />
                  </button>

                  {/* Job Picker Dropdown */}
                  {showJobPicker && (
                    <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Select a Job to Notify
                      </p>
                      <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Choose an active job --</option>
                        {adminJobs.map((job: any) => (
                          <option key={job._id || job.id} value={job._id || job.id}>
                            {job.title} · {job.company} ({job.city})
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSendJobAlert}
                          disabled={isSending || !selectedJobId}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          {isSending ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                          ) : (
                            <><Send className="w-3.5 h-3.5" /> Send Alert via WhatsApp</>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowJobPicker(false); setSelectedJobId(""); }}
                          className="px-3 py-2 text-slate-500 hover:text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Alert Status Banner ── */}
        {alertStatus && (
          <div
            className={`px-5 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0 ${
              alertStatus.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
                : "bg-rose-50 text-rose-800 border-b border-rose-200"
            }`}
          >
            {alertStatus.type === "success" ? "✅" : "❌"} {alertStatus.msg}
            <button
              type="button"
              onClick={() => setAlertStatus(null)}
              className="ml-auto text-slate-500 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── Tabs Switcher ─── */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "profile"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Complete Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cv")}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "cv"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Original CV Document</span>
            {hasResume && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
            )}
          </button>
        </div>

        {/* ─── Modal Scrollable Body ─── */}
        <div className="overflow-y-auto p-6 space-y-6">
          {activeTab === "profile" ? (
            <>
              {/* Profile Summary Card */}
              {candidate.resumeSummary && (
                <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Profile Summary &amp; Professional Bio</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{candidate.resumeSummary}"
                  </p>
                </div>
              )}

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Contact: Phone */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Mobile Number
                  </span>
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>+91 {candidate.phone}</span>
                  </div>
                </div>

                {/* Contact: WhatsApp */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    WhatsApp Number
                  </span>
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>+91 {candidate.whatsappNumber || candidate.phone}</span>
                  </div>
                </div>

                {/* Contact: Email */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Email Address
                  </span>
                  <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-2" title={candidate.email}>
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{candidate.email || "Not provided"}</span>
                  </div>
                </div>

                {/* Target Role */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Target Role / Designation
                  </span>
                  <div className="font-extrabold text-sm text-blue-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>{candidate.currentRole || "Open to Opportunities"}</span>
                  </div>
                </div>

                {/* Current Company */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Current / Recent Company
                  </span>
                  <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>{candidate.currentCompany || "N/A (Fresher or Not Disclosed)"}</span>
                  </div>
                </div>

                {/* Experience Tier */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Experience Level
                  </span>
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>
                      {candidate.experience || "Fresher"}
                      {candidate.totalExperienceYears ? ` (${candidate.totalExperienceYears} Yrs)` : ""}
                    </span>
                  </div>
                </div>

                {/* Education */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Highest Qualification
                  </span>
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                    <span>{candidate.highestQualification || candidate.qualification || "12th Pass"}</span>
                  </div>
                </div>

                {/* City & Locality */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    City &amp; Area / Locality
                  </span>
                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>{candidate.locality ? `${candidate.locality}, ` : ""}{candidate.city || "Surat"}</span>
                  </div>
                </div>

                {/* Expected Salary */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Expected Monthly Salary
                  </span>
                  <div className="font-extrabold text-sm text-emerald-700">
                    <span>
                      {candidate.expectedSalaryMonthly || candidate.expectedSalary
                        ? `₹${Number(candidate.expectedSalaryMonthly || candidate.expectedSalary).toLocaleString("en-IN")} / mo`
                        : "As per company standard"}
                    </span>
                  </div>
                </div>

                {/* Notice Period */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Notice Period
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    {candidate.noticePeriod === "IMMEDIATE" ? "Immediate Joiner" : candidate.noticePeriod || "Immediate"}
                  </span>
                </div>

                {/* Willing to Relocate */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Relocation Willingness
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    {candidate.willingToRelocate ? "Yes, open to relocate" : "No, local commute only"}
                  </span>
                </div>

                {/* Registration Date */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Member Since
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently Joined"}
                  </span>
                </div>
              </div>

              {/* Detailed Qualification Note if present */}
              {candidate.qualificationDetail && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">
                    Academic Background &amp; Degree Information
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    {candidate.qualificationDetail}
                  </p>
                </div>
              )}

              {/* Skills Badges with Add Skill (+) Button */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Skills &amp; Competencies ({localSkills.length})</span>
                  </h3>

                  {!isAddingSkill && (
                    <button
                      type="button"
                      onClick={() => setIsAddingSkill(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Skill</span>
                    </button>
                  )}
                </div>

                {/* Inline Add Skill Input Form */}
                {isAddingSkill && (
                  <form onSubmit={handleAddSkill} className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                    <input
                      type="text"
                      autoFocus
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="Type skill name (e.g. JavaScript, Python, React, Tally) and press Enter..."
                      className="flex-1 h-9 px-3 text-xs bg-white border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 shadow-xs"
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingSkills || !newSkillInput.trim()}
                      className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                    >
                      {isUpdatingSkills ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>Add</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSkill(false);
                        setNewSkillInput("");
                        setSkillSaveError(null);
                      }}
                      className="h-9 px-3 text-slate-600 hover:text-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {skillSaveError && (
                  <p className="text-xs text-rose-600 font-semibold">{skillSaveError}</p>
                )}
                {skillSaveSuccess && (
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Skill added successfully!
                  </p>
                )}

                {localSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {localSkills.map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-900 border border-blue-200 rounded-xl text-xs font-bold shadow-2xs hover:border-blue-400 transition-all"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          disabled={isUpdatingSkills}
                          title={`Remove ${s}`}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-white border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                    <p className="text-xs text-slate-500 font-medium">No skills listed for this candidate yet.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddingSkill(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Click here to add the first skill</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ─── 360° Tele-Screening Dossier & Verification Checklist ─── */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Recruiter Tele-Screening Verification</span>
                  </h3>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    360° Dossier
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">Hindi &amp; Regional Fluency</span>
                      <span className="text-xs text-slate-500">Candidate demonstrates clear telephone communication</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">Notice Period: Immediate</span>
                      <span className="text-xs text-slate-500">Available to join within 0-3 business days</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">Salary Expectations Aligned</span>
                      <span className="text-xs text-slate-500">Fits within budget of target job openings</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">Commute Feasibility Verified</span>
                      <span className="text-xs text-slate-500">Within manageable travel radius of job locations</span>
                    </div>
                  </label>
                </div>

                {/* Recruiter Evaluation Notes */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Recruiter Assessment &amp; Screening Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter confidential notes regarding candidate communication, reliability, and employer suitability..."
                    defaultValue="Candidate was polite and enthusiastic during tele-screening. Clear Hindi communication, immediate availability confirmed."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          ) : (
            /* ─── CV Document Tab ─── */
            <div className="space-y-4">
              {hasResume ? (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-sm">
                          {resumeDisplayName}
                        </p>
                        <p className="text-xs text-slate-500">Candidate Original Resume File</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in New Window</span>
                      </a>

                      <a
                        href={resumeUrl}
                        download={resumeDisplayName}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download CV</span>
                      </a>
                    </div>
                  </div>

                  {/* Embedded PDF Viewer */}
                  <div className="w-full bg-slate-100 rounded-2xl p-2 border border-slate-200">
                    <iframe
                      src={`${resumeUrl}#navpanes=0&pagemode=none&view=FitH`}
                      className="w-full h-[600px] rounded-xl border-0 bg-white"
                      title="Candidate CV Document"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200/70 text-slate-500 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No CV Attached</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    This candidate has not uploaded a resume file yet. You can contact them directly at +91 {candidate.phone} to request their CV.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Modal Footer ─── */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Instant Placement Verified Candidate Profile</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
