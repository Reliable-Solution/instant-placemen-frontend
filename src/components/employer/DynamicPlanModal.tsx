"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCalculateJobPlanQuery } from "@/services/api/categoryPricingApi";
import { useGetSettingsQuery } from "@/services/api/settingsApi";
import { initiateRazorpayCheckout } from "@/services/razorpay";

interface DynamicPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    _id?: string;
    id?: string;
    title: string;
    category?: string;
    experience?: string;
    city?: string;
    locality?: string;
    vacancies?: number;
    serviceTier?: string;
  } | null;
  onPlanActivated: (planData: any) => void;
}

export default function DynamicPlanModal({
  isOpen,
  onClose,
  job,
  onPlanActivated,
}: DynamicPlanModalProps) {
  const [selectedModule, setSelectedModule] = useState<"module_1_resumes" | "module_2_hiring" | "module_3_guarantee">("module_1_resumes");
  const [durationTier, setDurationTier] = useState<"1_week" | "1_month">("1_month");
  const [cvQuantity, setCvQuantity] = useState<number>(10);
  const [hireQuantity, setHireQuantity] = useState<number>(job?.vacancies || 1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Check global settings for launch promo free bypass
  const { data: settingsData } = useGetSettingsQuery();
  const isPromoFree = settingsData?.module_1_promo_free === "true" || (settingsData as any)?.settings?.module_1_promo_free === "true";

  const { data: calculation, isLoading } = useCalculateJobPlanQuery(
    {
      category: job?.category,
      experience: job?.experience,
      module: selectedModule,
      durationTier: selectedModule === "module_1_resumes" ? durationTier : undefined,
      quantity: selectedModule === "module_1_resumes" ? cvQuantity : hireQuantity,
    },
    { skip: !job || !isOpen }
  );

  if (!job) return null;

  const handleActivatePlan = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    const jobId = job.id || job._id;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100/api/v1";
    const token = typeof window !== "undefined" ? localStorage.getItem("ip_token") : null;

    // Module 2 & 3: No upfront payment, just activate
    if (selectedModule !== "module_1_resumes") {
      try {
        const res = await fetch(`${API_BASE}/pipeline/purchase-plan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            jobId,
            tier: selectedModule,
            quantity: hireQuantity,
            amount: 0,
          }),
        });
        const data = await res.json();
        if (data.success) {
          onPlanActivated(data.job);
          onClose();
        } else {
          setPaymentError(data.message || "Failed to activate plan.");
        }
      } catch (e: any) {
        setPaymentError(e.message || "Network error while activating plan.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Module 1: Promo free → activate directly
    if (isPromoFree) {
      try {
        const res = await fetch(`${API_BASE}/pipeline/purchase-plan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            jobId,
            tier: selectedModule,
            durationTier,
            quantity: cvQuantity,
            amount: 0,
            isPromoFree: true,
          }),
        });
        const data = await res.json();
        if (data.success) {
          onPlanActivated(data.job);
          onClose();
        } else {
          setPaymentError(data.message || "Failed to activate plan.");
        }
      } catch (e: any) {
        setPaymentError(e.message || "Network error while activating plan.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Module 1: Paid → Razorpay checkout first, then activate plan
    const totalAmount = calculation?.totalAmount || 0;
    if (totalAmount <= 0) {
      setPaymentError("Invalid amount. Please try again.");
      setIsProcessing(false);
      return;
    }

    // Get user info for Razorpay prefill
    let employerName = "Hiring Manager";
    let employerEmail = "recruiter@instantplacement.in";
    let employerPhone = "9876543210";
    try {
      const raw = localStorage.getItem("ip_user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u.name) employerName = u.name;
        if (u.email) employerEmail = u.email;
        if (u.phone) employerPhone = u.phone;
      }
    } catch {}

    initiateRazorpayCheckout({
      planId: selectedModule,
      planTitle: `Module 1: ${cvQuantity} Instant Resumes (${durationTier === "1_week" ? "1 Week" : "1 Month"})`,
      amount: totalAmount,
      employerName,
      employerEmail,
      employerPhone,
      onSuccess: async (paymentResult: any) => {
        try {
          // Payment verified by Razorpay utility. Now activate the plan.
          const res = await fetch(`${API_BASE}/pipeline/purchase-plan`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              jobId,
              tier: selectedModule,
              durationTier,
              quantity: cvQuantity,
              amount: totalAmount,
              razorpayOrderId: paymentResult.payment?.razorpayOrderId,
              razorpayPaymentId: paymentResult.payment?.razorpayPaymentId,
            }),
          });
          const data = await res.json();
          if (data.success) {
            onPlanActivated(data.job);
            onClose();
          } else {
            setPaymentError(data.message || "Payment received but plan activation failed. Contact support.");
          }
        } catch (e: any) {
          setPaymentError("Payment successful but plan activation failed. Contact support with Payment ID: " + (paymentResult.payment?.razorpayPaymentId || "N/A"));
        } finally {
          setIsProcessing(false);
        }
      },
      onError: (error: string) => {
        setPaymentError(error);
        setIsProcessing(false);
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });
  };

  const minCvs = calculation?.rateDetails?.minQuantity || 5;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 border-0 rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-t-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-2.5 py-0.5">
              Role-Customized Rate Card
            </Badge>
            {isPromoFree && (
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 animate-pulse">
                🎉 Launch Offer: 100% Free
              </Badge>
            )}
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-white mb-1">
            Choose Hiring Plan for &ldquo;{job.title}&rdquo;
          </DialogTitle>
          <p className="text-xs text-slate-300 flex items-center gap-3">
            <span>Category: <strong className="text-white">{job.category || "General"}</strong></span>
            <span>•</span>
            <span>Experience: <strong className="text-white">{job.experience || "Fresher"}</strong></span>
            <span>•</span>
            <span>Location: <strong className="text-white">{job.city}</strong></span>
          </p>
        </div>

        {/* Module Selector Tabs */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedModule("module_1_resumes")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-bold transition-all ${
                selectedModule === "module_1_resumes"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <FileText className="w-5 h-5 mb-1 text-blue-600" />
              <span>Module 1</span>
              <span className="font-normal text-[10px] text-slate-500">Instant Resumes</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModule("module_2_hiring")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-bold transition-all relative ${
                selectedModule === "module_2_hiring"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <span className="absolute -top-1.5 right-1 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
                Popular
              </span>
              <UserCheck className="w-5 h-5 mb-1 text-indigo-600" />
              <span>Module 2</span>
              <span className="font-normal text-[10px] text-slate-500">Recruiter Hire</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModule("module_3_guarantee")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-bold transition-all ${
                selectedModule === "module_3_guarantee"
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <ShieldCheck className="w-5 h-5 mb-1 text-emerald-600" />
              <span>Module 3</span>
              <span className="font-normal text-[10px] text-slate-500">90-Day Guarantee</span>
            </button>
          </div>

          {/* TAB 1: MODULE 1 INSTANT RESUMES */}
          {selectedModule === "module_1_resumes" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Timeline duration options */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  1. Choose Sourcing & Delivery Timeline:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setDurationTier("1_week")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      durationTier === "1_week"
                        ? "border-blue-600 bg-blue-50/60 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        1 Week (Express)
                      </div>
                      <span className="text-xs font-extrabold text-blue-700">
                        ₹{calculation?.tier?.module1?.durationTiers?.find((d) => d.tierKey === "1_week")?.ratePerCv || 150}/CV
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Fast 7-day turnaround for urgent needs.</p>
                  </div>

                  <div
                    onClick={() => setDurationTier("1_month")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all relative ${
                      durationTier === "1_month"
                        ? "border-blue-600 bg-blue-50/60 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="absolute -top-2 right-3 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Best Value
                    </span>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                        <Clock className="w-4 h-4 text-blue-600" />
                        1 Month (Standard)
                      </div>
                      <span className="text-xs font-extrabold text-blue-700">
                        ₹{calculation?.tier?.module1?.durationTiers?.find((d) => d.tierKey === "1_month")?.ratePerCv || 100}/CV
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">30 days active candidate pipeline delivery.</p>
                  </div>
                </div>
              </div>

              {/* Quantity Counter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    2. How many verified CVs do you need?
                  </label>
                  <span className="text-xs text-slate-500">Minimum: {minCvs} CVs</span>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={cvQuantity <= minCvs}
                      onClick={() => setCvQuantity((prev) => Math.max(minCvs, prev - 1))}
                      className="w-9 h-9 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-lg"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-extrabold text-lg text-slate-900">
                      {cvQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCvQuantity((prev) => prev + 1)}
                      className="w-9 h-9 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 text-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex-1 text-right">
                    <span className="text-xs text-slate-500 block">Calculation</span>
                    <span className="text-sm font-bold text-slate-700">
                      {cvQuantity} CVs × ₹{calculation?.rateDetails?.ratePerUnit || 100}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deliverables Checklist */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Curated batch of pre-screened candidate CVs with verified phone & WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free 48-hour replacement for any switched-off or invalid numbers</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Client conducts interviews and negotiates offers directly</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODULE 2 END-TO-END HIRING */}
          {selectedModule === "module_2_hiring" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <span className="text-xs font-bold text-indigo-900 block mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Complete Recruiter Offloading (Pay ₹0 Upfront)
                </span>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  We handle the entire search, 4-point tele-screening, and schedule candidates directly to your office. You only pay when the candidate shows up on <strong>Day 1 Joining</strong>!
                </p>
              </div>

              {/* Hire Quantity Counter */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  How many staff do you want us to hire?
                </label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={hireQuantity <= 1}
                      onClick={() => setHireQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-9 h-9 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 text-lg"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-extrabold text-lg text-slate-900">
                      {hireQuantity} {hireQuantity === 1 ? "Hire" : "Hires"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHireQuantity((prev) => prev + 1)}
                      className="w-9 h-9 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 text-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex-1 text-right">
                    <span className="text-xs text-slate-500 block">Rate per Successful Hire</span>
                    <span className="text-sm font-bold text-indigo-700">
                      ₹{(calculation?.rateDetails?.ratePerUnit || 3000).toLocaleString("en-IN")} / hire
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated talent recruiter assigned to your vacancy</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>4-point tele-screening (Commute, Salary, Notice Period, Skills)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interview coordination + WhatsApp reminders to prevent no-shows</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Zero upfront fee:</strong> Billed strictly after candidate joins on Day 1</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MODULE 3 GUARANTEE */}
          {selectedModule === "module_3_guarantee" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                <span className="text-xs font-bold text-emerald-900 block mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Executive Placement + 90-Day Retention Guarantee
                </span>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Best for critical, leadership, or specialized roles. If the hired candidate exits within <strong>90 Days</strong>, we provide <strong>1 Free Replacement</strong> for the exact same job role!
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-600">Pricing Model:</span>
                  <span className="font-extrabold text-slate-900">1 Month Gross Candidate Salary</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-600">Replacement Guarantee:</span>
                  <span className="font-extrabold text-emerald-700">Up to 90 Days Free Replacement</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Milestone Retention Checks:</span>
                  <span className="font-bold text-slate-800">Day 30, Day 60, and Day 85</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Error */}
          {paymentError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Total & Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">
                {selectedModule === "module_1_resumes"
                  ? "Total Upfront Payable"
                  : selectedModule === "module_2_hiring"
                  ? "Estimated Fee (Pay on Joining)"
                  : "Payable upon Joining"}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-950">
                  {selectedModule === "module_3_guarantee"
                    ? "1 Month Salary"
                    : isPromoFree && selectedModule === "module_1_resumes"
                    ? "₹0 (Free Promo)"
                    : `₹${(calculation?.totalAmount || 0).toLocaleString("en-IN")}`}
                </span>
                {isPromoFree && selectedModule === "module_1_resumes" && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{(calculation?.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>

            <Button
              type="button"
              onClick={handleActivatePlan}
              disabled={isProcessing || isLoading}
              className={`h-11 px-6 rounded-xl font-bold text-sm shadow-md transition-all ${
                selectedModule === "module_3_guarantee"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {selectedModule === "module_1_resumes" && !isPromoFree
                    ? "Processing Payment..."
                    : "Activating..."}
                </>
              ) : selectedModule === "module_1_resumes" ? (
                isPromoFree ? (
                  "🎉 Unlock Resumes for Free"
                ) : (
                  `Pay ₹${(calculation?.totalAmount || 0).toLocaleString("en-IN")} & Unlock`
                )
              ) : selectedModule === "module_2_hiring" ? (
                "Request Recruiter (Pay on Day 1)"
              ) : (
                "Select 90-Day Guarantee Plan"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
