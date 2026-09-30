"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MessageSquare,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";
import { SegmentedOTPInput } from "@/components/ui/SegmentedOTPInput";

function CandidateLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/candidate";
  const dispatch = useAppDispatch();

  // Mode: "otp" | "password"
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");

  // OTP Flow States
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Email/Password Flow States
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Common Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const API_BASE = getApiBaseUrl();

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  // Validation Helpers
  const isValidEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  const isValidPhone = (str: string) => /^[6-9]\d{9}$/.test(str.replace(/\D/g, "").slice(-10));

  // --- OTP Handlers ---
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!isValidPhone(cleanPhone)) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number (starts with 6-9)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to send WhatsApp OTP. Please check your number.");
        if (data.retryAfter) {
          setResendCooldown(data.retryAfter);
        }
        setLoading(false);
        return;
      }

      setSuccessMessage(`OTP sent to WhatsApp (+91 ${cleanPhone})`);
      setStep("otp");
      setResendCooldown(120);
    } catch (err) {
      console.error("Error sending OTP:", err);
      setErrorMessage("Network error connecting to auth service.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, otp: cleanOtp }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Invalid or expired OTP code.");
        setLoading(false);
        return;
      }

      if (data.user && data.user.role !== "CANDIDATE") {
        setErrorMessage(`This mobile number is registered as an ${data.user.role} account. Please sign in via the ${data.user.role.toLowerCase()} portal.`);
        setLoading(false);
        return;
      }

      if (data.token) localStorage.setItem("ip_token", data.token);
      if (data.user) {
        localStorage.setItem("ip_user", JSON.stringify(data.user));
        dispatch(setUser(data.user));
      }

      router.push(redirect);
    } catch (err) {
      console.error("OTP verification error:", err);
      setErrorMessage("Could not verify OTP. Please try again.");
      setLoading(false);
    }
  };

  // --- Email & Password Handlers ---
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. name@example.com)");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    if (isSignUp) {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMessage("Please enter your full name (minimum 2 characters)");
        return;
      }

      const cleanPhone = signupPhone.replace(/\D/g, "").slice(-10);
      if (!isValidPhone(cleanPhone)) {
        setErrorMessage("Please enter a valid 10-digit Indian phone number (starts with 6-9)");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            password: password,
            role: "CANDIDATE",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMessage(data.message || "Registration failed. Account may already exist with this email or phone.");
          setLoading(false);
          return;
        }

        if (data.token) localStorage.setItem("ip_token", data.token);
        if (data.user) {
          localStorage.setItem("ip_user", JSON.stringify(data.user));
          dispatch(setUser(data.user));
        }

        router.push(redirect);
      } catch (err) {
        console.error("Sign up error:", err);
        setErrorMessage("Network error during registration.");
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password: password,
            expectedRole: "CANDIDATE",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMessage(data.message || "Invalid email or password. Please verify your credentials.");
          setLoading(false);
          return;
        }

        if (data.user && data.user.role !== "CANDIDATE") {
          setErrorMessage(`This account is registered as ${data.user.role}. Please log in via the ${data.user.role.toLowerCase()} portal.`);
          setLoading(false);
          return;
        }

        if (data.token) localStorage.setItem("ip_token", data.token);
        if (data.user) {
          localStorage.setItem("ip_user", JSON.stringify(data.user));
          dispatch(setUser(data.user));
        }

        router.push(redirect);
      } catch (err) {
        console.error("Login error:", err);
        setErrorMessage("Network error during login.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 flex flex-col justify-center items-center p-4">
      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <div className="space-y-2 mb-5">
          <Badge
            variant="verified"
            className="gap-1.5 py-1 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Free Candidate Access
          </Badge>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {authMethod === "otp"
              ? step === "phone"
                ? "Candidate Sign In"
                : "Verify WhatsApp OTP"
              : isSignUp
              ? "Create Free Candidate Account"
              : "Sign In with Email"}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {authMethod === "otp"
              ? step === "phone"
                ? "Access your candidate profile, track applications, and unlock direct HR contacts."
                : `A 6-digit verification code was sent to WhatsApp on +91 ${phone}.`
              : isSignUp
              ? "Sign up in 30 seconds to connect with verified recruiters directly."
              : "Enter your candidate account email and password."}
          </p>
        </div>

        {/* Method Switcher Tabs (WhatsApp OTP vs Email & Password) */}
        {step === "phone" && (
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("otp");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === "otp"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("password");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === "password"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Email &amp; Password</span>
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-tight">{errorMessage}</span>
          </div>
        )}

        {successMessage && !errorMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-tight">{successMessage}</span>
          </div>
        )}

        {searchParams.get("role_mismatch") && !errorMessage && !successMessage && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-tight">
              You are currently signed in with a non-candidate account. Please sign in with your candidate credentials below.
            </span>
          </div>
        )}

        {/* ─── OPTION 1: WhatsApp OTP ─── */}
        {authMethod === "otp" && (
          <>
            {/* STEP 1: Phone input */}
            {step === "phone" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Mobile Number (WhatsApp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => {
                        setErrorMessage(null);
                        setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10));
                      }}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold tracking-wide text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-12 font-bold text-sm gap-2 rounded-xl shadow-md shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                  disabled={loading || phone.length < 10}
                >
                  <span>{loading ? "Sending WhatsApp Code..." : "Get OTP via WhatsApp"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="leading-tight">
                    Instant access without passwords. Free digital CV &amp; direct HR connect.
                  </span>
                </div>
              </form>
            )}

            {/* STEP 2: OTP Input */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Code sent to WhatsApp:
                  </span>
                  <strong className="font-bold text-emerald-950">+91 {phone}</strong>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Enter 6-Digit WhatsApp Code
                    </label>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Instant Auto-Verify
                    </span>
                  </div>
                  <SegmentedOTPInput
                    length={6}
                    value={otp}
                    disabled={loading}
                    onChange={(val) => {
                      setErrorMessage(null);
                      setOtp(val);
                    }}
                  />
                </div>

                {/* Resend OTP */}
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">Didn't receive code?</span>
                  {resendCooldown > 0 ? (
                    <span className="text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                      Resend in {Math.floor(resendCooldown / 60)}:{String(resendCooldown % 60).padStart(2, "0")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={loading}
                      className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" /> Resend OTP
                    </button>
                  )}
                </div>

                <div className="flex gap-2.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setErrorMessage(null);
                    }}
                    className="flex-1 h-11 text-xs font-semibold rounded-xl border-slate-300"
                  >
                    Change Number
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="flex-1 h-11 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ─── OPTION 2: Email & Password Flow ─── */}
        {authMethod === "password" && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <>
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => {
                        setErrorMessage(null);
                        setName(e.target.value);
                      }}
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={signupPhone}
                      onChange={(e) => {
                        setErrorMessage(null);
                        setSignupPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10));
                      }}
                      className="w-full h-11 pl-11 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="candidate@example.com"
                  value={email}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setEmail(e.target.value);
                  }}
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Password <span className="text-rose-500">*</span>
                </label>
                {isSignUp && (
                  <span className="text-xs text-slate-500">Min. 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
                  value={password}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setPassword(e.target.value);
                  }}
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-12 font-bold text-sm gap-2 rounded-xl shadow-md shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 text-white transition-all mt-2"
              disabled={loading || !email || !password || (isSignUp && (!name || signupPhone.length < 10))}
            >
              <span>{loading ? "Processing..." : isSignUp ? "Create Free Candidate Account" : "Sign In with Email"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Toggle between Login and Sign Up */}
            <div className="pt-2 text-center text-xs text-slate-500">
              {isSignUp ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMessage(null);
                    }}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMessage(null);
                    }}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Create Free Account
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CandidateLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CandidateLoginForm />
    </Suspense>
  );
}
