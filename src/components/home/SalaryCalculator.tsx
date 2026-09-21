"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useGetCategoriesQuery, useGetCitiesQuery } from "@/services/api/jobsApi";

const DEFAULT_BENCHMARKS: Record<string, { min: number; max: number; avg: number; topPerks: string[] }> = {
  "Telecaller / BPO": { min: 18000, max: 35000, avg: 24000, topPerks: ["Fixed Sunday Off", "Cab Drop", "Incentives"] },
  "Delivery Partner": { min: 25000, max: 45000, avg: 34000, topPerks: ["Daily Payouts", "Fuel Allowance", "₹5L Insurance"] },
  "Back Office / Excel": { min: 18000, max: 32000, avg: 23000, topPerks: ["5 Days Work", "Day Shift", "PF/ESIC"] },
  "Field Sales Executive": { min: 22000, max: 55000, avg: 36000, topPerks: ["Unlimited Incentives", "Travel Reimbursement"] },
  "Accounts & Tally": { min: 20000, max: 42000, avg: 28000, topPerks: ["Annual Increment", "Bonus", "Day Shift"] },
  "IT Desktop Support": { min: 24000, max: 48000, avg: 33000, topPerks: ["Corporate Medical", "Certifications Support"] },
  "Retail Sales Associate": { min: 16000, max: 28000, avg: 21000, topPerks: ["Store Discount", "Overtime Pay"] },
};

export const SalaryCalculator: React.FC = () => {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: cities = [] } = useGetCitiesQuery();

  const [selectedRole, setSelectedRole] = useState("");
  const [exp, setExp] = useState("Fresher");
  const [selectedCity, setSelectedCity] = useState("");

  const roleOptions = useMemo(() => {
    if (categories.length > 0) {
      const names = categories.map((c: any) => c?.title || c?.name).filter(Boolean) as string[];
      if (names.length > 0) return names;
    }
    return Object.keys(DEFAULT_BENCHMARKS);
  }, [categories]);

  const cityOptions = useMemo(() => {
    if (cities.length > 0) {
      const names = cities.map((c) => c?.name).filter(Boolean) as string[];
      if (names.length > 0) return names;
    }
    return ["Surat", "Mumbai", "Bengaluru", "Pune", "Delhi NCR", "Hyderabad"];
  }, [cities]);

  const activeRole = selectedRole || roleOptions[0] || "Telecaller / BPO";
  const activeCity = selectedCity || cityOptions[0] || "Surat";

  // Calculate benchmark based on dynamic category or fallback
  const benchmark = useMemo(() => {
    const roleLower = (activeRole || "").toLowerCase();
    const foundCat = categories.find(
      (c: any) => (c?.title?.toLowerCase() === roleLower) || (c?.name?.toLowerCase() === roleLower)
    );
    if (foundCat && foundCat.avgSalary) {
      const match = foundCat.avgSalary.match(/₹?(\d+)K?\s*-\s*₹?(\d+)K?/i);
      if (match) {
        const minK = parseInt(match[1], 10) * (match[1].length <= 2 ? 1000 : 1);
        const maxK = parseInt(match[2], 10) * (match[2].length <= 2 ? 1000 : 1);
        return {
          min: minK,
          max: maxK,
          avg: Math.round((minK + maxK) / 2),
          topPerks: ["Fixed Sunday Off", "PF & Medical Insurance", "Performance Incentives"],
        };
      }
    }
    return DEFAULT_BENCHMARKS[activeRole] || DEFAULT_BENCHMARKS["Telecaller / BPO"];
  }, [activeRole, categories]);


  const expMultiplier = exp === "Fresher" ? 1 : exp === "1-2 Years" ? 1.25 : 1.5;
  const cityMultiplier = activeCity.includes("Mumbai") || activeCity.includes("Bengaluru") ? 1.1 : 1.0;

  const estimatedMin = Math.round((benchmark.min * expMultiplier * cityMultiplier) / 500) * 500;
  const estimatedMax = Math.round((benchmark.max * expMultiplier * cityMultiplier) / 500) * 500;
  const inHandAvg = Math.round(((estimatedMin + estimatedMax) / 2) / 500) * 500;

  return (
    <section className="py-14 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Form */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              <span>Real-Time Market Salary Estimator</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Know Your True Market Salary
            </h2>
            <p className="text-slate-500 text-sm">
              Discover average in-hand monthly salaries verified across local companies and job openings.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Job Role</label>
                <select
                  value={activeRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Experience</label>
                  <select
                    value={exp}
                    onChange={(e) => setExp(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                  >
                    <option value="Fresher">Fresher (0 years)</option>
                    <option value="1-2 Years">1 - 2 Years</option>
                    <option value="3+ Years">3+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target City</label>
                  <select
                    value={activeCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                  >
                    {cityOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>


          {/* Right Salary Box */}
          <div className="lg:col-span-6">
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    Estimated Monthly In-Hand
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-amber-300 mt-1">
                    ₹{estimatedMin.toLocaleString("en-IN")} - ₹{estimatedMax.toLocaleString("en-IN")}
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">Average Take-Home: ₹{inHandAvg.toLocaleString("en-IN")} / month</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Perks */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
                  Typical Company Benefits for this Role:
                </p>
                <div className="flex flex-wrap gap-2">
                  {benchmark.topPerks.map((p, i) => (
                    <span
                      key={i}
                      className="bg-white/10 text-white text-xs px-3 py-1 rounded-lg border border-white/15 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => {
                    const el = document.getElementById("jobs-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  variant="gradient"
                  className="w-full h-12 text-sm font-bold gap-2 rounded-xl"
                >
                  <span>Explore Jobs Paying ₹{estimatedMin.toLocaleString("en-IN")}+</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
