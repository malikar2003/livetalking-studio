"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/** Direct demo login: any credentials are accepted, no backend required. */
export default function AccessPage() {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  const enter = (username) => {
    if (busy) return;
    setBusy("Signing in…");
    if (typeof window !== "undefined") {
      sessionStorage.setItem("demoUser", username || "Guest");
    }
    router.push("/areas");
  };

  const submitLogin = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    enter(String(form.get("login-id") || "").trim() || "Guest");
  };

  const startSsoLogin = () => enter("SSO User");

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
        <div
          className="w-[min(420px,92vw)] rounded-2xl border border-white/[0.08] px-7 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:px-8"
          style={{
            background:
              "linear-gradient(180deg, rgba(17, 31, 47, 0.97) 0%, rgba(11, 23, 37, 0.97) 100%)",
          }}
        >
          <div className="mx-auto mb-5 grid h-10 w-10 place-items-center rounded-full bg-[#0b83cf]/20 text-[#18a9ff]">
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a5 5 0 0 0-5 5v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 7V7a3 3 0 1 1 6 0v2H9Zm3 4a1.75 1.75 0 0 1 1 3.19V18h-2v-1.81A1.75 1.75 0 0 1 12 13Z" />
            </svg>
          </div>

          <h1 className="text-center text-[24px] font-bold leading-tight tracking-[-0.02em]">
            Welcome Back
          </h1>
          <p className="mt-2 text-center text-[13px] text-white/55">
            Choose your preferred login method
          </p>

          <form className="mt-7 space-y-4" onSubmit={submitLogin} autoComplete="off">
            <label className="block text-left text-[12px] text-white/75">
              Username
              <input
                type="text"
                name="login-id"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                placeholder="Enter your username"
                required
                className="access-field mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#091522]/80 px-3 text-[13px] text-white outline-none transition placeholder:text-white/30 focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/20"
              />
            </label>

            <label className="block text-left text-[12px] text-white/75">
              Password
              <input
                type="password"
                name="login-secret"
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
                placeholder="Enter your password"
                required
                className="access-field mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#091522]/80 px-3 text-[13px] text-white outline-none transition placeholder:text-white/30 focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/20"
              />
            </label>

            <button
              type="submit"
              disabled={!!busy}
              className="mt-1 h-12 w-full rounded-lg bg-gradient-to-r from-[#125ce8] via-[#0969f5] to-[#006bff] text-[14px] font-semibold text-white shadow-[0_5px_18px_rgba(0,92,235,0.2)] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
            >
              {busy || "Login"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.12em] text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            Or continue with
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={startSsoLogin}
            disabled={!!busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/[0.04] bg-[#243141]/90 text-[13px] font-medium text-white/90 transition hover:bg-[#2b3a4b] active:scale-[0.99] disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Login with SSO
          </button>

          <p
            className="mt-3 min-h-4 text-center text-[11px] text-white/50"
            role="status"
            aria-live="polite"
          >
            {busy}
          </p>
        </div>
      </section>
    </main>
  );
}
