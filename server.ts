import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_LIVETALKING_URL = process.env.LIVETALKING_SERVER_URL || 'http://127.0.0.1:8010';

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeServerUrl(rawUrl?: string): string {
  const candidate = (rawUrl || DEFAULT_LIVETALKING_URL).trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(candidate)) {
    throw new Error('Server URL must start with http:// or https://');
  }
  return candidate;
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      liveTalkingUrl: DEFAULT_LIVETALKING_URL,
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
      defaultModel: 'musetalk',
      defaultTts: 'edgetts',
      defaultMode: 'echo',
    });
  });

  app.post('/api/livetalking/probe', async (req, res) => {
    let targetUrl: string;
    try {
      targetUrl = normalizeServerUrl(req.body?.serverUrl);
    } catch (err) {
      res.status(400).json({
        reachable: false,
        detail: err instanceof Error ? err.message : 'Invalid server URL',
      });
      return;
    }

    const startedAt = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const response = await fetch(`${targetUrl}/`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      res.json({
        reachable: true,
        serverUrl: targetUrl,
        httpStatus: response.status,
        latencyMs: Date.now() - startedAt,
      });
    } catch (err) {
      res.json({
        reachable: false,
        serverUrl: targetUrl,
        latencyMs: Date.now() - startedAt,
        detail: err instanceof Error ? err.message : 'Connection refused',
      });
    }
  });

  app.post('/api/livetalking/offer', async (req, res) => {
    const { sdp, type, serverUrl } = req.body ?? {};
    if (!sdp || !type) {
      res.status(400).json({ error: 'Missing SDP offer payload (sdp, type).' });
      return;
    }

    let targetUrl: string;
    try {
      targetUrl = normalizeServerUrl(serverUrl);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid server URL' });
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const upstream = await fetch(`${targetUrl}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp, type }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const text = await upstream.text();
      let payload: unknown = text;
      try {
        payload = JSON.parse(text);
      } catch {
        // Return plain text error if upstream did not return JSON
      }

      if (!upstream.ok) {
        res.status(upstream.status).json({
          error: 'LiveTalking /offer returned an error.',
          upstream: payload,
        });
        return;
      }

      res.json(payload);
    } catch (err) {
      res.status(502).json({
        error: `Unable to reach LiveTalking server at ${targetUrl}/offer`,
        detail: err instanceof Error ? err.message : 'Network error',
      });
    }
  });

  app.post('/api/livetalking/human', async (req, res) => {
    const { text, type = 'echo', interrupt = true, sessionid = 0, serverUrl } = req.body ?? {};
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Missing text payload for /human.' });
      return;
    }

    let targetUrl: string;
    try {
      targetUrl = normalizeServerUrl(serverUrl);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid server URL' });
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const upstream = await fetch(`${targetUrl}/human`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          type,
          interrupt: Boolean(interrupt),
          sessionid: Number(sessionid) || 0,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const raw = await upstream.text();
      let parsed: unknown = raw;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Keep raw string
      }

      if (!upstream.ok) {
        res.status(upstream.status).json({
          error: 'LiveTalking /human returned an error.',
          upstream: parsed,
        });
        return;
      }

      res.json(typeof parsed === 'object' && parsed !== null ? parsed : { code: 0, data: parsed });
    } catch (err) {
      res.status(502).json({
        error: `Unable to reach LiveTalking server at ${targetUrl}/human`,
        detail: err instanceof Error ? err.message : 'Network error',
      });
    }
  });

  app.post('/api/livetalking/interrupt', async (req, res) => {
    const { sessionid = 0, serverUrl } = req.body ?? {};
    let targetUrl: string;
    try {
      targetUrl = normalizeServerUrl(serverUrl);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid server URL' });
      return;
    }

    try {
      const upstream = await fetch(`${targetUrl}/interrupt_talk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionid: Number(sessionid) || 0 }),
      });
      const data = await upstream.text();
      res.status(upstream.status).json({ ok: upstream.ok, data });
    } catch (err) {
      res.status(502).json({
        error: 'Unable to reach LiveTalking /interrupt_talk',
        detail: err instanceof Error ? err.message : 'Network error',
      });
    }
  });

  app.post('/api/tts/edge', async (req, res) => {
    const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const voice = typeof req.body?.voice === 'string' ? req.body.voice : 'en-US-JennyNeural';
    const rate = typeof req.body?.rate === 'number' ? req.body.rate : 1.0;
    const pitch = typeof req.body?.pitch === 'string' ? req.body.pitch : '+0Hz';

    if (!rawText) {
      res.status(400).json({ error: 'Text is required for EdgeTTS synthesis.' });
      return;
    }

    const startedAt = Date.now();
    try {
      const tts = new MsEdgeTTS({
        connectionTimeoutMs: 7000,
        synthesisTimeoutMs: 20000,
      });

      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, {
        wordBoundaryEnabled: true,
        sentenceBoundaryEnabled: true,
      });

      const safeText = escapeXml(rawText);
      const { audioStream, metadataStream } = tts.toStream(safeText, {
        rate,
        pitch,
      });

      const audioChunks: Buffer[] = [];
      const boundaries: Array<{ offsetMs: number; durationMs: number; text: string }> = [];

      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const finish = (err?: Error) => {
          if (settled) return;
          settled = true;
          if (err) reject(err);
          else resolve();
        };

        audioStream.on('data', (chunk: Buffer) => {
          audioChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        audioStream.on('error', (err: Error) => finish(err));

        if (metadataStream) {
          metadataStream.on('data', (chunk: Buffer) => {
            try {
              const parsed = JSON.parse(chunk.toString('utf8'));
              const items = Array.isArray(parsed?.Metadata) ? parsed.Metadata : [];
              for (const item of items) {
                if (item?.Type === 'WordBoundary' && item?.Data) {
                  boundaries.push({
                    offsetMs: Math.round((item.Data.Offset || 0) / 10000),
                    durationMs: Math.round((item.Data.Duration || 0) / 10000),
                    text: item.Data.text?.Text || '',
                  });
                }
              }
            } catch {
              // Ignore partial metadata chunks
            }
          });
        }

        audioStream.on('close', () => finish());
        audioStream.on('end', () => finish());
      });

      tts.close();

      const audioBuffer = Buffer.concat(audioChunks);
      if (audioBuffer.length === 0) {
        throw new Error('EdgeTTS returned an empty audio stream.');
      }

      res.json({
        provider: 'edgetts',
        voice,
        mimeType: 'audio/mpeg',
        audioBase64: audioBuffer.toString('base64'),
        boundaries,
        latencyMs: Date.now() - startedAt,
      });
    } catch (err) {
      res.json({
        provider: 'browser-fallback',
        voice,
        fallbackReason: err instanceof Error ? err.message : 'EdgeTTS upstream unreachable',
        latencyMs: Date.now() - startedAt,
      });
    }
  });

  app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const { message, history = [], systemPrompt } = req.body ?? {};

    if (!apiKey) {
      res.status(200).json({
        configured: false,
        mode: 'echo',
        reply: null,
        detail:
          'OPENAI_API_KEY is not set. Add OPENAI_API_KEY to your environment when ready to switch from Echo mode to OpenAI chat.',
      });
      return;
    }

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    try {
      const messages = [
        {
          role: 'system',
          content:
            typeof systemPrompt === 'string' && systemPrompt.trim()
              ? systemPrompt
              : 'You are a concise, natural-sounding AI human presenter. Reply in the same language as the latest user message: Hindi for Hindi, English for English, and naturally mirror a Hindi-English mix. Keep spoken responses under 3 sentences so real-time lip-sync stays responsive.',
        },
        ...(Array.isArray(history) ? history.slice(-8) : []),
        { role: 'user', content: message },
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 220,
        }),
      });

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
      };

      if (!response.ok) {
        res.status(response.status).json({
          configured: true,
          error: data?.error?.message || 'OpenAI request failed.',
        });
        return;
      }

      const reply = data?.choices?.[0]?.message?.content?.trim() || '';
      res.json({
        configured: true,
        mode: 'openai',
        model,
        reply,
      });
    } catch (err) {
      res.status(500).json({
        configured: true,
        error: err instanceof Error ? err.message : 'OpenAI call failed.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LiveTalking Studio server running on http://0.0.0.0:${PORT}`);
  });
}

createApp();
