import { z } from "zod";
import { analyticsEventNames } from "@/lib/analytics/events";

export const signupSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(10).max(20),
  role: z.enum(["candidate", "employer"]),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/, "Password must include at least one letter.")
    .regex(/\d/, "Password must include at least one number."),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const jobSearchSchema = z.object({
  keyword: z.string().optional(),
  city: z.string().optional(),
  jobType: z.string().optional(),
  workMode: z.string().optional(),
  education: z.string().optional(),
});

export const candidateProfileSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(10).max(20),
  headline: z.string().trim().min(2).max(120),
  bio: z.string().trim().min(20).max(800),
  education: z.string().trim().min(2),
  skills: z.array(z.string().trim().min(1)).min(1),
  experience: z.string().trim().min(1),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  preferredRoles: z.array(z.string().trim().min(1)).min(1),
  expectedSalary: z.number().int().nonnegative().nullable(),
  preferredJobTypes: z.array(z.string().trim().min(1)).min(1),
  languagePreference: z.string().trim().min(2),
  resumeUrl: z.string().trim().url().or(z.literal("")).optional(),
  requestVerification: z.boolean().optional().default(false),
});

export const aiProfileSchema = z.object({
  education: z.string().min(2),
  skills: z.array(z.string()).min(1),
  city: z.string().min(2),
  experience: z.string().min(1),
  preferredSalary: z.string().min(1),
  preferredJobType: z.string().min(1),
  languagePreference: z.string().min(1),
  goal: z.string().min(5),
});

export const resumeAnalysisSchema = z.object({
  resumeText: z.string().min(50),
  jobDescription: z.string().optional(),
  targetRole: z.string().min(2),
});

export const interviewRequestSchema = z.object({
  role: z.string().min(2),
  mode: z.enum(["HR", "Technical", "Behavioral", "Fresher", "Role-specific"]),
  experienceLevel: z.string().min(1),
});

export const interviewEvaluateSchema = z.object({
  role: z.string().min(2),
  question: z.string().min(5),
  answer: z.string().min(10),
});

export const paymentRequestSchema = z.object({
  plan: z.enum(["candidate-pro", "employer-basic", "employer-pro"]),
  notes: z.record(z.string(), z.string()).optional(),
});

export const paymentVerificationSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    orderId: z.string().trim().min(3),
    paymentId: z.string().trim().min(3),
    signature: z.string().trim().min(10),
  }),
  z.object({
    status: z.literal("failed"),
    orderId: z.string().trim().min(3),
    errorCode: z.string().trim().min(1).optional(),
    errorDescription: z.string().trim().min(1).optional(),
    errorReason: z.string().trim().min(1).optional(),
  }),
]);

export const analyticsEventSchema = z.object({
  candidateId: z.string().uuid().optional(),
  employerId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  paymentId: z.string().uuid().optional(),
  sessionId: z.string().trim().min(2).max(120).optional(),
  eventName: z.enum(analyticsEventNames),
  eventData: z.record(z.string(), z.unknown()).optional().default({}),
});

export const employerProfileSchema = z.object({
  companyName: z.string().trim().min(2),
  website: z.string().trim().url(),
  companyEmail: z.string().trim().email(),
  industry: z.string().trim().min(2),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  logoUrl: z.string().trim().url().or(z.literal("")).optional(),
  recruiterName: z.string().trim().min(2),
  recruiterPhone: z.string().trim().min(10).max(20),
});

