/**
 * Builds the LiveTalking client configuration from central settings.
 *
 * `baseUrl` is the server-side address; the browser gets its own URL from
 * `getBrowserBaseUrl()` so a deployment can expose LiveTalking on a different
 * host than the Next.js process sees.
 */

import { settings } from "@/lib/config/settings";
import { LiveTalkingClient } from "./client";
import type { LiveTalkingConfig, ReplyEngineId } from "./types";

export function getLiveTalkingConfig(): LiveTalkingConfig {
  return {
    baseUrl: settings.livetalking.serverBaseUrl,
    avatarId: settings.livetalking.avatarId,
    voice: settings.livetalking.voice,
    mode: settings.livetalking.mode,
    timeoutMs: settings.livetalking.timeoutMs,
  };
}

/** Absolute URL shown to the browser in the connection hint. */
export function getBrowserBaseUrl(): string {
  return settings.livetalking.publicBaseUrl.replace(/\/$/, "");
}

/** Which reply engine is active; `echo` needs no external API key. */
export function getReplyEngineId(): ReplyEngineId {
  return settings.livetalking.replyEngine;
}

let cached: LiveTalkingClient | null = null;

/** Reuse one client per process so connections and timeouts are shared. */
export function getLiveTalkingClient(): LiveTalkingClient {
  if (!cached) cached = new LiveTalkingClient(getLiveTalkingConfig());
  return cached;
}
