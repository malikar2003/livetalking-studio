"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
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
      <div className="absolute inset-0 bg-[#07111f]/75" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#081321]/55 via-[#081321]/10 to-[#020711]/90" aria-hidden="true" />

      <header className="absolute left-4 top-2 z-10">
        <Image
          src="/assets/avada_logo.png"
          alt="Avaada Electro"
          width={104}
          height={42}
          priority
          className="h-auto w-[100px]"
        />
      </header>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[860px] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-lato-heading text-[34px] leading-[42px] font-bold tracking-[-0.5px] sm:text-[40px] sm:leading-[48px]">
          Prepare for Your Meeting
        </h1>
        <p className="font-lato-subheading mt-3 max-w-[640px] text-[16px] leading-[26px] text-white/70">
          Before you begin, make sure your environment is ready for the best assessment
          experience. Our AI will be evaluating your communication and problem-solving skills.
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2 sm:gap-5">
          {TIPS.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.title}
                className="flex min-h-[112px] items-start gap-4 rounded-xl border border-white/10 bg-[#101e2c]/90 p-5 text-left backdrop-blur-md"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-sky-500/15 text-sky-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold leading-[20px] text-white/95">
                    <span className="mr-2 text-sky-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {tip.title}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-[19px] text-white/55">{tip.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.push("/conversation")}
          className="mt-10 inline-flex h-12 items-center gap-2 rounded-lg bg-[#0864f7] px-8 text-[14px] font-semibold text-white shadow-[0_5px_18px_rgba(0,92,235,0.25)] transition hover:brightness-110 active:scale-[0.99] cursor-pointer"
        >
          Start Conversation
          <Play className="h-3.5 w-3.5 fill-white" />
        </button>
      </div>
    </main>
  );
}
