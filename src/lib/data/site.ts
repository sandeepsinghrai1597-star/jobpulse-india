import type {
  BlogPost,
  CareerGuide,
  DashboardMetric,
  GovernmentJob,
  Internship,
  Job,
  PricingPlan,
  SeoPageDefinition,
  Testimonial,
} from "@/types";

export const siteConfig = {
  name: "JobPulse India",
  shortName: "JobPulse",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description:
    "India's AI career companion for jobs, resumes, interviews, and smarter applications.",
  tagline: "Find the right job faster with AI.",
  nav: [
    { href: "/jobs", label: "Jobs" },
    { href: "/career-agent", label: "AI Career Agent" },
    { href: "/resume-builder", label: "Resume Builder" },
    { href: "/resume-analyzer", label: "Resume Analyzer" },
    { href: "/interview-preparation", label: "Interview Prep" },
    { href: "/salary-calculator", label: "Salary Calculator" },
    { href: "/government-jobs", label: "Government Jobs" },
    { href: "/internships", label: "Internships" },
    { href: "/pricing", label: "Pricing" },
  ],
};

export const jobCategories = [
  "IT Jobs",
  "Sales Jobs",
  "Banking Jobs",
  "Healthcare Jobs",
  "Government Jobs",
  "Work From Home Jobs",
  "Fresher Jobs",
  "Internship Jobs",
];

