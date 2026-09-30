"use client";

import React from "react";
import { Search, PhoneCall, Award, CheckCircle2, ShieldCheck } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: "01",
      icon: Search,
      title: "Discover Verified Local Jobs",
      description:
        "Select your city and filter openings by salary, qualification, shift, and work from home options.",
      color: "from-blue-600 to-indigo-600",
    },
    {
      step: "02",
      icon: PhoneCall,
      title: "Connect with HR Directly",
      description:
        "Click 'Call HR' or 'Apply on WhatsApp' to speak with the real employer immediately. Zero middleman fees.",
      color: "from-emerald-600 to-teal-600",
    },
    {
      step: "03",
      icon: Award,
      title: "Attend Interview & Get Placed",
      description:
        "Give walk-in or telephonic interview and receive spot offer letter on direct company payroll in 24 hours.",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <section className="py-14 md:py-20 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
            How Instant Placement Works for You
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Get hired without paying consultancy charges or waiting for weeks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white hover:bg-slate-50/50 rounded-3xl p-6 border-2 border-slate-200/90 hover:border-blue-400 shadow-sm hover:shadow-card-hover transition-all duration-300 relative flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-200 group-hover:text-blue-200 transition-colors">
                      {s.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100% Free Guarantee</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direct HR</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
