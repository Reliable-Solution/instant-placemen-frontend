"use client";

import React, { useState } from "react";
import {
  useGetAdminJobsQuery,
  useUpdateAdminJobStatusMutation,
  useUpdateAdminJobBadgesMutation,
  useDeleteAdminJobMutation,
} from "@/services/api/adminApi";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Flame,
  Star,
  MapPin,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/Skeleton";

export default function AdminJobsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const { data: jobs = [], isLoading } = useGetAdminJobsQuery({
    search: search || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const totalJobs = (jobs as any).total ?? jobs.length;
  const totalPages = (jobs as any).totalPages ?? 1;

  const [updateStatus] = useUpdateAdminJobStatusMutation();
  const [updateBadges] = useUpdateAdminJobBadgesMutation();
  const [deleteJob] = useDeleteAdminJobMutation();

  const handleStatusToggle = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      await updateStatus({ id: jobId, status: nextStatus }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBadgeToggle = async (jobId: string, field: "isUrgent" | "isVerified" | "isFeatured", currentVal: boolean) => {
    try {
      await updateBadges({ id: jobId, badges: { [field]: !currentVal } }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (jobId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteJob(jobId).unwrap();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Requisitions Moderation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage live mandates, verify employer postings, and configure priority tags.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <Input
            type="text"
            placeholder="Search by title, company, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-500 rounded-xl"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "PAUSED", "EXPIRED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No jobs match the current criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Job Title & Company</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Salary Range</th>
                  <th className="p-4">Service Tier</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Badges</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {jobs.map((job: any) => (
                  <tr key={job._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900 text-xs">{job.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span>{job.company}</span>
                        <span className="text-slate-300">•</span>
                        <span>{job.vacancies || 10} Openings</span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">{job.city}</span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">{job.locality}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-emerald-600">
                        ₹{(job.salaryMin / 1000).toFixed(0)}k - ₹{(job.salaryMax / 1000).toFixed(0)}k
                      </span>
                      <span className="text-xs text-slate-500 block">/ month</span>
                    </td>

                    <td className="p-4">
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs">
                        {job.serviceTier === "module_1_resumes"
                          ? "M1: Resumes"
                          : job.serviceTier === "module_3_guarantee"
                          ? "M3: Guarantee"
                          : "M2: End-to-End"}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleStatusToggle(job._id, job.status)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                          job.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        {job.status}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          title="Toggle Verified"
                          onClick={() => handleBadgeToggle(job._id, "isVerified", !!job.isVerified)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            job.isVerified
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Toggle Urgent"
                          onClick={() => handleBadgeToggle(job._id, "isUrgent", !!job.isUrgent)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            job.isUrgent
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Toggle Featured"
                          onClick={() => handleBadgeToggle(job._id, "isFeatured", !!job.isFeatured)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            job.isFeatured
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => handleDelete(job._id, job.title)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalJobs}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setCurrentPage(page)}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-4"
        />
      )}
    </div>
  );
}