export const jobs: Job[] = [
  {
    id: "job-1",
    slug: "junior-data-analyst-delhi",
    categorySlug: "it-jobs",
    title: "Junior Data Analyst",
    companyName: "Insight Ladder",
    companyLogo: "IL",
    description:
      "Work with Excel, SQL, and Power BI to support business reporting for Indian SMBs.",
    responsibilities: [
      "Build weekly dashboards for operations and sales teams.",
      "Clean data from CRM and spreadsheet sources.",
      "Translate business questions into reports and action points.",
    ],
    requirements: [
      "Graduate degree with analytical mindset.",
      "Basic SQL and Excel proficiency.",
      "Strong communication in English or Hindi.",
    ],
    skills: ["Excel", "SQL", "Power BI", "Communication"],
    salaryMin: 350000,
    salaryMax: 550000,
    salaryType: "yearly",
    location: "Delhi NCR",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    workMode: "hybrid",
    experienceRequired: "0-2 years",
    educationRequired: "BCA / BSc / Graduate",
    jobType: "full-time",
    industry: "Analytics",
    openings: 3,
    applicationDeadline: "2026-07-10",
    recruiterContact: "careers@insightladder.in",
    applicationUrl: "https://example.com/jobs/junior-data-analyst-delhi",
    createdAt: "2026-06-10",
    updatedAt: "2026-06-14",
    status: "active",
    featured: true,
    sourceType: "partner",
  },
  {
    id: "job-2",
    slug: "software-support-engineer-noida",
    categorySlug: "it-jobs",
    title: "Software Support Engineer",
    companyName: "CloudPulse Systems",
    companyLogo: "CP",
    description:
      "Support SaaS customers, troubleshoot product issues, and collaborate with engineering teams.",
    responsibilities: [
      "Respond to support tickets and client escalations.",
      "Document recurring issues and solutions.",
      "Coordinate bug reports with product and engineering teams.",
    ],
    requirements: [
      "Basic programming knowledge in JavaScript or Python.",
      "Strong customer empathy.",
      "Comfort with shifts and remote collaboration tools.",
    ],
    skills: ["JavaScript", "Python", "Customer Support", "Troubleshooting"],
    salaryMin: 300000,
    salaryMax: 500000,
    salaryType: "yearly",
    location: "Noida",
    city: "Noida",
    state: "Uttar Pradesh",
    country: "India",
    workMode: "onsite",
    experienceRequired: "0-1 years",
    educationRequired: "BTech / BCA / MCA",
    jobType: "full-time",
    industry: "SaaS",
    openings: 6,
    applicationDeadline: "2026-06-28",
    recruiterContact: "jobs@cloudpulse.in",
    applicationUrl: "https://example.com/jobs/software-support-engineer-noida",
    createdAt: "2026-06-11",
    updatedAt: "2026-06-14",
    status: "active",
    sourceType: "employer",
  },
  {
    id: "job-3",
    slug: "sales-executive-gurgaon",
    categorySlug: "sales-jobs",
    title: "Sales Executive",
    companyName: "MarketSprint",
    companyLogo: "MS",
    description:
      "Drive local hiring growth by converting leads from SMBs across Gurgaon and Delhi NCR.",
    responsibilities: [
      "Follow up with inbound leads.",
      "Pitch employer plans and featured listings.",
      "Maintain CRM hygiene and daily sales updates.",
    ],
    requirements: [
      "Excellent spoken communication.",
      "Comfort with targets and outbound calling.",
      "Freshers with strong energy are welcome.",
    ],
    skills: ["Sales", "CRM", "Lead Generation", "Negotiation"],
    salaryMin: 22000,
    salaryMax: 38000,
    salaryType: "monthly",
    location: "Gurgaon",
    city: "Gurgaon",
    state: "Haryana",
    country: "India",
    workMode: "onsite",
    experienceRequired: "0-3 years",
    educationRequired: "12th pass / Graduate",
    jobType: "full-time",
    industry: "Recruitment",
    openings: 10,
    applicationDeadline: "2026-07-05",
    recruiterContact: "talent@marketsprint.in",
    applicationUrl: "https://example.com/jobs/sales-executive-gurgaon",
    createdAt: "2026-06-13",
    updatedAt: "2026-06-14",
    status: "active",
    sourceType: "employer",
  },
  {
    id: "job-4",
    slug: "remote-content-writer-india",
    categorySlug: "work-from-home-jobs",
    title: "Remote Content Writer",
    companyName: "WriteStack Media",
    companyLogo: "WS",
    description:
      "Create SEO-friendly career content for students, freshers, and professionals across India.",
    responsibilities: [
      "Write blog posts and city-specific job landing pages.",
      "Coordinate with SEO team for briefs and internal links.",
      "Update existing content with fresher-focused keywords.",
    ],
    requirements: [
      "Strong writing portfolio.",
      "Understanding of SEO basics.",
      "Comfort with AI-assisted editing tools.",
    ],
    skills: ["SEO Writing", "Research", "Content Strategy"],
    salaryMin: 25000,
    salaryMax: 45000,
    salaryType: "monthly",
    location: "Remote",
    city: "Remote",
    state: "India",
    country: "India",
    workMode: "remote",
    experienceRequired: "1-3 years",
    educationRequired: "Graduate",
    jobType: "freelance",
    industry: "Media",
    openings: 2,
    applicationDeadline: "2026-06-30",
    recruiterContact: "editor@writestack.in",
    applicationUrl: "https://example.com/jobs/remote-content-writer-india",
    createdAt: "2026-06-14",
    updatedAt: "2026-06-14",
    status: "active",
    featured: true,
    sourceType: "partner",
  },
];

export const governmentJobs: GovernmentJob[] = [
  {
    id: "gov-1",
    slug: "ssc-cgl-2026",
    categorySlug: "government-jobs",
    title: "SSC CGL 2026",
    department: "Staff Selection Commission",
    category: "ssc",
    state: "All India",
    eligibility: "Bachelor's degree",
    ageLimit: "18-32 years",
    fees: "₹100",
    lastDate: "2026-07-15",
    officialUrl: "https://ssc.gov.in",
    notificationUrl: "https://ssc.gov.in/notification/cgl-2026",
    summary:
      "Combined Graduate Level recruitment for central government departments.",
  },
  {
    id: "gov-2",
    slug: "ibps-po-2026",
    categorySlug: "banking-jobs",
    title: "IBPS PO 2026",
    department: "IBPS",
    category: "banking",
    state: "All India",
    eligibility: "Graduate",
    ageLimit: "20-30 years",
    fees: "₹850",
    lastDate: "2026-08-02",
    officialUrl: "https://www.ibps.in",
    notificationUrl: "https://www.ibps.in/ibps-po-2026",
    summary:
      "Probationary officer recruitment across public sector banks with prelims and mains.",
  },
];

