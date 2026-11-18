import { fetchJson } from './apiResponse';

export interface BackendHealth {
  status: string;
  liveTalkingUrl: string;
  openaiConfigured: boolean;
  geminiConfigured: boolean;
  defaultModel: string;
  defaultTts: string;
  defaultMode: string;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResolution {
  textToSpeak: string;
  source: 'echo-fixed' | 'openai-chat';
  openaiConfigured: boolean;
  notice?: string;
}

export async function fetchBackendHealth(): Promise<BackendHealth> {
  const res = await fetchJson<BackendHealth>('/api/health');
  if (!res.ok || !res.data) {
    throw new Error('Failed to load backend health status.');
  }
  return res.data;
}

/**
 * Future-ready speech pipeline resolver:
 * - In Echo mode: returns fixed text directly without requiring any OpenAI API key.
 * - In OpenAI mode: calls /api/chat (which gracefully reports if OPENAI_API_KEY is not set yet).
 */
export async function resolveSpeechPayload(params: {
  mode: 'echo' | 'openai-ready';
  inputText: string;
  history: ChatTurn[];
  systemPrompt?: string;
}): Promise<ChatResolution> {
  if (params.mode === 'echo') {
    return {
      textToSpeak: params.inputText.trim(),
      source: 'echo-fixed',
      openaiConfigured: false,
    };
  }

  const reply = await fetchJson<{
    configured?: boolean;
    reply?: string;
    detail?: string;
    error?: string;
  }>('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: params.inputText.trim(),
      history: params.history,
      systemPrompt: params.systemPrompt,
    }),
  });

  const data = reply.data;

  if (!reply.ok || !data?.configured) {
    return {
      textToSpeak: params.inputText.trim(),
      source: 'echo-fixed',
      openaiConfigured: false,
      notice:
        data?.detail ||
        reply.error ||
        'AI chat backend is unavailable. Add an OpenAI key and run the Express server to enable replies.',
    };
  }

  if (!data.reply) {
    throw new Error(data.error || 'OpenAI chat endpoint did not return a reply.');
  }

  return {
    textToSpeak: data.reply,
    source: 'openai-chat',
    openaiConfigured: true,
  };
}
