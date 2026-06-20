import { internships } from "@/lib/data/site";
import type { Internship } from "@/types";

export type InternshipFilters = {
  paid?: boolean;
  remote?: boolean;
  city?: string;
  skills?: string[];
  duration?: string;
  stipend?: string;
  industry?: string;
  deadlineDays?: number;
};

export const internshipCities = Array.from(
  new Set(
    internships
      .map((item) => item.city)
      .filter((city) => city && city.toLowerCase() !== "remote"),
  ),
).sort((a, b) => a.localeCompare(b));

export const internshipIndustries = Array.from(
  new Set(internships.map((item) => item.industry)),
).sort((a, b) => a.localeCompare(b));

export const internshipDurations = Array.from(
  new Set(internships.map((item) => item.duration)),
).sort((a, b) => a.localeCompare(b));

export const internshipSkills = Array.from(
  new Set(internships.flatMap((item) => item.skills)),
).sort((a, b) => a.localeCompare(b));

export function normalizeCitySlug(city: string) {
  return city.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function buildInternshipCitySlug(city: string) {
  return `internships-in-${normalizeCitySlug(city)}`;
}

export function cityFromInternshipSlug(slug: string) {
  if (!slug.startsWith("internships-in-")) return null;

  const citySlug = slug.replace("internships-in-", "");
  return internshipCities.find((city) => normalizeCitySlug(city) === citySlug) ?? null;
}

export function parseInternshipFilters(
  params: Record<string, string | string[] | undefined>,
): InternshipFilters {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  };

  const skills = read("skills")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const deadlineValue = read("deadline");
  const deadlineDays =
    deadlineValue && /^[0-9]+$/.test(deadlineValue) ? Number(deadlineValue) : undefined;

  return {
    paid: read("paid") === "true",
    remote: read("remote") === "true",
    city: read("city"),
    skills: skills?.length ? skills : undefined,
    duration: read("duration"),
    stipend: read("stipend"),
    industry: read("industry"),
    deadlineDays,
  };
}

export function filterInternships(filters: InternshipFilters, base = internships) {
  const today = new Date("2026-06-17T00:00:00+05:30");

  return base.filter((item) => {
    if (filters.paid && !item.isPaid) return false;
    if (filters.remote && item.workMode !== "remote") return false;
    if (filters.city && item.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.duration && item.duration !== filters.duration) return false;
    if (filters.industry && item.industry !== filters.industry) return false;

    if (filters.skills?.length) {
      const internshipSkillsLower = item.skills.map((skill) => skill.toLowerCase());
      const matchesAllSkills = filters.skills.every((skill) =>
        internshipSkillsLower.some((itemSkill) => itemSkill.includes(skill.toLowerCase())),
      );

      if (!matchesAllSkills) return false;
    }

    if (filters.stipend) {
      const max = item.stipendMax;
      if (filters.stipend === "0-10000" && max > 10000) return false;
      if (filters.stipend === "10001-15000" && (max < 10001 || item.stipendMin > 15000)) {
        return false;
      }
      if (filters.stipend === "15001-20000" && (max < 15001 || item.stipendMin > 20000)) {
        return false;
      }
      if (filters.stipend === "20001+" && max <= 20000) return false;
    }

    if (filters.deadlineDays) {
      const deadlineDate = new Date(`${item.deadline}T00:00:00+05:30`);
      const diffDays = Math.ceil(
        (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays < 0 || diffDays > filters.deadlineDays) return false;
    }

    return true;
  });
}

export function getInternshipBySlug(slug: string) {
  return internships.find((item) => item.slug === slug) ?? null;
}

export function getSimilarInternships(current: Internship, limit = 3) {
  return internships
    .filter((item) => item.slug !== current.slug)
    .map((item) => {
      let score = 0;
      if (item.city === current.city) score += 3;
      if (item.workMode === current.workMode) score += 2;
      if (item.industry === current.industry) score += 2;
      score += item.skills.filter((skill) => current.skills.includes(skill)).length;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function formatDeadline(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00+05:30`));
}
