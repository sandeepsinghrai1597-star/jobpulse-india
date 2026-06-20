import Link from "next/link";
import { siteConfig } from "@/lib/data/site";

const footerColumns = [
  {
    title: "Jobs by city",
    links: ["Jobs in Delhi", "Jobs in Chandigarh", "Jobs in Gurgaon", "Jobs in Bangalore"],
  },
  {
    title: "Jobs by qualification",
    links: ["10th pass jobs", "12th pass jobs", "BCA fresher jobs", "MBA fresher jobs"],
  },
  {
    title: "Jobs by category",
    links: ["Remote jobs", "Government jobs", "Internships", "Learning roadmap"],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_repeat(3,1fr)] lg:px-8">
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-semibold">{siteConfig.name}</h3>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Search jobs, improve resumes, prepare for interviews, and build your next career move with AI-powered guidance built for India.
          </p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title} className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-950">{column.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 {siteConfig.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/learning-roadmap">Roadmaps</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
