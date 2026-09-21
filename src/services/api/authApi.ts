import { baseApi } from "./baseApi";

export interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: "CANDIDATE" | "EMPLOYER" | "RECRUITER" | "ADMIN";
  city: string;
  companyName?: string;
  experience?: string;
  qualification?: string;
  skills?: string[];
  expectedSalary?: number;
  resumeSummary?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: "CANDIDATE" | "EMPLOYER" | "RECRUITER" | "ADMIN";
  city?: string;
  companyName?: string;
  experience?: string;
  qualification?: string;
  skills?: string[];
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  city?: string;
  phone?: string;
  companyName?: string;
  experience?: string;
  qualification?: string;
  skills?: string[];
  expectedSalary?: number;
  resumeSummary?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        return response?.data || response;
      },
      invalidatesTags: ["User"],
    }),

    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        return response?.data || response;
      },
      invalidatesTags: ["User"],
    }),

    getProfile: builder.query<UserProfile, void>({
      query: () => "/users/profile",
      transformResponse: (response: any) => {
        return response?.data || response;
      },
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<UserProfile, UpdateProfilePayload>({
      query: (body) => ({
        url: "/users/profile",
        method: "PUT",
        body,
      }),
      transformResponse: (response: any) => {
        return response?.data || response;
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
