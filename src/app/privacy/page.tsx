"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetSettingsQuery } from "@/services/api/settingsApi";
import { useAppSelector } from "@/store/hooks";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { CandidateAuthModal } from "@/components/home/CandidateAuthModal";
import { UserDashboardDrawer } from "@/features/auth/UserDashboardDrawer";
import { CitySelectorModal } from "@/components/home/CitySelectorModal";
import { useGetCitiesQuery } from "@/services/api/jobsApi";
import { ArrowLeft, Shield, Lock, CheckCircle2, ChevronRight, FileCheck } from "lucide-react";

const FALLBACK_PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    content: [
      "Name, email address, and verified phone number.",
      "Professional snapshot (skills, work experience, qualifications, and notice period).",
      "Resume / CV documents uploaded for job applications.",
      "Preferred job locations (cities, localities, and commute preferences).",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "Connect job seekers directly with verified employers and hiring managers.",
      "Verify commute feasibility between candidate residency and employer workplace.",
      "Send real-time WhatsApp job alerts matching your skills.",
      "Generate your verified Digital CV profile for instant HR review.",
    ],
  },
  {
    title: "3. Digital Personal Data Protection (DPDP Act 2023)",
    content: [
      "We never sell your personal data to unauthorized third parties or marketing agencies.",
      "Candidate profiles require explicit consent before being discoverable by recruiters.",
      "You have the right to withdraw consent and make your profile private anytime from your dashboard.",
    ],
  },
  {
    title: "4. Zero Recruitment Fees Guarantee",
    content: [
      "Instant Placement does NOT charge job seekers any fees for registration, job offers, or interviews.",
      "Report any fraudulent employer demanding payment directly to our vigilance desk.",
    ],
  },
  {
    title: "5. Data Privacy Inquiries & Grievances",
    content: [
      "For data privacy requests or grievance redressal, contact us at: support@instantplacement.in",
      "Address: Surat, Gujarat, India. Business hours: Mon - Sat, 9:00 AM - 7:00 PM (IST).",
    ],
  },
];

export default function PrivacyPage() {
  const router = useRouter();
  const { data: settings } = useGetSettingsQuery();
  const user = useAppSelector((state) => state.auth.user);
  const { data: cities = [] } = useGetCitiesQuery();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Surat");

  const pageTitle = settings?.privacy_policy_title || "Privacy Policy";
  const updatedDate = settings?.privacy_policy_date || "September 26, 2026";
  const rawContent = settings?.privacy_policy_content;

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    router.push(`/?city=${encodeURIComponent(city)}`);
  };

  const handleCategorySelect = (catId: string) => {
    router.push(`/?category=${encodeURIComponent(catId)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      <Navbar
        selectedCity={selectedCity}
        onOpenCityModal={() => setCityModalOpen(true)}
        onOpenPostJobModal={() => {
          if (user?.role === "EMPLOYER") {
            router.push("/employer/jobs/new");
          } else {
            router.push("/employer/login?redirect=/employer/jobs/new");
          }
        }}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenDashboard={() => setDashboardOpen(true)}
        user={user}
        appliedCount={0}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-600 font-medium">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold">{pageTitle}</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 md:p-12 shadow-sm space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Last updated: {updatedDate}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                  DPDP Act (2023) Compliant
                </span>
              </p>
            </div>
          </div>

          {/* Dynamic Content */}
          {rawContent ? (
            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line font-sans">
              {rawContent}
            </div>
          ) : (
            <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {FALLBACK_PRIVACY_SECTIONS.map((section, idx) => (
                <section key={idx} className="space-y-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>{section.title}</span>
                  </h2>
                  <ul className="space-y-1.5 pl-4">
                    {section.content.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {/* Trust Seal */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your privacy and data safety are verified &amp; protected by Instant Placement.</span>
            </div>
            <span className="font-bold text-slate-900 whitespace-nowrap">Instant Placement Legal</span>
          </div>
        </div>
      </main>

      <Footer onSelectCity={handleCitySelect} onSelectCategory={handleCategorySelect} />

      <CitySelectorModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={handleCitySelect}
      />

      <CandidateAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={() => setAuthModalOpen(false)}
      />

      <UserDashboardDrawer
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        user={user}
        onLogout={() => {}}
        appliedJobs={[]}
        onViewJob={() => {}}
      />
    </div>
  );
}
