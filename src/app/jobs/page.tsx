"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Job, Category } from "@/types";
import {
  useGetJobsQuery,
  useGetCategoriesQuery,
  useGetCitiesQuery,
} from "@/services/api/jobsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCity,
  setCategory,
  setSearchQuery,
  resetFilters,
} from "@/store/slices/filterSlice";
import {
  openCityModal,
  closeCityModal,
  openPostJobModal,
  closePostJobModal,
  openAuthModal,
  closeAuthModal,
  openDashboard,
  closeDashboard,
  setSelectedJobForHR,
} from "@/store/slices/uiSlice";
import { setUser, logout, loadUserFromStorage } from "@/store/slices/authSlice";

// Components
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { JobCard } from "@/components/home/JobCard";
import { CitySelectorModal } from "@/components/home/CitySelectorModal";
import { PostJobModal } from "@/features/employers/PostJobModal";
import { CandidateAuthModal } from "@/components/home/CandidateAuthModal";
import { UserDashboardDrawer } from "@/features/auth/UserDashboardDrawer";
import { DirectHRConnectModal } from "@/components/home/DirectHRConnectModal";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Icons
import {
  Search,
  MapPin,
  Briefcase,
  RotateCcw,
  Zap,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Filter,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";

type TabFilter = "all" | "urgent" | "high-salary" | "fresher" | "wfh";

export default function AllJobsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Load auth state from storage on mount
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const { selectedCity, selectedCategory, searchQuery } = useAppSelector(
    (state) => state.filter
  );
  const {
    isCityModalOpen,
    isPostJobModalOpen,
    isAuthModalOpen,
    isDashboardOpen,
    selectedJobForHR: jobForHR,
  } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  // Authentication check state
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [candidateAuthOpen, setCandidateAuthOpen] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);

  // Filters State
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [selectedExp, setSelectedExp] = useState<string>("All");
  const [selectedQual, setSelectedQual] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    setIsClientLoaded(true);
  }, []);

  // Determine if candidate has active session
  const isAuthenticated = Boolean(user && (user.phone || user.email));

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, selectedCategory, searchQuery, activeTab, selectedExp, selectedQual]);

  // Fetch API Data
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: cities = [] } = useGetCitiesQuery();
  const { data: jobsResponse, isLoading, isFetching } = useGetJobsQuery(
    {
      city: selectedCity,
      category: selectedCategory,
      query: searchQuery,
      page: currentPage,
      limit: PAGE_SIZE,
    },
    { skip: !isAuthenticated } // Don't fetch jobs if not authenticated
  );

  const jobsList: Job[] = Array.isArray(jobsResponse)
    ? jobsResponse
    : (jobsResponse as any)?.jobs || [];
  const totalJobs = (jobsResponse as any)?.total ?? jobsList.length;
  const totalPages = (jobsResponse as any)?.totalPages ?? (Math.ceil(totalJobs / PAGE_SIZE) || 1);

  const handleOpenJobPage = (job: Job) => {
    const jobId = job.id || (job as any)._id;
    router.push(`/job/${jobId}`);
  };

  const handleConnectHR = (job: Job, mode: "call" | "whatsapp") => {
    const jobId = job.id || (job as any)._id;
    if (!appliedJobs.some((j) => (j.id || (j as any)._id) === jobId)) {
      setAppliedJobs((prev) => [job, ...prev]);
    }
    dispatch(setSelectedJobForHR({ job, mode }));
  };

  // Client-side filtering for sub-tabs
  const displayedJobs = jobsList.filter((job) => {
    if (activeTab === "urgent" && !job.isUrgent) return false;
    if (activeTab === "high-salary" && job.salaryMax < 25000) return false;
    if (activeTab === "fresher" && job.experience !== "Fresher") return false;
    if (activeTab === "wfh" && job.jobType !== "Work From Home") return false;

    if (selectedExp !== "All" && job.experience !== selectedExp) return false;
    if (selectedQual !== "All" && job.qualification !== selectedQual) return false;

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600 selection:text-white">
      {/* 1. Header Navigation */}
      <Navbar
        selectedCity={selectedCity}
        onOpenCityModal={() => dispatch(openCityModal())}
        onOpenPostJobModal={() => dispatch(openPostJobModal())}
        onOpenAuthModal={() => setCandidateAuthOpen(true)}
        onOpenDashboard={() => dispatch(openDashboard())}
        user={user}
        appliedCount={appliedJobs.length}
      />

      <main className="flex-1">
        {/* Banner Section */}
        <section className="bg-gradient-to-r from-[#033177] via-[#054988] to-[#008f88] text-white py-10 sm:py-14 relative overflow-hidden">
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full border border-blue-400/20 pointer-events-none" />
          <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-white/15 mb-3">
              <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>Direct HR Connect • 0% Consultancy Fees • 100% Free</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              All Verified Job Openings in India
            </h1>
            <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
              Find direct recruiter openings, view transparent salaries, and apply or call HR directly.
            </p>
          </div>
        </section>

        {/* ─── GATED VIEW: Candidate Login Required ─── */}
        {isClientLoaded && !isAuthenticated ? (
          <section className="py-16 px-4">
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5 border border-blue-100">
                <Lock className="w-8 h-8 stroke-[2.2]" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-3">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Candidate Login Required
              </span>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Sign In to Access All Verified Jobs
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-md mx-auto">
                To protect candidates and prevent fake applications, job listings and direct HR contact details require a free verified candidate login.
              </p>

              {/* Free Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-6 text-left">
                {[
                  "100% Free for all candidates",
                  "Direct HR Phone & WhatsApp",
                  "Zero Consultancy / Hidden Fees",
                  "Instant 1-Click Applications",
                ].map((perk) => (
                  <div key={perk} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => setCandidateAuthOpen(true)}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Sign In / Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-[11px] text-slate-400">
                  Takes less than 30 seconds • WhatsApp OTP or Email &amp; Password
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* ─── UNLOCKED VIEW: Full Job Catalog ─── */
          <section className="py-8 sm:py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              {/* Search & Location Bar */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Search Query */}
                  <div className="md:col-span-5 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search job title, skills, or company..."
                      value={searchQuery}
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                      className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  {/* City Selector Button */}
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      onClick={() => dispatch(openCityModal())}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 transition"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="truncate">{selectedCity ? (selectedCity.toLowerCase() === "surat" ? "Surat, Gujarat" : selectedCity) : "Surat, Gujarat"}</span>
                      </span>
                      <span className="text-[10px] text-blue-600 uppercase font-bold shrink-0">Change</span>
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="md:col-span-3">
                    <select
                      value={selectedCategory}
                      onChange={(e) => dispatch(setCategory(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">All Categories ({categories.length})</option>
                      {categories.map((c) => (
                        <option key={c.id || (c as any)._id} value={c.id || (c as any)._id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reset Filters */}
                  <div className="md:col-span-1 flex justify-center">
                    {(searchQuery || selectedCategory || selectedCity) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          dispatch(resetFilters());
                          setActiveTab("all");
                          setSelectedExp("All");
                          setSelectedQual("All");
                        }}
                        className="h-11 px-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl w-full"
                        title="Reset Filters"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-Filters Tabs Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm mb-6">
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "all", label: "All Jobs" },
                    { id: "urgent", label: "⚡ Urgent Hiring" },
                    { id: "high-salary", label: "💰 ₹25K+ Salary" },
                    { id: "fresher", label: "🎓 Freshers Welcome" },
                    { id: "wfh", label: "🏠 Work From Home" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabFilter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Experience & Education Dropdowns */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedExp}
                    onChange={(e) => setSelectedExp(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="All">Experience: All</option>
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 Years">0-1 Years</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3+ Years">3+ Years</option>
                  </select>

                  <select
                    value={selectedQual}
                    onChange={(e) => setSelectedQual(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="All">Education: All</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  Showing <strong className="text-slate-900">{displayedJobs.length}</strong> verified openings
                  {selectedCity ? (selectedCity.toLowerCase() === "surat" ? " in Surat, Gujarat" : ` in ${selectedCity}`) : " in Surat, Gujarat"}
                </p>
                {isLoading && (
                  <span className="text-xs text-blue-600 font-semibold animate-pulse">
                    Refreshing live jobs...
                  </span>
                )}
              </div>

              {/* Jobs Grid */}
              {displayedJobs.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {displayedJobs.map((job, idx) => (
                      <JobCard
                        key={job.id || (job as any)._id || `job-${idx}`}
                        job={job}
                        onViewDetails={handleOpenJobPage}
                        onConnectHR={handleConnectHR}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalJobs}
                        pageSize={PAGE_SIZE}
                        onPageChange={(page) => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No jobs match your filters</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try resetting your search query or selecting a different city or category.
                  </p>
                  <div className="mt-5 flex justify-center">
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => {
                        dispatch(resetFilters());
                        setActiveTab("all");
                        setSelectedExp("All");
                        setSelectedQual("All");
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
        )}
      </main>

      {/* Global Modals */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => dispatch(closeCityModal())}
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          dispatch(setCity(city));
          dispatch(closeCityModal());
        }}
      />

      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => dispatch(closePostJobModal())}
        categories={categories}
        cities={cities}
        onJobCreated={() => {}}
      />

      <CandidateAuthModal
        isOpen={candidateAuthOpen || isAuthModalOpen}
        onClose={() => {
          setCandidateAuthOpen(false);
          dispatch(closeAuthModal());
        }}
        onLoginSuccess={(loggedUser) => {
          setCandidateAuthOpen(false);
          dispatch(closeAuthModal());
          dispatch(setUser(loggedUser));
        }}
      />

      <UserDashboardDrawer
        isOpen={isDashboardOpen}
        onClose={() => dispatch(closeDashboard())}
        user={user}
        onLogout={() => {
          dispatch(logout());
          dispatch(closeDashboard());
        }}
        appliedJobs={appliedJobs}
        onViewJob={handleOpenJobPage}
        onProfileUpdated={(u) => dispatch(setUser(u))}
      />

      {jobForHR && (
        <DirectHRConnectModal
          isOpen={Boolean(jobForHR)}
          onClose={() => dispatch(setSelectedJobForHR(null))}
          job={jobForHR.job}
          mode={jobForHR.mode}
        />
      )}

      {/* Footer */}
      <Footer
        onSelectCity={(city) => dispatch(setCity(city))}
        onSelectCategory={(catId) => dispatch(setCategory(catId))}
      />
    </div>
  );
}
