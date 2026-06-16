import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { SchemaScript } from "@/components/shared/schema-script";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) {
    return buildMetadata({
      title: "Article not found",
      description: "The blog article could not be found.",
      path: `/blog/${slug}`,
    });
  }

  return buildMetadata({
    title: post.metaTitle,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SchemaScript
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.metaDescription,
          datePublished: post.publishedAt,
        }}
      />
      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {post.category}
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight">{post.title}</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">{post.content}</p>
      </div>
    </article>
  );
}
