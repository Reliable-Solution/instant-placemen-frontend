"use client";

import React, { useState, useEffect } from "react";
import { useGetAdminCandidatesQuery, useDeleteAdminUserMutation } from "@/services/api/adminApi";
import { useGetCandidateCitiesQuery } from "@/services/api/candidateApi";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  Phone,
  BadgeCheck,
  Eye,
  UserPlus,
  Trash2,
  X,
  Loader2,
  Sparkles,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { CandidateDetailModal } from "@/components/admin/CandidateDetailModal";
import { ListSkeleton } from "@/components/Skeleton";

export default function AdminCandidatesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [cityFilter, setCityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();
  const PAGE_SIZE = 12;

  // 300ms Debounce search input to optimize network queries
  useEffect(() => {
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setIsDebouncing(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination when debounced search or city filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, cityFilter]);

  const { data: cities = [] } = useGetCandidateCitiesQuery();
  const {
    data: candidates = [],
    isLoading,
    isFetching,
  } = useGetAdminCandidatesQuery({
    search: debouncedSearch || undefined,
    city: cityFilter !== "All" ? cityFilter : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const totalCandidates = (candidates as any).total ?? candidates.length;
  const totalPages = (candidates as any).totalPages ?? 1;

  // Clear search handler
  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

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

  // Helper to re-order skills so matching skills are shown first
  const getDisplayedSkills = (skills: string[] = [], term: string) => {
    if (!skills || skills.length === 0) return { shown: [], remaining: 0 };
    if (!term) {
      return {
        shown: skills.slice(0, 4),
        remaining: Math.max(0, skills.length - 4),
      };
    }
    const lowerTerm = term.toLowerCase();
    const sorted = [...skills].sort((a, b) => {
      const aMatch = String(a).toLowerCase().includes(lowerTerm);
      const bMatch = String(b).toLowerCase().includes(lowerTerm);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
    return {
      shown: sorted.slice(0, 4),
      remaining: Math.max(0, sorted.length - 4),
    };
  };

  const isSkillMatched = (skill: string) => {
    if (!debouncedSearch) return false;
    return String(skill).toLowerCase().includes(debouncedSearch.toLowerCase());
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Talent Pool</h1>
            <p className="text-xs text-slate-500 mt-1">
              Global search across candidate skills (e.g. JavaScript, Python, Tally), role, education, CV text, phone, and location.
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

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="relative w-full sm:w-96">
            {isDebouncing || isFetching ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute left-3.5 top-3" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            )}
            <Input
              type="text"
              placeholder="Search by skill (e.g. JavaScript), role, name, phone, resume..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-9 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-200"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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

            <span className="text-xs text-slate-500 font-semibold shrink-0 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              Total: <span className="text-slate-900 font-bold">{totalCandidates}</span>
            </span>
          </div>
        </div>

        {/* Active Filter Pill */}
        {(debouncedSearch || cityFilter !== "All") && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Active filters:</span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Keyword: "{debouncedSearch}"
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="hover:text-blue-900 ml-1"
                  title="Remove search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {cityFilter !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                City: {cityFilter}
                <button
                  type="button"
                  onClick={() => setCityFilter("All")}
                  className="hover:text-emerald-900 ml-1"
                  title="Remove city filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                handleClearSearch();
                setCityFilter("All");
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold ml-1"
            >
              Reset all
            </button>
          </div>
        )}

        {deleteError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center justify-between">
            <span>{deleteError}</span>
            <button onClick={() => setDeleteError(null)} className="text-rose-500 hover:text-rose-700 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Candidate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full">
              <ListSkeleton items={6} />
            </div>
          ) : candidates.length === 0 ? (
            <div className="col-span-full py-16 px-4 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Search className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">No candidates found</h3>
                <p className="text-xs text-slate-500">
                  {debouncedSearch
                    ? `No candidate matches "${debouncedSearch}". Try searching for broader terms, other skills (e.g. JavaScript, Python, React, Tally), or clearing city filters.`
                    : "No candidates match the selected filter criteria."}
                </p>
              </div>
              {(debouncedSearch || cityFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    handleClearSearch();
                    setCityFilter("All");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Search & Filters</span>
                </button>
              )}
            </div>
          ) : (
            candidates.map((c: any) => {
              const { shown: displayedSkills, remaining } = getDisplayedSkills(c.skills, debouncedSearch);

              return (
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
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1 group-hover:text-blue-600 transition-colors truncate">
                            <span className="truncate">{c.name}</span>
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          </h4>
                          {c.currentRole && (
                            <p className="text-xs font-semibold text-blue-600 truncate">
                              {c.currentRole}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{c.locality ? `${c.locality}, ` : ""}{c.city || "Surat"}</span>
                          </div>
                        </div>
                      </div>

                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs shrink-0">
                        Immediate
                      </Badge>
                    </div>

                    <div className="pt-1 text-xs text-slate-700 space-y-1">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <span className="font-semibold text-slate-700">{c.experience || "Fresher"}</span>
                        <span>•</span>
                        <span className="truncate">{c.qualification || "12th Pass"}</span>
                      </div>

                      {c.currentCompany && (
                        <div className="text-xs text-slate-600 flex items-center gap-1 truncate font-medium">
                          <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{c.currentCompany}</span>
                        </div>
                      )}

                      {c.resumeSummary && (
                        <p className="text-xs text-slate-500 italic line-clamp-2 mt-1">
                          "{c.resumeSummary}"
                        </p>
                      )}
                    </div>

                    {/* Skills Badges with Match Highlighting & Quick Add */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {displayedSkills && displayedSkills.length > 0 ? (
                        displayedSkills.map((skill: string, idx: number) => {
                          const matched = isSkillMatched(skill);
                          return (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-0.5 rounded-md border font-medium transition-colors ${
                                matched
                                  ? "bg-blue-100 text-blue-800 border-blue-300 font-bold shadow-2xs"
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })
                      ) : null}
                      {remaining > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md border border-blue-200 font-bold">
                          +{remaining} more
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(c);
                        }}
                        title="Add skills to this candidate"
                        className="inline-flex items-center gap-0.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 px-2 py-0.5 rounded-md border border-dashed border-blue-300 font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer / Action */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-emerald-600 font-bold">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(c);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, c)}
                        disabled={isDeleting}
                        title={confirmDeleteId === (c._id || c.id) ? "Click again to confirm delete" : "Delete candidate"}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                          confirmDeleteId === (c._id || c.id)
                            ? "text-white bg-rose-600 hover:bg-rose-700"
                            : "text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{confirmDeleteId === (c._id || c.id) ? "Confirm?" : ""}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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
        onUpdateCandidate={(updated) => setSelectedCandidate(updated)}
      />
    </>
  );
}

