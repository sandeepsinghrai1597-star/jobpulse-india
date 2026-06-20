import type { GovernmentJob, GovernmentJobCategory } from "@/types";

export const governmentJobCategories: GovernmentJobCategory[] = [
  {
    slug: "ssc",
    name: "SSC",
    intro:
      "SSC jobs cover Combined Graduate Level, CHSL, MTS, GD, and departmental exams for central ministries and offices.",
    keywords: ["SSC jobs", "SSC vacancy", "SSC notification", "SSC apply online"],
  },
  {
    slug: "upsc",
    name: "UPSC",
    intro:
      "UPSC jobs include civil services, engineering, defence, and specialist recruitment with national-level competition.",
    keywords: ["UPSC jobs", "UPSC notification", "UPSC recruitment", "UPSC exam"],
  },
  {
    slug: "banking",
    name: "Banking",
    intro:
      "Banking jobs include IBPS, SBI, RBI, NABARD, and public sector bank opportunities for clerks, officers, and specialists.",
    keywords: ["bank jobs", "IBPS vacancy", "SBI recruitment", "banking jobs India"],
  },
  {
    slug: "railways",
    name: "Railways",
    intro:
      "Railway jobs include technician, ALP, group D, NTPC, and apprentice openings announced through RRB zones.",
    keywords: ["railway jobs", "RRB notification", "railway vacancy", "RRB recruitment"],
  },
  {
    slug: "defence",
    name: "Defence",
    intro:
      "Defence jobs include Army, Navy, Air Force, DRDO, and ordnance opportunities for technical and non-technical candidates.",
    keywords: ["defence jobs", "army recruitment", "navy vacancy", "air force jobs"],
  },
  {
    slug: "police",
    name: "Police",
    intro:
      "Police jobs include constable, SI, driver, and technical wing vacancies across central and state police departments.",
    keywords: ["police jobs", "constable vacancy", "SI recruitment", "police notification"],
  },
  {
    slug: "teaching",
    name: "Teaching",
    intro:
      "Teaching jobs include TGT, PGT, PRT, assistant professor, and school education department vacancies.",
    keywords: ["teaching jobs", "teacher vacancy", "PGT recruitment", "TGT notification"],
  },
  {
    slug: "state-government",
    name: "State Government",
    intro:
      "State government jobs bring together departments, boards, commissions, and public service recruitment across India.",
    keywords: [
      "state government jobs",
      "state vacancy",
      "government recruitment",
      "state jobs India",
    ],
  },
  {
    slug: "haryana-jobs",
    name: "Haryana Jobs",
    intro:
      "Haryana government jobs include HSSC, HPSC, police, teaching, and department-level vacancies for state candidates.",
    keywords: ["Haryana jobs", "HSSC recruitment", "HPSC vacancy", "Haryana govt jobs"],
  },
  {
    slug: "punjab-jobs",
    name: "Punjab Jobs",
    intro:
      "Punjab government jobs include PPSC, Punjab Police, education, and state department notifications.",
    keywords: ["Punjab jobs", "PPSC recruitment", "Punjab govt jobs", "Punjab vacancy"],
  },
  {
    slug: "delhi-jobs",
    name: "Delhi Jobs",
    intro:
      "Delhi government jobs include DSSSB, Delhi Police, DDA, municipal, and department vacancies for the capital region.",
    keywords: ["Delhi jobs", "DSSSB vacancy", "Delhi govt jobs", "Delhi recruitment"],
  },
  {
    slug: "rajasthan-jobs",
    name: "Rajasthan Jobs",
    intro:
      "Rajasthan government jobs include RPSC, RSSB, police, teaching, and district-level recruitment notifications.",
    keywords: [
      "Rajasthan jobs",
      "RPSC recruitment",
      "Rajasthan govt jobs",
      "RSSB vacancy",
    ],
  },
  {
    slug: "up-jobs",
    name: "UP Jobs",
    intro:
      "UP government jobs include UPPSC, UPSSSC, police, teaching, and department recruitment across Uttar Pradesh.",
    keywords: ["UP jobs", "UPPSC vacancy", "UP govt jobs", "UPSSSC recruitment"],
  },
];

