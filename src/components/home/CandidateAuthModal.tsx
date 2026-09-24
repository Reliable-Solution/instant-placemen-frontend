"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowRight, Sparkles, MessageSquare, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";


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
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

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

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
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
        setErrorMessage(data.message || "Failed to send OTP. Please check your number and try again.");
        if (data.retryAfter) {
          setResendCooldown(data.retryAfter);
        }
        setLoading(false);
        return;
      }

      setSuccessMessage(`OTP sent to WhatsApp (+91 ${cleanPhone})`);
      setStep("otp");
      setResendCooldown(120); // 2-minute cooldown (120 seconds)
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setErrorMessage("Network error connecting to authentication server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP received on WhatsApp");
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
        setErrorMessage(data.message || "Invalid or expired OTP. Please try again.");
        setLoading(false);
        return;
      }

      if (data.token) localStorage.setItem("ip_token", data.token);
      if (data.user) {
        localStorage.setItem("ip_user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }

      resetModal();
      onClose();
      router.push("/candidate");
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setErrorMessage("Unable to verify OTP right now. Please try again.");
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
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
      <DialogContent className="max-w-md p-6 sm:rounded-2xl shadow-2xl border-slate-200">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="verified" className="gap-1.5 py-0.5 text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Verified Candidate Sign In
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {step === "phone" ? "Candidate Login / Sign Up" : "Enter WhatsApp OTP"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs leading-relaxed">
            {step === "phone"
              ? "Sign in with your mobile number. We'll send a 6-digit verification code to your WhatsApp."
              : `We sent a 6-digit verification code to WhatsApp on +91 ${phone}. Enter it below to continue.`}
          </DialogDescription>
        </DialogHeader>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
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
              <span>{loading ? "Sending OTP via WhatsApp..." : "Get OTP via WhatsApp"}</span>
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
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Enter 6-Digit WhatsApp Code
              </label>
              <Input
                type="text"
                placeholder="● ● ● ● ● ●"
                value={otp}
                onChange={(e) => {
                  setErrorMessage(null);
                  setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6));
                }}
                maxLength={6}
                className="h-13 text-center text-2xl font-extrabold tracking-[0.35em] text-slate-900 rounded-xl border-slate-300 focus:ring-2 focus:ring-blue-600"
                required
                autoFocus
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
      </DialogContent>
    </Dialog>
  );
};
