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
import { DashboardHeader, StatCard, ContentCard } from "@/components/dashboard/Dashboard";

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
      <DashboardHeader
        badge="Employer Hiring Workspace"
        title={<>Welcome back, {user?.name || "Hiring Partner"}!</>}
        subtitle={<>Managing recruitment mandates for <strong className="text-slate-800">{user?.companyName || "Your Company"}</strong> • Verified Business Account</>}
        actionHref="/employer/jobs/new"
        actionLabel={<><PlusCircle className="w-4 h-4" /><span>Post New Job Vacancy</span></>}
      />

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard
            key={i}
            title={card.title}
            value={statsLoading ? "..." : card.value}
            sub={card.sub}
            icon={card.icon}
            color={card.color}
            href={card.link}
          />
        ))}
      </div>

      {/* Two Column Section: Active Postings & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Jobs */}
        <ContentCard
          className="lg:col-span-7"
          title="Your Job Postings"
          subtitle="Live mandates receiving candidate applications"
          actionHref="/employer/jobs"
        >
          <div className="space-y-3">
            {jobsLoading ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading jobs...</p>
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
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job.city} ({job.locality}) • ₹{(job.salaryMin / 1000).toFixed(0)}k - ₹{(job.salaryMax / 1000).toFixed(0)}k
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold">
                      {job.applicantCount || 0} Applicants
                    </Badge>
                    <Badge
                      className={`text-xs ${
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
        </ContentCard>

        {/* Recent Applicants */}
        <ContentCard
          className="lg:col-span-5"
          title="Recent Applicants"
          subtitle="Profiles ready for tele-screening"
          actionHref="/employer/applicants"
        >
          <div className="space-y-3">
            {appsLoading ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading applicants...</p>
            ) : applicants.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No applicants received yet.</p>
            ) : (
              applicants.slice(0, 4).map((app: any) => {
                // Server pre-masks contacts without a paid plan (contactMasked flag).
                const isUnlocked = app.contactMasked === false;
                const rawPhone = app.candidatePhone || "";
                const displayPhone = rawPhone || "••••••••••";

                return (
                  <div
                    key={app._id}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{app.candidateName}</h5>
                      <div className="flex items-center gap-1.5 text-xs mt-0.5 font-semibold">
                        {isUnlocked ? (
                          <>
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-mono">{displayPhone}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="text-slate-500 font-mono">{displayPhone}</span>
                            <Link href="/employer/plans" className="text-xs text-blue-600 hover:underline font-bold ml-1">
                              Unlock with Plan
                            </Link>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 block">{app.experience} • {app.qualification}</span>
                    </div>

                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                      {app.status}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
