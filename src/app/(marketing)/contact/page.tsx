import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Contact JobPulse India for support, recruiter onboarding, and partnerships.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur p-8">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Reach the team for support, employer onboarding, content partnerships, and platform feedback at support@jobpulseindia.in.
        </p>
      </div>
    </div>
  );
}
