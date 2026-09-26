"use client";

import React, { useState } from "react";
import { useGetServiceModulesQuery } from "@/services/api/jobsApi";
import {
  useGetEmployerProfileQuery,
  useUpdateEmployerProfileMutation,
} from "@/services/api/employerApi";
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
  ExternalLink,
  Check,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EmployerPlansPage() {
  const { data: plans = [], isLoading } = useGetServiceModulesQuery();
  const { data: profile, refetch: refetchProfile } = useGetEmployerProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateEmployerProfileMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Determine active plan IDs
  const activePlanIds: string[] = profile?.activePlanIds || [];
  const activePlanText: string = profile?.activePlanText || profile?.activePlan || "Module 1 Active";

  const handleActivatePlan = async (plan: any) => {
    try {
      const planName = plan.title.replace(/^Module \d+:\s*/, "");
      const shortTierName = plan.id === "module_1_resumes" 
        ? "Module 1 Active" 
        : plan.id === "module_2_hiring" 
        ? "Module 2 Active" 
        : "Module 3 Active";

      await updateProfile({
        activePlan: shortTierName,
        activePlans: [plan.id],
      }).unwrap();

      setSuccessMessage(`Successfully switched active plan to ${plan.title}!`);
      refetchProfile();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Failed to activate plan:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span>Hiring Plans & Pricing</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View available recruitment service tiers. Manage your active subscription to unlock candidate pipelines.
          </p>
        </div>

        {/* Current Active Plan Badge */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
              Active Subscription
            </span>
            <span className="text-xs font-black text-slate-900">
              {activePlanText}
            </span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Plans Grid */}
      {isLoading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No plans available</p>
          <p className="text-xs text-slate-400 mt-1">Contact admin to set up hiring plans.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan: any, idx: number) => {
            const planId = plan.id || plan._id || `plan-${idx}`;
            const isPopular = plan.isPopular || String(planId).includes("2");
            const isGuarantee = plan.replacementGuarantee || String(planId).includes("3");
            
            // Check if this plan is activated
            const isPlanActive = 
              activePlanIds.includes(planId) || 
              (activePlanText.toLowerCase().includes("module 1") && planId.includes("1")) ||
              (activePlanText.toLowerCase().includes("module 2") && planId.includes("2")) ||
              (activePlanText.toLowerCase().includes("module 3") && planId.includes("3"));

            return (
              <div
                key={planId}
                className={`bg-white rounded-2xl border-2 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative ${
                  isPlanActive
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                    : isPopular
                    ? "border-blue-600"
                    : isGuarantee
                    ? "border-emerald-400"
                    : "border-slate-200"
                }`}
              >
                {/* Active Plan Banner or Popular Tag */}
                {isPlanActive ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Plan</span>
                  </div>
                ) : isPopular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current text-amber-300" />
                    <span>Most Popular</span>
                  </div>
                ) : null}

                <div>
                  {/* Badge & Icon */}
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <Badge className={`text-[10px] font-bold ${
                      isPlanActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : isGuarantee
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {isGuarantee ? "Module 3" : isPopular ? "Module 2" : "Module 1"}
                    </Badge>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isPlanActive
                        ? "bg-emerald-600 text-white"
                        : isPopular
                        ? "bg-blue-600 text-white"
                        : isGuarantee
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                    }`}>
                      {isGuarantee ? <ShieldCheck className="w-5 h-5" /> : isPopular ? <Zap className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{plan.title.replace(/^Module \d+:\s*/, "")}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.subtitle}</p>

                  {/* Price */}
                  <div className="my-4 pb-3 border-b border-slate-100">
                    <span className="text-2xl font-extrabold text-slate-900">{plan.priceDisplay}</span>
                    <span className="text-xs text-slate-500 ml-1">
                      {plan.billingType === "monthly" ? "/ month"
                        : plan.billingType === "per_successful_hire" ? "/ hire"
                        : "(candidate salary)"}
                    </span>
                  </div>

                  {/* Replacement Guarantee */}
                  {isGuarantee && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{plan.replacementPolicy}</span>
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included Scope:</div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(plan.features || []).map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className={feat.toLowerCase().includes("dedicated") ? "font-semibold" : ""}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA / Activation Button */}
                <div className="space-y-2">
                  {isPlanActive ? (
                    <div className="w-full py-2.5 px-3 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-center">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Currently Activated</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleActivatePlan(plan)}
                      className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        isPopular
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : isGuarantee
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      <span>Switch to this Plan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <a
                    href="/employer/jobs/new"
                    className="block text-center text-[11px] text-slate-500 hover:text-slate-700 font-semibold py-1"
                  >
                    Post Job Under this Plan →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Billing history table (Mockup 20) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Billing history</h2>
          <span className="text-xs text-slate-500 font-medium">All invoices generated via GST compliance</span>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {[
            { id: "INV-2041", plan: "End-to-End Hiring", month: "Sep 2026", amount: "₹9,999", status: "Paid", date: "01 Sep 2026" },
            { id: "INV-1987", plan: "Instant Resumes", month: "Aug 2026", amount: "₹2,999", status: "Paid", date: "01 Aug 2026" },
            { id: "INV-1840", plan: "Instant Resumes", month: "Jul 2026", amount: "₹2,999", status: "Paid", date: "01 Jul 2026" },
          ].map((inv) => (
            <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900">{inv.id}</span>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-slate-700">{inv.plan}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{inv.month}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-black text-slate-900">{inv.amount}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                  {inv.status}
                </span>
                <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs underline">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
