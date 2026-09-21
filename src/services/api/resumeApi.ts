import { baseApi } from "./baseApi";

export const resumeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Upload and parse resume
    uploadResume: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/resume/upload",
        method: "POST",
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary
      }),
      invalidatesTags: ["Resume", "User"],
    }),

    // Get user's resume
    getResume: builder.query<any, void>({
      query: () => "/resume",
      providesTags: ["Resume"],
    }),

    // Delete user's resume
    deleteResume: builder.mutation<any, void>({
      query: () => ({
        url: "/resume",
        method: "DELETE",
      }),
      invalidatesTags: ["Resume", "User"],
    }),
  }),
});

export const {
  useUploadResumeMutation,
  useGetResumeQuery,
  useDeleteResumeMutation,
} = resumeApi;
