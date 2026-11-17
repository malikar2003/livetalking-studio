import React from 'react';
import { Volume2, Play } from 'lucide-react';
import { EDGE_VOICES, FIXED_TEST_SCRIPTS, type TranscriptEntry } from '../types/avatar';

interface VoiceScriptsViewProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  onQuickTestScript: (text: string, voiceId?: string) => void;
  transcripts: TranscriptEntry[];
  onClearTranscripts: () => void;
}

export const VoiceScriptsView: React.FC<VoiceScriptsViewProps> = ({
  selectedVoice,
  onSelectVoice,
  onQuickTestScript,
  transcripts,
  onClearTranscripts,
}) => {
  return (
    <div className="space-y-8">
      {/* EdgeTTS Voice Matrix */}
      <section className="rounded-xl border border-slate-800/90 bg-[#111827]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-100">
              EdgeTTS Neural Voices
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Default speech synthesis engine for LiveTalking Echo mode with zero API keys required.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Active: {selectedVoice}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800/80 text-xs font-medium text-slate-400">
              <tr>
                <th className="px-6 py-3">Voice Identifier</th>
                <th className="px-6 py-3">Display Name</th>
                <th className="px-6 py-3">Locale</th>
                <th className="px-6 py-3">Profile</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {EDGE_VOICES.map((voice) => {
                const isActive = voice.id === selectedVoice;
                return (
                  <tr
                    key={voice.id}
                    className="transition-colors hover:bg-slate-800/35"
                  >
                    <td className="px-6 py-3.5 font-mono text-slate-200">
                      {voice.id}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-100">
                      {voice.label}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">{voice.locale}</td>
                    <td className="px-6 py-3.5 text-slate-400">{voice.gender}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectVoice(voice.id)}
                          className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {isActive ? 'Selected' : 'Use Voice'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onQuickTestScript(
                              `Testing ${voice.label} with LiveTalking Echo mode and MuseTalk lip synchronization.`,
                              voice.id,
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/70 px-2.5 py-1 font-medium text-slate-200 hover:bg-slate-800 cursor-pointer"
                        >
                          <Volume2 className="h-3 w-3" />
                          <span>Audition</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fixed Script Library */}
      <section className="rounded-xl border border-slate-800/90 bg-[#111827]">
        <div className="border-b border-slate-800/80 px-6 py-4">
          <h2 className="font-display text-base font-semibold text-slate-100">
            Fixed Echo Mode Test Scripts
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Trigger deterministic utterances to verify phoneme lip-sync timing and WebRTC audio alignment before enabling OpenAI.
          </p>
        </div>

        <div className="divide-y divide-slate-800/60">
          {FIXED_TEST_SCRIPTS.map((script) => (
            <div
              key={script.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4"
            >
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-medium text-slate-100">{script.title}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">~{script.durationHint}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{script.text}</p>
              </div>
              <button
                type="button"
                onClick={() => onQuickTestScript(script.text)}
                className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Speak in Studio</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Utterance Log */}
      <section className="rounded-xl border border-slate-800/90 bg-[#111827]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-100">
              Session Utterance Log
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Real-time log of synthesized Echo and Chat utterances sent during this session.
            </p>
          </div>
          {transcripts.length > 0 && (
            <button
              type="button"
              onClick={onClearTranscripts}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Clear Log
            </button>
          )}
        </div>

        {transcripts.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-300">No utterances sent yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Audition a voice above or trigger an Echo script from the Avatar Studio tab.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800/80 text-slate-400">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Spoken Text</th>
                  <th className="px-6 py-3">Voice</th>
                  <th className="px-6 py-3">Engine</th>
                  <th className="px-6 py-3 text-right">Synthesis RTT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transcripts.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-3 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                      {entry.timestamp}
                    </td>
                    <td className="px-6 py-3 text-slate-200 max-w-md">{entry.text}</td>
                    <td className="px-6 py-3 font-mono text-slate-300 whitespace-nowrap">
                      {entry.voice}
                    </td>
                    <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                      {entry.provider}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-slate-300 tabular-nums whitespace-nowrap">
                      {entry.latencyMs} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
