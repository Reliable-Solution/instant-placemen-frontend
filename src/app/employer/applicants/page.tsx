"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useGetEmployerApplicantsQuery,
  useGetEmployerJobsQuery,
  useUpdateApplicantStageMutation,
} from "@/services/api/employerApi";
import {
  Users,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Briefcase,
  MapPin,
  Filter,
  Lock,
  Unlock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { useGetSettingsQuery } from "@/services/api/settingsApi";
import DynamicPlanModal from "@/components/employer/DynamicPlanModal";

function ApplicantsContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "ALL";

  const [jobIdFilter, setJobIdFilter] = useState(initialJobId);
  const [stageFilter, setStageFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [planModalJob, setPlanModalJob] = useState<any | null>(null);
  const PAGE_SIZE = 10;

  const { data: settingsData } = useGetSettingsQuery();
  const requirePlanForContacts = settingsData?.require_plan_for_contacts !== "false";

  React.useEffect(() => {
    setCurrentPage(1);
  }, [jobIdFilter, stageFilter]);

  const { data: jobs = [] } = useGetEmployerJobsQuery();
  const { data: applicants = [], isLoading, refetch } = useGetEmployerApplicantsQuery({
    jobId: jobIdFilter !== "ALL" ? jobIdFilter : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const totalApplicants = (applicants as any).total ?? applicants.length;
  const totalPages = (applicants as any).totalPages ?? 1;

  const [updateStage] = useUpdateApplicantStageMutation();

  const handleStageChange = async (appId: string, status: string) => {
    try {
      await updateStage({ id: appId, status }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = applicants.filter((a: any) =>
    stageFilter === "ALL" ? true : a.status === stageFilter
  );

  const openWhatsApp = (phone: string, candidateName: string, jobTitle: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${candidateName}, regarding your application for ${jobTitle} via Instant Placement, we would like to invite you for an interview. Please let us know your availability.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Applicant Pipeline & Screening</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review candidate submissions, schedule interviews, and advance hiring stages.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-600 shrink-0">Filter by Job:</label>
          <select
            value={jobIdFilter}
            onChange={(e) => setJobIdFilter(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none"
          >
            <option value="ALL">All Jobs ({jobs.length})</option>
            {jobs.map((j: any) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.city})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "NEW", "SCREENED", "INTERVIEW_SCHEDULED", "SELECTED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                stageFilter === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Applicants List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading applicants...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No applicants found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Candidate Details</th>
                  <th className="p-4">Applied Role</th>
                  <th className="p-4">Experience & Edu</th>
                  <th className="p-4">Current Stage</th>
                  <th className="p-4">Fast Connect</th>
                  <th className="p-4 text-right pr-6">Stage Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((app: any) => {
                const hasPurchasedPlan = Boolean(app.job?.purchasedPlan && app.job.purchasedPlan.paymentStatus === "PAID");
                const isContactUnlocked = hasPurchasedPlan;
                const rawPhone = app.candidatePhone || "";
                const displayPhone = isContactUnlocked
                  ? rawPhone
                  : rawPhone.length > 5
                  ? rawPhone.slice(0, 5) + "-•••••"
                  : "••••••••••";

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{app.candidateName}</span>
                          {isContactUnlocked && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] px-1 py-0 font-bold">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
                          {!isContactUnlocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                          <span className={isContactUnlocked ? "text-emerald-600 font-mono" : "text-slate-400 font-mono"}>
                            {displayPhone}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{app.candidateCity || "Surat Gujarat"}</span>

                        {/* Commute Feasibility Guarantee */}
                        {app.commuteConfirmed && (
                          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1 bg-emerald-50/80 border border-emerald-200/80 px-1.5 py-0.5 rounded-md w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Commute Verified: {app.commuteLocation || app.job?.locality || "Location Feasible"}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-blue-600 text-xs">{app.job?.title || "Job Mandate"}</div>
                        <span className="text-[10px] text-slate-400 block">{app.job?.city}</span>
                      </td>

                      <td className="p-4 text-slate-700">
                        <div>{app.experience}</div>
                        <span className="text-[10px] text-slate-400 block">{app.qualification}</span>
                      </td>

                      <td className="p-4">
                        <Badge
                          className={`text-[10px] ${
                            app.status === "NEW"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : app.status === "SELECTED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : app.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {app.status.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      <td className="p-4">
                        {isContactUnlocked ? (
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => openWhatsApp(rawPhone, app.candidateName, app.job?.title || "our role")}
                              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 rounded-xl shadow-sm"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </Button>
                            <a href={`tel:${rawPhone}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2.5 border-slate-200 text-slate-700 text-xs rounded-xl hover:bg-slate-50"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              setPlanModalJob(
                                app.job || { _id: app.jobId, title: "Candidate's Mandate" }
                              )
                            }
                            className="h-8 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs gap-1.5 rounded-xl shadow-xs font-bold"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-300" />
                            <span>Unlock Phone</span>
                          </Button>
                        )}
                      </td>

                      <td className="p-4 text-right pr-6">
                        <select
                          value={app.status}
                          onChange={(e) => handleStageChange(app._id, e.target.value)}
                          className="h-8 px-2.5 bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl focus:border-blue-500 shadow-sm"
                        >
                          <option value="NEW">NEW</option>
                          <option value="SCREENED">SCREENED</option>
                          <option value="INTERVIEW_SCHEDULED">INTERVIEW</option>
                          <option value="SELECTED">SELECTED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
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
          totalItems={totalApplicants}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setCurrentPage(page)}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-4"
        />
      )}

      {/* Dynamic Plan Modal */}
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

export default function EmployerApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading applicants...
        </div>
      }
    >
      <ApplicantsContent />
    </Suspense>
  );
}
