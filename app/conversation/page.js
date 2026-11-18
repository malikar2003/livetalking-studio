"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight, Mic, Play } from "lucide-react";
import { LiveTalkingPlayer } from "../components/LiveTalkingPlayer";

export default function MainInteractionScreen() {
  const router = useRouter();
  const playerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="relative flex h-[100dvh] w-full select-none flex-col justify-between overflow-hidden bg-[#0A1322] font-sans text-white">
      <header className="relative z-20 flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-gradient-to-b from-[#070E19] via-[#0B1525] to-[#0D192B] px-6 md:px-10">
        <Image src="/assets/avada_logo.png" alt="Avaada Electro" width={104} height={42} priority className="h-auto w-[92px]" />
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="text-right">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">TIME ELAPSED</p>
            <p className="mt-0.5 font-mono text-[16px] font-bold tracking-wider text-white">08:42</p>
          </div>
          <div className="h-7 w-px bg-white/10" />
          <div className="text-right">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">CURRENT SCORE</p>
            <p className="mt-0.5 text-[16px] font-bold tracking-wide text-[#10B981]">78%</p>
          </div>
        </div>
      </header>

      <main className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#141D2B]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#070E19]/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#08101D]/55 to-transparent" />
        <LiveTalkingPlayer
          ref={playerRef}
          style={{ width: "min(390px, calc((100dvh - 152px) * 0.75))" }}
        />
        <div className="absolute bottom-4 left-5 z-20 rounded-lg border border-white/10 bg-[#0F172A]/80 px-3.5 py-2 text-[11.5px] font-medium text-slate-200 backdrop-blur-md sm:left-7">
          Live customer · EdgeTTS / MuseTalk
        </div>
      </main>

      <footer className="relative z-20 flex h-[84px] shrink-0 items-center justify-between border-t border-white/[0.08] bg-gradient-to-t from-[#060C16] via-[#0A1322] to-[#0D1829] px-6 md:px-10">
        <button
          type="button"
          onClick={() => playerRef.current?.replay()}
          className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-[#131F33]/90 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200 transition-all hover:bg-[#1B2B45]"
        >
          <Play className="h-3.5 w-3.5 fill-slate-200 text-slate-200 transition-transform group-hover:scale-110" />
          <span>REPLAY STATEMENT</span>
        </button>

        <div className="absolute left-1/2 -top-4 flex -translate-x-1/2 flex-col items-center">
          <button
            type="button"
            onClick={() => setIsRecording((current) => !current)}
            aria-label={isRecording ? "Stop listening" : "Tap to speak"}
            className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-200 ${isRecording ? "scale-105 bg-[#EF4444] ring-4 ring-red-500/30" : "bg-[#2563EB] ring-4 ring-[#0A1322] shadow-blue-600/40 hover:bg-[#1D4ED8]"}`}
          >
            {isRecording && <span className="absolute inset-0 animate-ping rounded-full bg-red-400/40" />}
            <Mic className="h-6 w-6" />
          </button>
          <span className="mt-1.5 text-[11.5px] font-medium tracking-wide text-slate-300">
            {isRecording ? "Listening..." : "Tap to Speak"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => router.push("/result")}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-[#1D4ED8] active:scale-[0.99]"
        >
          <span>SUBMIT RESPONSE</span>
          <ChevronRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      </footer>
    </div>
  );
}
