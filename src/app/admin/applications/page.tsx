"use client";

import React, { useState } from "react";
import {
  useGetAdminApplicationsQuery,
  useUpdateAdminApplicationStatusMutation,
} from "@/services/api/adminApi";
import {
  FileText,
  Filter,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/Skeleton";

const STAGES = [
  "ALL",
  "NEW",
  "SCREENED",
  "SHARED_WITH_CLIENT",
  "INTERVIEW_SCHEDULED",
  "SELECTED",
  "JOINED",
  "REJECTED",
];

export default function AdminApplicationsPage() {
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedStage]);

  const { data: applications = [], isLoading } = useGetAdminApplicationsQuery({
    status: selectedStage !== "ALL" ? selectedStage : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const totalApps = (applications as any).total ?? applications.length;
  const totalPages = (applications as any).totalPages ?? 1;

  const [updateStatus] = useUpdateAdminApplicationStatusMutation();

  const handleStageChange = async (appId: string, status: string) => {
    try {
      await updateStatus({ id: appId, status }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const getStageBadgeColor = (st: string) => {
    switch (st) {
      case "NEW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SCREENED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "SHARED_WITH_CLIENT":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "INTERVIEW_SCHEDULED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SELECTED":
      case "JOINED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Applicant Tracking System (ATS)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor candidate pipeline stages from first application to tele-screening and Day 1 placement.
        </p>
      </div>

      {/* Stage Filter Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-2 overflow-x-auto shadow-sm">
        {STAGES.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStage(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedStage === st
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            {st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No candidate applications found for the selected stage.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Candidate Details</th>
                  <th className="p-4">Applied Job & Company</th>
                  <th className="p-4">Profile Match</th>
                  <th className="p-4">Current Stage</th>
                  <th className="p-4 text-right pr-6">Change ATS Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.map((app: any) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900 text-xs">{app.candidateName}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span className="font-semibold text-emerald-600">{app.candidatePhone}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {app.candidateCity || "Surat Gujarat"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-blue-600 text-xs">{app.jobTitle}</div>
                      <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">{app.company}</span>
                    </td>

                    <td className="p-4 text-slate-700">
                      <div className="text-[11px] space-y-0.5">
                        <div>
                          <span className="text-slate-400">Exp:</span> {app.experience || "Fresher"}
                        </div>
                        <div>
                          <span className="text-slate-400">Edu:</span> {app.qualification || "12th Pass"}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge className={`text-[10px] ${getStageBadgeColor(app.status)}`}>
                        {app.status.replace(/_/g, " ")}
                      </Badge>
                    </td>

                    <td className="p-4 text-right pr-6">
                      <select
                        value={app.status}
                        onChange={(e) => handleStageChange(app._id, e.target.value)}
                        className="h-8 px-3 bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl focus:border-blue-500 shadow-sm"
                      >
                        <option value="NEW">NEW</option>
                        <option value="SCREENED">SCREENED</option>
                        <option value="SHARED_WITH_CLIENT">SHARED WITH CLIENT</option>
                        <option value="INTERVIEW_SCHEDULED">INTERVIEW SCHEDULED</option>
                        <option value="SELECTED">SELECTED</option>
                        <option value="JOINED">JOINED (PLACED)</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
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
          totalItems={totalApps}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setCurrentPage(page)}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-4"
        />
      )}
    </div>
  );
}