export const internships: Internship[] = [
  {
    id: "intern-1",
    slug: "marketing-intern-bangalore",
    categorySlug: "internship-jobs",
    title: "Digital Marketing Intern",
    company: "GrowthMint",
    stipend: "₹15,000/month",
    duration: "3 months",
    location: "Bangalore",
    skills: ["Meta Ads", "Canva", "Copywriting"],
    applyUrl: "https://example.com/internships/marketing-intern-bangalore",
    deadline: "2026-06-25",
    isPaid: true,
    workMode: "hybrid",
  },
  {
    id: "intern-2",
    slug: "frontend-intern-remote",
    categorySlug: "internship-jobs",
    title: "Frontend Developer Intern",
    company: "PixelNest",
    stipend: "₹18,000/month",
    duration: "6 months",
    location: "Remote",
    skills: ["React", "TypeScript", "Tailwind CSS"],
    applyUrl: "https://example.com/internships/frontend-intern-remote",
    deadline: "2026-07-01",
    isPaid: true,
    workMode: "remote",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Aman Verma",
    role: "BCA Fresher, Noida",
    quote:
      "The AI roadmap gave me a clear 30-day plan and I finally understood which jobs fit my skills.",
  },
  {
    name: "Sakshi Sharma",
    role: "MBA Candidate, Chandigarh",
    quote:
      "Resume analysis and interview prep helped me shortlist better roles instead of applying blindly.",
  },
  {
    name: "Ritika HR Services",
    role: "Recruiter, Gurgaon",
    quote:
      "The employer dashboard is simple, mobile-friendly, and gives us fast access to applicants and analytics.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Candidate Free",
    price: "₹0",
    audience: "candidate",
    description: "For job seekers getting started with discovery and profile building.",
    features: [
      "Search and save jobs",
      "Basic AI career chat",
      "Resume upload",
      "Dashboard tracking",
    ],
    cta: "Start Free",
  },
  {
    name: "Candidate Pro",
    price: "₹199/mo",
    audience: "candidate",
    description: "For serious applicants who want ATS help, interview prep, and deeper insights.",
    features: [
      "Unlimited AI career guidance",
      "Resume ATS analysis",
      "Role-specific resume optimization",
      "Interview practice reports",
      "Advanced salary insights",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Employer Pro",
    price: "₹1,499/mo",
    audience: "employer",
    description: "For companies hiring actively across multiple roles and locations.",
    features: [
      "Unlimited job posts",
      "Applicant management",
      "Resume downloads",
      "Analytics dashboard",
      "Featured jobs add-on",
    ],
    cta: "Post Jobs",
  },
];

export const dashboardMetrics: Record<string, DashboardMetric[]> = {
  candidate: [
    { label: "Matched jobs", value: "42", change: "+8 this week" },
    { label: "Applications", value: "19", change: "5 shortlisted" },
    { label: "Resume score", value: "81/100", change: "+9 after AI edits" },
    { label: "Interview sessions", value: "12", change: "2 completed today" },
  ],
  employer: [
    { label: "Active jobs", value: "8", change: "2 featured" },
    { label: "Applicants", value: "136", change: "+18 this week" },
    { label: "Apply rate", value: "7.4%", change: "+1.3%" },
    { label: "Shortlisted", value: "24", change: "6 new" },
  ],
  admin: [
    { label: "Live jobs", value: "1,248", change: "97 pending review" },
    { label: "Verified recruiters", value: "312", change: "+9 today" },
    { label: "Indexed SEO pages", value: "178", change: "+14 generated" },
    { label: "AI requests", value: "8,420", change: "Stable usage" },
  ],
};

export const blogPosts: BlogPost[] = [
  {
    id: "blog-1",
    slug: "best-jobs-after-bca",
    title: "Best Jobs After BCA in India",
    excerpt:
      "Top BCA roles, fresher salary ranges, and the skills that improve interview chances.",
    content:
      "BCA graduates can target support engineering, QA, data analyst, web development, and SaaS operations roles. Focus on SQL, Excel, communication, and one core programming language.",
    metaTitle: "Best Jobs After BCA in India 2026",
    metaDescription:
      "Explore the best jobs after BCA, salary ranges, and skill roadmap for freshers in India.",
    keywords: ["jobs after BCA", "BCA fresher jobs", "career after BCA"],
    publishedAt: "2026-06-01",
    category: "Career Guide",
  },
  {
    id: "blog-2",
    slug: "how-to-make-ats-resume",
    title: "How to Make an ATS-Friendly Resume",
    excerpt:
      "Learn how to structure your resume for ATS scanners and recruiter shortlisting.",
    content:
      "Use clear headings, quantify achievements, match role-specific keywords, and avoid heavy graphics in ATS-first resume formats.",
    metaTitle: "How to Make an ATS Resume That Gets Shortlisted",
    metaDescription:
      "Build an ATS-friendly resume with better formatting, keywords, and structure for recruiters.",
    keywords: ["ATS resume", "resume tips", "resume keywords"],
    publishedAt: "2026-05-28",
    category: "Resume",
  },
];

export const careerGuides: CareerGuide[] = [
  {
    slug: "data-analyst",
    title: "How to Become a Data Analyst",
    summary:
      "A beginner-friendly roadmap focused on practical tools, job-ready projects, and fresher positioning.",
    targetRole: "Data Analyst",
    duration: "90 days",
    skills: ["Excel", "SQL", "Power BI", "Python", "Statistics"],
    weeks: [
      {
        week: "Week 1-2",
        focus: "Excel and business basics",
        outcomes: ["Build dashboards", "Use formulas", "Clean tabular data"],
      },
      {
        week: "Week 3-5",
        focus: "SQL foundations",
        outcomes: ["Write joins", "Aggregate data", "Answer business questions"],
      },
      {
        week: "Week 6-8",
        focus: "Power BI and storytelling",
        outcomes: ["Design dashboards", "Create reports", "Present insights"],
      },
      {
        week: "Week 9-12",
        focus: "Python and portfolio projects",
        outcomes: ["Analyze CSV data", "Automate reports", "Publish a project"],
      },
    ],
  },
  {
    slug: "web-developer",
    title: "How to Become a Web Developer",
    summary:
      "A practical path from HTML and CSS fundamentals to React, APIs, and deployable portfolio work.",
    targetRole: "Web Developer",
    duration: "120 days",
    skills: ["HTML", "CSS", "JavaScript", "React", "Git"],
    weeks: [
      {
        week: "Week 1-3",
        focus: "HTML, CSS, and layout systems",
        outcomes: ["Build landing pages", "Understand responsive design"],
      },
      {
        week: "Week 4-7",
        focus: "JavaScript basics",
        outcomes: ["Handle forms", "Call APIs", "Write reusable logic"],
      },
      {
        week: "Week 8-12",
        focus: "React and modern UI",
        outcomes: ["Create components", "Manage state", "Build a portfolio app"],
      },
    ],
  },
];

export const seoPages: SeoPageDefinition[] = [
  {
    slug: "jobs-in-delhi",
    title: "Jobs in Delhi 2026 - Freshers, Private Jobs, Government Jobs",
    description:
      "Find latest jobs in Delhi for freshers and experienced candidates. Search private jobs, government jobs, internships, and remote jobs.",
    type: "city",
    city: "Delhi",
  },
  {
    slug: "jobs-in-chandigarh",
    title: "Jobs in Chandigarh 2026 - Freshers, Private Jobs, Government Jobs",
    description:
      "Search latest jobs in Chandigarh including fresher jobs, internships, and work from home roles.",
    type: "city",
    city: "Chandigarh",
  },
  {
    slug: "fresher-jobs-in-india",
    title: "Fresher Jobs in India 2026",
    description:
      "Discover fresher jobs across tech, sales, support, banking, and internships across India.",
    type: "fresher",
    category: "Fresher Jobs",
  },
];

export const qualifications = [
  "10th pass",
  "12th pass",
  "ITI",
  "Diploma",
  "Graduate",
  "Postgraduate",
  "BCA",
  "BTech",
  "MBA",
  "MCA",
];
