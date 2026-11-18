/**
 * LiveTalking client.
 *
 * Talks to a self-hosted LiveTalking server (Apache-2.0) that runs MuseTalk
 * for photorealistic lip-sync. The server exposes:
 *
 *   POST /offer        WebRTC SDP exchange  -> { sdp, type, sessionid }
 *   POST /human        text-driven speech   -> { code, msg }
 *   POST /humanaudio   audio-driven speech (multipart) -> { code, msg }
 *   POST /interrupt_talk
 *   POST /is_speaking
 *   GET  /sse?sessionid= server-sent event stream
 *
 * We deliberately use `/human` with `type: "echo"` while no LLM key is
 * configured: our own text decides what is said, EdgeTTS synthesises it on the
 * server, and MuseTalk animates the mouth from that exact audio.
 *
 * Signalling is relayed through Next.js (see `offer()`), while the media itself
 * still flows browser-to-server over WebRTC. Everything else goes through this
 * client.
 */

import type {
  LiveTalkingConfig,
  LiveTalkingEnvelope,
  OfferAnswer,
} from "./types";

export type { LiveTalkingConfig } from "./types";

export interface LiveTalkingStatus {
  connected: boolean;
  speaking: boolean;
  sessionId: string | null;
  error?: string;
}

const DEFAULT_TIMEOUT = 15_000;
/** Building a MuseTalk session loads latents, so the first offer is slow. */
const OFFER_TIMEOUT = 90_000;

export class LiveTalkingClient {
  private readonly config: LiveTalkingConfig;

  constructor(config: LiveTalkingConfig) {
    this.config = config;
  }

  private url(path: string): string {
    return `${this.config.baseUrl.replace(/\/$/, "")}${path}`;
  }

  private async withTimeout<T>(
    run: (signal: AbortSignal) => Promise<T>,
    timeoutMs?: number,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      timeoutMs ?? this.config.timeoutMs ?? DEFAULT_TIMEOUT,
    );
    try {
      return await run(controller.signal);
    } finally {
      clearTimeout(timer);
    }
  }

  private async postJson(
    path: string,
    body: Record<string, unknown>,
  ): Promise<LiveTalkingEnvelope> {
    return this.withTimeout(async (signal) => {
      const response = await fetch(this.url(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
        cache: "no-store",
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(
          `LiveTalking ${path} failed: ${response.status} ${text.slice(0, 200)}`,
        );
      }
      return JSON.parse(text) as LiveTalkingEnvelope;
    });
  }

  /**
   * Is the LiveTalking server reachable?
   *
   * `/is_speaking` answers with `{ code: -1 }` for an unknown session, which is
   * still proof that the HTTP API is alive and the model finished loading.
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.withTimeout((signal) =>
        fetch(this.url("/is_speaking"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionid: "probe" }),
          signal,
          cache: "no-store",
        }),
      );
      if (response.status >= 500) return false;
      const body = (await response.json()) as LiveTalkingEnvelope;
      return typeof body?.code === "number";
    } catch {
      return false;
    }
  }

  /**
   * Relay a browser SDP offer to LiveTalking.
   *
   * The browser cannot post to `/offer` directly: LiveTalking answers without
   * CORS headers and has no OPTIONS handler, so a cross-origin preflight is
   * rejected. We gather all ICE candidates before sending (non-trickle), which
   * means the SDP is self-contained and can be relayed from the server. Only the
   * signalling travels through Next.js - the media stays peer-to-peer.
   */
  async offer(input: { sdp: string; type: "offer" }): Promise<OfferAnswer> {
    return this.withTimeout(async (signal) => {
      const response = await fetch(this.url("/offer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: input.sdp,
          type: input.type,
          avatar: this.config.avatarId,
          refaudio: this.config.voice,
        }),
        signal,
        cache: "no-store",
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(
          `LiveTalking /offer failed: ${response.status} ${text.slice(0, 200)}`,
        );
      }
      return JSON.parse(text) as OfferAnswer;
    }, OFFER_TIMEOUT);
  }

  /** Ask the avatar to speak `text` in the current session. */
  async say(input: {
    sessionId: string;
    text: string;
    /** `echo` repeats our text, `chat` lets LiveTalking run its own LLM. */
    type?: "echo" | "chat";
    /** Drop anything already queued before speaking this line. */
    interrupt?: boolean;
  }): Promise<LiveTalkingEnvelope> {
    const envelope = await this.postJson("/human", {
      sessionid: input.sessionId,
      text: input.text,
      type: input.type ?? "echo",
      interrupt: input.interrupt ?? true,
      tts: { ref_file: this.config.voice },
    });
    if (envelope.code !== 0) {
      throw new Error(envelope.msg || "LiveTalking rejected the line");
    }
    return envelope;
  }

  /**
   * Send ready-made audio (pre-generated WAV) for immediate playback.
   *
   * LiveTalking's /humanaudio takes a multipart body with `sessionid` and a
   * `file`. This skips EdgeTTS entirely, so pre-cached script lines start
   * speaking instantly instead of waiting for a network TTS round trip.
   */
  async sayAudio(sessionId: string, wav: Uint8Array, filename = "line.wav"): Promise<LiveTalkingEnvelope> {
    return this.withTimeout(async (signal) => {
      const form = new FormData();
      form.append("sessionid", sessionId);
      // Copy into a fresh ArrayBuffer so the type is Blob-compatible.
      const bytes = new Uint8Array(wav.byteLength);
      bytes.set(wav);
      form.append("file", new Blob([bytes], { type: "audio/wav" }), filename);
      const response = await fetch(this.url("/humanaudio"), {
        method: "POST",
        body: form,
        signal,
        cache: "no-store",
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(
          `LiveTalking /humanaudio failed: ${response.status} ${text.slice(0, 200)}`,
        );
      }
      return JSON.parse(text) as LiveTalkingEnvelope;
    });
  }

  /** Clear the speech queue of a session. */
  async interrupt(sessionId: string): Promise<void> {
    const envelope = await this.postJson("/interrupt_talk", {
      sessionid: sessionId,
    });
    if (envelope.code !== 0) {
      throw new Error(envelope.msg || "LiveTalking could not interrupt");
    }
  }

  /** Is the avatar still speaking? */
  async isSpeaking(sessionId: string): Promise<boolean> {
    const envelope = await this.postJson("/is_speaking", {
      sessionid: sessionId,
    });
    if (envelope.code !== 0) return false;
    return envelope.data === true;
  }

  /** Full status snapshot used by the page header. */
  async status(sessionId: string | null): Promise<LiveTalkingStatus> {
    if (!sessionId) {
      const connected = await this.isAvailable();
      return { connected, speaking: false, sessionId: null };
    }
    try {
      const [connected, speaking] = await Promise.all([
        this.isAvailable(),
        this.isSpeaking(sessionId),
      ]);
      return { connected, speaking, sessionId };
    } catch (error) {
      return {
        connected: false,
        speaking: false,
        sessionId,
        error: error instanceof Error ? error.message : "status failed",
      };
    }
  }
}
