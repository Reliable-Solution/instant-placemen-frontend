"use client";

import React from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types";
import {
  User,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  Phone,
  Calendar,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import { CandidateOnboardingModal } from "@/components/candidate/CandidateOnboardingModal";

interface UserDashboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
  appliedJobs: Job[];
  onViewJob: (job: Job) => void;
  onProfileUpdated?: (updated: any) => void;
}

export const UserDashboardDrawer: React.FC<UserDashboardDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  appliedJobs,
  onViewJob,
  onProfileUpdated,
}) => {
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(user?.name || "");
  const [editCity, setEditCity] = React.useState(user?.city || "Surat");
  const [editExp, setEditExp] = React.useState(user?.experience || "Fresher");
  const [editQual, setEditQual] = React.useState(user?.qualification || "12th Pass");
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [isTogglingConsent, setIsTogglingConsent] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditCity(user.city);
      setEditExp(user.experience);
      setEditQual(user.qualification);
    }
  }, [user]);

  const handleToggleConsent = async () => {
    setIsTogglingConsent(true);
    const newConsent = !user?.consentToShareProfile;
    const updated = { ...user, consentToShareProfile: newConsent };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : null;
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100/api/v1";
      await fetch(`${API_BASE}/candidates/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          candidateId: user?._id || user?.id,
          consentToShareProfile: newConsent,
        }),
      });
    } catch (err) {
      console.warn("Consent update error:", err);
    } finally {
      localStorage.setItem("ip_user", JSON.stringify(updated));
      if (onProfileUpdated) onProfileUpdated(updated);
      setIsTogglingConsent(false);
    }
  };

  if (!user) return null;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = {
      name: editName,
      phone: user.phone,
      city: editCity,
      experience: editExp,
      qualification: editQual,
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : null;
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100/api/v1";
      if (token) {
        await fetch(`${API_BASE}/users/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName,
            city: editCity,
            experience: editExp,
            qualification: editQual,
          }),
        });
      }
    } catch (err) {
      console.warn("Backend profile update fallback:", err);
    } finally {
      localStorage.setItem("ip_user", JSON.stringify(updated));
      if (onProfileUpdated) onProfileUpdated(updated);
      setIsSaving(false);
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
        {/* User Profile Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-900 font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{user.name}</h3>
                  <Badge className="bg-emerald-500 text-white border-none text-[10px] py-0 px-2 font-bold">
                    VERIFIED CANDIDATE
                  </Badge>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">+91 {user.phone} • {user.city}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-blue-100 font-medium">
                  <span className="bg-white/10 px-2 py-0.5 rounded">{user.experience}</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded">{user.qualification}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-200 hover:text-white hover:bg-white/10 text-xs gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-red-300 hover:text-white hover:bg-red-500/20 text-xs gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {savedSuccess && (
            <div className="mt-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Profile updated successfully in database!</span>
            </div>
          )}
        </div>

        {/* Inline Profile Editing Form */}
        {isEditing && (
          <form onSubmit={handleSaveEdit} className="p-4 bg-blue-50/70 border-b border-blue-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit Candidate Profile
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Target City</label>
                <select
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="Surat">Surat</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Experience</label>
                <select
                  value={editExp}
                  onChange={(e) => setEditExp(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="Fresher">Fresher (0 exp)</option>
                  <option value="0-1 Years">0-1 Years</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3+ Years">3+ Years</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Qualification</label>
                <select
                  value={editQual}
                  onChange={(e) => setEditQual(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="10th Pass">10th Pass</option>
                  <option value="12th Pass">12th Pass</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                size="sm"
                disabled={isSaving}
                className="h-8 text-xs font-bold gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Profile"}</span>
              </Button>
            </div>
          </form>
        )}

        {/* Dashboard Tabs & Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          {/* Full Dedicated Candidate Dashboard Link */}
          <Link
            href="/candidate"
            onClick={onClose}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-2xl shadow-md shadow-blue-600/20 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold flex items-center gap-1.5">
                  Full Candidate Dashboard &amp; Digital CV
                </h4>
                <p className="text-[11px] text-blue-200">
                  Upload PDF CV, generate printable Digital CV &amp; manage DPDP consent
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
              <p className="text-xl font-extrabold text-blue-600">{appliedJobs.length}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Applied Jobs</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
              <p className="text-xl font-extrabold text-emerald-600">{appliedJobs.length > 0 ? 1 : 0}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">HR Callbacks</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
              <p className="text-xl font-extrabold text-amber-600">{user?.digitalCvGenerated || user?.resumeUrl ? "100%" : "70%"}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Profile Strength</p>
            </div>
          </div>

          {/* Digital CV & 4-Point Screening Snapshot Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    {user?.digitalCvGenerated ? "Instant Placement Digital CV" : user?.resumeUrl ? "PDF Resume Attached" : "Candidate Profile & CV"}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {user?.locality || user?.city ? `Commute Area: ${user?.locality || user?.city}` : "Commute info available"}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsOnboardingOpen(true)}
                className="h-8 text-xs font-bold border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50 gap-1 rounded-xl"
              >
                <Edit3 className="w-3 h-3" />
                <span>Update CV</span>
              </Button>
            </div>

            {/* 4-Point Candidate Attributes Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-2 rounded-xl">
                <p className="text-[10px] text-slate-400 font-medium">Notice</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {user?.noticePeriod === "IMMEDIATE" ? "⚡ Immediate" : user?.noticePeriod || "Immediate"}
                </p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <p className="text-[10px] text-slate-400 font-medium">Expected CTC</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  ₹{user?.expectedSalaryMonthly || user?.expectedSalary || "18,000"}/mo
                </p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <p className="text-[10px] text-slate-400 font-medium">Locality</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                  {user?.locality || user?.city || "Surat"}
                </p>
              </div>
            </div>

            {/* Key Skills Tags */}
            {user?.skills && user?.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {user.skills.map((sk: string) => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* DPDP Act Informed Consent Banner */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            user?.consentToShareProfile
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${user?.consentToShareProfile ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  <h5 className="text-xs font-bold">
                    {user?.consentToShareProfile
                      ? "Profile Visible to Verified Employers (DPDP Compliant)"
                      : "Profile is Private / Unlisted from Searches"}
                  </h5>
                </div>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  {user?.consentToShareProfile
                    ? "Employers hiring in your city can discover your profile and reach out directly for immediate job openings."
                    : "You have not consented to share your profile in the candidate directory. Employers cannot proactively search for you."}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={isTogglingConsent}
                onClick={handleToggleConsent}
                className="shrink-0 h-8 text-xs font-bold rounded-xl bg-white shadow-sm"
              >
                {user?.consentToShareProfile ? "Make Private" : "Enable Sharing"}
              </Button>
            </div>
          </div>

          {/* Applied Jobs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                My Job Applications & Status
              </h4>
              <span className="text-xs text-slate-500">{appliedJobs.length} Applications</span>
            </div>

            {appliedJobs.length > 0 ? (
              <div className="space-y-2.5">
                {appliedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{job.title}</h5>
                        <p className="text-xs text-slate-600 font-medium">{job.company} • {job.city}</p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Application Sent
                      </Badge>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>HR Reviewing Profile</span>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onViewJob(job);
                        }}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>View Job</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Briefcase className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">No applications yet</p>
                <p className="text-[11px] text-slate-500">
                  Search verified jobs on the homepage and click &quot;Apply Now&quot; or &quot;Call HR&quot; to start.
                </p>
              </div>
            )}
          </div>

          {/* Anti-fraud tip */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Zero Charges Guarantee:</strong> You will never be charged any registration fees by our verified recruiters.
            </p>
          </div>
        </div>
      </DialogContent>

      <CandidateOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        user={user}
        onComplete={(updated) => {
          if (onProfileUpdated) onProfileUpdated(updated);
        }}
      />
    </Dialog>
  );
};
