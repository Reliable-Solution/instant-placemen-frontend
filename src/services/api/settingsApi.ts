import { baseApi } from "./baseApi";

export interface Settings {
  [key: string]: string;
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
  }),
});

export const {
  useGetSettingsQuery,
  useGetAdminSettingsQuery,
  useUpdateSettingMutation,
  useBulkUpdateSettingsMutation,
} = settingsApi;
