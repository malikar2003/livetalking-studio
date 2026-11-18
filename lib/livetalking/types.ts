/**
 * Shared contracts for the self-hosted LiveTalking avatar.
 *
 * The browser talks to the LiveTalking server directly for WebRTC signalling
 * (SDP exchange cannot be proxied), while every text/state call goes through
 * our own API routes so the server address, voice and dialogue logic stay on
 * the backend.
 */

/** `echo` replays text we send; `chat` lets LiveTalking also run its LLM. */
export type LiveTalkingMode = "echo" | "chat";

/** Which component turns the learner's input into the avatar's reply. */
export type ReplyEngineId = "echo" | "openai";

export interface LiveTalkingConfig {
  /** Base URL of the LiveTalking server, e.g. http://127.0.0.1:8010 */
  baseUrl: string;
  /** The prepared avatar id, e.g. `musetalk_avaada_man`. */
  avatarId: string;
  /** EdgeTTS voice name, e.g. `en-US-AndrewNeural`. */
  voice: string;
  /** Echo mode for the offline test; chat once an LLM key is configured. */
  mode: LiveTalkingMode;
  /** Milliseconds before an API call is aborted. */
  timeoutMs: number;
}

/** What the browser needs before it can open a WebRTC session. */
export interface SessionConfig {
  /** Absolute URL the browser must use for `/offer` and `/sse`. */
  baseUrl: string;
  avatarId: string;
  voice: string;
  mode: LiveTalkingMode;
  engine: ReplyEngineId;
  /** True when the LiveTalking server answered a probe. */
  reachable: boolean;
}

/** One fixed line of the offline demo script. */
export interface ScriptLine {
  id: string;
  text: string;
}

/** Result of asking the avatar to say something. */
export interface SpeakResult {
  ok: boolean;
  /** The text that was (or will be) spoken. */
  text: string;
  /** Where the text came from, useful while the LLM is not wired up. */
  source: "script" | "user" | "llm";
  mode: LiveTalkingMode;
}

/** SDP answer returned by LiveTalking's `/offer`. */
export interface OfferAnswer {
  sdp?: string;
  type?: "answer";
  sessionid?: string;
  code?: number;
  msg?: string;
}

/** Envelope used by every LiveTalking JSON endpoint. */
export interface LiveTalkingEnvelope<T = unknown> {
  code: number;
  msg: string;
  data?: T;
}
