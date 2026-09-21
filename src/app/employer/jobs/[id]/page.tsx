"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGetEmployerJobQuery, useUpdateEmployerJobStatusMutation } from "@/services/api/employerApi";
import {
  ArrowLeft,
  Edit2,
  MapPin,
  Briefcase,
  Users,
  IndianRupee,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  Phone,
  MessageCircle,
  Building2,
  GraduationCap,
  Languages,
  Zap,
  Globe,
  FileText,
  Gift,
  AlertCircle,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

export default function EmployerJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: job, isLoading, isError } = useGetEmployerJobQuery(id);
  const [updateStatus, { isLoading: isToggling }] = useUpdateEmployerJobStatusMutation();

  const handleToggle = async () => {
    if (!job) return;
    const nextStatus = job.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      await updateStatus({ id, status: nextStatus }).unwrap();
      toast.success(`Job ${nextStatus === "ACTIVE" ? "activated" : "paused"} successfully.`);
    } catch {
      toast.error("Failed to update job status.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-sm text-slate-500 animate-pulse">Loading job details…</div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Job Not Found</h2>
        <p className="text-xs text-slate-500">This job either doesn't exist or you don't have access to it.</p>
        <Link href="/employer/jobs">
          <Button className="mt-2 bg-blue-600 text-white rounded-xl text-xs h-10 px-6">Back to My Jobs</Button>
        </Link>
      </div>
    );
  }

  const statusColor =
    job.status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : job.status === "PAUSED"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Nav */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Jobs</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${statusColor} hover:shadow-sm`}
          >
            {job.status === "ACTIVE" ? (
              <><PauseCircle className="w-3.5 h-3.5" /><span>Pause Listing</span></>
            ) : (
              <><PlayCircle className="w-3.5 h-3.5" /><span>Activate Listing</span></>
            )}
          </button>
          <Link href={`/employer/jobs/${id}/edit`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4 rounded-xl gap-1.5 shadow-sm">
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Job</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColor}`}>
              {job.status}
            </span>
            {job.isUrgent && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> Urgent
              </span>
            )}
            {job.isVerified && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            )}
            <span className="text-[11px] text-blue-200 ml-auto">{job.category}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{job.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-300" />
              <span className="font-semibold">{job.company}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-300" />
              <span>{job.locality ? `${job.locality}, ` : ""}{job.city}</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 mt-2">
            <span className="text-xs uppercase text-blue-200 font-semibold tracking-wider">Monthly Salary:</span>
            <span className="text-xl font-extrabold text-amber-300">
              ₹{(job.salaryMin / 1000).toFixed(0)}k – ₹{(job.salaryMax / 1000).toFixed(0)}k
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Job Type", value: job.jobType || "Full Time", icon: Briefcase },
          { label: "Work Mode", value: job.workMode || "In-Office", icon: Globe },
          { label: "Vacancies", value: `${job.vacancies || 1} Openings`, icon: Users },
          { label: "Expected Joining", value: job.expectedJoining || "Immediate", icon: Calendar },
          { label: "Working Days", value: job.workingDays || "—", icon: Clock },
          { label: "Working Hours", value: job.workingHours || "—", icon: Clock },
          { label: "Experience", value: job.experience || "Fresher", icon: Briefcase },
          { label: "Qualification", value: job.qualification || "12th Pass", icon: GraduationCap },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
              <Icon className="w-3 h-3" /> {label}
            </p>
            <p className="text-xs font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Job Description
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Responsibilities
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                {job.responsibilities}
              </p>
            </div>
          )}

          {/* Skills */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" /> Skills & Candidate Requirements
            </h2>

            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skillsRequired.map((sk: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-xs font-semibold">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.preferredSkills && job.preferredSkills.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Preferred Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.preferredSkills.map((sk: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-700 text-white text-xs font-semibold">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.languages && job.languages.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Languages className="w-3 h-3" /> Languages Required
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.languages.map((lang: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.otherRequirements && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                <strong>Other Requirements:</strong> {job.otherRequirements}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Recruiter Contact */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Recruiter Desk</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                {job.contactPerson?.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{job.contactPerson?.name || "Recruiter"}</p>
                <p className="text-[11px] text-slate-500">{job.contactPerson?.role || "Talent Acquisition"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <a
                href={`tel:+91${job.contactPerson?.phone}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>+91 {job.contactPerson?.phone}</span>
              </a>
              <a
                href={`https://wa.me/91${job.contactPerson?.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp: +91 {job.contactPerson?.whatsapp}</span>
              </a>
              {job.contactPerson?.callTimings && (
                <p className="text-[11px] text-slate-400 text-center">⏰ {job.contactPerson.callTimings}</p>
              )}
            </div>
          </div>

          {/* Incentives */}
          {job.incentives && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm space-y-2">
              <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" /> Incentives
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">{job.incentives}</p>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-blue-600" /> Perks & Benefits
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.benefits.map((b: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">
                    <Sparkles className="w-3 h-3 text-blue-500" /> {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Pipeline Stats</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Applicants</span>
                <span className="font-bold text-slate-900">{job.applicationCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Pipeline Stage</span>
                <span className="font-bold text-blue-700">{job.pipelineStage || "VACANCY_LOGGED"}</span>
              </div>
              {job.applicationDeadline && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Deadline</span>
                  <span className="font-bold text-rose-600">{job.applicationDeadline}</span>
                </div>
              )}
            </div>
            <Link href={`/employer/applicants?jobId=${id}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-xl mt-1">
                View All Applicants
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
