"use client";

import React, { useState } from "react";
import { useGetAdminSubscriptionsQuery } from "@/services/api/adminApi";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  IndianRupee,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/Skeleton";

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<"SUCCESS" | "CREATED" | "FAILED">("SUCCESS");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const { data, isLoading, refetch, isFetching } = useGetAdminSubscriptionsQuery(
    statusFilter !== "ALL" ? { status: statusFilter } : undefined
  );

  const subscriptions = data?.subscriptions || [];
  const pending = data?.pending || [];
  const failed = data?.failed || [];

  const filterList = (list: any[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((item: any) => {
      const empName = item.employer?.companyName || item.employer?.name || item.employerId?.companyName || item.employerId?.name || "";
      const planTitle = item.plan?.title || item.planTitle || "";
      const email = item.employer?.email || item.employerId?.email || "";
      const paymentId = item.paymentId || item.razorpayPaymentId || item._id || "";
      return (
        empName.toLowerCase().includes(q) ||
        planTitle.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        paymentId.toLowerCase().includes(q)
      );
    });
  };

  const currentList =
    activeTab === "SUCCESS"
      ? filterList(subscriptions)
      : activeTab === "CREATED"
      ? filterList(pending)
      : filterList(failed);

  const activeCount = subscriptions.filter((s: any) => s.status === "ACTIVE").length;
  const expiredCount = subscriptions.filter((s: any) => s.status === "EXPIRED").length;
  const totalPaidRevenue = subscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-indigo-600" />
            <span>Employer Subscriptions & Plans</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time verified payments via Razorpay. Live expiry enforcement for candidate contact access.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-indigo-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-300" />
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl border shadow-sm text-emerald-600 bg-emerald-50 border-emerald-200">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-200">
              Verified
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">Verified Revenue</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            ₹{totalPaidRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {subscriptions.length} successful transactions
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-indigo-300" />
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl border shadow-sm text-indigo-600 bg-indigo-50 border-indigo-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border text-indigo-700 bg-indigo-50 border-indigo-200">
              Live
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">Active Plans</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{activeCount}</p>
          <p className="text-xs text-slate-500 mt-1">Non-expired employer access</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300" />
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl border shadow-sm text-amber-600 bg-amber-50 border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border text-amber-700 bg-amber-50 border-amber-200">
              Masked
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">Expired Plans</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{expiredCount}</p>
          <p className="text-xs text-slate-500 mt-1">Candidate access masked</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 to-rose-300" />
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl border shadow-sm text-rose-600 bg-rose-50 border-rose-200">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border text-rose-700 bg-rose-50 border-rose-200">
              Action
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">Abandoned / Failed</p>
          <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            {pending.length + failed.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {pending.length} pending · {failed.length} failed
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab Controls & Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab("SUCCESS")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "SUCCESS"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Verified Payments ({subscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("CREATED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "CREATED"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Pending Checkout ({pending.length})
            </button>
            <button
              onClick={() => setActiveTab("FAILED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "FAILED"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Failed Attempts ({failed.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "SUCCESS" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Expiry Statuses</option>
                <option value="ACTIVE">Only Active</option>
                <option value="EXPIRED">Only Expired</option>
              </select>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <Input
                type="text"
                placeholder="Search company, plan, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-white border-slate-200 text-xs text-slate-900 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium">
            No subscription records found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Employer / Company</th>
                  <th className="p-4">Subscribed Plan</th>
                  <th className="p-4 text-center">Amount Paid</th>
                  <th className="p-4 text-center">Paid Date</th>
                  <th className="p-4 text-center">Expires On</th>
                  <th className="p-4 text-center">Plan Status</th>
                  <th className="p-4 text-right pr-6">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {currentList.map((item: any) => {
                  const employer = item.employer || item.employerId || {};
                  const planTitle =
                    typeof item.plan === "object" && item.plan !== null
                      ? item.plan.title
                      : typeof item.planTitle === "string"
                      ? item.planTitle
                      : "Hiring Plan";

                  const planIdentifier =
                    typeof item.plan === "object" && item.plan !== null
                      ? item.plan._id || item.plan.title || "Module Plan"
                      : typeof item.plan === "string"
                      ? item.plan
                      : typeof item.planId === "string"
                      ? item.planId
                      : "Module Tier";

                  const isSuccessTab = activeTab === "SUCCESS";
                  const isPlanActive = isSuccessTab && item.status === "ACTIVE";

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {employer.companyName || employer.name || "Unknown Company"}
                            </div>
                            <div className="text-slate-500 text-xs">
                              {employer.email || "No email"} · {employer.phone || "No phone"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">{planTitle}</div>
                        <div className="text-slate-500 text-xs">
                          {planIdentifier}
                        </div>
                      </td>

                      <td className="p-4 text-center font-bold text-slate-900">
                        ₹{(item.amount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-center text-slate-600 font-medium">
                        {item.paidAt
                          ? new Date(item.paidAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="p-4 text-center">
                        {item.expiresAt ? (
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              isPlanActive ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(item.expiresAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        {isSuccessTab ? (
                          <Badge
                            className={`px-2.5 py-0.5 text-xs font-bold border ${
                              isPlanActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {isPlanActive ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ACTIVE
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                EXPIRED
                              </span>
                            )}
                          </Badge>
                        ) : (
                          <Badge
                            className={`px-2.5 py-0.5 text-xs font-bold border ${
                              activeTab === "CREATED"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {activeTab}
                          </Badge>
                        )}
                      </td>

                      <td className="p-4 text-right pr-6 font-mono text-xs text-slate-500">
                        {item.paymentId || item.razorpayPaymentId || item.orderId || item._id}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
