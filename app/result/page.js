"use client";

import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";

const RESULTS = [
  {
    label: "CLARITY",
    criteria: "25%",
    achieved: "21%",
    fill: 84,
    color: "#22C55E",
  },
  {
    label: "OBJECTION HANDLING",
    criteria: "30%",
    achieved: "24%",
    fill: 80,
    color: "#3B82F6",
  },
  {
    label: "BENEFIT ARTICULATION",
    criteria: "25%",
    achieved: "20%",
    fill: 80,
    color: "#22C55E",
  },
  {
    label: "CLOSING",
    criteria: "20%",
    achieved: "17%",
    fill: 85,
    color: "#3B82F6",
  },
];

export default function ResultScreen() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0A1322] px-4 py-8 font-sans text-white">
      {/* Same avatar scene, dimmed behind the result card */}
      <div className="absolute inset-0 opacity-25 blur-[2px]">
        <Image
          src="/avatars/live-talking-2323.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Result Card */}
      <section className="relative z-10 w-full max-w-[440px] rounded-[24px] border border-white/10 bg-gradient-to-b from-[#1B2C43] via-[#162739] to-[#0F1E31] px-7 py-7 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
        {/* Success Icon */}
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#22C55E]/15 ring-[6px] ring-[#22C55E]/10">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#22C55E] shadow-[0_0_18px_rgba(34,197,94,0.45)]">
            <Check className="h-5 w-5 text-[#0B1A12] stroke-[3]" />
          </div>
        </div>

        <h1 className="mt-4 text-center text-[24px] font-bold leading-tight tracking-tight text-white">
          Great Response
        </h1>
        <p className="mt-1.5 text-center text-[13px] leading-[20px] text-white/50">
          You effectively addressed the customer&apos;s concern.
        </p>

        <h2 className="mt-7 text-[16px] font-bold text-white">
          Your Assessment Result
        </h2>

        {/* Criteria Breakdown */}
        <div className="mt-5 space-y-5">
          {RESULTS.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45">
                  {item.label}
                </span>
                <span className="whitespace-nowrap text-[10px] text-white/45">
                  Criteria {item.criteria}
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: item.color }}
                  >
                    Achieved {item.achieved}
                  </span>
                </span>
              </div>
              <div className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.fill}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Overall Achievement */}
        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
            Overall Achievement
          </p>
          <p className="mt-1 text-[34px] font-bold leading-none tracking-tight text-white">
            82%
          </p>
        </div>
      </section>
    </div>
  );
}
