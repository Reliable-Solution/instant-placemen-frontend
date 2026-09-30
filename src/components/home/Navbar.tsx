"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
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
} from "lucide-react";

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
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ip_user");
        if (stored) setLocalUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const reduxUser = useAppSelector((state) => state.auth?.user);
  const activeUser = user || reduxUser || localUser;

  const roleUpper = activeUser?.role?.toUpperCase();
  const isJobSeeker = Boolean(
    activeUser &&
      (roleUpper === "CANDIDATE" ||
        roleUpper === "JOB_SEEKER" ||
        roleUpper === "JOBSEEKER" ||
        roleUpper === "USER")
  );
  const isEmployer = Boolean(activeUser && roleUpper === "EMPLOYER");
  const isAdmin = Boolean(activeUser && roleUpper === "ADMIN");

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
              <item.icon className={`w-4 h-4 ${item.accent || "text-slate-500"}`} />
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* City Selector (Desktop) */}
          <button
            onClick={onOpenCityModal}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-2 rounded-xl transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="max-w-[120px] truncate">{selectedCity ? (selectedCity.toLowerCase() === "surat" ? "Surat, Gujarat" : selectedCity) : "Surat, Gujarat"}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Post Job / Candidate Applications Button (Desktop) */}
          {isJobSeeker ? (
            <Link
              href="/candidate"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>My Applications</span>
              {appliedCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {appliedCount}
                </span>
              )}
            </Link>
          ) : isEmployer ? (
            <Link
              href="/employer/jobs/new"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Post New Job</span>
            </Link>
          ) : !activeUser ? (
            <Link
              href="/employer/login?redirect=/employer/jobs/new"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Post Job (Free)</span>
            </Link>
          ) : null}

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />

          {/* Auth / Profile */}
          {activeUser ? (
            <div className="flex items-center gap-1.5">
              <Link
                href={isAdmin ? "/admin" : isEmployer ? "/employer" : "/candidate"}
                className="hidden md:flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition shadow-xs"
              >
                <span>
                  {isAdmin ? "Admin Console" : isEmployer ? "Employer Portal" : "Candidate Dashboard"}
                </span>
              </Link>
              <button
                onClick={isJobSeeker ? onOpenDashboard : () => {
                  window.location.href = isAdmin ? "/admin" : "/employer";
                }}
                className="flex items-center gap-2 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 pl-1.5 pr-2.5 sm:pr-3 py-1.5 rounded-xl transition-all group"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-white flex items-center justify-center text-xs font-bold shadow-md transition-transform ${
                    isAdmin
                      ? "bg-gradient-to-br from-amber-600 to-rose-600 shadow-amber-600/20"
                      : isEmployer
                      ? "bg-gradient-to-br from-emerald-600 to-teal-600 shadow-emerald-600/20"
                      : "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-600/20"
                  }`}
                >
                  {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {activeUser.name ? activeUser.name.split(" ")[0] : "User"}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 -mt-0.5">
                    {isAdmin ? "Admin" : isEmployer ? "Employer" : "Candidate"}
                  </span>
                </div>
                {appliedCount > 0 && isJobSeeker && (
                  <span className="bg-emerald-500 text-white text-xs font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
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
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your City</p>
              <p className="truncate">{selectedCity ? (selectedCity.toLowerCase() === "surat" ? "Surat, Gujarat" : selectedCity) : "Surat, Gujarat"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
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

          </div>

          {/* Action Buttons */}
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            {!activeUser ? (
              <>
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
                <Link
                  href="/employer/login?redirect=/employer/jobs/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm h-12 rounded-xl"
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Post a Job (Free)
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href={isAdmin ? "/admin" : isEmployer ? "/employer" : "/candidate"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm h-12 rounded-xl shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {isAdmin
                    ? "Super Admin Console"
                    : isEmployer
                    ? "Employer Portal & Jobs"
                    : "Candidate Dashboard & Digital CV"}
                </Link>

                {isJobSeeker && (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenDashboard();
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm h-12 rounded-xl"
                    >
                      Quick Profile Drawer {appliedCount > 0 && `(${appliedCount})`}
                    </button>
                    <Link
                      href="/candidate"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm h-12 rounded-xl"
                    >
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      My Applications & Status {appliedCount > 0 && `(${appliedCount})`}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}

                {isEmployer && (
                  <Link
                    href="/employer/jobs/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-sm h-12 rounded-xl"
                  >
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    + Post New Job
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
