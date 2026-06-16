import crypto from "node:crypto";
import { NextResponse } from "next/server";
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
        : payment?.status ?? "updated";

  await admin
    .from("payments")
    .update({
      status: mappedStatus,
      razorpay_payment_id: payment?.id ?? null,
      razorpay_signature: signature,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("razorpay_order_id", orderId);

  return NextResponse.json({ ok: true });
}
