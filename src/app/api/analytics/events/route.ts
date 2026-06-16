import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { analyticsEventSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true, mode: "noop" });
  }

  const body = await request.json();
  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await getCurrentUser();

  const { error } = await admin.from("analytics_events").insert({
    user_id: user?.id ?? null,
    session_id: parsed.data.sessionId ?? null,
    event_name: parsed.data.eventName,
    event_data: parsed.data.eventData,
  } as never);

  if (error) {
    return NextResponse.json({ message: "Analytics event persistence failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
