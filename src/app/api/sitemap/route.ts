import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";

export async function GET() {
  return NextResponse.json(await sitemap());
}
