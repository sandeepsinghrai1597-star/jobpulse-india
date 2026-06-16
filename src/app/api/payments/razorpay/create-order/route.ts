import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getCurrentUser } from "@/lib/auth/current-user";
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

  const allowedPlans =
    user.role === "employer"
      ? ["employer-basic", "employer-pro", "featured-job"]
      : ["candidate-pro"];

  if (!allowedPlans.includes(parsed.data.plan)) {
    return NextResponse.json(
      { message: "This plan is not available for your account role." },
      { status: 403 },
    );
  }

  const client = getRazorpay();
  const admin = getSupabaseAdminClient();

  if (!client || !admin) {
    return NextResponse.json({
      mode: "mock",
      order: {
        id: "order_mock_123",
        amount: parsed.data.amount,
        currency: "INR",
        receipt: parsed.data.plan,
      },
      note: "Razorpay or Supabase admin credentials are not configured.",
    });
  }

  const receipt = `${parsed.data.plan}-${Date.now()}`;
  const order = await client.orders.create({
    amount: parsed.data.amount * 100,
    currency: "INR",
    receipt,
    notes: {
      user_id: user.id,
      role: user.role,
      plan: parsed.data.plan,
      ...parsed.data.notes,
    },
  });

  const { error } = await admin.from("payments").insert({
    user_id: user.id,
    amount: parsed.data.amount,
    plan: parsed.data.plan,
    subscription_type: user.role,
    razorpay_order_id: order.id,
    status: "created",
    notes: {
      receipt,
      role: user.role,
      ...parsed.data.notes,
    },
  } as never);

  if (error) {
    return NextResponse.json(
      { message: "Payment order was created but persistence failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ mode: "live", order });
}
