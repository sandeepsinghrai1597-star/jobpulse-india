import Link from "next/link";
import { blogPosts } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Blog",
  description:
    "Career guides, resume tips, interview advice, and job search content built for Google-friendly discovery.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Blog"
        title="Career content with built-in SEO intent"
        description="Every article is positioned to support internal linking, category discovery, and long-tail job seeker queries."
      />
      <div className="mt-8 space-y-6">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur transition hover:border-primary/30">
              <CardContent className="space-y-3 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  {post.category}
                </p>
                <h2 className="font-heading text-2xl font-semibold">{post.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