export const employerJobSchema = z.object({
  companyName: z.string().trim().min(2).optional(),
  title: z.string().trim().min(3, "Add a clear job title."),
  description: z.string().trim().min(50, "Description must be at least 50 characters."),
  responsibilities: z.array(z.string().trim().min(2)).min(1, "Add at least one responsibility."),
  requirements: z.array(z.string().trim().min(2)).min(1, "Add at least one requirement."),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  workMode: z.enum(["remote", "hybrid", "onsite"]),
  jobType: z.enum(["full-time", "part-time", "contract", "freelance", "internship", "walk-in"]),
  educationRequired: z.string().trim().min(2),
  experienceRequired: z.string().trim().min(2),
  industry: z.string().trim().min(2),
  openings: z.number().int().positive("Openings must be at least 1."),
  deadline: z.string().trim().min(1, "Choose an application deadline."),
  salaryMin: z.number().int().nonnegative(),
  salaryMax: z.number().int().nonnegative(),
  noCandidatePayment: z.boolean().default(true),
  salaryDisclosed: z.boolean().default(true),
  governmentSourceVerified: z.boolean().default(false),
  applicationUrl: z.string().trim().url().or(z.literal("")).optional(),
  skills: z.array(z.string().trim().min(1)).min(1),
}).refine((value) => value.salaryMax >= value.salaryMin, {
  message: "Maximum salary must be greater than or equal to minimum salary.",
  path: ["salaryMax"],
}).refine((value) => value.noCandidatePayment, {
  message: "Jobs that demand payment from candidates are not allowed.",
  path: ["noCandidatePayment"],
}).refine((value) => value.salaryDisclosed || (value.salaryMin === 0 && value.salaryMax === 0), {
  message: "If salary is not disclosed, keep both salary values at 0.",
  path: ["salaryDisclosed"],
});

export const adminManagedJobSchema = z.object({
  categorySlug: z.string().trim().optional(),
  companyName: z.string().trim().min(1, "Company name is required."),
  companyWebsite: z.string().trim().url().or(z.literal("")).optional(),
  companyDescription: z.string().trim().max(2000).optional(),
  companyLogoUrl: z.string().trim().url().or(z.literal("")).optional(),
  companyVerified: z.boolean().default(false),
  title: z.string().trim().min(1, "Job title is required."),
  description: z.string().trim().min(1, "Description is required."),
  responsibilities: z.array(z.string().trim().min(1)).default([]),
  requirements: z.array(z.string().trim().min(1)).default([]),
  skills: z.array(z.string().trim().min(1)).default([]),
  city: z.string().trim().min(1, "City is required."),
  state: z.string().trim().default(""),
  country: z.string().trim().min(2).default("India"),
  workMode: z.enum(["remote", "hybrid", "onsite"]),
  jobType: z.enum(["full-time", "part-time", "contract", "freelance", "internship", "walk-in"]),
  salaryType: z.enum(["monthly", "yearly", "stipend"]).default("yearly"),
  educationRequired: z.string().trim().default(""),
  experienceRequired: z.string().trim().default(""),
  experienceMin: z.number().int().nonnegative().nullable().optional(),
  experienceMax: z.number().int().nonnegative().nullable().optional(),
  industry: z.string().trim().default(""),
  openings: z.number().int().positive("Openings must be at least 1.").default(1),
  deadline: z.string().trim().default(""),
  salaryMin: z.number().int().nonnegative(),
  salaryMax: z.number().int().nonnegative(),
  applicationUrl: z.string().trim().url().or(z.literal("")).optional(),
  sourceUrl: z.string().trim().url().or(z.literal("")).optional(),
  sourceType: z.enum(["employer", "admin", "official", "partner"]).default("admin"),
  recruiterContact: z.string().trim().optional(),
  noCandidatePayment: z.boolean().default(true),
  salaryDisclosed: z.boolean().default(true),
  governmentSourceVerified: z.boolean().default(false),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
}).refine((value) => value.salaryMax >= value.salaryMin, {
  message: "Maximum salary must be greater than or equal to minimum salary.",
  path: ["salaryMax"],
}).refine(
  (value) =>
    value.experienceMin == null ||
    value.experienceMax == null ||
    value.experienceMax >= value.experienceMin,
  {
    message: "Maximum experience must be greater than or equal to minimum experience.",
    path: ["experienceMax"],
  },
).refine((value) => Boolean(value.applicationUrl || value.sourceUrl), {
  message: "Add an apply URL or source URL.",
  path: ["applicationUrl"],
}).refine((value) => value.noCandidatePayment, {
  message: "Jobs that demand payment from candidates are not allowed.",
  path: ["noCandidatePayment"],
}).refine((value) => value.salaryDisclosed || (value.salaryMin === 0 && value.salaryMax === 0), {
  message: "If salary is not disclosed, keep both salary values at 0.",
  path: ["salaryDisclosed"],
});
