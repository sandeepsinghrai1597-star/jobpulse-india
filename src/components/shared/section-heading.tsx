export function SectionHeading({
  eyebrow,
  title,
  description,
  as: HeadingTag = "h2",
}: {
  eyebrow: string;
  title: string;
  description: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>
      <HeadingTag className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {title}
      </HeadingTag>
      <p className="text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
