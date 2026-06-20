import type { SeoFaq } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export function FaqSection({ faqs }: { faqs: SeoFaq[] }) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">FAQs</h2>
        <p className="text-sm leading-6 text-slate-600">
          These questions are rendered on-page and mirrored in structured data for stronger search visibility.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <Card key={faq.question} className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-6">
              <h3 className="text-lg font-semibold text-slate-950">{faq.question}</h3>
              <p className="text-sm leading-6 text-slate-600">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
