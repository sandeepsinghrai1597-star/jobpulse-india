export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export function parseDelimitedList(value: string, delimiters = /[\n,]/) {
  return value
    .split(delimiters)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeWorkMode(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "remote" || normalized === "hybrid" || normalized === "onsite") {
    return normalized;
  }
  if (normalized === "on-site" || normalized === "on site" || normalized === "office") {
    return "onsite";
  }
  return "onsite";
}

export function normalizeJobType(value: string) {
  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case "full time":
    case "full-time":
      return "full-time";
    case "part time":
    case "part-time":
      return "part-time";
    case "contract":
      return "contract";
    case "freelance":
      return "freelance";
    case "internship":
    case "intern":
      return "internship";
    case "walk in":
    case "walk-in":
      return "walk-in";
    default:
      return "full-time";
  }
}

export function normalizeSalaryType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "monthly" || normalized === "yearly" || normalized === "stipend") {
    return normalized;
  }
  if (normalized === "month" || normalized === "per month") {
    return "monthly";
  }
  if (normalized === "year" || normalized === "per year" || normalized === "annual") {
    return "yearly";
  }
  return "yearly";
}

export function parseInteger(value: string, fallback = 0) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current);
      if (row.some((cell) => cell.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.trim().length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

export function normalizeCsvHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)+/g, "");
}
