"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  User,
  Menu,
  X,
  Briefcase,
  Calendar,
  Calculator,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Bookmark,
} from "lucide-react";
import { getSavedJobs } from "@/lib/savedJobs";

interface NavbarProps {
  selectedCity?: string;
  onOpenCityModal?: () => void;
  onOpenPostJobModal: () => void;
  onOpenAuthModal: () => void;
  onOpenDashboard: () => void;
  user: any;
  appliedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCity,
  onOpenCityModal,
  onOpenPostJobModal,
  onOpenAuthModal,
  onOpenDashboard,
  user,
  appliedCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    setSavedCount(getSavedJobs().length);

    const handleSavedChange = () => {
      setSavedCount(getSavedJobs().length);
    };

    window.addEventListener("ip_saved_jobs_changed", handleSavedChange);
    return () => window.removeEventListener("ip_saved_jobs_changed", handleSavedChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200"
          : "bg-white border-b border-slate-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <a href="/" className="flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="Instant Placement"
            className="h-8 sm:h-12 w-auto max-w-[155px] sm:max-w-[260px] object-contain transition-all"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { href: "#jobs-section", label: "Find Jobs", icon: Briefcase },
            { href: "#categories-section", label: "Categories", icon: LayoutGrid },
            // { href: "#walkins-section", label: "Walk-ins", icon: Calendar, accent: "text-rose-500" },
            { href: "#salary-calculator", label: "Salaries", icon: Calculator, accent: "text-blue-500" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50/80 transition-all"
            >
              <item.icon className={`w-4 h-4 ${item.accent || "text-slate-400"}`} />
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Saved Jobs Link */}
          <Link
            href="/candidate/saved"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-200 px-2.5 sm:px-3 py-2 rounded-xl transition-all shadow-2xs"
            title="Saved Jobs"
          >
            <Bookmark className={`w-3.5 h-3.5 ${savedCount > 0 ? "fill-amber-400 text-amber-500" : "text-slate-400"}`} />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[17px] text-center leading-tight">
                {savedCount}
              </span>
            )}
          </Link>

          {/* City Selector (Desktop) */}
          <button
            onClick={onOpenCityModal}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-2 rounded-xl transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="max-w-[120px] truncate">{selectedCity ? (selectedCity.toLowerCase() === "surat" ? "Surat, Gujarat" : selectedCity) : "Surat, Gujarat"}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Post Job Button (Desktop) */}
          <Link
            href={user?.role === "EMPLOYER" ? "/employer/jobs/new" : "/employer/login?redirect=/employer/jobs/new"}
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition-all"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Post Job (Free)</span>
          </Link>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />

          {/* Auth / Profile */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href={user.role === "ADMIN" ? "/admin" : user.role === "EMPLOYER" ? "/employer" : "/candidate"}
                className="hidden md:flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition shadow-sm"
              >
                <span>
                  {user.role === "ADMIN" ? "Admin Console" : user.role === "EMPLOYER" ? "Employer Portal" : "Candidate Dashboard"}
                </span>
              </Link>
              <button
                onClick={user.role === "CANDIDATE" ? onOpenDashboard : () => {
                  window.location.href = user.role === "ADMIN" ? "/admin" : "/employer";
                }}
                className="flex items-center gap-2 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 pl-1.5 pr-2.5 sm:pr-3 py-1.5 rounded-xl transition-all group"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-white flex items-center justify-center text-xs font-bold shadow-md transition-transform ${
                    user.role === "ADMIN"
                      ? "bg-gradient-to-br from-amber-600 to-rose-600 shadow-amber-600/20"
                      : user.role === "EMPLOYER"
                      ? "bg-gradient-to-br from-emerald-600 to-teal-600 shadow-emerald-600/20"
                      : "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-600/20"
                  }`}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {user.name ? user.name.split(" ")[0] : "User"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 -mt-0.5">
                    {user.role === "ADMIN" ? "Admin" : user.role === "EMPLOYER" ? "Employer" : "Candidate"}
                  </span>
                </div>
                {appliedCount > 0 && user.role === "CANDIDATE" && (
                  <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {appliedCount}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Login</span>
              <span className="sm:hidden text-xs">Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-white">
          {/* City Selector (Mobile) */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCityModal?.();
            }}
            className="w-full flex items-center gap-3 py-3 text-left text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl px-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your City</p>
              <p className="truncate">{selectedCity ? (selectedCity.toLowerCase() === "surat" ? "Surat, Gujarat" : selectedCity) : "Surat, Gujarat"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Nav Links */}
          <div className="space-y-0.5 mt-1">
            {[
              { href: "#jobs-section", label: "Find Verified Jobs", icon: Briefcase, bg: "bg-blue-50", color: "text-blue-600" },
              { href: "#categories-section", label: "Browse Categories", icon: LayoutGrid, bg: "bg-purple-50", color: "text-purple-600" },
              // { href: "#walkins-section", label: "Walk-in Interviews", icon: Calendar, bg: "bg-rose-50", color: "text-rose-500" },
              { href: "#salary-calculator", label: "Salary Calculator", icon: Calculator, bg: "bg-emerald-50", color: "text-emerald-600" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl px-3 transition-all"
              >
                <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                {item.label}
              </a>
            ))}

            <Link
              href="/candidate/saved"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 text-sm font-semibold text-slate-700 hover:text-amber-600 hover:bg-amber-50/50 rounded-xl px-3 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                </div>
                <span>Saved Jobs</span>
              </div>
              {savedCount > 0 && (
                <span className="bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  {savedCount}
                </span>
              )}
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            {!user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm h-12 rounded-xl shadow-lg shadow-blue-600/25"
              >
                <User className="w-4 h-4" />
                Sign In (Free)
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href={user.role === "ADMIN" ? "/admin" : user.role === "EMPLOYER" ? "/employer" : "/candidate"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm h-12 rounded-xl shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {user.role === "ADMIN"
                    ? "Super Admin Console"
                    : user.role === "EMPLOYER"
                    ? "Employer Portal & Jobs"
                    : "Candidate Dashboard & Digital CV"}
                </Link>
                {user.role === "CANDIDATE" && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenDashboard();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm h-12 rounded-xl"
                  >
                    Quick Profile Drawer {appliedCount > 0 && `(${appliedCount})`}
                  </button>
                )}
              </div>
            )}

            <Link
              href={user?.role === "EMPLOYER" ? "/employer/jobs/new" : "/employer/login?redirect=/employer/jobs/new"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm h-12 rounded-xl"
            >
              <Briefcase className="w-4 h-4" />
              Post a Job (Free)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
