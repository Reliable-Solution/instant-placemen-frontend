import { baseApi } from "./baseApi";

export interface ReportEntry {
  _id?: string;
  clientName: string;
  vacancy: string;
  screeningCount: number;
  shortlistedCount: number;
  interviewsDoneToday: number;
  selectedCount: number;
  status: string;
  remark: string;
  recruiterId?: string;
  recruiterName?: string;
}

export interface ReportTotals {
  totalScreening: number;
  totalShortlisted: number;
  totalInterviews: number;
  totalSelected: number;
  totalCompanies: number;
}

export interface DailyReportData {
  _id?: string;
  reportDate: string;
  recruiterId?: string;
  recruiterName?: string;
  status: "DRAFT" | "SUBMITTED";
  submittedAt?: string;
  lockedAt?: string;
  entries: ReportEntry[];
  otherWork: string[];
  totals: ReportTotals;
}

export interface CombinedReportResponse {
  success: boolean;
  reportDate: string;
  isCombined: boolean;
  entries: ReportEntry[];
  otherWork: string[];
  totals: ReportTotals;
  recruiterCount: number;
  submittedCount: number;
}

export interface DispatchLogItem {
  _id: string;
  reportDate: string;
  channel: "whatsapp" | "slack" | "auto";
  recipient: string;
  success: boolean;
  providerResponse?: any;
  error?: string;
  sentBy?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

export interface ReportSettingsData {
  whatsappRecipients: Array<{ name: string; phone: string }>;
  whatsappTemplateName: string;
  slackWebhookMasked: string;
  hasSlackWebhook: boolean;
  autoSendEnabled: boolean;
  autoSendTime: string;
  dryRun: boolean;
}

export const dailyReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyReport: builder.query<
      { success: boolean; report: DailyReportData; isLocked: boolean },
      { date?: string; recruiterId?: string }
    >({
      query: (params) => ({
        url: "/admin/reports",
        params: {
          date: params?.date,
          recruiterId: params?.recruiterId,
        },
      }),
      providesTags: ["DailyReport" as any],
    }),

    getCombinedReport: builder.query<CombinedReportResponse, { date?: string }>({
      query: (params) => ({
        url: "/admin/reports/combined",
        params: { date: params?.date },
      }),
      providesTags: ["DailyReport" as any],
    }),

    upsertReport: builder.mutation<
      { success: boolean; message: string; report: DailyReportData },
      { date?: string; data: { entries: ReportEntry[]; otherWork: string[]; recruiterId?: string } }
    >({
      query: ({ date, data }) => ({
        url: "/admin/reports",
        method: "PUT",
        params: { date },
        body: data,
      }),
      invalidatesTags: ["DailyReport" as any],
    }),

    submitReport: builder.mutation<
      { success: boolean; message: string; report: DailyReportData },
      { date: string; recruiterId?: string }
    >({
      query: (body) => ({
        url: "/admin/reports/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DailyReport" as any],
    }),

    reopenReport: builder.mutation<
      { success: boolean; message: string },
      { date: string; recruiterId?: string }
    >({
      query: (body) => ({
        url: "/admin/reports/reopen",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DailyReport" as any],
    }),

    copyPreviousReport: builder.mutation<
      { success: boolean; message: string; copiedFromDate: string; entries: ReportEntry[] },
      { date?: string }
    >({
      query: ({ date }) => ({
        url: "/admin/reports/copy-previous",
        method: "POST",
        params: { date },
      }),
    }),

    getPdfReport: builder.query<
      { success: boolean; downloadUrl: string; filename: string },
      { date?: string; combined?: boolean; recruiterId?: string }
    >({
      query: (params) => ({
        url: "/admin/reports/pdf",
        params: {
          date: params?.date,
          combined: params?.combined ? "true" : "false",
          recruiterId: params?.recruiterId,
        },
      }),
    }),

    getExcelReport: builder.query<
      { success: boolean; downloadUrl: string; filename: string },
      { date?: string; combined?: boolean; recruiterId?: string }
    >({
      query: (params) => ({
        url: "/admin/reports/excel",
        params: {
          date: params?.date,
          combined: params?.combined ? "true" : "false",
          recruiterId: params?.recruiterId,
        },
      }),
    }),

    sendWhatsAppReport: builder.mutation<
      { success: boolean; message: string; results?: any[]; duplicateBlocked?: boolean },
      { date?: string; combined?: boolean; force?: boolean }
    >({
      query: (body) => ({
        url: "/admin/reports/send/whatsapp",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DailyReportDispatch" as any],
    }),

    sendSlackReport: builder.mutation<
      { success: boolean; message: string; duplicateBlocked?: boolean },
      { date?: string; force?: boolean }
    >({
      query: (body) => ({
        url: "/admin/reports/send/slack",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DailyReportDispatch" as any],
    }),

    getReportHistory: builder.query<
      {
        success: boolean;
        reports: DailyReportData[];
        pagination: { page: number; limit: number; totalCount: number; totalPages: number };
      },
      { from?: string; to?: string; recruiterId?: string; status?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/admin/reports/history",
        params,
      }),
      providesTags: ["DailyReport" as any],
    }),

    getDispatchLogs: builder.query<
      {
        success: boolean;
        logs: DispatchLogItem[];
        pagination: { page: number; limit: number; totalCount: number; totalPages: number };
      },
      { date?: string; channel?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/admin/reports/dispatch-log",
        params,
      }),
      providesTags: ["DailyReportDispatch" as any],
    }),

    getClientSuggestions: builder.query<{ success: boolean; suggestions: string[] }, void>({
      query: () => "/admin/reports/client-suggestions",
    }),

    getReportSettings: builder.query<{ success: boolean; settings: ReportSettingsData }, void>({
      query: () => "/admin/reports/settings",
      providesTags: ["DailyReportSettings" as any],
    }),

    updateReportSettings: builder.mutation<
      { success: boolean; message: string },
      Partial<ReportSettingsData> & { slackWebhookUrl?: string }
    >({
      query: (body) => ({
        url: "/admin/reports/settings",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["DailyReportSettings" as any],
    }),

    testSlackWebhook: builder.mutation<
      { success: boolean; message: string },
      { slackWebhookUrl?: string }
    >({
      query: (body) => ({
        url: "/admin/reports/test-slack",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
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
} = dailyReportApi;
