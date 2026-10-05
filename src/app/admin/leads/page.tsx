"use client";

import React, { useState } from "react";
import { useGetLeadsQuery, useGetLeadStatsQuery } from "@/services/api/leadApi";
import { Phone, Calendar, TrendingUp, Users, Briefcase, UserCheck, ChevronDown, FileText, Loader2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/Skeleton";

const TYPE_STYLE: Record<string, string> = {
  EMPLOYER: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  JOB_SEEKER: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  GENERAL: "bg-slate-100 text-slate-600 border border-slate-200",
};

const TYPE_LABEL: Record<string, string> = {
  EMPLOYER: "Employer",
  JOB_SEEKER: "Job Seeker",
  GENERAL: "General",
};

export default function AdminLeadsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [openingCv, setOpeningCv] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const { data: stats, isLoading: statsLoading } = useGetLeadStatsQuery();
  const { data: leadsData, isLoading: leadsLoading } = useGetLeadsQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    leadType: typeFilter || undefined,
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const leads = leadsData?.leads || [];
  const totalLeads = leadsData?.total ?? leads.length;
  const totalPages = leadsData?.totalPages ?? 1;

  const applySearch = () => {
    setSearch(searchInput.trim());
    setCurrentPage(1);
  };

  // CVs sit in private storage (JWT-gated), so open via authed fetch → blob
  const openCv = async (lead: any) => {
    if (!lead.resumeUrl) return;
    if (/^https?:\/\//i.test(lead.resumeUrl)) {
      window.open(lead.resumeUrl, "_blank", "noopener");
      return;
    }
    try {
      setOpeningCv(lead._id);
      const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : "";
      const res = await fetch(`${getApiBaseUrl()}${lead.resumeUrl}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("CV fetch failed");
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), "_blank", "noopener");
    } catch {
      alert("Could not open CV. Please try again.");
    } finally {
      setOpeningCv(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">WhatsApp Leads</h1>
        <p className="text-sm text-slate-500 mt-1">
          Employer + job seeker leads collected by the WhatsApp bot (n8n)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { icon: Calendar, bg: "bg-blue-50", fg: "text-blue-600", v: stats?.todayCount || 0, l: "Today", loading: statsLoading },
          { icon: TrendingUp, bg: "bg-emerald-50", fg: "text-emerald-600", v: stats?.weekCount || 0, l: "This Week", loading: statsLoading },
          { icon: Users, bg: "bg-purple-50", fg: "text-purple-600", v: stats?.totalCount || 0, l: "Total", loading: statsLoading },
          { icon: Briefcase, bg: "bg-indigo-50", fg: "text-indigo-600", v: stats?.employerCount ?? 0, l: "Employers", loading: statsLoading },
          { icon: UserCheck, bg: "bg-teal-50", fg: "text-teal-600", v: stats?.seekerCount ?? 0, l: "Job Seekers", loading: statsLoading },
          { icon: TrendingUp, bg: "bg-amber-50", fg: "text-amber-600", v: stats?.completeCount ?? 0, l: "Confirmed", loading: statsLoading },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${s.fg}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.loading ? "…" : s.v}</p>
                  <p className="text-xs text-slate-500">{s.l}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center gap-2">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
        >
          <option value="">All Types</option>
          <option value="EMPLOYER">Employers</option>
          <option value="JOB_SEEKER">Job Seekers</option>
          <option value="GENERAL">General</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
        >
          <option value="">All Status</option>
          <option value="Complete">Confirmed</option>
          <option value="Incomplete">In Progress</option>
        </select>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
          placeholder="Search name, phone, city…"
          className="h-9 flex-1 min-w-[180px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={applySearch}
          className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">All Leads ({leadsData?.total || 0})</h3>
        </div>

        {leadsLoading ? (
          <TableSkeleton rows={6} />
        ) : leads.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No leads yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-bold text-slate-600">Type</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600">Name / Phone</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600">City</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600">Updated</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600">WhatsApp</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const isOpen = expanded === lead._id;
                  const detailEntries = Object.entries(lead.details || {}).filter(
                    ([, v]) => v !== "" && v !== null && v !== undefined
                  );
                  return (
                    <React.Fragment key={lead._id}>
                      <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${TYPE_STYLE[lead.leadType || "GENERAL"] || TYPE_STYLE.GENERAL}`}>
                            {TYPE_LABEL[lead.leadType || "GENERAL"] || lead.leadType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{lead.name || "—"}</p>
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="w-3 h-3" /> +91 {lead.phone}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{lead.city || "—"}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${lead.status === "Complete" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                            {lead.status === "Complete" ? "Confirmed" : "In Progress"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          {new Date(lead.updatedAt || lead.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/91${lead.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded-full"
                            >
                              Chat
                            </a>
                            {lead.resumeUrl && (
                              <button
                                onClick={() => openCv(lead)}
                                disabled={openingCv === lead._id}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded-full disabled:opacity-50"
                                title={lead.resumeOriginalName || "View CV"}
                              >
                                {openingCv === lead._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <FileText className="w-3 h-3" />
                                )}
                                CV
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {detailEntries.length > 0 && (
                            <button
                              onClick={() => setExpanded(isOpen ? null : lead._id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                              title="View collected details"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            </button>
                          )}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-slate-50/70 border-b border-slate-100">
                          <td colSpan={7} className="px-6 py-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
                              {detailEntries.map(([k, v]) => (
                                <p key={k} className="text-xs">
                                  <span className="font-bold text-slate-500">{k}: </span>
                                  <span className="text-slate-800">{String(v)}</span>
                                </p>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
          totalItems={totalLeads}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setCurrentPage(page)}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4"
        />
      )}
    </div>
  );
}
