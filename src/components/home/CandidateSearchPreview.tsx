"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchCandidatesQuery, useGetCandidateCitiesQuery } from "@/services/api/candidateApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Sparkles,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";

interface CandidateSearchPreviewProps {
  onOpenPostJobModal: () => void;
}

export const CandidateSearchPreview: React.FC<CandidateSearchPreviewProps> = ({
  onOpenPostJobModal,
}) => {
  const [roleQuery, setRoleQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All Cities");

  const { data: cities = [] } = useGetCandidateCitiesQuery();
  const { data: candidates = [], isLoading } = useSearchCandidatesQuery({
    query: roleQuery || undefined,
    city: cityFilter !== "All Cities" ? cityFilter : undefined,
  });

  const [unlockedIds, setUnlockedIds] = useState<Record<string, boolean>>({});

  const handleUnlock = (id: string) => {
    setUnlockedIds((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            For Employers & Recruiters
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-3 tracking-tight">
            Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">10 Lakh+</span> Active Candidate Profiles
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            Browse verified local job seekers ready for immediate joining in your city.
          </p>
        </div>

        {/* Search Filter Bar */}
        <div className="bg-slate-800/60 backdrop-blur-xl p-3 rounded-2xl border border-slate-700/50 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-2 mb-10 shadow-2xl shadow-black/20">
          <div className="sm:col-span-6 flex items-center gap-2 px-3 bg-slate-900/80 rounded-xl border border-slate-700/50 focus-within:border-emerald-500/50 transition-colors">
            <Search className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="text"
              placeholder="Search candidate by skill or role (e.g. Telecaller, Excel, Tally)..."
              value={roleQuery}
              onChange={(e) => setRoleQuery(e.target.value)}
              className="w-full h-11 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full h-11 px-3 bg-slate-900/80 text-white text-xs font-semibold rounded-xl border border-slate-700/50 focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="All Cities">All Cities</option>
              {cities.map((c: any) => (
                <option key={c.name} value={c.name}>
                  {c.name} {c.candidateCount ? `(${c.candidateCount})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <Link href="/employer/login">
              <Button
                variant="gradient"
                className="w-full h-11 text-xs font-bold rounded-xl gap-1.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Employer Portal</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Candidate Resume Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {isLoading ? (
            <div className="col-span-full py-12 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                Loading active candidates from database...
              </div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No candidates found for this search. Try a different city or role.
            </div>
          ) : (
            candidates.slice(0, 6).map((c: any) => {
              const isUnlocked = !!unlockedIds[c._id];
              return (
                <div
                  key={c._id}
                  className="group bg-gradient-to-b from-slate-800/90 to-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                          {c.name ? c.name.charAt(0) : "C"}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center gap-1">
                            <span>{c.name}</span>
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {c.city}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] py-0.5 shrink-0">
                        Immediate Joiner
                      </Badge>
                    </div>

                    <div className="pt-1">
                      <p className="font-semibold text-xs text-emerald-300">
                        {c.skills?.[0] ? `${c.skills[0]} Specialist` : "Verified Candidate"}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{c.experience}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{c.qualification}</span>
                      </div>
                      {c.resumeSummary && (
                        <p className="text-[11px] text-slate-400 italic line-clamp-2 mt-1.5 leading-relaxed">
                          &quot;{c.resumeSummary}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.skills?.map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/20"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-700/50 flex items-center justify-between">
                    {isUnlocked ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{c.phone}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Phone: +91 98••••••••</span>
                    )}

                    <Button
                      onClick={() => handleUnlock(c._id)}
                      size="sm"
                      variant="outline"
                      className={`text-xs h-8 px-3 rounded-lg transition-all ${
                        isUnlocked
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-transparent border-slate-600 text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400"
                      }`}
                    >
                      {isUnlocked ? "Contact Visible" : "Unlock Mobile"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
