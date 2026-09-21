import { baseApi } from "./baseApi";

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFAQs: builder.query<FAQ[], void>({
      query: () => "/faqs",
      transformResponse: (response: any) => response.faqs || [],
      providesTags: ["FAQ"],
    }),

    getAdminFAQs: builder.query<FAQ[], void>({
      query: () => "/faqs/admin",
      transformResponse: (response: any) => response.faqs || [],
      providesTags: ["FAQ"],
    }),

    createFAQ: builder.mutation<{ success: boolean; message: string }, Partial<FAQ>>({
      query: (body) => ({
        url: "/faqs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FAQ"],
    }),

    updateFAQ: builder.mutation<
      { success: boolean; message: string },
      { id: string; data: Partial<FAQ> }
    >({
      query: ({ id, data }) => ({
        url: `/faqs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FAQ"],
    }),

    deleteFAQ: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/faqs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FAQ"],
    }),
  }),
});

export const {
  useGetFAQsQuery,
  useGetAdminFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} = faqApi;
