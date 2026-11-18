"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Clock, Check } from "lucide-react";

const CARD_GEOMETRY = {
  borderRadius: "26.4px",
  padding: "35.2px",
  minHeight: "400px",
  backdropFilter: "blur(26.4px)",
  WebkitBackdropFilter: "blur(26.4px)",
  opacity: 1,
};

const CARD_STYLE_ACTIVE = {
  ...CARD_GEOMETRY,
  background:
    "linear-gradient(180deg, rgba(13, 27, 42, 0.8) 0%, rgba(30, 99, 181, 0.3) 100%)",
  border: "1.1px solid #26A6FF",
  boxShadow: "0px 0px 33px 1.1px #26A6FF1A inset",
};

const CARD_STYLE_IDLE = {
  ...CARD_GEOMETRY,
  background: "rgba(12, 21, 36, 0.85)",
  border: "1.1px solid rgba(255, 255, 255, 0.10)",
};

const PERSONAS = [
  {
    id: "residential",
    badge: "BEGINNER",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    title: "Residential Buyer",
    description:
      "Represents individual customers seeking rooftop solar and confidence before purchasing.",
    concerns: ["Product Quality", "Financing Options", "Local Support"],
  },
  {
    id: "ci",
    badge: "INTERMEDIATE",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    title: "C&I Buyer",
    description:
      "Represents commercial and industrial decision-makers focused on business outcomes.",
    concerns: ["ROI & Payback", "Operational Reliability", "Warranties"],
  },
  {
    id: "ipp",
    badge: "ADVANCED",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    title: "IPP Buyer",
    description:
      "Represents developers, cable operators and institutional procurement teams.",
    concerns: ["LCOE Optimization", "Long-Term Bankability", "Warranty Coverage"],
  },
];

export default function PersonaPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("ci");

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

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-[26px] font-bold tracking-tight sm:text-[30px]">
          Choose Your Customer Persona
        </h1>
        <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-white/55 sm:text-[12px]">
          Each customer type presents unique business challenges, priorities, and
          decision-making criteria. Select a persona to begin your simulation journey.
        </p>

        <div className="mt-8 grid w-full gap-3 sm:gap-4 md:grid-cols-3">
          {PERSONAS.map((persona) => {
            const active = selected === persona.id;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelected(persona.id)}
                style={active ? CARD_STYLE_ACTIVE : CARD_STYLE_IDLE}
                className="relative flex flex-col text-left transition"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded border px-2 py-0.5 text-[9px] font-bold tracking-wide ${persona.badgeClass}`}
                  >
                    {persona.badge}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-white/45">
                    <Clock className="h-3 w-3" />
                    9-12 Mins
                  </span>
                </div>

                <h2 className="mt-4 text-[15px] font-bold">{persona.title}</h2>
                <p className="mt-1.5 text-[11px] leading-[1.5] text-white/55">
                  {persona.description}
                </p>

                <div className="mt-auto pt-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40">
                    Key Concerns
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {persona.concerns.map((concern) => (
                      <span
                        key={concern}
                        className={`rounded-md border px-2 py-1 text-[9px] ${
                          active
                            ? "border-sky-400/30 bg-sky-400/10 text-sky-200"
                            : "border-white/10 bg-white/[0.04] text-white/60"
                        }`}
                      >
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>

                {active && (
                  <span className="absolute right-3 top-14 grid h-4 w-4 place-items-center rounded-full bg-sky-500 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.push("/brief")}
          className="mt-7 h-10 w-[130px] rounded-lg bg-gradient-to-r from-[#125ce8] via-[#0969f5] to-[#006bff] text-[13px] font-semibold text-white shadow-[0_5px_18px_rgba(0,92,235,0.25)] transition hover:brightness-110 active:scale-[0.99]"
        >
          Next
        </button>
      </div>
    </main>
  );
}
