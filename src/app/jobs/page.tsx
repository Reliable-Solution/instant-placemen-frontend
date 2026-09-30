"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Job, Category } from "@/types";
import {
  useGetJobsQuery,
  useGetJobFacetsQuery,
  useGetCategoriesQuery,
  useGetCitiesQuery,
  GetJobsQueryParams,
  FacetBucket,
} from "@/services/api/jobsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCity,
  setCategory,
  setSearchQuery,
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
import { JobCard } from "@/features/jobs/JobCard";
import { CitySelectorModal } from "@/components/home/CitySelectorModal";
import { PostJobModal } from "@/features/employers/PostJobModal";
import { CandidateAuthModal } from "@/features/auth/CandidateAuthModal";
import { UserDashboardDrawer } from "@/features/auth/UserDashboardDrawer";
import { DirectHRConnectModal } from "@/features/interviews/DirectHRConnectModal";
import { FilterSidebar, FilterSection, FilterOption } from "@/features/jobs/FilterSidebar";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Icons
import {
  Search,
  Briefcase,
  RotateCcw,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";

// Fixed option lists for the two facets whose labels live in the frontend.
const SALARY_BAND_OPTIONS: FilterOption[] = [
  { value: "0-15000", label: "Below ₹15,000", count: 0 },
  { value: "15000-25000", label: "₹15,000 - ₹25,000", count: 0 },
  { value: "25000-40000", label: "₹25,000 - ₹40,000", count: 0 },
  { value: "40000+", label: "₹40,000 & above", count: 0 },
];

const FRESHNESS_OPTIONS: FilterOption[] = [
  { value: "1d", label: "Last 24 hours", count: 0 },
  { value: "7d", label: "Last 7 days", count: 0 },
  { value: "30d", label: "Last 30 days", count: 0 },
  { value: "older", label: "Older than 30 days", count: 0 },
];

// Location values that mean "no restriction" and therefore are not an active filter.
const ALL_CITY_VALUES = ["All India", "All Cities (India)", "All Cities", "All"];

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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters State — sidebar groups live here; pagination is entirely server-side
  const [multiFilters, setMultiFilters] = useState<Record<string, string[]>>({
    experience: [],
    qualification: [],
    salaryBand: [],
    jobType: [],
    workMode: [],
    freshness: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    setIsClientLoaded(true);
  }, []);

  // Determine if candidate has active session
  const isAuthenticated = Boolean(user && (user.phone || user.email));

  // Any visitor who is not signed in gets the login / signup popup.
  useEffect(() => {
    if (isClientLoaded && !isAuthenticated) {
      setCandidateAuthOpen(true);
    }
  }, [isClientLoaded, isAuthenticated]);

  // One payload drives both the job list and the sidebar facet counts, so the
  // numbers in the filter panel always describe the query you are looking at.
  const filterParams: Omit<GetJobsQueryParams, "page" | "limit"> = {
    city: selectedCity,
    category: selectedCategory,
    query: searchQuery.trim().slice(0, 100),
    experience: multiFilters.experience.join(","),
    qualification: multiFilters.qualification.join(","),
    salaryBand: multiFilters.salaryBand.join(","),
    jobType: multiFilters.jobType.join(","),
    workMode: multiFilters.workMode.join(","),
    freshness: multiFilters.freshness.join(","),
  };
  const filterKey = JSON.stringify(filterParams);

  // Back to page 1 whenever any filter changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKey]);

  // Fetch API Data
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: cities = [] } = useGetCitiesQuery();

  const { data: jobsResponse, isLoading } = useGetJobsQuery(
    { ...filterParams, page: currentPage, limit: PAGE_SIZE },
    { skip: !isAuthenticated } // Don't fetch jobs if not authenticated
  );
  const { data: facetsResponse } = useGetJobFacetsQuery(filterParams, { skip: !isAuthenticated });

  const jobsList: Job[] = Array.isArray(jobsResponse)
    ? jobsResponse
    : (jobsResponse as any)?.jobs || [];
  const totalJobs = (jobsResponse as any)?.total ?? jobsList.length;
  const totalPages = (jobsResponse as any)?.totalPages ?? (Math.ceil(totalJobs / PAGE_SIZE) || 1);

  // Server has already applied every filter — render the page as returned.
  const displayedJobs = jobsList;

  // "Showing 13–24 of 147" range, driven by the real server-side total.
  const rangeStart = totalJobs === 0 ? 0 : Math.min((currentPage - 1) * PAGE_SIZE + 1, totalJobs);
  const rangeEnd = totalJobs === 0 ? 0 : rangeStart + displayedJobs.length - 1;

  // -----------------------------------------------------------------------
  // Left-hand filter sidebar: sections + counts, merged with the fixed
  // option lists that come from the categories / cities collections.
  // -----------------------------------------------------------------------
  const facets = facetsResponse?.facets;
  const facetTotal = facetsResponse?.total ?? totalJobs;

  const countIn = (bucket: FacetBucket[] | undefined, value: string) =>
    bucket?.find((entry) => entry.value === value)?.count ?? 0;

  // Cities come from the cities collection; counts come from the live data.
  // A job stored as "Surat Gujarat" folds into the "Surat" entry rather than
  // showing up as a second, near-identical option.
  const cityNames = cities.map((city) => city.name);
  const cityBuckets = facets?.city || [];
  const foldsInto = (value: string, name: string) => value === name || value.startsWith(`${name} `);
  const cityCount = (name: string) =>
    cityBuckets
      .filter((bucket) => foldsInto(bucket.value, name))
      .reduce((sum, bucket) => sum + bucket.count, 0);
  const cityValues = Array.from(
    new Set([
      ...cityNames,
      ...cityBuckets
        .map((bucket) => bucket.value)
        .filter((value) => !cityNames.some((name) => foldsInto(value, name))),
    ])
  );
  const cityLabel = (name: string) =>
    name.toLowerCase() === "surat" ? "Surat, Gujarat" : name;

  const categoryValues = Array.from(
    new Set([
      ...categories.map((category) => category.id),
      ...(facets?.category || []).map((b) => b.value),
    ])
  );
  const categoryLabel = (id: string) =>
    categories.find((category) => category.id === id)?.title ?? id;

  // Options whose values come straight from the data, biggest count first.
  const bucketOptions = (bucket: FacetBucket[] | undefined): FilterOption[] =>
    (bucket || [])
      .map((entry) => ({ value: entry.value, label: entry.value, count: entry.count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  // A ticked option must stay visible even if another filter drops it to zero.
  const keepSelected = (options: FilterOption[], group: string): FilterOption[] => {
    const selectedValues = multiFilters[group] || [];
    const missing = selectedValues
      .filter((value) => !options.some((option) => option.value === value))
      .map((value) => ({ value, label: value, count: 0 }));
    return [...options, ...missing];
  };

  const sections: FilterSection[] = [
    {
      key: "city",
      title: "Location",
      type: "single",
      options: [
        { value: "All India", label: "All India (Anywhere)", count: facetTotal },
        ...cityValues.map((name) => ({
          value: name,
          label: cityLabel(name),
          count: cityCount(name),
        })),
      ],
    },
    {
      key: "category",
      title: "Department",
      type: "single",
      options: [
        { value: "", label: "All Departments", count: facetTotal },
        ...categoryValues.map((id) => ({
          value: id,
          label: categoryLabel(id),
          count: countIn(facets?.category, id),
        })),
      ],
    },
    {
      key: "experience",
      title: "Experience",
      type: "multi",
      options: keepSelected(bucketOptions(facets?.experience), "experience"),
    },
    {
      key: "qualification",
      title: "Education",
      type: "multi",
      options: keepSelected(bucketOptions(facets?.qualification), "qualification"),
    },
    {
      key: "salaryBand",
      title: "Salary (Monthly)",
      type: "multi",
      options: SALARY_BAND_OPTIONS.map((option) => ({
        ...option,
        count: countIn(facets?.salaryBand, option.value),
      })),
    },
    {
      key: "jobType",
      title: "Job Type",
      type: "multi",
      options: keepSelected(bucketOptions(facets?.jobType), "jobType"),
    },
    {
      key: "workMode",
      title: "Work Mode",
      type: "multi",
      options: keepSelected(bucketOptions(facets?.workMode), "workMode"),
    },
    {
      key: "freshness",
      title: "Freshness",
      type: "multi",
      options: FRESHNESS_OPTIONS.map((option) => ({
        ...option,
        count: countIn(facets?.freshness, option.value),
      })),
    },
  ];

  const selectedMap: Record<string, string[]> = {
    ...multiFilters,
    city: selectedCity ? [selectedCity] : [],
    category: selectedCategory ? [selectedCategory] : [],
  };

  const activeCount =
    (selectedCity && !ALL_CITY_VALUES.includes(selectedCity) ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    Object.values(multiFilters).reduce((total, values) => total + values.length, 0);

  const handleToggle = (key: string, value: string) => {
    if (key === "city") {
      dispatch(setCity(value || "All India"));
      return;
    }
    if (key === "category") {
      dispatch(setCategory(value));
      return;
    }
    setMultiFilters((prev) => {
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((entry) => entry !== value)
          : [...current, value],
      };
    });
  };

  const handleClearSection = (key: string) => {
    if (key === "city") {
      dispatch(setCity("All India"));
      return;
    }
    if (key === "category") {
      dispatch(setCategory(""));
      return;
    }
    setMultiFilters((prev) => ({ ...prev, [key]: [] }));
  };

  const handleClearAll = () => {
    dispatch(setCity("All India"));
    dispatch(setCategory(""));
    dispatch(setSearchQuery(""));
    setMultiFilters({
      experience: [],
      qualification: [],
      salaryBand: [],
      jobType: [],
      workMode: [],
      freshness: [],
    });
  };

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

          <div className="max-w-[1440px] 2xl:max-w-[1520px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14 relative z-10 text-center">
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

        {/* ─── GATED VIEW: compact sign-in prompt (full flow runs in the popup) ─── */}
        {isClientLoaded && !isAuthenticated ? (
          <section className="py-16 px-4">
            <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Lock className="w-7 h-7 stroke-[2.2]" />
              </div>

              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Sign in to view verified jobs
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-sm mx-auto">
                A free candidate account unlocks live job listings, direct HR contacts and 1-click applications.
              </p>

              <div className="mt-5 space-y-2.5">
                <Button
                  onClick={() => setCandidateAuthOpen(true)}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Sign In / Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-xs text-slate-500">
                  Takes less than 30 seconds • WhatsApp OTP or Email &amp; Password
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* ─── UNLOCKED VIEW: Full Job Catalog ─── */
          <section className="py-8 sm:py-12">
            <div className="max-w-[1440px] 2xl:max-w-[1520px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
              {/* ─── Left: filter sidebar / Right: search + results ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-start">
                {/* Desktop Filter Sidebar (hidden on mobile) */}
                <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
                  <FilterSidebar
                    sections={sections}
                    selected={selectedMap}
                    onToggle={handleToggle}
                    onClearSection={handleClearSection}
                    onClearAll={handleClearAll}
                    activeCount={activeCount}
                  />
                </aside>

                <div className="lg:col-span-8 xl:col-span-9 min-w-0">
                  {/* Search Bar + Mobile Filter Trigger */}
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          placeholder="Search job title, skills, or company..."
                          value={searchQuery}
                          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                          maxLength={100}
                          className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm font-medium"
                        />
                      </div>

                      {/* Mobile Filter Button (opens slide-over drawer) */}
                      <button
                        type="button"
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="lg:hidden h-11 px-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors shrink-0"
                        aria-label="Open job filters"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Filters</span>
                        {activeCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                            {activeCount}
                          </span>
                        )}
                      </button>

                      {activeCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearAll}
                          className="hidden sm:inline-flex h-11 px-3 text-xs text-rose-600 hover:bg-rose-50 rounded-xl shrink-0 font-bold"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset ({activeCount})
                        </Button>
                      )}
                    </div>

                    {/* Active Filter Chips (dismissible tags) */}
                    {activeCount > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
                          Active:
                        </span>
                        {selectedCity && !ALL_CITY_VALUES.includes(selectedCity) && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <span>{cityLabel(selectedCity)}</span>
                            <button
                              type="button"
                              onClick={() => handleClearSection("city")}
                              className="hover:bg-blue-200/60 rounded-full p-0.5 ml-0.5"
                              title="Remove location filter"
                              aria-label="Remove location filter"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {selectedCategory && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <span>{categoryLabel(selectedCategory)}</span>
                            <button
                              type="button"
                              onClick={() => handleClearSection("category")}
                              className="hover:bg-indigo-200/60 rounded-full p-0.5 ml-0.5"
                              title="Remove department filter"
                              aria-label="Remove department filter"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {searchQuery.trim() && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span>&quot;{searchQuery.trim()}&quot;</span>
                            <button
                              type="button"
                              onClick={() => dispatch(setSearchQuery(""))}
                              className="hover:bg-slate-200 rounded-full p-0.5 ml-0.5"
                              title="Clear search"
                              aria-label="Clear search"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {Object.entries(multiFilters).flatMap(([key, vals]) =>
                          vals.map((val) => (
                            <span
                              key={`${key}-${val}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              <span>{val}</span>
                              <button
                                type="button"
                                onClick={() => handleToggle(key, val)}
                                className="hover:bg-slate-200 rounded-full p-0.5 ml-0.5"
                                title={`Remove ${val}`}
                                aria-label={`Remove ${val}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline ml-1"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status Header */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-xs sm:text-sm font-semibold text-slate-600">
                      Showing <strong className="text-slate-900">{rangeStart}–{rangeEnd}</strong> of{" "}
                      <strong className="text-slate-900">{totalJobs}</strong> verified openings
                      {selectedCity && selectedCity !== "All India" ? (selectedCity.toLowerCase() === "surat" ? " in Surat, Gujarat" : ` in ${selectedCity}`) : " across India"}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
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
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <Briefcase className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">No jobs match your filters</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Try clearing a filter on the left, or search for a different job title or city.
                      </p>
                      <div className="mt-5 flex justify-center">
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={handleClearAll}
                          className="gap-1.5 font-bold"
                        >
                          <RotateCcw className="w-4 h-4" /> Reset All Filters
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ─── Mobile Filter Slide-Over Drawer ─── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative ml-auto w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/90">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900">
                  Filters {activeCount > 0 && <span className="text-blue-600 font-bold">({activeCount})</span>}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 transition-colors"
                  >
                    Reset All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter List with Accordions */}
            <div className="flex-1 overflow-y-auto px-1 py-1">
              <FilterSidebar
                isMobileDrawer
                sections={sections}
                selected={selectedMap}
                onToggle={handleToggle}
                onClearSection={handleClearSection}
                onClearAll={handleClearAll}
                activeCount={activeCount}
              />
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-2.5">
              {activeCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearAll}
                  className="h-11 px-4 text-xs font-bold border-slate-200 text-slate-700 shrink-0"
                >
                  Clear All
                </Button>
              )}
              <Button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
              >
                Show {totalJobs} {totalJobs === 1 ? "Job" : "Jobs"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
