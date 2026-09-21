"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types";
import { useGetWalkInJobsQuery } from "@/services/api/jobsApi";
import {
  Calendar,
  MapPin,
  Building,
  Phone,
  MessageCircle,
  Zap,
} from "lucide-react";

interface WalkInInterviewsProps {
  selectedCity: string;
  onViewJob: (job: Job) => void;
  onConnectHR: (job: Job, mode: "call" | "whatsapp") => void;
}

export const WalkInInterviews: React.FC<WalkInInterviewsProps> = ({
  selectedCity,
  onViewJob,
  onConnectHR,
}) => {
  const { data: jobs = [], isLoading } = useGetWalkInJobsQuery({ city: selectedCity });

  if (!isLoading && jobs.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 mb-2">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Same-Day Spot Offer Letters</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Walk-in Interviews Today in {selectedCity}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Direct company premises interviews with zero waiting time. Carry your Aadhaar &amp; Resume.
            </p>
          </div>
        </div>

        {/* Walkin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {jobs.slice(0, 6).map((job) => {
            const jobId = job.id || (job as any)._id;
            const vacancies = job.vacancies || 10;
            const venue = job.interviewAddress || (job.locality ? `${job.locality}, ${job.city}` : "Direct Office Interview");
            const salaryText = `₹${(job.salaryMin || 0).toLocaleString()} - ₹${(job.salaryMax || 0).toLocaleString()} / month`;
            const phone = job.contactPerson?.phone || "+91 98765 00000";
            const whatsapp = job.contactPerson?.whatsapp || phone;
            const cleanPhone = whatsapp.replace(/\D/g, "");
            const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

            return (
              <div
                key={jobId}
                className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-rose-300 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 flex flex-col justify-between group relative overflow-hidden cursor-pointer"
                onClick={() => onViewJob(job)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold text-xs py-0.5">
                      ⚡ {vacancies} Spots Left
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">{job.city}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {job.company}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold">{job.interviewType || "Immediate Walk-in"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{venue}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                    <span className="font-semibold">Expected Salary:</span>
                    <span className="font-extrabold text-emerald-800 text-sm">{salaryText}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className="grid grid-cols-2 gap-2 pt-4 mt-2 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onConnectHR(job, "call")}
                    className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" /> Call HR
                  </button>
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Hi HR, I found your walk-in opening for ${job.title} at ${job.company} on Instant Placement. Please share the walk-in timing and address.`
                      );
                      window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-sm transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

