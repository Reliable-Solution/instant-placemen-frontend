"use client";

import React, { useState } from "react";
import { useGetAdminCandidatesQuery, useDeleteAdminUserMutation } from "@/services/api/adminApi";
import { useGetCandidateCitiesQuery } from "@/services/api/candidateApi";
import Link from "next/link";
import {
  Users,
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  FileText,
  BadgeCheck,
  Eye,
  ExternalLink,
  UserPlus,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { CandidateDetailModal } from "@/components/admin/CandidateDetailModal";
import { ListSkeleton } from "@/components/Skeleton";

export default function AdminCandidatesPage() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();
  const PAGE_SIZE = 12;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, cityFilter]);

  const { data: cities = [] } = useGetCandidateCitiesQuery();
  const { data: candidates = [], isLoading } = useGetAdminCandidatesQuery({
    search: search || undefined,
    city: cityFilter !== "All" ? cityFilter : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const totalCandidates = (candidates as any).total ?? candidates.length;
  const totalPages = (candidates as any).totalPages ?? 1;

  // Two-step delete: first click arms, second click deletes.
  const handleDeleteClick = async (e: React.MouseEvent, c: any) => {
    e.stopPropagation();
    const id = c._id || c.id;
    if (!id) return;
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setDeleteError(null);
      setTimeout(() => {
        setConfirmDeleteId((cur) => (cur === id ? null : cur));
      }, 4000);
      return;
    }
    try {
      const res = await deleteUser(id).unwrap();
      if (res?.success) {
        setConfirmDeleteId(null);
        if (selectedCandidate && (selectedCandidate._id === id || selectedCandidate.id === id)) {
          setSelectedCandidate(null);
        }
      } else {
        setDeleteError(res?.message || "Delete failed.");
        setConfirmDeleteId(null);
      }
    } catch (err: any) {
      setDeleteError(err?.data?.message || err?.message || "Delete failed.");
      setConfirmDeleteId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Talent Pool</h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore all registered candidates, verified skills, and direct contact details. Click any candidate to view their complete profile and CV.
          </p>
        </div>
        <Link
          href="/admin/candidates/add"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add / Import Candidate</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <Input
            type="text"
            placeholder="Search candidate by name, skill, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-500 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Cities</option>
            {cities.map((c: any) => (
              <option key={c.name} value={c.name}>
                {c.name} {c.candidateCount ? `(${c.candidateCount})` : ""}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 font-semibold shrink-0">
            Total: <span className="text-slate-900 font-bold">{totalCandidates}</span>
          </span>
        </div>
      </div>

      {deleteError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-rose-500 hover:text-rose-700 font-bold">Dismiss</button>
        </div>
      )}

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full">
            <ListSkeleton items={6} />
          </div>
        ) : candidates.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500">
            No candidates match the filter criteria.
          </div>
        ) : (
          candidates.map((c: any) => (
            <div
              key={c._id}
              onClick={() => setSelectedCandidate(c)}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500 hover:shadow-lg transition-all shadow-sm cursor-pointer group relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-xs border border-blue-200 overflow-hidden shrink-0">
                      {c.avatar ? (
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{c.name ? c.name.charAt(0).toUpperCase() : "C"}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                        <span>{c.name}</span>
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{c.locality ? `${c.locality}, ` : ""}{c.city || "Surat"}</span>
                      </div>
                    </div>
                  </div>

                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs shrink-0">
                    Immediate
                  </Badge>
                </div>

                <div className="pt-1 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <span className="font-semibold text-blue-600">{c.experience || "Fresher"}</span>
                    <span>•</span>
                    <span className="truncate">{c.qualification || "12th Pass"}</span>
                  </div>

                  {c.currentCompany && (
                    <div className="text-xs text-slate-600 flex items-center gap-1 truncate font-medium">
                      <span>🏢</span>
                      <span className="truncate">{c.currentCompany}</span>
                    </div>
                  )}

                  {c.resumeSummary && (
                    <p className="text-xs text-slate-500 italic line-clamp-2 mt-1">
                      "{c.resumeSummary}"
                    </p>
                  )}
                </div>

                {/* Skills Badges */}
                {c.skills && c.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.skills.slice(0, 4).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {c.skills.length > 4 && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md border border-blue-200 font-bold">
                        +{c.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer / Action */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{c.phone}</span>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCandidate(c);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Full Profile</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(e, c)}
                  disabled={isDeleting}
                  title={confirmDeleteId === (c._id || c.id) ? "Click again to confirm delete" : "Delete candidate"}
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                    confirmDeleteId === (c._id || c.id)
                      ? "text-white bg-rose-600 hover:bg-rose-700"
                      : "text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{confirmDeleteId === (c._id || c.id) ? "Confirm?" : "Delete"}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCandidates}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setCurrentPage(page)}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-4"
        />
      )}

      </div>

      {/* Full Candidate Profile & CV Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </>
  );
}

