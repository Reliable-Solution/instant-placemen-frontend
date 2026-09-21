import { baseApi } from "./baseApi";

export interface DurationTier {
  tierKey: string;
  durationLabel: string;
  durationDays: number;
  ratePerCv: number;
  isPopular?: boolean;
}

export interface CategoryPricing {
  _id: string;
  categoryGroup: "CATEGORY_A" | "CATEGORY_B" | "CATEGORY_C" | "CATEGORY_D";
  categoryName: string;
  exampleRoles: string[];
  experienceLevel: "Fresher" | "1-3 Years" | "3-5 Years" | "5+ Years";
  module1: {
    minCvQuantity: number;
    durationTiers: DurationTier[];
    features: string[];
  };
  module2: {
    ratePerHire: number;
    turnaroundDays: number;
    billingEvent: string;
    features: string[];
  };
  module3: {
    pricingType: "ONE_MONTH_SALARY" | "FIXED_RATE" | "NOT_APPLICABLE";
    fixedPrice?: number;
    replacementGuaranteeDays: number;
    retentionCheckDays: number[];
    features: string[];
  };
  isActive: boolean;
  displayOrder: number;
}

export interface PlanCalculationResult {
  success: boolean;
  categoryGroup: string;
  categoryName: string;
  experienceLevel: string;
  module: string;
  quantity: number;
  totalAmount: number;
  rateDetails: {
    ratePerUnit?: number;
    durationLabel?: string;
    durationDays?: number;
    minQuantity?: number;
    billingEvent?: string;
    turnaroundDays?: number;
    pricingType?: string;
    replacementGuaranteeDays?: number;
    features?: string[];
  };
  tier: CategoryPricing;
}

export const categoryPricingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategoryPricings: builder.query<{ success: boolean; count: number; pricings: CategoryPricing[] }, void>({
      query: () => "/category-pricing",
      providesTags: ["Category" as any],
    }),

    calculateJobPlan: builder.query<
      PlanCalculationResult,
      { category?: string; experience?: string; module: string; durationTier?: string; quantity: number }
    >({
      query: (params) => ({
        url: "/category-pricing/calculate",
        params,
      }),
    }),

    createCategoryPricing: builder.mutation<
      { success: boolean; message: string; pricing: CategoryPricing },
      Partial<CategoryPricing>
    >({
      query: (data) => ({
        url: "/category-pricing",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category" as any],
    }),

    updateCategoryPricing: builder.mutation<
      { success: boolean; message: string; pricing: CategoryPricing },
      { id: string; data: Partial<CategoryPricing> }
    >({
      query: ({ id, data }) => ({
        url: `/category-pricing/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category" as any],
    }),

    deleteCategoryPricing: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/category-pricing/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category" as any],
    }),

    seedCategoryPricing: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/category-pricing/seed",
        method: "POST",
      }),
      invalidatesTags: ["Category" as any],
    }),
  }),
});

export const {
  useGetCategoryPricingsQuery,
  useCalculateJobPlanQuery,
  useCreateCategoryPricingMutation,
  useUpdateCategoryPricingMutation,
  useDeleteCategoryPricingMutation,
  useSeedCategoryPricingMutation,
} = categoryPricingApi;
