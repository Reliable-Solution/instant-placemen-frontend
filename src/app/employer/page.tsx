"use client";

import React from "react";
import Link from "next/link";
import {
  useGetEmployerDashboardQuery,
  useGetEmployerJobsQuery,
  useGetEmployerApplicantsQuery,
} from "@/services/api/employerApi";
import { useAppSelector } from "@/store/hooks";
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  PlusCircle,
  ArrowUpRight,
  Sparkles,
  Phone,
  Clock,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EmployerDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: stats, isLoading: statsLoading } = useGetEmployerDashboardQuery();
  const { data: jobs = [], isLoading: jobsLoading } = useGetEmployerJobsQuery();
  const { data: applicants = [], isLoading: appsLoading } = useGetEmployerApplicantsQuery();

  const statCards = [
    {
      title: "Active Job Listings",
      value: stats?.activeJobsCount ?? jobs.length,
      sub: "Live on candidate portal",
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      link: "/employer/jobs",
    },
    {
      title: "Total Applicants",
      value: stats?.totalApplicantsCount ?? applicants.length,
      sub: "Screened candidates",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      link: "/employer/applicants",
    },
    {
      title: "Interviews Scheduled",
      value: stats?.interviewsScheduled ?? 0,
      sub: "Active calendar slots",
      icon: Calendar,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      link: "/employer/applicants",
    },
    {
      title: "Successful Hires",
      value: stats?.shortlistedCount ?? 0,
      sub: "Selected joinees",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      link: "/employer/applicants",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Employer Hiring Workspace
            </span>
            <span className="text-xs text-slate-500 font-medium">• Verified Business Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || "Hiring Partner"}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Managing recruitment mandates for <strong className="text-slate-800">{user?.companyName || "Your Company"}</strong>.
          </p>
        </div>

        <Link href="/employer/jobs/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 px-5 rounded-xl shadow-md shadow-blue-600/20 gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job Vacancy</span>
          </Button>
        </Link>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              href={card.link}
              className="bg-white hover:bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-3xl p-5 transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-2xl border shadow-sm ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-xs font-semibold text-slate-500">{card.title}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                {statsLoading ? "..." : card.value}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Two Column Section: Active Postings & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Jobs */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Your Job Postings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live mandates receiving candidate applications</p>
            </div>
            <Link href="/employer/jobs">
              <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {jobsLoading ? (
              <p className="text-xs text-slate-400 py-6 text-center">Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500 mb-3">You have not posted any jobs yet.</p>
                <Link href="/employer/jobs/new">
                  <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              jobs.slice(0, 4).map((job: any) => (
                <div
                  key={job._id}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{job.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {job.city} ({job.locality}) • ₹{(job.salaryMin / 1000).toFixed(0)}k - ₹{(job.salaryMax / 1000).toFixed(0)}k
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                      {job.applicantCount || 0} Applicants
                    </Badge>
                    <Badge
                      className={`text-[10px] ${
                        job.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Applicants</h3>
              <p className="text-xs text-slate-500 mt-0.5">Profiles ready for tele-screening</p>
            </div>
            <Link href="/employer/applicants">
              <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {appsLoading ? (
              <p className="text-xs text-slate-400 py-6 text-center">Loading applicants...</p>
            ) : applicants.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No applicants received yet.</p>
            ) : (
              applicants.slice(0, 4).map((app: any) => {
                const isUnlocked = Boolean(app.job?.purchasedPlan);
                const rawPhone = app.candidatePhone || "";
                const displayPhone = isUnlocked
                  ? rawPhone
                  : rawPhone.length > 5
                  ? rawPhone.slice(0, 5) + " •••••"
                  : "••••••••••";

                return (
                  <div
                    key={app._id}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{app.candidateName}</h5>
                      <div className="flex items-center gap-1.5 text-[11px] mt-0.5 font-semibold">
                        {isUnlocked ? (
                          <>
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-mono">{displayPhone}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="text-slate-400 font-mono">{displayPhone}</span>
                            <Link href="/employer/plans" className="text-[10px] text-blue-600 hover:underline font-bold ml-1">
                              Unlock with Plan
                            </Link>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{app.experience} • {app.qualification}</span>
                    </div>

                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                      {app.status}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
