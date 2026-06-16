import { z } from "zod";

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
  resumeUrl: z.string().trim().url(),
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
  plan: z.enum(["candidate-pro", "employer-basic", "employer-pro", "featured-job"]),
  amount: z.number().positive(),
  notes: z.record(z.string(), z.string()).optional(),
});

export const analyticsEventSchema = z.object({
  sessionId: z.string().trim().min(2).max(120).optional(),
  eventName: z.string().trim().min(2).max(80),
  eventData: z.record(z.string(), z.unknown()).optional().default({}),
});

export const employerJobSchema = z.object({
  companyName: z.string().trim().min(2),
  title: z.string().trim().min(3),
  description: z.string().trim().min(50),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  workMode: z.enum(["remote", "hybrid", "onsite"]),
  jobType: z.enum(["full-time", "part-time", "contract", "freelance", "internship", "walk-in"]),
  educationRequired: z.string().trim().min(2),
  experienceRequired: z.string().trim().min(2),
  industry: z.string().trim().min(2),
  salaryMin: z.number().int().nonnegative(),
  salaryMax: z.number().int().nonnegative(),
  applicationUrl: z.string().trim().url(),
  skills: z.array(z.string().trim().min(1)).min(1),
});
