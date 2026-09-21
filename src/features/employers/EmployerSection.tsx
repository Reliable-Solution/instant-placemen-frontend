"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetServiceModulesQuery } from "@/services/api/jobsApi";
import { initiateRazorpayCheckout } from "@/services/razorpay";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  FileText,
  UserCheck,
  Sparkles,
  Check,
  X,
} from "lucide-react";

interface EmployerSectionProps {
  onOpenPostJobModal: () => void;
}

export const EmployerSection: React.FC<EmployerSectionProps> = ({
  onOpenPostJobModal,
}) => {
  const { data: modules = [], isLoading } = useGetServiceModulesQuery();
  const [successPayment, setSuccessPayment] = useState<any | null>(null);

  const getModuleIcon = (id?: string) => {
    const safeId = String(id || "");
    if (safeId.includes("resume") || safeId.includes("1")) return <FileText className="h-5 w-5" />;
    if (safeId.includes("hiring") || safeId.includes("2")) return <UserCheck className="h-5 w-5" />;
    return <ShieldCheck className="h-5 w-5" />;
  };

  const getModuleBadge = (id?: string, idx: number = 0) => {
    const safeId = String(id || "");
    if (safeId.includes("1")) return "Module 1";
    if (safeId.includes("2")) return "Module 2";
    if (safeId.includes("3")) return "Module 3";
    return `Plan ${idx + 1}`;
  };

  const handleSelectPlan = (module: any) => {
    if (module.price && module.price > 0) {
      // Saved user if available
      let user: any = null;
      try {
        const stored = localStorage.getItem("ip_user");
        if (stored) user = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }

      initiateRazorpayCheckout({
        planId: module.id,
        planTitle: module.title,
        amount: module.price,
        employerName: user?.name,
        employerEmail: user?.email,
        employerPhone: user?.phone,
        onSuccess: (res) => {
          setSuccessPayment({
            planTitle: module.title,
            orderId: res.payment?.razorpayOrderId,
            amount: module.priceDisplay,
          });
        },
        onError: (err) => {
          alert(`Payment Notice: ${err}`);
        },
      });
    } else {
      // Module 3 or custom pricing: opens job posting or direct consultation
      onOpenPostJobModal();
    }
  };

  return (
    <section
      id="employer-section"
      className="relative overflow-hidden border-t border-slate-200 bg-slate-50 py-14 md:py-20"
    >
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        {/* Payment Success Banner */}
        {successPayment && (
          <div className="mb-8 p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-900">
                  Subscription Active: {successPayment.planTitle}
                </h4>
                <p className="text-xs text-emerald-700">
                  Payment of {successPayment.amount} confirmed via Razorpay. Your dedicated recruitment service is now active!
                </p>
              </div>
            </div>
            <button
              onClick={() => setSuccessPayment(null)}
              className="text-xs font-bold bg-white text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100/80 px-3.5 py-1 text-xs font-semibold text-blue-800">
            <Zap className="h-3.5 w-3.5 fill-current text-amber-500" />
            For founders, SMEs & hiring managers
          </div>

          <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Hire staff in your city in{" "}
            <span className="text-blue-600">24–72 hours</span>
          </h2>

          <p className="mx-auto mt-3 max-w-md text-base text-slate-600">
            Three simple, transparent service tiers for growing businesses.
            No hidden unlock fees.
          </p>
        </div>

        {/* Pricing cards */}
        {isLoading && modules.length === 0 ? (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-6 w-24 rounded bg-slate-200" />
                  <div className="h-8 w-48 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-10 w-32 rounded bg-slate-200" />
                </div>
                <div className="h-11 w-full rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {modules.map((m, idx) => {
              const planId = m.id || (m as any)._id || `plan-${idx}`;
              const isHighlighted = Boolean(m.isPopular || String(planId).includes("2"));
              const isGuarantee = Boolean(m.replacementGuarantee || String(planId).includes("3"));

              return (
                <PricingCard
                  key={planId}
                  badge={getModuleBadge(planId, idx)}
                  badgeColor={isGuarantee ? "emerald" : "blue"}
                  icon={getModuleIcon(planId)}
                  title={m.title.replace(/^Module \d+:\s*/, "")}
                  subtitle={m.subtitle}
                  price={m.priceDisplay}
                  priceUnit={
                    m.billingType === "monthly"
                      ? "/ month"
                      : m.billingType === "per_successful_hire"
                      ? "/ successful hire"
                      : "(candidate salary)"
                  }
                  calloutText={
                    isGuarantee ? "Up to 90 days free replacement guarantee" : undefined
                  }
                  features={(m.features || []).map((f) => ({
                    text: f,
                    included: true,
                    strong: f.toLowerCase().includes("dedicated recruiter"),
                  }))}
                  ctaLabel={
                    m.price && m.price > 0
                      ? `Subscribe (${m.priceDisplay})`
                      : `Select ${getModuleBadge(planId, idx)}`
                  }
                  onSelect={() => handleSelectPlan(m)}
                  highlighted={isHighlighted}
                  accent={isGuarantee ? "emerald" : "blue"}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};


/* ---------------------------------------------------------------------- */

interface Feature {
  text: string;
  included: boolean;
  strong?: boolean;
}

interface PricingCardProps {
  badge: string;
  badgeColor: "blue" | "emerald";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  price: string;
  priceUnit: string;
  calloutText?: string;
  features: Feature[];
  ctaLabel: string;
  onSelect: () => void;
  highlighted?: boolean;
  accent?: "blue" | "emerald";
}

const PricingCard: React.FC<PricingCardProps> = ({
  badge,
  badgeColor,
  icon,
  title,
  subtitle,
  price,
  priceUnit,
  calloutText,
  features,
  ctaLabel,
  onSelect,
  highlighted,
  accent = "blue",
}) => {
  const badgeClasses =
    badgeColor === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const iconWrapClasses = highlighted
    ? "bg-blue-600 text-white"
    : accent === "emerald"
    ? "bg-emerald-50 text-emerald-600"
    : "bg-blue-50 text-blue-600";

  const cardBorder = highlighted
    ? "border-blue-600"
    : accent === "emerald"
    ? "border-slate-200 hover:border-emerald-400"
    : "border-slate-200 hover:border-blue-400";

  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border-2 bg-white p-6 pt-7 transition-colors duration-200 ${cardBorder} ${
        highlighted ? "shadow-lg shadow-blue-900/5" : "shadow-sm"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white">
          <Sparkles className="h-3 w-3 fill-current text-amber-300" />
          Most popular
        </span>
      )}

      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${badgeClasses}`}
        >
          {badge}
        </span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconWrapClasses}`}
        >
          {icon}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>

      {/* Price */}
      <div className="mb-5 mt-4 border-b border-slate-100 pb-4">
        <span className="text-2xl font-bold text-slate-900">{price}</span>
        <span className="ml-1 text-xs text-slate-500">{priceUnit}</span>
      </div>

      {calloutText && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          {calloutText}
        </div>
      )}

      {/* Features — flex-1 pushes the button to a shared baseline */}
      <ul className="mb-6 flex-1 space-y-2.5 text-sm text-slate-700">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            {f.included ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
            )}
            <span className={f.included ? (f.strong ? "font-semibold" : "") : "text-slate-400"}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        className={`mt-auto w-full rounded-xl py-3 font-semibold transition-colors duration-200 ${
          highlighted
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : accent === "emerald"
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
        }`}
      >
        {ctaLabel}
      </Button>
    </div>
  );
};