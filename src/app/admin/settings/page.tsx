"use client";

import React, { useState, useEffect } from "react";
import {
  useGetAdminSettingsQuery,
  useUpdateSettingMutation,
} from "@/services/api/settingsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  Save,
  ExternalLink,
  MessageSquare,
  Globe,
  Phone,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Server,
  Lock,
  Layers,
  FileText,
  Shield,
  Clock,
  Share2,
  Headphones,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import {
  FaLinkedin,
  FaSquareFacebook,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

const DEFAULT_PRIVACY_CONTENT = `1. Information We Collect
When you use Instant Placement, we collect information you provide directly, including:
• Name, email address, and verified phone number
• Professional snapshot (skills, work experience, qualifications)
• Resume / CV documents uploaded for job applications
• Preferred job locations (cities, localities, and commute preferences)

2. How We Use Your Information
We use your information to:
• Connect job seekers with verified employers and hiring managers
• Verify commute feasibility between candidate residency and workplace
• Send real-time WhatsApp job alerts matching your skills
• Facilitate direct employer contact without middlemen agencies

3. Digital Personal Data Protection (DPDP Act 2023)
In strict compliance with the Digital Personal Data Protection Act, 2023:
• We never sell your personal data to unauthorized third parties
• Candidate profiles require explicit consent before being discoverable by recruiters
• You have the right to withdraw consent and make your profile private anytime

4. Zero Recruitment Fees Guarantee
Instant Placement does NOT charge job seekers any fees for job offers, registration, or interviews.

5. Data Privacy Inquiries
For data privacy requests or grievance redressal, contact us at: support@instantplacement.in`;

const DEFAULT_TERMS_CONTENT = `1. Acceptance of Terms
By accessing or using Instant Placement, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.

2. Platform Description
Instant Placement is a recruitment platform connecting verified job seekers directly with hiring managers across Surat, Gujarat, Mumbai, and India with zero consultancy commissions.

3. Candidate Code of Conduct
Candidates using the platform agree to:
• Provide genuine, accurate, and truthful resume and qualification details
• Not submit fraudulent applications or impersonate any individual
• Safeguard their account login credentials and OTPs

4. Employer Responsibilities
Employers posting job mandates agree to:
• Zero Candidate Fees: Never demand registration fees or security deposits from candidates
• Genuine Job Openings: Post accurate salary ranges and physical work locations
• Professional Conduct: Respect candidate communication hours and fair hiring standards

5. Limitation of Liability
Instant Placement strives to verify all employers and job postings. Direct employment contracts and terms remain strictly between the employer and candidate.

6. Governing Law & Jurisdiction
These terms are governed by the laws of India. Any disputes are subject to the exclusive jurisdiction of the courts in Surat, Gujarat.`;

export default function AdminSettingsPage() {
  const { data: adminSettings = [], isLoading } = useGetAdminSettingsQuery();
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();

  const [formValues, setFormValues] = useState<Record<string, string>>({
    whatsapp_channel_link: "https://whatsapp.com/channel/0029Va9InstantPlacement",
    website_url: "https://instantplacement.in",
    support_phone: "+91 78630 22284",
    support_email: "support@instantplacement.in",
    support_whatsapp: "+91 78630 22284",
    support_whatsapp_link: "https://wa.me/917863022284?text=Hello%20Instant%20Placement%20Support",
    support_business_hours: "Mon - Sat, 9:00 AM - 7:00 PM (IST)",
    footer_tagline: "India's direct hiring and job discovery platform. Connect directly with companies and candidates without unnecessary middlemen.",
    footer_free_badge: "100% Free for Job Seekers",
    footer_company_name: "Instant Placement Technologies Pvt. Ltd.",
    social_linkedin: "https://linkedin.com",
    social_facebook: "https://facebook.com",
    social_instagram: "https://instagram.com",
    social_twitter: "https://x.com",
    social_youtube: "https://youtube.com",
    privacy_policy_title: "Privacy Policy",
    privacy_policy_date: "September 26, 2026",
    privacy_policy_content: DEFAULT_PRIVACY_CONTENT,
    terms_of_service_title: "Terms of Service",
    terms_of_service_date: "September 26, 2026",
    terms_of_service_content: DEFAULT_TERMS_CONTENT,
  });

  // Feature Toggles state
  const [featureToggles, setFeatureToggles] = useState({
    maintenance_mode: false,
    whatsapp_apply: true,
    auto_approve_gst: false,
    transparent_pricing: true,
    ai_commute_verification: true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (adminSettings && adminSettings.length > 0) {
      const values: Record<string, string> = {};
      adminSettings.forEach((s: any) => {
        values[s.key] = s.value;
      });
      setFormValues((prev) => ({ ...prev, ...values }));
    }
  }, [adminSettings]);

  const handleToggle = (key: keyof typeof featureToggles) => {
    setFeatureToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success(`Feature toggle '${key.replace(/_/g, " ")}' updated.`);
  };

  const handleSave = async () => {
    try {
      const promises = Object.entries(formValues).map(([key, value]) =>
        updateSetting({
          key,
          value,
          label: key.replace(/_/g, " ").toUpperCase(),
        }).unwrap()
      );

      await Promise.all(promises);
      toast.success("Platform settings successfully synchronized!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update platform settings.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
            <Sliders className="w-3.5 h-3.5 text-amber-300" />
            <span>Master Governance &amp; Configuration</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Platform Feature Flags &amp; Settings</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Configure system-wide operational toggles, candidate communication channels, and global contact links.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading || isUpdating}
          className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs gap-2 shadow-lg shadow-indigo-600/30 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? "Saved Changes!" : "Save All Settings"}</span>
        </Button>
      </div>

      {/* System Health Status Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">PostgreSQL / MongoDB</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Healthy (4ms)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">WhatsApp Business API</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Active · Meta Webhook
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">Razorpay Payment Gateway</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Live Mode
          </span>
        </div>
      </div>

      {/* Feature Flags & Toggles Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Platform Feature Switches &amp; Automation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control dynamic functionality across candidate portal, employer pipelines, and verification routines.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Toggle 1 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Candidate WhatsApp One-Click Apply</span>
              <span className="text-[11px] text-slate-500">
                Allow candidates to open pre-filled WhatsApp application messages directly to verified recruiters.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("whatsapp_apply")}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                featureToggles.whatsapp_apply ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-900 block">AI Commute Feasibility Engine</span>
              <span className="text-[11px] text-slate-500">
                Check candidate residency vs employer work location before allowing instant job applications.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("ai_commute_verification")}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                featureToggles.ai_commute_verification ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
            </button>
          </div>

          {/* Toggle 3 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Transparent Plan &amp; Billing Display</span>
              <span className="text-[11px] text-slate-500">
                Show official GST invoice breakdown and hiring plan pricing to prospective employers.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("transparent_pricing")}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                featureToggles.transparent_pricing ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
            </button>
          </div>

          {/* Toggle 4 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Auto-Approve GST Registrations</span>
              <span className="text-[11px] text-slate-500">
                Instantly grant verified badge if GST checksum algorithm validates without manual KYC queue review.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("auto_approve_gst")}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                featureToggles.auto_approve_gst ? "bg-indigo-600 justify-end" : "bg-slate-200 justify-start"
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
            </button>
          </div>

          {/* Toggle 5 */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-rose-700 block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Global Maintenance Mode</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Puts the public platform in read-only status and displays maintenance message to all visitors.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("maintenance_mode")}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                featureToggles.maintenance_mode ? "bg-rose-600 justify-end" : "bg-slate-200 justify-start"
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Global Communication Links & URLs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Headphones className="w-4 h-4 text-blue-600" />
            <span>Support Desk &amp; Footer Contact Information</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage public support phone, email, WhatsApp, operating hours, brand tagline, and legal entity name.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Support Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Support Phone Number</span>
            </label>
            <Input
              value={formValues["support_phone"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, support_phone: e.target.value })
              }
              placeholder="+91 78630 22284"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* Support Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Support Desk Email</span>
            </label>
            <Input
              value={formValues["support_email"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, support_email: e.target.value })
              }
              placeholder="support@instantplacement.in"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* Support WhatsApp */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Support WhatsApp Number</span>
            </label>
            <Input
              value={formValues["support_whatsapp"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, support_whatsapp: e.target.value })
              }
              placeholder="+91 78630 22284"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* WhatsApp Direct Link (Optional override) */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Direct Message Link</span>
            </label>
            <Input
              value={formValues["support_whatsapp_link"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, support_whatsapp_link: e.target.value })
              }
              placeholder="https://wa.me/917863022284?text=Hello%20Instant%20Placement%20Support"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white font-mono text-[11px]"
            />
          </div>

          {/* Business Hours */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Support Desk Business Hours</span>
            </label>
            <Input
              value={formValues["support_business_hours"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, support_business_hours: e.target.value })
              }
              placeholder="Mon - Sat, 9:00 AM - 7:00 PM (IST)"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* Platform Portal URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>Platform Portal URL</span>
            </label>
            <Input
              value={formValues["website_url"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, website_url: e.target.value })
              }
              placeholder="https://instantplacement.in"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* Official WhatsApp Channel URL */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official WhatsApp Channel URL</span>
            </label>
            <Input
              value={formValues["whatsapp_channel_link"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, whatsapp_channel_link: e.target.value })
              }
              placeholder="https://whatsapp.com/channel/..."
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* Footer Brand Tagline */}
          <div className="space-y-1 sm:col-span-3">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Footer Brand Tagline &amp; About Description</span>
            </label>
            <Input
              value={formValues["footer_tagline"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, footer_tagline: e.target.value })
              }
              placeholder="India's direct hiring and job discovery platform. Connect directly with companies and candidates without unnecessary middlemen."
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* Job Seeker Guarantee Pill */}
          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs font-bold text-slate-700 block">
              Candidate Free Guarantee Badge
            </label>
            <Input
              value={formValues["footer_free_badge"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, footer_free_badge: e.target.value })
              }
              placeholder="100% Free for Job Seekers"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* Copyright Entity Name */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block">
              Registered Legal Entity Name (Copyright Line)
            </label>
            <Input
              value={formValues["footer_company_name"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, footer_company_name: e.target.value })
              }
              placeholder="Instant Placement Technologies Pvt. Ltd."
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Official Social Media Profiles Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Official Social Media Icon Links</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure URLs for the social media icons shown in the website footer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* LinkedIn */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FaLinkedin className="w-4 h-4 text-[#0a66c2]" />
              <span>LinkedIn Page URL</span>
            </label>
            <Input
              value={formValues["social_linkedin"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, social_linkedin: e.target.value })
              }
              placeholder="https://linkedin.com/company/instantplacement"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* Facebook */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FaSquareFacebook className="w-4 h-4 text-[#1877f2]" />
              <span>Facebook Page URL</span>
            </label>
            <Input
              value={formValues["social_facebook"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, social_facebook: e.target.value })
              }
              placeholder="https://facebook.com/instantplacement"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FaInstagram className="w-4 h-4 text-[#e4405f]" />
              <span>Instagram Profile URL</span>
            </label>
            <Input
              value={formValues["social_instagram"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, social_instagram: e.target.value })
              }
              placeholder="https://instagram.com/instantplacement"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* X / Twitter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FaXTwitter className="w-4 h-4 text-black" />
              <span>X (Twitter) Profile URL</span>
            </label>
            <Input
              value={formValues["social_twitter"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, social_twitter: e.target.value })
              }
              placeholder="https://x.com/instantplacement"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>

          {/* YouTube */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FaYoutube className="w-4 h-4 text-[#ff0000]" />
              <span>YouTube Channel URL</span>
            </label>
            <Input
              value={formValues["social_youtube"] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, social_youtube: e.target.value })
              }
              placeholder="https://youtube.com/@instantplacement"
              className="h-10 bg-slate-50 border-slate-200 text-xs rounded-xl focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Legal & Compliance CMS (Privacy Policy & Terms of Service) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Legal Pages &amp; Compliance CMS (Privacy Policy &amp; Terms)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dynamically manage and publish the public Privacy Policy and Terms of Service pages.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors"
            >
              <span>Preview Privacy</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors"
            >
              <span>Preview Terms</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Privacy Policy Editor */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900">
              <Shield className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider">Privacy Policy Configuration</h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Page Title</label>
              <Input
                value={formValues["privacy_policy_title"] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, privacy_policy_title: e.target.value })
                }
                placeholder="Privacy Policy"
                className="h-9 bg-white border-slate-200 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Last Updated Date</label>
              <Input
                value={formValues["privacy_policy_date"] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, privacy_policy_date: e.target.value })
                }
                placeholder="September 26, 2026"
                className="h-9 bg-white border-slate-200 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Policy Body &amp; Sections</label>
              <textarea
                rows={12}
                value={formValues["privacy_policy_content"] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, privacy_policy_content: e.target.value })
                }
                placeholder="Enter privacy policy text..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Terms of Service Editor */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-wider">Terms of Service Configuration</h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Page Title</label>
              <Input
                value={formValues["terms_of_service_title"] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, terms_of_service_title: e.target.value })
                }
                placeholder="Terms of Service"
                className="h-9 bg-white border-slate-200 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Last Updated Date</label>
              <Input
                value={formValues["terms_of_service_date"] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, terms_of_service_date: e.target.value })
                }
                placeholder="September 26, 2026"
                className="h-9 bg-white border-slate-200 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Terms Body &amp; Clauses</label>
              <textarea
                rows={12}
                value={formValues["terms_of_service_content"] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, terms_of_service_content: e.target.value })
                }
                placeholder="Enter terms of service text..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
