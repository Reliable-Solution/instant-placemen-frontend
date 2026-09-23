import { baseApi } from "./baseApi";
import { Job, Category, CityOption } from "@/types";

export interface GetJobsQueryParams {
  city?: string;
  category?: string;
  query?: string;
  experience?: string;
  jobType?: string;
  qualification?: string;
  urgent?: string;
  minSalary?: number;
  page?: number;
  limit?: number;
}

export interface JobsResponse {
  success: boolean;
  total: number;
  jobs: Job[];
  data?: Job[];
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
  data?: Category[];
}

export interface CitiesResponse {
  success: boolean;
  cities: CityOption[];
  data?: CityOption[];
}

export interface ServiceModule {
  id: string;
  title: string;
  subtitle: string;
  price: number | null;
  priceDisplay: string;
  billingType: string;
  durationDays: number;
  isPopular?: boolean;
  features: string[];
  replacementPolicy: string;
  replacementGuarantee: boolean;
  recommendedFor: string;
}

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query<Job[], GetJobsQueryParams | void>({
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
        return qs ? `/jobs?${qs}` : "/jobs";
      },
      transformResponse: (response: any) => {
        const jobs = response.jobs || response.data || [];
        const result: any = [...jobs];
        result.total = response.total ?? jobs.length;
        result.page = response.page ?? 1;
        result.limit = response.limit ?? jobs.length;
        result.totalPages = response.totalPages ?? 1;
        result.hasMore = Boolean(response.hasMore);
        return result;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((job) => ({ type: "Job" as const, id: job.id || job._id || "" })),
              { type: "Job", id: "LIST" },
            ]
          : [{ type: "Job", id: "LIST" }],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => "/categories",
      transformResponse: (response: CategoriesResponse) => {
        return response.categories || response.data || [];
      },
      providesTags: ["Category"],
    }),

    getCities: builder.query<CityOption[], void>({
      query: () => "/cities",
      transformResponse: (response: CitiesResponse) => {
        return response.cities || response.data || [];
      },
      providesTags: ["City"],
    }),

    getServiceModules: builder.query<ServiceModule[], void>({
      query: () => "/service-modules",
      transformResponse: (response: {
        success: boolean;
        data?: ServiceModule[];
        modules?: ServiceModule[];
      }) => {
        return response.modules || response.data || [];
      },
      providesTags: ["ServiceModule"],
    }),

    applyForJob: builder.mutation<
      { success: boolean; message: string },
      {
        jobId: string;
        candidateName: string;
        candidatePhone: string;
        candidateCity?: string;
        experience?: string;
        qualification?: string;
        commuteConfirmed?: boolean;
        commuteLocation?: string;
      }
    >({
      query: (body) => ({
        url: "/apply",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Application"],
    }),

    getMyApplications: builder.query<any[], void>({
      query: () => "/apply/my",
      transformResponse: (response: any) => {
        return response.applications || [];
      },
      providesTags: ["Application"],
    }),

    getStats: builder.query<{
      activeJobs: number;
      activeEmployers: number;
      activeCandidates: number;
      totalApplications: number;
      dailyPlacements: number;
      verifiedPercentage: string;
      avgPlacementTime: string;
    }, void>({
      query: () => "/stats",
      transformResponse: (response: any) => response.stats || response.data,
      providesTags: ["Stats"],
    }),

    getTopCompanies: builder.query<
      Array<{
        name: string;
        openings: string;
        roles: string;
        tag: string;
        city?: string;
        logo: string;
      }>,
      void
    >({
      query: () => "/jobs/top-companies",
      transformResponse: (response: any) => response.companies || [],
      providesTags: ["Job"],
    }),

    getPopularCities: builder.query<
      Array<{ name: string; jobCount: number }>,
      number | void
    >({
      query: (limit) => {
        const qs = limit ? `?limit=${limit}` : "";
        return `/jobs/popular-cities${qs}`;
      },
      transformResponse: (response: any) => response.cities || [],
      providesTags: ["Job"],
    }),

    getWalkInJobs: builder.query<Job[], { city?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (
          params?.city &&
          params.city !== "All India" &&
          params.city !== "All Cities (India)" &&
          params.city !== "All"
        ) {
          queryParams.append("city", params.city);
        }
        const qs = queryParams.toString();
        return qs ? `/jobs/walk-ins?${qs}` : "/jobs/walk-ins";
      },
      transformResponse: (response: any) => response.jobs || [],
      providesTags: ["Job"],
    }),

    getJobById: builder.query<Job, string>({
      query: (id) => `/jobs/${id}`,
      transformResponse: (response: any) => response.job || response.data || response,
      providesTags: (result, error, id) => [{ type: "Job", id }],
    }),

    postJob: builder.mutation<{ success: boolean; message: string }, any>({
      query: (body) => ({
        url: "/jobs",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Job", id: "LIST" }],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobByIdQuery,
  useGetCategoriesQuery,
  useGetCitiesQuery,
  useGetServiceModulesQuery,
  useGetStatsQuery,
  useGetTopCompaniesQuery,
  useGetPopularCitiesQuery,
  useGetWalkInJobsQuery,
  useApplyForJobMutation,
  useGetMyApplicationsQuery,
  useApplyForJobMutation: useApplyJobMutation,
  usePostJobMutation,
} = jobsApi;


