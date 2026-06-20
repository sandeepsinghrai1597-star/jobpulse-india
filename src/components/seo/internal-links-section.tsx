import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function InternalLinksSection({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links: Array<{ href: string; label: string }>;
}) {
  if (!links.length) {
    return null;
  }

  return (
    <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary/30 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
