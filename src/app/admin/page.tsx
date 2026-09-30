"use client";

import React from "react";
import Link from "next/link";
import {
  useGetAdminStatsQuery,
  useGetAdminApplicationsQuery,
  useGetAdminJobsQuery,
  useUpdateAdminApplicationStatusMutation,
} from "@/services/api/adminApi";
import {
  Briefcase,
  Users,
  Building2,
  FileCheck2,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader, StatCard, ContentCard } from "@/components/dashboard/Dashboard";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: applications = [], isLoading: appsLoading } = useGetAdminApplicationsQuery();
  const { data: jobs = [], isLoading: jobsLoading } = useGetAdminJobsQuery();
  const [updateStatus] = useUpdateAdminApplicationStatusMutation();

  const handleStageChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const statCards = [
    {
      title: "Active Jobs",
      value: stats?.activeJobs ?? 0,
      total: stats?.totalJobs ? `${stats.totalJobs} Total Listings` : "",
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      link: "/admin/jobs",
    },
    {
      title: "Live Placements",
      value: stats?.placedCandidates ?? 0,
      total: "Verified Joinees",
      icon: FileCheck2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      link: "/admin/applications",
    },
    {
      title: "Registered Employers",
      value: stats?.totalEmployers ?? 0,
      total: "SMEs & Corporate Clients",
      icon: Building2,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      link: "/admin/employers",
    },
    {
      title: "Candidate Talent Pool",
      value: stats?.totalCandidates ?? 0,
      total: "Screened Profiles",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      link: "/admin/candidates",
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        badge="Platform Command Center"
        badgeColor="text-amber-700 bg-amber-50 border-amber-200"
        title="Super Administrator Dashboard"
        subtitle="Monitoring recruitment operations, client mandate turnaround times, and placement velocity."
        live
        extra={
          <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 text-right shrink-0">
            <span className="text-xs uppercase font-bold text-slate-500 block">Est. Platform Revenue</span>
            <span className="text-xl font-extrabold text-emerald-600">{stats?.estimatedRevenue || "₹85,000"}</span>
          </div>
        }
      />

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard
            key={i}
            title={card.title}
            value={statsLoading ? "..." : card.value}
            sub={card.total}
            icon={card.icon}
            color={card.color}
            href={card.link}
          />
        ))}
      </div>

      {/* Two Column Grid: Recent Applications & Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Applications (ATS Preview) */}
        <ContentCard
          className="lg:col-span-7"
          title="Live Applications Pipeline"
          subtitle="Candidate submissions requiring screening review"
          actionHref="/admin/applications"
          actionLabel="View Full ATS"
        >
          <div>
            <div className="space-y-3">
              {appsLoading ? (
                <p className="text-xs text-slate-500 py-6 text-center">Loading applications...</p>
              ) : applications.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No applications submitted yet.</p>
              ) : (
                applications.slice(0, 5).map((app: any) => (
                  <div
                    key={app._id}
                    className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{app.candidateName}</h4>
                        <span className="text-xs text-slate-500 font-medium">({app.candidatePhone})</span>
                      </div>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">{app.jobTitle}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{app.experience}</span>
                        <span>•</span>
                        <span>{app.qualification}</span>
                        <span>•</span>
                        <span>{app.candidateCity || "Surat Gujarat"}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <select
                        value={app.status}
                        onChange={(e) => handleStageChange(app._id, e.target.value)}
                        className="h-8 px-2.5 bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl focus:border-blue-500 shadow-sm"
                      >
                        <option value="NEW">NEW</option>
                        <option value="SCREENED">SCREENED</option>
                        <option value="SHARED_WITH_CLIENT">SHARED</option>
                        <option value="INTERVIEW_SCHEDULED">INTERVIEW</option>
                        <option value="SELECTED">SELECTED</option>
                        <option value="JOINED">JOINED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ContentCard>

        {/* Live Active Jobs Preview */}
        <ContentCard
          className="lg:col-span-5"
          title="Active Job Mandates"
          subtitle="Current requisitions on the portal"
          actionHref="/admin/jobs"
          actionLabel="Manage Jobs"
        >
          <div>
            <div className="space-y-3">
              {jobsLoading ? (
                <p className="text-xs text-slate-500 py-6 text-center">Loading jobs...</p>
              ) : jobs.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No active jobs found.</p>
              ) : (
                jobs.slice(0, 5).map((job: any) => (
                  <div
                    key={job._id}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between"
                  >
                    <div className="overflow-hidden pr-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{job.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{job.company} • {job.city}</p>
                      <span className="text-xs text-emerald-600 font-bold">
                        ₹{(job.salaryMin / 1000).toFixed(0)}k - ₹{(job.salaryMax / 1000).toFixed(0)}k / mo
                      </span>
                    </div>

                    <Badge
                      className={`text-xs shrink-0 ${
                        job.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {job.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
