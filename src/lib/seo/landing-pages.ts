import { governmentJobs } from "@/lib/data/government-jobs";
import { blogPosts } from "@/lib/data/blog";
import type { BlogPost, Job, SeoPageDefinition } from "@/types";

type PageSeed = Omit<SeoPageDefinition, "faqs">;

const citySeeds = [
  "Delhi",
  "Chandigarh",
  "Mohali",
  "Gurgaon",
  "Noida",
  "Bangalore",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Chennai",
] as const;

const cityPages: SeoPageDefinition[] = citySeeds.map((city) => ({
  slug: `jobs-in-${city.toLowerCase().replace(/\s+/g, "-")}`,
  title: `Jobs in ${city} 2026 | Freshers, Private and Remote Openings`,
  description: `Explore the latest jobs in ${city} for freshers and experienced candidates across tech, sales, support, banking, and work from home hiring.`,
  h1: `Latest Jobs in ${city}`,
  intro: `Browse fresh job openings in ${city} with a mix of private jobs, fresher opportunities, and remote-friendly roles. These landing pages are built to help candidates discover active listings quickly and move into deeper job detail pages without getting stuck in broad search results.`,
  keywords: [
    `jobs in ${city.toLowerCase()}`,
    `${city.toLowerCase()} jobs for freshers`,
    `latest jobs in ${city.toLowerCase()}`,
    `${city.toLowerCase()} hiring`,
  ],
  type: "city",
  city,
  category: "City Jobs",
  filters: {
    city,
  },
  faqs: [
    {
      question: `Which job categories are hiring most actively in ${city}?`,
      answer: `${city} candidates usually see consistent demand across software, analytics, sales, customer support, banking, and operations roles, along with remote opportunities that can be applied to from anywhere in India.`,
    },
    {
      question: `Are fresher jobs available in ${city}?`,
      answer: `Yes, this page highlights entry-level and early-career roles where available, and you can also use the related fresher and qualification landing pages to widen your search.`,
    },
  ],
}));

