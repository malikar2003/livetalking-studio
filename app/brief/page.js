"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  User,
  BriefcaseBusiness,
  Target,
  AlertTriangle,
  Clock3,
  Mic2,
} from "lucide-react";

const PRIORITIES = [
  "Immediate Cost Reduction (CAPEX)",
  "Proven Reliability & Quality",
  "Financial Health of Vendor",
  "Ease of Project Delivery",
  "Energy Yield Performance in-field",
];

const CHALLENGES = [
  {
    title: "Price Objection",
    text: "They have received lower quotes from Chinese competitors and expect you to match them.",
  },
  {
    title: "Competitor Comparison",
    text: "They are comparing your offering against established global brands with strong references.",
  },
];

const CRITERIA = [
  { pct: "25%", label: "Clarity" },
  { pct: "30%", label: "Objection Handling" },
  { pct: "25%", label: "Matrix Application" },
  { pct: "20%", label: "Rapport Authenticity" },
];

function AvatarArt() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-label="Rajesh Sharma portrait">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#243b57" />
          <stop offset="100%" stopColor="#0d1c30" />
        </linearGradient>
        <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b2b40" />
          <stop offset="100%" stopColor="#0a1422" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg)" />
      {/* shoulders / suit */}
      <path d="M22 200 C28 150 55 132 100 132 C145 132 172 150 178 200 Z" fill="url(#suit)" />
      {/* shirt */}
      <path d="M82 136 L100 168 L118 136 L108 130 L92 130 Z" fill="#dbe8f5" />
      <path d="M100 168 L94 200 L106 200 Z" fill="#c6d8eb" />
      {/* neck */}
      <rect x="90" y="112" width="20" height="24" rx="8" fill="#c98e6a" />
      {/* head */}
      <ellipse cx="100" cy="82" rx="33" ry="40" fill="#d9a07c" />
      {/* hair */}
      <path d="M66 78 C64 45 80 34 100 34 C120 34 137 46 134 78 C128 66 118 60 100 60 C82 60 72 66 66 78 Z" fill="#171b22" />
      {/* glasses */}
      <g fill="none" stroke="#20262e" strokeWidth="2.5">
        <rect x="74" y="76" width="23" height="16" rx="5" />
        <rect x="103" y="76" width="23" height="16" rx="5" />
        <path d="M97 82 h6" />
      </g>
      <circle cx="85" cy="84" r="2" fill="#2b3138" />
      <circle cx="115" cy="84" r="2" fill="#2b3138" />
      {/* smile */}
      <path d="M91 101 Q100 108 109 101" fill="none" stroke="#8d4f3c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" />
      <div>
        <p className="text-[9px] uppercase tracking-wide text-white/40">{label}</p>
        <p className="text-[11px] text-white/85">{value}</p>
      </div>
    </div>
  );
}

export default function BriefPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden pb-20 font-[family-name:var(--font-lato)] text-white">
      <Image
        src="/assets/facility-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#060d18]/80" aria-hidden="true" />

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

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:py-20">
        {/* Meeting brief */}
        <section className="rounded-xl border border-white/10 bg-[#0c1524]/90 p-4 backdrop-blur-md sm:p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-sky-500/20 text-sky-400">
              <FileText className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-[12px] font-bold tracking-wide">CUSTOMER MEETING BRIEF</h2>
          </div>
          <p className="mt-3 text-[11px] leading-[1.6] text-white/60">
            You are meeting Rajesh Sharma, a veteran in the renewable energy sector. They have
            installed a <span className="font-semibold text-sky-300">500kW+ utility-scale project</span>{" "}
            in Bangalore. They have independently worked with Tier-1 Chinese modules but now want to
            explore the domestic market. Your goal is to build trust, address technical concerns,
            and position Avada as a reliable partner with proven field expertise.
          </p>
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-[270px_1fr]">
          {/* Persona card */}
          <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0c1524]/90 backdrop-blur-md">
            <div className="h-[170px] w-full overflow-hidden bg-[#16263a]">
              <AvatarArt />
            </div>
            <div className="p-4">
              <h3 className="text-[15px] font-bold">Rajesh Sharma</h3>
              <p className="text-[11px] text-sky-300">IPP Buyer • Utility Projects</p>

              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  Customer Information
                </p>
                <div className="space-y-3">
                  <InfoRow icon={User} label="Name" value="Rajesh Sharma" />
                  <InfoRow icon={BriefcaseBusiness} label="Role" value="Talent & Procurement Manager" />
                  <InfoRow icon={Target} label="Focus" value="Utility-Scale Projects" />
                </div>
              </div>
            </div>
          </section>

          {/* Right column */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-[#0c1524]/90 p-4 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-wide text-sky-300">
                  Customer Priorities
                </p>
                <ul className="mt-3 space-y-2">
                  {PRIORITIES.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[10px] leading-snug text-white/70">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-white/10 bg-[#0c1524]/90 p-4 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-wide text-rose-300">
                  Challenges You May Face
                </p>
                <ul className="mt-3 space-y-3">
                  {CHALLENGES.map((item) => (
                    <li key={item.title} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                      <div>
                        <p className="text-[10px] font-semibold text-white/85">{item.title}</p>
                        <p className="mt-0.5 text-[9px] leading-snug text-white/50">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="rounded-xl border border-white/10 bg-[#0c1524]/90 p-4 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">
                Assessment Criteria
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CRITERIA.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-3 text-center"
                  >
                    <p className="text-[15px] font-bold text-sky-300">{item.pct}</p>
                    <p className="mt-1 text-[9px] leading-tight text-white/50">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#070f1c]/95 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-4 text-[10px] text-white/50">
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-sky-400" />
            Estimated Duration: 12 Minutes
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Mic2 className="h-3.5 w-3.5 text-sky-400" />
            Mode: Voice / Audio
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/persona")}
            className="text-[9px] font-semibold uppercase tracking-wide text-white/50 transition hover:text-white"
          >
            Choose another persona
          </button>
          <button
            type="button"
            onClick={() => router.push("/prepare")}
            className="h-9 rounded-lg bg-gradient-to-r from-[#125ce8] via-[#0969f5] to-[#006bff] px-6 text-[12px] font-semibold text-white shadow-[0_5px_18px_rgba(0,92,235,0.25)] transition hover:brightness-110 active:scale-[0.99]"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
