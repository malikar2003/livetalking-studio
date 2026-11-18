"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { OfferAnswer, SessionConfig, SpeakResult } from "@/lib/livetalking/types";

type Phase = "loading" | "idle" | "connecting" | "live" | "error";

export interface LiveTalkingPlayerHandle {
  replay: () => void;
  stop: () => void;
}

interface LiveTalkingPlayerProps {
  style?: CSSProperties;
}

export const LiveTalkingPlayer = forwardRef<LiveTalkingPlayerHandle, LiveTalkingPlayerProps>(function LiveTalkingPlayer({ style }, ref) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const sessionRef = useRef<string | null>(null);
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/livetalking/config")
      .then((response) => response.json())
      .then((data: SessionConfig) => {
        if (!cancelled) {
          setConfig(data);
          setPhase("idle");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not read the LiveTalking server configuration.");
          setPhase("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const speak = useCallback(async (sessionId: string) => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/livetalking/say", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, lineId: "greeting" }),
      });
      const data = (await response.json()) as SpeakResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not play the greeting.");
      setCaption(data.text);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not play the greeting.");
    } finally {
      setBusy(false);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!config || peerRef.current) return;
    setPhase("connecting");
    setError("");
    try {
      const isLocal = /localhost|127\.0\.0\.1|\[::1\]/.test(config.baseUrl);
      const peer = new RTCPeerConnection({
        iceServers: isLocal ? [] : [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerRef.current = peer;
      peer.addTransceiver("video", { direction: "recvonly" });
      peer.addTransceiver("audio", { direction: "recvonly" });

      peer.ontrack = (event) => {
        const video = videoRef.current;
        if (!video) return;
        const stream = video.srcObject instanceof MediaStream ? video.srcObject : new MediaStream();
        if (!stream.getTracks().includes(event.track)) stream.addTrack(event.track);
        video.srcObject = stream;
        void video.play().catch(() => setError("Tap the video to enable audio playback."));
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed") {
          peerRef.current?.close();
          peerRef.current = null;
          setPhase("error");
          setError("The video connection dropped. Restart the avatar session.");
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await waitForIceGathering(peer);
      const response = await fetch("/api/livetalking/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp: peer.localDescription?.sdp, type: peer.localDescription?.type }),
      });
      const answer = (await response.json()) as OfferAnswer & { error?: string };
      if (!response.ok || !answer.sdp || !answer.sessionid) {
        throw new Error(answer.msg ?? answer.error ?? "LiveTalking rejected the video session.");
      }
      await peer.setRemoteDescription({ type: "answer", sdp: answer.sdp });
      sessionRef.current = answer.sessionid;
      setPhase("live");
      void speak(answer.sessionid);
    } catch (cause) {
      peerRef.current?.close();
      peerRef.current = null;
      setPhase("error");
      setError(cause instanceof Error ? cause.message : "Could not connect to LiveTalking.");
    }
  }, [config, speak]);

  const stopSpeaking = useCallback(async () => {
    const sessionId = sessionRef.current;
    if (!sessionId) return;
    await fetch("/api/livetalking/interrupt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => setError("Could not stop avatar speech."));
    setSpeaking(false);
  }, []);

  useImperativeHandle(ref, () => ({
    replay: () => {
      if (sessionRef.current) void speak(sessionRef.current);
    },
    stop: () => void stopSpeaking(),
  }), [speak, stopSpeaking]);

  useEffect(() => {
    const sessionId = sessionRef.current;
    if (!sessionId || phase !== "live") return;
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/livetalking/status?sessionId=${encodeURIComponent(sessionId)}`);
        const data = (await response.json()) as { speaking?: boolean };
        if (!cancelled && typeof data.speaking === "boolean") setSpeaking(data.speaking);
      } catch {
        // A later poll will retry transient status failures.
      }
    };
    void poll();
    const timer = window.setInterval(poll, 300);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [phase]);

  useEffect(() => () => {
    peerRef.current?.getSenders().forEach((sender) => sender.track?.stop());
    peerRef.current?.close();
    peerRef.current = null;
    sessionRef.current = null;
  }, []);

  const live = phase === "live";
  const status = phase === "loading" ? "Loading" : phase === "connecting" ? "Connecting" : phase === "error" ? "Error" : live ? speaking ? "Speaking" : busy ? "Preparing" : "Connected" : config?.reachable ? "Ready" : "Waiting for server";

  return (
    <div style={style} className="group relative mx-auto aspect-[3/4] w-full max-w-[390px] overflow-hidden rounded-xl border border-white/10 bg-[#0b0f16] shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        poster="/avatars/live-talking-2323.png"
        className="h-full w-full object-cover"
        aria-label="LiveTalking customer avatar"
        onClick={() => void videoRef.current?.play().catch(() => setError("Tap to enable audio playback."))}
      />
      <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs text-white">
        {status}
      </span>

      {caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-12">
          <p className="rounded-lg bg-black/45 px-3 py-2 text-sm leading-relaxed text-white">
            {caption}
          </p>
        </div>
      )}

      {!live && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35 p-6 text-center">
          <p className="max-w-[290px] text-sm leading-relaxed text-white/90">
            {config?.reachable
              ? "Start the live avatar to hear the EdgeTTS greeting with matching lip-sync."
              : `Waiting for LiveTalking at ${config?.baseUrl ?? "…"}`}
          </p>
          <button
            type="button"
            onClick={() => void connect()}
            disabled={!config || phase === "connecting"}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {phase === "connecting" ? "Connecting…" : phase === "error" ? "Retry avatar" : "Start avatar"}
          </button>
        </div>
      )}

      {live && (
        <div className="absolute right-3 top-12 flex gap-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={() => sessionRef.current && void speak(sessionRef.current)}
            disabled={busy}
            className="rounded-md bg-black/65 px-3 py-1.5 text-xs text-white hover:bg-black/80 disabled:opacity-50"
          >
            {busy ? "Speaking…" : "Replay"}
          </button>
          <button
            type="button"
            onClick={() => void stopSpeaking()}
            className="rounded-md bg-black/65 px-3 py-1.5 text-xs text-white hover:bg-black/80"
          >
            Stop
          </button>
        </div>
      )}

      {error && (
        <p role="status" className="absolute inset-x-3 bottom-3 z-20 rounded-lg bg-red-950/90 px-3 py-2 text-xs text-white">
          {error}
        </p>
      )}
    </div>
  );
});

function waitForIceGathering(peer: RTCPeerConnection): Promise<void> {
  return new Promise((resolve) => {
    if (peer.iceGatheringState === "complete") return resolve();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      peer.removeEventListener("icegatheringstatechange", check);
      resolve();
    };
    const check = () => {
      if (peer.iceGatheringState === "complete") finish();
    };
    const timer = window.setTimeout(finish, 3000);
    peer.addEventListener("icegatheringstatechange", check);
    check();
  });
}
