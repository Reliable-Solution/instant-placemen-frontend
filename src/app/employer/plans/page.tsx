"use client";

import React from "react";
import { useGetServiceModulesQuery } from "@/services/api/jobsApi";
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EmployerPlansPage() {
  const { data: plans = [], isLoading } = useGetServiceModulesQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <span>Hiring Plans & Pricing</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          View available recruitment service tiers. Subscribe to unlock candidate pipelines.
        </p>
      </div>

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

            return (
              <div
                key={planId}
                className={`bg-white rounded-2xl border-2 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative ${
                  isPopular
                    ? "border-blue-600"
                    : isGuarantee
                    ? "border-emerald-400"
                    : "border-slate-200"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current text-amber-300" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  {/* Badge & Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`text-[10px] font-bold ${
                      isGuarantee
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {isGuarantee ? "Module 3" : isPopular ? "Module 2" : "Module 1"}
                    </Badge>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isPopular
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

                {/* CTA */}
                <a
                  href="/employer/jobs/new"
                  className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isPopular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : isGuarantee
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {plan.price ? `Subscribe (${plan.priceDisplay})` : "Contact for Pricing"}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
