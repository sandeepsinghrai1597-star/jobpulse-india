import { NextResponse, type NextRequest } from "next/server";

export function rejectUnauthorizedCronRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, message: "Cron secret is not configured. Refusing to run scheduled work." },
      { status: 503 },
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized cron request." },
      { status: 401 },
    );
  }

  return null;
}
