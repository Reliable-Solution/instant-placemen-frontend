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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-100"
          : "bg-white border-b border-slate-200"
      }`}
    >
      <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <a href="/" className="flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="Instant Placement"
            className="h-6 sm:h-7 w-auto max-w-[155px] sm:max-w-[180px] object-contain"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { href: "#jobs-section", label: "Find Jobs", icon: Briefcase },
            { href: "#categories-section", label: "Categories", icon: LayoutGrid },
            { href: "#walkins-section", label: "Walk-ins", icon: Calendar, accent: "text-rose-500" },
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
        <div className="flex items-center gap-2">
          {/* City Selector (Desktop) */}
          <button
            onClick={onOpenCityModal}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-2 rounded-xl transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="max-w-[100px] truncate">{selectedCity || "All India"}</span>
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
                href="/candidate"
                className="hidden md:flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition shadow-sm"
              >
                <span>Dashboard</span>
              </Link>
              <button
                onClick={onOpenDashboard}
                className="flex items-center gap-2 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 pl-1.5 pr-3 py-1.5 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                  {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                  {user.name ? user.name.split(" ")[0] : "Candidate"}
                </span>
                {appliedCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {appliedCount}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4 rounded-xl gap-1.5 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
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
              <p className="truncate">{selectedCity || "All India"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Nav Links */}
          <div className="space-y-0.5 mt-1">
            {[
              { href: "#jobs-section", label: "Find Verified Jobs", icon: Briefcase, bg: "bg-blue-50", color: "text-blue-600" },
              { href: "#categories-section", label: "Browse Categories", icon: LayoutGrid, bg: "bg-purple-50", color: "text-purple-600" },
              { href: "#walkins-section", label: "Walk-in Interviews", icon: Calendar, bg: "bg-rose-50", color: "text-rose-500" },
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
                  href="/candidate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm h-12 rounded-xl shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Candidate Dashboard &amp; Digital CV
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDashboard();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm h-12 rounded-xl"
                >
                  Quick Profile Drawer {appliedCount > 0 && `(${appliedCount})`}
                </button>
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
