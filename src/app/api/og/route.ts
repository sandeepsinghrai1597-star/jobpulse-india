export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = url.searchParams.get("title") || "Job at Company";
  const company = url.searchParams.get("company") || "JobPulse India";

  const safeTitle = escapeHtml(title);
  const safeCompany = escapeHtml(company);

  const svg = `<?xml version="1.0" encoding="utf-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="g" x1="0" x2="1">
        <stop offset="0%" stop-color="#06b6d4" />
        <stop offset="100%" stop-color="#7c3aed" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <g font-family="Inter, Roboto, system-ui, -apple-system, 'Segoe UI', Arial">
      <text x="60" y="220" font-size="48" fill="#fff" font-weight="700">${safeTitle}</text>
      <text x="60" y="300" font-size="32" fill="#fff" opacity="0.9">${safeCompany}</text>
    </g>
  </svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeHtml(str: string) {
  return str.replace(/[&<>\"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;'
  }[c] as string));
}
