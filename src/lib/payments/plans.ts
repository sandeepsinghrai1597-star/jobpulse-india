import type { UserRole } from "@/types";

export type PaidPlanId = "candidate-pro" | "employer-basic" | "employer-pro";
export type FreePlanId = "candidate-free" | "employer-free";
export type PlanId = PaidPlanId | FreePlanId;

export interface PricingPlanDefinition {
  id: PlanId;
  audience: Exclude<UserRole, "admin">;
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface PaidPlanDefinition extends PricingPlanDefinition {
  id: PaidPlanId;
  amountInRupees: number;
  billingInterval: "month";
}

export const publicPricingPlans: PricingPlanDefinition[] = [
  {
    id: "candidate-free",
    audience: "candidate",
    name: "Free",
    priceLabel: "₹0",
    description: "For candidates who want to explore jobs and start building their profile.",
    features: [
      "Search jobs",
      "Save jobs",
      "Basic AI career chat",
      "Basic resume builder",
    ],
    cta: "Start free",
  },
  {
    id: "candidate-pro",
    audience: "candidate",
    name: "Pro",
    priceLabel: "₹199/month",
    description: "For candidates actively improving resumes, interview readiness, and job-fit clarity.",
    features: [
      "Resume ATS analyzer",
      "AI resume improvement",
      "Mock interview practice",
      "Priority WhatsApp alerts",
      "Advanced career roadmap",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    id: "employer-free",
    audience: "employer",
    name: "Free",
    priceLabel: "₹0",
    description: "For employers testing JobPulse with a single opening.",
    features: ["1 job post"],
    cta: "Start free",
  },
  {
    id: "employer-basic",
    audience: "employer",
    name: "Basic",
    priceLabel: "₹999/month",
    description: "For growing teams that need posting capacity and a cleaner hiring workflow.",
    features: [
      "5 job posts",
      "Applicant management",
      "Basic analytics",
    ],
    cta: "Choose Basic",
  },
  {
    id: "employer-pro",
    audience: "employer",
    name: "Pro",
    priceLabel: "₹2999/month",
    description: "For active hiring teams that want sourcing power, AI help, and premium reach.",
    features: [
      "Unlimited job posts",
      "Featured listings",
      "Candidate search",
      "AI shortlisting",
      "Advanced analytics",
    ],
    cta: "Choose Pro",
  },
];

export const paidPlans: Record<PaidPlanId, PaidPlanDefinition> = {
  "candidate-pro": {
    id: "candidate-pro",
    audience: "candidate",
    name: "Pro",
    priceLabel: "₹199/month",
    description: "For candidates actively improving resumes, interview readiness, and job-fit clarity.",
    features: [
      "Resume ATS analyzer",
      "AI resume improvement",
      "Mock interview practice",
      "Priority WhatsApp alerts",
      "Advanced career roadmap",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
    amountInRupees: 199,
    billingInterval: "month",
  },
  "employer-basic": {
    id: "employer-basic",
    audience: "employer",
    name: "Basic",
    priceLabel: "₹999/month",
    description: "For growing teams that need posting capacity and a cleaner hiring workflow.",
    features: [
      "5 job posts",
      "Applicant management",
      "Basic analytics",
    ],
    cta: "Choose Basic",
    amountInRupees: 999,
    billingInterval: "month",
  },
  "employer-pro": {
    id: "employer-pro",
    audience: "employer",
    name: "Pro",
    priceLabel: "₹2999/month",
    description: "For active hiring teams that want sourcing power, AI help, and premium reach.",
    features: [
      "Unlimited job posts",
      "Featured listings",
      "Candidate search",
      "AI shortlisting",
      "Advanced analytics",
    ],
    cta: "Choose Pro",
    amountInRupees: 2999,
    billingInterval: "month",
  },
};

export function getPaidPlanDefinition(planId: PaidPlanId) {
  return paidPlans[planId];
}

export function getAllowedPaidPlans(role: UserRole): PaidPlanId[] {
  if (role === "candidate") {
    return ["candidate-pro"];
  }

  if (role === "employer") {
    return ["employer-basic", "employer-pro"];
  }

  return [];
}

export function getPublicPlansForAudience(audience: Exclude<UserRole, "admin">) {
  return publicPricingPlans.filter((plan) => plan.audience === audience);
}
