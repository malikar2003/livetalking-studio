"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AreasPage() {
  const router = useRouter();
  const [user, setUser] = useState("Guest");

  useEffect(() => {
    setUser(sessionStorage.getItem("demoUser") || "Guest");
  }, []);

  const logout = () => {
    sessionStorage.removeItem("demoUser");
    router.push("/access");
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-10 font-[family-name:var(--font-lato)] text-white">
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
        className="absolute inset-0 bg-gradient-to-b from-[#081321]/45 via-transparent to-[#020711]/70"
        aria-hidden="true"
      />

      <header className="absolute left-5 top-4 z-10 pt-[env(safe-area-inset-top)] sm:left-8 sm:top-6">
        <Image
          src="/assets/avada_logo.png"
          alt="Avaada Electro"
          width={104}
          height={42}
          priority
          className="h-auto w-[84px] sm:w-[104px]"
        />
      </header>

      <section className="relative z-10 flex w-full justify-center">
        <div className="w-[min(420px,92vw)] rounded-2xl border border-white/[0.08] px-7 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:px-8">
          <h1 className="text-[24px] font-bold leading-tight">Welcome, {user}</h1>
          <p className="mt-2 text-[13px] text-white/55">
            You are signed in. Demo mode — no restrictions.
          </p>

          <button
            type="button"
            onClick={logout}
            className="mt-7 h-12 w-full rounded-lg bg-gradient-to-r from-[#125ce8] via-[#0969f5] to-[#006bff] text-[14px] font-semibold text-white shadow-[0_5px_18px_rgba(0,92,235,0.2)] transition hover:brightness-110 active:scale-[0.99]"
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
