import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { activateSubscriptionFromPayment, mergePaymentNotes, type PaymentRecord } from "@/lib/payments/subscriptions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { paymentVerificationSchema } from "@/lib/validation/schemas";

function buildSignature(orderId: string, paymentId: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    return null;
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

function matchesSignature(expected: string | null, actual: string) {
  if (!expected || expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in before verifying a payment." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = paymentVerificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();

  if (!admin) {
    return NextResponse.json(
      { message: "Supabase admin credentials are required to verify payments." },
      { status: 503 },
    );
  }

  const { data: paymentData, error: paymentError } = await admin
    .from("payments")
    .select("id, user_id, plan, notes, subscription_type, status")
    .eq("razorpay_order_id", parsed.data.orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  const payment = paymentData as (PaymentRecord & { status: string | null }) | null;

  if (paymentError) {
    return NextResponse.json({ message: "Unable to read the payment record." }, { status: 500 });
  }

  if (!payment) {
    return NextResponse.json({ message: "Payment order not found for this account." }, { status: 404 });
  }

  if (parsed.data.status === "failed") {
    const { error } = await admin
      .from("payments")
      .update({
        status: "failed",
        notes: mergePaymentNotes(payment.notes, {
          failure_code: parsed.data.errorCode ?? null,
          failure_description: parsed.data.errorDescription ?? null,
          failure_reason: parsed.data.errorReason ?? null,
          failure_marked_at: new Date().toISOString(),
        }),
      } as never)
      .eq("id", payment.id);

    if (error) {
      return NextResponse.json({ message: "Failed to update payment status." }, { status: 500 });
    }

    await recordAnalyticsEvent({
      userId: user.id,
      paymentId: payment.id,
      eventName: "payment_event",
      eventData: {
        status: "failed",
        plan: payment.plan,
        source: "client_verify",
      },
    });

    return NextResponse.json({ ok: true, status: "failed" });
  }

  const paymentNotes = mergePaymentNotes(payment.notes, {
    verified_at: new Date().toISOString(),
    verification_source: "client_callback",
  });
  const expectedSignature = buildSignature(parsed.data.orderId, parsed.data.paymentId);

  if (!matchesSignature(expectedSignature, parsed.data.signature)) {
    return NextResponse.json({ message: "Invalid Razorpay payment signature." }, { status: 400 });
  }

  const { error: updateError } = await admin
    .from("payments")
    .update({
      status: "paid",
      razorpay_payment_id: parsed.data.paymentId,
      razorpay_signature: parsed.data.signature,
      notes: paymentNotes,
    } as never)
    .eq("id", payment.id);

  if (updateError) {
    return NextResponse.json({ message: "Failed to save the verified payment." }, { status: 500 });
  }

  try {
    await activateSubscriptionFromPayment(admin, {
      ...(payment as PaymentRecord),
      notes: paymentNotes,
    });
  } catch {
    return NextResponse.json(
      { message: "Payment was verified, but the subscription could not be activated." },
      { status: 500 },
    );
  }

  await recordAnalyticsEvent({
    userId: user.id,
    paymentId: payment.id,
    eventName: "payment_event",
    eventData: {
      status: "paid",
      plan: payment.plan,
      source: "client_verify",
    },
  });

  return NextResponse.json({
    ok: true,
    status: "paid",
    plan: payment.plan,
  });
}
