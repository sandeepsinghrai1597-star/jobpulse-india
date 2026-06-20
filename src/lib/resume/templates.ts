import type { ResumeBuilderData, ResumeTemplateKey } from "@/lib/resume/schema";

function createId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

function createBaseResume(templateKey: ResumeTemplateKey): ResumeBuilderData {
  return {
    title: "My Resume",
    templateKey,
    targetRole: "Target Role",
    yearsOfExperience: "0-1 years",
    atsKeywords: [],
    basics: {
      fullName: "Your Name",
      headline: "Professional headline",
      email: "you@example.com",
      phone: "+91 98765 43210",
      location: "City, State",
      website: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary:
      "Write a concise summary that highlights your strongest skills, credibility, and target role.",
    education: [
      {
        id: createId("education", 0),
        title: "Degree / Course",
        subtitle: "College or University",
        location: "City",
        startDate: "2021",
        endDate: "2025",
        score: "",
        bullets: ["Relevant coursework, honors, or academic highlights."],
      },
    ],
    experience: [],
    skills: [
      {
        id: createId("skills", 0),
        title: "Core Skills",
        items: [],
      },
    ],
    projects: [],
    certifications: [],
    languages: [{ id: createId("language", 0), name: "English", proficiency: "Professional" }],
    achievements: [],
    updatedAt: "",
  };
}

export const resumeTemplateCatalog: Record<
  ResumeTemplateKey,
  { label: string; description: string; starter: ResumeBuilderData }
> = {
  fresher: {
    label: "Fresher",
    description: "Focus on academics, projects, internships, and strengths.",
    starter: {
      ...createBaseResume("fresher"),
      title: "Fresher Resume",
      targetRole: "Graduate Trainee",
      skills: [
        {
          id: createId("skills", 0),
          title: "Technical Skills",
          items: ["MS Excel", "Communication", "Problem Solving"],
        },
      ],
      projects: [
        {
          id: createId("project", 0),
          title: "Academic Project",
          subtitle: "Capstone / Final Year",
          location: "",
          startDate: "2024",
          endDate: "2025",
          score: "",
          bullets: ["Describe the problem, what you built, and the outcome."],
        },
      ],
    },
  },
  it: {
    label: "IT",
    description: "Emphasize tech stack, systems impact, and delivery metrics.",
    starter: {
      ...createBaseResume("it"),
      title: "IT Resume",
      targetRole: "Software Engineer",
      yearsOfExperience: "2-4 years",
      skills: [
        {
          id: createId("skills", 0),
          title: "Languages & Tools",
          items: ["JavaScript", "TypeScript", "React", "Node.js", "SQL"],
        },
      ],
      experience: [
        {
          id: createId("experience", 0),
          title: "Software Engineer",
          subtitle: "Company Name",
          location: "Bengaluru",
          startDate: "2023",
          endDate: "Present",
          score: "",
          bullets: [
            "Built and improved application features with measurable performance or quality gains.",
          ],
        },
      ],
    },
  },
  sales: {
    label: "Sales",
    description: "Highlight targets, pipeline conversion, and client growth.",
    starter: {
      ...createBaseResume("sales"),
      title: "Sales Resume",
      targetRole: "Sales Executive",
      yearsOfExperience: "1-3 years",
      skills: [
        {
          id: createId("skills", 0),
          title: "Sales Skills",
          items: ["Lead Generation", "CRM", "Negotiation", "Client Retention"],
        },
      ],
    },
  },
  banking: {
    label: "Banking",
    description: "Center on compliance, customer service, and financial accuracy.",
    starter: {
      ...createBaseResume("banking"),
      title: "Banking Resume",
      targetRole: "Relationship Officer",
      yearsOfExperience: "1-4 years",
      skills: [
        {
          id: createId("skills", 0),
          title: "Banking Skills",
          items: ["KYC", "Customer Support", "Cross-selling", "Operations"],
        },
      ],
    },
  },
  "government-job": {
    label: "Government Job",
    description: "Keep the layout formal, factual, and exam/application ready.",
    starter: {
      ...createBaseResume("government-job"),
      title: "Government Job Resume",
      targetRole: "Administrative Assistant",
      skills: [
        {
          id: createId("skills", 0),
          title: "Administrative Skills",
          items: ["Documentation", "Data Entry", "Record Keeping", "MS Office"],
        },
      ],
    },
  },
  internship: {
    label: "Internship",
    description: "Show learning ability, projects, and role-fit fundamentals.",
    starter: {
      ...createBaseResume("internship"),
      title: "Internship Resume",
      targetRole: "Marketing Intern",
      yearsOfExperience: "Student",
      achievements: [
        {
          id: createId("achievement", 0),
          title: "Campus leadership",
          subtitle: "",
          location: "",
          startDate: "",
          endDate: "",
          score: "",
          bullets: ["Mention clubs, events, hackathons, or volunteer outcomes."],
        },
      ],
    },
  },
  "experienced-professional": {
    label: "Experienced Professional",
    description: "Lead with leadership scope, outcomes, and domain depth.",
    starter: {
      ...createBaseResume("experienced-professional"),
      title: "Professional Resume",
      targetRole: "Senior Manager",
      yearsOfExperience: "8+ years",
      experience: [
        {
          id: createId("experience", 0),
          title: "Senior Manager",
          subtitle: "Company Name",
          location: "Mumbai",
          startDate: "2021",
          endDate: "Present",
          score: "",
          bullets: ["Led cross-functional delivery, stakeholder alignment, and business outcomes."],
        },
      ],
    },
  },
};

export function getResumeTemplate(templateKey: ResumeTemplateKey) {
  return structuredClone(resumeTemplateCatalog[templateKey].starter);
}
