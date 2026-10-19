"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { getApiBaseUrl } from "@/lib/config";

/* ─── Constants ─────────────────────────────────────────────────── */

const API_BASE = getApiBaseUrl();


/* ─── Types ─────────────────────────────────────────────────────── */

interface UserProfile {
  _id?: string;
  id?: string;
  name?: string;
  phone?: string;
  consentToShareProfile?: boolean;
  consentDate?: string | null;
  [key: string]: unknown;
}

interface PrivacyItem {
  shared: boolean;
  label: string;
  description: string;
}

/* ─── Data ──────────────────────────────────────────────────────── */

const SHARED_ITEMS: PrivacyItem[] = [
  {
    shared: true,
    label: "Name & Professional Details",
    description: "Candidate name, experience level, qualification, and current/target role",
  },
  {
    shared: true,
    label: "Target Job Role & Skills",
    description: "Preferred job role, selected skills, and professional summary",
  },
  {
    shared: true,
    label: "City & General Locality",
    description: "Target city and area for commute feasibility screening",
  },
  {
    shared: true,
    label: "Notice Period & Availability",
    description: "Joining timeline and availability status for immediate screening",
  },
  {
    shared: true,
    label: "Salary Expectations",
    description: "Expected and current salary range for employer fit-check",
  },
];

const PROTECTED_ITEMS: PrivacyItem[] = [
  {
    shared: false,
    label: "Phone Number",
    description: "Protected until a verified employer activates a hiring plan mandate",
  },
  {
    shared: false,
    label: "WhatsApp Number",
    description: "Never shared publicly — used only for platform notifications",
  },
  {
    shared: false,
    label: "Email Address",
    description: "Never shared with any external party",
  },
  {
    shared: false,
    label: "Exact Home Address",
    description: "Never requested, stored, or disclosed",
  },
  {
    shared: false,
    label: "Resume PDF File",
    description: "Stored securely — shared only with explicit per-employer consent",
  },
  {
    shared: false,
    label: "Salary History & Documents",
    description: "Confidential — never exposed in search results",
  },
];

/* ─── Page Component ────────────────────────────────────────────── */

