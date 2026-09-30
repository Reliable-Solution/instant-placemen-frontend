"use client";

import React, { useState } from "react";
import { useGetLeadsQuery, useGetLeadStatsQuery } from "@/services/api/leadApi";
import { Phone, Calendar, TrendingUp, Users } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/Skeleton";

export default function AdminLeadsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;
  const { data: stats, isLoading: statsLoading } = useGetLeadStatsQuery();
  const { data: leadsData, isLoading: leadsLoading } = useGetLeadsQuery({ page: currentPage, limit: PAGE_SIZE });

  const leads = leadsData?.leads || [];
  const totalLeads = leadsData?.total ?? leads.length;
  const totalPages = leadsData?.totalPages ?? 1;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">WhatsApp Leads</h1>
        <p className="text-sm text-slate-500 mt-1">Mobile numbers collected from "Get Free Link"</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats?.todayCount || 0}</p>
              <p className="text-xs text-slate-500">Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats?.weekCount || 0}</p>
              <p className="text-xs text-slate-500">This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats?.totalCount || 0}</p>
              <p className="text-xs text-slate-500">Total Leads</p>
            </div>
          </div>
        </div>
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
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-bold text-slate-600">#</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600">Phone</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600">Source</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600">Date & Time</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-600">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => (
                  <tr key={lead._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-900">{lead.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(lead.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://wa.me/91${lead.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded-full"
                      >
                        Chat
                      </a>
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
          totalItems={totalLeads}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setCurrentPage(page)}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4"
        />
      )}
    </div>
  );
}
