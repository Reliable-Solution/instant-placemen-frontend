import { baseApi } from "./baseApi";

export interface Settings {
  [key: string]: string;
}

export interface WhatsAppParameter {
  index: number;
  label: string;
  key: string;
  example: string;
}

export interface WhatsAppTemplateSchema {
  templateName: string;
  parameterCount: number;
  description: string;
  parameters: WhatsAppParameter[];
}

export interface WhatsAppConfig {
  broadcastUrl: string;
  apiToken: string;
  otpTemplate: string;
  jobAlertTemplate: string;
  dryRun: boolean;
  otpSchema: WhatsAppTemplateSchema;
  jobAlertSchema: WhatsAppTemplateSchema;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<Settings, void>({
      query: () => "/settings",
      transformResponse: (response: any) => response.settings || {},
      providesTags: ["Settings"],
    }),

    getAdminSettings: builder.query<
      Array<{ _id: string; key: string; value: string; label: string }>,
      void
    >({
      query: () => "/settings/admin",
      transformResponse: (response: any) => response.settings || [],
      providesTags: ["Settings"],
    }),

    updateSetting: builder.mutation<
      { success: boolean; message: string },
      { key: string; value: string; label?: string }
    >({
      query: (body) => ({
        url: "/settings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    bulkUpdateSettings: builder.mutation<
      { success: boolean; message: string },
      Array<{ key: string; value: string; label?: string }>
    >({
      query: (settings) => ({
        url: "/settings/bulk",
        method: "POST",
        body: { settings },
      }),
      invalidatesTags: ["Settings"],
    }),

    getWhatsAppConfig: builder.query<WhatsAppConfig, void>({
      query: () => "/settings/whatsapp",
      transformResponse: (response: any) => response.config,
      providesTags: ["Settings"],
    }),

    updateWhatsAppConfig: builder.mutation<
      { success: boolean; message: string },
      Partial<WhatsAppConfig>
    >({
      query: (body) => ({
        url: "/settings/whatsapp",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    sendTestOtp: builder.mutation<
      { success: boolean; message: string; response?: any },
      { phone: string; otp?: string; customTemplate?: string }
    >({
      query: (body) => ({
        url: "/settings/whatsapp/test-otp",
        method: "POST",
        body,
      }),
    }),

    sendTestJobAlert: builder.mutation<
      { success: boolean; message: string; response?: any },
      {
        phone: string;
        candidateName?: string;
        jobTitle?: string;
        company?: string;
        city?: string;
        salary?: string;
        jobId?: string;
        customTemplate?: string;
        customParameters?: string[];
      }
    >({
      query: (body) => ({
        url: "/settings/whatsapp/test-job-alert",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useGetAdminSettingsQuery,
  useUpdateSettingMutation,
  useBulkUpdateSettingsMutation,
  useGetWhatsAppConfigQuery,
  useUpdateWhatsAppConfigMutation,
  useSendTestOtpMutation,
  useSendTestJobAlertMutation,
} = settingsApi;

