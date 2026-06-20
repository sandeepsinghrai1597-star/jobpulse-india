import { absoluteUrl, jsonLd } from "@/lib/seo";

function normalizeSchemaUrls(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeSchemaUrls);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => {
      if (
        typeof entryValue === "string" &&
        (key === "url" || key === "item") &&
        entryValue.startsWith("/") &&
        !entryValue.startsWith("//")
      ) {
        return [key, absoluteUrl(entryValue)];
      }

      return [key, normalizeSchemaUrls(entryValue)];
    }),
  );
}

export function SchemaScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd(normalizeSchemaUrls(data) as Record<string, unknown>),
      }}
    />
  );
}
