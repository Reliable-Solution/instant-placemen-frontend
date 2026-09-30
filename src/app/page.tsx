"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Job } from "@/types";
import {
  useGetJobsQuery,
  useGetCategoriesQuery,
  useGetCitiesQuery,
  useGetServiceModulesQuery,
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
  setSelectedJobForDetail,
  setSelectedJobForHR,
} from "@/store/slices/uiSlice";
import { setUser, logout, loadUserFromStorage } from "@/store/slices/authSlice";

// Global Layout & Feature Components
import { LivePlacementTicker } from "@/components/home/LivePlacementTicker";
import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustStats } from "@/components/home/TrustStats";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { JobListings } from "@/features/jobs/JobListings";
import { WalkInInterviews } from "@/features/interviews/WalkInInterviews";
import { SalaryCalculator } from "@/components/home/SalaryCalculator";
import { TopCompaniesSection } from "@/components/home/TopCompaniesSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CitySelectorModal } from "@/components/home/CitySelectorModal";
import { PostJobModal } from "@/features/employers/PostJobModal";
import { CandidateAuthModal } from "@/features/auth/CandidateAuthModal";
import { UserDashboardDrawer } from "@/features/auth/UserDashboardDrawer";
import { AppDownloadBanner } from "@/components/home/AppDownloadBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQSection } from "@/components/home/FAQSection";
import { Footer } from "@/components/home/Footer";

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleOpenJobPage = (job: Job) => {
    const jobId = job.id || (job as any)._id;
    router.push(`/job/${jobId}`);
  };

  // Redux Slices State
  const { selectedCity, selectedCategory, searchQuery } = useAppSelector(
    (state) => state.filter
  );
  const {
    isCityModalOpen,
    isPostJobModalOpen,
    isAuthModalOpen,
    isDashboardOpen,
    selectedJobForDetail: jobForDetail,
    selectedJobForHR: jobForHR,
  } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const [appliedJobs, setAppliedJobs] = React.useState<Job[]>([]);

  // Load session from local storage on mount
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // On homepage, only show 6 latest dynamic jobs
  const [currentPage, setCurrentPage] = React.useState(1);
  const PAGE_SIZE = 6;

  // Reset page when city, category or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, selectedCategory, searchQuery]);

  // RTK Query: Server Cache & Data Fetching
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: cities = [] } = useGetCitiesQuery();
  const { data: jobs = [] } = useGetJobsQuery({
    city: selectedCity,
    category: selectedCategory,
    query: searchQuery.trim().slice(0, 100),
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const totalJobs = (jobs as any).total ?? jobs.length;
  const totalPages = (jobs as any).totalPages ?? 1;

  // Hiring plans — always visible on homepage
  const { data: serviceModules = [] } = useGetServiceModulesQuery();

  const handleConnectHR = (job: Job, mode: "call" | "whatsapp") => {
    const jobId = job.id || job._id;
    if (!appliedJobs.some((j) => (j.id || j._id) === jobId)) {
      setAppliedJobs((prev) => [job, ...prev]);
    }
    dispatch(setSelectedJobForHR({ job, mode }));
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600 selection:text-white">
      {/* 0. Live Placement Radar Ticker */}
      {/* <LivePlacementTicker /> */}

      {/* 1. Header Navbar */}
      <Navbar
        selectedCity={selectedCity}
        onOpenCityModal={() => dispatch(openCityModal())}
        onOpenPostJobModal={() => dispatch(openPostJobModal())}
        onOpenAuthModal={() => dispatch(openAuthModal())}
        onOpenDashboard={() => dispatch(openDashboard())}
        user={user}
        appliedCount={appliedJobs.length}
      />

      {/* 2. Hero Search Banner */}
      <HeroSection
        selectedCity={selectedCity}
        onOpenCityModal={() => dispatch(openCityModal())}
        searchQuery={searchQuery}
        onSearchChange={(q) => dispatch(setSearchQuery(q))}
        onSearchSubmit={() => {
          const el = document.getElementById("jobs-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onQuickPillClick={() => {
          const el = document.getElementById("jobs-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 3. Trust & Key Stats */}
      <TrustStats />

      {/* 4. Top Job Categories */}
      <CategoryGrid
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => dispatch(setCategory(catId))}
      />

      {/* 5. Live Job Listings Grid & Filters (Features Module) */}
      <JobListings
        jobs={jobs}
        totalJobs={totalJobs}
        selectedCity={selectedCity}
        selectedCategory={selectedCategory}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={(q) => dispatch(setSearchQuery(q))}
        onSelectCategory={(catId) => dispatch(setCategory(catId))}
        onViewDetails={handleOpenJobPage}
        onConnectHR={handleConnectHR}
        onResetFilters={() => dispatch(resetFilters())}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        showViewAllButton={true}
        onPageChange={(page) => {
          setCurrentPage(page);
          const el = document.getElementById("jobs-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 6. Spot Walk-in Interviews Today Section (Hidden per request) */}
      {/* <div id="walkins-section">
        <WalkInInterviews
          selectedCity={selectedCity}
          onViewJob={handleOpenJobPage}
          onConnectHR={handleConnectHR}
        />
      </div> */}

      {/* 7. Salary Benchmarks Calculator */}
      <div id="salary-calculator">
        <SalaryCalculator />
      </div>

      {/* 8. Top Hiring Companies Marquee */}
      <TopCompaniesSection
        onCompanyClick={(compName) => dispatch(setSearchQuery(compName))}
      />

      {/* 9. 3-Step How It Works Guide */}
      <HowItWorks />

      {/* 10. Simple Hiring Plans — always visible */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Simple Pricing</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              3 Hiring Modules, One Flat Price Each
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              No role-wise rates, no hidden charges. Pick the module that fits how you hire.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(serviceModules as any[]).slice(0, 3).map((plan: any, idx: number) => (
              <div
                key={plan.id || plan._id || idx}
                className={`bg-slate-50 rounded-3xl border-2 p-6 flex flex-col justify-between ${
                  plan.isPopular ? "border-blue-600 shadow-md" : "border-slate-200"
                }`}
              >
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{plan.title}</h3>
                  {plan.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">{plan.subtitle}</p>
                  )}
                  <p className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
                    {plan.priceDisplay}
                  </p>
                  <ul className="space-y-2 mt-4">
                    {(plan.features || []).slice(0, 5).map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.replacementPolicy && plan.replacementPolicy !== "Not Included" && (
                    <p className="mt-3 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                      {plan.replacementPolicy}
                    </p>
                  )}
                </div>
                <Link
                  href="/employer/plans"
                  className={`mt-5 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    plan.isPopular
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <span>Buy Plan</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Mobile App & WhatsApp Notification Promo */}
      <AppDownloadBanner />

      {/* 13. Verified Candidate Testimonials */}
      {/* <Testimonials /> */}

      {/* 14. Interactive FAQ Accordion */}
      <FAQSection />

      {/* 15. Comprehensive SEO Footer */}
      <Footer
        onSelectCity={(city) => dispatch(setCity(city))}
        onSelectCategory={(catId) => dispatch(setCategory(catId))}
      />

      {/* MODALS */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => dispatch(closeCityModal())}
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={(city) => dispatch(setCity(city))}
      />

      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => dispatch(closePostJobModal())}
        categories={categories}
        cities={cities}
        onJobCreated={() => {}}
      />

      <CandidateAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => dispatch(closeAuthModal())}
        onLoginSuccess={(u) => dispatch(setUser(u))}
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
    </main>
  );
}
