import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About",
  description: "Learn about JobPulse India and the product mission behind the platform.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur p-8">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">About JobPulse India</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          JobPulse India is designed as an AI career companion for Indian students, freshers, job seekers, and recruiters who need faster, clearer, and more trustworthy workflows than a basic job board can offer.
        </p>
      </div>
    </div>
  );
}
