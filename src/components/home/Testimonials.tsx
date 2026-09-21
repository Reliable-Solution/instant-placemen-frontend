"use client";

import React from "react";
import { Star, CheckCircle2 } from "lucide-react";

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: "Ramesh Prajapati",
      role: "Delivery Executive (Zepto)",
      city: "Mumbai, Andheri",
      salary: "₹38,000/month",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      content:
        "I was tired of fake agents asking for ₹2,000 registration fees. On Instant Placement, I directly dialed Zepto's hub manager and had my walk-in interview within 2 hours. Joined next morning!",
      rating: 5,
    },
    {
      name: "Sneha Mukherjee",
      role: "Inbound Customer Support (Tech Mahindra)",
      city: "Athwa, Surat Gujarat",
      salary: "₹28,500/month",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      content:
        "Applied via the 1-Click WhatsApp option and the HR Pooja Sharma scheduled my telephonic round the same afternoon. Completely free with direct company payroll!",
      rating: 5,
    },
    {
      name: "Vikas Deshmukh",
      role: "Store Manager (Trent Retail)",
      city: "Pune",
      salary: "Hired 12 staff in 48 hrs",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      content:
        "As a recruiter, we needed 10 retail counter sales staff for festival rush urgently. We posted our job and got over 40 local candidate calls within one single day.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials-section" className="py-10 md:py-14 container mx-auto px-4 max-w-6xl">
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Zero Fee • Real Placements
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Loved by 10 Lakh+ Candidates & Employers
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Hear from job seekers and recruiters who got direct interviews without paying a single rupee.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(r.rating)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed italic">
                &ldquo;{r.content}&rdquo;
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
              <img
                src={r.avatar}
                alt={r.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{r.name}</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 truncate">{r.role}</p>
                <span className="text-[10px] font-bold text-emerald-600">{r.salary}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
