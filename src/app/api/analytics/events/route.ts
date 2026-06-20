import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { analyticsEventSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await getCurrentUser();

  const result = await recordAnalyticsEvent({
    userId: user?.id ?? null,
    candidateId: parsed.data.candidateId ?? null,
    employerId: parsed.data.employerId ?? null,
    jobId: parsed.data.jobId ?? null,
    paymentId: parsed.data.paymentId ?? null,
    sessionId: parsed.data.sessionId ?? undefined,
    eventName: parsed.data.eventName,
    eventData: parsed.data.eventData,
  });

  if (!result.ok) {
    return NextResponse.json({ message: "Analytics event persistence failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
