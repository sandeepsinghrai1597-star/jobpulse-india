import { NextResponse } from "next/server";

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

  const payload = await request.json();

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
