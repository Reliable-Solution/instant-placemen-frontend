"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Headphones,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import {
  FaLinkedin,
  FaSquareFacebook,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { useGetCategoriesQuery, useGetPopularCitiesQuery } from "@/services/api/jobsApi";
import { useGetSettingsQuery } from "@/services/api/settingsApi";

interface FooterProps {
  onSelectCity?: (city: string) => void;
  onSelectCategory?: (catId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCity,
  onSelectCategory,
}) => {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: popularCities = [] } = useGetPopularCitiesQuery(10);
  const { data: settings } = useGetSettingsQuery();

  const supportPhone = settings?.support_phone || "+91 78630 22284";
  const supportEmail = settings?.support_email || "support@instantplacement.in";
  const supportWhatsapp = settings?.support_whatsapp || settings?.support_phone || "+91 78630 22284";
  const cleanWhatsappDigits = supportWhatsapp.replace(/[^0-9]/g, "") || "917863022284";
  const supportWhatsappLink = settings?.support_whatsapp_link || `https://wa.me/${cleanWhatsappDigits}?text=Hello%20Instant%20Placement%20Support`;
  const supportHours = settings?.support_business_hours || "Mon - Sat, 9:00 AM - 7:00 PM (IST)";
  const footerTagline = settings?.footer_tagline || "India's direct hiring and job discovery platform. Connect directly with companies and candidates without unnecessary middlemen.";
  const footerFreeBadge = settings?.footer_free_badge || "100% Free for Job Seekers";
  const footerCopyrightName = settings?.footer_company_name || "Instant Placement Technologies Pvt. Ltd.";

  // Dynamic Social Links
  const linkedinUrl = settings?.social_linkedin || "https://linkedin.com";
  const facebookUrl = settings?.social_facebook || "https://facebook.com";
  const instagramUrl = settings?.social_instagram || "https://instagram.com";
  const twitterUrl = settings?.social_twitter || "https://x.com";
  const youtubeUrl = settings?.social_youtube || "https://youtube.com";

  const defaultRoles = [
    { name: "Telecaller / BPO", id: "telecalling" },
    { name: "Delivery & Logistics", id: "delivery" },
    { name: "Back Office / Data Entry", id: "back-office" },
    { name: "Field Sales / BD", id: "sales" },
    { name: "Retail & Counter Sales", id: "retail" },
    { name: "Accounts & Tally", id: "accounts" },
    { name: "IT Support / Tech", id: "it" },
    { name: "Graphic & Video Editor", id: "design" },
  ];

  const displayRoles = categories.length > 0
    ? categories.slice(0, 8).map((c) => ({ name: c.title, id: (c as any)._id || c.id }))
    : defaultRoles;

  const handleRoleClick = (roleId: string) => {
    if (onSelectCategory) {
      onSelectCategory(roleId);
      const el = document.getElementById("jobs-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCityClick = (city: string) => {
    if (onSelectCity) {
      onSelectCity(city);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-white text-slate-600 font-sans border-t border-slate-100">
      {/* ─── Top Call to Action Banner (Pixel-Perfect Match) ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#033177] via-[#054988] to-[#008f88] text-white px-5 sm:px-12 py-7 sm:py-9 shadow-lg">
          {/* Decorative concentric wave circles on bottom-left */}
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full border border-blue-400/25 pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full border border-blue-400/20 pointer-events-none" />
          <div className="absolute -left-28 -bottom-28 w-80 h-80 rounded-full border border-blue-400/15 pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-blue-600/30 blur-2xl pointer-events-none" />

          {/* Decorative vibrant cyan/teal glow dome on far-right */}
          <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full bg-gradient-to-br from-[#00dca6]/40 to-[#00a876]/30 blur-2xl pointer-events-none" />
          <div className="absolute -right-6 -bottom-10 w-52 h-52 rounded-full bg-[#00c996]/20 pointer-events-none" />

          {/* Inner Content Flex */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-white leading-tight">
                Ready to hire <span className="text-[#00e5be]">the right talent?</span>
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-normal">
                Connect with relevant candidates faster with Instant Placement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full md:w-auto">
              <Link
                href="/employer/jobs/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0066ff] hover:bg-[#0055dd] text-white text-sm font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Post a Job</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#033b49]/60 hover:bg-[#033b49]/80 text-white text-sm font-bold rounded-xl border-2 border-[#00d6b4] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Find Jobs</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main 4-Column Navigation Links ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1: Brand & Socials (Col-span 2 on mobile, col-span 4 on desktop) */}
          <div className="col-span-2 lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Instant Placement - Right Talent. Faster."
                className="h-10 sm:h-12 w-auto max-w-[220px] object-contain"
              />
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed pr-2 max-w-sm">
              {footerTagline}
            </p>

            {/* Free for job seekers badge */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6fbf5] text-[#00a878] border border-[#a3f3dc] text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00a878]" />
                <span>{footerFreeBadge}</span>
              </div>
            </div>

            {/* Official Solid Social Media Icons Matching Design */}
            <div className="flex items-center gap-3.5 pt-1">
              {/* LinkedIn */}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0a66c2] hover:opacity-80 transition-opacity"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5" />
                </a>
              )}

              {/* Facebook */}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1877f2] hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <FaSquareFacebook className="w-5 h-5" />
                </a>
              )}

              {/* Instagram */}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e4405f] hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
              )}

              {/* X / Twitter */}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#000000] hover:opacity-80 transition-opacity"
                  aria-label="X (Twitter)"
                >
                  <FaXTwitter className="w-5 h-5" />
                </a>
              )}

              {/* YouTube */}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff0000] hover:opacity-80 transition-opacity"
                  aria-label="YouTube"
                >
                  <FaYoutube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: FOR EMPLOYERS */}
          <div className="col-span-1 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              For Employers
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/employer/jobs/new" className="hover:text-blue-600 transition-colors">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/employer/candidates" className="hover:text-blue-600 transition-colors">
                  Find Candidates
                </Link>
              </li>
              <li>
                <Link href="/employer/plans" className="hover:text-blue-600 transition-colors">
                  Hiring Solutions
                </Link>
              </li>
              <li>
                <Link href="/employer" className="hover:text-blue-600 transition-colors">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/employer/plans" className="hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/employer/login" className="hover:text-blue-600 transition-colors">
                  Employer Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: FOR JOB SEEKERS */}
          <div className="col-span-1 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              For Job Seekers
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/jobs" className="hover:text-blue-600 transition-colors">
                  Search Jobs
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("jobs-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Browse Jobs by City
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("jobs-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Popular Job Roles
                </button>
              </li>
              <li>
                <Link href="/candidate/profile" className="hover:text-blue-600 transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/candidate/login" className="hover:text-blue-600 transition-colors">
                  Candidate Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: POPULAR JOB ROLES */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Popular Job Roles
            </h4>
            <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-2 text-xs text-slate-600">
              {displayRoles.map((role) => (
                <li key={role.name}>
                  <button
                    type="button"
                    onClick={() => handleRoleClick(role.id)}
                    className="hover:text-blue-600 transition-colors text-left truncate block w-full"
                  >
                    {role.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Horizontal "Need Help?" Bar ─── */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.95fr_1.35fr_0.95fr_1.15fr] gap-4 lg:gap-2 items-center">
            {/* Need Help Headline */}
            <div className="flex items-center gap-2.5">
              <Headphones className="w-7 h-7 text-blue-600 shrink-0 stroke-[2]" />
              <div>
                <h4 className="text-sm font-black text-slate-900 leading-tight">Need Help?</h4>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Have questions or need help with hiring? Reach our support desk.
                </p>
              </div>
            </div>

            {/* Phone */}
            <a
              href={`tel:${supportPhone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 lg:border-l lg:border-slate-200 lg:pl-3 group transition-colors"
            >
              <Phone className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-110 transition-transform stroke-[2.2]" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">Phone</span>
                <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 font-mono whitespace-nowrap">
                  {supportPhone}
                </span>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-2 lg:border-l lg:border-slate-200 lg:pl-3 group transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-110 transition-transform stroke-[2.2]" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">Email</span>
                <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 whitespace-nowrap block">
                  {supportEmail}
                </span>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={supportWhatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 lg:border-l lg:border-slate-200 lg:pl-3 group transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform stroke-[2.2]" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">WhatsApp</span>
                <span className="text-xs font-black text-slate-900 group-hover:text-emerald-600 font-mono whitespace-nowrap">
                  {supportWhatsapp}
                </span>
              </div>
            </a>

            {/* Business Hours */}
            <div className="flex items-center gap-2 lg:border-l lg:border-slate-200 lg:pl-3">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 stroke-[2.2]" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">Business Hours</span>
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  {supportHours}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Dark Navy Copyright Bar ─── */}
      <div className="bg-[#09152b] text-slate-400 text-xs py-5 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] text-slate-400 order-2 sm:order-1">
            &copy; {new Date().getFullYear()} {footerCopyrightName}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] order-1 sm:order-2">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
