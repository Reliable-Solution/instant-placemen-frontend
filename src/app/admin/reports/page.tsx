"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  useGetMyReportQuery,
  useGetCombinedReportQuery,
  useUpsertReportMutation,
  useSubmitReportMutation,
  useReopenReportMutation,
  useCopyPreviousReportMutation,
  useLazyGetPdfReportQuery,
  useLazyGetExcelReportQuery,
  useSendWhatsAppReportMutation,
  useSendSlackReportMutation,
  useGetReportHistoryQuery,
  useGetDispatchLogsQuery,
  useGetClientSuggestionsQuery,
  useGetReportSettingsQuery,
  useUpdateReportSettingsMutation,
  useTestSlackWebhookMutation,
  ReportEntry,
} from "@/services/api/dailyReportApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { TableSkeleton } from "@/components/Skeleton";
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  Save,
  Send,
  Plus,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Download,
  MessageSquare,
  Hash,
  Users,
  Settings as SettingsIcon,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  Shield,
  Layers,
  Eye,
  Edit,
} from "lucide-react";

function getTodayIstString(): string {
  const d = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

const EMPTY_ROW: ReportEntry = {
  clientName: "",
  vacancy: "",
  screeningCount: 0,
  shortlistedCount: 0,
  interviewsDoneToday: 0,
  selectedCount: 0,
  status: "",
  remark: "",
};

export default function AdminDailyReportsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<"today" | "history" | "settings">("today");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIstString());
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string>("");
  const isCombinedView = false;

  const [entries, setEntries] = useState<ReportEntry[]>([{ ...EMPTY_ROW }]);
  const [otherWork, setOtherWork] = useState<string[]>([]);
  const [reportStatus, setReportStatus] = useState<"DRAFT" | "SUBMITTED">("DRAFT");
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const isToday = selectedDate === getTodayIstString();
  const isReadOnly = !isToday || isLocked;

  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [clientSearchQuery, setClientSearchQuery] = useState<{ [rowIdx: number]: string }>({});

  const [whatsappConfirmOpen, setWhatsappConfirmOpen] = useState(false);
  const [slackConfirmOpen, setSlackConfirmOpen] = useState(false);
  const [dispatchForce, setDispatchForce] = useState(false);

  const {
    data: myReportData,
    isLoading: isLoadingMyReport,
    refetch: refetchMyReport,
  } = useGetMyReportQuery(
    {
      date: selectedDate,
      recruiterId: isAdmin && selectedRecruiterId ? selectedRecruiterId : undefined,
    },
    { skip: isCombinedView || activeTab !== "today" }
  );

  const {
    data: combinedData,
    isLoading: isLoadingCombined,
    refetch: refetchCombined,
  } = useGetCombinedReportQuery(
    { date: selectedDate },
    { skip: !isCombinedView || activeTab !== "today" }
  );

  const { data: suggestionsData } = useGetClientSuggestionsQuery();
  const clientSuggestions = suggestionsData?.suggestions || [];

  const [upsertReport, { isLoading: isSaving }] = useUpsertReportMutation();
  const [submitReport, { isLoading: isSubmitting }] = useSubmitReportMutation();
  const [reopenReport, { isLoading: isReopening }] = useReopenReportMutation();
  const [copyPreviousReport, { isLoading: isCopying }] = useCopyPreviousReportMutation();
  const [getPdfReport, { isFetching: isGeneratingPdf }] = useLazyGetPdfReportQuery();
  const [getExcelReport, { isFetching: isGeneratingExcel }] = useLazyGetExcelReportQuery();
  const [sendWhatsApp, { isLoading: isSendingWhatsApp }] = useSendWhatsAppReportMutation();
  const [sendSlack, { isLoading: isSendingSlack }] = useSendSlackReportMutation();

  const [historyFrom, setHistoryFrom] = useState<string>("");
  const [historyTo, setHistoryTo] = useState<string>("");
  const [historyStatus, setHistoryStatus] = useState<string>("");
  const [historyPage, setHistoryPage] = useState<number>(1);

  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } =
    useGetReportHistoryQuery(
      {
        from: historyFrom || undefined,
        to: historyTo || undefined,
        status: historyStatus || undefined,
        page: historyPage,
        limit: 15,
      },
      { skip: activeTab !== "history" }
    );

  const { data: dispatchLogsData, isLoading: isLoadingLogs, refetch: refetchLogs } =
    useGetDispatchLogsQuery(
      { page: 1, limit: 20 },
      { skip: activeTab !== "history" }
    );

  const { data: settingsData, isLoading: isLoadingSettings, refetch: refetchSettings } =
    useGetReportSettingsQuery(undefined, { skip: !isAdmin || activeTab !== "settings" });

  const [updateSettings, { isLoading: isSavingSettings }] = useUpdateReportSettingsMutation();
  const [testSlack, { isLoading: isTestingSlack }] = useTestSlackWebhookMutation();

  const [settingsForm, setSettingsForm] = useState({
    recipients: [{ name: "", phone: "" }],
    templateName: "instant_placement_dsr_v1",
    slackWebhookUrl: "",
    autoSendEnabled: false,
    autoSendTime: "19:30",
    dryRun: false,
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setSettingsForm({
        recipients:
          settingsData.settings.whatsappRecipients?.length > 0
            ? settingsData.settings.whatsappRecipients
            : [{ name: "", phone: "" }],
        templateName: settingsData.settings.whatsappTemplateName || "instant_placement_dsr_v1",
        slackWebhookUrl: settingsData.settings.slackWebhookMasked || "",
        autoSendEnabled: settingsData.settings.autoSendEnabled || false,
        autoSendTime: settingsData.settings.autoSendTime || "19:30",
        dryRun: settingsData.settings.dryRun || false,
      });
    }
  }, [settingsData]);

  const cleanOtherWork = (items: string[]) => {
    return (items || [])
      .map((item) => String(item || "").replace(/^\[.*?\]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((item) => item.length > 0);
  };

  useEffect(() => {
    if (myReportData?.success) {
      const rep = myReportData.report;
      setEntries(rep?.entries && rep.entries.length > 0 ? rep.entries : [{ ...EMPTY_ROW }]);
      setOtherWork(cleanOtherWork(rep?.otherWork || []));
      setReportStatus(rep?.status || "DRAFT");
      setIsLocked(Boolean(myReportData.isLocked));
      setIsDirty(false);
    }
  }, [myReportData]);

  const liveTotals = useMemo(() => {
    return entries.reduce(
      (acc, r) => {
        acc.totalScreening += Number(r.screeningCount) || 0;
        acc.totalShortlisted += Number(r.shortlistedCount) || 0;
        acc.totalInterviews += Number(r.interviewsDoneToday) || 0;
        acc.totalSelected += Number(r.selectedCount) || 0;
        if (r.clientName && r.clientName.trim()) acc.totalCompanies++;
        return acc;
      },
      {
        totalScreening: 0,
        totalShortlisted: 0,
        totalInterviews: 0,
        totalSelected: 0,
        totalCompanies: 0,
      }
    );
  }, [entries]);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isDirty || isReadOnly) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      handleSaveDraft(true);
    }, 4000);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [entries, otherWork, isDirty, isReadOnly]);

  const handleEntryChange = (
    index: number,
    field: keyof ReportEntry,
    value: string | number
  ) => {
    if (isReadOnly) return;

    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
    setIsDirty(true);
  };

  const handleAddRow = () => {
    if (isReadOnly) return;
    setEntries((prev) => [...prev, { ...EMPTY_ROW }]);
    setIsDirty(true);
  };

  const handleDuplicateRow = (index: number) => {
    if (isReadOnly) return;
    setEntries((prev) => {
      const updated = [...prev];
      const clone = { ...prev[index], _id: undefined };
      updated.splice(index + 1, 0, clone);
      return updated;
    });
    setIsDirty(true);
  };

  const handleDeleteRow = (index: number) => {
    if (isReadOnly) return;
    setEntries((prev) => {
      if (prev.length <= 1) {
        return [{ ...EMPTY_ROW }];
      }
      return prev.filter((_, i) => i !== index);
    });
    setIsDirty(true);
  };

  const handleAddOtherWork = () => {
    if (isReadOnly) return;
    setOtherWork((prev) => [...prev, ""]);
    setIsDirty(true);
  };

  const handleOtherWorkChange = (index: number, val: string) => {
    if (isReadOnly) return;
    const cleanVal = val.replace(/^\[.*?\]\s*/, "");
    setOtherWork((prev) => {
      const updated = [...prev];
      updated[index] = cleanVal;
      return updated;
    });
    setIsDirty(true);
  };

  const handleDeleteOtherWork = (index: number) => {
    if (isReadOnly) return;
    setOtherWork((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleSaveDraft = async (silent = false) => {
    if (isReadOnly) return;

    const validEntries = entries.filter((e) => e.clientName.trim() || e.vacancy.trim());
    if (validEntries.length === 0 && entries.length > 0 && !silent) {
      toast.error("Please add at least one row with Client Name and Vacancy");
      return;
    }

    try {
      const res = await upsertReport({
        date: selectedDate,
        data: {
          entries: validEntries,
          otherWork: otherWork.filter((w) => w.trim().length > 0),
          recruiterId: isAdmin && selectedRecruiterId ? selectedRecruiterId : undefined,
        },
      }).unwrap();

      setIsDirty(false);
      setLastSavedTime(new Date().toLocaleTimeString());
      if (!silent) {
        toast.success(res.message || "Draft saved successfully");
        refetchMyReport();
      }
    } catch (err: any) {
      if (!silent) {
        toast.error(err?.data?.message || "Failed to save daily report");
      }
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;

    const validEntries = entries.filter((e) => e.clientName.trim() && e.vacancy.trim());
    if (validEntries.length === 0) {
      toast.error("Cannot submit an empty report. Fill in Client Name and Vacancy.");
      return;
    }

    try {
      await handleSaveDraft(true);
      const res = await submitReport({
        date: selectedDate,
        recruiterId: isAdmin && selectedRecruiterId ? selectedRecruiterId : undefined,
      }).unwrap();

      toast.success(res.message || "Report submitted successfully!");
      setReportStatus("SUBMITTED");
      setIsDirty(false);
      refetchMyReport();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit report");
    }
  };

  const handleReopen = async () => {
    if (!isAdmin) return;
    try {
      const res = await reopenReport({
        date: selectedDate,
        recruiterId: selectedRecruiterId || undefined,
      }).unwrap();
      toast.success(res.message || "Report reopened as Draft");
      setReportStatus("DRAFT");
      refetchMyReport();
      if (isCombinedView) refetchCombined();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reopen report");
    }
  };

  const handleCopyPrevious = async () => {
    try {
      const res = await copyPreviousReport({ date: selectedDate }).unwrap();
      if (res.entries && res.entries.length > 0) {
        setEntries(res.entries);
        setIsDirty(true);
        toast.success(`Copied ${res.entries.length} rows from ${formatDisplayDate(res.copiedFromDate)}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "No previous report found to copy");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      if (isDirty && !isLocked && !isCombinedView) {
        await handleSaveDraft(true);
      }
      const res = await getPdfReport({
        date: selectedDate,
        combined: isCombinedView,
        recruiterId: !isCombinedView && isAdmin && selectedRecruiterId ? selectedRecruiterId : undefined,
      }).unwrap();

      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
        toast.success("PDF report generated successfully");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to generate PDF report");
    }
  };

  const handleDownloadExcel = async () => {
    try {
      if (isDirty && !isLocked && !isCombinedView) {
        await handleSaveDraft(true);
      }
      const res = await getExcelReport({
        date: selectedDate,
        combined: isCombinedView,
        recruiterId: !isCombinedView && isAdmin && selectedRecruiterId ? selectedRecruiterId : undefined,
      }).unwrap();

      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
        toast.success("Excel report generated successfully");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to generate Excel report");
    }
  };

  const handleConfirmSendWhatsApp = async () => {
    try {
      const res = await sendWhatsApp({
        date: selectedDate,
        combined: true,
        force: dispatchForce,
      }).unwrap();

      if (res.success) {
        toast.success(res.message);
        setWhatsappConfirmOpen(false);
        setDispatchForce(false);
      } else if (res.duplicateBlocked) {
        toast.error(res.message);
        setDispatchForce(true);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Error sending WhatsApp report");
    }
  };

  const handleConfirmSendSlack = async () => {
    try {
      const res = await sendSlack({
        date: selectedDate,
        force: dispatchForce,
      }).unwrap();

      if (res.success) {
        toast.success(res.message);
        setSlackConfirmOpen(false);
        setDispatchForce(false);
      } else if (res.duplicateBlocked) {
        toast.error(res.message);
        setDispatchForce(true);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Error sending Slack report");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validRecipients = settingsForm.recipients.filter(
        (r) => r.phone && r.phone.trim().length > 0
      );

      const res = await updateSettings({
        whatsappRecipients: validRecipients,
        whatsappTemplateName: settingsForm.templateName.trim(),
        slackWebhookUrl: settingsForm.slackWebhookUrl.trim(),
        autoSendEnabled: settingsForm.autoSendEnabled,
        autoSendTime: settingsForm.autoSendTime.trim(),
        dryRun: settingsForm.dryRun,
      }).unwrap();

      toast.success(res.message || "Report settings saved successfully");
      refetchSettings();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save settings");
    }
  };

  const handleTestSlack = async () => {
    try {
      const res = await testSlack({
        slackWebhookUrl: settingsForm.slackWebhookUrl,
      }).unwrap();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to test Slack webhook");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header and Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 text-blue-600 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Daily Status Report (DSR)
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Recruitment pipeline activity, interviews, selections, and daily management reporting
              </p>
            </div>
          </div>
        </div>

        {/* Top View Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "today"
                ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
          >
            Today&apos;s Workspace
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "history"
                ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
          >
            History & Logs
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "settings"
                  ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
            >
              Dispatch Settings
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: TODAY'S REPORT WORKSPACE */}
      {activeTab === "today" && (
        <div className="flex flex-col gap-5">
          {/* Controls Bar: Date, Status Badges, Action Buttons */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 px-4 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Date Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Report Date:
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    if (isDirty) {
                      if (confirm("You have unsaved changes. Switch date anyway?")) {
                        setSelectedDate(e.target.value);
                      }
                    } else {
                      setSelectedDate(e.target.value);
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Status & Lock Indicator */}
              <div className="flex items-center gap-2">
                {!isToday ? (
                  <Badge variant="secondary" className="h-7 text-xs px-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 gap-1 whitespace-nowrap">
                    <Lock className="w-3 h-3 text-slate-500" /> Past Report
                  </Badge>
                ) : isLocked ? (
                  <Badge variant="secondary" className="h-7 text-xs px-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 gap-1 whitespace-nowrap">
                    <Lock className="w-3 h-3 text-slate-500" /> Locked
                  </Badge>
                ) : reportStatus === "SUBMITTED" ? (
                  <Badge variant="secondary" className="h-7 text-xs px-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 gap-1 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Submitted
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="h-7 text-xs px-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3 text-amber-600" /> Draft
                  </Badge>
                )}

                {/* Autosave Status */}
                {!isReadOnly && (
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {isSaving ? (
                      <span className="text-blue-600 font-medium">Autosaving...</span>
                    ) : lastSavedTime ? (
                      <span>• Saved {lastSavedTime}</span>
                    ) : isDirty ? (
                      <span className="text-amber-600 font-medium">• Unsaved</span>
                    ) : null}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: PDF, Excel, WhatsApp, Save, Submit */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="h-8 px-2.5 gap-1 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                {isGeneratingPdf ? "PDF..." : "PDF"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadExcel}
                disabled={isGeneratingExcel}
                className="h-8 px-2.5 gap-1 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                {isGeneratingExcel ? "Excel..." : "Excel"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setWhatsappConfirmOpen(true)}
                className="h-8 px-2.5 gap-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp
              </Button>

              {!isReadOnly && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrevious}
                    disabled={isCopying}
                    className="h-8 px-2.5 gap-1 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Yesterday
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveDraft(false)}
                    disabled={isSaving}
                    className="h-8 px-2.5 gap-1 text-xs font-semibold text-blue-600 border-blue-200 dark:border-blue-800 hover:bg-blue-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Draft
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-8 px-3 gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Report
                  </Button>
                </>
              )}

              {isAdmin && isLocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReopen}
                  disabled={isReopening}
                  className="h-8 px-2.5 gap-1 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Reopen Report
                </Button>
              )}
            </div>
          </div>

          {/* Banner for Past Dates */}
          {!isToday && (
            <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    Viewing Archived Report: {formatDisplayDate(selectedDate)} (View Mode)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Past dates are read-only. To fill today&apos;s active report, click Return to Today.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setSelectedDate(getTodayIstString())}
                className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Return to Today&apos;s Report
              </Button>
            </div>
          )}

          {/* Interactive Spreadsheet Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Sheet Title Bar matching screenshot */}
            <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 text-center font-bold text-sm tracking-wide text-slate-800 dark:text-slate-200">
              Report Date : {formatDisplayDate(selectedDate)}
              {isCombinedView && (
                <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                  (Consolidated Team Pipeline)
                </span>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-850 z-10 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-800 w-10 text-center">#</th>
                    {isCombinedView && (
                      <th className="p-2 border-r border-slate-200 dark:border-slate-800 min-w-[120px]">
                        Recruiter
                      </th>
                    )}
                    <th className="p-2 border-r border-slate-200 dark:border-slate-800 min-w-[170px]">
                      Client/ Company Name <span className="text-rose-500">*</span>
                    </th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-800 min-w-[160px]">
                      Vacancy/ Opening <span className="text-rose-500">*</span>
                    </th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-800 w-24 text-center">
                      Screening
                    </th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-800 w-24 text-center">
                      Short listed
                    </th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-800 w-28 text-center leading-tight">
                      Telephonic Interview Done Today
                    </th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-800 w-24 text-center">
                      Selected
                    </th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-800 min-w-[180px]">
                      Status
                    </th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-800 min-w-[220px]">
                      Remark
                    </th>
                    {!isReadOnly && (
                      <th className="p-2 w-16 text-center">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {entries.map((row, idx) => {
                    const hasShortlistWarning =
                      Number(row.shortlistedCount) > Number(row.screeningCount) &&
                      Number(row.screeningCount) > 0;

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-2 text-center text-slate-400 border-r border-slate-200 dark:border-slate-800">
                          {idx + 1}
                        </td>

                        {isCombinedView && (
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                            {row.recruiterName || "Unknown"}
                          </td>
                        )}

                        {/* Client / Company Name with Auto-Suggest */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 relative">
                          {isReadOnly ? (
                            <div className="p-1 font-semibold text-slate-800 dark:text-slate-200">
                              {row.clientName || "—"}
                            </div>
                          ) : (
                            <div>
                              <input
                                list={`clients-list-${idx}`}
                                type="text"
                                value={row.clientName}
                                onChange={(e) => handleEntryChange(idx, "clientName", e.target.value)}
                                placeholder="e.g. Glox, Reliable Solution..."
                                className="w-full bg-transparent px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-slate-900 dark:text-slate-100 font-medium"
                              />
                              <datalist id={`clients-list-${idx}`}>
                                {clientSuggestions.map((name, i) => (
                                  <option key={i} value={name} />
                                ))}
                              </datalist>
                            </div>
                          )}
                        </td>

                        {/* Vacancy / Opening */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                          {isReadOnly ? (
                            <div className="p-1 text-slate-700 dark:text-slate-300">
                              {row.vacancy || "—"}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={row.vacancy}
                              onChange={(e) => handleEntryChange(idx, "vacancy", e.target.value)}
                              placeholder="e.g. Graphic Designer, SMM..."
                              className="w-full bg-transparent px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-slate-900 dark:text-slate-100"
                            />
                          )}
                        </td>

                        {/* Screening Count */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 text-center">
                          {isReadOnly ? (
                            <div className="p-1 font-bold">{row.screeningCount}</div>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={row.screeningCount === 0 ? "0" : row.screeningCount}
                              onChange={(e) =>
                                handleEntryChange(idx, "screeningCount", Math.max(0, parseInt(e.target.value, 10) || 0))
                              }
                              className="w-full text-center bg-transparent px-1 py-1 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-bold"
                            />
                          )}
                        </td>

                        {/* Shortlisted Count */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 text-center relative">
                          {isReadOnly ? (
                            <div className="p-1 font-bold">{row.shortlistedCount}</div>
                          ) : (
                            <div>
                              <input
                                type="number"
                                min="0"
                                value={row.shortlistedCount === 0 ? "0" : row.shortlistedCount}
                                onChange={(e) =>
                                  handleEntryChange(idx, "shortlistedCount", Math.max(0, parseInt(e.target.value, 10) || 0))
                                }
                                className={`w-full text-center bg-transparent px-1 py-1 rounded border focus:outline-none font-bold ${hasShortlistWarning
                                    ? "border-amber-400 bg-amber-50/50 text-amber-900"
                                    : "border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900"
                                  }`}
                              />
                              {hasShortlistWarning && (
                                <span
                                  title="Shortlisted count is higher than Screening count"
                                  className="absolute top-1 right-1 text-[10px] text-amber-600 font-bold cursor-help"
                                >
                                  ⚠️
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Telephonic Interview Done Today */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 text-center">
                          {isReadOnly ? (
                            <div className="p-1 font-bold">{row.interviewsDoneToday}</div>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={row.interviewsDoneToday === 0 ? "0" : row.interviewsDoneToday}
                              onChange={(e) =>
                                handleEntryChange(idx, "interviewsDoneToday", Math.max(0, parseInt(e.target.value, 10) || 0))
                              }
                              className="w-full text-center bg-transparent px-1 py-1 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-bold"
                            />
                          )}
                        </td>

                        {/* Selected Count */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 text-center">
                          {isReadOnly ? (
                            <div className="p-1 font-bold text-emerald-600 dark:text-emerald-400">
                              {row.selectedCount}
                            </div>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={row.selectedCount === 0 ? "0" : row.selectedCount}
                              onChange={(e) =>
                                handleEntryChange(idx, "selectedCount", Math.max(0, parseInt(e.target.value, 10) || 0))
                              }
                              className="w-full text-center bg-transparent px-1 py-1 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-bold text-emerald-600 dark:text-emerald-400"
                            />
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                          {isReadOnly ? (
                            <div className="p-1 text-slate-700 dark:text-slate-300">{row.status || "—"}</div>
                          ) : (
                            <input
                              type="text"
                              value={row.status}
                              onChange={(e) => handleEntryChange(idx, "status", e.target.value)}
                              placeholder="e.g. Waiting for candidate reply..."
                              className="w-full bg-transparent px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-slate-800 dark:text-slate-200"
                            />
                          )}
                        </td>

                        {/* Remark */}
                        <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                          {isReadOnly ? (
                            <div className="p-1 text-slate-700 dark:text-slate-300 truncate" title={row.remark}>{row.remark || "—"}</div>
                          ) : (
                            <input
                              type="text"
                              value={row.remark}
                              onChange={(e) => handleEntryChange(idx, "remark", e.target.value)}
                              placeholder="Notes, salary concerns, contract terms..."
                              className="w-full bg-transparent px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-slate-800 dark:text-slate-200 text-xs"
                            />
                          )}
                        </td>

                        {/* Actions */}
                        {!isReadOnly && (
                          <td className="p-1.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                title="Duplicate row"
                                onClick={() => handleDuplicateRow(idx)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Delete row"
                                onClick={() => handleDeleteRow(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>

                {/* Sticky TOTAL Row */}
                <tfoot className="sticky bottom-0 bg-slate-100 dark:bg-slate-800 z-10 border-t-2 border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-slate-100 shadow-md">
                  <tr>
                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-700">∑</td>
                    {isCombinedView && (
                      <td className="p-2.5 border-r border-slate-200 dark:border-slate-700">TOTAL</td>
                    )}
                    <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-black">
                      TOTAL ({liveTotals.totalCompanies} Active Openings)
                    </td>
                    <td className="p-2.5 border-r border-slate-200 dark:border-slate-700"></td>
                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-700 font-black text-blue-600 dark:text-blue-400">
                      {liveTotals.totalScreening}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-700 font-black text-indigo-600 dark:text-indigo-400">
                      {liveTotals.totalShortlisted}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-700 font-black text-amber-600 dark:text-amber-400">
                      {liveTotals.totalInterviews}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 dark:border-slate-700 font-black text-emerald-600 dark:text-emerald-400">
                      {liveTotals.totalSelected}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 dark:border-slate-700"></td>
                    <td className="p-2.5 border-r border-slate-200 dark:border-slate-700"></td>
                    {!isReadOnly && <td className="p-2.5"></td>}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom Add Row Bar */}
            {!isReadOnly && (
              <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRow}
                  className="gap-1.5 text-xs font-semibold text-blue-600 border-dashed border-blue-300 dark:border-blue-800 hover:bg-blue-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Client Row
                </Button>
                <span className="text-[11px] text-slate-500">
                  Tip: Press Tab to jump between cells, or click duplicate to copy client details.
                </span>
              </div>
            )}
          </div>

          {/* Section: Other Work Done */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span>Other work :</span>
                <span className="text-xs font-normal text-slate-500">
                  (Tasks outside the table, e.g. bulk calls, sourcing, database sorting)
                </span>
              </h3>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddOtherWork}
                  className="gap-1 text-xs text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {otherWork.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 w-6 text-right">
                    {idx + 1}.
                  </span>
                  {isReadOnly ? (
                    <div className="flex-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      {task}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => handleOtherWorkChange(idx, e.target.value)}
                      placeholder="e.g. Send message to relevant candidate for openings approx - 35 candidates..."
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:border-blue-500 focus:outline-none"
                    />
                  )}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleDeleteOtherWork(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {otherWork.length === 0 && (
                <p className="text-xs text-slate-400 italic">No extra tasks listed for this report.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORY & DISPATCH LOGS */}
      {activeTab === "history" && (
        <div className="flex flex-col gap-6">
          {/* History Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold">From:</span>
                <input
                  type="date"
                  value={historyFrom}
                  onChange={(e) => setHistoryFrom(e.target.value)}
                  className="px-2 py-1 border rounded-lg dark:bg-slate-800 text-xs"
                />
                <span className="text-slate-500 font-semibold">To:</span>
                <input
                  type="date"
                  value={historyTo}
                  onChange={(e) => setHistoryTo(e.target.value)}
                  className="px-2 py-1 border rounded-lg dark:bg-slate-800 text-xs"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const today = getTodayIstString();
                    setHistoryFrom(today);
                    setHistoryTo(today);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 7);
                    setHistoryFrom(d.toISOString().split("T")[0]);
                    setHistoryTo(getTodayIstString());
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHistoryFrom("");
                    setHistoryTo("");
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Reset
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchHistory();
                refetchLogs();
              }}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          {/* Past Reports List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Past Daily Status Reports</span>
              <span className="text-xs font-normal text-slate-500">
                Total: {historyData?.pagination?.totalCount || 0} reports
              </span>
            </div>

            {isLoadingHistory ? (
              <div className="p-6">
                <TableSkeleton rows={5} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Report Date</th>
                      <th className="p-3">Recruiter</th>
                      <th className="p-3 text-center">Openings</th>
                      <th className="p-3 text-center">Screened</th>
                      <th className="p-3 text-center">Interviews</th>
                      <th className="p-3 text-center">Selected</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(historyData?.reports || []).map((rep) => (
                      <tr key={rep._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                          {formatDisplayDate(rep.reportDate)}
                        </td>
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                          {rep.recruiterName || "Recruiter"}
                        </td>
                        <td className="p-3 text-center font-medium">{rep.totals?.totalCompanies || 0}</td>
                        <td className="p-3 text-center font-bold text-blue-600">{rep.totals?.totalScreening || 0}</td>
                        <td className="p-3 text-center font-bold text-amber-600">{rep.totals?.totalInterviews || 0}</td>
                        <td className="p-3 text-center font-bold text-emerald-600">{rep.totals?.totalSelected || 0}</td>
                        <td className="p-3">
                          {rep.status === "SUBMITTED" ? (
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Submitted
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                              Draft
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {rep.reportDate === getTodayIstString() ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDate(rep.reportDate);
                                setSelectedRecruiterId(rep.recruiterId || "");
                                setActiveTab("today");
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30"
                            >
                              <Edit className="w-3.5 h-3.5" /> Open in Editor →
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDate(rep.reportDate);
                                setSelectedRecruiterId(rep.recruiterId || "");
                                setActiveTab("today");
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:underline px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Report →
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(historyData?.reports || []).length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400">
                          No daily reports found matching this criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Dispatch Audit Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-slate-100">
              Recent Dispatches (WhatsApp & Slack Audit Log)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Sent By</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(dispatchLogsData?.logs || []).map((log) => (
                    <tr key={log._id}>
                      <td className="p-3 font-semibold">{formatDisplayDate(log.reportDate)}</td>
                      <td className="p-3 uppercase font-bold text-[10px] tracking-wider text-slate-600 dark:text-slate-400">
                        {log.channel}
                      </td>
                      <td className="p-3 font-mono">{log.recipient}</td>
                      <td className="p-3">
                        {log.success ? (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            Delivered
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200" title={log.error}>
                            Failed
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{log.sentBy?.name || "System"}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(dispatchLogsData?.logs || []).length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">
                        No dispatches logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCH SETTINGS (ADMIN ONLY) */}
      {isAdmin && activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 max-w-4xl">
          {/* WhatsApp Settings Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  WhatsApp Broadcast Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Automated delivery to Krunal Sir & management phone numbers via instantbroadcast.in
                </p>
              </div>
            </div>

            {/* Template Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Approved Media Template Name:
              </label>
              <Input
                type="text"
                value={settingsForm.templateName}
                onChange={(e) => setSettingsForm({ ...settingsForm, templateName: e.target.value })}
                placeholder="e.g. instant_placement_dsr_v1"
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Meta template with Document/Media header. Variable order: 1: Date, 2: Openings, 3: Screened, 4: Shortlisted, 5: Interviews, 6: Selected.
              </p>
            </div>

            {/* Recipients List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Management WhatsApp Recipients:
              </label>
              {settingsForm.recipients.map((rec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={rec.name}
                    onChange={(e) => {
                      const updated = [...settingsForm.recipients];
                      updated[i].name = e.target.value;
                      setSettingsForm({ ...settingsForm, recipients: updated });
                    }}
                    placeholder="Recipient Name (e.g. Krunal Sir)"
                    className="text-xs flex-1"
                  />
                  <Input
                    type="tel"
                    value={rec.phone}
                    onChange={(e) => {
                      const updated = [...settingsForm.recipients];
                      updated[i].phone = e.target.value;
                      setSettingsForm({ ...settingsForm, recipients: updated });
                    }}
                    placeholder="10-digit Phone (e.g. 9876543210)"
                    className="text-xs w-48 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = settingsForm.recipients.filter((_, idx) => idx !== i);
                      setSettingsForm({ ...settingsForm, recipients: updated.length ? updated : [{ name: "", phone: "" }] });
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSettingsForm({
                    ...settingsForm,
                    recipients: [...settingsForm.recipients, { name: "", phone: "" }],
                  })
                }
                className="gap-1 text-xs text-blue-600 mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Recipient
              </Button>
            </div>
          </div>

          {/* Slack Webhook Settings Card (Disabled for now per user request) */}
          {/* <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Slack Channel Webhook
                </h3>
                <p className="text-xs text-slate-500">
                  Posts interactive daily report summaries directly into your Slack channel
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Incoming Webhook URL:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={settingsForm.slackWebhookUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, slackWebhookUrl: e.target.value })}
                  placeholder="https://hooks.slack.com/services/T.../B.../..."
                  className="text-xs font-mono flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestSlack}
                  disabled={isTestingSlack}
                  className="text-xs font-semibold whitespace-nowrap"
                >
                  {isTestingSlack ? "Testing..." : "Send Test Ping"}
                </Button>
              </div>
            </div>
          </div> */}

          {/* Automated Daily Schedule & Dry Run */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Daily Automation & Simulation
                </h3>
                <p className="text-xs text-slate-500">
                  Automate evening delivery and control dry-run simulation mode
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-blue-50/40 dark:bg-blue-950/20">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Daily Auto-Submit & Dispatch (node-cron)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    At the set time below, the system automatically submits today&apos;s report (if in Draft) and sends the PDF report once to your WhatsApp numbers.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.autoSendEnabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, autoSendEnabled: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer ml-3"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Scheduled Daily Submission Time (IST):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={settingsForm.autoSendTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, autoSendTime: e.target.value })}
                    className="px-3 py-1.5 border rounded-lg dark:bg-slate-800 text-xs font-bold"
                  />
                  <span className="text-[11px] text-slate-500">
                    {settingsForm.autoSendEnabled ? `Active: Submits daily at ${settingsForm.autoSendTime} IST` : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between md:col-span-2 bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    Dry Run Simulation Mode
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    When active, dispatches log mock payloads in DB without making live network calls to WhatsApp or Slack.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.dryRun}
                  onChange={(e) => setSettingsForm({ ...settingsForm, dryRun: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSavingSettings}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-10"
          >
            {isSavingSettings ? "Saving Settings..." : "Save Report Configuration"}
          </Button>
        </form>
      )}

      {/* Confirmation Modal: WhatsApp Dispatch */}
      {whatsappConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-emerald-600">
              <MessageSquare className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm WhatsApp Dispatch
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This will generate the combined PDF report for <strong>{formatDisplayDate(selectedDate)}</strong>, create a secure 48-hour download link, and broadcast it to management via WhatsApp.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Companies Active:</span>
                <span className="font-bold">{liveTotals.totalCompanies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Screened Today:</span>
                <span className="font-bold text-blue-600">{liveTotals.totalScreening}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shortlisted:</span>
                <span className="font-bold text-indigo-600">{liveTotals.totalShortlisted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Interviews Done:</span>
                <span className="font-bold text-amber-600">{liveTotals.totalInterviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Candidates Selected:</span>
                <span className="font-bold text-emerald-600">{liveTotals.totalSelected}</span>
              </div>
            </div>

            {dispatchForce && (
              <div className="text-[11px] text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                ⚠️ Cooldown override active: re-sending within 60s will be permitted.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWhatsappConfirmOpen(false);
                  setDispatchForce(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSendWhatsApp}
                disabled={isSendingWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isSendingWhatsApp ? "Sending..." : "Send to WhatsApp Now"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Slack Dispatch (Disabled for now per user request) */}
      {/* {slackConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-purple-600">
              <Hash className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm Slack Dispatch
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Post daily recruitment summary card to your Slack channel with buttons to download the branded PDF and Excel reports.
            </p>

            {dispatchForce && (
              <div className="text-[11px] text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                ⚠️ Cooldown override active: re-sending within 60s will be permitted.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSlackConfirmOpen(false);
                  setDispatchForce(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSendSlack}
                disabled={isSendingSlack}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                {isSendingSlack ? "Posting..." : "Post to Slack Channel"}
              </Button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
