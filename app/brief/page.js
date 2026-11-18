"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  UserCheck,
  MapPin,
  AlertCircle,
  Scale,
  Clock,
  Mic,
} from "lucide-react";

const priorities = [
  { id: "01", label: "Levelized Cost of Electricity (LCOE)" },
  { id: "02", label: "BOM Reliability & Durability" },
  { id: "03", label: "Extensive Product Warranty" },
  { id: "04", label: "Financial Bankability for Debt" },
  { id: "05", label: "Energy Yield Performance (Bi-facial)" },
];

const challenges = [
  {
    icon: AlertCircle,
    title: "Price Objection",
    description: "Strong comparison with lower-priced imported alternatives.",
  },
  {
    icon: Scale,
    title: "Competitor Comparison",
    description: "Specific questions on performance versus TOPCon technology.",
  },
];

const criteria = [
  { value: "25%", label: "CLARITY", color: "text-[#3B82F6]" },
  { value: "30%", label: "OBJECTION HANDLING", color: "text-[#10B981]" },
  { value: "25%", label: "BENEFIT ARTICULATION", color: "text-[#3B82F6]" },
  { value: "20%", label: "CLOSING", color: "text-[#3B82F6]" },
];

export default function CustomerMeetingBrief() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0A111E] text-white font-sans flex flex-col justify-between selection:bg-blue-500/30">
      {/* Background Industrial Facility Image + Login-style Color Opacity Overlays */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/facility-bg.png')`,
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]/75" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#081321]/45 via-transparent to-[#020711]/70" />

      {/* Subtle Giant Watermark at Bottom */}
      <div className="pointer-events-none fixed bottom-12 left-1/2 -translate-x-1/2 z-0 select-none text-[110px] md:text-[150px] font-bold tracking-[0.28em] text-white/[0.025] whitespace-nowrap">
        AVAADA
      </div>

      {/* Top Left Brand Header */}
      <header className="relative z-10 px-6 pt-5 md:px-10 md:pt-6">
        <div className="inline-flex flex-col items-center">
          {/* Custom Stylized Infinity/Wave Emblem */}
          <svg
            width="64"
            height="22"
            viewBox="0 0 80 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-1"
          >
            <path
              d="M6 19C18 19 25 6 40 6C55 6 62 19 74 19"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M12 8C23 8 29 20 40 20C51 20 57 8 68 8"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />
          </svg>
          <span className="text-[15px] font-semibold tracking-[0.32em] text-white leading-none">
            AVAADA
          </span>
          <span className="mt-1 text-[8.5px] font-medium tracking-[0.38em] text-slate-300/90 uppercase">
            ELECTRO
          </span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto my-auto w-full max-w-[1160px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
          {/* LEFT COLUMN: Persona Card */}
          <div className="lg:col-span-4 flex flex-col rounded-2xl border border-white/[0.09] bg-[#111A2B]/80 backdrop-blur-md overflow-hidden shadow-2xl">
            {/* Portrait Top Section */}
            <div className="relative h-[300px] sm:h-[320px] w-full bg-gradient-to-b from-[#3A434E] via-[#2C3540] to-[#131C2E] overflow-hidden">
              <img
                src="/avatars/live-talking-2323.png"
                alt="Rajesh Sharma"
                className="h-full w-full object-cover object-top"
              />
              {/* Bottom Gradient Fade into Card */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#111A2B] via-[#111A2B]/85 to-transparent" />

              {/* Name & Role Overlay */}
              <div className="absolute bottom-4 left-6 right-6">
                <h2 className="text-[22px] font-bold tracking-tight text-white leading-snug">
                  Rajesh Sharma
                </h2>
                <p className="mt-0.5 text-[13px] font-medium text-slate-300">
                  IPP Buyer <span className="mx-1 text-slate-400">•</span>{" "}
                  Utility Projects
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-white/[0.08]" />

            {/* Customer Information Metadata */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-5">
                  CUSTOMER INFORMATION
                </h3>

                <div className="space-y-5">
                  {/* Company */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A2538] border border-white/[0.06] text-[#3B82F6]">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                        COMPANY
                      </p>
                      <p className="mt-0.5 text-[13.5px] font-medium text-slate-100">
                        ABC Renewable Energy
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A2538] border border-white/[0.06] text-[#3B82F6]">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                        ROLE
                      </p>
                      <p className="mt-0.5 text-[13.5px] font-medium text-slate-100">
                        Technical Procurement Manager
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A2538] border border-white/[0.06] text-[#3B82F6]">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                        LOCATION
                      </p>
                      <p className="mt-0.5 text-[13.5px] font-medium text-slate-100">
                        Mumbai, Maharashtra
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Stacked Brief, Middle Row & Assessment */}
          <div className="lg:col-span-8 flex flex-col gap-5 justify-between">
            {/* TOP CARD: Customer Meeting Brief */}
            <section className="box-border w-full max-w-[789px] rounded-[24px] border border-white/10 bg-[#0D1B2A]/60 p-8 backdrop-blur-[16px]">
              <div className="mb-[15px] flex items-center gap-3">
                <span className="h-7 w-1 rounded-full bg-[#3B82F6]" />
                <h1 className="font-lato-heading text-[24px] leading-[32px] font-bold tracking-[0.6px] uppercase text-white">
                  CUSTOMER MEETING BRIEF
                </h1>
              </div>

              <p className="font-lato-subheading text-[18px] leading-[29.25px] font-normal tracking-normal text-white/70">
                You are meeting Rajesh Sharma, a veteran in the renewable energy
                sector. ABC Renewable Energy is planning a{" "}
                <span className="font-semibold text-[#3B82F6]">
                  500MW utility-scale project
                </span>{" "}
                in Rajasthan. They have traditionally worked with Tier-1 Chinese
                manufacturers but are now exploring domestic high-efficiency
                alternatives under the &lsquo;Make in India&rsquo; initiative.
                Rajesh is known for his deep technical knowledge and focus on
                long-term project bankability.
              </p>
            </section>

            {/* MIDDLE ROW: Customer Priorities & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
              {/* Customer Priorities Card */}
              <section className="rounded-2xl border border-white/20 bg-[#0D1B2A]/70 backdrop-blur-[12px] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h2 className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#3B82F6] mb-4">
                    CUSTOMER PRIORITIES
                  </h2>
                  <ul className="space-y-3.5">
                    {priorities.map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#192842] border border-blue-500/20 text-[10.5px] font-bold text-[#3B82F6]">
                          {item.id}
                        </span>
                        <span className="text-[13px] font-medium text-slate-200">
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Challenges You May Face Card */}
              <section className="rounded-2xl border border-white/20 bg-[#0D1B2A]/70 backdrop-blur-[12px] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h2 className="text-[11.5px] font-bold uppercase tracking-[0.15em] text-[#FF5252] mb-5">
                    CHALLENGES YOU MAY FACE
                  </h2>
                  <div className="space-y-4">
                    {challenges.map((challenge) => {
                      const IconComponent = challenge.icon;
                      return (
                        <div
                          key={challenge.title}
                          className="rounded-2xl border border-[#FF5252]/[0.15] bg-[#FF5252]/[0.05] px-5 py-4"
                        >
                          <div className="flex items-start gap-3.5">
                            <IconComponent className="mt-0.5 h-5 w-5 shrink-0 text-[#FF5252]" />
                            <div>
                              <h3 className="text-[15px] font-semibold text-white leading-snug">
                                {challenge.title}
                              </h3>
                              <p className="mt-1.5 text-[13px] leading-relaxed text-[#94A3B8]">
                                {challenge.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>

            {/* BOTTOM CARD: Assessment Criteria */}
            <section className="rounded-2xl border border-white/20 bg-[#0D1B2A]/70 backdrop-blur-[12px] p-6 shadow-xl">
              <h2 className="font-lato-heading text-[16px] leading-[20px] font-bold tracking-[1.4px] uppercase text-white/60 mb-4">
                ASSESSMENT CRITERIA
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {criteria.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#182132]/85 px-3 py-4 text-center"
                  >
                    <span
                      className={`text-[21px] font-bold tracking-tight ${item.color}`}
                    >
                      {item.value}
                    </span>
                    <span className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Bottom Sticky/Docked Action Bar */}
      <footer
        className="relative z-10 w-full backdrop-blur-md px-6 py-3.5 md:px-10"
        style={{
          background: "linear-gradient(0deg, #07111F 0%, rgba(7, 17, 31, 0) 100%)",
        }}
      >
        <div className="mx-auto flex max-w-[1360px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Metadata Indicators */}
          <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#3B82F6]" />
              <span>
                Estimated Duration:{" "}
                <strong className="font-semibold text-slate-200">
                  8-12 Minutes
                </strong>
              </span>
            </div>

            <span className="hidden sm:inline-block h-4 w-px bg-white/15" />

            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-[#10B981]" />
              <span>
                Mode:{" "}
                <strong className="font-semibold text-slate-200">
                  Voice / Hindi
                </strong>
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center justify-end gap-6">
            <button
              type="button"
              className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              CHOOSE ANOTHER PERSONA
            </button>
            <button
              type="button"
              onClick={() => router.push("/prepare")}
              className="rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] px-10 py-2.5 text-[13.5px] font-semibold text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
