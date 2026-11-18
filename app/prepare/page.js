"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Volume2,
  Mic,
  ShieldCheck,
  Wifi,
  Target,
  MessageCircle,
  Play,
} from "lucide-react";

const TIPS = [
  {
    icon: Volume2,
    title: "Find a Quiet Environment",
    text: "Choose a quiet place with minimal background noise. Avoid interruptions during the meeting.",
  },
  {
    icon: Mic,
    title: "Check Your Microphone",
    text: "Make sure your microphone is connected and working properly. Speak clearly and at a comfortable volume.",
  },
  {
    icon: ShieldCheck,
    title: "Allow Microphone Access",
    text: "When prompted, allow microphone access so the system can hear and process your responses.",
  },
  {
    icon: Wifi,
    title: "Check Your Internet",
    text: "Use a stable internet connection to prevent interruptions during the AI conversation.",
  },
  {
    icon: Target,
    title: "Stay Focused",
    text: "Keep your attention on the meeting. Avoid multitasking or having side conversations.",
  },
  {
    icon: MessageCircle,
    title: "Speak Naturally",
    text: "Respond in your own words and at a conversational pace. Take your time and articulate clearly.",
  },
];

export default function PreparePage() {
  const router = useRouter();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden font-[family-name:var(--font-lato)] text-white">
      <Image
        src="/assets/facility-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#060d18]/80" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#081321]/60 via-transparent to-[#020711]/80" aria-hidden="true" />

      <header className="absolute left-5 top-4 z-10 sm:left-8 sm:top-6">
        <Image
          src="/assets/avada_logo.png"
          alt="Avaada Electro"
          width={104}
          height={42}
          priority
          className="h-auto w-[84px] sm:w-[104px]"
        />
      </header>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-[26px] font-bold tracking-tight sm:text-[30px]">
          Prepare for Your Meeting
        </h1>
        <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-white/55 sm:text-[12px]">
          Before you begin, make sure your environment is ready for the best assessment
          experience. Our AI will be evaluating your communication and problem-solving skills.
        </p>

        <div className="mt-7 grid w-full gap-3 sm:grid-cols-2 sm:gap-4">
          {TIPS.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.title}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0c1524]/88 p-4 text-left backdrop-blur-md"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-500/15 text-sky-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white/90">
                    <span className="mr-1.5 text-sky-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {tip.title}
                  </p>
                  <p className="mt-1 text-[10px] leading-[1.5] text-white/50">{tip.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.push("/brief")}
          className="mt-7 inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-[#125ce8] via-[#0969f5] to-[#006bff] px-6 text-[13px] font-semibold text-white shadow-[0_5px_18px_rgba(0,92,235,0.25)] transition hover:brightness-110 active:scale-[0.99]"
        >
          Start Conversation
          <Play className="h-3.5 w-3.5 fill-white" />
        </button>
      </div>
    </main>
  );
}
