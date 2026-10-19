"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetEmployerApplicantsQuery,
  useGetEmployerJobsQuery,
} from "@/services/api/employerApi";
import {
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  MessageCircle,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Check,
  Zap,
  ArrowRight,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";

export default function EmployerCandidateSearchPage() {
  const [jobFilter, setJobFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expFilter, setExpFilter] = useState("ALL");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  const { data: jobs = [] } = useGetEmployerJobsQuery();
  const { data: applicants = [], isLoading, isFetching, refetch } = useGetEmployerApplicantsQuery({
    jobId: jobFilter !== "ALL" ? jobFilter : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const applicantList = Array.isArray(applicants) ? applicants : (applicants as any).data || [];
  const totalApplicants = (applicants as any).total ?? applicantList.length;
  const totalPages = (applicants as any).totalPages ?? 1;

  const openWhatsApp = (phone: string, name: string, jobTitle: string) => {
    const clean = phone.replace(/\D/g, "");
    const formatted = clean.length === 10 ? `91${clean}` : clean;
    const text = encodeURIComponent(
      `Hi ${name}, we saw your profile on Instant Placement for the ${jobTitle} role. We'd like to schedule an interview with you. Please share your availability.`
    );
    window.open(`https://wa.me/${formatted}?text=${text}`, "_blank");
  };

  // Filter candidates locally
  const filteredCandidates = applicantList.filter((app: any) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.candidateName?.toLowerCase().includes(q);
      const matchSkill = (app.skills || []).some((s: string) => s.toLowerCase().includes(q));
      if (!matchName && !matchSkill) return false;
    }
    if (expFilter !== "ALL") {
      if (expFilter === "Fresher" && !app.experience?.toLowerCase().includes("fresher")) return false;
      if (expFilter === "Experienced" && app.experience?.toLowerCase().includes("fresher")) return false;
    }
    if (verifiedOnly && !app.commuteConfirmed) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner - 100% Plan Based */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-white/10 overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Plan-Based Talent Sourcing (No Per-Unlock Fees)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Active Candidate Database</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Source pre-screened jobseekers with verified commute. Full contact details are unlocked via your active Hiring Plan tier (Module 1, 2, or 3).
          </p>
        </div>

        {/* Plan Status Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center justify-between gap-4 shrink-0 shadow-lg w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-300 block font-medium">Recruitment Tiers</span>
              <span className="text-sm font-black text-white whitespace-nowrap">Module 1 / 2 / 3</span>
            </div>
          </div>
          <Link href="/employer/plans">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs whitespace-nowrap"
            >
              View Plans
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <Input
              placeholder="Search candidate name or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* Role Filter */}
          <select
            value={jobFilter}
            onChange={(e) => {
              setJobFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-3 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Associated Jobs ({jobs.length})</option>
            {jobs.map((j: any) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.city})
              </option>
            ))}
          </select>

          {/* Experience Filter */}
          <select
            value={expFilter}
            onChange={(e) => setExpFilter(e.target.value)}
            className="w-full h-10 pl-3 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Experience Levels</option>
            <option value="Fresher">Freshers (0 Yrs)</option>
            <option value="Experienced">Experienced Candidates</option>
          </select>

          {/* Commute Verified Checkbox */}
          <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-bold text-slate-700">Commute Verified Only</span>
          </label>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {isLoading || isFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse h-64" />
          ))}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <Users className="w-7 h-7 text-slate-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">No candidate matches found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Try adjusting your search criteria or switch to "All Associated Jobs".
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map((app: any) => {
            // Server pre-masks contacts without a paid plan (contactMasked flag).
            const isContactUnlocked = app.contactMasked === false;
            const rawPhone: string = app.candidatePhone || app.phone || "";
            const maskedPhone = rawPhone || "+91 ••••••••••";
            const displayPhone = isContactUnlocked ? "+91 " + rawPhone : maskedPhone;

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl p-5 flex flex-col justify-between gap-4 hover:shadow-lg transition-all shadow-xs relative overflow-hidden group"
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold border border-indigo-200">
                      94% Match
                    </span>
                    {app.commuteConfirmed && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Commute Verified</span>
                      </span>
                    )}
                  </div>
                  <Badge
                    className={`text-xs ${
                      app.status === "SELECTED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : app.status === "REJECTED"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {app.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                {/* Candidate Info */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black flex items-center justify-center text-base shadow-sm shrink-0">
                    {app.candidateName?.charAt(0) || "C"}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {app.candidateName}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{app.candidateCity || "Surat"}</span>
                      {app.commuteLocation && (
                        <span className="text-slate-500 truncate">({app.commuteLocation})</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Role and Qualifications */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{app.job?.title || "Job Mandate"}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-slate-500" />
                      <span>{app.qualification || "12th Pass"}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      {app.experience || "Fresher"}
                    </span>
                  </div>
                </div>

                {/* Contact & Plan-Based Access Footer */}
                <div className="pt-3 border-t border-slate-100">
                  {isContactUnlocked ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-700">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hiring Plan Active</span>
                        </span>
                        <span>{displayPhone}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          onClick={() => openWhatsApp(rawPhone, app.candidateName, app.job?.title || "our role")}
                          className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 rounded-xl shadow-xs font-bold"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </Button>
                        <a href={`tel:${rawPhone}`} className="block">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-9 border-slate-200 hover:bg-slate-50 text-slate-700 text-xs gap-1.5 rounded-xl font-bold"
                          >
                            <Phone className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Call</span>
                          </Button>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-500" />
                          <span>Contact Masked</span>
                        </span>
                        <span>{maskedPhone}</span>
                      </div>
                      <Link
                        href="/employer/plans"
                        className="w-full h-9 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs gap-1.5 rounded-xl shadow-xs inline-flex items-center justify-center"
                      >
                        <Lock className="w-3 h-3 text-amber-300" />
                        <span>Activate Hiring Plan to Unlock</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalApplicants}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
        />
      )}

    </div>
  );
}
