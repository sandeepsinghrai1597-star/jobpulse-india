import Link from "next/link";
import type { BlogPost } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export function BlogArticleCta({ post }: { post: BlogPost }) {
  if (!post.ctaLinks?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">Take the next step</h2>
        <p className="text-sm leading-6 text-slate-600">
          Turn this advice into action with tools built for job seekers.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {post.ctaLinks.map((link) => (
          <Link key={link.href} href={link.href} className="block">
            <Card className="h-full rounded-[1.75rem] border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/25">
              <CardContent className="space-y-3 p-6">
                <h3 className="font-heading text-xl font-semibold text-slate-950">{link.label}</h3>
                <p className="text-sm leading-6 text-slate-600">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

