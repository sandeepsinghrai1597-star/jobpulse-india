import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
  const appSecret = process.env.WHATSAPP_APP_SECRET ?? process.env.META_APP_SECRET;
  if (!appSecret) return false;
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signatureHeader);

  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  ) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return NextResponse.json({ message: "Webhook verification failed." }, { status: 403 });
}

export async function POST(request: Request) {
  const relayUrl = process.env.N8N_JOB_ALERTS_WEBHOOK_URL;

  if (!relayUrl) {
    return NextResponse.json(
      { message: "WhatsApp relay is not configured for this environment." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  if (!verifyMetaSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ message: "Invalid WhatsApp webhook signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid WhatsApp webhook JSON." }, { status: 400 });
  }

  try {
    await fetch(relayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json(
      { message: "WhatsApp relay is configured but unavailable right now." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    mode: "relay",
  });
}
