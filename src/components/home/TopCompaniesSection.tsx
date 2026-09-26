"use client";

import React, { useState } from "react";
import { Building2, ArrowRight, ChevronDown, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { useGetTopCompaniesQuery } from "@/services/api/jobsApi";

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 3;

interface TopCompaniesProps {
  onCompanyClick: (companyName: string) => void;
}

export const TopCompaniesSection: React.FC<TopCompaniesProps> = ({
  onCompanyClick,
}) => {
  const { data: companies = [], isLoading } = useGetTopCompaniesQuery();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const visibleCompanies = companies.slice(0, visibleCount);
  const hasMore = visibleCount < companies.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, companies.length));
  };

  if (!isLoading && companies.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/80">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full mb-2.5 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Direct Payroll Employers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Companies Actively Hiring
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Direct company interviews with guaranteed in-house payroll — zero consultants and 100% free candidate placement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xs">
              Showing <strong className="text-slate-900">{visibleCompanies.length}</strong> of {companies.length} hiring firms
            </span>
          </div>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleCompanies.map((company) => {
            const roleList = company.roles
              ? company.roles.split(",").map((r) => r.trim()).filter(Boolean)
              : [];

            return (
              <button
                key={company.name}
                type="button"
                onClick={() => {
                  onCompanyClick(company.name);
                  const el = document.getElementById("jobs-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left flex flex-col justify-between gap-4 overflow-hidden"
              >
                {/* Top Row: Logo + Badges */}
                <div className="flex items-start justify-between gap-3 w-full">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs p-2 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-blue-200 transition-all duration-200 overflow-hidden">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Direct Payroll</span>
                    </span>
                    {company.city && (
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {company.city.split(",")[0].trim()}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Company Info */}
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {company.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Verified Hiring Partner • Direct Interview</span>
                  </p>
                </div>

                {/* Hiring Roles Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {roleList.length > 0 ? (
                    roleList.slice(0, 3).map((role, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-0.5 rounded-lg transition-colors"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Multiple Departments</span>
                  )}
                  {roleList.length > 3 && (
                    <span className="inline-flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      +{roleList.length - 3} more
                    </span>
                  )}
                </div>

                {/* Footer Divider: Openings Count & Action */}
                <div className="border-t border-slate-100 pt-3.5 mt-auto flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {company.openings}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all">
                    <span>View Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all"
            >
              <span>Load More Hiring Firms</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
