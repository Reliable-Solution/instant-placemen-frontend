"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Zap, Trophy } from "lucide-react";

const LIVE_PLACEMENTS = [
  { name: "Rahul Sharma", role: "Delivery Partner", company: "Zepto", salary: "₹38,000/mo", city: "Mumbai" },
  { name: "Pooja Verma", role: "Telecaller / BPO", company: "Tech Mahindra", salary: "₹28,500/mo", city: "Noida" },
  { name: "Amit Patel", role: "Field Sales", company: "PhonePe", salary: "₹42,000/mo", city: "Ahmedabad" },
  { name: "Sneha Hegde", role: "Back Office Admin", company: "Reliance Retail", salary: "₹30,000/mo", city: "Bengaluru" },
  { name: "Mohit Gupta", role: "Accountant (Tally)", company: "Apex Advisors", salary: "₹32,000/mo", city: "Surat Gujarat" },
  { name: "Arun Kumar", role: "Desktop Support", company: "CMS IT", salary: "₹35,000/mo", city: "Chennai" },
];

export const LivePlacementTicker: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % LIVE_PLACEMENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = LIVE_PLACEMENTS[index];

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-950 text-white py-2 px-4 border-b border-emerald-800/40 text-xs">
      <div className="container mx-auto max-w-6xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex items-center gap-1 bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shrink-0 animate-pulse">
            <Zap className="w-3 h-3 fill-current" /> LIVE HIRING RADAR
          </span>

          <div className="flex items-center gap-1.5 text-emerald-100 truncate">
            <span className="font-bold text-white">{current.name}</span>
            <span className="text-emerald-300">just placed at</span>
            <strong className="text-white font-extrabold">{current.company}</strong>
            <span className="text-emerald-300">({current.city})</span>
            <span className="hidden sm:inline text-amber-300 font-bold">• {current.salary}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px] text-emerald-200 shrink-0">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 1,240 Placed Today
          </span>
          <span>•</span>
          <span className="text-amber-300 font-semibold">Average Hiring Time: 24 Hours</span>
        </div>
      </div>
    </div>
  );
};
