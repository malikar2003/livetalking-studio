import { NextResponse } from "next/server";
import {
  getBrowserBaseUrl,
  getLiveTalkingClient,
  getLiveTalkingConfig,
  getReplyEngineId,
} from "@/lib/livetalking/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = getLiveTalkingConfig();
  const reachable = await getLiveTalkingClient().isAvailable();

  return NextResponse.json({
    baseUrl: getBrowserBaseUrl(),
    avatarId: config.avatarId,
    voice: config.voice,
    mode: config.mode,
    engine: getReplyEngineId(),
    reachable,
  }, { headers: { "Cache-Control": "no-store" } });
}
