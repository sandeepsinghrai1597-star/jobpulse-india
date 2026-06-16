import { jobs } from "@/lib/data/site";
import { getUnifiedJobBySlug, getUnifiedJobs, getUnifiedSimilarJobs } from "@/lib/jobs/live";

export interface JobSearchParams {
  keyword?: string;
  city?: string;
  jobType?: string;
  workMode?: string;
  education?: string;
}

export function searchJobs(params: JobSearchParams = {}) {
  return jobs.filter((job) => {
    const keyword = params.keyword?.toLowerCase().trim();
    const city = params.city?.toLowerCase().trim();

    const matchesKeyword = keyword
      ? [job.title, job.companyName, job.description, job.skills.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      : true;

    const matchesCity = city ? job.city.toLowerCase().includes(city) : true;
    const matchesJobType = params.jobType ? job.jobType === params.jobType : true;
    const matchesMode = params.workMode ? job.workMode === params.workMode : true;
    const matchesEducation = params.education
      ? job.educationRequired.toLowerCase().includes(params.education.toLowerCase())
      : true;

    return (
      matchesKeyword &&
      matchesCity &&
      matchesJobType &&
      matchesMode &&
      matchesEducation
    );
  });
}

export async function searchUnifiedJobs(params: JobSearchParams = {}) {
  const unifiedJobs = await getUnifiedJobs();

  return unifiedJobs.filter((job) => {
    const keyword = params.keyword?.toLowerCase().trim();
    const city = params.city?.toLowerCase().trim();

    const matchesKeyword = keyword
      ? [job.title, job.companyName, job.description, job.skills.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      : true;

    const matchesCity = city ? job.city.toLowerCase().includes(city) : true;
    const matchesJobType = params.jobType ? job.jobType === params.jobType : true;
    const matchesMode = params.workMode ? job.workMode === params.workMode : true;
    const matchesEducation = params.education
      ? job.educationRequired.toLowerCase().includes(params.education.toLowerCase())
      : true;

    return (
      matchesKeyword &&
      matchesCity &&
      matchesJobType &&
      matchesMode &&
      matchesEducation
    );
  });
}

export function getJobBySlug(slug: string) {
  return jobs.find((job) => job.slug === slug);
}

export async function getUnifiedJob(slug: string) {
  return getUnifiedJobBySlug(slug);
}

export function getSimilarJobs(slug: string) {
  const current = getJobBySlug(slug);
  if (!current) return [];

  return jobs
    .filter(
      (job) =>
        job.slug !== slug &&
        (job.city === current.city ||
          job.industry === current.industry ||
          job.skills.some((skill) => current.skills.includes(skill))),
    )
    .slice(0, 3);
}

export async function getSimilarUnifiedJobs(slug: string) {
  return getUnifiedSimilarJobs(slug);
}