const categorySeeds: PageSeed[] = [
  {
    slug: "fresher-jobs",
    title: "Fresher Jobs in India 2026 | Entry-Level Hiring Across Cities",
    description: "Find fresher jobs in India across IT, sales, support, banking, analytics, and operations with city and qualification-focused internal links.",
    h1: "Fresher Jobs in India",
    intro: "This landing page groups early-career jobs for candidates starting out after school, college, or a first internship. It is designed to surface entry-level roles quickly, while also linking deeper into city, qualification, and job-category pages for long-tail discovery.",
    keywords: ["fresher jobs", "entry level jobs india", "jobs for freshers", "graduate fresher jobs"],
    type: "fresher",
    category: "Fresher Jobs",
    filters: {
      experienceIncludes: ["0-", "fresher", "entry"],
    },
  },
  {
    slug: "bca-fresher-jobs",
    title: "BCA Fresher Jobs 2026 | Software, Support and Analyst Roles",
    description: "Discover BCA fresher jobs in India including software support, data analyst, testing, and developer openings with strong internal linking.",
    h1: "BCA Fresher Jobs",
    intro: "BCA candidates often compete for developer, support, testing, operations, and analytics roles. This page narrows the search to relevant opportunities and connects them with broader fresher, city, and software job clusters.",
    keywords: ["bca fresher jobs", "jobs after bca", "bca jobs in india", "bca developer jobs"],
    type: "category",
    category: "BCA Fresher Jobs",
    filters: {
      educationIncludes: ["bca"],
      experienceIncludes: ["0-", "fresher", "entry"],
    },
  },
  {
    slug: "btech-fresher-jobs",
    title: "BTech Fresher Jobs 2026 | Developer and Engineer Openings",
    description: "Search BTech fresher jobs across software development, engineering, testing, analytics, and hybrid tech hiring across India.",
    h1: "BTech Fresher Jobs",
    intro: "BTech freshers usually have the broadest entry path into software, analyst, QA, backend, and support engineering roles. This page groups those opportunities and cross-links into city-specific hiring hubs.",
    keywords: ["btech fresher jobs", "engineering jobs for freshers", "btech jobs india", "software jobs for btech freshers"],
    type: "category",
    category: "BTech Fresher Jobs",
    filters: {
      educationIncludes: ["btech"],
      experienceIncludes: ["0-", "fresher", "entry"],
    },
  },
  {
    slug: "mba-fresher-jobs",
    title: "MBA Fresher Jobs 2026 | Sales, Marketing and Operations Roles",
    description: "Explore MBA fresher jobs across digital marketing, sales, business development, operations, and banking support roles in India.",
    h1: "MBA Fresher Jobs",
    intro: "MBA freshers often target business-facing roles where communication, coordination, and execution matter as much as academic credentials. This page clusters relevant openings and connects them with city and category pages for broader discovery.",
    keywords: ["mba fresher jobs", "mba jobs india", "marketing jobs for mba freshers", "sales jobs for mba freshers"],
    type: "category",
    category: "MBA Fresher Jobs",
    filters: {
      educationIncludes: ["mba"],
      experienceIncludes: ["0-", "fresher", "entry"],
    },
  },
  {
    slug: "12th-pass-jobs",
    title: "12th Pass Jobs 2026 | Entry-Level Private and Government Roles",
    description: "Find 12th pass jobs in India including support, sales, operations, and government exam-linked openings with FAQs and internal links.",
    h1: "12th Pass Jobs in India",
    intro: "Candidates after Class 12 often look for practical entry-level roles with fast hiring cycles. This page combines private-sector openings with related government job paths and qualification-based internal linking.",
    keywords: ["12th pass jobs", "jobs after 12th", "private jobs for 12th pass", "government jobs for 12th pass"],
    type: "qualification",
    category: "12th Pass Jobs",
    filters: {
      educationIncludes: ["12th pass"],
    },
  },
  {
    slug: "10th-pass-jobs",
    title: "10th Pass Jobs 2026 | Field, Operations and Government Hiring",
    description: "Search 10th pass jobs in India including operations, field roles, apprenticeships, and related government opportunity pages.",
    h1: "10th Pass Jobs in India",
    intro: "This page focuses on roles that remain accessible to candidates after Class 10, including operations, field support, and government-linked pathways where the formal eligibility stays broad.",
    keywords: ["10th pass jobs", "jobs after 10th", "private jobs for 10th pass", "10th pass vacancy"],
    type: "qualification",
    category: "10th Pass Jobs",
    filters: {
      educationIncludes: ["10th pass"],
    },
  },
  {
    slug: "work-from-home-jobs",
    title: "Work From Home Jobs 2026 | Remote and Flexible Hiring in India",
    description: "Find work from home jobs in India across content, support, software, and flexible freelance roles with SEO-rich internal linking.",
    h1: "Work From Home Jobs in India",
    intro: "Work from home pages perform best when they combine active remote listings with strong cross-linking into city pages, category pages, and career content. This page is structured to do exactly that while keeping the job discovery flow fast.",
    keywords: ["work from home jobs", "wfh jobs india", "remote jobs india", "online jobs from home"],
    type: "remote",
    category: "Work From Home Jobs",
    filters: {
      workModes: ["remote"],
    },
  },
  {
    slug: "remote-jobs-india",
    title: "Remote Jobs India 2026 | Nationwide Hiring for Remote Roles",
    description: "Browse remote jobs in India across software, content, support, marketing, and analyst roles with schema-ready SEO landing page content.",
    h1: "Remote Jobs in India",
    intro: "Remote jobs attract high search volume, but they convert better when paired with qualification, city, and category navigation. This page acts as that central remote hiring hub for nationwide search intent.",
    keywords: ["remote jobs india", "online remote jobs", "india remote hiring", "remote work india"],
    type: "remote",
    category: "Remote Jobs India",
    filters: {
      workModes: ["remote"],
    },
  },
  {
    slug: "data-analyst-jobs",
    title: "Data Analyst Jobs 2026 | SQL, Excel and BI Hiring in India",
    description: "Search data analyst jobs in India for freshers and experienced candidates across SQL, Excel, Power BI, and reporting roles.",
    h1: "Data Analyst Jobs in India",
    intro: "Data analyst search intent usually blends skills, qualifications, and city signals. This page pulls relevant roles into one cluster and supports deeper navigation to city-specific and fresher-focused content.",
    keywords: ["data analyst jobs", "sql jobs india", "excel analyst jobs", "power bi jobs india"],
    type: "role",
    category: "Data Analyst Jobs",
    filters: {
      keywordIncludes: ["data analyst", "analytics", "sql", "power bi", "reporting"],
    },
  },
  {
    slug: "software-developer-jobs",
    title: "Software Developer Jobs 2026 | Fresher and Experienced Tech Roles",
    description: "Discover software developer jobs in India across frontend, backend, full stack, Java, and support engineering hiring.",
    h1: "Software Developer Jobs in India",
    intro: "Software hiring pages need enough breadth to catch full stack, backend, frontend, and support-engineering intent without becoming generic. This page is tuned for that middle ground and supports city-level discovery.",
    keywords: ["software developer jobs", "full stack jobs india", "java developer jobs", "developer jobs for freshers"],
    type: "role",
    category: "Software Developer Jobs",
    filters: {
      keywordIncludes: ["developer", "software", "react", "node", "java", "engineer"],
      industries: ["Software", "SaaS"],
    },
  },
  {
    slug: "digital-marketing-jobs",
    title: "Digital Marketing Jobs 2026 | SEO, Ads and Content Hiring",
    description: "Find digital marketing jobs in India across SEO, performance marketing, content operations, and campaign management roles.",
    h1: "Digital Marketing Jobs in India",
    intro: "Digital marketing candidates often search by specialization such as SEO, paid ads, or content. This page groups those listings while keeping strong internal links to fresher and city hubs.",
    keywords: ["digital marketing jobs", "seo jobs india", "google ads jobs", "content marketing jobs"],
    type: "role",
    category: "Digital Marketing Jobs",
    filters: {
      keywordIncludes: ["digital marketing", "seo", "google ads", "content marketing", "marketing"],
      industries: ["Marketing", "Media"],
    },
  },
  {
    slug: "sales-executive-jobs",
    title: "Sales Executive Jobs 2026 | Field Sales and Business Development Roles",
    description: "Explore sales executive jobs in India across retail, B2B, banking, and business development roles with dynamic listings.",
    h1: "Sales Executive Jobs in India",
    intro: "Sales hiring stays active across many sectors, especially in fast-moving employer dashboards, branch hiring, and field-growth teams. This page clusters those roles with related qualification and city links.",
    keywords: ["sales executive jobs", "field sales jobs", "business development jobs", "sales jobs india"],
    type: "role",
    category: "Sales Executive Jobs",
    filters: {
      keywordIncludes: ["sales executive", "sales", "business development", "relationship officer"],
    },
  },
  {
    slug: "banking-jobs",
    title: "Banking Jobs 2026 | Private and Government Banking Openings",
    description: "Find banking jobs in India including branch, relationship, operations, and major government banking recruitment pages.",
    h1: "Banking Jobs in India",
    intro: "Banking job intent often spans both private-sector branch hiring and high-volume government exams such as IBPS and SBI-linked roles. This page is structured to support both journeys with listings and internal links.",
    keywords: ["banking jobs", "bank jobs india", "ibps jobs", "relationship officer jobs"],
    type: "category",
    category: "Banking Jobs",
    filters: {
      keywordIncludes: ["bank", "banking", "relationship officer", "finance"],
      categorySlugs: ["banking-jobs"],
      industries: ["Banking"],
    },
  },
  {
    slug: "government-jobs-india",
    title: "Government Jobs India 2026 | Latest Sarkari and Public Sector Openings",
    description: "Explore government jobs in India across SSC, UPSC, banking, railways, defence, police, teaching, and state-level recruitment pages.",
    h1: "Government Jobs in India",
    intro: "Government job pages need more than keyword stuffing to rank well. They need category clustering, FAQs, related recruitment paths, and strong internal links across state, exam, and qualification intent. This landing page brings those signals together.",
    keywords: ["government jobs india", "sarkari jobs", "latest government vacancy", "govt jobs 2026"],
    type: "category",
    category: "Government Jobs India",
    filters: {
      categorySlugs: ["government-jobs"],
      keywordIncludes: ["government", "ssc", "upsc", "railway", "police", "banking"],
    },
  },
];

