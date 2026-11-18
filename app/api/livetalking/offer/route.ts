import { NextResponse } from "next/server";
import { getLiveTalkingClient } from "@/lib/livetalking/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.sdp !== "string" || body.type !== "offer") {
    return NextResponse.json({ error: "Invalid WebRTC offer" }, { status: 400 });
  }

  try {
    const answer = await getLiveTalkingClient().offer({ sdp: body.sdp, type: "offer" });
    if (!answer.sdp || !answer.sessionid) {
      return NextResponse.json({ error: answer.msg ?? "LiveTalking did not return an answer" }, { status: 502 });
    }
    return NextResponse.json(answer, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not connect to LiveTalking" }, { status: 502 });
  }
}
