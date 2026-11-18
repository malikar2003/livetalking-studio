"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
const NEXT_ROUTE = "/access";
const LOAD_MS = 200;
const START_PCT = 5;
const NAV_DELAY_MS = 200;
const DISSOLVE_MS = 300; // keep in sync with `duration-300` on <main>
const CURVE = "M795 208 C 600 112, 330 62, 36 60";

function makeBezier(p1x, p1y, p2x, p2y) {
  const cx = (t) =>
    3 * p1x * t * (1 - t) ** 2 + 3 * p2x * t * t * (1 - t) + t ** 3;
  const cy = (t) =>
    3 * p1y * t * (1 - t) ** 2 + 3 * p2y * t * t * (1 - t) + t ** 3;
  return (x) => {
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 24; i++) {
      t = (lo + hi) / 2;
      if (cx(t) < x) lo = t;
      else hi = t;
    }
    return cy(t);
  };
}
const ease = makeBezier(0.65, 0, 0.35, 1);

export default function SplashScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(START_PCT);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    router.prefetch(NEXT_ROUTE);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduceMotion ? 400 : LOAD_MS;
    const timers = [];
    let raf = 0;
    let start = null;

    const tick = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setProgress(START_PCT + (100 - START_PCT) * ease(p));

      if (p < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      timers.push(
        setTimeout(() => {
          setLeaving(true);
          timers.push(setTimeout(() => router.push(NEXT_ROUTE), DISSOLVE_MS));
        }, NAV_DELAY_MS)
      );
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [router]);

  const pct = Math.round(progress);
  // 0 -> 1 with the same easing as the progress bar, so the curve draws in step with it.
  const drawn = (progress - START_PCT) / (100 - START_PCT);

  return (
    <main
      aria-label="Loading Avaada Electro"
      className={[
        "fixed inset-0 flex items-center justify-center overflow-hidden text-white",
        "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
        "bg-[#182E7B] bg-[radial-gradient(51.95%_92.36%_at_100%_94.4%,#00B8ED_0%,#087FBA_20%,#1B4A98_50.7%,#1C347F_75.19%,#182E7B_100%)]",
        "transition-opacity duration-300 ease-out",
        leaving ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
    >
      {/* Curve: starts at the lower-right end and draws toward the upper-left */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 825 464"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <mask
            id="curve-reveal"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="825"
            height="464"
          >
            <path
              d={CURVE}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={24}
              strokeDasharray={1}
              strokeDashoffset={1 - drawn}
            />
          </mask>
        </defs>

        <path
          d={CURVE}
          fill="none"
          stroke="#fff"
          strokeWidth={1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          mask="url(#curve-reveal)"
        />
      </svg>

      <div className="relative z-10 flex max-h-[100dvh] w-[min(560px,88vw)] flex-col items-center overflow-y-auto py-6 text-center">
        <Image
          src="/assets/avada_logo.png"
          alt="Logo"
          width={586}
          height={237}
          className="h-auto w-[min(440px,76vw)]"
        />
        <p className="mb-[40px] mt-[24px] w-[508px] max-w-full text-center font-[family-name:var(--font-lato)] text-[clamp(15px,2.4vw,20px)] font-normal leading-[1.5] tracking-normal text-white/80 [text-wrap:balance] sm:mb-[80px] sm:mt-[36px]">
          Explore our advanced solar manufacturing ecosystem through an
          immersive virtual experience.
        </p>

        <div className="w-[min(450px,75vw)]">
          <div className="mb-[10px] flex items-baseline justify-between text-[12px] uppercase tracking-[0.06em] text-white/60">
            <span>{pct >= 100 ? "Ready" : "Initializing"}</span>
            <span className="font-bold tracking-normal text-white">{pct}%</span>
          </div>
          <div
            className="h-[4px] overflow-hidden rounded-sm bg-white/30"
            role="progressbar"
            aria-label="Loading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <i
              className="block h-full rounded-sm bg-[#00AEEF]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
