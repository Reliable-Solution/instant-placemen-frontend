"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetEmployerJobsQuery,
  useUpdateEmployerJobStatusMutation,
} from "@/services/api/employerApi";
import {
  Briefcase,
  PlusCircle,
  MapPin,
  Users,
  Eye,
  CheckCircle2,
  PauseCircle,
  Clock,
  Building,
  Zap,
  Sparkles,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import DynamicPlanModal from "@/components/employer/DynamicPlanModal";

export default function EmployerJobsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobForPlan, setSelectedJobForPlan] = useState<any | null>(null);
  const PAGE_SIZE = 10;

  const { data: jobs = [], isLoading, refetch } = useGetEmployerJobsQuery({
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const totalJobs = (jobs as any).total ?? jobs.length;
  const totalPages = (jobs as any).totalPages ?? 1;

  const [updateStatus] = useUpdateEmployerJobStatusMutation();

  const handleToggle = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      await updateStatus({ id: jobId, status: nextStatus }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Job Postings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active mandates, openings, and direct candidate application pipelines.
          </p>
        </div>

        <Link href="/employer/jobs/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl gap-1.5 shadow-md shadow-blue-600/20">
            <PlusCircle className="w-4 h-4" />
            <span>Post New Mandate</span>
          </Button>
        </Link>
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            You have not posted any jobs yet. Click "Post New Mandate" to publish a vacancy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Job Role &amp; Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Salary Range</th>
                  <th className="p-4 text-center">Applicants</th>
                  <th className="p-4 text-center">Hiring Plan / Pipeline</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {jobs.map((job: any) => {
                  const plan = job.purchasedPlan;

                  return (
                    <tr key={job._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-900 text-xs">{job.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span>{job.category}</span>
                          <span className="text-slate-300 mx-1">•</span>
                          <span>{job.vacancies || 10} Openings</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-semibold">{job.city}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{job.locality}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-emerald-600">
                          ₹{(job.salaryMin / 1000).toFixed(0)}k - ₹{(job.salaryMax / 1000).toFixed(0)}k
                        </span>
                        <span className="text-[10px] text-slate-400 block">/ month</span>
                      </td>

                      <td className="p-4 text-center">
                        <Link href={`/employer/applicants?jobId=${job._id}`}>
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 font-bold text-xs cursor-pointer">
                            {job.applicantCount || 0} Applicants
                          </Badge>
                        </Link>
                      </td>

                      {/* Hiring Plan Status / Action */}
                      <td className="p-4 text-center">
                        {plan && plan.paymentStatus === "PAID" ? (
                          <div className="inline-flex flex-col items-center">
                            <Badge
                              className={`text-[10px] font-bold px-2 py-0.5 ${
                                plan.tier === "module_1_resumes"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : plan.tier === "module_2_hiring"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-indigo-50 text-indigo-800 border-indigo-200"
                              }`}
                            >
                              {plan.tier === "module_1_resumes"
                                ? `⚡ Mod 1: ${plan.deliveredQuantity || 0}/${plan.orderedQuantity} CVs`
                                : plan.tier === "module_2_hiring"
                                ? `🤝 Mod 2: Active (${plan.orderedQuantity} Hires)`
                                : `🛡️ Mod 3 Guarantee`}
                            </Badge>
                            <button
                              onClick={() => setSelectedJobForPlan(job)}
                              className="text-[10px] text-blue-600 hover:underline mt-1 font-semibold"
                            >
                              Upgrade Plan
                            </button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setSelectedJobForPlan(job)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[11px] h-7 px-3 rounded-lg shadow-xs gap-1"
                          >
                            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                            <span>Select Plan</span>
                          </Button>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggle(job._id, job.status)}
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${
                            job.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {job.status}
                        </button>
                      </td>

                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/employer/jobs/${job._id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 font-semibold rounded-xl gap-1.5 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/employer/jobs/${job._id}/edit`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 bg-white border-slate-200 text-slate-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 font-semibold rounded-xl gap-1.5 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/employer/applicants?jobId=${job._id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 font-semibold rounded-xl gap-1.5 transition-colors"
                            >
                              <Users className="w-3.5 h-3.5" />
                              Applicants
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Dynamic Role Pricing Modal */}
      <DynamicPlanModal
        isOpen={!!selectedJobForPlan}
        onClose={() => setSelectedJobForPlan(null)}
        job={selectedJobForPlan}
        onPlanActivated={() => {
          refetch();
          setSelectedJobForPlan(null);
        }}
      />
    </div>
  );
}
