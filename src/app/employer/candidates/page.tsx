"use client";

import React, { useState } from "react";
import {
  useGetEmployerApplicantsQuery,
  useGetEmployerJobsQuery,
} from "@/services/api/employerApi";
import {
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  MessageCircle,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import DynamicPlanModal from "@/components/employer/DynamicPlanModal";

export default function EmployerCandidateSearchPage() {
  const [jobFilter, setJobFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [planModalJob, setPlanModalJob] = useState<any | null>(null);
  const PAGE_SIZE = 9;

  const { data: jobs = [] } = useGetEmployerJobsQuery();
  const { data: applicants = [], isLoading, refetch } = useGetEmployerApplicantsQuery({
    jobId: jobFilter !== "ALL" ? jobFilter : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const totalApplicants = (applicants as any).total ?? applicants.length;
  const totalPages = (applicants as any).totalPages ?? 1;

  const openWhatsApp = (phone: string, name: string, jobTitle: string) => {
    const clean = phone.replace(/\D/g, "");
    const formatted = clean.length === 10 ? `91${clean}` : clean;
    const text = encodeURIComponent(
      `Hi ${name}, we saw your application for the ${jobTitle} position at Instant Placement. We'd like to schedule an interview. Please share your availability.`
    );
    window.open(`https://wa.me/${formatted}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Candidate Pool
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Candidates who applied for your job postings. Unlock contact details by activating a Hiring Plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold">Filter by Job:</span>
          <select
            value={jobFilter}
            onChange={(e) => {
              setJobFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-3 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none shadow-sm"
          >
            <option value="ALL">All My Jobs ({jobs.length})</option>
            {jobs.map((j: any) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <p className="text-sm font-bold">Contact details are masked for free accounts</p>
            <p className="text-[11px] text-blue-200 mt-0.5">
              Activate a Hiring Plan on a job to unlock full candidate phone numbers and WhatsApp access.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-white/15 border border-white/20 px-3 py-1.5 rounded-xl shrink-0">
          {totalApplicants} Applicant{totalApplicants !== 1 ? "s" : ""} Total
        </span>
      </div>

      {/* Candidate Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-52" />
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <Users className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">No candidates yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Candidates who apply to your jobs will appear here. Make sure your jobs are active.
            </p>
          </div>
          <a href="/employer/jobs" className="text-xs font-bold text-blue-600 hover:underline">
            View My Job Listings →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applicants.map((app: any) => {
            const hasPlan = Boolean(app.job?.purchasedPlan && app.job.purchasedPlan.paymentStatus === "PAID");
            const rawPhone: string = app.candidatePhone || "";
            const maskedPhone = rawPhone.length > 4
              ? "+91 " + rawPhone.slice(0, 2) + "••••••" + rawPhone.slice(-2)
              : "+91 ••••••••••";
            const displayPhone = hasPlan ? "+91 " + rawPhone : maskedPhone;

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-blue-200 transition-all shadow-sm"
              >
                {/* Candidate header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                      {app.candidateName?.charAt(0) || "C"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1">
                        {app.candidateName}
                        {hasPlan && <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3" />
                        <span>{app.candidateCity || "Surat"}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`text-[10px] shrink-0 ${
                      app.status === "SELECTED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : app.status === "REJECTED"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {app.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                {/* Job applied for */}
                <div className="flex items-center gap-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-bold text-slate-700 truncate">{app.job?.title || "Job Mandate"}</span>
                  {app.job?.city && <span className="text-slate-400 shrink-0">· {app.job.city}</span>}
                </div>

                {/* Skills & Qualification row */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                    <GraduationCap className="w-3 h-3 text-slate-500" /> {app.qualification || "—"}
                  </span>
                  {app.experience && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {app.experience}
                    </span>
                  )}
                </div>

                {/* Contact footer */}
                <div className="pt-3 border-t border-slate-100">
                  {hasPlan ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 flex-1 font-mono">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{displayPhone}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openWhatsApp(rawPhone, app.candidateName, app.job?.title || "our role")}
                        className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 rounded-xl shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </Button>
                      <a href={`tel:${rawPhone}`}>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-xl border-slate-200 hover:bg-slate-50">
                          <Phone className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{maskedPhone}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          setPlanModalJob(app.job || { _id: app.jobId, title: app.job?.title || "Job Mandate" })
                        }
                        className="h-8 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-1.5 rounded-xl shadow-xs whitespace-nowrap"
                      >
                        <Lock className="w-3 h-3 text-amber-300" />
                        <span>Unlock</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalApplicants}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
        />
      )}

      {/* Plan Selection Modal */}
      <DynamicPlanModal
        isOpen={!!planModalJob}
        onClose={() => setPlanModalJob(null)}
        job={planModalJob}
        onPlanActivated={() => {
          refetch();
          setPlanModalJob(null);
        }}
      />
    </div>
  );
}
