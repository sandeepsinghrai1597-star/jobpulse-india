import type { CareerGuide, RoadmapGeneratorResult } from "@/types";

const resourceCatalog = {
  mdn: {
    provider: "MDN",
    href: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
  },
  microsoftPowerBi: {
    provider: "Microsoft Learn",
    href: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/",
  },
  kaggle: {
    provider: "Kaggle Learn",
    href: "https://www.kaggle.com/learn",
  },
  skillshop: {
    provider: "Google Skillshop",
    href: "https://skillshop.withgoogle.com/",
  },
  hubspot: {
    provider: "HubSpot Academy",
    href: "https://academy.hubspot.com/",
  },
  openaiDocs: {
    provider: "OpenAI Docs",
    href: "https://platform.openai.com/docs/overview",
  },
  vercelAiSdk: {
    provider: "Vercel AI SDK",
    href: "https://sdk.vercel.ai/docs",
  },
  googleAiStudio: {
    provider: "Google AI for Developers",
    href: "https://developers.google.com/learn/pathways/solution-ai-agents",
  },
  trailhead: {
    provider: "Salesforce Trailhead",
    href: "https://trailhead.salesforce.com/",
  },
  opentuition: {
    provider: "OpenTuition",
    href: "https://opentuition.com/",
  },
} as const;

export const learningRoadmapCareers = [
  "Data Analyst",
  "Web Developer",
  "AI Agent Developer",
  "Digital Marketer",
  "Sales Executive",
  "Banking Career",
  "Government Job Preparation",
  "BPO Career",
  "Accountant",
] as const;

