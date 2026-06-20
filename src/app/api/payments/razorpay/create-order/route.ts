import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAllowedPaidPlans, getPaidPlanDefinition } from "@/lib/payments/plans";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { paymentRequestSchema } from "@/lib/validation/schemas";

let razorpayClient: Razorpay | null = null;

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in before starting a payment." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = paymentRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const allowedPlans = getAllowedPaidPlans(user.role);

  if (!allowedPlans.includes(parsed.data.plan)) {
    return NextResponse.json(
      { message: "This plan is not available for your account role." },
      { status: 403 },
    );
  }

  const plan = getPaidPlanDefinition(parsed.data.plan);

  const client = getRazorpay();
  const admin = getSupabaseAdminClient();

  if (!client || !admin) {
    return NextResponse.json(
      { message: "Razorpay and Supabase admin credentials must be configured before accepting payments." },
      { status: 503 },
    );
  }

  const receipt = `${parsed.data.plan}-${Date.now()}`;
  const order = await client.orders.create({
    amount: plan.amountInRupees * 100,
    currency: "INR",
    receipt,
    notes: {
      user_id: user.id,
      role: user.role,
      plan: parsed.data.plan,
      ...parsed.data.notes,
    },
  });

  const { data: paymentRecord, error } = await admin.from("payments").insert({
    user_id: user.id,
    amount: plan.amountInRupees,
    plan: parsed.data.plan,
    subscription_type: user.role,
    razorpay_order_id: order.id,
    status: "created",
    notes: {
      receipt,
      role: user.role,
      plan_name: plan.name,
      billing_interval: plan.billingInterval,
      ...parsed.data.notes,
    },
  } as never)
  .select("id")
  .single();
  const createdPayment = paymentRecord as { id: string } | null;

  if (error) {
    return NextResponse.json(
      { message: "Payment order was created but persistence failed." },
      { status: 500 },
    );
  }

  await recordAnalyticsEvent({
    userId: user.id,
    paymentId: createdPayment?.id ?? null,
    eventName: "payment_event",
    eventData: {
      status: "created",
      plan: parsed.data.plan,
      amount: plan.amountInRupees,
      source: "create_order",
    },
  });

  return NextResponse.json({
    order,
    keyId: process.env.RAZORPAY_KEY_ID,
    plan: {
      id: plan.id,
      name: plan.name,
      amountInRupees: plan.amountInRupees,
    },
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
}
