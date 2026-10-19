"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  Building,
  MapPin,
  Briefcase,
  Trash2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getSavedJobs, removeSavedJob } from "@/lib/savedJobs";

interface SavedJob {
  id: string;
  title: string;
  company: string;
  city: string;
  locality?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  matchScore?: number;
  savedAt: string;
  isUrgent?: boolean;
}

export default function CandidateSavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved jobs from localStorage
    try {
      const stored = localStorage.getItem("ip_saved_jobs");
      if (stored !== null) {
        setSavedJobs(JSON.parse(stored));
      } else {
        // Mock sample initial saved jobs to showcase UX immediately
        const initialMock: SavedJob[] = [
          {
            id: "job-1",
            title: "Telecaller — Hindi & Gujarati",
            company: "Shree Balaji Textiles",
            city: "Surat",
            locality: "Ring Road",
            salary: "₹18,000 - ₹22,000/mo",
            matchScore: 92,
            savedAt: "Saved 2 days ago",
            isUrgent: true,
          },
          {
            id: "job-2",
            title: "Customer Support Executive (Voice)",
            company: "Axis BPO Solutions",
            city: "Surat",
            locality: "Adajan",
            salary: "₹20,000 - ₹24,000/mo",
            matchScore: 89,
            savedAt: "Saved 4 days ago",
          },
          {
            id: "job-3",
            title: "Field Sales Executive",
            company: "Reliance Retail Mandate",
            city: "Surat",
            locality: "Varachha",
            salary: "₹25,000/mo + Incentives",
            matchScore: 85,
            savedAt: "Saved 1 week ago",
            isUrgent: true,
          },
        ];
        setSavedJobs(initialMock);
        localStorage.setItem("ip_saved_jobs", JSON.stringify(initialMock));
      }
    } catch (e) {
      console.error("Failed to load saved jobs", e);
    } finally {
      setIsLoading(false);
    }

    const handleSavedChange = () => {
      setSavedJobs(getSavedJobs() as any);
    };

    window.addEventListener("ip_saved_jobs_changed", handleSavedChange);
    return () => window.removeEventListener("ip_saved_jobs_changed", handleSavedChange);
  }, []);

  const handleRemove = (jobId: string) => {
    removeSavedJob(jobId);
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Bookmark className="w-5 h-5 fill-indigo-100 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Saved Jobs · {savedJobs.length}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Review and apply to positions you've bookmarked for later
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors self-start sm:self-auto"
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse More Jobs</span>
        </Link>
      </div>

      {/* Empty State */}
      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">No Saved Jobs Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Tap the bookmark icon on any job card while browsing to save it here for fast application.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Explore Jobs in Surat</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Saved Jobs Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
            >
              <div>
                {/* Top Row: Match Pill + Remove Action */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {job.matchScore && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        {job.matchScore}% match
                      </span>
                    )}
                    {job.isUrgent && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <Zap className="w-3 h-3 text-amber-600" />
                        Urgent
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(job.id)}
                    title="Remove from saved"
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title & Company */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 font-black text-sm sm:text-base flex items-center justify-center shrink-0 border border-indigo-200/70 shadow-2xs">
                    {job.company.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {job.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold truncate mt-0.5">
                      {job.company}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{job.locality ? `${job.locality}, ` : ""}{job.city}</span>
                    </p>
                  </div>
                </div>

                {/* Salary Info (Stacked to prevent squishing/truncation on tablet/mobile) */}
                <div className="p-3 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-xl border border-slate-200/80 mb-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 tracking-wider">
                      Offered Salary
                    </span>
                    {job.savedAt && (
                      <span className="text-[11px] text-slate-500 font-medium shrink-0">
                        {job.savedAt}
                      </span>
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    {job.salary || "₹18,000 - ₹22,000/mo"}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Link
                  href={`/job/${job.id}`}
                  className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/job/${job.id}`}
                  className="h-10 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-[0.99] rounded-xl transition-colors border border-slate-200 flex items-center justify-center"
                  title="View details"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
