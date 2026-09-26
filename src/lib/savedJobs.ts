import { Job } from "@/types";

export interface SavedJobItem {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  city: string;
  locality?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string;
  experience?: string;
  qualification?: string;
  jobType?: string;
  vacancies?: number;
  isUrgent?: boolean;
  isVerified?: boolean;
  savedAt: string;
}

const STORAGE_KEY = "ip_saved_jobs";

export const getSavedJobs = (): SavedJobItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse saved jobs:", e);
    return [];
  }
};

export const isJobSaved = (jobId: string): boolean => {
  if (!jobId || typeof window === "undefined") return false;
  const list = getSavedJobs();
  return list.some((item) => String(item.id) === String(jobId));
};

export const toggleSaveJob = (job: Job | any): boolean => {
  if (typeof window === "undefined") return false;
  const list = getSavedJobs();
  const targetId = String(job.id || job._id);

  const existingIndex = list.findIndex((item) => String(item.id) === targetId);

  let isNowSaved = false;
  let updatedList: SavedJobItem[] = [];

  if (existingIndex !== -1) {
    // Remove from saved
    updatedList = list.filter((item) => String(item.id) !== targetId);
    isNowSaved = false;
  } else {
    // Add to saved
    const newItem: SavedJobItem = {
      id: targetId,
      title: job.title || "Job Opening",
      company: job.company || "Hiring Company",
      companyLogo: job.companyLogo,
      city: job.city || "Surat",
      locality: job.locality,
      salary: job.salaryDisplay || (job.salaryMin ? `₹${job.salaryMin.toLocaleString("en-IN")} - ₹${job.salaryMax?.toLocaleString("en-IN")}/mo` : undefined),
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryType: job.salaryType,
      experience: job.experience,
      qualification: job.qualification,
      jobType: job.jobType,
      vacancies: job.vacancies,
      isUrgent: job.isUrgent,
      isVerified: job.isVerified,
      savedAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    updatedList = [newItem, ...list];
    isNowSaved = true;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    // Dispatch event so other components update their state
    window.dispatchEvent(new CustomEvent("ip_saved_jobs_changed", { detail: { updatedList, targetId, isNowSaved } }));
  } catch (e) {
    console.error("Failed to update saved jobs in localStorage:", e);
  }

  return isNowSaved;
};

export const removeSavedJob = (jobId: string): void => {
  if (typeof window === "undefined") return;
  const list = getSavedJobs();
  const updatedList = list.filter((item) => String(item.id) !== String(jobId));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent("ip_saved_jobs_changed", { detail: { updatedList, targetId: jobId, isNowSaved: false } }));
  } catch (e) {
    console.error("Failed to remove saved job:", e);
  }
};
