export type UserRole = "candidate" | "employer" | "admin";

export type WorkMode = "remote" | "hybrid" | "onsite";
export type JobType =
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance"
  | "internship"
  | "walk-in";
export type SalaryType = "monthly" | "yearly" | "stipend";

export interface Job {
  id: string;
  slug: string;
  categorySlug?: string;
  title: string;
  companyName: string;
  companyLogo: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  salaryType: SalaryType;
  location: string;
  city: string;
  state: string;
  country: string;
  workMode: WorkMode;
  experienceRequired: string;
  educationRequired: string;
  jobType: JobType;
  industry: string;
  openings: number;
  applicationDeadline: string;
  recruiterContact: string;
  applicationUrl: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "expired" | "draft";
  featured?: boolean;
  sourceUrl?: string;
  sourceType?: "employer" | "admin" | "official" | "partner";
  sourceName?: string;
  importedAt?: string;
  officialVerified?: boolean;
}

export type CandidateVerificationStatus =
  | "draft"
  | "pending"
  | "verified"
  | "rejected";

export interface CandidateProfile {
  id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  headline: string;
  bio: string;
  education: string;
  skills: string[];
  experience: string;
  city: string;
  state: string;
  preferredRoles: string[];
  expectedSalary: number | null;
  preferredJobTypes: string[];
  languagePreference: string;
  resumeUrl: string;
  verified: boolean;
  verificationStatus: CandidateVerificationStatus;
  verificationRequestedAt?: string | null;
  verifiedAt?: string | null;
  updatedAt?: string | null;
}

export interface CandidateApplication {
  id: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  employerNotes?: string | null;
  resumeUrl?: string | null;
  job: Pick<Job, "id" | "slug" | "title" | "companyName" | "location" | "applicationUrl">;
}

export interface GovernmentJob {
  id: string;
  slug: string;
  categorySlug?: string;
  title: string;
  department: string;
  category: string;
  state: string;
  eligibility: string;
  ageLimit: string;
  fees: string;
  lastDate: string;
  officialUrl: string;
  notificationUrl: string;
  summary: string;
}

export interface Internship {
  id: string;
  slug: string;
  categorySlug?: string;
  title: string;
  company: string;
  stipend: string;
  duration: string;
  location: string;
  skills: string[];
  applyUrl: string;
  deadline: string;
  isPaid: boolean;
  workMode: WorkMode;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  publishedAt: string;
  category: string;
}

export interface CareerGuide {
  slug: string;
  title: string;
  summary: string;
  targetRole: string;
  duration: string;
  skills: string[];
  weeks: Array<{
    week: string;
    focus: string;
    outcomes: string[];
  }>;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  audience: "candidate" | "employer";
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
}

export interface SeoPageDefinition {
  slug: string;
  title: string;
  description: string;
  type: "city" | "fresher" | "internship" | "category";
  city?: string;
  category?: string;
}