export const seoPages: SeoPageDefinition[] = [
  ...cityPages,
  ...categorySeeds.map((page) => ({
    ...page,
    faqs: buildFaqs(page),
  })),
];

function buildFaqs(page: PageSeed) {
  switch (page.slug) {
    case "government-jobs-india":
      return [
        {
          question: "What types of government jobs are covered on this page?",
          answer:
            "This landing page links government recruitment across SSC, UPSC, banking, railways, defence, police, teaching, and state-level categories so candidates can move from broad search intent into specific notification pages.",
        },
        {
          question: "Should candidates verify details before applying?",
          answer:
            "Yes, candidates should always verify eligibility, fees, important dates, and application links on the official recruitment website before applying.",
        },
      ];
    case "banking-jobs":
      return [
        {
          question: "Does this banking jobs page include both private and government openings?",
          answer:
            "Yes, it combines bank and finance hiring from private employers with related government banking recruitment where relevant, giving candidates a wider search path.",
        },
        {
          question: "Are banking jobs open to freshers?",
          answer:
            "Many banking and sales-linked branch roles do consider freshers, especially for trainee, relationship, operations, and support positions.",
        },
      ];
    case "work-from-home-jobs":
    case "remote-jobs-india":
      return [
        {
          question: "Which roles usually appear on remote and work from home job pages?",
          answer:
            "Remote hiring commonly appears in content, software, support, marketing, design, and operations roles, although eligibility and experience expectations vary by employer.",
        },
        {
          question: "How can candidates improve their chances for remote jobs?",
          answer:
            "Candidates improve their chances by tailoring resumes to remote-friendly skills, showing communication strength, and applying quickly through detailed job pages with relevant keywords.",
        },
      ];
    default:
      return [
        {
          question: `How should candidates use the ${page.h1.toLowerCase()} page?`,
          answer: `Use this page to scan relevant listings quickly, then move into job detail pages, related city hubs, and related category pages for more targeted applications.`,
        },
        {
          question: `Does the ${page.h1.toLowerCase()} page include internal links to related searches?`,
          answer: "Yes, every landing page includes related city links, related category links, and supporting internal links to jobs, blogs, and broader career resources.",
        },
      ];
  }
}

