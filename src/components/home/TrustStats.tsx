"use client";

import React from "react";
import { useGetStatsQuery } from "@/services/api/jobsApi";
import { ShieldCheck, Users, Building2, Award } from "lucide-react";

export const TrustStats: React.FC = () => {
  const { data: stats } = useGetStatsQuery();

  const statsList = [
    {
      icon: ShieldCheck,
      value: stats?.activeJobs ? `${stats.activeJobs.toLocaleString()}+` : "0+",
      label: "Verified Active Jobs",
      subtext: "100% genuine companies",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      icon: Building2,
      value: stats?.activeEmployers ? `${stats.activeEmployers.toLocaleString()}+` : "0+",
      label: "Top Employers Hiring",
      subtext: "Direct company payroll",
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-100",
    },
    {
      icon: Users,
      value: stats?.activeCandidates ? `${stats.activeCandidates.toLocaleString()}+` : "0+",
      label: "Registered Candidates",
      subtext: "Verified candidate profiles",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      icon: Award,
      value: "₹0 Agency Fee",
      label: "Always 100% Free",
      subtext: "Zero charge for candidates",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    },
  ];


  return (
    <section className="relative -mt-8 z-20 container mx-auto px-4 max-w-6xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsList.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col items-start gap-2.5 ${stat.bg}`}
            >
              <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 ${stat.color}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-800">{stat.label}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
