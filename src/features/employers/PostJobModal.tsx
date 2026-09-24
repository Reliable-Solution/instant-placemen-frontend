"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Job, Category, CityOption } from "@/types";
import { usePostJobMutation } from "@/services/api/jobsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { initiateRazorpayCheckout } from "@/services/razorpay";
import {
  PlusCircle, CheckCircle2, ShieldCheck, Sparkles,
  FileText, UserCheck, Lock, Building2, Phone, Mail, ArrowRight, AlertTriangle,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";


interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  cities: CityOption[];
  onJobCreated?: (newJob: Job) => void;
}

type ServiceTier = "module_1_resumes" | "module_2_hiring" | "module_3_guarantee";
type Step = "auth" | "plan" | "job" | "success";

const TIER_INFO = {
  module_1_resumes: {
    label: "Module 1",
    name: "Instant Resumes",
    price: "₹5,000",
    sub: "Upfront — 30-day sourcing window",
    detail: "We source, pre-screen, and deliver verified candidate CVs directly to you. Your team handles interviews and offers.",
    color: "blue",
    icon: FileText,
    paymentNote: "₹5,000 paid now to activate your 30-day sourcing pipeline.",
    freeNote: null,
  },
  module_2_hiring: {
    label: "Module 2",
    name: "End-to-End Hiring",
    price: "₹10,000",
    sub: "Billed only when a candidate joins",
    detail: "We run the full hiring cycle — sourcing, screening, interviews, offer rollout, and Day 1 onboarding. Zero upfront cost.",
    color: "blue",
    icon: UserCheck,
    paymentNote: null,
    freeNote: "Post for free now. You'll be invoiced ₹10,000 only when a candidate successfully joins.",
  },
  module_3_guarantee: {
    label: "Module 3",
    name: "Placement + 90-Day Guarantee",
    price: "1 Month CTC",
    sub: "Billed only upon joining • Zero upfront",
    detail: "Full E2E hiring + 90-day post-joining retention watch. If the candidate leaves within 90 days, we replace for free.",
    color: "emerald",
    icon: ShieldCheck,
    paymentNote: null,
    freeNote: "Post for free now. Billed as 1 month of the candidate's accepted salary, only after Day 1 joining is confirmed.",
  },
};