export const careerGuides: CareerGuide[] = [
  {
    slug: "data-analyst",
    title: "Data Analyst Career Guide",
    summary:
      "Build a practical analytics foundation with spreadsheets, SQL, BI dashboards, and business storytelling.",
    targetRole: "Data Analyst",
    duration: "90 days",
    roleOverview:
      "Data analysts clean data, answer business questions, build reports, and help teams make decisions using numbers instead of guesswork.",
    salaryRange: "Rs 3.5 LPA to Rs 8 LPA for freshers and early-career analysts in India.",
    skills: ["Excel", "SQL", "Power BI", "Python", "Statistics", "Storytelling"],
    roadmap30Days: [
      {
        label: "Week 1",
        focus: "Excel and data cleaning basics",
        outcomes: ["Use formulas", "Clean messy sheets", "Build basic trackers"],
      },
      {
        label: "Week 2",
        focus: "Pivot tables and business metrics",
        outcomes: ["Create summaries", "Track KPIs", "Explain trends simply"],
      },
      {
        label: "Week 3",
        focus: "SQL fundamentals",
        outcomes: ["Query tables", "Filter data", "Write joins"],
      },
      {
        label: "Week 4",
        focus: "Dashboard thinking",
        outcomes: ["Plan one dashboard", "Choose visuals", "Document insights"],
      },
    ],
    roadmap90Days: [
      {
        label: "Days 1-30",
        focus: "Spreadsheet and SQL foundations",
        outcomes: ["Become comfortable with Excel", "Write useful SQL queries", "Create one reporting mini-project"],
      },
      {
        label: "Days 31-60",
        focus: "BI tools and data storytelling",
        outcomes: ["Build Power BI dashboards", "Create clear charts", "Translate metrics into actions"],
      },
      {
        label: "Days 61-90",
        focus: "Python and portfolio polish",
        outcomes: ["Analyze CSV data with Python", "Publish two projects", "Tailor resume for analyst jobs"],
      },
    ],
    projects: [
      {
        title: "Sales Dashboard",
        description: "Analyze monthly sales, top products, and conversion trends in Excel or Power BI.",
      },
      {
        title: "SQL Business Questions Pack",
        description: "Use joins and aggregations to answer customer, revenue, and retention questions from a sample dataset.",
      },
      {
        title: "Customer Churn Notebook",
        description: "Clean a CSV in Python, find churn patterns, and present three business recommendations.",
      },
    ],
    freeResources: [
      {
        title: "Power BI learning paths",
        ...resourceCatalog.microsoftPowerBi,
        description: "Structured Microsoft training for cleaning, modeling, and visualizing data.",
      },
      {
        title: "Kaggle Learn",
        ...resourceCatalog.kaggle,
        description: "Short beginner courses for Python, Pandas, and data visualization.",
      },
      {
        title: "MDN Learn",
        ...resourceCatalog.mdn,
        description: "Useful for basic web and data publishing skills when you share dashboards online.",
      },
    ],
    certifications: ["Microsoft Power BI Data Analyst", "Google Data Analytics Certificate", "SQL for Data Analysis certificate"],
    jobsToApplyFor: ["Junior Data Analyst", "MIS Executive", "Reporting Analyst", "Business Analyst Intern"],
    faqs: [
      {
        question: "Can I become a data analyst without coding?",
        answer: "Yes. Many entry roles start with Excel, SQL, and BI tools. Python becomes valuable as you level up.",
      },
      {
        question: "Which tool matters most for freshers?",
        answer: "SQL plus one dashboard tool usually creates the fastest interview traction.",
      },
    ],
  },
  {
    slug: "web-developer",
    title: "Web Developer Career Guide",
    summary:
      "Learn to build responsive websites, interactive apps, and deployable portfolio projects step by step.",
    targetRole: "Web Developer",
    duration: "90 days",
    roleOverview:
      "Web developers turn ideas into working websites and applications by combining frontend UI, APIs, and deployment workflows.",
    salaryRange: "Rs 3 LPA to Rs 9 LPA for freshers and junior developers in India.",
    skills: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Git"],
    roadmap30Days: [
      {
        label: "Week 1",
        focus: "HTML structure and semantic tags",
        outcomes: ["Build page layouts", "Write accessible markup", "Understand content hierarchy"],
      },
      {
        label: "Week 2",
        focus: "CSS fundamentals and responsive layouts",
        outcomes: ["Use flexbox", "Use grid", "Make pages mobile-friendly"],
      },
      {
        label: "Week 3",
        focus: "JavaScript basics",
        outcomes: ["Handle events", "Validate forms", "Render dynamic content"],
      },
      {
        label: "Week 4",
        focus: "Git and first portfolio launch",
        outcomes: ["Push code to GitHub", "Deploy a page", "Write a project README"],
      },
    ],
    roadmap90Days: [
      {
        label: "Days 1-30",
        focus: "Frontend basics",
        outcomes: ["Build static websites", "Understand responsive design", "Use Git daily"],
      },
      {
        label: "Days 31-60",
        focus: "JavaScript and APIs",
        outcomes: ["Work with fetch", "Manage state", "Create interactive UI"],
      },
      {
        label: "Days 61-90",
        focus: "React projects and deployment",
        outcomes: ["Build a React app", "Connect APIs", "Ship a polished portfolio"],
      },
    ],
    projects: [
      {
        title: "Responsive Portfolio Site",
        description: "Create a multi-section portfolio that works well on desktop and mobile.",
      },
      {
        title: "Weather or Job Search App",
        description: "Fetch API data, handle loading states, and render results with clean UI states.",
      },
      {
        title: "Admin Dashboard",
        description: "Build a dashboard layout with cards, charts, tables, and reusable components.",
      },
    ],
    freeResources: [
      {
        title: "Learn web development",
        ...resourceCatalog.mdn,
        description: "A structured beginner path covering HTML, CSS, JavaScript, and job-ready fundamentals.",
      },
      {
        title: "freeCodeCamp curriculum",
        provider: "freeCodeCamp",
        href: "https://www.freecodecamp.org/learn/",
        description: "Hands-on exercises and certifications for responsive web design and JavaScript.",
      },
      {
        title: "Vercel AI SDK docs",
        ...resourceCatalog.vercelAiSdk,
        description: "Helpful once you move into modern React apps with AI features.",
      },
    ],
    certifications: ["freeCodeCamp Responsive Web Design", "JavaScript Algorithms and Data Structures", "Meta Front-End Developer"],
    jobsToApplyFor: ["Frontend Developer Intern", "Junior Web Developer", "React Developer Intern", "UI Developer"],
    faqs: [
      {
        question: "Should I learn React before JavaScript?",
        answer: "No. Basic JavaScript first makes React much easier to understand.",
      },
      {
        question: "Do I need a computer science degree?",
        answer: "No. Strong projects, GitHub activity, and problem-solving usually matter more for junior roles.",
      },
    ],
  },
  {
    slug: "ai-agent-developer",
    title: "AI Agent Developer Career Guide",
    summary:
      "Move from API basics to production-minded agent workflows with prompts, tools, memory, and evaluation.",
    targetRole: "AI Agent Developer",
    duration: "90 days",
    roleOverview:
      "AI agent developers build software that can reason over tasks, call tools, use structured outputs, and automate multi-step workflows safely.",
    salaryRange: "Rs 6 LPA to Rs 18 LPA depending on software depth, model experience, and product ownership.",
    skills: ["Python or TypeScript", "Prompt design", "API integration", "Tool calling", "Evaluation", "LLM app UX"],
    roadmap30Days: [
      {
        label: "Week 1",
        focus: "LLM basics and API setup",
        outcomes: ["Make model calls", "Understand tokens", "Handle system and user prompts"],
      },
      {
        label: "Week 2",
        focus: "Structured outputs and prompt iteration",
        outcomes: ["Return JSON", "Reduce hallucinations", "Write reusable prompt templates"],
      },
      {
        label: "Week 3",
        focus: "Tool calling and retrieval",
        outcomes: ["Call functions", "Use search or database context", "Design clear tool contracts"],
      },
      {
        label: "Week 4",
        focus: "Mini agent workflow",
        outcomes: ["Chain steps", "Store state", "Review outputs with checklists"],
      },
    ],
    roadmap90Days: [
      {
        label: "Days 1-30",
        focus: "Model and prompt foundations",
        outcomes: ["Understand model APIs", "Build simple assistants", "Return structured responses"],
      },
      {
        label: "Days 31-60",
        focus: "Agent architecture",
        outcomes: ["Add tools", "Use memory carefully", "Handle retries and failures"],
      },
      {
        label: "Days 61-90",
        focus: "Shipping and evaluation",
        outcomes: ["Build two agent products", "Add guardrails", "Measure response quality"],
      },
    ],
    projects: [
      {
        title: "Career Research Agent",
        description: "Accept a target role, pull context, and return a structured plan with sources and action items.",
      },
      {
        title: "Support Triage Agent",
        description: "Classify tickets, suggest responses, and route complex cases for human review.",
      },
      {
        title: "Meeting Prep Agent",
        description: "Summarize notes, build an agenda, and generate follow-up tasks with approval points.",
      },
    ],
    freeResources: [
      {
        title: "OpenAI docs overview",
        ...resourceCatalog.openaiDocs,
        description: "Covers model usage, structured outputs, tools, and implementation patterns.",
      },
      {
        title: "Vercel AI SDK docs",
        ...resourceCatalog.vercelAiSdk,
        description: "Great for building agentic UI, streaming, and tool-driven apps in React.",
      },
      {
        title: "Google AI agents pathway",
        ...resourceCatalog.googleAiStudio,
        description: "Another practical path for agent concepts, orchestration, and production considerations.",
      },
    ],
    certifications: ["Google Cloud Generative AI learning badges", "Microsoft Applied Skills for AI workloads", "Provider-specific GenAI certificates"],
    jobsToApplyFor: ["LLM Engineer Intern", "AI Application Developer", "Prompt Engineer", "Automation Engineer"],
    faqs: [
      {
        question: "Do I need machine learning math first?",
        answer: "Not for entry agent work. Strong software engineering, prompt design, and API thinking are more immediately useful.",
      },
      {
        question: "Which language should I start with?",
        answer: "Choose Python or TypeScript based on the product stack you want to build in.",
      },
    ],
  },
  {
    slug: "digital-marketer",
    title: "Digital Marketer Career Guide",
    summary:
      "Learn campaign setup, content, analytics, and optimization across SEO, social, ads, and reporting.",
    targetRole: "Digital Marketer",
    duration: "90 days",
    roleOverview:
      "Digital marketers grow traffic, leads, and revenue using channels like search, social, email, paid ads, and analytics dashboards.",
    salaryRange: "Rs 2.8 LPA to Rs 7 LPA for junior digital marketing roles in India.",
    skills: ["SEO", "Content marketing", "Google Ads", "Analytics", "Social media", "Reporting"],
    roadmap30Days: [
      {
        label: "Week 1",
        focus: "Marketing funnels and channel basics",
        outcomes: ["Understand awareness to conversion", "Map one campaign funnel", "Learn core terms"],
      },
      {
        label: "Week 2",
        focus: "SEO and keyword research",
        outcomes: ["Write metadata", "Build keyword lists", "Plan simple content clusters"],
      },
      {
        label: "Week 3",
        focus: "Social media and content planning",
        outcomes: ["Create a content calendar", "Write hooks", "Track engagement metrics"],
      },
      {
        label: "Week 4",
        focus: "Ads and analytics basics",
        outcomes: ["Read campaign reports", "Understand CTR and CPA", "Build one weekly report"],
      },
    ],
    roadmap90Days: [
      {
        label: "Days 1-30",
        focus: "Channel awareness and core execution",
        outcomes: ["Understand SEO and social", "Write campaign content", "Read simple metrics"],
      },
      {
        label: "Days 31-60",
        focus: "Campaign building and optimization",
        outcomes: ["Run mock or low-budget ads", "Test creatives", "Report weekly insights"],
      },
      {
        label: "Days 61-90",
        focus: "Portfolio and specialization",
        outcomes: ["Publish case studies", "Choose SEO, performance, or content", "Tailor resume with campaign language"],
      },
    ],
    projects: [
      {
        title: "SEO Content Brief Pack",
        description: "Create keyword research, content outline, title ideas, and on-page recommendations for one topic cluster.",
      },
      {
        title: "Social Campaign Calendar",
        description: "Plan 30 days of posts, CTAs, hooks, and reporting fields for a product or local business.",
      },
      {
        title: "Marketing Dashboard",
        description: "Track traffic, leads, conversions, and content performance in a simple reporting sheet.",
      },
    ],
    freeResources: [
      {
        title: "Google Skillshop",
        ...resourceCatalog.skillshop,
        description: "Free Google Ads and analytics training with product-aligned certifications.",
      },
      {
        title: "HubSpot Academy",
        ...resourceCatalog.hubspot,
        description: "Free courses in digital marketing, content, social media, email, and inbound strategy.",
      },
      {
        title: "Google Analytics learning",
        ...resourceCatalog.skillshop,
        description: "Use the Google Analytics section to strengthen measurement and reporting skills.",
      },
    ],
    certifications: ["Google Ads certifications", "Google Analytics certification", "HubSpot Digital Marketing Certification"],
    jobsToApplyFor: ["Digital Marketing Executive", "SEO Executive", "Performance Marketing Intern", "Content Marketing Associate"],
    faqs: [
      {
        question: "Do I need to spend money on ads to learn digital marketing?",
        answer: "No. You can learn strategy, setup, reporting, and optimization with case studies, simulations, and small personal projects.",
      },
      {
        question: "Which specialization is best for freshers?",
        answer: "SEO, content, and reporting are usually the easiest entry points, while paid ads grow well once you have basics.",
      },
    ],
  },
  {
    slug: "sales-executive",
    title: "Sales Executive Career Guide",
    summary:
      "Build confidence in lead qualification, objection handling, follow-ups, CRM discipline, and target ownership.",
    targetRole: "Sales Executive",
    duration: "90 days",
    roleOverview:
      "Sales executives generate revenue by prospecting, qualifying leads, pitching value, handling objections, and closing opportunities consistently.",
    salaryRange: "Rs 2.5 LPA to Rs 6 LPA plus incentives for entry and junior sales roles.",
    skills: ["Communication", "Lead qualification", "CRM", "Negotiation", "Objection handling", "Follow-up"],
    roadmap30Days: [
      {
        label: "Week 1",
        focus: "Sales process fundamentals",
        outcomes: ["Understand lead stages", "Learn discovery questions", "Practice product positioning"],
      },
      {
        label: "Week 2",
        focus: "Call scripts and objection handling",
        outcomes: ["Handle price objections", "Ask better questions", "Write follow-up messages"],
      },
      {
        label: "Week 3",
        focus: "CRM workflow and pipeline discipline",
        outcomes: ["Log activities", "Track next steps", "Measure conversion points"],
      },
      {
        label: "Week 4",
        focus: "Mock closing practice",
        outcomes: ["Run a discovery call", "Present value clearly", "Close with a defined next step"],
      },
    ],
    roadmap90Days: [
      {
        label: "Days 1-30",
        focus: "Sales communication basics",
        outcomes: ["Build confidence on calls", "Learn qualification", "Write cleaner follow-ups"],
      },
      {
        label: "Days 31-60",
        focus: "Pipeline execution",
        outcomes: ["Manage a CRM workflow", "Improve conversion ratios", "Handle objections with structure"],
      },
      {
        label: "Days 61-90",
        focus: "Revenue ownership",
        outcomes: ["Run end-to-end mock deals", "Build metrics awareness", "Tailor resume with revenue language"],
      },
    ],
    projects: [
      {
        title: "Outbound Prospecting Playbook",
        description: "Draft ICP notes, cold call openers, cold email templates, and qualification questions.",
      },
      {
        title: "CRM Tracking Sheet",
        description: "Track lead stage, follow-up date, objection type, and win-loss reasons.",
      },
      {
        title: "Demo Script",
        description: "Create a 5-minute product pitch with pain points, value props, and closing lines.",
      },
    ],
    freeResources: [
      {
        title: "HubSpot sales training",
        ...resourceCatalog.hubspot,
        description: "Includes inbound sales and CRM-oriented learning for junior sellers.",
      },
      {
        title: "Salesforce Trailhead",
        ...resourceCatalog.trailhead,
        description: "Free modules for CRM workflows, pipeline habits, and customer-facing communication.",
      },
      {
        title: "HubSpot certifications",
        ...resourceCatalog.hubspot,
        description: "Useful for inbound sales, email follow-up, and sales process language.",
      },
    ],
    certifications: ["HubSpot Inbound Sales", "Salesforce Trailhead badges", "CRM fundamentals certificates"],
    jobsToApplyFor: ["Sales Executive", "Inside Sales Associate", "Business Development Executive", "Telesales Executive"],
    faqs: [
      {
        question: "Can freshers get into sales without experience?",
        answer: "Yes. Employers often hire for communication, consistency, and energy, then train product knowledge.",
      },
      {
        question: "What should I show in a sales resume with no job history?",
        answer: "Show communication examples, targets from college events or internships, and any lead or client-facing experience.",
      },
    ],
  },
  {
    slug: "banking-career",
    title: "Banking Career Guide",
    summary:
      "Prepare for branch, operations, and officer-track banking roles with aptitude, finance basics, and interview readiness.",
    targetRole: "Banking Career",
    duration: "90 days",
    roleOverview:
      "Banking careers span clerical, customer service, operations, sales, and probationary officer roles across public and private institutions.",
    salaryRange: "Rs 3 LPA to Rs 8 LPA for entry banking and officer-track opportunities.",
    skills: ["Quantitative aptitude", "Reasoning", "English", "Banking awareness", "Customer handling", "Accuracy"],
    roadmap30Days: [
      {
        label: "Week 1",
        focus: "Exam pattern and banking basics",
        outcomes: ["Understand PO and clerk tracks", "List core topics", "Start current affairs notes"],
      },
      {
        label: "Week 2",
        focus: "Quant and reasoning practice",
        outcomes: ["Solve speed and percentage questions", "Practice puzzles", "Track accuracy"],
      },
      {
        label: "Week 3",
        focus: "English and banking awareness",
        outcomes: ["Improve comprehension", "Learn key financial terms", "Revise banking products"],
      },
      {
        label: "Week 4",
        focus: "Mock tests and interview basics",
        outcomes: ["Attempt sectional mocks", "Review weak areas", "Prepare self-introduction"],
      },
    ],
    roadmap90Days: [
      {
        label: "Days 1-30",
        focus: "Foundation and topic mapping",
        outcomes: ["Set a study routine", "Cover basics", "Build revision notes"],
      },
      {
        label: "Days 31-60",
        focus: "Speed and mock practice",
        outcomes: ["Improve time management", "Solve mixed sections", "Track mock patterns"],
      },
      {
        label: "Days 61-90",
        focus: "Exam plus interview readiness",
        outcomes: ["Polish accuracy", "Strengthen general awareness", "Prepare role-fit answers"],
      },
    ],
    projects: [
      {
        title: "Current Affairs Tracker",
        description: "Build a weekly revision sheet for RBI news, banking terms, and economic updates.",
      },
      {
        title: "Mock Analysis Log",
        description: "Record scores, weak sections, error types, and retest priorities.",
      },
      {
        title: "Customer Scenario Workbook",
        description: "Write responses to account opening, loan query, and complaint-handling situations.",
      },
    ],
    freeResources: [
      {
        title: "OpenTuition accounting and finance basics",
        ...resourceCatalog.opentuition,
        description: "Useful for core accounting language and financial understanding.",
      },
      {
        title: "Trailhead communication modules",
        ...resourceCatalog.trailhead,
        description: "Helpful for customer-facing communication and workflow discipline.",
      },
      {
        title: "HubSpot Academy",
        ...resourceCatalog.hubspot,
        description: "Good for communication, service mindset, and relationship-building basics.",
      },
    ],
    certifications: ["NISM foundation certificates", "Basic banking and finance certificates", "Excel for banking operations"],
    jobsToApplyFor: ["Bank Clerk", "Probationary Officer", "Relationship Executive", "Banking Operations Associate"],
    faqs: [
      {
        question: "Is banking only about competitive exams?",
        answer: "No. Private banks and fintech companies also hire through direct applications for sales, service, and operations roles.",
      },
      {
        question: "How much daily study time is enough?",
        answer: "Two to three focused hours daily is a strong start if you stay consistent and take mocks weekly.",
      },
    ],
  },
  {
    slug: "government-job-preparation",
    title: "Government Job Preparation Guide",
    summary:
      "Create a disciplined prep routine for aptitude, general awareness, revision, mock tests, and exam-specific strategy.",
    targetRole: "Government Job Preparation",
    duration: "90 days",
    roleOverview:
      "Government exam preparation requires consistency, syllabus control, accuracy under time pressure, and strong revision habits across aptitude and current affairs.",
    salaryRange: "Ranges vary by exam, but many entry government roles offer stable pay, allowances, and long-term growth.",
    skills: ["Syllabus planning", "Quant", "Reasoning", "General awareness", "Revision", "Mock analysis"],
    roadmap30Days: [
      {
        label: "Week 1",
        focus: "Pick target exams and map syllabus",
        outcomes: ["Shortlist exams", "Build a daily timetable", "Gather study material"],
      },
      {
        label: "Week 2",
        focus: "Quant and reasoning basics",
        outcomes: ["Practice arithmetic", "Solve seating and series questions", "Record mistakes"],
      },
      {
        label: "Week 3",
        focus: "GK and current affairs habit",
        outcomes: ["Start daily notes", "Revise static GK", "Use weekly quizzes"],
      },
      {
        label: "Week 4",
        focus: "First full mock cycle",
        outcomes: ["Take one mock", "Analyze timing", "Fix weak sections"],
      },
    ],
    roadmap90Days: [
      {
        label: "Days 1-30",
        focus: "Exam selection and basics",
        outcomes: ["Stabilize study rhythm", "Understand syllabus", "Cover high-frequency topics"],
      },
      {
        label: "Days 31-60",
        focus: "Section strengthening",
        outcomes: ["Improve speed", "Revise notes weekly", "Take regular mocks"],
      },
      {
        label: "Days 61-90",
        focus: "Performance tuning",
        outcomes: ["Analyze mock trends", "Improve accuracy", "Refine attempt strategy"],
      },
    ],
    projects: [
      {
        title: "Exam Tracker",
        description: "Track forms, deadlines, admit cards, exam dates, and revision stages in one sheet.",
      },
      {
        title: "Error Notebook",
        description: "Log repeated mistakes from quant, reasoning, and GK so revision becomes targeted.",
      },
      {
        title: "Weekly Mock Dashboard",
        description: "Capture score, attempts, accuracy, time spent, and top revision needs.",
      },
    ],
    freeResources: [
      {
        title: "Current affairs and general awareness notes workflow",
        ...resourceCatalog.hubspot,
        description: "Use a structured note-taking system and study routine rather than random content consumption.",
      },
      {
        title: "Spreadsheets for revision planning",
        ...resourceCatalog.mdn,
        description: "A simple digital tracker can help with revision cycles and application planning.",
      },
      {
        title: "Basic finance/accounting refreshers",
        ...resourceCatalog.opentuition,
        description: "Useful when target exams include commerce or finance awareness sections.",
      },
    ],
    certifications: ["No certification is required; score improvement and exam-specific readiness matter more."],
    jobsToApplyFor: ["SSC CGL", "Bank Clerk", "Railway NTPC", "State government assistant roles"],
    faqs: [
      {
        question: "Should I prepare for many exams at once?",
        answer: "Start with one primary exam family and one backup with overlapping syllabus to avoid dilution.",
      },
      {
        question: "What matters most after basics?",
        answer: "Mock analysis. Many learners improve only after they start tracking mistakes carefully.",
      },
    ],
  },
  {
    slug: "bpo-career",
    title: "BPO Career Guide",
    summary:
      "Prepare for customer support and process roles by improving communication, typing, product understanding, and calm problem solving.",
    targetRole: "BPO Career",
    duration: "90 days",
    roleOverview:
      "BPO roles support customers through voice, chat, or email processes while balancing empathy, clarity, accuracy, and speed.",
    salaryRange: "Rs 2.2 LPA to Rs 4.8 LPA for entry BPO and support roles, often with shift allowances.",
    skills: ["Spoken English", "Customer empathy", "Typing", "Listening", "Process adherence", "Email writing"],
    roadmap30Days: [
      {
        label: "Week 1",
        focus: "Communication fundamentals",
        outcomes: ["Practice introductions", "Improve clarity", "Reduce filler words"],
      },
      {
        label: "Week 2",
        focus: "Customer handling",
        outcomes: ["Listen actively", "Use empathy statements", "Summarize issues clearly"],
      },
      {
        label: "Week 3",
        focus: "Chat and email support basics",
        outcomes: ["Write faster", "Use templates", "Improve grammar and tone"],
      },
      {
        label: "Week 4",
        focus: "Interview practice",
        outcomes: ["Answer shift-related questions", "Handle conflict scenarios", "Build confidence"],
      },
    ],
    roadmap90Days: [
      {
        label: "Days 1-30",
        focus: "Voice and written communication",
        outcomes: ["Speak more clearly", "Write cleaner messages", "Build interview readiness"],
      },
      {
        label: "Days 31-60",
        focus: "Support workflow training",
        outcomes: ["Handle scenarios", "Track SLA awareness", "Follow processes consistently"],
      },
      {
        label: "Days 61-90",
        focus: "Career progression basics",
        outcomes: ["Prepare for QA metrics", "Understand escalation flow", "Tailor resume for support roles"],
      },
    ],
    projects: [
      {
        title: "Customer Reply Template Pack",
        description: "Draft response templates for refunds, delays, password resets, and complaint escalations.",
      },
      {
        title: "Call Summary Workbook",
        description: "Write short issue summaries, resolutions, and next steps for mock calls.",
      },
      {
        title: "Typing and QA Tracker",
        description: "Track typing speed, grammar errors, and customer-handling improvements over time.",
      },
    ],
    freeResources: [
      {
        title: "HubSpot service and communication training",
        ...resourceCatalog.hubspot,
        description: "Useful for support communication and customer-first messaging.",
      },
      {
        title: "Trailhead service modules",
        ...resourceCatalog.trailhead,
        description: "Good for service process thinking and CRM-adjacent workflows.",
      },
      {
        title: "MDN typing and web basics reference",
        ...resourceCatalog.mdn,
        description: "Helpful when support roles involve web tools, dashboards, or browser-based workflows.",
      },
    ],
    certifications: ["Customer service basics certificates", "Spoken English training completion", "CRM tool basics"],
    jobsToApplyFor: ["Customer Support Executive", "International Voice Process", "Chat Support Associate", "Process Associate"],
    faqs: [
      {
        question: "Is BPO a good starting career?",
        answer: "Yes. It builds communication, discipline, customer handling, and operational experience that can open later moves into QA, training, or operations.",
      },
      {
        question: "What do interviewers check first?",
        answer: "Confidence, communication clarity, willingness to work shifts, and how you respond to customer situations.",
      },
    ],
  },
  {
    slug: "accountant",
    title: "Accountant Career Guide",
    summary:
      "Learn bookkeeping, GST-aware workflows, reconciliations, reporting, and financial discipline for entry accounting roles.",
    targetRole: "Accountant",
    duration: "90 days",
    roleOverview:
      "Accountants record transactions, reconcile statements, manage compliance support, and help businesses understand financial health.",
    salaryRange: "Rs 2.8 LPA to Rs 6.5 LPA for junior accountants and accounts executives in India.",
    skills: ["Bookkeeping", "Tally or ERP basics", "Excel", "GST basics", "Reconciliation", "Attention to detail"],
    roadmap30Days: [
      {
        label: "Week 1",
        focus: "Accounting fundamentals",
        outcomes: ["Understand debit and credit", "Read simple ledgers", "Record transactions"],
      },
      {
        label: "Week 2",
        focus: "Excel for accounts",
        outcomes: ["Use lookups", "Create trackers", "Check totals and variances"],
      },
      {
        label: "Week 3",
        focus: "Reconciliation and reporting",
        outcomes: ["Match bank entries", "Spot differences", "Prepare a simple summary"],
      },
      {
        label: "Week 4",
        focus: "GST and compliance awareness",
        outcomes: ["Understand invoice basics", "Learn tax-related terms", "Organize monthly documentation"],
      },
    ],
    roadmap90Days: [
      {
        label: "Days 1-30",
        focus: "Ledger and spreadsheet basics",
        outcomes: ["Understand accounting flow", "Use Excel daily", "Build confidence with entries"],
      },
      {
        label: "Days 31-60",
        focus: "Operational accounting practice",
        outcomes: ["Do reconciliations", "Organize invoices", "Create monthly trackers"],
      },
      {
        label: "Days 61-90",
        focus: "Job readiness",
        outcomes: ["Prepare accounts projects", "Tailor resume with compliance language", "Practice finance interviews"],
      },
    ],
    projects: [
      {
        title: "Monthly Expense Tracker",
        description: "Categorize spend, total monthly expenses, and flag unusual changes in Excel.",
      },
      {
        title: "Bank Reconciliation Sheet",
        description: "Match ledger entries with bank statement records and identify missing items.",
      },
      {
        title: "Invoice and GST Folder Workflow",
        description: "Create a clean naming, filing, and tracking process for invoices and tax-ready documents.",
      },
    ],
    freeResources: [
      {
        title: "OpenTuition free accounting lectures",
        ...resourceCatalog.opentuition,
        description: "A strong free starting point for accounting concepts and structured lessons.",
      },
      {
        title: "Microsoft Learn and Excel refreshers",
        ...resourceCatalog.microsoftPowerBi,
        description: "Useful for spreadsheet confidence, reporting, and data organization habits.",
      },
      {
        title: "HubSpot Academy workflow training",
        ...resourceCatalog.hubspot,
        description: "Helpful for process discipline and communication, especially in client-facing finance teams.",
      },
    ],
    certifications: ["Tally certificate", "GST practitioner basics", "Advanced Excel for finance"],
    jobsToApplyFor: ["Accounts Executive", "Junior Accountant", "Accounts Payable Associate", "Finance Operations Associate"],
    faqs: [
      {
        question: "Can non-commerce graduates enter accounting?",
        answer: "Yes, but they usually need stronger basics in bookkeeping, Excel, and reconciliations before applying.",
      },
      {
        question: "Which tool is most useful first?",
        answer: "Excel is the fastest starting point, followed by Tally or the ERP used by your target employers.",
      },
    ],
  },
];

