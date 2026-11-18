import type { ScriptLine } from "./types";

/**
 * Fixed demo script.
 *
 * These lines are what the avatar speaks while no LLM is configured: the
 * browser sends a line id, the API route looks the text up here and forwards
 * it to LiveTalking in `echo` mode. EdgeTTS turns it into speech on the server
 * and MuseTalk animates the mouth from that exact audio, so lip-sync stays
 * perfect even offline.
 */
export const echoScript: readonly ScriptLine[] = [
  {
    id: "greeting",
    text: "Hello, welcome to LiveTalking Studio. I am speaking in Echo mode using EdgeTTS neural voice synthesis and MuseTalk lip-sync.",
  },
  {
    id: "objection-bill",
    text: "Before we go further, I noticed an extra line on my last electricity bill. Can you explain what I am being charged for?",
  },
  {
    id: "objection-price",
    text: "That still sounds expensive compared to my current supplier. What makes your tariff worth switching for?",
  },
  {
    id: "closing",
    text: "All right, that answers my questions. Send me the quotation and I will review it with my team this week.",
  },
] as const;

/** The line the "Play demo" button uses first. */
export const DEFAULT_LINE_ID = echoScript[0].id;

/** System prompt kept ready for the OpenAI reply engine. */
export const personaPrompt = [
  "You are a senior procurement manager at an Indian industrial group, role-playing a",
  "customer for a solar energy sales trainee.",
  "Stay in character, keep answers under three sentences, and answer out loud style:",
  "no markdown, no lists, no emoji.",
].join(" ");

/** Resolve a script line by id; returns undefined when the id is unknown. */
export function findScriptLine(id: string): ScriptLine | undefined {
  return echoScript.find((line) => line.id === id);
}
