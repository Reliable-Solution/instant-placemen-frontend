"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Job, Category } from "@/types";
import { JobCard } from "./JobCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  RotateCcw,
  Zap,
  MapPin,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

interface JobListingsProps {
  jobs: Job[];
  totalJobs: number;
  selectedCity: string;
  selectedCategory: string;
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onViewDetails: (job: Job) => void;
  onConnectHR: (job: Job, mode: "call" | "whatsapp") => void;
  onResetFilters: () => void;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  showViewAllButton?: boolean;
}

type TabFilter = "all" | "urgent" | "high-salary" | "fresher" | "wfh";

export const JobListings: React.FC<JobListingsProps> = ({
  jobs,
  totalJobs,
  selectedCity,
  selectedCategory,
  categories,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onViewDetails,
  onConnectHR,
  onResetFilters,
  currentPage,
  totalPages,
  pageSize = 9,
  onPageChange,
  showViewAllButton = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [selectedExp, setSelectedExp] = useState<string>("All");
  const [selectedQual, setSelectedQual] = useState<string>("All");

  const displayedJobs = jobs.filter((job) => {
    if (activeTab === "urgent" && !job.isUrgent) return false;
    if (activeTab === "high-salary" && job.salaryMax < 25000) return false;
    if (activeTab === "fresher" && job.experience !== "Fresher") return false;
    if (activeTab === "wfh" && job.jobType !== "Work From Home") return false;

    if (selectedExp !== "All" && job.experience !== selectedExp) return false;
    if (selectedQual !== "All" && job.qualification !== selectedQual) return false;

    return true;
  });

  const activeCategoryTitle = categories.find((c) => c.id === selectedCategory)?.title;

  return (
    <section id="jobs-section" className="py-12 bg-slate-50 border-t border-b border-slate-200/80">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Live & Direct Openings
              </span>
              <Badge variant="outline" className="bg-white text-slate-700 font-semibold text-xs">
                <MapPin className="w-3 h-3 text-rose-500 mr-1" /> {selectedCity}
              </Badge>
              {activeCategoryTitle && (
                <Badge variant="default" className="bg-blue-600 text-xs">
                  {activeCategoryTitle}
                </Badge>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Verified Jobs with Direct Recruiter Contact
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Showing <strong>{displayedJobs.length}</strong> available openings in {selectedCity}
            </p>
          </div>

          {/* Inline Quick Search */}
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Filter by title, skill, company..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 bg-white border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Quick Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              All Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab("urgent")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === "urgent"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Urgent Hiring
            </button>
            <button
              onClick={() => setActiveTab("high-salary")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "high-salary"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              💰 ₹25K+ Salary
            </button>
            <button
              onClick={() => setActiveTab("fresher")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "fresher"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🎓 Freshers Welcome
            </button>
            <button
              onClick={() => setActiveTab("wfh")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "wfh"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🏠 Work From Home
            </button>
          </div>

          {/* Dropdown filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value)}
              className="text-xs h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">Experience: All</option>
              <option value="Fresher">Fresher</option>
              <option value="0-1 Years">0-1 Years</option>
              <option value="1-3 Years">1-3 Years</option>
            </select>

            <select
              value={selectedQual}
              onChange={(e) => setSelectedQual(e.target.value)}
              className="text-xs h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">Education: All</option>
              <option value="10th Pass">10th Pass</option>
              <option value="12th Pass">12th Pass</option>
              <option value="Graduate">Graduate</option>
            </select>

            {(searchQuery || selectedCategory || activeTab !== "all" || selectedExp !== "All" || selectedQual !== "All") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveTab("all");
                  setSelectedExp("All");
                  setSelectedQual("All");
                  onResetFilters();
                }}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-9 px-2 gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Jobs Grid */}
        {displayedJobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {displayedJobs.map((job, idx) => (
                <JobCard
                  key={job.id || (job as any)._id || `job-${idx}`}
                  job={job}
                  onViewDetails={onViewDetails}
                  onConnectHR={onConnectHR}
                />
              ))}
            </div>


            {/* View All Openings CTA (for Home Page) */}
            {showViewAllButton && (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/jobs"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5"
                >
                  {/* <Briefcase className="w-4 h-4" /> */}
                  <span>View All Verified Openings</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            )}

            {/* Pagination Controls */}
            {!showViewAllButton && totalPages && totalPages > 1 && onPageChange && currentPage && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalJobs}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No matching jobs found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn&apos;t find any openings matching your exact filters in {selectedCity}. Try resetting your search or exploring nearby locations.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  setActiveTab("all");
                  setSelectedExp("All");
                  setSelectedQual("All");
                  onResetFilters();
                }}
                className="gap-1.5 font-bold"
              >
                <RotateCcw className="w-4 h-4" /> Reset All Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
