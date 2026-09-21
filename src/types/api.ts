/**
 * Shared TypeScript types for API services.
 * Reduces `any` usage across the frontend.
 */

// ===== User Types =====
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "EMPLOYER" | "CANDIDATE" | "RECRUITER";
  companyName?: string;
  city?: string;
  experience?: string;
  qualification?: string;
  skills?: string[];
  isActive?: boolean;
  consentToShareProfile?: boolean;
  isPhoneVerified?: boolean;
  serviceTier?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Job Types =====
export interface Job {
  _id: string;
  id?: string;
  title: string;
  company: string;
  city: string;
  locality?: string;
  categoryId?: string;
  category?: string;
  experience: string;
  jobType: string;
  qualification: string;
  salaryMin?: number;
  salaryMax?: number;
  salary?: string;
  description?: string;
  skillsRequired?: string[];
  isUrgent?: boolean;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  employerId?: string;
  contactPerson?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  // Pipeline fields
  currentStage?: string;
  paymentBadge?: string;
  replacementBadge?: string;
  hireCount?: number;
  targetHires?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Application Types =====
export interface Application {
  _id: string;
  jobId: string;
  candidateName: string;
  candidatePhone: string;
  candidateCity?: string;
  experience?: string;
  qualification?: string;
  status: string;
  stage?: string;
  createdAt?: string;
}

// ===== Candidate Types =====
export interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  locality?: string;
  experience?: string;
  qualification?: string;
  skills?: string[];
  currentRole?: string;
  noticePeriod?: string;
  resumeSummary?: string;
  resumeParsedText?: string;
  consentToShareProfile?: boolean;
  createdAt?: string;
}

// ===== Plan Types =====
export interface Plan {
  _id: string;
  id?: string;
  title: string;
  subtitle?: string;
  price: number;
  priceDisplay?: string;
  billingType?: string;
  durationDays?: number;
  features: string[];
  replacementPolicy?: string;
  replacementGuarantee?: boolean;
  recommendedFor?: string;
  isPopular?: boolean;
  isActive?: boolean;
  isArchived?: boolean;
  displayOrder?: number;
  tier?: string;
  name?: string;
  badge?: string;
}

// ===== Category Types =====
export interface Category {
  _id: string;
  id: string;
  title: string;
  slug: string;
  icon?: string;
  activeJobsCount?: number;
  avgSalary?: string;
  badge?: string;
  trending?: boolean;
}

// ===== City Types =====
export interface City {
  _id: string;
  id?: string;
  name: string;
  state?: string;
  localities?: string[];
  jobCount?: number;
}

// ===== Setting Types =====
export interface Setting {
  _id: string;
  key: string;
  value: string;
  label?: string;
}

// ===== Lead Types =====
export interface Lead {
  _id: string;
  phone: string;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
}

// ===== Payment Types =====
export interface Payment {
  _id: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: string;
  userId?: string;
  planId?: string;
  createdAt?: string;
}

// ===== API Response Types =====
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  data: T[];
}

export interface JobsResponse extends PaginatedResponse<Job> {
  jobs?: Job[];
}

export interface CandidatesResponse extends PaginatedResponse<Candidate> {
  candidates?: Candidate[];
}

export interface ApplicationsResponse extends PaginatedResponse<Application> {
  applications?: Application[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
  token?: string;
}

// ===== Stats Types =====
export interface DashboardStats {
  totalJobs?: number;
  activeJobs?: number;
  totalEmployers?: number;
  activeEmployers?: number;
  totalCandidates?: number;
  totalApplications?: number;
  newApplications?: number;
  hiredCount?: number;
  newLeadsToday?: number;
  activeLeads?: number;
}

// ===== Pipeline Types =====
export interface PipelineStage {
  key: string;
  label: string;
  count: number;
  percentage: number;
}
