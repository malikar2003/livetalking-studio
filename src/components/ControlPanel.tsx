import React from 'react';
import {
  Send,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mic,
  MicOff,
  ImagePlus,
  Sparkles,
} from 'lucide-react';
import {
  AVATAR_PROFILES,
  EDGE_VOICES,
  EMOTION_PRESETS,
  FIXED_TEST_SCRIPTS,
  getEmotionPreset,
  type AvatarEmotion,
  type AvatarProfile,
  type ConnectionState,
  type PipelineTarget,
  type SpeechMode,
} from '../types/avatar';
import type { ProbeResult } from '../services/livetalkingClient';
import type { VoiceInputLanguage } from '../services/browserSpeechRecognition';

interface ControlPanelProps {
  selectedAvatar: AvatarProfile;
  onSelectAvatar: (avatar: AvatarProfile) => void;
  pipeline: PipelineTarget;
  onSelectPipeline: (pipeline: PipelineTarget) => void;
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
  probeResult: ProbeResult | null;
  probing: boolean;
  onProbeServer: () => void;
  speechMode: SpeechMode;
  onSelectSpeechMode: (mode: SpeechMode) => void;
  openaiConfigured: boolean;
  voiceId: string;
  onVoiceChange: (voiceId: string) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  emotion: AvatarEmotion;
  onSelectEmotion: (emotion: AvatarEmotion) => void;
  geminiConfigured: boolean;
  generatingEmotions: boolean;
  onGenerateEmotions: () => void;
  onUploadExpression: (emotion: AvatarEmotion, file: File) => void;
  scriptText: string;
  onScriptTextChange: (text: string) => void;
  connectionState: ConnectionState;
  isSendingSpeech: boolean;
  onSpeak: () => void;
  recognitionLanguage: VoiceInputLanguage;
  onRecognitionLanguageChange: (language: VoiceInputLanguage) => void;
  isListening: boolean;
  speechInputSupported: boolean;
  voiceTranscript: string;
  onToggleVoiceInput: () => void;
  statusNote: string | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedAvatar,
  onSelectAvatar,
  pipeline,
  onSelectPipeline,
  serverUrl,
  onServerUrlChange,
  probeResult,
  probing,
  onProbeServer,
  speechMode,
  onSelectSpeechMode,
  openaiConfigured,
  voiceId,
  onVoiceChange,
  rate,
  onRateChange,
  emotion,
  onSelectEmotion,
  geminiConfigured,
  generatingEmotions,
  onGenerateEmotions,
  onUploadExpression,
  scriptText,
  onScriptTextChange,
  connectionState,
  isSendingSpeech,
  onSpeak,
  recognitionLanguage,
  onRecognitionLanguageChange,
  isListening,
  speechInputSupported,
  voiceTranscript,
  onToggleVoiceInput,
  statusNote,
}) => {
  const isConnected = connectionState === 'connected';

  return (
    <aside className="flex flex-col rounded-xl border border-slate-800/90 bg-[#111827] divide-y divide-slate-800/80">
      {/* 1. Transport Pipeline */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold text-slate-100">
            Streaming Pipeline
          </h2>
          <span className="font-mono text-xs text-slate-400">WebRTC · MuseTalk</span>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#0B0F17] p-1 border border-slate-800/80">
          <button
            type="button"
            onClick={() => onSelectPipeline('preview-webrtc')}
            className={`rounded-md px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              pipeline === 'preview-webrtc'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Browser WebRTC
          </button>
          <button
            type="button"
            onClick={() => onSelectPipeline('livetalking-remote')}
            className={`rounded-md px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              pipeline === 'livetalking-remote'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LiveTalking GPU
          </button>
        </div>

        {pipeline === 'livetalking-remote' ? (
          <div className="space-y-2.5 pt-1">
            <label className="block text-xs text-slate-400" htmlFor="livetalking-url">
              LiveTalking Server URL
            </label>
            <div className="flex gap-2">
              <input
                id="livetalking-url"
                type="url"
                value={serverUrl}
                onChange={(e) => onServerUrlChange(e.target.value)}
                placeholder="http://127.0.0.1:8010"
                className="min-w-0 flex-1 rounded-lg border border-slate-700/80 bg-[#0B0F17] px-3 py-2 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={onProbeServer}
                disabled={probing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${probing ? 'animate-spin' : ''}`} />
                <span>Probe</span>
              </button>
            </div>

            {probeResult && (
              <div
                className={`flex items-center gap-2 text-xs ${
                  probeResult.reachable ? 'text-emerald-400' : 'text-amber-300'
                }`}
              >
                {probeResult.reachable ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>
                  {probeResult.reachable
                    ? `Server reachable (${probeResult.latencyMs} ms)`
                    : `Not reachable at ${probeResult.serverUrl}${probeResult.detail ? ` (${probeResult.detail})` : ''}. Start LiveTalking or switch to Browser WebRTC.`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-slate-400">
            Runs real local WebRTC loopback with EdgeTTS neural voice synthesis and real-time lip-sync—no GPU server required to test.
          </p>
        )}
      </div>

      {/* 2. Photorealistic Avatar Selection */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-slate-100">
            Photorealistic Avatar
          </h2>
          <span className="font-mono text-xs text-slate-400">
            {selectedAvatar.liveTalkingAvatarId}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {AVATAR_PROFILES.map((item) => {
            const active = item.id === selectedAvatar.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectAvatar(item)}
                className={`group flex flex-col overflow-hidden rounded-lg border text-left transition-colors cursor-pointer ${
                  active
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-800 bg-[#0B0F17] hover:border-slate-700'
                }`}
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="px-2.5 py-2">
                  <p className="truncate text-xs font-medium text-slate-100">{item.name}</p>
                  <p className="truncate text-[11px] text-slate-400">{item.role}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Speech Mode (Echo vs Future OpenAI) */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold text-slate-100">
            Speech Routing
          </h2>
          <span className="text-xs text-slate-400">
            {openaiConfigured ? 'OpenAI Key Detected' : 'AI replies need an OpenAI key'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#0B0F17] p-1 border border-slate-800/80">
          <button
            type="button"
            onClick={() => onSelectSpeechMode('echo')}
            className={`rounded-md px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              speechMode === 'echo'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Echo Mode (Fixed Text)
          </button>
          <button
            type="button"
            onClick={() => onSelectSpeechMode('openai-ready')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              speechMode === 'openai-ready'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {!openaiConfigured && <Lock className="h-3 w-3 text-slate-400" />}
            <span>OpenAI Chat</span>
          </button>
        </div>

        {speechMode === 'openai-ready' && !openaiConfigured && (
          <div className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs leading-relaxed text-slate-300">
            <span className="font-medium text-slate-100">AI chat needs a key:</span>{' '}
            Add <code className="text-sky-400">OPENAI_API_KEY</code> to the project’s local <code className="text-sky-400">.env</code> file and restart the app. Voice input uses your selected Hindi or English language.
          </div>
        )}
      </div>

      {/* 4. EdgeTTS Voice Settings */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-slate-100">
            EdgeTTS Voice
          </h2>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {rate.toFixed(1)}× speed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="edge-voice" className="sr-only">
              EdgeTTS Neural Voice
            </label>
            <select
              id="edge-voice"
              value={voiceId}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full rounded-lg border border-slate-700/80 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
            >
              {EDGE_VOICES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.label} ({voice.locale})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-1.5">
            <span className="text-xs text-slate-400 shrink-0">Rate</span>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.1"
              value={rate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
              aria-label="Speech rate"
            />
          </div>
        </div>
      </div>

      {/* 5. Emotion / Expression */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold text-slate-100">
            Emotion / Expression
          </h2>
          <span className="font-mono text-xs text-slate-400">
            {getEmotionPreset(emotion).emoji} {getEmotionPreset(emotion).label}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {EMOTION_PRESETS.map((preset) => {
            const active = preset.id === emotion;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectEmotion(preset.id)}
                title={preset.hint}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] font-medium transition-colors cursor-pointer ${
                  active
                    ? 'border-sky-500 bg-sky-500/10 text-sky-200'
                    : 'border-slate-800 bg-[#0B0F17] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <span className="text-base leading-none" aria-hidden="true">
                  {preset.emoji}
                </span>
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          {getEmotionPreset(emotion).hint}. When a real portrait is available the face itself
          changes; otherwise only natural head motion, blinking and voice tone change. Facial
          expressions apply to the Browser WebRTC preview only.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 cursor-pointer">
            <ImagePlus className="h-3.5 w-3.5" />
            <span>Upload {getEmotionPreset(emotion).label} photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUploadExpression(emotion, file);
                event.target.value = '';
              }}
            />
          </label>

          <button
            type="button"
            onClick={onGenerateEmotions}
            disabled={!geminiConfigured || generatingEmotions}
            title={
              geminiConfigured
                ? `Generate real expression portraits for ${selectedAvatar.name}`
                : 'Add GEMINI_API_KEY to .env and restart to enable'
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-45 cursor-pointer"
          >
            <Sparkles
              className={`h-3.5 w-3.5 ${generatingEmotions ? 'animate-pulse' : ''}`}
            />
            <span>{generatingEmotions ? 'Generating…' : 'Generate portraits'}</span>
          </button>
        </div>

        {!geminiConfigured && (
          <p className="text-[11px] leading-relaxed text-slate-500">
            For automatic realistic portraits, add{' '}
            <code className="text-sky-400">GEMINI_API_KEY</code> to{' '}
            <code className="text-sky-400">.env</code>, restart the app, then press Generate.
          </p>
        )}
      </div>

      {/* 6. Fixed Script & Echo Dispatch */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold text-slate-100">
            {speechMode === 'echo' ? 'Fixed Echo Text' : 'Chat Prompt'}
          </h2>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {scriptText.length} chars
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FIXED_TEST_SCRIPTS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onScriptTextChange(preset.text)}
              className="rounded-md border border-slate-700/80 bg-[#0B0F17] px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100 whitespace-nowrap cursor-pointer"
            >
              {preset.title}
            </button>
          ))}
        </div>

        <textarea
          rows={4}
          value={scriptText}
          onChange={(e) => onScriptTextChange(e.target.value)}
          placeholder={
            speechMode === 'echo'
              ? 'Enter fixed text for the avatar to speak directly in Echo mode...'
              : 'Enter a message for the OpenAI chatbot adapter...'
          }
          className="w-full resize-none rounded-lg border border-slate-700/80 bg-[#0B0F17] p-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <span>Mic language</span>
            <select
              value={recognitionLanguage}
              onChange={(event) =>
                onRecognitionLanguageChange(event.target.value as VoiceInputLanguage)
              }
              disabled={isListening}
              className="rounded-md border border-slate-700 bg-[#0B0F17] px-2 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none disabled:opacity-50"
              aria-label="Speech recognition language"
            >
              <option value="hi-IN">हिन्दी</option>
              <option value="en-IN">English</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onToggleVoiceInput}
            disabled={!speechInputSupported || isSendingSpeech}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
              isListening
                ? 'border-rose-500/60 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25'
                : 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
            }`}
            aria-pressed={isListening}
          >
            {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            <span>{isListening ? 'Stop & send' : 'Speak to chat'}</span>
          </button>
        </div>

        <p className="text-xs leading-relaxed text-slate-400" aria-live="polite">
          {!speechInputSupported
            ? 'Voice input requires Chrome or Edge with microphone permission.'
            : voiceTranscript ||
              'Choose Hindi or English, allow microphone access, then speak. Browser speech recognition may use its online service; AI replies send the transcript to OpenAI when configured.'}
        </p>

        {statusNote && (
          <p className="text-xs text-sky-300">{statusNote}</p>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Server className="h-3.5 w-3.5" />
            <span>
              {isConnected
                ? pipeline === 'livetalking-remote'
                  ? 'POST /human (type: echo)'
                  : 'EdgeTTS + WebRTC'
                : 'Connects stream automatically'}
            </span>
          </span>

          <button
            type="button"
            onClick={onSpeak}
            disabled={!scriptText.trim() || isSendingSpeech}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-400 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>
              {isSendingSpeech
                ? 'Synthesizing...'
                : speechMode === 'echo'
                  ? 'Speak (Echo Mode)'
                  : 'Send & Speak'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