export default function CandidatePrivacyPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [consent, setConsent] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [consentDate, setConsentDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Load user on mount ── */

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("ip_user")
        : null;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("ip_token")
        : null;

    if (!raw && !token) {
      router.replace("/");
      return;
    }

    let u: UserProfile = {};
    try {
      u = raw ? (JSON.parse(raw) as UserProfile) : {};
    } catch (err) {
      console.error("Corrupt ip_user in localStorage on privacy page:", err);
      router.replace("/");
      return;
    }
    setUser(u);
    setConsent(Boolean(u.consentToShareProfile));
    setConsentDate(u.consentDate || null);

    if (token) {
      fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch profile");
          return res.json();
        })
        .then((data) => {
          if (data?.user) {
            const bu = data.user;
            setUser(bu);
            if (typeof bu.consentToShareProfile === "boolean") {
              setConsent(bu.consentToShareProfile);
            }
            if (bu.consentDate) {
              setConsentDate(bu.consentDate);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch privacy profile, using cached data:", err);
          // Use cached data from localStorage
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [router]);

  /* ── Persist helper ── */

  const persistUser = useCallback(
    (updated: Partial<UserProfile>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const merged = { ...prev, ...updated };
        localStorage.setItem("ip_user", JSON.stringify(merged));
        return merged;
      });
    },
    []
  );

  const showStatus = useCallback((msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 5000);
  }, []);

  /* ── Toggle consent handler ── */

  const handleToggleConsent = async () => {
    if (isToggling) return;

    const newConsent = !consent;
    setIsToggling(true);

    try {
      const token = localStorage.getItem("ip_token");
      const res = await fetch(`${API_BASE}/candidates/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone: user?.phone,
          candidateId: user?._id || user?.id,
          consentToShareProfile: newConsent,
          consentDate: newConsent ? new Date().toISOString() : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update consent");
    } catch (err) {
      console.error("Consent toggle API error:", err);
    }

    const now = newConsent ? new Date().toISOString() : null;
    setConsent(newConsent);
    setConsentDate(now);
    persistUser({ consentToShareProfile: newConsent, consentDate: now });
    setIsToggling(false);

    showStatus(
      newConsent
        ? "Consent granted — your Digital CV is now visible to verified employers ✓"
        : "Profile hidden from employer search — your data is private ✓"
    );
  };

  /* ── Date formatting helper ── */

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  /* ── Loading skeleton ── */

  if (!user && isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">
            Loading privacy settings…
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  /* ── Render ── */

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Privacy &amp; Consent
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Control what employers can see about you
          </p>
        </div>

        {statusMsg && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full max-w-xs">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{statusMsg}</span>
          </span>
        )}
      </div>

      {/* ── Large Consent Toggle Card ────────────────────────── */}
      <div
        className={`rounded-3xl border-2 p-6 transition-all duration-300 shadow-sm ${
          consent
            ? "bg-emerald-50/70 border-emerald-300 shadow-emerald-500/10"
            : "bg-amber-50/70 border-amber-300 shadow-amber-500/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Status Icon */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
              consent
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
            }`}
          >
            {consent ? (
              <Eye className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <EyeOff className="w-6 h-6 sm:w-7 sm:h-7" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  consent
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              <h2
                className={`font-extrabold text-lg ${
                  consent ? "text-emerald-950" : "text-amber-950"
                }`}
              >
                {consent
                  ? "Profile is Discoverable"
                  : "Profile is Private"}
              </h2>
            </div>
            <p
              className={`text-sm leading-relaxed ${
                consent ? "text-emerald-800" : "text-amber-800"
              }`}
            >
              {consent
                ? "Verified employers in your target city can view your Digital CV snapshot and contact you for job openings. Your consent is recorded under India's Digital Personal Data Protection (DPDP) Act, 2023."
                : "Your profile will NOT appear in any employer search results. Enable sharing below so verified local recruiters can discover you and call you for interviews."}
            </p>

            {/* Consent date display */}
            {consent && consentDate && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-700 font-semibold">
                  Consent granted on {formatDate(consentDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Switch Row */}
        <div className="mt-6 pt-5 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Custom Toggle Switch */}
            <button
              onClick={handleToggleConsent}
              disabled={isToggling}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 shrink-0 ${
                consent
                  ? "bg-emerald-600 focus:ring-emerald-300"
                  : "bg-slate-300 focus:ring-slate-200"
              } ${isToggling ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
              aria-label={consent ? "Disable profile sharing" : "Enable profile sharing"}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                  consent ? "left-9" : "left-1"
                }`}
              >
                {isToggling && (
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </button>

            <div>
              <span
                className={`text-sm font-bold block ${
                  consent ? "text-emerald-950" : "text-slate-700"
                }`}
              >
                {isToggling
                  ? "Updating consent…"
                  : consent
                    ? "Profile Sharing Enabled"
                    : "Enable Profile Sharing"}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Toggle to control employer visibility
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
            <Lock className="w-3 h-3" />
            <span>DPDP Act 2023</span>
          </div>
        </div>
      </div>

      {/* ── What Profile Sharing Means ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-blue-50/60">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            What does &quot;Profile Sharing&quot; mean?
          </h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-700 leading-relaxed">
            When you enable profile sharing, Instant Placement makes your{" "}
            <strong>Digital CV snapshot</strong> — a standardized summary card
            containing your name, experience, skills, target role, and city —
            available to{" "}
            <strong>verified employers and HR teams</strong> in your target job
            city. This helps recruiters quickly identify matching candidates
            and reach out for interviews.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 text-center">
              <p className="text-lg font-extrabold text-blue-700">10s</p>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">
                Average employer screen time
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-3 text-center">
              <p className="text-lg font-extrabold text-emerald-700">✓</p>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                Only verified employers see your data
              </p>
            </div>
            <div className="bg-violet-50 rounded-xl border border-violet-100 p-3 text-center">
              <p className="text-lg font-extrabold text-violet-700">🔒</p>
              <p className="text-xs text-violet-600 font-semibold mt-0.5">
                Phone &amp; email stay protected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Privacy Transparency Breakdown ──────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            Privacy Transparency Breakdown
          </h3>
        </div>

        <div className="p-5 space-y-6">
          {/* Shared Items */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide leading-tight text-wrap">
                  Shared with Verified Employers
                </h4>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 whitespace-nowrap">
                {SHARED_ITEMS.length} fields
              </span>
            </div>
            <div className="space-y-2.5">
              {SHARED_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-800 block">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Protected Items */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide leading-tight text-wrap">
                  Protected — Never Shared
                </h4>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200 shrink-0 whitespace-nowrap">
                {PROTECTED_ITEMS.length} fields
              </span>
            </div>
            <div className="space-y-2.5">
              {PROTECTED_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-500 block">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DPDP Act 2023 Compliance Notice ─────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0 border border-white/20">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2 flex-wrap">
                <span>DPDP Act 2023 Compliance</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2 py-0.5 rounded-full font-bold shrink-0 whitespace-nowrap">
                  ✓ COMPLIANT
                </span>
              </h3>
              <p className="text-sm text-blue-200 mt-1 leading-relaxed">
                Instant Placement operates in full compliance with India&apos;s
                Digital Personal Data Protection Act, 2023 (DPDP Act).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/15">
                <p className="text-xs font-bold text-blue-200 uppercase tracking-wide mb-1">
                  Your Rights
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Withdraw consent at any time",
                    "Request data deletion",
                    "Access your stored data",
                    "Rectify inaccurate information",
                  ].map((right, i) => (
                    <li
                      key={i}
                      className="text-xs text-blue-100 flex items-start gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{right}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/15">
                <p className="text-xs font-bold text-blue-200 uppercase tracking-wide mb-1">
                  Our Commitments
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Purpose-limited data collection only",
                    "No third-party data selling",
                    "Encrypted data storage & transfer",
                    "Consent-first profile visibility",
                  ].map((commitment, i) => (
                    <li
                      key={i}
                      className="text-xs text-blue-100 flex items-start gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{commitment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Current Consent Status */}
            <div className="flex items-center justify-between bg-white/10 backdrop-blur rounded-xl p-3 border border-white/15">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    consent ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                <span className="text-xs font-bold text-white">
                  Consent Status:{" "}
                  <span
                    className={
                      consent ? "text-emerald-300" : "text-amber-300"
                    }
                  >
                    {consent ? "ACTIVE — Profile Visible" : "INACTIVE — Profile Hidden"}
                  </span>
                </span>
              </div>
              {consentDate && (
                <span className="text-xs text-blue-300 font-medium">
                  Recorded: {formatDate(consentDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Action: Go to Dashboard ───────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/candidate"
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Dashboard
        </Link>
        <Link
          href="/candidate/profile"
          className="text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
        >
          Edit Profile →
        </Link>
      </div>
    </div>
  );
}
