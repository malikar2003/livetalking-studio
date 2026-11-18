import { NextResponse } from "next/server";
import { getLiveTalkingClient } from "@/lib/livetalking/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.sessionId !== "string" || !body.sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }
  try {
    await getLiveTalkingClient().interrupt(body.sessionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not stop avatar speech" }, { status: 502 });
  }
}
