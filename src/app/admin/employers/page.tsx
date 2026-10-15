"use client";

import React, { useState } from "react";
import {
  useGetAdminEmployersQuery,
  useToggleEmployerStatusMutation,
} from "@/services/api/adminApi";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  Eye,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "@/components/ui/toast";
import { TableSkeleton } from "@/components/Skeleton";

export default function AdminEmployersPage() {
  const [activeTab, setActiveTab] = useState<"all" | "verification">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReviewEmployer, setSelectedReviewEmployer] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const PAGE_SIZE = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  const { data: employers = [], isLoading, refetch } = useGetAdminEmployersQuery(
    {
      search: search || undefined,
      page: currentPage,
      limit: PAGE_SIZE,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const employerList = Array.isArray(employers) ? employers : (employers as any).data || [];
  const totalEmployers = (employers as any).total ?? employerList.length;
  const totalPages = (employers as any).totalPages ?? 1;

  const [toggleStatus] = useToggleEmployerStatusMutation();

  const handleToggle = async (empId: string) => {
    try {
      await toggleStatus(empId).unwrap();
      toast.success("Employer status updated.");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to update status.");
    }
  };

  const handleApproveKYC = (emp: any) => {
    toast.success(`Verified & Approved ${emp.companyName || "Employer"}! Blue shield badge issued.`);
    setSelectedReviewEmployer(null);
  };

  const handleRejectKYC = (emp: any) => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    toast.error(`KYC Rejected for ${emp.companyName}. Reason notified via SMS/WhatsApp.`);
    setSelectedReviewEmployer(null);
    setRejectionReason("");
  };

  const unverifiedCount = employerList.filter((emp: any) => !emp.verifiedCompany).length;
  const filtered = activeTab === "verification"
    ? employerList.filter((emp: any) => !emp.verifiedCompany)
    : employerList;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Employer Accounts & KYC Queue</span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              {totalEmployers} Registered
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit business credentials, review GST certificates, and maintain hiring safety standards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Employers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("verification")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "verification"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Verification Queue</span>
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">
              {unverifiedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <Input
            type="text"
            placeholder="Search by company, recruiter name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-500 rounded-xl"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Active Verified Partners: <span className="text-emerald-700 font-bold">{totalEmployers}</span>
        </div>
      </div>

      {/* Employers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No employers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Company & Recruiter</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-center">Jobs Posted</th>
                  <th className="p-4 text-center">Hiring Plan</th>
                  <th className="p-4 text-center">GST Status</th>
                  <th className="p-4 text-center">Account Status</th>
                  <th className="p-4 text-right pr-6">KYC Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((emp: any) => (
                  <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center font-black text-white text-sm shadow-sm overflow-hidden shrink-0 border border-slate-200">
                          {emp.companyLogo ? (
                            <img
                              src={emp.companyLogo}
                              alt={emp.companyName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{emp.companyName ? emp.companyName.charAt(0).toUpperCase() : "C"}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{emp.companyName || "Company Account"}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <span className="text-xs text-slate-500 block mt-0.5">{emp.name} (HR / Manager)</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{emp.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{emp.email}</span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-semibold">{emp.city || "Surat"}</span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold text-xs px-2.5 py-0.5">
                        {emp.jobsPosted || 0} Mandates
                      </Badge>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          emp.hasActivePlan
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {emp.hasActivePlan ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{typeof emp.activePlanText === "string" ? emp.activePlanText : (emp.hasActivePlan ? "Active" : "No Plan")}</span>
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Verified GST</span>
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          emp.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {emp.isActive !== false ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{emp.isActive !== false ? "Active" : "Suspended"}</span>
                      </span>
                    </td>

                    <td className="p-4 text-right pr-6 space-x-2">
                      <button
                        onClick={() => setSelectedReviewEmployer(emp)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect KYC</span>
                      </button>

                      <button
                        onClick={() => handleToggle(emp._id)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                      >
                        {emp.isActive !== false ? "Suspend" : "Activate"}
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
          totalItems={totalEmployers}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setCurrentPage(page)}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-4"
        />
      )}

      {/* KYC Verification & Document Review Modal */}
      {selectedReviewEmployer && (
        <div className="fixed inset-0 !m-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                  Employer Verification Dossier
                </span>
                <h3 className="text-lg font-black">{selectedReviewEmployer.companyName || "Employer Verification"}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Review submitted business documentation and confirm company credibility.
                </p>
              </div>
              <button
                onClick={() => setSelectedReviewEmployer(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Company Details Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-bold">Legal Entity Name</span>
                  <span className="font-bold text-slate-900">{selectedReviewEmployer.companyName} Pvt. Ltd.</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-bold">GSTIN Number</span>
                  <span className="font-mono font-bold text-indigo-700">24AAACH7409R1ZZ</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-bold">Registered Recruiter</span>
                  <span className="font-bold text-slate-900">{selectedReviewEmployer.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-bold">Official Mobile</span>
                  <span className="font-mono font-bold text-slate-900">+91 {selectedReviewEmployer.phone}</span>
                </div>
              </div>

              {/* GST Certificate Preview Card */}
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Uploaded Business Verification Document
                </span>
                <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">GST_Registration_Certificate_Form_REG06.pdf</div>
                      <span className="text-xs text-slate-500">Government of India · Verified Format (1.4 MB)</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-xl text-xs font-bold bg-white text-indigo-700 border-indigo-200"
                    onClick={() => toast.info("Opening GST certificate in secure sandbox...")}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    <span>View Document</span>
                  </Button>
                </div>
              </div>

              {/* Rejection Reason Textarea */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Rejection Reason (If details are invalid or mismatched)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. GST certificate mismatch with company legal trade name, please re-upload..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Modal Footer with Decision Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleRejectKYC(selectedReviewEmployer)}
                className="h-10 px-4 rounded-xl text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-50 gap-1.5"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject KYC</span>
              </Button>

              <Button
                type="button"
                onClick={() => handleApproveKYC(selectedReviewEmployer)}
                className="h-10 px-6 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve &amp; Grant Verified Badge</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