const getModalApiBase = () => getApiBaseUrl();

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  categories,
  cities,
  onJobCreated,
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);

  const [postJobMutation, { isLoading: isMutationLoading }] = usePostJobMutation();

  // Step management
  const [step, setStep] = useState<Step>("auth");

  // Auth step fields
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authCompany, setAuthCompany] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authCity, setAuthCity] = useState("Surat Gujarat");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Plan step
  const [serviceTier, setServiceTier] = useState<ServiceTier>("module_2_hiring");
  const [m1PaymentDone, setM1PaymentDone] = useState(false);
  const [m1PaymentIds, setM1PaymentIds] = useState<{ orderId: string; paymentId: string } | null>(null);
  const [m3Confirmed, setM3Confirmed] = useState(false);

  // Job fields
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("Surat");
  const [locality, setLocality] = useState("");
  const [category, setCategory] = useState(categories[0]?.title || "Telecaller / BPO");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "telecalling");
  const [salaryMin, setSalaryMin] = useState(20000);
  const [salaryMax, setSalaryMax] = useState(30000);
  const [experience, setExperience] = useState("Fresher");
  const [qualification, setQualification] = useState("12th Pass");
  const [jobType, setJobType] = useState("Full Time");
  const [vacancies, setVacancies] = useState(10);
  const [hrName, setHrName] = useState("");
  const [hrPhone, setHrPhone] = useState("");
  const [description, setDescription] = useState("");

  const [jobError, setJobError] = useState<string | null>(null);

  // Determine starting step when modal opens
  useEffect(() => {
    if (isOpen) {
      if (user && (user.role === "EMPLOYER" || user.role === "ADMIN")) {
        setStep("plan");
        setCompany(user.companyName || "");
        setHrName(user.name || "");
        setHrPhone(user.phone || "");
      } else {
        setStep("auth");
      }
    }
  }, [isOpen, user]);

  // ── Auth Step ──────────────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const apiBase = getModalApiBase();
      const endpoint = authMode === "login" ? `${apiBase}/auth/login` : `${apiBase}/auth/register`;
      const payload =
        authMode === "login"
          ? { email: authEmail, password: authPassword }
          : { email: authEmail, password: authPassword, name: authName, companyName: authCompany, phone: authPhone, city: authCity, role: "EMPLOYER" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Server error (${res.status}). Please check API connectivity.`);
      }

      if (!res.ok || !data.success) throw new Error(data.message || "Authentication failed");

      const userData = data.user || data.data?.user;
      const tok = data.token || data.data?.token;

      if (userData.role !== "EMPLOYER" && userData.role !== "ADMIN") {
        throw new Error("This portal is for Job Providers & Employers only.");
      }

      dispatch(setUser({ ...userData, token: tok }));
      setCompany(userData.companyName || "");
      setHrName(userData.name || "");
      setHrPhone(userData.phone || "");
      setStep("plan");
    } catch (err: any) {
      setAuthError(err.message || "Login failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Plan Step ──────────────────────────────────────────────────────────────
  const canProceedFromPlan = () => {
    if (serviceTier === "module_1_resumes") return m1PaymentDone;
    if (serviceTier === "module_2_hiring") return true; // always free to proceed
    if (serviceTier === "module_3_guarantee") return m3Confirmed;
    return false;
  };

  const handleM1Payment = () => {
    initiateRazorpayCheckout({
      planId: "module_1_resumes",
      planTitle: "Module 1: Instant Resumes — 30-Day Sourcing Window",
      amount: 5000,
      employerName: user?.name,
      employerEmail: user?.email,
      employerPhone: user?.phone,
      onSuccess: (res: any) => {
        setM1PaymentDone(true);
        setM1PaymentIds({ orderId: res.payment?.razorpayOrderId, paymentId: res.payment?.razorpayPaymentId });
      },
      onError: (err: string) => {
        alert(`Payment failed: ${err}`);
      },
    });
  };

  // ── Job Submit ─────────────────────────────────────────────────────────────
  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobError(null);

    if (!title || !company || !hrPhone) {
      setJobError("Please fill in Job Title, Company Name, and HR Phone Number.");
      return;
    }

    try {
      const payload: any = {
        title,
        company,
        city,
        locality: locality || "Central Hub",
        category,
        categoryId,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        salaryType: "monthly",
        experience,
        qualification,
        jobType,
        shift: "Day Shift",
        vacancies: Number(vacancies),
        serviceTier,
        contactPerson: {
          name: hrName || "Senior HR Partner",
          role: "Talent Recruiter",
          phone: hrPhone,
          whatsapp: hrPhone,
          callTimings: "10:00 AM - 6:00 PM",
        },
        interviewType: "Walk-in",
        interviewAddress: `${locality || "Central Hub"}, ${city}`,
        skillsRequired: [category, "Communication"],
        description:
          description ||
          `Immediate hiring for ${title} at ${company}. Direct joining and immediate offer letters issued for verified candidates.`,
      };

      // M1: attach payment IDs to the job creation call
      if (serviceTier === "module_1_resumes" && m1PaymentIds) {
        payload.razorpayOrderId = m1PaymentIds.orderId;
        payload.razorpayPaymentId = m1PaymentIds.paymentId;
      }

      const res: any = await postJobMutation(payload).unwrap();
      const created = res?.data || res?.job || res;
      if (created && onJobCreated) onJobCreated(created);
      setStep("success");
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || "Error posting job.";
      if (error?.data?.requiresPayment) {
        setJobError("Module 1 requires upfront payment. Please go back and complete Razorpay payment.");
      } else {
        setJobError(msg);
      }
    }
  };

  const handleClose = () => {
    setStep(user && (user.role === "EMPLOYER" || user.role === "ADMIN") ? "plan" : "auth");
    setM1PaymentDone(false);
    setM1PaymentIds(null);
    setM3Confirmed(false);
    setAuthError(null);
    setJobError(null);
    onClose();
  };

  const tierInfo = TIER_INFO[serviceTier];

  const StepBadge = ({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) => (
    <div className={`flex items-center gap-1.5 text-xs font-semibold ${done ? "text-emerald-600" : active ? "text-blue-700" : "text-slate-400"}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? "bg-emerald-100" : active ? "bg-blue-100" : "bg-slate-100"}`}>
        {done ? "✓" : n}
      </span>
      {label}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 bg-white rounded-2xl shadow-2xl border-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 pt-5 pb-4">
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><PlusCircle className="w-4 h-4" /></span>
            Post a Hiring Mandate
          </DialogTitle>
          {/* Progress Steps */}
          <div className="flex items-center gap-3 mt-3">
            <StepBadge n={1} label="Login" active={step === "auth"} done={step !== "auth"} />
            <div className="flex-1 h-px bg-slate-200" />
            <StepBadge n={2} label="Select Plan" active={step === "plan"} done={step === "job" || step === "success"} />
            <div className="flex-1 h-px bg-slate-200" />
            <StepBadge n={3} label="Job Details" active={step === "job"} done={step === "success"} />
          </div>
        </div>

        <div className="p-6">
          {/* ── STEP 1: AUTH ─────────────────────────────────────── */}
          {step === "auth" && (
            <div className="space-y-4">
              <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                <button
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all ${authMode === "login" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  onClick={() => setAuthMode("login")}
                >Login</button>
                <button
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all ${authMode === "register" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  onClick={() => setAuthMode("register")}
                >Register as Employer</button>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-3">
                {authMode === "register" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Your Name *</label>
                        <Input placeholder="Full name" value={authName} onChange={e => setAuthName(e.target.value)} required />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Company Name *</label>
                        <Input placeholder="Company / Organization" value={authCompany} onChange={e => setAuthCompany(e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Number *</label>
                      <Input type="tel" placeholder="+91 98765 43210" value={authPhone} onChange={e => setAuthPhone(e.target.value)} required />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email *</label>
                  <Input type="email" placeholder="company@email.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Password *</label>
                  <Input type="password" placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full h-11 font-bold gap-2" disabled={authLoading}>
                  <Lock className="w-4 h-4" />
                  {authLoading ? "Please wait..." : authMode === "login" ? "Login & Continue" : "Register & Continue"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}

          {/* ── STEP 2: PLAN SELECTION ────────────────────────────── */}
          {step === "plan" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Choose the service module that matches your hiring need:</p>

              {/* Tier Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.entries(TIER_INFO) as [ServiceTier, typeof TIER_INFO[ServiceTier]][]).map(([tier, info]) => {
                  const Icon = info.icon;
                  const isSelected = serviceTier === tier;
                  const isEmerald = info.color === "emerald";
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => { setServiceTier(tier); setM1PaymentDone(false); setM3Confirmed(false); }}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                        isSelected
                          ? isEmerald
                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300/40"
                            : "border-blue-500 bg-blue-50 ring-2 ring-blue-300/40"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      {tier === "module_2_hiring" && (
                        <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">POPULAR</span>
                      )}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${isEmerald ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isEmerald ? "text-emerald-700" : "text-blue-700"}`}>{info.label}</p>
                      <p className="text-sm font-bold text-slate-900">{info.name}</p>
                      <p className={`text-sm font-bold mt-1 ${isEmerald ? "text-emerald-700" : "text-blue-700"}`}>{info.price}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{info.sub}</p>
                    </button>
                  );
                })}
              </div>

              {/* Selected tier details */}
              <div className={`p-4 rounded-xl border ${tierInfo.color === "emerald" ? "bg-emerald-50/60 border-emerald-200" : "bg-blue-50/60 border-blue-200"}`}>
                <p className="text-sm font-semibold text-slate-800 mb-1">{tierInfo.name} — What's Included:</p>
                <p className="text-xs text-slate-600">{tierInfo.detail}</p>

                {/* M1 — Razorpay now */}
                {serviceTier === "module_1_resumes" && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-blue-800">{tierInfo.paymentNote}</p>
                    {!m1PaymentDone ? (
                      <button
                        onClick={handleM1Payment}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all"
                      >
                        Pay ₹5,000 via Razorpay →
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 py-2 px-3 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Payment verified! Proceed to job details.
                      </div>
                    )}
                  </div>
                )}

                {/* M2 — free, confirm only */}
                {serviceTier === "module_2_hiring" && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-800 font-medium">{tierInfo.freeNote}</p>
                  </div>
                )}

                {/* M3 — free, confirm guarantee terms */}
                {serviceTier === "module_3_guarantee" && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-emerald-800 font-medium">{tierInfo.freeNote}</p>
                    </div>
                    {!m3Confirmed && (
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-emerald-600"
                          checked={m3Confirmed}
                          onChange={e => setM3Confirmed(e.target.checked)}
                        />
                        <span className="text-xs text-slate-600">
                          I understand billing is 1 month of the joining candidate's salary, generated only after Day 1 joining is confirmed by the Instant Placement team.
                        </span>
                      </label>
                    )}
                    {m3Confirmed && (
                      <div className="flex items-center gap-2 py-2 px-3 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Terms confirmed. Proceed to post the role.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={() => setStep("job")}
                disabled={!canProceedFromPlan()}
                className="w-full h-11 font-bold gap-2"
              >
                Continue to Job Details <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ── STEP 3: JOB DETAILS ──────────────────────────────── */}
          {step === "job" && (
            <form onSubmit={handleSubmitJob} className="space-y-4">
              {/* Active plan reminder */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${tierInfo.color === "emerald" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-blue-50 text-blue-800 border border-blue-200"}`}>
                <Sparkles className="w-3.5 h-3.5" />
                {tierInfo.label}: {tierInfo.name} — {serviceTier === "module_1_resumes" ? "₹5,000 paid ✓" : tierInfo.freeNote?.split(".")[0]}
              </div>

              {jobError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {jobError}
                </div>
              )}

              {/* Job Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Job Designation / Role *</label>
                  <Input placeholder="e.g. Telecaller / Sales Executive" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Company Name *</label>
                  <Input placeholder="e.g. Reliance Retail" value={company} onChange={e => setCompany(e.target.value)} required />
                </div>
              </div>

              {/* City, Locality, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Job City *</label>
                  <select className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm" value={city} onChange={e => setCity(e.target.value)}>
                    {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Area / Locality</label>
                  <Input placeholder="e.g. Andheri East" value={locality} onChange={e => setLocality(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
                  <select className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm" value={categoryId}
                    onChange={e => { const sel = categories.find(c => c.id === e.target.value); setCategoryId(e.target.value); if (sel) setCategory(sel.title); }}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>

              {/* Salary & Vacancies */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Min Salary (₹/mo) *</label>
                  <Input type="number" placeholder="20000" value={salaryMin} onChange={e => setSalaryMin(Number(e.target.value))} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Max Salary (₹/mo) *</label>
                  <Input type="number" placeholder="35000" value={salaryMax} onChange={e => setSalaryMax(Number(e.target.value))} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Openings</label>
                  <Input type="number" placeholder="10" value={vacancies} onChange={e => setVacancies(Number(e.target.value))} />
                </div>
              </div>

              {/* Eligibility */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Experience</label>
                  <select className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm" value={experience} onChange={e => setExperience(e.target.value)}>
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 Years">0–1 Years</option>
                    <option value="1-3 Years">1–3 Years</option>
                    <option value="3-5 Years">3–5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Qualification</label>
                  <select className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm" value={qualification} onChange={e => setQualification(e.target.value)}>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Any">Any</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Job Type</label>
                  <select className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm" value={jobType} onChange={e => setJobType(e.target.value)}>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Work From Home">Work From Home</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* HR Contact */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Recruiter Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">HR Name</label>
                    <Input placeholder="e.g. Pooja Sharma" value={hrName} onChange={e => setHrName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">HR Mobile / WhatsApp *</label>
                    <Input type="tel" placeholder="+91 98765 43210" value={hrPhone} onChange={e => setHrPhone(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("plan")}>
                  ← Back
                </Button>
                <Button type="submit" className="flex-[2] h-12 font-bold gap-2" disabled={isMutationLoading}>
                  <PlusCircle className="w-5 h-5" />
                  {isMutationLoading ? "Submitting..." : "Submit Hiring Mandate"}
                </Button>
              </div>
            </form>
          )}

          {/* ── STEP 4: SUCCESS ───────────────────────────────────── */}
          {step === "success" && (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Job Mandate Submitted!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                {serviceTier === "module_1_resumes"
                  ? "Your ₹5,000 payment is confirmed. Our team will begin sourcing and delivering pre-screened resumes within 24 hours."
                  : serviceTier === "module_2_hiring"
                  ? "Your mandate is live. Our recruiters will begin sourcing candidates immediately. You'll be invoiced ₹10,000 only when a candidate joins."
                  : "Your mandate is live under the 90-Day Guarantee programme. Billed as 1 month CTC upon confirmed joining."}
              </p>
              <Button className="mx-auto" onClick={handleClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
