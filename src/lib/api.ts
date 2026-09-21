import { Job, Category, CityOption, JobFilterParams, ApplicationSubmission } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:5100/api");

export const jobApi = {
  getJobs: async (filters: JobFilterParams = {}): Promise<{ total: number; jobs: Job[] }> => {
    const params = new URLSearchParams();
    if (filters.city && filters.city !== "All India") params.append("city", filters.city);
    if (filters.category) params.append("category", filters.category);
    if (filters.query) params.append("query", filters.query);
    if (filters.experience && filters.experience !== "All") params.append("experience", filters.experience);
    if (filters.jobType && filters.jobType !== "All") params.append("jobType", filters.jobType);
    if (filters.qualification && filters.qualification !== "All") params.append("qualification", filters.qualification);
    if (filters.urgentOnly) params.append("urgent", "true");
    if (filters.minSalary) params.append("minSalary", String(filters.minSalary));

    const res = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
  },

  getJobById: async (id: string): Promise<Job> => {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (!res.ok) throw new Error("Failed to fetch job details");
    const data = await res.json();
    return data.job;
  },

  createJob: async (jobData: Partial<Job>): Promise<Job> => {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error("Failed to create job");
    const data = await res.json();
    return data.job;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await fetch(`${API_BASE_URL}/categories`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data.categories;
  },

  getCities: async (): Promise<CityOption[]> => {
    const res = await fetch(`${API_BASE_URL}/cities`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch cities");
    const data = await res.json();
    return data.cities;
  },

  applyForJob: async (application: ApplicationSubmission): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE_URL}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application),
    });
    if (!res.ok) throw new Error("Failed to apply for job");
    return res.json();
  },

  getStats: async () => {
    const res = await fetch(`${API_BASE_URL}/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    const data = await res.json();
    return data.stats;
  },
};
