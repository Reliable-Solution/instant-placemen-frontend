"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Job } from "@/types";
import { formatSalary, timeAgo } from "@/lib/utils";
import { isJobSaved, toggleSaveJob } from "@/lib/savedJobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  Clock,
  Phone,
  MessageCircle,
  ShieldCheck,
  Zap,
  ChevronRight,
  Sparkles,
  Bookmark,
} from "lucide-react";

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
  onConnectHR: (job: Job, mode: "call" | "whatsapp") => void;
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
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-card hover:shadow-card-hover transition-all duration-200 p-5 flex flex-col justify-between group">
      {/* Top Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {job.isVerified && (
            <Badge variant="verified" className="gap-1 py-0.5 text-[11px]">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Recruiter
            </Badge>
          )}
          {job.isUrgent && (
            <Badge variant="urgent" className="gap-1 py-0.5 text-[11px]">
              <Zap className="w-3 h-3 fill-current" /> Urgent Hiring
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            {job.postedAt ? timeAgo(job.postedAt) : ""}
          </span>
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`p-1.5 rounded-lg border transition-all ${
              saved
                ? "bg-amber-50 border-amber-300 text-amber-500 shadow-2xs hover:bg-amber-100"
                : "bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-100"
            }`}
            title={saved ? "Remove from Saved Jobs" : "Save this Job"}
            aria-label={saved ? "Remove from Saved Jobs" : "Save this Job"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-amber-400 text-amber-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <Link
            href={`/job/${job.id || (job as any)._id}`}
            className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 block"
          >
            {job.title}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-semibold">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">
              {job.locality}, <strong className="text-slate-700">{job.city}</strong>
            </span>
          </div>
        </div>

        {/* Logo */}
        <Link
          href={`/job/${job.id || (job as any)._id}`}
          className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm"
        >
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-full h-full object-contain p-1"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-lg">
              {job.company.charAt(0)}
            </div>
          )}
        </Link>
      </div>

      {/* Salary Badge */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl px-3.5 py-2 mb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Monthly In-Hand Salary
          </span>
          <span className="text-base sm:text-lg font-extrabold text-blue-900">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            {job.vacancies} Openings
          </span>
        </div>
      </div>

      {/* Meta Specs */}
      <div className="flex flex-wrap gap-1.5 mb-3.5 text-xs">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
          <Briefcase className="w-3 h-3 text-slate-500" />
          {job.experience}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
          <GraduationCap className="w-3 h-3 text-slate-500" />
          {job.qualification}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
          <Clock className="w-3 h-3 text-slate-500" />
          {job.jobType}
        </span>
      </div>

      {/* Perks snippet */}
      {job.perks && job.perks.length > 0 && (
        <div className="mb-4 pt-1 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">
            Perks: <strong className="text-slate-700">{job.perks?.slice(0, 2).join(", ")}</strong>
          </span>
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        <Link
          href={`/job/${job.id || (job as any)._id}`}
          className="flex-1 py-2.5 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Apply on Job Page</span>
          <ChevronRight className="w-3.5 h-3.5 ml-auto" />
        </Link>
        <button
          type="button"
          onClick={handleBookmarkToggle}
          className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            saved
              ? "bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title={saved ? "Remove from Saved Jobs" : "Save this Job"}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-amber-400 text-amber-500" : "text-slate-400"}`} />
          <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
        </button>
      </div>
    </div>
  );
};
