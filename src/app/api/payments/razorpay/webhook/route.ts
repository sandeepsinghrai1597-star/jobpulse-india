import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { activateSubscriptionFromPayment, mergePaymentNotes, type PaymentRecord } from "@/lib/payments/subscriptions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function verifySignature(body: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expected.length !== signature.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ message: "Invalid Razorpay webhook signature." }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { message: "Webhook received, but Supabase admin client is not configured." },
      { status: 503 },
    );
  }

  const payload = JSON.parse(body) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          status?: string;
        };
      };
    };
  };

  const payment = payload.payload?.payment?.entity;
  const orderId = payment?.order_id;

  if (!orderId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const mappedStatus =
    payload.event === "payment.captured"
      ? "paid"
      : payload.event === "payment.failed"
        ? "failed"
        : payment?.status ?? "created";

  const { data: paymentRowData } = await admin
    .from("payments")
    .select("id, user_id, plan, notes, subscription_type")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  const paymentRow = paymentRowData as PaymentRecord | null;

  const paymentNotes = mergePaymentNotes(paymentRow?.notes ?? {}, {
    webhook_event: payload.event ?? "unknown",
    webhook_received_at: new Date().toISOString(),
  });

  await admin
    .from("payments")
    .update({
      status: mappedStatus,
      razorpay_payment_id: payment?.id ?? null,
      razorpay_signature: signature,
      notes: paymentNotes,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("razorpay_order_id", orderId);

  if (mappedStatus === "paid" && paymentRow) {
    await activateSubscriptionFromPayment(admin, {
      ...(paymentRow as PaymentRecord),
      notes: paymentNotes,
    });
  }

  await recordAnalyticsEvent({
    userId: paymentRow?.user_id ?? null,
    paymentId: paymentRow?.id ?? null,
    eventName: "payment_event",
    eventData: {
      status: mappedStatus,
      plan: paymentRow?.plan ?? null,
      source: "webhook",
      razorpayEvent: payload.event ?? "unknown",
    },
  });

  return NextResponse.json({ ok: true });
}
