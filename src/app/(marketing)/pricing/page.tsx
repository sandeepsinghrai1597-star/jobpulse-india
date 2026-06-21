import { getCurrentUser } from "@/lib/auth/current-user";
import { getPublicPlansForAudience } from "@/lib/payments/plans";
import { buildMetadata } from "@/lib/seo";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata = buildMetadata({
  title: "Pricing",
  description:
    "Candidate and employer plans for AI career guidance, resume tools, job posting, featured listings, and analytics.",
  path: "/pricing",
});

export default async function PricingPage() {
  const user = await getCurrentUser();
  const candidatePlans = getPublicPlansForAudience("candidate");
  const employerPlans = getPublicPlansForAudience("employer");
  const paymentsEnabled = Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Pricing"
        title="Pricing that mirrors how candidates and employers actually grow"
        description="Choose a lightweight free tier or unlock paid workflows for resume optimization, interviews, hiring reach, and analytics."
        as="h1"
      />
      <div className="mt-8">
        <PricingPlans
          candidatePlans={candidatePlans}
          employerPlans={employerPlans}
          currentRole={user?.role ?? null}
          currentPlan={user?.currentPlan ?? null}
          paymentsEnabled={paymentsEnabled}
        />
      </div>
    </div>
  );
}
