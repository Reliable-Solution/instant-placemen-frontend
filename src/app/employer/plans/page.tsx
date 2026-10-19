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
  Route,
  ClipboardList,
  Calendar,
  PhoneCall,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { initiateRazorpayCheckout } from "@/services/razorpay";

export default function EmployerPlansPage() {
  const { data: plans = [], isLoading } = useGetServiceModulesQuery();
  const { data: profile, refetch: refetchProfile } = useGetEmployerProfileQuery();
  const [updateProfile] = useUpdateEmployerProfileMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);

  // Non-expired active plans strictly from server response
  const activePlans: any[] = profile?.activePlans || [];
  const activePlanIds: string[] = profile?.activePlanIds || [];
  const activePlanText: string =
    typeof profile?.activePlanText === "string"
      ? profile.activePlanText
      : "No Active Plan";

  const handleBuyPlan = async (plan: any) => {
    const planId = plan.id || plan._id;
    setPayError(null);
    // Module 3 has no upfront payment; billed after joining
    if (!plan.price || plan.billingType === "percentage_of_annual_ctc" || String(planId).includes("module_3")) {
      setPayError("Module 3 is billed after candidate joins. Please contact sales to activate.");
      return;
    }
    setPayingPlanId(planId);
    await initiateRazorpayCheckout({
      planId,
      planTitle: plan.title,
      employerName: profile?.name || profile?.companyName,
      employerEmail: profile?.email,
      employerPhone: profile?.phone,
      onSuccess: () => {
        setPayingPlanId(null);
        setSuccessMessage(`Payment successful — ${plan.title} activated! Candidate contact data is now unlocked.`);
        refetchProfile();
        setTimeout(() => setSuccessMessage(null), 6000);
      },
      onError: (err) => {
        setPayingPlanId(null);
        setPayError(err || "Payment failed. Please try again.");
      },
    });
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
            Free job posting is always included. Purchase an active plan to reveal unmasked applicant contact numbers, emails, and verified resumes.
          </p>
        </div>

        {/* Current Active Plan Badge */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 block">
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
          <p className="text-xs text-slate-500">Loading verified plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No plans currently published</p>
          <p className="text-xs text-slate-500 mt-1">Please reach out to support for enterprise mandates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {plans.map((plan: any, idx: number) => {
            const planId = plan.id || plan._id || `plan-${idx}`;
            const isPopular = plan.isPopular || String(planId).includes("2");
            const isGuarantee = plan.replacementGuarantee || String(planId).includes("3") || !plan.price;
            
            // Exact non-expired active plan check from server
            const matchingActivePlan = activePlans.find(
              (p: any) => p.planId === planId || activePlanIds.includes(planId)
            );
            const isPlanActive = Boolean(matchingActivePlan);

            return (
              <div
                key={planId}
                className={`bg-white rounded-2xl border-2 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative min-w-0 ${
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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Plan</span>
                  </div>
                ) : isPopular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm whitespace-nowrap shrink-0">
                    <Sparkles className="w-3 h-3 fill-current text-amber-300" />
                    <span>Most Popular</span>
                  </div>
                ) : null}

                <div className="min-w-0">
                  {/* Badge & Icon */}
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <Badge className={`text-xs font-bold shrink-0 whitespace-nowrap ${
                      isPlanActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : isGuarantee
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {isGuarantee ? "Module 3" : isPopular ? "Module 2" : "Module 1"}
                    </Badge>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
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

                  <h3 className="text-lg font-bold text-slate-900 break-words leading-snug">{plan.title.replace(/^Module \d+:\s*/, "")}</h3>
                  <p className="text-xs text-slate-500 mt-1 break-words leading-relaxed">{plan.subtitle}</p>

                  {/* Price */}
                  <div className="my-4 pb-3 border-b border-slate-100 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 min-w-0">
                      <span
                        className={`font-black tracking-tight text-slate-900 break-words leading-tight ${
                          plan.priceDisplay && plan.priceDisplay.length > 10
                            ? "text-xl sm:text-2xl"
                            : "text-2xl sm:text-3xl"
                        }`}
                      >
                        {plan.priceDisplay}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
                        {plan.billingType === "monthly" ? "/ month"
                          : plan.billingType === "per_successful_hire" ? "/ hire"
                          : "(post-joining billing)"}
                      </span>
                    </div>
                  </div>

                  {/* Expiration date if active */}
                  {isPlanActive && matchingActivePlan?.expiresAt && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        Expires on{" "}
                        {new Date(matchingActivePlan.expiresAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {/* Replacement Guarantee */}
                  {isGuarantee && (
                    <div className="mb-4 bg-emerald-50/80 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-xs font-semibold flex items-start gap-2 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="break-words leading-snug">{plan.replacementPolicy || "Zero upfront fee. Billed post-joining."}</span>
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Included Scope:</div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {(plan.features || []).map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className={`break-words leading-snug ${feat.toLowerCase().includes("dedicated") ? "font-semibold" : ""}`}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA / Action Button */}
                <div className="space-y-2 min-w-0">
                  {isPlanActive ? (
                    <div className="w-full py-2.5 px-3 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-center min-w-0">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">Plan Active & Candidate Contacts Unlocked</span>
                    </div>
                  ) : !plan.price || String(planId).includes("module_3") ? (
                    <a
                      href="mailto:support@instantplacement.in?subject=Module%203%20Enterprise%20Mandate%20Inquiry"
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs bg-slate-900 text-white hover:bg-slate-800 min-w-0"
                    >
                      <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Contact Sales to Activate</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled={payingPlanId === planId}
                      onClick={() => handleBuyPlan(plan)}
                      className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer min-w-0 ${
                        isPopular
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      <span className="truncate">{payingPlanId === planId ? "Opening Checkout…" : `Buy Plan — ${plan.priceDisplay}`}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  )}
                  {payError && payingPlanId === null && (
                    <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 break-words">
                      {payError}
                    </p>
                  )}

                  <a
                    href="/employer/jobs/new"
                    className="block text-center text-xs text-slate-500 hover:text-slate-700 font-semibold py-1 truncate"
                  >
                    Post Free Job First →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Journey */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Route className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-extrabold text-slate-900">Client Journey</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">How every vacancy moves from requirement to joining.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Post free job mandates to receive applicant resumes.",
            "Review candidate qualifications with masked contact details.",
            "Activate verified hiring plan via Razorpay payment gateway.",
            "Candidate phone numbers, WhatsApp, and PDF CVs instantly unlock.",
            "Schedule interviews and close offers directly or via recruitment team.",
            "Replacement guarantee and dedicated recruiter support where applicable.",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recruitment Team Operations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-extrabold text-slate-900">Recruitment Team Operations</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">What our team does behind every mandate.</p>
        <ul className="space-y-2.5">
          {[
            "Maintain a live vacancy tracker with verified candidate profiles.",
            "Zero client data leakage across competing employers.",
            "Server-side masking protects candidate PII until plan verification.",
            "Track every candidate from sourcing to joining.",
            "Daily follow-up on open vacancies and interviews.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