function normalizeCareerInput(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const careerAliasMap = new Map<string, string>(
  careerGuides.flatMap((guide) => [
    [guide.slug, guide.slug],
    [normalizeCareerInput(guide.targetRole), guide.slug],
    [normalizeCareerInput(guide.title.replace(" Career Guide", "")), guide.slug],
  ]),
);

export function getCareerGuideBySlug(slug: string) {
  return careerGuides.find((guide) => guide.slug === slug);
}

export function findCareerGuide(input: string) {
  const alias = careerAliasMap.get(normalizeCareerInput(input));
  return alias ? getCareerGuideBySlug(alias) : undefined;
}

export function buildRoadmapGeneratorFallback(targetCareer: string): RoadmapGeneratorResult {
  const guide = findCareerGuide(targetCareer);

  if (!guide) {
    return {
      targetCareer,
      skillsRequired: [
        "Role fundamentals",
        "Hands-on practice",
        "Portfolio projects",
        "Communication",
        "Interview preparation",
      ],
      weeklyPlan: [
        {
          week: "Week 1",
          focus: "Role research and skill mapping",
          tasks: ["Study job descriptions", "List required tools", "Map beginner skill gaps"],
        },
        {
          week: "Week 2",
          focus: "Core skill practice",
          tasks: ["Learn the top 2 required skills", "Take notes", "Finish one guided tutorial"],
        },
        {
          week: "Week 3",
          focus: "Project building",
          tasks: ["Build one small project", "Write down lessons learned", "Collect resume bullet points"],
        },
        {
          week: "Week 4",
          focus: "Job readiness",
          tasks: ["Prepare interview topics", "Add keywords to resume", "Start applying to junior roles"],
        },
      ],
      projects: [
        `${targetCareer} beginner project`,
        `${targetCareer} portfolio case study`,
        `${targetCareer} interview-ready capstone`,
      ],
      resumeKeywords: [
        targetCareer,
        "beginner",
        "project-based learning",
        "portfolio",
        "problem solving",
      ],
      interviewTopics: [
        `${targetCareer} responsibilities`,
        "Beginner tools and workflows",
        "Project walkthrough",
        "Problem-solving scenarios",
      ],
      note: "Generated from the generic JobPulse roadmap fallback.",
    };
  }

  return {
    targetCareer: guide.targetRole,
    skillsRequired: guide.skills,
    weeklyPlan: guide.roadmap30Days.map((phase) => ({
      week: phase.label,
      focus: phase.focus,
      tasks: phase.outcomes,
    })),
    projects: guide.projects.map((project) => project.title),
    resumeKeywords: [...new Set([...guide.skills, ...guide.jobsToApplyFor.slice(0, 2), guide.targetRole])],
    interviewTopics: [
      `${guide.targetRole} responsibilities`,
      ...guide.skills.slice(0, 4).map((skill) => `${skill} fundamentals`),
      "Project discussion",
      "Scenario-based problem solving",
    ],
    note: "Generated from the built-in JobPulse roadmap library.",
  };
}
