"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MessageSquare,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";
import { SegmentedOTPInput } from "@/components/ui/SegmentedOTPInput";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { toast } from "@/components/ui/toast";

interface CandidateAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const CandidateAuthModal: React.FC<CandidateAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const router = useRouter();
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
      const msg = "Please enter a valid 10-digit Indian mobile number (starts with 6-9)";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        const msg = text || `Server error (${res.status}). Please check API connectivity.`;
        setErrorMessage(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        const msg = Array.isArray(data.errors) && data.errors.length > 0
          ? data.errors.map((e: any) => typeof e === "string" ? e : e.msg || e.message).join(". ")
          : data.message || data.error?.message || "Failed to send OTP. Please check your number and try again.";
        setErrorMessage(msg);
        toast.error(msg);
        if (data.retryAfter) {
          setResendCooldown(data.retryAfter);
        }
        setLoading(false);
        return;
      }

      const successMsg = data.message || `OTP sent to WhatsApp (+91 ${cleanPhone})`;
      setSuccessMessage(successMsg);
      toast.success(successMsg);
      setStep("otp");
      setResendCooldown(120);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      const msg = err?.message || "Network error connecting to authentication server. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      const msg = "Please enter the complete 6-digit OTP received on WhatsApp";
      setErrorMessage(msg);
      toast.error(msg);
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

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        const msg = text || `Server error (${res.status}). Please check API connectivity.`;
        setErrorMessage(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        const msg = Array.isArray(data.errors) && data.errors.length > 0
          ? data.errors.map((e: any) => typeof e === "string" ? e : e.msg || e.message).join(". ")
          : data.message || data.error?.message || "Invalid or expired OTP. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      const userData = data.data?.user || data.user;
      const token = data.data?.token || data.token;

      if (!userData || !token) {
        const msg = "Unexpected server response. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      if (userData.role && userData.role !== "CANDIDATE") {
        const msg = `This mobile number is registered as an ${userData.role} account. Please sign in via the ${userData.role.toLowerCase()} portal.`;
        setErrorMessage(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      const userWithToken = { ...userData, token };
      localStorage.setItem("ip_token", token);
      localStorage.setItem("ip_user", JSON.stringify(userWithToken));
      dispatch(setUser(userWithToken));
      onLoginSuccess(userWithToken);

      toast.success(data.message || `Welcome back, ${userData.name || "Candidate"}! Login successful.`);
      resetModal();
      onClose();
    } catch (err: any) {
      console.error("OTP verification error:", err);
      const msg = err?.message || "Unable to verify OTP right now. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
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
      const msg = "Please enter a valid email address (e.g. name@example.com)";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!password || password.length < 6) {
      const msg = "Password must be at least 6 characters long";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (isSignUp) {
      // Validate Sign Up Specific Fields
      if (!name.trim() || name.trim().length < 2) {
        const msg = "Please enter your full name (minimum 2 characters)";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      const cleanPhone = signupPhone.replace(/\D/g, "").slice(-10);
      if (!isValidPhone(cleanPhone)) {
        const msg = "Please enter a valid 10-digit Indian phone number (starts with 6-9)";
        setErrorMessage(msg);
        toast.error(msg);
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

        let data: any = {};
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          const msg = text || `Server error (${res.status}). Please check API connectivity.`;
          setErrorMessage(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }

        if (!res.ok || !data.success) {
          const msg = Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors.map((e: any) => typeof e === "string" ? e : e.msg || e.message).join(". ")
            : data.message || data.error?.message || "Registration failed. An account with this email or phone may already exist.";
          setErrorMessage(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }

        const userData = data.data?.user || data.user;
        const token = data.data?.token || data.token;

        if (!userData || !token) {
          const msg = "Unexpected server response. Please try again.";
          setErrorMessage(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }

        const userWithToken = { ...userData, token };
        localStorage.setItem("ip_token", token);
        localStorage.setItem("ip_user", JSON.stringify(userWithToken));
        dispatch(setUser(userWithToken));
        onLoginSuccess(userWithToken);

        toast.success(data.message || `Welcome to Instant Placement, ${userData.name || "Candidate"}! Account created successfully.`);
        resetModal();
        onClose();
      } catch (err: any) {
        console.error("Sign up error:", err);
        const msg = err?.message || "Network error during registration. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
        setLoading(false);
      }
    } else {
      // Handle Email Login
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

        let data: any = {};
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          const msg = text || `Server error (${res.status}). Please check API connectivity.`;
          setErrorMessage(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }

        if (!res.ok || !data.success) {
          const msg = Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors.map((e: any) => typeof e === "string" ? e : e.msg || e.message).join(". ")
            : data.message || data.error?.message || "Invalid email or password. Please verify your credentials.";
          setErrorMessage(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }

        const userData = data.data?.user || data.user;
        const token = data.data?.token || data.token;

        if (!userData || !token) {
          const msg = "Unexpected server response. Please try again.";
          setErrorMessage(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }

        if (userData.role && userData.role !== "CANDIDATE") {
          const msg = `This account is registered as ${userData.role}. Please log in via the ${userData.role.toLowerCase()} portal.`;
          setErrorMessage(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }

        const userWithToken = { ...userData, token };
        localStorage.setItem("ip_token", token);
        localStorage.setItem("ip_user", JSON.stringify(userWithToken));
        dispatch(setUser(userWithToken));
        onLoginSuccess(userWithToken);

        toast.success(data.message || `Welcome back, ${userData.name || "Candidate"}! Login successful.`);
        resetModal();
        onClose();
      } catch (err: any) {
        console.error("Login error:", err);
        const msg = err?.message || "Network error during login. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
        setLoading(false);
      }
    }
  };

  const resetModal = () => {
    setAuthMethod("otp");
    setStep("phone");
    setPhone("");
    setOtp("");
    setIsSignUp(false);
    setName("");
    setEmail("");
    setPassword("");
    setSignupPhone("");
    setShowPassword(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(false);
    setResendCooldown(0);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetModal();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md p-5 sm:p-6 rounded-2xl shadow-2xl border-slate-200">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="verified" className="gap-1.5 py-0.5 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Free Candidate Access
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {authMethod === "otp"
              ? step === "phone"
                ? "Candidate Sign In"
                : "Enter WhatsApp OTP"
              : isSignUp
              ? "Create Free Candidate Account"
              : "Sign In with Email"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs leading-relaxed">
            {authMethod === "otp"
              ? step === "phone"
                ? "Enter your mobile number to receive a secure WhatsApp verification code."
                : `We sent a 6-digit verification code to WhatsApp on +91 ${phone}.`
              : isSignUp
              ? "Fill in your details below to create your free candidate profile and unlock direct HR contacts."
              : "Enter your registered candidate email and password to access verified jobs."}
          </DialogDescription>
        </DialogHeader>

        {/* Method Switcher Tabs (WhatsApp OTP vs Email & Password) */}
        {step === "phone" && (
          <div className="flex rounded-xl bg-slate-100 p-1 mt-1 border border-slate-200/80">
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

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && !errorMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-tight">{successMessage}</span>
          </div>
        )}

        {/* ─── OPTION 1: WhatsApp OTP Flow ─── */}
        {authMethod === "otp" && (
          <>
            {/* STEP 1: Phone Input */}
            {step === "phone" && (
              <form onSubmit={handleSendOtp} className="space-y-4 pt-1">
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
                      className="w-full h-11 pl-12 pr-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold tracking-wide text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-11 font-bold text-sm gap-2 rounded-xl shadow-md shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                  disabled={loading || phone.length < 10}
                >
                  <span>{loading ? "Sending WhatsApp Code..." : "Get OTP via WhatsApp"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="leading-tight">Free candidate portal. Digital CV builder and 1-click job applications.</span>
                </div>
              </form>
            )}

            {/* STEP 2: OTP Input */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    OTP sent to WhatsApp:
                  </span>
                  <strong className="font-bold text-emerald-950">
                    +91 {phone}
                  </strong>
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

                {/* Resend OTP Section */}
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">Didn't receive code on WhatsApp?</span>
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
                    {loading ? "Verifying..." : "Verify & Open"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ─── OPTION 2: Email & Password Flow ─── */}
        {authMethod === "password" && (
          <form onSubmit={handleEmailAuth} className="space-y-3.5 pt-1">
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
                      className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number for Registration */}
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
                      className="w-full h-10 pl-11 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
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
                  className="w-full h-10 pl-10 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
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
                  placeholder={isSignUp ? "Create a strong password" : "Enter your account password"}
                  value={password}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setPassword(e.target.value);
                  }}
                  className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
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
              className="w-full h-11 font-bold text-sm gap-2 rounded-xl shadow-md shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 text-white transition-all mt-2"
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
      </DialogContent>
    </Dialog>
  );
};
