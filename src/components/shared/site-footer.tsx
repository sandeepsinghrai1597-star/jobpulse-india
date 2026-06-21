import Link from "next/link";
import { siteConfig } from "@/lib/data/site";

const footerColumns = [
  {
    title: "Jobs by city",
    links: [
      { href: "/jobs-in-delhi", label: "Jobs in Delhi" },
      { href: "/jobs-in-chandigarh", label: "Jobs in Chandigarh" },
      { href: "/jobs-in-mohali", label: "Jobs in Mohali" },
      { href: "/jobs-in-bangalore", label: "Jobs in Bangalore" },
    ],
  },
  {
    title: "Jobs by qualification",
    links: [
      { href: "/10th-pass-jobs", label: "10th pass jobs" },
      { href: "/12th-pass-jobs", label: "12th pass jobs" },
      { href: "/bca-fresher-jobs", label: "BCA fresher jobs" },
      { href: "/fresher-jobs", label: "Fresher jobs" },
    ],
  },
  {
    title: "Jobs by category",
    links: [
      { href: "/remote-jobs-india", label: "Remote jobs" },
      { href: "/government-jobs", label: "Government jobs" },
      { href: "/internships", label: "Internships" },
      { href: "/learning-roadmap", label: "Learning roadmap" },
    ],
  },
] as const;

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
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>&copy; 2026 {siteConfig.name}. All rights reserved.</p>
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
