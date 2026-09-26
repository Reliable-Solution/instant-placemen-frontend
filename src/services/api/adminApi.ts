import { baseApi } from "./baseApi";

export interface AdminStats {
  totalJobs: number;
  activeJobs: number;
  totalEmployers: number;
  totalCandidates: number;
  totalApplications: number;
  placedCandidates: number;
  interviewsScheduled: number;
  estimatedRevenue: string;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, void>({
      query: () => "/admin/stats",
      transformResponse: (response: any) => response.stats || response.data,
      providesTags: ["Admin", "Stats"],
    }),
    getAdminJobs: builder.query<any[], { status?: string; search?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.set("status", params.status);
        if (params?.search) queryParams.set("search", params.search);
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        return `/admin/jobs?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        const list = response.jobs || response.data || [];
        const result: any = [...list];
        result.total = response.total ?? list.length;
        result.page = response.page ?? 1;
        result.limit = response.limit ?? list.length;
        result.totalPages = response.totalPages ?? 1;
        result.hasMore = Boolean(response.hasMore);
        return result;
      },
      providesTags: ["Admin", "Job"],
    }),
    updateAdminJobStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/jobs/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Admin", "Job"],
    }),
    updateAdminJobBadges: builder.mutation<any, { id: string; badges: any }>({
      query: ({ id, badges }) => ({
        url: `/admin/jobs/${id}/badges`,
        method: "PATCH",
        body: badges,
      }),
      invalidatesTags: ["Admin", "Job"],
    }),
    deleteAdminJob: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin", "Job", "Stats"],
    }),
    getAdminEmployers: builder.query<any[], { search?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.set("search", params.search);
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        const qs = queryParams.toString();
        return qs ? `/admin/employers?${qs}` : "/admin/employers";
      },
      transformResponse: (response: any) => {
        const list = response.employers || response.data || [];
        const result: any = [...list];
        result.total = response.total ?? list.length;
        result.page = response.page ?? 1;
        result.limit = response.limit ?? list.length;
        result.totalPages = response.totalPages ?? 1;
        result.hasMore = Boolean(response.hasMore);
        return result;
      },
      providesTags: ["Admin", "Employer"],
    }),
    toggleEmployerStatus: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/employers/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Admin", "Employer"],
    }),
    getAdminCandidates: builder.query<any[], { city?: string; search?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.city) queryParams.set("city", params.city);
        if (params?.search) queryParams.set("search", params.search);
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        return `/admin/candidates?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        const list = response.candidates || response.data || [];
        const result: any = [...list];
        result.total = response.total ?? list.length;
        result.page = response.page ?? 1;
        result.limit = response.limit ?? list.length;
        result.totalPages = response.totalPages ?? 1;
        result.hasMore = Boolean(response.hasMore);
        return result;
      },
      providesTags: ["Admin", "Candidate"],
    }),
    getAdminApplications: builder.query<any[], { status?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.set("status", params.status);
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        const qs = queryParams.toString();
        return qs ? `/admin/applications?${qs}` : "/admin/applications";
      },
      transformResponse: (response: any) => {
        const list = response.applications || response.data || [];
        const result: any = [...list];
        result.total = response.total ?? list.length;
        result.page = response.page ?? 1;
        result.limit = response.limit ?? list.length;
        result.totalPages = response.totalPages ?? 1;
        result.hasMore = Boolean(response.hasMore);
        return result;
      },
      providesTags: ["Admin", "Application"],
    }),
    updateAdminApplicationStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/applications/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Admin", "Application", "Stats"],
    }),
    createCategory: builder.mutation<any, any>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
    createCity: builder.mutation<any, any>({
      query: (body) => ({
        url: "/cities",
        method: "POST",
        body,
      }),
      invalidatesTags: ["City"],
    }),
    deleteCity: builder.mutation<any, string>({
      query: (id) => ({
        url: `/cities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["City"],
    }),
    getAdminPlans: builder.query<any[], void>({
      query: () => "/admin/plans",
      transformResponse: (response: any) => response.plans || response.data || [],
      providesTags: ["ServiceModule"],
    }),
    createPlan: builder.mutation<any, any>({
      query: (body) => ({
        url: "/admin/plans",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ServiceModule"],
    }),
    updatePlan: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin/plans/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ServiceModule"],
    }),
    deletePlan: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ServiceModule"],
    }),
    toggleArchivePlan: builder.mutation<any, string>({
      query: (id) => ({
        url: `/admin/plans/${id}/archive`,
        method: "PATCH",
      }),
      invalidatesTags: ["ServiceModule"],
    }),
    sendCandidateJobAlert: builder.mutation<
      { success: boolean; message: string; candidateName?: string; jobTitle?: string; sendTo?: string },
      { candidateId: string; jobId: string }
    >({
      query: ({ candidateId, jobId }) => ({
        url: `/admin/candidates/${candidateId}/send-job-alert`,
        method: "POST",
        body: { jobId },
      }),
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminJobsQuery,
  useUpdateAdminJobStatusMutation,
  useUpdateAdminJobBadgesMutation,
  useDeleteAdminJobMutation,
  useGetAdminEmployersQuery,
  useToggleEmployerStatusMutation,
  useGetAdminCandidatesQuery,
  useGetAdminApplicationsQuery,
  useUpdateAdminApplicationStatusMutation,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateCityMutation,
  useDeleteCityMutation,
  useGetAdminPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useToggleArchivePlanMutation,
  useSendCandidateJobAlertMutation,
} = adminApi;


