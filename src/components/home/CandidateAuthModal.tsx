"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowRight, Sparkles, KeyRound } from "lucide-react";

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
  const [generatedOtp, setGeneratedOtp] = useState("4829");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGeneratedOtp(String(Math.floor(1000 + Math.random() * 9000)));
      setStep("otp");
    }, 500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      alert(`OTP mismatch. Demo OTP is: ${generatedOtp}`);
      return;
    }
    setLoading(true);
    
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5100/api/v1";

    try {
      const res = await fetch(`${API_BASE}/auth/candidate-otp-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) localStorage.setItem("ip_token", data.token);
        localStorage.setItem("ip_user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onClose();
        router.push("/candidate");
        return;
      }
    } catch (err) {
      console.warn("Candidate OTP login backend sync:", err);
    }

    // Fallback if backend network issue
    const fallbackUser = {
      name: "Candidate",
      phone: cleanPhone,
      city: "Surat",
      experience: "Fresher",
      qualification: "12th Pass",
      role: "CANDIDATE",
      consentToShareProfile: false,
    };
    localStorage.setItem("ip_user", JSON.stringify(fallbackUser));
    onLoginSuccess(fallbackUser);
    onClose();
    router.push("/candidate");
    setLoading(false);
  };

  const resetModal = () => {
    setStep("phone");
    setOtp("");
    setLoading(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        resetModal();
        onClose();
      }}
    >
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="verified" className="gap-1 py-0.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Free Candidate Sign In
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {step === "phone" ? "Candidate Login / Sign Up" : "Verify OTP Code"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            {step === "phone"
              ? "Enter your mobile number to sign in. Zero passwords needed."
              : `Enter 4-digit code sent to +91 ${phone} to open your candidate dashboard.`}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: Phone Input */}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Enter 10-Digit Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-12 font-bold text-sm gap-2 rounded-xl shadow-md shadow-blue-500/25"
              disabled={loading}
            >
              <span>{loading ? "Sending OTP..." : "Get Instant OTP"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Free candidate portal. Build your Digital CV or upload PDF in 1 click.</span>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Input */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Demo OTP Code:
              </span>
              <strong className="text-base font-extrabold tracking-widest text-amber-950">
                {generatedOtp}
              </strong>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Enter 4-Digit OTP
              </label>
              <Input
                type="text"
                placeholder={generatedOtp}
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 4))}
                maxLength={4}
                className="h-12 text-center text-lg font-extrabold tracking-widest"
                required
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("phone")}
                className="flex-1 h-11 text-xs"
              >
                Change Number
              </Button>
              <Button
                type="submit"
                variant="gradient"
                className="flex-1 h-11 text-sm font-bold"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Open Dashboard"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
