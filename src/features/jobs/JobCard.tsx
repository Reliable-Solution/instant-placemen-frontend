"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Job } from "@/types";
import { formatSalary, timeAgo } from "@/lib/utils";
import { isJobSaved, toggleSaveJob } from "@/lib/savedJobs";
import {
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  Clock,
  ShieldCheck,
  Zap,
  ChevronRight,
  Sparkles,
  Bookmark,
} from "lucide-react";

interface JobCardProps {
  job: Job;
  onViewDetails?: (job: Job) => void;
  onConnectHR?: (job: Job, mode: "call" | "whatsapp") => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onViewDetails,
  onConnectHR,
}) => {
  const targetId = String(job.id || (job as any)._id);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isJobSaved(targetId));

    const handleSavedChange = () => {
      setSaved(isJobSaved(targetId));
    };

    window.addEventListener("ip_saved_jobs_changed", handleSavedChange);
    return () => window.removeEventListener("ip_saved_jobs_changed", handleSavedChange);
  }, [targetId]);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowSaved = toggleSaveJob(job);
    setSaved(isNowSaved);
  };

  const postedDate = job.postedAt || (job as any).createdAt;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xl transition-all duration-200 p-5 flex flex-col justify-between h-full group relative">
      <div>
        {/* 1. Top Badges & Posted Time */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {job.isVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified Recruiter</span>
              </span>
            )}
            {job.isUrgent && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full shrink-0">
                <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>Urgent Hiring</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap shrink-0">
            {postedDate ? timeAgo(postedDate) : "Recently"}
          </span>
        </div>

        {/* 2. Company Logo & Job Title */}
        <div className="flex items-start gap-3 mb-2.5">
          <Link
            href={`/job/${targetId}`}
            className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs group-hover:border-blue-300 transition-colors"
          >
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-base">
                {job.company ? job.company.charAt(0).toUpperCase() : "C"}
              </div>
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              href={`/job/${targetId}`}
              className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 block"
              title={job.title}
            >
              {job.title}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-semibold truncate">
              <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{job.company}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">
                {job.locality}, <strong className="text-slate-700 font-semibold">{job.city}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Salary & Vacancies Box (Prevent text-squishing) */}
        <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100/90 rounded-xl p-3 my-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Monthly In-Hand Salary
            </span>
            {job.vacancies && job.vacancies > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                {job.vacancies} {job.vacancies === 1 ? "Opening" : "Openings"}
              </span>
            )}
          </div>
          <div className="text-base sm:text-lg font-black text-blue-900 tracking-tight leading-snug">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
          </div>
        </div>

        {/* 4. Meta Tags: Experience, Qualification, Job Type */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-semibold">
            <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{job.experience || "Fresher"}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-semibold">
            <GraduationCap className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{job.qualification || "12th Pass"}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-semibold">
            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{job.jobType || "Full Time"}</span>
          </span>
        </div>

        {/* 5. Perks Snippet (if available) */}
        {job.perks && job.perks.length > 0 && (
          <div className="mb-3 pt-1 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              Perks: <strong className="text-slate-700 font-semibold">{job.perks.slice(0, 2).join(", ")}</strong>
            </span>
          </div>
        )}
      </div>

      {/* 6. Action CTA Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-auto">
        <Link
          href={`/job/${targetId}`}
          className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md active:scale-[0.99] px-3 whitespace-nowrap"
        >
          <Briefcase className="w-3.5 h-3.5 shrink-0" />
          <span>View Details & Apply</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
        <button
          type="button"
          onClick={handleBookmarkToggle}
          className={`h-10 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            saved
              ? "bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100 shadow-2xs"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title={saved ? "Remove from Saved Jobs" : "Save this Job"}
          aria-label={saved ? "Remove from Saved Jobs" : "Save this Job"}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-amber-400 text-amber-500" : "text-slate-500"}`} />
          <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
        </button>
      </div>
    </div>
  );
};
