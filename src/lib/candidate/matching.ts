import type { CandidateProfile, Job } from "@/types";

export function getDiscoveredJobsForCandidate(profile: CandidateProfile, jobs: Job[]) {
  if (!profile.skills.length && !profile.preferredRoles.length && !profile.city) {
    return jobs.slice(0, 4);
  }

  const normalizedSkills = profile.skills.map((skill) => skill.toLowerCase());
  const normalizedRoles = profile.preferredRoles.map((role) => role.toLowerCase());
  const normalizedCity = profile.city.toLowerCase();

  return jobs
    .map((job) => {
      let score = 0;

      if (normalizedCity && job.city.toLowerCase().includes(normalizedCity)) {
        score += 3;
      }

      if (profile.preferredJobTypes.includes(job.jobType)) {
        score += 2;
      }

      if (
        normalizedRoles.some((role) =>
          `${job.title} ${job.description}`.toLowerCase().includes(role),
        )
      ) {
        score += 4;
      }

      const skillMatches = job.skills.filter((skill) =>
        normalizedSkills.includes(skill.toLowerCase()),
      ).length;
      score += skillMatches * 2;

      return { job, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((entry) => entry.job);
}
