import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Privacy commitments for candidate, employer, and analytics data on JobPulse India.",
  path: "/privacy-policy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur p-8">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          This platform is designed to store only the data required for job discovery, application tracking, AI guidance, recruiter workflows, and analytics. Production deployments should pair this page with live legal review before launch.
        </p>
      </div>
    </div>
  );
}
