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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

export default function AdminEmployersPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data: employers = [], isLoading } = useGetAdminEmployersQuery({
    search: search || undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const totalEmployers = (employers as any).total ?? employers.length;
  const totalPages = (employers as any).totalPages ?? 1;

  const [toggleStatus] = useToggleEmployerStatusMutation();

  const handleToggle = async (empId: string) => {
    try {
      await toggleStatus(empId).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = employers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registered Employers & Clients</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review business accounts, verify recruitment partners, and inspect mandate volume.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <Input
            type="text"
            placeholder="Search by company, person, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Total Employers: <span className="text-slate-900 font-bold">{totalEmployers}</span>
        </div>
      </div>

      {/* Employers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading employers from database...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No employers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Company & Recruiter</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-center">Jobs Posted</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((emp: any) => (
                  <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-extrabold text-white text-sm shadow-sm overflow-hidden shrink-0 border border-slate-200">
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
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{emp.name} (HR / Manager)</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">{emp.city || "Surat Gujarat"}</span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-xs px-2.5 py-0.5">
                        {emp.jobsPosted || 0} Mandates
                      </Badge>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          emp.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {emp.isActive !== false ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{emp.isActive !== false ? "Active" : "Suspended"}</span>
                      </span>
                    </td>

                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => handleToggle(emp._id)}
                        className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                      >
                        {emp.isActive !== false ? "Deactivate" : "Activate"}
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
    </div>
  );
}
