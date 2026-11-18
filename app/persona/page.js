"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Clock } from "lucide-react";

const CARD_GEOMETRY = {
  borderRadius: "16px",
  padding: "24px",
  minHeight: "370px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
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
  background: "rgba(13, 27, 42, 0.6)",
  border: "1px solid #FFFFFF4D",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};
const PERSONAS = [
  {
    id: "residential",
    badge: "BEGINNER",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    title: "Residential Buyer",
    description:
      "Represents individual customers seeking trust and confidence before purchasing.",
    concerns: ["Product Quality", "Financing Options", "Local Support"],
  },
  {
    id: "ci",
    badge: "INTERMEDIATE",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    title: "C&I Buyer",
    description:
      "Represents commercial and industrial decision-makers focused on business outcomes.",
    concerns: ["ROI & Payback", "Operational Reliability", "Maintenance"],
  },
  {
    id: "ipp",
    badge: "ADVANCED",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    title: "IPP Buyer",
    description:
      "Represents large utility-scale buyers and technical procurement teams.",
    concerns: [
      "LCOE Competitiveness",
      "Long-Term Bankability",
      "Warranty Coverage",
    ],
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
      <div className="absolute inset-0 bg-[#07111f]/75" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#081321]/55 via-[#081321]/10 to-[#020711]/90"
        aria-hidden="true"
      />

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

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1200px] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="mb-4 text-center font-lato-heading text-[52.8px] leading-[52.8px] font-bold tracking-[-1.32px]">
          Choose Your Customer Persona
        </h1>
        <p className="mt-2 max-w-[540px] text-center font-lato-subheading text-[19.8px] leading-[32.17px] font-normal tracking-normal text-white/80">
          Each customer type presents unique business challenges, priorities,
          and decision-making criteria. Select a persona to begin your
          simulation journey.
        </p>

        <div className="mt-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {" "}
          {PERSONAS.map((persona) => {
            const active = selected === persona.id;

            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelected(persona.id)}
                style={active ? CARD_STYLE_ACTIVE : CARD_STYLE_IDLE}
                className="relative flex min-h-[370px] w-full flex-col rounded-[24px] border border-white/30 p-10 text-left backdrop-blur-[16px] transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full border px-[13.2px] py-[4.4px] font-lato-heading text-[13.2px] leading-[17.6px] font-bold tracking-[0.66px] uppercase ${persona.badgeClass}`}
                  >
                    {persona.badge}
                  </span>

                  <span className="flex items-center gap-1 text-[10px] text-white/45">
                    <Clock className="h-3 w-3" />
                    9-12 Mins
                  </span>
                </div>

                <h2 className="mt-7 font-lato-heading text-[26.4px] leading-[35.2px] font-bold">
                  {persona.title}
                </h2>

                <p className="mt-1.5 font-lato-subheading text-[16px] leading-[25.02px] font-normal text-white/65">
                  {persona.description}
                </p>

                <div className="mt-[77px]">
                  <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-white/55">
                    Key Concerns
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
                    {persona.concerns.map((concern) => (
                      <span
                        key={concern}
                        className={`rounded-full border px-2 py-1 font-lato-subheading text-[13px] leading-[17.6px] font-normal tracking-[0.001em] ${
                          active
                            ? "border-white/10 bg-white/[0.05] text-white/80"
                            : "border-white/10 bg-white/[0.05] text-white/60"
                        }`}
                      >
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.push("/brief")}
          className="mt-14 flex h-16 w-[241px] items-center justify-center gap-3 rounded-xl bg-[#0055FF] px-8 py-[14px] font-montserrat text-[22px] leading-[28px] font-bold tracking-[0.0638px] text-center text-white shadow-[0px_8px_24px_0px_#1E63B54D] transition hover:brightness-110 active:scale-[0.99]"
        >
          Next
        </button>
      </div>
    </main>
  );
}