export function getSeoPageBySlug(slug: string) {
  return seoPages.find((page) => page.slug === slug);
}

export function getRelatedCityPages(currentSlug: string, limit = 6) {
  return seoPages
    .filter((page) => page.type === "city" && page.slug !== currentSlug)
    .slice(0, limit);
}

export function getRelatedCategoryPages(currentSlug: string, limit = 6) {
  return seoPages
    .filter((page) => page.type !== "city" && page.slug !== currentSlug)
    .slice(0, limit);
}

export function getRelatedBlogPosts(page: SeoPageDefinition, limit = 3): BlogPost[] {
  const terms = [page.h1, page.category ?? "", ...page.keywords].join(" ").toLowerCase();

  return blogPosts
    .filter((post) => {
      const haystack = [post.title, post.excerpt, post.keywords.join(" ")].join(" ").toLowerCase();
      return page.keywords.some((keyword) => haystack.includes(keyword.toLowerCase())) || haystack.includes(terms);
    })
    .slice(0, limit);
}

function includesAny(haystack: string, needles?: string[]) {
  if (!needles?.length) return true;
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}

export function filterJobsForSeoPage(page: SeoPageDefinition, jobs: Job[]) {
  const filtered = jobs.filter((job) => {
    const haystack = [
      job.title,
      job.companyName,
      job.description,
      job.skills.join(" "),
      job.educationRequired,
      job.experienceRequired,
      job.industry,
      job.categorySlug ?? "",
    ]
      .join(" ")
      .toLowerCase();

    if (page.filters?.city && job.city.toLowerCase() !== page.filters.city.toLowerCase()) {
      return false;
    }

    if (page.filters?.workModes?.length && !page.filters.workModes.includes(job.workMode)) {
      return false;
    }

    if (
      page.filters?.categorySlugs?.length &&
      !page.filters.categorySlugs.includes(job.categorySlug ?? "")
    ) {
      return false;
    }

    if (!includesAny(haystack, page.filters?.educationIncludes)) {
      return false;
    }

    if (!includesAny(haystack, page.filters?.experienceIncludes)) {
      return false;
    }

    if (!includesAny(haystack, page.filters?.keywordIncludes)) {
      return false;
    }

    if (
      page.filters?.industries?.length &&
      !page.filters.industries.some((industry) =>
        job.industry.toLowerCase().includes(industry.toLowerCase()),
      )
    ) {
      return false;
    }

    return true;
  });

  if (filtered.length) {
    return filtered;
  }

  if (page.type === "city") {
    return jobs.filter((job) => job.workMode === "remote" || /0-|fresher/i.test(job.experienceRequired)).slice(0, 6);
  }

  return jobs.slice(0, 6);
}

export function filterGovernmentJobsForSeoPage(page: SeoPageDefinition) {
  const haystackTerms = [page.h1, page.category ?? "", ...page.keywords].join(" ").toLowerCase();

  const filtered = governmentJobs.filter((job) => {
    const haystack = [
      job.title,
      job.summary,
      job.category,
      job.department,
      job.state,
      job.eligibility,
    ]
      .join(" ")
      .toLowerCase();

    if (page.city && !haystack.includes(page.city.toLowerCase()) && job.state.toLowerCase() !== "all india") {
      return false;
    }

    if (page.slug === "12th-pass-jobs" && !haystack.includes("12th")) {
      return false;
    }

    if (page.slug === "10th-pass-jobs" && !haystack.includes("10th")) {
      return false;
    }

    if (page.slug === "banking-jobs" && !haystack.includes("bank")) {
      return false;
    }

    if (page.slug === "government-jobs-india") {
      return true;
    }

    return page.keywords.some((keyword) => haystack.includes(keyword.toLowerCase())) || haystack.includes(haystackTerms);
  });

  return filtered.slice(0, 6);
}
