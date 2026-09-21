"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetMyApplicationsQuery } from "@/services/api/jobsApi";
import {
  Briefcase,
  Phone,
  ExternalLink,
  ChevronRight,
  MapPin,
  Building,
  Calendar,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */

interface AppliedJob {
  id?: string;
  _id?: string;
  title: string;
  company: string;
  city: string;
  locality?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: "monthly" | "yearly" | "hourly";
  salary?: string;
  status?: string;
  appliedAt?: string;
  contactPerson?: {
    name?: string;
    phone?: string;
    role?: string;
  };
  [key: string]: unknown;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function formatSalary(job: AppliedJob): string {
  // If a pre-formatted salary string exists, use it
  if (job.salary && typeof job.salary === "string") return job.salary;

  if (job.salaryMin || job.salaryMax) {
    const min = job.salaryMin ?? 0;
    const max = job.salaryMax ?? 0;
    const suffix = job.salaryType === "yearly" ? "/yr" : "/mo";
    if (min && max) {
      return `₹${(min / 1000).toFixed(0)}K – ${(max / 1000).toFixed(0)}K ${suffix}`;
    }
    if (min) return `₹${(min / 1000).toFixed(0)}K+ ${suffix}`;
    if (max) return `Up to ₹${(max / 1000).toFixed(0)}K ${suffix}`;
  }
  return "Not specified";
}

function statusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "applied":
    case "pending":
    case "new":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "viewed":
    case "shortlisted":
    case "screened":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "selected":
    case "hired":
    case "joined":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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

    if (raw) {
      setUser(JSON.parse(raw));
    }

    setIsLoadingUser(false);
  }, [router]);

  // Fetch applications from backend API
  const { data: apiApplications = [], isLoading: isLoadingApps } =
    useGetMyApplicationsQuery();

  const isLoading = isLoadingUser || isLoadingApps;

  /* ── Loading skeleton ── */

  if (isLoading || (!user && typeof window === "undefined")) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">
            Loading your applications…
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  /* ── Transform API data to display format ── */

  const appliedJobs: AppliedJob[] = apiApplications.map((app: any) => {
    const job = app.job || {};
    return {
      id: app._id,
      _id: app._id,
      title: job.title || "Job Mandate",
      company: job.company || "Instant Placement",
      city: job.city || app.candidateCity || "",
      locality: job.locality || "",
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryType: job.salaryType,
      status: app.status || "NEW",
      appliedAt: app.createdAt,
      contactPerson: job.contactPerson,
    };
  });

  /* ── Empty State ── */

  if (appliedJobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-sm space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto">
            <Briefcase className="w-10 h-10 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              No Applications Yet
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              You haven&apos;t applied to any jobs yet. Browse available
              positions and apply with one tap to get started.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            <Briefcase className="w-4 h-4" />
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  /* ── Applications List ── */

  return (
    <div className="space-y-5">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-blue-600" />
            My Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {appliedJobs.length} job{appliedJobs.length !== 1 ? "s" : ""}{" "}
            applied
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Browse More
        </Link>
      </div>

      {/* Job Cards */}
      <div className="space-y-3">
        {appliedJobs.map((job, index) => {
          const jobId = job.id || job._id || `job-${index}`;
          const salary = formatSalary(job);

          return (
            <div
              key={jobId}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Top row: Title + Status */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {job.title || "Untitled Position"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-600 truncate">
                      {job.company || "Unknown Company"}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 capitalize ${statusColor(job.status || "applied")}`}
                >
                  {job.status?.replace(/_/g, " ") || "Applied"}
                </span>
              </div>

              {/* Details row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 text-[11px] text-slate-500 font-medium">
                {job.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {job.locality ? `${job.locality}, ` : ""}
                    {job.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  {salary}
                </span>
                {job.appliedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Applied {formatDate(job.appliedAt)}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Job
                  <ChevronRight className="w-3 h-3" />
                </Link>
                {job.contactPerson?.phone && (
                  <a
                    href={`tel:${job.contactPerson.phone}`}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    Call HR
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4 pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Browse more jobs
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
