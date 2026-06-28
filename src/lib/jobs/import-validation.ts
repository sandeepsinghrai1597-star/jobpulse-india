const INVALID_URL_PATTERNS = [
  "grok.com",
  "/apply/data-scientist",
  "hkrn-cnc-operator",
  "pgimer-recruitment",
  "sgpgi-non-teaching",
];

const LOCATION_PROSE_PATTERNS = [
  /\bhistory,\s*culture,\s*festivals\b/i,
  /\b(click here|read more|apply online|official notification)\b/i,
];

export function sanitizeImportedUrl(value: string | null | undefined) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const normalized = parsed.toString();
  const lowered = normalized.toLowerCase();
  if (INVALID_URL_PATTERNS.some((pattern) => lowered.includes(pattern))) {
    return null;
  }

  return normalized;
}

export function sanitizeImportedLocation(value: string | null | undefined) {
  if (!value) return null;

  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;

  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount > 5 || LOCATION_PROSE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return null;
  }

  return trimmed;
}

export function getImportValidationWarnings(input: {
  title?: string | null;
  applyUrl?: string | null;
  sourceUrl?: string | null;
  notificationUrl?: string | null;
  city?: string | null;
  state?: string | null;
}) {
  const warnings: string[] = [];
  const title = input.title ?? "Untitled";

  if (input.applyUrl && !sanitizeImportedUrl(input.applyUrl)) {
    warnings.push(`Invalid apply URL removed for "${title}": ${input.applyUrl}`);
  }

  if (input.sourceUrl && !sanitizeImportedUrl(input.sourceUrl)) {
    warnings.push(`Invalid source URL removed for "${title}": ${input.sourceUrl}`);
  }

  if (input.notificationUrl && !sanitizeImportedUrl(input.notificationUrl)) {
    warnings.push(`Invalid notification URL removed for "${title}": ${input.notificationUrl}`);
  }

  if (input.city && !sanitizeImportedLocation(input.city)) {
    warnings.push(`Invalid city removed for "${title}": ${input.city}`);
  }

  if (input.state && !sanitizeImportedLocation(input.state)) {
    warnings.push(`Invalid state removed for "${title}": ${input.state}`);
  }

  return warnings;
}
