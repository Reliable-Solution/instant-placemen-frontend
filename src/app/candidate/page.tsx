"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetMyApplicationsQuery } from "@/services/api/jobsApi";
import { getApiBaseUrl } from "@/lib/config";
import { DashboardHeader, StatCard, ContentCard } from "@/components/dashboard/Dashboard";

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
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch application count from backend API
  const { data: myApplications = [] } = useGetMyApplicationsQuery();
  const appliedCount = Array.isArray(myApplications) ? myApplications.length : 0;

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

    let u: UserProfile = {};
    try {
      u = raw ? (JSON.parse(raw) as UserProfile) : {};
    } catch (err) {
      console.error("Corrupt ip_user in localStorage, clearing session:", err);
      try {
        localStorage.removeItem("ip_user");
        localStorage.removeItem("ip_token");
      } catch {}
      router.replace("/");
      return;
    }
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
        .catch((err) => {
          console.error("Failed to fetch candidate profile:", err);
          setLoadError("Could not refresh profile from server. Showing cached data.");
        })
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
      {loadError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{loadError}</span>
        </div>
      )}
      {/* Page header — same pattern as employer/admin */}
      <DashboardHeader
        badge="Candidate Workspace"
        badgeColor="text-emerald-700 bg-emerald-50 border-emerald-200"
        title={user.name || "Complete Your Profile"}
        subtitle={
          <span className="flex items-center gap-2 flex-wrap">
            {user.phone && <span>+91 {user.phone}</span>}
            {user.city && (
              <span>• 📍 {user.locality ? `${user.locality}, ` : ""}{user.city}</span>
            )}
            {user.experience && <span>• 💼 {user.experience}</span>}
            {user.qualification && <span>• 🎓 {user.qualification}</span>}
            <span className="bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              ✓ VERIFIED
            </span>
            {user.consentToShareProfile && (
              <span className="bg-blue-400/20 text-blue-700 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
                ✓ HR VISIBLE
              </span>
            )}
          </span>
        }
        actionHref="/jobs"
        actionLabel={<><Briefcase className="w-4 h-4" /><span>Find Jobs</span></>}
      />

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Profile Strength"
          value={`${completionScore}%`}
          sub={user.consentToShareProfile ? "✓ Active for recruiters" : "⚠ Enable sharing for HR calls"}
          icon={Star}
          color="text-amber-600 bg-amber-50 border-amber-200"
          href="/candidate/profile"
        />
        <StatCard
          title="Applied Jobs"
          value={appliedCount}
          sub="Track status"
          icon={Briefcase}
          color="text-blue-600 bg-blue-50 border-blue-200"
          href="/candidate/applications"
        />
        <StatCard
          title="Skills Added"
          value={skillsCount}
          sub="Add at least 3"
          icon={Zap}
          color="text-indigo-600 bg-indigo-50 border-indigo-200"
          href="/candidate/profile"
        />
        <StatCard
          title="Resume Status"
          value={hasResume ? "1 PDF" : "Missing"}
          sub={hasResume ? "Auto-extracted" : "Upload PDF"}
          icon={Upload}
          color="text-rose-600 bg-rose-50 border-rose-200"
          href="/candidate/resume"
        />
      </div>

      {/* Content grid — main + side, same pattern as employer/admin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">

        <ContentCard
          title="Profile Completion & Missing Items"
          subtitle="Complete all items to get 3x more interview calls from top verified employers."
          actionHref="/candidate/profile"
          actionLabel={`${completedList.length} of ${checklist.length} done`}
        >
        {/* Pending Items Callout */}
        {pendingList.length > 0 ? (
          <div className="space-y-2 mb-4">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
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
                    <span className="text-xs text-slate-500 truncate block">{item.description}</span>
                  </div>
                  <Link href={item.actionHref}>
                    <button className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-colors">
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Verified &amp; Completed
            </span>
            <div className="flex flex-wrap gap-2">
              {completedList.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"
                >
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        </ContentCard>

      {/* Quick Action Cards */}
      <ContentCard
        title="Quick Actions"
        subtitle="Jump to the most-used candidate tools"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </ContentCard>

        </div>
        <div className="lg:col-span-5 space-y-6">
          <ContentCard
            title="My Placement Pipeline"
            subtitle="Application to joining journey"
            actionHref="/candidate/applications"
            actionLabel="Track"
          >
            <div className="grid grid-cols-5 gap-1">
              {[
                { step: "1", label: "Applied", state: "done" },
                { step: "2", label: "Screened", state: "done" },
                { step: "3", label: "Interview", state: "active" },
                { step: "4", label: "Offer", state: "pending" },
                { step: "5", label: "Joined", state: "pending" },
              ].map((stage, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                      stage.state === "done"
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                        : stage.state === "active"
                        ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-600/30"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {stage.state === "done" ? <Check className="w-4 h-4" /> : stage.step}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      stage.state === "active"
                        ? "text-blue-600 font-extrabold"
                        : stage.state === "done"
                        ? "text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </ContentCard>

          <ContentCard title="Recent Activity" actionHref="/candidate/applications" actionLabel="View All">
            <ul className="divide-y divide-slate-100 -mx-1">
              {recentActivity.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-2 py-3 hover:bg-slate-50/60 transition-colors rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.text}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium shrink-0">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
