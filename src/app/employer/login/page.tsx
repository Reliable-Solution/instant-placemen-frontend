"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Lock,
  Mail,
  Phone,
  User,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

import { toast } from "@/components/ui/toast";
import { getApiBaseUrl } from "@/lib/config";

function EmployerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/employer";
  const dispatch = useAppDispatch();

  const [mode, setMode] = useState<"login" | "register">("login");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Surat");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiBase = getApiBaseUrl();
      const endpoint = mode === "login" ? `${apiBase}/auth/login` : `${apiBase}/auth/register`;
      const payload =
        mode === "login"
          ? { email, password, expectedRole: "EMPLOYER" }
          : {
              email,
              password,
              name: contactName,
              companyName,
              phone,
              city,
              role: "EMPLOYER",
            };

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

      if (!res.ok || !data.success) {
        const msg = Array.isArray(data.errors) && data.errors.length > 0
          ? data.errors.join(". ")
          : data.message || data.error?.message || "Authentication failed.";
        toast.error(msg);
        throw new Error(msg);
      }

      const userData = data.data?.user || data.user;
      const token = data.data?.token || data.token;

      if (!userData || !token) {
        const msg = "Unexpected server response. Please try again.";
        toast.error(msg);
        throw new Error(msg);
      }

      if (userData?.role !== "EMPLOYER" && userData?.role !== "ADMIN") {
        const msg = "This portal is reserved for Job Providers & Employers.";
        toast.error(msg);
        throw new Error(msg);
      }

      localStorage.setItem("ip_token", token);
      localStorage.setItem("ip_user", JSON.stringify({ ...userData, token }));
      dispatch(setUser({ ...userData, token }));
      
      if (mode === "register") {
        toast.success(data.message || `Company registered successfully! Welcome, ${userData.name || companyName || "Employer"}.`);
      } else {
        toast.success(data.message || `Welcome back, ${userData.name || "Employer"}! Login successful.`);
      }

      router.push(redirect);
    } catch (err: any) {
      const msg = err.message || "Failed to process request.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back Link */}
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Candidate Site</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-6 relative">
          <img src="/logo.png" alt="Instant Placement" className="h-11 w-auto object-contain mx-auto mb-3" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Job Provider Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Hire verified staff within 48 to 72 hours</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "login"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Employer Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "register"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register Company
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Company Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <Input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Reliance Retail"
                    className="pl-10 h-10 bg-white border-slate-200 text-slate-900 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Contact Person</label>
                  <Input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="HR / Founder Name"
                    className="h-10 bg-white border-slate-200 text-slate-900 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone / WhatsApp</label>
                  <Input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="h-10 bg-white border-slate-200 text-slate-900 text-xs rounded-xl"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              {mode === "login" ? "Work Email or Mobile Number" : "Work Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <Input
                type={mode === "login" ? "text" : "email"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "login" ? "hr@company.com or 10-digit mobile" : "hr@company.com"}
                className="pl-10 h-10 bg-white border-slate-200 text-slate-900 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Password</label>
              {mode === "register" && (
                <span className={`text-xs font-semibold flex items-center gap-1 ${password.length >= 6 ? "text-emerald-600" : "text-slate-500"}`}>
                  <CheckCircle2 className={`w-3 h-3 ${password.length >= 6 ? "text-emerald-500" : "text-slate-300"}`} />
                  <span>Min. 6 characters</span>
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 h-10 bg-white border-slate-200 text-slate-900 text-xs rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-600 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === "register" && (
              <p className="text-xs text-slate-500">
                Password must be at least 6 characters (e.g. MyCompany123)
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 gap-2 mt-3"
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In to Dashboard" : "Register Company & Start Hiring"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function EmployerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-blue-100 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <EmployerLoginContent />
    </Suspense>
  );
}
