"use client";

import React, { useState } from "react";
import { Building2, ArrowRight, ChevronDown } from "lucide-react";
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
    <section className="py-14 bg-slate-50 border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <Building2 className="w-4 h-4" />
              <span>Direct Payroll Employers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Companies Actively Hiring
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Direct company interviews without consultants or registration fees.
            </p>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Showing {visibleCompanies.length} of {companies.length}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCompanies.map((company) => (
            <button
              key={company.name}
              onClick={() => {
                onCompanyClick(company.name);
                const el = document.getElementById("jobs-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}

              className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-card hover:shadow-card-hover transition-all text-left flex items-start justify-between group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200/80 shadow-xs shrink-0 flex items-center justify-center p-1.5 overflow-hidden">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {company.name}
                    </h4>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-md">
                      {company.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{company.roles}</p>
                  <p className="text-xs font-bold text-emerald-600 mt-2">{company.openings}</p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shrink-0 mt-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2  font-semibold text-sm px-6 py-3 shadow-sm "
            >
              <span>Load More</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
