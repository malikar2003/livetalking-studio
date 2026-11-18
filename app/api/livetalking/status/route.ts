import { NextResponse } from "next/server";
import { getLiveTalkingClient } from "@/lib/livetalking/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  const status = await getLiveTalkingClient().status(sessionId);
  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
