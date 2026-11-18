/**
 * Central, tunable settings.
 *
 * Everything Avaada has not finalised lives here so it can be changed without
 * touching application logic. Values marked "provisional" are placeholders.
 */

const DEFAULT_LINK_LIFETIME_DAYS = 14;

export const settings = {
  /** ---- Assessment link ------------------------------------------------ */
  links: {
    /** Default lifetime in days. The effective expiry is min(this, cycle end). */
    defaultLifetimeDays: DEFAULT_LINK_LIFETIME_DAYS,
    /** Entropy of the link token in bits. Requirement is >= 128. */
    tokenBits: 128,
    /** Max number of learners a single trigger request may contain. */
    maxBulkSize: 500,
    /** Reminder offsets (days before expiry) for automated emails. */
    reminderDaysBeforeExpiry: [3, 1] as const,
  },

  /** ---- Conversation ---------------------------------------------------- */
  conversation: {
    /** Total budget for the conversation in minutes. */
    maxDurationMinutes: 15,
    /** At this elapsed time the avatar starts steering towards the close. */
    steerToCloseMinutes: 13,
    /** Silence threshold (ms) that ends a turn in hands-free mode. */
    handsFreeSilenceMs: 1500,
    /** Consecutive silent turns before we offer a microphone re-check. */
    silentTurnsBeforePrompt: 2,
    /** Target total delay from releasing the button to the avatar speaking (ms). */
    targetResponseLatencyMs: 1000,
    /** Maximum time we will wait for the STT final transcript (ms). */
    sttFinalTimeoutMs: 4000,
    /** Maximum speaking length of a single avatar line (ms). */
    maxLineDurationMs: 45000,
  },

  /** ---- Audio ----------------------------------------------------------- */
  audio: {
    /** Sample rate used for the synthesised audio and the analyser. */
    sampleRate: 24000,
    /** RMS threshold above the measured noise floor to count as speech. */
    speechRmsThreshold: 0.02,
    /** Minimum sustained level (ms) to register as speech rather than a click. */
    speechMinDurationMs: 320,
    /** Mic check: level (dBFS) below this counts as "no microphone". */
    micCheckSilenceDb: -60,
    /** Mic check: peak level (dBFS) above this counts as "mic works". */
    micCheckSignalDb: -35,
  },

  /** ---- Scoring (PROVISIONAL - Avaada has not finalised the weights) ------ */
  scoring: {
    /** Points awarded for a `best` answer at a node. */
    pointsBest: 1,
    /** Points awarded for an `acceptable` answer. */
    pointsAcceptable: 0.6,
    /** Points awarded for a `poor` answer. */
    pointsPoor: 0.15,
    /** Pass mark on the overall 0-100 score. */
    passMark: 60,
    /** Bands, evaluated from the highest `min` first. */
    bands: [
      { id: "excellent", min: 85, max: 100, labelKey: "band.excellent", pass: true },
      { id: "good", min: 70, max: 84, labelKey: "band.good", pass: true },
      { id: "satisfactory", min: 60, max: 69, labelKey: "band.satisfactory", pass: true },
      { id: "needs_work", min: 40, max: 59, labelKey: "band.needs_work", pass: false },
      { id: "unsatisfactory", min: 0, max: 39, labelKey: "band.unsatisfactory", pass: false },
    ],
  },

  /** ---- Moodle ---------------------------------------------------------- */
  moodle: {
    /** Base URL of the Moodle instance (mocked in this build). */
    baseUrl: "https://moodle.example.invalid",
    /** REST endpoint used to write back results. */
    resultsEndpoint: "/webservice/rest/server.php",
    /** How many times a queued write-back is retried before it is flagged. */
    maxRetries: 5,
    /** Base back-off in ms; attempt N waits base * 2^N. */
    retryBaseDelayMs: 30000,
  },

  /** ---- Adapters -------------------------------------------------------- */
  adapters: {
    /** Which implementation to use for each swappable interface. */
    stt: (process.env.STT_ADAPTER ?? "mock") as "mock" | "livekit" | "azure",
    tts: (process.env.TTS_ADAPTER ?? "mock") as "mock" | "azure" | "elevenlabs",
    avatar: (process.env.AVATAR_ADAPTER ?? "mock") as "mock" | "simli" | "d-id",
    moodle: (process.env.MOODLE_ADAPTER ?? "mock") as "mock" | "live",
    auth: (process.env.AUTH_ADAPTER ?? "mock") as "mock" | "live",
  },

  /** ---- LiveTalking avatar (self-hosted MuseTalk) ------------------------ */
  livetalking: {
    /** Address the Next.js server uses to reach the LiveTalking HTTP API. */
    serverBaseUrl: process.env.LIVETALKING_URL ?? "http://127.0.0.1:8010",
    /** Address the browser uses for WebRTC signalling (may be a public host). */
    publicBaseUrl:
      process.env.NEXT_PUBLIC_LIVETALKING_URL ??
      process.env.LIVETALKING_URL ??
      "http://127.0.0.1:8010",
    /** Folder name under services/livetalking/data/avatars. */
    avatarId: process.env.LIVETALKING_AVATAR_ID ?? "2323",
    /** EdgeTTS voice used on the server, e.g. en-US-AndrewNeural. */
    voice: process.env.LIVETALKING_VOICE ?? "en-US-AndrewNeural",
    /** `echo` replays our fixed text; `chat` uses LiveTalking's own LLM. */
    mode: (process.env.LIVETALKING_MODE ?? "echo") as "echo" | "chat",
    /** Our dialogue layer: `echo` needs no key, `openai` is the future path. */
    replyEngine: (process.env.LIVETALKING_REPLY_ENGINE ?? "echo") as
      | "echo"
      | "openai",
    openAiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    /** Milliseconds before a call to the LiveTalking API is aborted. */
    timeoutMs: 15_000,
  },

  /** ---- App ------------------------------------------------------------- */
  app: {
    /** Languages shipped with the build. */
    supportedLanguages: ["en", "hi"] as const,
    defaultLanguage: "en",
    /** Support contact shown in branded emails. */
    supportEmail: "ld@avaada.example.invalid",
    supportPhone: "+91 80 4000 1000",
    brandName: "Avaada",
    brandTagline: "AI Sales Practice Simulator",
  },
} as const;

export type Settings = typeof settings;

/** Effective expiry for a link: the sooner of the default lifetime and cycle end. */
export function computeLinkExpiry(
  issuedAt: Date,
  cycleEnd: Date | null,
  lifetimeDays: number = settings.links.defaultLifetimeDays,
): Date {
  const byLifetime = new Date(issuedAt.getTime() + lifetimeDays * 24 * 60 * 60 * 1000);
  if (!cycleEnd) return byLifetime;
  return byLifetime.getTime() < cycleEnd.getTime() ? byLifetime : cycleEnd;
}

/** Human readable remaining days, used in admin screens. */
export function daysUntil(iso: string, from: Date = new Date()): number {
  const target = new Date(iso).getTime();
  return Math.ceil((target - from.getTime()) / (24 * 60 * 60 * 1000));
}
