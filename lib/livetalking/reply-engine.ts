/**
 * Reply engines.
 *
 * The page never talks to an LLM directly: it asks our API for "the next line"
 * and the API picks an engine. Today that is `echo`, which replays a fixed
 * script line so the whole pipeline (TTS -> lip-sync -> WebRTC) can be tested
 * without any API key. Once `OPENAI_API_KEY` is set, switching
 * `LIVETALKING_REPLY_ENGINE=openai` makes the same endpoint generate answers.
 */

import { settings } from "@/lib/config/settings";
import { findScriptLine, personaPrompt } from "./script";
import type { ReplyEngineId } from "./types";

export interface ReplyInput {
  /** Id of a fixed script line (echo demo). */
  lineId?: string;
  /** Free text typed by the learner. */
  text?: string;
}

export interface ReplyOutput {
  text: string;
  source: "script" | "user" | "llm";
}

export interface ReplyEngine {
  id: ReplyEngineId;
  reply(input: ReplyInput): Promise<ReplyOutput>;
}

/** Replays script lines; no external service, no keys. */
class EchoReplyEngine implements ReplyEngine {
  readonly id = "echo" as const;

  async reply(input: ReplyInput): Promise<ReplyOutput> {
    if (input.lineId) {
      const line = findScriptLine(input.lineId);
      if (!line) throw new Error(`Unknown script line: ${input.lineId}`);
      return { text: line.text, source: "script" };
    }
    const text = input.text?.trim();
    if (!text) throw new Error("Nothing to say: pass a lineId or text");
    return { text, source: "user" };
  }
}

/** OpenAI chat completion; enabled once a key is configured. */
class OpenAiReplyEngine implements ReplyEngine {
  readonly id = "openai" as const;

  async reply(input: ReplyInput): Promise<ReplyOutput> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set; keep LIVETALKING_REPLY_ENGINE=echo",
      );
    }

    // A script line can still be requested verbatim (useful for smoke tests).
    if (input.lineId && !input.text) {
      const line = findScriptLine(input.lineId);
      if (!line) throw new Error(`Unknown script line: ${input.lineId}`);
      return { text: line.text, source: "script" };
    }

    const prompt = input.text?.trim();
    if (!prompt) throw new Error("Nothing to answer: pass text");

    const response = await fetch(
      `${settings.livetalking.openAiBaseUrl.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: settings.livetalking.openAiModel,
          temperature: 0.7,
          max_tokens: 120,
          messages: [
            { role: "system", content: personaPrompt },
            { role: "user", content: prompt },
          ],
        }),
      },
    );

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(data.error?.message ?? `OpenAI ${response.status}`);
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("OpenAI returned an empty answer");
    return { text, source: "llm" };
  }
}

const engines: Record<ReplyEngineId, () => ReplyEngine> = {
  echo: () => new EchoReplyEngine(),
  openai: () => new OpenAiReplyEngine(),
};

export function getReplyEngine(id: ReplyEngineId): ReplyEngine {
  return engines[id]();
}
