import { z } from "zod";

export const resumeTemplateKeys = [
  "fresher",
  "it",
  "sales",
  "banking",
  "government-job",
  "internship",
  "experienced-professional",
] as const;

export type ResumeTemplateKey = (typeof resumeTemplateKeys)[number];

export const resumeListItemSchema = z.object({
  id: z.string().optional().default(""),
  title: z.string().trim().min(1, "Add a title."),
  subtitle: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default(""),
  startDate: z.string().trim().optional().default(""),
  endDate: z.string().trim().optional().default(""),
  score: z.string().trim().optional().default(""),
  bullets: z.array(z.string().trim().min(1)).default([]),
});

export const resumeSkillGroupSchema = z.object({
  id: z.string().optional().default(""),
  title: z.string().trim().min(1, "Add a skill category."),
  items: z.array(z.string().trim().min(1)).default([]),
});

export const resumeLanguageSchema = z.object({
  id: z.string().optional().default(""),
  name: z.string().trim().min(1, "Add a language."),
  proficiency: z.string().trim().min(1, "Add proficiency."),
});

export const resumeBasicsSchema = z.object({
  fullName: z.string().trim().min(2, "Add your full name."),
  headline: z.string().trim().min(2, "Add a headline."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(8, "Add a phone number."),
  location: z.string().trim().min(2, "Add a location."),
  website: z.string().trim().optional().default(""),
  linkedin: z.string().trim().optional().default(""),
  github: z.string().trim().optional().default(""),
  portfolio: z.string().trim().optional().default(""),
});

export const resumeBuilderSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Add a resume title."),
  templateKey: z.enum(resumeTemplateKeys),
  targetRole: z.string().trim().min(2, "Add a target role."),
  yearsOfExperience: z.string().trim().min(1, "Add experience level."),
  atsKeywords: z.array(z.string().trim().min(1)).default([]),
  basics: resumeBasicsSchema,
  summary: z.string().trim().min(20, "Add a professional summary."),
  education: z.array(resumeListItemSchema).default([]),
  experience: z.array(resumeListItemSchema).default([]),
  skills: z.array(resumeSkillGroupSchema).default([]),
  projects: z.array(resumeListItemSchema).default([]),
  certifications: z.array(resumeListItemSchema).default([]),
  languages: z.array(resumeLanguageSchema).default([]),
  achievements: z.array(resumeListItemSchema).default([]),
  updatedAt: z.string().optional().default(""),
});

export type ResumeBuilderData = z.infer<typeof resumeBuilderSchema>;

export const resumeAiRequestSchema = z.object({
  action: z.enum([
    "generate-summary",
    "improve-bullets",
    "tailor-role",
    "add-ats-keywords",
  ]),
  role: z.string().trim().min(2),
  experienceLevel: z.string().trim().min(1),
  jobDescription: z.string().trim().optional().default(""),
  summary: z.string().trim().optional().default(""),
  bullets: z.array(z.string().trim().min(1)).default([]),
  skills: z.array(z.string().trim().min(1)).default([]),
  achievements: z.array(z.string().trim().min(1)).default([]),
});

export type ResumeAiRequest = z.infer<typeof resumeAiRequestSchema>;

export interface SavedResumeSummary {
  id: string;
  title: string;
  templateKey: ResumeTemplateKey;
  updatedAt: string;
}
