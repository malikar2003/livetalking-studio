import { NextResponse } from "next/server";
import { getLiveTalkingClient, getLiveTalkingConfig } from "@/lib/livetalking/config";
import { getReplyEngine } from "@/lib/livetalking/reply-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.sessionId !== "string" || (!body.lineId && !body.text)) {
    return NextResponse.json({ error: "Provide a sessionId and lineId or text" }, { status: 400 });
  }

  try {
    const reply = await getReplyEngine("echo").reply({
      lineId: typeof body.lineId === "string" ? body.lineId : undefined,
      text: typeof body.text === "string" ? body.text : undefined,
    });
    await getLiveTalkingClient().say({
      sessionId: body.sessionId,
      text: reply.text,
      type: "echo",
      interrupt: true,
    });
    return NextResponse.json({ ok: true, text: reply.text, source: reply.source, mode: getLiveTalkingConfig().mode });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not speak" }, { status: 502 });
  }
}
