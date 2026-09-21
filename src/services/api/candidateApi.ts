import { baseApi } from "./baseApi";

export interface CandidateProfile {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  city: string;
  experience: string;
  qualification: string;
  skills: string[];
  expectedSalary?: number;
  resumeSummary?: string;
  isActive?: boolean;
}

export interface SearchCandidatesParams {
  query?: string;
  city?: string;
  experience?: string;
  qualification?: string;
  page?: number;
  limit?: number;
}

export const candidateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchCandidates: builder.query<CandidateProfile[], SearchCandidatesParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.query) queryParams.set("query", params.query);
        if (params?.city) queryParams.set("city", params.city);
        if (params?.experience) queryParams.set("experience", params.experience);
        if (params?.qualification) queryParams.set("qualification", params.qualification);
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        const qs = queryParams.toString();
        return qs ? `/candidates?${qs}` : "/candidates";
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
      providesTags: ["Candidate"],
    }),
    getCandidateCities: builder.query<{ name: string; candidateCount: number }[], void>({
      query: () => "/candidates/cities",
      transformResponse: (response: any) => response.cities || [],
      providesTags: ["Candidate"],
    }),
  }),
});

export const { useSearchCandidatesQuery, useGetCandidateCitiesQuery } = candidateApi;
