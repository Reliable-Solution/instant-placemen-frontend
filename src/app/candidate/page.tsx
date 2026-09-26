"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetMyApplicationsQuery } from "@/services/api/jobsApi";
import { getApiBaseUrl } from "@/lib/config";

import {
  User,
  Upload,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Star,
  Zap,
  MapPin,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react";

const API_BASE = getApiBaseUrl();

interface UserProfile {
  _id?: string;
  id?: string;
  name?: string;
  phone?: string;
  city?: string;
  locality?: string;
  experience?: string;
  qualification?: string;
  currentRole?: string;
  currentCompany?: string;
  skills?: string[];
  resumeUrl?: string;
  resumeSummary?: string;
  consentToShareProfile?: boolean;
  [key: string]: unknown;
}

export default function CandidateOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch application count from backend API
  const { data: myApplications = [] } = useGetMyApplicationsQuery();
  const appliedCount = myApplications.length;

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("ip_user")
        : null;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("ip_token")
        : null;

    if (!raw && !token) {
      router.replace("/");
      return;
    }

    const u: UserProfile = raw ? JSON.parse(raw) : {};
    setUser(u);

    if (token) {
      fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch profile");
          return res.json();
        })
        .then((data) => {
          if (data?.user) setUser(data.user);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const checklist = [
    {
      key: "resume",
      label: "Resume (PDF) Uploaded",
      description: "Auto-extracts skills, education & experience",
      done: Boolean(user?.resumeUrl || (user as any)?.resumeFile),
      actionHref: "/candidate/resume",
      actionText: "Upload PDF",
    },
    {
      key: "skills",
      label: "Key Skills (at least 3)",
      description: "Match with relevant job postings in Surat",
      done: (user?.skills?.length ?? 0) >= 3,
      actionHref: "/candidate/profile",
      actionText: "Add Skills",
    },
    {
      key: "experience",
      label: "Experience Level",
      description: "Fresher or years of relevant work experience",
      done: Boolean(user?.experience),
      actionHref: "/candidate/profile",
      actionText: "Set Experience",
    },
    {
      key: "qualification",
      label: "Highest Qualification",
      description: "Degrees, diplomas or schooling certifications",
      done: Boolean(user?.qualification),
      actionHref: "/candidate/profile",
      actionText: "Set Qualification",
    },
    {
      key: "location",
      label: "City & Preferred Locality",
      description: "Adajan, Vesu, Varachha, Katargam etc. for commute check",
      done: Boolean(user?.city && user?.locality),
      actionHref: "/candidate/profile",
      actionText: "Set Locality",
    },
    {
      key: "role",
      label: "Target Role / Job Title",
      description: "Specific designation you are seeking",
      done: Boolean(user?.currentRole),
      actionHref: "/candidate/profile",
      actionText: "Specify Role",
    },
    {
      key: "consent",
      label: "Direct Recruiter Calling Consent",
      description: "Allow verified employers to contact you via WhatsApp / Phone",
      done: Boolean(user?.consentToShareProfile),
      actionHref: "/candidate/privacy",
      actionText: "Enable Sharing",
    },
  ];

  const completedList = checklist.filter((i) => i.done);
  const pendingList = checklist.filter((i) => !i.done);
  const completionScore = Math.round((completedList.length / checklist.length) * 100);

  const skillsCount = user?.skills?.length ?? 0;
  const hasResume = Boolean(user?.resumeUrl || (user as any)?.resumeFile);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.name || "Candidate";
  const initials =
    displayName
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "C";

  const actions = [
    {
      label: "Edit Profile",
      description: "Update your personal details, experience & skills",
      href: "/candidate/profile",
      icon: <User className="w-6 h-6" />,
      color: "from-blue-600 to-indigo-600",
      shadowColor: "shadow-blue-500/25",
    },
    {
      label: "Upload Resume",
      description: "Upload a PDF resume for auto-extraction",
      href: "/candidate/resume",
      icon: <Upload className="w-6 h-6" />,
      color: "from-rose-500 to-pink-600",
      shadowColor: "shadow-rose-500/25",
    },
    {
      label: "View Applications",
      description: `${appliedCount} job${appliedCount !== 1 ? "s" : ""} applied — track status`,
      href: "/candidate/applications",
      icon: <Briefcase className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/25",
    },
    {
      label: "Privacy Settings",
      description: "Control profile visibility & DPDP consent",
      href: "/candidate/privacy",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "from-amber-500 to-orange-600",
      shadowColor: "shadow-amber-500/25",
    },
  ];

  const recentActivity: { icon: React.ReactNode; text: string; time: string }[] = [
    {
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      text: "Account created via phone verification",
      time: "Just now",
    },
  ];
  if (user.city) {
    recentActivity.push({
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      text: `City set to ${user.locality ? `${user.locality}, ` : ""}${user.city}`,
      time: "Profile",
    });
  }
  if (user.experience) {
    recentActivity.push({
      icon: <Briefcase className="w-4 h-4 text-indigo-500" />,
      text: `Experience: ${user.experience}`,
      time: "Profile",
    });
  }
  if (user.qualification) {
    recentActivity.push({
      icon: <GraduationCap className="w-4 h-4 text-violet-500" />,
      text: `Qualification: ${user.qualification}`,
      time: "Profile",
    });
  }
  if (skillsCount > 0) {
    recentActivity.push({
      icon: <Star className="w-4 h-4 text-amber-500" />,
      text: `${skillsCount} skill${skillsCount !== 1 ? "s" : ""} added to profile`,
      time: "Skills",
    });
  }
  if (hasResume) {
    recentActivity.push({
      icon: <Upload className="w-4 h-4 text-emerald-500" />,
      text: "PDF resume uploaded",
      time: "Resume",
    });
  }

  return (
    <div className="space-y-6">
      {/* Profile Strength Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-900 font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white">
                {user.name || "Complete Your Profile"}
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] px-2 py-0.5 rounded-full font-bold">
                ✓ VERIFIED
              </span>
              {user.consentToShareProfile && (
                <span className="bg-blue-400/20 text-blue-200 border border-blue-400/30 text-[11px] px-2 py-0.5 rounded-full font-bold">
                  ✓ HR VISIBLE
                </span>
              )}
            </div>
            <p className="text-sm text-blue-200 mt-1 flex items-center gap-2 flex-wrap">
              {user.phone && <span>+91 {user.phone}</span>}
              {user.city && (
                <span>• 📍 {user.locality ? `${user.locality}, ` : ""}{user.city}</span>
              )}
              {user.experience && <span>• 💼 {user.experience}</span>}
              {user.qualification && <span>• 🎓 {user.qualification}</span>}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 min-w-[170px] shrink-0 border border-white/15">
            <p className="text-[11px] text-blue-200 font-semibold mb-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Profile Strength
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">{completionScore}%</span>
              <span className="text-xs text-blue-200 font-medium">complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${completionScore}%`,
                  background: completionScore >= 80 ? "#22c55e" : completionScore >= 50 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
            {!user.consentToShareProfile ? (
              <p className="text-[10px] text-amber-300 mt-1.5 font-medium leading-tight">
                ⚠ Enable sharing to receive HR calls
              </p>
            ) : (
              <p className="text-[10px] text-emerald-300 mt-1.5 font-medium">
                ✓ Active for recruiters
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10">
          <div className="text-center">
            <p className="text-xl font-extrabold text-white">{appliedCount}</p>
            <p className="text-[11px] text-blue-300 font-medium mt-0.5">Applied Jobs</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-xl font-extrabold text-white">{skillsCount}</p>
            <p className="text-[11px] text-blue-300 font-medium mt-0.5">Skills</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-emerald-400">
              {hasResume ? "1 PDF" : "Digital CV"}
            </p>
            <p className="text-[11px] text-blue-300 font-medium mt-0.5">Resume Status</p>
          </div>
        </div>
      </div>

      {/* Horizontal Application Pipeline Stepper (Mockup 10) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">My Placement Pipeline</h2>
            <p className="text-xs text-slate-500">Track your verified journey from application to joining</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-full">
            Active Candidates
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2 relative">
          {[
            { step: "1", label: "Applied", desc: "Submitted CV", state: "done" },
            { step: "2", label: "Screened", desc: "HR Verified", state: "done" },
            { step: "3", label: "Interview", desc: "Slot Confirmed", state: "active" },
            { step: "4", label: "Offer", desc: "Letter Released", state: "pending" },
            { step: "5", label: "Joined", desc: "Day 1 Onboarding", state: "pending" },
          ].map((stage, i) => (
            <div key={i} className="flex flex-col items-center text-center relative group">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                  stage.state === "done"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : stage.state === "active"
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-600/30"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {stage.state === "done" ? <Check className="w-4 h-4" /> : stage.step}
              </div>
              <span
                className={`text-xs font-bold ${
                  stage.state === "active"
                    ? "text-indigo-600 font-extrabold"
                    : stage.state === "done"
                    ? "text-slate-900"
                    : "text-slate-400"
                }`}
              >
                {stage.label}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{stage.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Profile Completion Checklist */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Profile Completion &amp; Missing Items</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete all items to get 3x more interview calls from top verified employers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {completedList.length} of {checklist.length} Completed
            </span>
            <span
              className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                pendingList.length === 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {completionScore}% Score
            </span>
          </div>
        </div>

        {/* Pending Items Callout */}
        {pendingList.length > 0 ? (
          <div className="space-y-2 mb-4">
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Action Items ({pendingList.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {pendingList.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-200/80 bg-amber-50/40 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-900 block">{item.label}</span>
                    <span className="text-[11px] text-slate-500 truncate block">{item.description}</span>
                  </div>
                  <Link href={item.actionHref}>
                    <button className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs transition-colors">
                      {item.actionText}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>All profile requirements completed!</strong> Your profile is 100% ready and actively featured to recruiters in your city.
            </span>
          </div>
        )}

        {/* Completed items preview pills */}
        {completedList.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Verified &amp; Completed
            </span>
            <div className="flex flex-wrap gap-2">
              {completedList.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"
                >
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Quick Action Cards */}
      <section>
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center shadow-md ${action.shadowColor} mb-3`}
              >
                {action.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                {action.label}
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-3">
          Recent Activity
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.text}</p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium shrink-0">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
