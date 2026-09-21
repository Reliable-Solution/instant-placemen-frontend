import { baseApi } from "./baseApi";
import { Job } from "@/types";

export interface EmployerDashboardStats {
  activeJobsCount: number;
  totalApplicantsCount: number;
  interviewsScheduled: number;
  shortlistedCount: number;
}

export const employerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployerDashboard: builder.query<EmployerDashboardStats, void>({
      query: () => "/employer/dashboard",
      transformResponse: (response: any) => response.stats || response.data,
      providesTags: ["Employer", "Job", "Application"],
    }),
    getEmployerJobs: builder.query<Job[], { page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        const qs = queryParams.toString();
        return qs ? `/employer/jobs?${qs}` : "/employer/jobs";
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
      providesTags: ["Employer", "Job"],
    }),
    createEmployerJob: builder.mutation<Job, any>({
      query: (body) => ({
        url: "/employer/jobs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employer", "Job", "Stats"],
    }),
    updateEmployerJobStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/employer/jobs/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Employer", "Job"],
    }),
    getEmployerApplicants: builder.query<any[], { jobId?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.jobId) queryParams.set("jobId", params.jobId);
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        const qs = queryParams.toString();
        return qs ? `/employer/applicants?${qs}` : "/employer/applicants";
      },
      transformResponse: (response: any) => {
        const list = response.applicants || response.data || [];
        const result: any = [...list];
        result.total = response.total ?? list.length;
        result.page = response.page ?? 1;
        result.limit = response.limit ?? list.length;
        result.totalPages = response.totalPages ?? 1;
        result.hasMore = Boolean(response.hasMore);
        return result;
      },
      providesTags: ["Employer", "Application"],
    }),
    updateApplicantStage: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/employer/applicants/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Employer", "Application"],
    }),
    getEmployerProfile: builder.query<any, void>({
      query: () => "/employer/profile",
      transformResponse: (response: any) => response.profile || response.data,
      providesTags: ["Employer", "User"],
    }),
    updateEmployerProfile: builder.mutation<any, any>({
      query: (body) => ({
        url: "/employer/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Employer", "User"],
    }),
    getEmployerJob: builder.query<any, string>({
      query: (id) => `/employer/jobs/${id}`,
      transformResponse: (response: any) => response.job || response.data,
      providesTags: (_result, _err, id) => [{ type: "Job", id }],
    }),
    updateEmployerJob: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/employer/jobs/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _err, { id }) => ["Employer", "Job", { type: "Job", id }],
    }),
  }),
});

export const {
  useGetEmployerDashboardQuery,
  useGetEmployerJobsQuery,
  useCreateEmployerJobMutation,
  useUpdateEmployerJobStatusMutation,
  useGetEmployerApplicantsQuery,
  useUpdateApplicantStageMutation,
  useGetEmployerProfileQuery,
  useUpdateEmployerProfileMutation,
  useGetEmployerJobQuery,
  useUpdateEmployerJobMutation,
} = employerApi;
