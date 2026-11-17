import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const LIVETALKING_LAUNCH_CMD = `# 1. Clone LiveTalking and download MuseTalk v1.5 checkpoints
git clone https://github.com/lipku/LiveTalking.git
cd LiveTalking

# 2. Launch MuseTalk + EdgeTTS + WebRTC on port 8010 (Echo mode ready, no OpenAI key needed)
python app.py \\
  --transport webrtc \\
  --model musetalk \\
  --tts edgetts \\
  --REF_FILE en-US-JennyNeural \\
  --avatar_id musetalk_elena_v1 \\
  --listenport 8010`;

const NEXT_OFFER_ROUTE = `// app/api/livetalking/offer/route.ts
import { NextResponse } from 'next/server';

const LIVETALKING_URL = process.env.LIVETALKING_SERVER_URL || 'http://127.0.0.1:8010';

export async function POST(req: Request) {
  const { sdp, type } = await req.json();

  const upstream = await fetch(\`\${LIVETALKING_URL}/offer\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sdp, type }),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}`;

const NEXT_HUMAN_ROUTE = `// app/api/livetalking/human/route.ts
import { NextResponse } from 'next/server';

const LIVETALKING_URL = process.env.LIVETALKING_SERVER_URL || 'http://127.0.0.1:8010';

export async function POST(req: Request) {
  const { text, sessionid, type = 'echo', interrupt = true } = await req.json();

  // Echo mode speaks fixed text directly via EdgeTTS + MuseTalk without an LLM key
  const upstream = await fetch(\`\${LIVETALKING_URL}/human\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type, interrupt, sessionid }),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}`;

const NEXT_CHAT_ROUTE = `// app/api/chat/route.ts (Drop-in ready for future OpenAI integration)
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const { message, history = [] } = await req.json();

  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      mode: 'echo',
      reply: message, // Echo fallback until OPENAI_API_KEY is provided
    });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${apiKey}\`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Keep spoken answers concise for real-time lip-sync.' },
        ...history,
        { role: 'user', content: message },
      ],
    }),
  });

  const data = await res.json();
  return NextResponse.json({
    configured: true,
    mode: 'openai',
    reply: data.choices?.[0]?.message?.content ?? '',
  });
}`;

interface CodeBlockProps {
  title: string;
  subtitle: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ title, subtitle, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-xl border border-slate-800/90 bg-[#111827] overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-5 py-3.5">
        <div>
          <h3 className="font-display text-sm font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[#0B0F17] p-5 font-mono text-xs leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const SetupGuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800/90 bg-[#111827] p-6">
        <h2 className="font-display text-lg font-semibold text-slate-100">
          LiveTalking + MuseTalk + Bilingual Voice Chat
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          Speak to the Avatar Studio in Hindi or English using Chrome or Edge, then hear the reply in the same language. Browser speech recognition may process audio through its online service; AI replies require <code className="text-sky-400">OPENAI_API_KEY</code> in the project’s local <code className="text-sky-400">.env</code> file. The studio can also proxy WebRTC SDP offers (<code className="text-sky-400">/offer</code>) and speech payloads (<code className="text-sky-400">/human</code>) to a LiveTalking GPU worker.
        </p>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800/80 pt-5 text-xs">
          <div>
            <p className="font-medium text-slate-100">01. GPU Backend</p>
            <p className="mt-1 leading-relaxed text-slate-400">
              LiveTalking runs MuseTalk lip-sync + EdgeTTS voice synthesis and exposes WebRTC signaling on port 8010.
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-100">02. Echo Mode Testing</p>
            <p className="mt-1 leading-relaxed text-slate-400">
              Send <code className="text-slate-200">type: "echo"</code> with fixed text to <code className="text-slate-200">/human</code>. No OpenAI API key is needed.
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-100">03. Bilingual Voice Chat</p>
            <p className="mt-1 leading-relaxed text-slate-400">
              Add <code className="text-slate-200">OPENAI_API_KEY</code> to the local <code className="text-slate-200">.env</code>. The chat endpoint replies in the user’s language.
            </p>
          </div>
        </div>
      </div>

      <CodeBlock
        title="01. Launch LiveTalking with MuseTalk & EdgeTTS"
        subtitle="Run on your CUDA GPU host (exposes /offer, /human, /interrupt_talk on port 8010)"
        code={LIVETALKING_LAUNCH_CMD}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CodeBlock
          title="02. Next.js WebRTC SDP Proxy"
          subtitle="app/api/livetalking/offer/route.ts"
          code={NEXT_OFFER_ROUTE}
        />
        <CodeBlock
          title="03. Next.js Echo Speech Route"
          subtitle="app/api/livetalking/human/route.ts"
          code={NEXT_HUMAN_ROUTE}
        />
      </div>

      <CodeBlock
        title="04. Chatbot Endpoint Example"
        subtitle="app/api/chat/route.ts — requires OPENAI_API_KEY for AI replies"
        code={NEXT_CHAT_ROUTE}
      />
    </div>
  );
};
