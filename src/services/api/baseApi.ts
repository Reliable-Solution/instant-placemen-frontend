import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "@/lib/config";


export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("ip_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: [
    "Job",
    "Category",
    "City",
    "Stats",
    "ServiceModule",
    "Application",
    "User",
    "Admin",
    "Employer",
    "Candidate",
    "FAQ",
    "Settings",
    "Lead",
    "Resume",
    "Chat",
    "DailyReport",
    "DailyReportDispatch",
    "DailyReportSettings",
  ],
  endpoints: () => ({}),
});
