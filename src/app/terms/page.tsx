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
import { ArrowLeft, FileText, CheckCircle2, ChevronRight, ShieldCheck, Scale } from "lucide-react";

const FALLBACK_TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using Instant Placement (website, mobile site, or candidate portal), you agree to be bound by these Terms of Service.",
      "If you do not agree with any part of these terms, please refrain from using our services.",
    ],
  },
  {
    title: "2. Platform Description",
    content: [
      "Instant Placement is a modern talent discovery and job connect platform operating across Surat, Gujarat, Mumbai, and India.",
      "We facilitate direct candidate-to-employer communication without agency middlemen or consultancy commission charges.",
    ],
  },
  {
    title: "3. Candidate Responsibilities",
    content: [
      "Provide accurate, truthful, and up-to-date resume and qualification data.",
      "Maintain the security and confidentiality of your OTPs and login credentials.",
      "Attend scheduled interviews promptly and communicate professionally with hiring managers.",
    ],
  },
  {
    title: "4. Employer Code of Conduct & Zero Fee Rule",
    content: [
      "Employers shall NOT charge candidates any registration fees, interview fees, or training costs.",
      "Mandates must reflect verified salaries, genuine work premises, and lawful working conditions.",
      "Zero Tolerance for fraudulent or unverified vacancy listings.",
    ],
  },
  {
    title: "5. Limitation of Liability & Governing Law",
    content: [
      "Instant Placement verifies job postings and recruiters to the best of its automated and telephonic screening routines.",
      "Final employment agreements and operational terms remain between the candidate and the hiring firm.",
      "These terms are governed by the laws of India, subject to the jurisdiction of the courts in Surat, Gujarat.",
    ],
  },
];

export default function TermsPage() {
  const router = useRouter();
  const { data: settings } = useGetSettingsQuery();
  const user = useAppSelector((state) => state.auth.user);
  const { data: cities = [] } = useGetCitiesQuery();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Surat");

  const pageTitle = settings?.terms_of_service_title || "Terms of Service";
  const updatedDate = settings?.terms_of_service_date || "September 26, 2026";
  const rawContent = settings?.terms_of_service_content;

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
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
              <FileText className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Last updated: {updatedDate}</span>
                <span>•</span>
                <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 text-[10px]">
                  Official Terms of Use
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
              {FALLBACK_TERMS_SECTIONS.map((section, idx) => (
                <section key={idx} className="space-y-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                    <span>{section.title}</span>
                  </h2>
                  <ul className="space-y-1.5 pl-4">
                    {section.content.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
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
              <Scale className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Governed by the Information Technology Act &amp; Laws of India.</span>
            </div>
            <span className="font-bold text-slate-900 whitespace-nowrap">Instant Placement Compliance</span>
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
