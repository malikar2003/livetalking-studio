import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Square, Video, User } from 'lucide-react';
import type {
  AvatarProfile,
  ConnectionState,
  PipelineTarget,
  WebRTCStatsSnapshot,
} from '../types/avatar';

interface AvatarStageProps {
  avatar: AvatarProfile;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  connectionState: ConnectionState;
  pipeline: PipelineTarget;
  isSpeaking: boolean;
  activeCaption: string;
  activeWord: string;
  muted: boolean;
  spectrum: number[];
  stats: WebRTCStatsSnapshot;
  errorMessage: string | null;
  onToggleMute: () => void;
  onInterrupt: () => void;
  onConnect: () => void;
}

export const AvatarStage: React.FC<AvatarStageProps> = ({
  avatar,
  videoRef,
  connectionState,
  pipeline,
  isSpeaking,
  activeCaption,
  activeWord,
  muted,
  spectrum,
  stats,
  errorMessage,
  onToggleMute,
  onInterrupt,
  onConnect,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [avatar.imageUrl]);

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <section className="flex flex-col rounded-xl border border-slate-800/90 bg-[#111827] overflow-hidden">
      {/* Stage header metadata row (unboxed inline typography) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-100">{avatar.name}</span>
          <span aria-hidden="true">·</span>
          <span>{avatar.role}</span>
          <span aria-hidden="true">·</span>
          <span>
            {pipeline === 'livetalking-remote'
              ? 'LiveTalking + MuseTalk'
              : 'Browser WebRTC Preview'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              Live WebRTC Stream
            </span>
          ) : isConnecting ? (
            <span className="font-medium text-sky-400">Connecting WebRTC...</span>
          ) : (
            <span className="text-slate-400">Standby Reference</span>
          )}
        </div>
      </div>

      {/* Dominant visual anchor: studio portrait & WebRTC video canvas */}
      <div className="relative flex min-h-[480px] lg:min-h-[560px] items-center justify-center bg-[#090D14] p-4 sm:p-6">
        <div className="relative h-[440px] sm:h-[520px] aspect-[3/4] max-w-full overflow-hidden rounded-lg border border-slate-800/90 bg-slate-950 shadow-2xl">
          {/* Reference portrait visible until live WebRTC stream connects */}
          {!isConnected && (
            <>
              {!imgFailed ? (
                <img
                  src={avatar.imageUrl}
                  alt={`${avatar.name} studio avatar reference portrait`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-center">
                  <User className="h-12 w-12 text-slate-500" />
                  <p className="text-sm font-medium text-slate-300">{avatar.name}</p>
                </div>
              )}
            </>
          )}

          {/* Live WebRTC <video> stream element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className={`h-full w-full object-cover ${isConnected ? 'block' : 'hidden'}`}
          />

          {/* Measured bottom contrast scrim for captions & connect prompt */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

          {/* Spoken subtitle / active word overlay */}
          {isConnected && (isSpeaking || activeCaption) && (
            <div className="absolute inset-x-4 bottom-4 flex flex-col gap-1.5">
              {activeWord && (
                <span className="font-mono text-[11px] font-medium text-sky-300">
                  Word: {activeWord}
                </span>
              )}
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-100">
                {activeCaption}
              </p>
            </div>
          )}

          {/* Standby action overlay before stream starts */}
          {!isConnected && (
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                <p className="font-medium text-slate-100">Ready for Echo Lip-Sync</p>
                <p className="text-slate-400">EdgeTTS · 30 fps WebRTC</p>
              </div>
              <button
                type="button"
                onClick={onConnect}
                disabled={isConnecting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-medium text-slate-950 transition-colors hover:bg-sky-400 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
              >
                <Video className="h-3.5 w-3.5" />
                <span>{isConnecting ? 'Connecting...' : 'Start Stream'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error banner if remote server negotiation failed */}
      {errorMessage && (
        <div className="border-t border-rose-900/60 bg-rose-950/35 px-5 py-3 text-xs text-rose-200">
          {errorMessage}
        </div>
      )}

      {/* Stage footer: audio spectrum + real WebRTC transport stats + audio controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 bg-[#0E1420] px-5 py-3">
        <div className="flex items-center gap-4">
          {/* Audio frequency bars */}
          <div
            className="flex h-6 items-end gap-0.5"
            aria-label="Audio output level visualizer"
          >
            {spectrum.map((level, idx) => (
              <span
                key={idx}
                className={`w-1 rounded-sm transition-transform duration-75 ${
                  isSpeaking ? 'bg-sky-400' : 'bg-slate-700'
                }`}
                style={{
                  height: `${Math.max(12, Math.round(level * 100))}%`,
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-slate-400 tabular-nums">
            <span>{stats.resolution}</span>
            <span aria-hidden="true">·</span>
            <span>{stats.fps} fps</span>
            <span aria-hidden="true">·</span>
            <span>{stats.bitrateKbps} kbps</span>
            <span aria-hidden="true">·</span>
            <span>ICE {stats.iceState}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{muted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            type="button"
            onClick={onInterrupt}
            disabled={!isSpeaking}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Square className="h-3 w-3" />
            <span>Stop Speech</span>
          </button>
        </div>
      </div>
    </section>
  );
};
