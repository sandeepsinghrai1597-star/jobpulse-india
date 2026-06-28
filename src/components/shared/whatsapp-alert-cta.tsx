import Link from "next/link";

export function WhatsAppAlertCTA({ category }: { category?: string }) {
  return (
    <div className="rounded-[1.5rem] border border-green-200 bg-green-50 p-5 my-6">
      <p className="font-semibold text-green-900">
        Get {category ? `${category} ` : ""}job alerts on WhatsApp
      </p>
      <p className="mt-1 text-sm text-green-700">
        Join candidates getting daily government job updates — free, no spam.
      </p>
      <Link
        href="https://whatsapp.com/channel/0029Vb7TfU0BqbrFoeCC0J0V"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
      >
        Follow on WhatsApp →
      </Link>
    </div>
  );
}
