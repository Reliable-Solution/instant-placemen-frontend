import { baseApi } from "./baseApi";

export interface Lead {
  _id: string;
  phone: string;
  leadType?: "EMPLOYER" | "JOB_SEEKER" | "GENERAL";
  name?: string;
  city?: string;
  status?: "Incomplete" | "Complete";
  details?: Record<string, any>;
  resumeFile?: string;
  resumeUrl?: string;
  resumeOriginalName?: string;
  source: string;
  ipAddress: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LeadStats {
  todayCount: number;
  weekCount: number;
  totalCount: number;
  employerCount?: number;
  seekerCount?: number;
  completeCount?: number;
}

export const leadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createLead: builder.mutation<
      { success: boolean; message: string },
      { phone: string; source?: string }
    >({
      query: (body) => ({
        url: "/leads",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Lead"],
    }),

    getLeads: builder.query<
      { leads: Lead[]; total: number; page: number; totalPages: number },
      { page?: number; limit?: number; source?: string; leadType?: string; status?: string; search?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, String(value));
            }
          });
        }
        const qs = queryParams.toString();
        return qs ? `/leads?${qs}` : "/leads";
      },
      transformResponse: (response: any) => ({
        leads: response.leads || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 1,
      }),
      providesTags: ["Lead"],
    }),

    getLeadStats: builder.query<LeadStats, void>({
      query: () => "/leads/stats",
      transformResponse: (response: any) => response.stats || { todayCount: 0, weekCount: 0, totalCount: 0 },
      providesTags: ["Lead"],
    }),
  }),
});

export const {
  useCreateLeadMutation,
  useGetLeadsQuery,
  useGetLeadStatsQuery,
} = leadApi;
