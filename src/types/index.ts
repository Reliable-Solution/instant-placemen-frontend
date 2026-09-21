export interface Job {
  id: string;
  _id?: string;
  serviceTier?: string;
  title: string;
  company: string;
  companyLogo?: string;
  city: string;
  locality: string;
  state?: string;
  category: string;
  categoryId: string;
  salaryMin: number;
  salaryMax: number;
  salaryType: "monthly" | "yearly" | "hourly";
  experience: string;
  qualification: string;
  jobType: string;
  workMode?: string;
  shift?: string;
  workingHours?: string;
  workingDays?: string;
  genderPreference?: "Male" | "Female" | "Any";
  vacancies: number;
  responsibilities?: string;
  incentives?: string;
  benefits?: string[];
  skillsRequired?: string[];
  preferredSkills?: string[];
  languages?: string[];
  otherRequirements?: string;
  expectedJoining?: string;
  applicationDeadline?: string;
  isVerified: boolean;
  isUrgent: boolean;
  isFeatured: boolean;
  contactPerson: {
    name: string;
    role?: string;
    phone: string;
    whatsapp: string;
    callTimings?: string;
  };
  interviewType?: "Walk-in" | "Telephonic" | "Online Video" | string;
  interviewAddress?: string;
  perks?: string[];
  description: string;
  requirements?: string[];
  postedAt?: string;
  applicationCount: number;
}

export interface Category {
  id: string;
  title: string;
  name?: string;
  slug: string;
  icon: string;
  activeJobsCount: number;
  avgSalary: string;
  color: string;
  badge?: string;
}

export interface CityOption {
  name: string;
  state: string;
  icon?: string;
  popularLocalities: string[];
  jobCount: number;
  isMetro: boolean;
}

export interface JobFilterParams {
  query?: string;
  city?: string;
  category?: string;
  experience?: string;
  jobType?: string;
  minSalary?: number;
  qualification?: string;
  urgentOnly?: boolean;
}

export interface ApplicationSubmission {
  jobId: string;
  candidateName: string;
  candidatePhone: string;
  candidateCity: string;
  experience: string;
  qualification: string;
  resumeUrl?: string;
}
