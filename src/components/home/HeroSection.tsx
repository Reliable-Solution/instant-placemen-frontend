"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface HeroSectionProps {
  selectedCity: string;
  onOpenCityModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onQuickPillClick: (tag: string) => void;
  isLoadingJobs?: boolean;
}

const POPULAR_TAGS = [
  { label: "Work From Home", query: "Work From Home", icon: "🏠" },
  { label: "12th Pass Jobs", query: "12th Pass", icon: "🎓" },
  { label: "Freshers Welcome", query: "Fresher", icon: "✨" },
  { label: "Telecaller / BPO", query: "Telecaller", icon: "📞" },
  { label: "Delivery Partner", query: "Delivery", icon: "🛵" },
  { label: "Back Office / Excel", query: "Back Office", icon: "💻" },
  { label: "Field Sales", query: "Sales", icon: "📈" },
  { label: "Urgent Hiring", query: "Urgent", icon: "⚡" },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedCity,
  onOpenCityModal,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onQuickPillClick,
  isLoadingJobs = false,
}) => {
  const [localRole, setLocalRole] = useState(searchQuery);
  const [activePill, setActivePill] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearchChange(localRole);
      onSearchSubmit();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localRole);
    onSearchSubmit();
  };

  return (
    <section className="relative hero-mesh text-white pt-10 pb-16 md:pt-16 md:pb-24 px-4 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10 text-center">
        {/* Top Trust Pill */}
        

        {/* Punchy Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
          Find Verified Jobs{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300 underline decoration-amber-400/40 underline-offset-8">
            {(!selectedCity || selectedCity.toLowerCase() === "surat" || selectedCity.toLowerCase() === "surat, gujarat")
              ? "in Surat, Gujarat"
              : selectedCity === "All India"
              ? "Across India"
              : `in ${selectedCity}`}
          </span>
          <br className="hidden sm:inline" /> & Call HR Directly
        </h1>

        {/* Sub-headline */}
        <p className="mt-4 text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-normal">
          No Consultancy Fees • Direct Interview Calls • Verified Recruiters • 24hr Placement
        </p>

        {/* Main Floating Search Box */}
        <div className="mt-8 md:mt-10 max-w-4xl mx-auto">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-2xl md:rounded-full p-2.5 sm:p-3 shadow-2xl shadow-blue-950/40 border-2 border-white/80 grid grid-cols-1 md:grid-cols-12 gap-2 text-slate-900"
          >
            {/* Input 1: Role / Skill / Company */}
            <div className="md:col-span-6 flex items-center gap-3 px-3 py-2 md:py-0 border-b md:border-b-0 md:border-r border-slate-200">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skill (e.g. Telecaller, Delivery, Tally, Excel)..."
                value={localRole}
                onChange={(e) => setLocalRole(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-slate-500 text-slate-800"
              />
            </div>

            {/* Input 2: City / Locality Button */}
            <div className="md:col-span-4 flex items-center justify-between px-3 py-2 md:py-0">
              <button
                type="button"
                onClick={onOpenCityModal}
                className="flex items-center gap-2 text-left w-full hover:opacity-80 transition-opacity"
              >
                <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
                <div className="truncate">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Job Location</p>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {selectedCity ? (selectedCity.toLowerCase() === "surat" ? "Surat, Gujarat" : selectedCity) : "Surat, Gujarat"}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={onOpenCityModal}
                className="text-xs text-blue-600 font-semibold shrink-0 hover:underline"
              >
                Change
              </button>
            </div>

            {/* Search Submit Button */}
            <div className="md:col-span-2">
              <Button
                type="submit"
                variant="gradient"
                className="w-full h-12 md:h-full rounded-xl md:rounded-full text-base font-bold gap-2 shadow-lg shadow-blue-600/30"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Quick Search Trending Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-blue-200 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" /> Popular Searches:
          </span>
          {POPULAR_TAGS.map((tag) => {
            const isThisLoading = isLoadingJobs && activePill === tag.query;
            return (
              <button
                key={tag.label}
                disabled={isLoadingJobs}
                onClick={() => {
                  setActivePill(tag.query);
                  setLocalRole(tag.query);
                  onSearchChange(tag.query);
                  onQuickPillClick(tag.query);
                }}
                className={`bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-full font-medium transition-all backdrop-blur-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                  isThisLoading ? "bg-white/25 ring-2 ring-amber-300" : ""
                }`}
              >
                {isThisLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                ) : (
                  <span>{tag.icon}</span>
                )}
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