export const governmentJobs: GovernmentJob[] = [
  {
    id: "gov-1",
    slug: "ssc-cgl-2026",
    title: "SSC CGL 2026 Notification",
    department: "Staff Selection Commission",
    category: "SSC",
    categorySlug: "ssc",
    state: "All India",
    eligibility: "Bachelor's degree from a recognized university",
    ageLimit: "18 to 32 years depending on post",
    applicationFee: "Rs. 100 for General and OBC candidates",
    lastDate: "2026-07-15",
    officialNotificationLink: "https://ssc.gov.in",
    applyLink: "https://ssc.gov.in",
    syllabus:
      "Tier 1 covers General Intelligence, Quantitative Aptitude, General Awareness, and English. Tier 2 includes Maths, Reasoning, English, and subject papers for selected posts.",
    selectionProcess:
      "Tier 1 CBT, Tier 2 CBT, document verification, and post-specific skill tests where applicable.",
    importantDates: [
      "Notification release: 2026-06-11",
      "Application start: 2026-06-11",
      "Last date to apply: 2026-07-15",
      "Tier 1 exam window: September 2026",
    ],
    summary:
      "SSC CGL recruits graduates for central government assistant, inspector, auditor, tax, and ministry roles across India.",
    openings: "Expected to be announced in the official detailed notice",
    salary:
      "Pay Level 4 to Pay Level 8 depending on the post, with government allowances.",
    faq: [
      {
        question: "Who can apply for SSC CGL 2026?",
        answer:
          "Graduates from recognized universities can apply, subject to post-wise age and eligibility criteria in the official notice.",
      },
      {
        question: "What is the selection process for SSC CGL 2026?",
        answer:
          "The selection process includes computer based tests in multiple tiers, followed by document verification and skill tests for some posts.",
      },
    ],
  },
  {
    id: "gov-2",
    slug: "upsc-civil-services-2026",
    title: "UPSC Civil Services Examination 2026",
    department: "Union Public Service Commission",
    category: "UPSC",
    categorySlug: "upsc",
    state: "All India",
    eligibility: "Graduate in any discipline",
    ageLimit: "21 to 32 years with category relaxations",
    applicationFee: "Rs. 100, exempted for eligible reserved categories",
    lastDate: "2026-03-03",
    officialNotificationLink: "https://upsc.gov.in",
    applyLink: "https://upsconline.nic.in",
    syllabus:
      "Prelims covers General Studies and CSAT. Mains includes essay, language papers, General Studies papers, and one optional subject.",
    selectionProcess:
      "Preliminary exam, Main written exam, personality test, and final merit list.",
    importantDates: [
      "Notification release: 2026-02-10",
      "Last date to apply: 2026-03-03",
      "Prelims exam: 2026-05-24",
      "Mains exam: September 2026",
    ],
    summary:
      "UPSC CSE is the flagship recruitment process for IAS, IPS, IFS, and other Group A and Group B services.",
    openings: "Approximate vacancies announced every year in the official UPSC notice",
    salary:
      "As per 7th CPC pay matrix for civil services and allied services after final allotment.",
    faq: [
      {
        question: "Is graduation mandatory for UPSC Civil Services?",
        answer:
          "Yes, candidates must hold a recognized graduate degree before the cut-off mentioned in the official notification.",
      },
      {
        question: "How many stages are there in UPSC CSE?",
        answer:
          "There are three main stages: prelims, mains, and the personality test.",
      },
    ],
  },
  {
    id: "gov-3",
    slug: "ibps-po-2026",
    title: "IBPS PO 2026 Recruitment",
    department: "Institute of Banking Personnel Selection",
    category: "Banking",
    categorySlug: "banking",
    state: "All India",
    eligibility: "Graduate from a recognized university",
    ageLimit: "20 to 30 years",
    applicationFee: "Rs. 850 for General and OBC, concession for reserved categories",
    lastDate: "2026-08-02",
    officialNotificationLink: "https://www.ibps.in",
    applyLink: "https://www.ibps.in",
    syllabus:
      "Prelims covers English, Quantitative Aptitude, and Reasoning. Mains includes Banking Awareness, Data Analysis, English, Reasoning, and descriptive writing.",
    selectionProcess:
      "Preliminary exam, Main exam, interview, and provisional allotment.",
    importantDates: [
      "Notification release: 2026-07-01",
      "Application window: 2026-07-01 to 2026-08-02",
      "Prelims exam: October 2026",
      "Mains exam: November 2026",
    ],
    summary:
      "IBPS PO is one of the most searched banking jobs for graduates targeting public sector bank officer posts.",
    openings: "Vacancies vary by participating banks and are declared in the official notice",
    salary:
      "Bank officer scale with basic pay, allowances, and probation benefits as per participating bank rules.",
    faq: [
      {
        question: "Can final-year students apply for IBPS PO 2026?",
        answer:
          "Only candidates meeting the graduation eligibility by the date specified in the official notice should apply.",
      },
      {
        question: "Does IBPS PO have an interview stage?",
        answer:
          "Yes, shortlisted mains candidates are called for interview before final allotment.",
      },
    ],
  },
  {
    id: "gov-4",
    slug: "rrb-alp-2026",
    title: "RRB ALP 2026 Notification",
    department: "Railway Recruitment Boards",
    category: "Railways",
    categorySlug: "railways",
    state: "All India",
    eligibility: "ITI or Diploma or engineering qualification as per post rules",
    ageLimit: "18 to 30 years",
    applicationFee: "Rs. 500 with applicable refund rules after exam appearance",
    lastDate: "2026-09-05",
    officialNotificationLink: "https://indianrailways.gov.in",
    applyLink: "https://www.rrbcdg.gov.in",
    syllabus:
      "CBT 1 covers Maths, General Intelligence, General Science, and General Awareness. CBT 2 includes technical subjects and trade-related content.",
    selectionProcess:
      "CBT 1, CBT 2, computer based aptitude test for ALP, document verification, and medical examination.",
    importantDates: [
      "Notification release: 2026-08-01",
      "Last date to apply: 2026-09-05",
      "CBT 1 expected: November 2026",
      "Aptitude test: To be notified",
    ],
    summary:
      "RRB ALP is a major railway recruitment for Assistant Loco Pilot positions across railway zones.",
    openings: "To be notified zone-wise in the detailed RRB notice",
    salary: "Level 2 pay matrix plus railway allowances and benefits.",
    faq: [
      {
        question: "What qualification is needed for RRB ALP 2026?",
        answer:
          "Candidates generally need ITI, Diploma, or specified technical qualifications mentioned in the official notice.",
      },
      {
        question: "Is there a medical test in RRB ALP?",
        answer:
          "Yes, candidates must clear the prescribed railway medical standards after document verification.",
      },
    ],
  },
  {
    id: "gov-5",
    slug: "agniveer-gd-2026",
    title: "Army Agniveer GD 2026 Recruitment",
    department: "Indian Army",
    category: "Defence",
    categorySlug: "defence",
    state: "All India",
    eligibility: "10th pass with marks criteria as per Army notification",
    ageLimit: "As per Agniveer age band in the current recruitment cycle",
    applicationFee: "As per official Army recruitment notice",
    lastDate: "2026-04-25",
    officialNotificationLink: "https://joinindianarmy.nic.in",
    applyLink: "https://joinindianarmy.nic.in",
    syllabus:
      "General Knowledge, General Science, Maths, and reasoning topics based on the category and written exam pattern.",
    selectionProcess:
      "Online common entrance exam, physical fitness test, physical measurement test, medical examination, and document verification.",
    importantDates: [
      "Application start: 2026-03-12",
      "Last date to apply: 2026-04-25",
      "Exam date: June 2026 onwards",
      "Recruitment rally schedule: Region-wise",
    ],
    summary:
      "Indian Army Agniveer GD recruitment is a high-demand defence opportunity for candidates targeting soldier entry roles.",
    openings: "Region-wise intake is released in the official recruitment calendar",
    salary: "Agniveer package and benefits as notified by the Indian Army.",
    faq: [
      {
        question: "What is the selection process for Army Agniveer GD?",
        answer:
          "Candidates go through an online exam, physical tests, medical checks, and final document verification.",
      },
      {
        question: "Where should candidates verify Agniveer details?",
        answer:
          "Candidates should verify the latest eligibility, physical standards, and schedule on the official Indian Army recruitment website.",
      },
    ],
  },
  {
    id: "gov-6",
    slug: "delhi-police-constable-2026",
    title: "Delhi Police Constable 2026",
    department: "Delhi Police",
    category: "Police",
    categorySlug: "police",
    state: "Delhi",
    eligibility: "12th pass from a recognized board",
    ageLimit: "18 to 25 years",
    applicationFee: "As per SSC and Delhi Police official notification",
    lastDate: "2026-10-12",
    officialNotificationLink: "https://delhipolice.gov.in",
    applyLink: "https://ssc.gov.in",
    syllabus:
      "Reasoning, General Knowledge, Current Affairs, Numerical Ability, and computer awareness as per constable pattern.",
    selectionProcess:
      "Computer based exam, physical endurance and measurement tests, document verification, and medical examination.",
    importantDates: [
      "Notification expected: September 2026",
      "Last date to apply: 2026-10-12",
      "Exam date: To be announced",
      "Physical test: After written exam shortlist",
    ],
    summary:
      "Delhi Police Constable remains one of the most searched police jobs for 12th pass candidates in North India.",
    openings: "Vacancy count is published with the official Delhi Police and SSC notice",
    salary: "Constable pay level with allowances as applicable in Delhi Police.",
    faq: [
      {
        question: "Is Delhi Police Constable open to 12th pass candidates?",
        answer:
          "Yes, this recruitment is commonly targeted by 12th pass candidates, subject to official eligibility rules.",
      },
      {
        question: "Does Delhi Police Constable include a physical test?",
        answer:
          "Yes, shortlisted candidates must clear physical standards and endurance tests.",
      },
    ],
  },
  {
    id: "gov-7",
    slug: "kvs-tgt-2026",
    title: "KVS TGT Recruitment 2026",
    department: "Kendriya Vidyalaya Sangathan",
    category: "Teaching",
    categorySlug: "teaching",
    state: "All India",
    eligibility: "Graduate with B.Ed. and subject-specific qualification",
    ageLimit: "As per KVS recruitment rules",
    applicationFee: "To be confirmed in the official KVS advertisement",
    lastDate: "2026-11-08",
    officialNotificationLink: "https://kvsangathan.nic.in",
    applyLink: "https://kvsangathan.nic.in",
    syllabus:
      "Subject knowledge, pedagogy, reasoning, Hindi, English, and teaching methodology based on KVS exam pattern.",
    selectionProcess:
      "Written exam, interview or demo teaching where applicable, and document verification.",
    importantDates: [
      "Notification expected: October 2026",
      "Last date to apply: 2026-11-08",
      "Exam date: To be announced",
      "Interview schedule: Post written shortlist",
    ],
    summary:
      "KVS TGT recruitment attracts teaching aspirants looking for central school jobs with stable career growth.",
    openings: "Post-wise and subject-wise vacancies will be listed in the official notice",
    salary: "Pay level for TGT posts with central government allowances.",
    faq: [
      {
        question: "What qualification is required for KVS TGT 2026?",
        answer:
          "Candidates usually need a graduate degree, B.Ed., and subject-specific eligibility as per the official advertisement.",
      },
      {
        question: "Is there an interview in KVS TGT recruitment?",
        answer:
          "The exact selection stages depend on the official notification and can include written and interview components.",
      },
    ],
  },
  {
    id: "gov-8",
    slug: "bpsc-block-agriculture-officer-2026",
    title: "BPSC Block Agriculture Officer 2026",
    department: "Bihar Public Service Commission",
    category: "State Government",
    categorySlug: "state-government",
    state: "Bihar",
    eligibility: "B.Sc. Agriculture or equivalent qualification",
    ageLimit: "As per BPSC category-wise rules",
    applicationFee: "As per BPSC official fee schedule",
    lastDate: "2026-07-28",
    officialNotificationLink: "https://bpsc.bih.nic.in",
    applyLink: "https://onlinebpsc.bihar.gov.in",
    syllabus:
      "Agriculture subject knowledge, general studies, current affairs, and administrative basics as defined by BPSC.",
    selectionProcess:
      "Written examination, interview where applicable, and document verification.",
    importantDates: [
      "Notification release: 2026-06-20",
      "Last date to apply: 2026-07-28",
      "Exam date: To be notified",
      "Admit card: Before the exam",
    ],
    summary:
      "This state government recruitment is suitable for agriculture graduates looking for department-level officer roles.",
    openings: "Detailed vacancy distribution is available in the BPSC notice",
    salary: "As per Bihar government pay scale for Block Agriculture Officer posts.",
    faq: [
      {
        question: "Which candidates should track BPSC BAO 2026?",
        answer:
          "Agriculture graduates interested in state department officer posts should follow this recruitment closely.",
      },
      {
        question: "Where is the official BPSC BAO application link available?",
        answer:
          "Candidates should use the BPSC official website and application portal only.",
      },
    ],
  },
  {
    id: "gov-9",
    slug: "hssc-cet-group-c-2026",
    title: "HSSC CET Group C 2026",
    department: "Haryana Staff Selection Commission",
    category: "Haryana Jobs",
    categorySlug: "haryana-jobs",
    state: "Haryana",
    eligibility: "12th pass or graduation depending on post",
    ageLimit: "18 to 42 years as per Haryana rules",
    applicationFee: "As per HSSC CET official notice",
    lastDate: "2026-08-18",
    officialNotificationLink: "https://hssc.gov.in",
    applyLink: "https://onetimeregn.haryana.gov.in",
    syllabus:
      "General awareness, Haryana GK, reasoning, maths, science, English, Hindi, and post-specific requirements.",
    selectionProcess:
      "CET score, post-wise shortlisting, document verification, and additional stages where notified.",
    importantDates: [
      "Notification release: 2026-07-22",
      "Last date to apply: 2026-08-18",
      "Exam date: To be announced",
      "Result: After evaluation cycle",
    ],
    summary:
      "HSSC CET is a major gateway for Haryana government Group C posts and local recruitment demand.",
    openings: "Category-wise posts are notified through HSSC recruitment advertisements",
    salary: "As per Haryana government pay matrix for the notified posts.",
    faq: [
      {
        question: "Is Haryana CET required for many Group C posts?",
        answer:
          "Yes, CET is used as an important screening stage for several Haryana Group C recruitments.",
      },
      {
        question: "Does HSSC CET include Haryana GK?",
        answer:
          "Yes, Haryana GK is commonly included in the exam syllabus and should be prepared carefully.",
      },
    ],
  },
  {
    id: "gov-10",
    slug: "punjab-police-constable-2026",
    title: "Punjab Police Constable 2026",
    department: "Punjab Police",
    category: "Punjab Jobs",
    categorySlug: "punjab-jobs",
    state: "Punjab",
    eligibility: "12th pass or equivalent qualification",
    ageLimit: "18 to 28 years",
    applicationFee: "As per Punjab Police official recruitment portal",
    lastDate: "2026-09-14",
    officialNotificationLink: "https://punjabpolice.gov.in",
    applyLink: "https://www.punjabpolicerecruitment.in",
    syllabus:
      "Reasoning, quantitative aptitude, language comprehension, digital literacy, and Punjab-specific awareness.",
    selectionProcess:
      "Written exam, physical screening test, physical measurement test, and document verification.",
    importantDates: [
      "Notification release: 2026-08-10",
      "Application close: 2026-09-14",
      "Written exam: To be announced",
      "Physical test: After shortlist",
    ],
    summary:
      "Punjab Police Constable is a popular state-level recruitment for candidates targeting uniformed service roles.",
    openings: "Vacancy count is published in the official recruitment advertisement",
    salary: "Punjab Police constable pay and allowances as per state norms.",
    faq: [
      {
        question: "What are the major stages in Punjab Police Constable recruitment?",
        answer:
          "Candidates generally face a written test followed by physical tests and document verification.",
      },
      {
        question: "Should candidates use third-party links for Punjab Police application?",
        answer:
          "No, candidates should always verify and apply only through the official Punjab Police recruitment portal.",
      },
    ],
  },
  {
    id: "gov-11",
    slug: "dsssb-pgt-2026",
    title: "DSSSB PGT Recruitment 2026",
    department: "Delhi Subordinate Services Selection Board",
    category: "Delhi Jobs",
    categorySlug: "delhi-jobs",
    state: "Delhi",
    eligibility: "Postgraduate degree with B.Ed. as per subject requirement",
    ageLimit: "As per DSSSB post rules",
    applicationFee: "As per DSSSB online application notice",
    lastDate: "2026-10-01",
    officialNotificationLink: "https://dsssb.delhi.gov.in",
    applyLink: "https://dsssbonline.nic.in",
    syllabus:
      "General awareness, reasoning, numerical ability, language sections, and subject-specific teaching content.",
    selectionProcess:
      "Tier-based written exam, document verification, and department allocation as applicable.",
    importantDates: [
      "Notification release: 2026-09-02",
      "Application end date: 2026-10-01",
      "Exam schedule: To be notified",
      "Admit card release: Before exam",
    ],
    summary:
      "DSSSB PGT recruitment serves candidates looking for Delhi teaching jobs in government schools and institutions.",
    openings: "Subject-wise PGT vacancies are detailed in the official DSSSB notice",
    salary: "Delhi government PGT pay scale with admissible allowances.",
    faq: [
      {
        question: "Which candidates should track DSSSB PGT 2026?",
        answer:
          "Postgraduates with teaching qualifications who want Delhi government school teaching jobs should track this page.",
      },
      {
        question: "Is the DSSSB PGT syllabus subject specific?",
        answer:
          "Yes, in addition to general sections, subject-specific preparation is important for these posts.",
      },
    ],
  },
  {
    id: "gov-12",
    slug: "rpsc-second-grade-teacher-2026",
    title: "RPSC Second Grade Teacher 2026",
    department: "Rajasthan Public Service Commission",
    category: "Rajasthan Jobs",
    categorySlug: "rajasthan-jobs",
    state: "Rajasthan",
    eligibility: "Graduate or postgraduate with B.Ed. and subject eligibility",
    ageLimit: "18 to 40 years with relaxations",
    applicationFee: "As per Rajasthan recruitment fee categories",
    lastDate: "2026-09-21",
    officialNotificationLink: "https://rpsc.rajasthan.gov.in",
    applyLink: "https://sso.rajasthan.gov.in",
    syllabus:
      "Paper 1 includes Rajasthan GK, current affairs, and educational psychology. Paper 2 covers subject-specific content and pedagogy.",
    selectionProcess:
      "Written examination, document verification, and final merit list.",
    importantDates: [
      "Notification release: 2026-08-26",
      "Last date to apply: 2026-09-21",
      "Exam date: To be announced",
      "Result: After commission evaluation",
    ],
    summary:
      "RPSC Second Grade Teacher is one of the highest-interest Rajasthan teaching recruitments for subject teachers.",
    openings: "Detailed vacancy breakup is released by subject and category",
    salary: "Rajasthan government teacher pay scale as per notified post.",
    faq: [
      {
        question: "What is covered in RPSC Second Grade syllabus?",
        answer:
          "The syllabus generally includes Rajasthan GK, educational psychology, and subject-specific content in separate papers.",
      },
      {
        question: "Where should candidates apply for RPSC Second Grade Teacher 2026?",
        answer:
          "Candidates should apply through the official Rajasthan SSO and RPSC systems only.",
      },
    ],
  },
  {
    id: "gov-13",
    slug: "uppsc-ro-aro-2026",
    title: "UPPSC RO ARO 2026 Recruitment",
    department: "Uttar Pradesh Public Service Commission",
    category: "UP Jobs",
    categorySlug: "up-jobs",
    state: "Uttar Pradesh",
    eligibility: "Graduate with post-specific computer or typing eligibility where required",
    ageLimit: "21 to 40 years",
    applicationFee: "As per UPPSC category-wise application fee",
    lastDate: "2026-08-30",
    officialNotificationLink: "https://uppsc.up.nic.in",
    applyLink: "https://uppsc.up.nic.in",
    syllabus:
      "General Studies, General Hindi, drafting, office procedure, and objective sections as prescribed by UPPSC.",
    selectionProcess:
      "Prelims, mains, typing or skill test if applicable, and document verification.",
    importantDates: [
      "Notification release: 2026-07-29",
      "Last date to apply: 2026-08-30",
      "Prelims exam: To be announced",
      "Mains exam: After shortlist",
    ],
    summary:
      "UPPSC RO ARO is a strong fit for graduates targeting Uttar Pradesh secretariat and review officer roles.",
    openings: "Post-wise vacancy totals are declared in the UPPSC notification",
    salary: "UP government pay matrix for Review Officer and Assistant Review Officer posts.",
    faq: [
      {
        question: "Is a typing test required for UPPSC RO ARO?",
        answer:
          "Some posts may include additional skill or typing requirements, so candidates should verify the official rules carefully.",
      },
      {
        question: "What should candidates focus on for UPPSC RO ARO preparation?",
        answer:
          "Candidates should focus on General Studies, Hindi, office procedure, and the latest official exam pattern.",
      },
    ],
  },
];

export const governmentJobsDisclaimer =
  "Always verify details from the official website before applying.";

export function getGovernmentJobBySlug(slug: string) {
  return governmentJobs.find((job) => job.slug === slug);
}

export function getGovernmentJobCategoryBySlug(slug: string) {
  return governmentJobCategories.find((category) => category.slug === slug);
}

export function getGovernmentJobsByCategory(categorySlug: string) {
  return governmentJobs.filter((job) => job.categorySlug === categorySlug);
}

export function getRelatedGovernmentJobs(currentSlug: string, categorySlug: string) {
  return governmentJobs.filter(
    (job) => job.slug !== currentSlug && job.categorySlug === categorySlug,
  );
}
