"use client";

import React, { useState, useEffect } from "react";
import {
  useGetWhatsAppConfigQuery,
  useUpdateWhatsAppConfigMutation,
  useSendTestOtpMutation,
  useSendTestJobAlertMutation,
  WhatsAppParameter,
} from "@/services/api/settingsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import {
  MessageSquare,
  ShieldCheck,
  Save,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Server,
  FileCode,
  Key,
  HelpCircle,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function AdminWhatsAppSettingsPage() {
  const { data: config, isLoading, refetch } = useGetWhatsAppConfigQuery();
  const [updateConfig, { isLoading: isSaving }] = useUpdateWhatsAppConfigMutation();
  const [sendTestOtp, { isLoading: isTestingOtp }] = useSendTestOtpMutation();
  const [sendTestJobAlert, { isLoading: isTestingJobAlert }] = useSendTestJobAlertMutation();

  // Gateway credentials
  const [broadcastUrl, setBroadcastUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [dryRun, setDryRun] = useState(true);

  // OTP Template State
  const [otpTemplate, setOtpTemplate] = useState("instant_placement_login_otp_v2");
  const [testOtpPhone, setTestOtpPhone] = useState("8866911763");
  const [otpTestResult, setOtpTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  // Job Alert Template State
  const [jobAlertTemplate, setJobAlertTemplate] = useState("candidate_profile_notification_v1");
  const [jobAlertParams, setJobAlertParams] = useState<WhatsAppParameter[]>([
    { index: 1, label: "Candidate Name", key: "candidate_name", example: "Rahul Sharma" },
    { index: 2, label: "Job Role / Title", key: "job_title", example: "Customer Support Executive" },
    { index: 3, label: "Organization / Company", key: "company", example: "Reliable Solution" },
    { index: 4, label: "Job City", key: "city", example: "Surat" },
    { index: 5, label: "Salary Range", key: "salary_range", example: "₹15,000 - ₹20,000 / month" },
    { index: 6, label: "Job ID (Button URL)", key: "job_id", example: "6ab02bba26b5db309788befd" },
  ]);

  // Test Job Alert form fields
  const [testJobPhone, setTestJobPhone] = useState("8866911763");
  const [testName, setTestName] = useState("Gopal");
  const [testRole, setTestRole] = useState("Customer Support Executive");
  const [testCompany, setTestCompany] = useState("Reliable Solution");
  const [testCity, setTestCity] = useState("Surat");
  const [testSalary, setTestSalary] = useState("₹15,000 - ₹20,000 / month");
  const [testJobId, setTestJobId] = useState("6ab02bba26b5db309788befd");
  const [jobAlertTestResult, setJobAlertTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  // Populate from query
  useEffect(() => {
    if (config) {
      setBroadcastUrl(config.broadcastUrl || "https://instantbroadcast.in/api/v1/send_templet");
      setApiToken(config.apiToken || "");
      setDryRun(config.dryRun !== undefined ? config.dryRun : true);
      setOtpTemplate(config.otpTemplate || "instant_placement_login_otp_v2");
      setJobAlertTemplate(config.jobAlertTemplate || "candidate_profile_notification_v1");

      if (config.jobAlertSchema?.parameters?.length) {
        setJobAlertParams(config.jobAlertSchema.parameters);
      }
    }
  }, [config]);

  // Save full configuration
  const handleSaveAll = async () => {
    try {
      const res = await updateConfig({
        broadcastUrl,
        apiToken,
        otpTemplate,
        jobAlertTemplate,
        dryRun,
        jobAlertSchema: {
          templateName: jobAlertTemplate,
          parameterCount: jobAlertParams.length,
          description: "Meta Utility Template: Candidate Job Opening Alert",
          parameters: jobAlertParams,
        },
      }).unwrap();

      toast.success(res.message || "WhatsApp configuration saved successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save WhatsApp configuration");
    }
  };

  // Test OTP
  const handleTestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpTestResult(null);

    const cleanPhone = testOtpPhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      const res = await sendTestOtp({
        phone: cleanPhone,
        otp: "847291",
        customTemplate: otpTemplate,
      }).unwrap();

      setOtpTestResult({
        success: true,
        message: res.message || "Test OTP delivered successfully via WhatsApp!",
        details: res.response,
      });
      toast.success("Test OTP message sent!");
    } catch (err: any) {
      setOtpTestResult({
        success: false,
        message: err?.data?.message || "Failed to send test OTP. Verify your API token & template name.",
        details: err?.data?.response,
      });
      toast.error(err?.data?.message || "OTP test send failed");
    }
  };

  // Test Job Alert
  const handleTestJobAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobAlertTestResult(null);

    const cleanPhone = testJobPhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      const customParams = [
        testName,
        testRole,
        testCompany,
        testCity,
        testSalary,
        testJobId,
      ];

      const res = await sendTestJobAlert({
        phone: cleanPhone,
        candidateName: testName,
        jobTitle: testRole,
        company: testCompany,
        city: testCity,
        salary: testSalary,
        jobId: testJobId,
        customTemplate: jobAlertTemplate,
        customParameters: customParams,
      }).unwrap();

      setJobAlertTestResult({
        success: true,
        message: res.message || "Test Job Alert notification delivered successfully via WhatsApp!",
        details: res.response,
      });
      toast.success("Job Alert WhatsApp sent!");
    } catch (err: any) {
      setJobAlertTestResult({
        success: false,
        message: err?.data?.message || "Failed to send test Job Alert. Verify template name & parameter format.",
        details: err?.data?.response,
      });
      toast.error(err?.data?.message || "Job Alert test send failed");
    }
  };

  // Helper to update a parameter label or example
  const handleParamChange = (index: number, field: "label" | "example", val: string) => {
    const updated = [...jobAlertParams];
    updated[index] = { ...updated[index], [field]: val };
    setJobAlertParams(updated);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading WhatsApp configuration...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              WhatsApp & Templates Configuration
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Configure Meta templates, positional parameters, API gateway credentials, and test WhatsApp alerts.
          </p>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 px-6 py-2.5 rounded-xl shadow-md"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving Settings..." : "Save All WhatsApp Settings"}
        </Button>
      </div>

      {/* Mode / Safety Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        dryRun
          ? "bg-amber-50/80 border-amber-200 text-amber-900"
          : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              dryRun ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
            }`}>
              {dryRun ? <Lock className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-current" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  {dryRun ? "Safety Mode: DRY RUN (Testing Mode)" : "Active Mode: LIVE WHATSAPP DISPATCH"}
                </h3>
                <Badge className={dryRun ? "bg-amber-200 text-amber-800 border-none" : "bg-emerald-200 text-emerald-800 border-none"}>
                  {dryRun ? "Simulated" : "Live Messages"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm opacity-90 mt-0.5">
                {dryRun
                  ? "When new jobs are posted, candidate matching is calculated and logged safely in the backend. Real WhatsApp messages are NOT dispatched to candidates."
                  : "Live dispatch is active! Whenever an employer or admin posts a new job, all matched candidates in the database will receive real WhatsApp alerts immediately."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setDryRun(!dryRun)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                dryRun
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              Switch to {dryRun ? "Live Mode" : "Dry-Run Safe Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* Gateway Credentials Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <Server className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">
            InstantBroadcast Gateway Credentials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Broadcast API URL
            </label>
            <Input
              value={broadcastUrl}
              onChange={(e) => setBroadcastUrl(e.target.value)}
              placeholder="https://instantbroadcast.in/api/v1/send_templet"
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Endpoint used by Instant Placement for WhatsApp dispatch.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              API Bearer Token
            </label>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="font-mono text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Your instantbroadcast.in account JWT token.
            </p>
          </div>
        </div>
      </div>

      {/* Template 1: Candidate OTP Login */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              Template 1: Candidate OTP Verification
            </h2>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
            2 Positional Parameters
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Template Name on WhatsApp / Meta
              </label>
              <Input
                value={otpTemplate}
                onChange={(e) => setOtpTemplate(e.target.value)}
                placeholder="instant_placement_login_otp_v2"
                className="font-mono text-xs font-bold text-emerald-700"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Must match the approved template name on your WhatsApp Cloud API / instantbroadcast account.
              </p>
            </div>

            {/* Parameter mapping cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Configured Template Parameters
              </label>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {"{{1}}"}
                  </span>
                  <span className="font-semibold text-slate-700">6-Digit OTP Code (Message Body)</span>
                  <span className="text-slate-400 font-mono">e.g. 847291</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {"{{2}}"}
                  </span>
                  <span className="font-semibold text-slate-700">Copy Code Button Payload</span>
                  <span className="text-slate-400 font-mono">e.g. 847291</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Send Form */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-600" /> Test Send OTP to Mobile
            </h4>
            <p className="text-[11px] text-slate-500">
              Send a real test OTP code right now to verify that your template name and token are valid.
            </p>

            <form onSubmit={handleTestOtp} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">+91</span>
                  <Input
                    type="tel"
                    maxLength={10}
                    value={testOtpPhone}
                    onChange={(e) => setTestOtpPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="8866911763"
                    className="pl-12 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isTestingOtp}
                className="w-full py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-xs"
              >
                {isTestingOtp ? "Sending Test OTP..." : "Send Test OTP (WhatsApp)"}
              </Button>
            </form>

            {/* Test result status */}
            {otpTestResult && (
              <div className={`p-3 rounded-xl text-xs border ${
                otpTestResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {otpTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                  <span>{otpTestResult.success ? "Success" : "Failed"}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{otpTestResult.message}</p>
                {otpTestResult.details?.messageId && (
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    Message ID: {otpTestResult.details.messageId}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template 2: Job Alert Notification */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              Template 2: Candidate Job Alert Broadcast
            </h2>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
            {jobAlertParams.length} Positional Parameters
          </Badge>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Template Name on WhatsApp / Meta
          </label>
          <Input
            value={jobAlertTemplate}
            onChange={(e) => setJobAlertTemplate(e.target.value)}
            placeholder="candidate_profile_notification_v1"
            className="font-mono text-xs font-bold text-blue-700 max-w-md"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Meta approved utility template name for broadcasting new vacancies to matched candidates.
          </p>
        </div>

        {/* Positional Parameters Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Template Positional Parameters Mapping ({"{{1}}"} to {"{{"}{jobAlertParams.length}{"}}"})
              </h3>
              <p className="text-[11px] text-slate-500">
                These values are dynamically populated from candidate and job records in MongoDB.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total Parameters: <strong className="text-blue-600">{jobAlertParams.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-16">Param</th>
                  <th className="py-2.5 px-3">Field Label</th>
                  <th className="py-2.5 px-3">Database Key</th>
                  <th className="py-2.5 px-3">Sample Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobAlertParams.map((param, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {`{{${param.index}}}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Input
                        value={param.label}
                        onChange={(e) => handleParamChange(idx, "label", e.target.value)}
                        className="text-xs h-8"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                      {param.key}
                    </td>
                    <td className="py-2.5 px-3">
                      <Input
                        value={param.example}
                        onChange={(e) => handleParamChange(idx, "example", e.target.value)}
                        className="text-xs h-8 font-mono text-slate-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Test Send for Job Alert */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-blue-600" /> Send Test Job Alert WhatsApp
              </h4>
              <p className="text-[11px] text-slate-500">
                Verify this template on your phone using custom or sample job alert parameters.
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-none text-[10px]">
              Live WhatsApp Test
            </Badge>
          </div>

          <form onSubmit={handleTestJobAlert} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Recipient WhatsApp Mobile <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">+91</span>
                  <Input
                    type="tel"
                    maxLength={10}
                    value={testJobPhone}
                    onChange={(e) => setTestJobPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="8866911763"
                    className="pl-12 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">{"{{1}}"} Candidate Name</label>
                <Input
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">{"{{2}}"} Job Role / Title</label>
                <Input
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">{"{{3}}"} Company Name</label>
                <Input
                  value={testCompany}
                  onChange={(e) => setTestCompany(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">{"{{4}}"} Job City</label>
                <Input
                  value={testCity}
                  onChange={(e) => setTestCity(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">{"{{5}}"} Salary Range</label>
                <Input
                  value={testSalary}
                  onChange={(e) => setTestSalary(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {"{{6}}"} Button Job ID (Redirects candidate to /job/[id])
              </label>
              <Input
                value={testJobId}
                onChange={(e) => setTestJobId(e.target.value)}
                className="text-xs font-mono max-w-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isTestingJobAlert}
              className="py-2.5 px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-xs"
            >
              {isTestingJobAlert ? "Dispatching WhatsApp..." : "Send Test Job Alert to Mobile"}
            </Button>
          </form>

          {/* Test Result status */}
          {jobAlertTestResult && (
            <div className={`p-4 rounded-xl text-xs border ${
              jobAlertTestResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {jobAlertTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{jobAlertTestResult.success ? "Delivered Successfully!" : "Dispatch Failed"}</span>
              </div>
              <p className="text-[11px] leading-relaxed">{jobAlertTestResult.message}</p>
              {jobAlertTestResult.details?.messageId && (
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Message ID: {jobAlertTestResult.details.messageId}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
