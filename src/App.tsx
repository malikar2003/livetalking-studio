import { useCallback, useEffect, useRef, useState } from 'react';
import { TopBar, type ActiveTab } from './components/TopBar';
import { AvatarStage } from './components/AvatarStage';
import { ControlPanel } from './components/ControlPanel';
import { VoiceScriptsView } from './components/VoiceScriptsView';
import { SetupGuideView } from './components/SetupGuideView';
import {
  AVATAR_PROFILES,
  FIXED_TEST_SCRIPTS,
  getEmotionPreset,
  type AvatarEmotion,
  type AvatarProfile,
  type ConnectionState,
  type PipelineTarget,
  type SpeechMode,
  type TranscriptEntry,
  type WebRTCStatsSnapshot,
} from './types/avatar';
import {
  connectRemoteWebRTC,
  interruptLiveTalking,
  probeLiveTalkingServer,
  readWebRTCStats,
  sendHumanSpeak,
  type ProbeResult,
  type RemoteSessionHandle,
} from './services/livetalkingClient';
import { PreviewAvatarEngine } from './services/previewAvatarEngine';
import {
  createBrowserSpeechRecognition,
  isBrowserSpeechRecognitionSupported,
  type BrowserSpeechRecognition,
  type VoiceInputLanguage,
} from './services/browserSpeechRecognition';
import {
  fetchBackendHealth,
  resolveSpeechPayload,
  type ChatTurn,
} from './services/chatAdapter';

const IDLE_SPECTRUM = Array.from({ length: 24 }, () => 0.08);
const IDLE_STATS: WebRTCStatsSnapshot = {
  iceState: 'idle',
  fps: 0,
  bitrateKbps: 0,
  packetsLost: 0,
  resolution: '720×960',
};

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile>(AVATAR_PROFILES[0]);
  const [pipeline, setPipeline] = useState<PipelineTarget>('preview-webrtc');
  const [serverUrl, setServerUrl] = useState('http://127.0.0.1:8010');
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);

  const [speechMode, setSpeechMode] = useState<SpeechMode>('echo');
  const [openaiConfigured, setOpenaiConfigured] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [generatingEmotions, setGeneratingEmotions] = useState(false);
  const [recognitionLanguage, setRecognitionLanguage] =
    useState<VoiceInputLanguage>('hi-IN');
  const [voiceId, setVoiceId] = useState('hi-IN-SwaraNeural');
  const [rate, setRate] = useState(1.0);
  const [emotion, setEmotion] = useState<AvatarEmotion>('neutral');
  const [scriptText, setScriptText] = useState(FIXED_TEST_SCRIPTS[0].text);
  const [isListening, setIsListening] = useState(false);
  const [speechInputSupported, setSpeechInputSupported] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSendingSpeech, setIsSendingSpeech] = useState(false);
  const [activeCaption, setActiveCaption] = useState('');
  const [activeWord, setActiveWord] = useState('');
  const [muted, setMuted] = useState(false);

  const [spectrum, setSpectrum] = useState<number[]>(IDLE_SPECTRUM);
  const [stats, setStats] = useState<WebRTCStatsSnapshot>(IDLE_STATS);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewEngineRef = useRef<PreviewAvatarEngine | null>(null);
  const remoteSessionRef = useRef<RemoteSessionHandle | null>(null);
  const activePcRef = useRef<RTCPeerConnection | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const recognizedTextRef = useRef('');
  const recognitionFailedRef = useRef(false);
  const prevStatsRef = useRef<{ bytes: number; timestamp: number }>({
    bytes: 0,
    timestamp: 0,
  });

  useEffect(() => {
    setSpeechInputSupported(isBrowserSpeechRecognitionSupported());
    fetchBackendHealth()
      .then((health) => {
        if (health.liveTalkingUrl) setServerUrl(health.liveTalkingUrl);
        setOpenaiConfigured(Boolean(health.openaiConfigured));
        setGeminiConfigured(Boolean(health.geminiConfigured));
      })
      .catch(() => {
        // Ignore transient startup check errors
      });
  }, []);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition?.stop();
    };
  }, []);

  const disconnectStream = useCallback(() => {
    if (previewEngineRef.current) {
      previewEngineRef.current.destroy();
      previewEngineRef.current = null;
    }
    if (remoteSessionRef.current) {
      remoteSessionRef.current.close();
      remoteSessionRef.current = null;
    }
    activePcRef.current = null;
    prevStatsRef.current = { bytes: 0, timestamp: 0 };

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setConnectionState('disconnected');
    setIsSpeaking(false);
    setActiveWord('');
    setSpectrum(IDLE_SPECTRUM);
    setStats(IDLE_STATS);
  }, []);

  useEffect(() => {
    return () => {
      disconnectStream();
    };
  }, [disconnectStream]);

  const connectStream = useCallback(
    async (targetPipeline: PipelineTarget = pipeline): Promise<boolean> => {
      disconnectStream();
      setErrorMessage(null);
      setStatusNote(null);
      setConnectionState('connecting');

      try {
        if (targetPipeline === 'livetalking-remote') {
          const session = await connectRemoteWebRTC(
            serverUrl,
            (stream) => {
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {});
              }
            },
            (rtcState) => {
              if (rtcState === 'failed' || rtcState === 'disconnected') {
                setConnectionState('error');
                setErrorMessage(
                  'WebRTC connection dropped. Verify LiveTalking ICE/STUN connectivity.',
                );
              }
            },
          );

          remoteSessionRef.current = session;
          activePcRef.current = session.pc;
          if (videoRef.current) {
            videoRef.current.srcObject = session.stream;
            videoRef.current.play().catch(() => {});
          }
          setConnectionState('connected');
          setStatusNote(`Connected to LiveTalking session #${session.sessionId}`);
          return true;
        }

        // Browser WebRTC Loopback + EdgeTTS + Real-time Lip-Sync Preview
        const engine = new PreviewAvatarEngine(selectedAvatar, (speaking, word) => {
          setIsSpeaking(speaking);
          if (word !== undefined) {
            setActiveWord(word);
          }
          if (!speaking) {
            setActiveWord('');
          }
        });
        engine.setEmotion(emotion);

        const { stream, pc } = await engine.startWebRTCLoopback();
        previewEngineRef.current = engine;
        activePcRef.current = pc;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        setConnectionState('connected');
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to establish WebRTC stream.';
        setConnectionState('error');
        setErrorMessage(message);
        return false;
      }
    },
    [disconnectStream, emotion, pipeline, selectedAvatar, serverUrl],
  );

  // Poll WebRTC RTCStats every second when connected
  useEffect(() => {
    if (connectionState !== 'connected') return;

    const timer = window.setInterval(async () => {
      const snapshot = await readWebRTCStats(
        activePcRef.current,
        prevStatsRef.current,
        'inbound-rtp',
      );
      setStats((prev) => ({
        ...snapshot,
        fps: snapshot.fps || prev.fps || (pipeline === 'preview-webrtc' ? 30 : 25),
      }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [connectionState, pipeline]);

  // Animate real-time audio spectrum bars while speaking
  useEffect(() => {
    if (!isSpeaking) {
      setSpectrum(IDLE_SPECTRUM);
      return;
    }

    const timer = window.setInterval(() => {
      if (previewEngineRef.current) {
        setSpectrum(previewEngineRef.current.getAudioSpectrum());
      } else {
        setSpectrum(
          Array.from({ length: 24 }, (_, idx) =>
            0.22 + 0.68 * Math.abs(Math.sin(performance.now() * 0.012 + idx * 0.5)),
          ),
        );
      }
    }, 55);

    return () => window.clearInterval(timer);
  }, [isSpeaking]);

  const handleToggleConnect = () => {
    if (connectionState === 'connected') {
      disconnectStream();
    } else {
      void connectStream(pipeline);
    }
  };

  const handleSelectPipeline = (nextPipeline: PipelineTarget) => {
    if (nextPipeline === pipeline) return;
    setPipeline(nextPipeline);
    setErrorMessage(null);
    setStatusNote(null);
    if (connectionState === 'connected') {
      void connectStream(nextPipeline);
    }
  };

  const handleSelectAvatar = (avatar: AvatarProfile) => {
    setSelectedAvatar(avatar);
    setVoiceId(
      recognitionLanguage === 'hi-IN'
        ? voiceId.startsWith('hi-IN-')
          ? voiceId
          : 'hi-IN-SwaraNeural'
        : avatar.recommendedVoice,
    );
    if (previewEngineRef.current) {
      void previewEngineRef.current.setAvatar(avatar);
    }
  };

  const handleSelectEmotion = (nextEmotion: AvatarEmotion) => {
    setEmotion(nextEmotion);
    previewEngineRef.current?.setEmotion(nextEmotion);
  };

  const handleUploadExpression = async (targetEmotion: AvatarEmotion, file: File) => {
    setErrorMessage(null);
    setStatusNote('Saving expression portrait...');
    try {
      const imageBase64 = await readFileAsDataUrl(file);
      const res = await fetch('/api/avatar/expression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarId: selectedAvatar.id,
          emotion: targetEmotion,
          imageBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not save the expression portrait.');
      await previewEngineRef.current?.refreshExpressions();
      setStatusNote(`${getEmotionPreset(targetEmotion).label} portrait saved. Expression updated.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not save the expression portrait.');
    }
  };

  const handleGenerateExpressions = async () => {
    setGeneratingEmotions(true);
    setErrorMessage(null);
    setStatusNote('Generating real expression portraits with Gemini...');
    try {
      const blob = await fetch(selectedAvatar.imageUrl).then((res) => res.blob());
      const referenceBase64 = await readFileAsDataUrl(blob);
      const res = await fetch('/api/avatar/generate-emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: selectedAvatar.id, referenceBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Expression generation failed.');
      await previewEngineRef.current?.refreshExpressions();
      const done = Array.isArray(data.results)
        ? data.results.filter((item: { ok?: boolean }) => item.ok).length
        : 0;
      setStatusNote(
        `Generated ${done}/4 real expression portraits for ${selectedAvatar.name}.`,
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Expression generation failed.');
    } finally {
      setGeneratingEmotions(false);
    }
  };

  const handleRecognitionLanguageChange = (language: VoiceInputLanguage) => {
    setRecognitionLanguage(language);
    if (language === 'hi-IN' && !voiceId.startsWith('hi-IN-')) {
      setVoiceId('hi-IN-SwaraNeural');
    } else if (language === 'en-IN' && voiceId.startsWith('hi-IN-')) {
      setVoiceId(AVATAR_PROFILES[0].recommendedVoice);
    }
  };

  const handleProbeServer = async () => {
    setProbing(true);
    try {
      const result = await probeLiveTalkingServer(serverUrl);
      setProbeResult(result);
    } catch {
      setProbeResult({
        reachable: false,
        serverUrl,
        latencyMs: 0,
        detail: 'Probe request failed.',
      });
    } finally {
      setProbing(false);
    }
  };

  const handleInterrupt = async () => {
    if (previewEngineRef.current) {
      previewEngineRef.current.interrupt();
    }
    if (remoteSessionRef.current) {
      await interruptLiveTalking(serverUrl, remoteSessionRef.current.sessionId).catch(
        () => {},
      );
    }
    setIsSpeaking(false);
    setActiveWord('');
  };

  const speakText = async (
    textOverride?: string,
    voiceOverride?: string,
    conversational = false,
  ) => {
    const rawInput = (textOverride ?? scriptText).trim();
    const targetVoice = voiceOverride ?? voiceId;
    if (!rawInput) return;

    setIsSendingSpeech(true);
    setErrorMessage(null);
    setStatusNote(null);

    try {
      if (connectionState !== 'connected') {
        const ok = await connectStream(pipeline);
        if (!ok) {
          setIsSendingSpeech(false);
          return;
        }
      }

      const resolution = await resolveSpeechPayload({
        mode: conversational ? 'openai-ready' : speechMode,
        inputText: rawInput,
        history: chatHistory,
      });

      if (conversational && resolution.source !== 'openai-chat') {
        setStatusNote(
          resolution.notice ||
            'AI replies need OPENAI_API_KEY. Add it to the project .env file and restart the app.',
        );
        return;
      }

      if (resolution.notice) {
        setStatusNote(resolution.notice);
      }

      const spokenText = resolution.textToSpeak;
      setActiveCaption(spokenText);

      if (resolution.source === 'openai-chat') {
        setChatHistory((prev) => [
          ...prev,
          { role: 'user', content: rawInput },
          { role: 'assistant', content: spokenText },
        ]);
      }

      const startedAt = performance.now();

      if (pipeline === 'livetalking-remote' && remoteSessionRef.current) {
        setIsSpeaking(true);
        await sendHumanSpeak({
          serverUrl,
          sessionId: remoteSessionRef.current.sessionId,
          text: spokenText,
          type: 'echo',
          interrupt: true,
        });
        const latencyMs = Math.round(performance.now() - startedAt);
        setTranscripts((prev) => [
          {
            id: `${Date.now()}`,
            text: spokenText,
            voice: targetVoice,
            speechMode: conversational ? 'openai-ready' : speechMode,
            pipeline,
            provider: 'LiveTalking /human (echo)',
            latencyMs,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      } else if (previewEngineRef.current) {
        const prosody = getEmotionPreset(emotion);
        const result = await previewEngineRef.current.speakEcho({
          text: spokenText,
          voice: targetVoice,
          rate: Math.min(1.6, Math.max(0.5, rate * prosody.rateMultiplier)),
          pitch: prosody.pitch,
          muted,
        });

        setTranscripts((prev) => [
          {
            id: `${Date.now()}`,
            text: spokenText,
            voice: targetVoice,
            speechMode: conversational ? 'openai-ready' : speechMode,
            pipeline,
            provider:
              result.provider === 'edgetts'
                ? 'EdgeTTS Neural'
                : 'Web Speech Fallback',
            latencyMs: result.latencyMs,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to synthesize avatar speech.',
      );
      setIsSpeaking(false);
    } finally {
      setIsSendingSpeech(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = createBrowserSpeechRecognition();
    if (!recognition) {
      setErrorMessage('Voice input requires Chrome or Edge with speech recognition support.');
      return;
    }

    recognizedTextRef.current = '';
    recognitionFailedRef.current = false;
    setVoiceTranscript('');
    setErrorMessage(null);
    setStatusNote(null);
    recognition.lang = recognitionLanguage;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? '';
        if (result?.isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }
      recognizedTextRef.current = finalText.trim();
      setVoiceTranscript(`${finalText} ${interimText}`.trim());
    };

    recognition.onerror = (event) => {
      recognitionFailedRef.current = true;
      setIsListening(false);
      setErrorMessage(
        event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? 'Microphone permission was denied. Allow microphone access and try again.'
          : event.error === 'network'
            ? 'The browser speech service could not connect. Check your internet connection and try again.'
          : `Speech recognition failed (${event.error}). Please try again.`,
      );
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setIsListening(false);

      const text = recognizedTextRef.current.trim();
      if (recognitionFailedRef.current) return;
      if (!text) {
        setStatusNote('No speech was recognized. Try again and speak a little closer to the mic.');
        return;
      }

      setScriptText(text);
      const spokenVoice =
        recognitionLanguage === 'hi-IN'
          ? voiceId.startsWith('hi-IN-')
            ? voiceId
            : 'hi-IN-SwaraNeural'
          : voiceId.startsWith('hi-IN-')
            ? AVATAR_PROFILES[0].recommendedVoice
            : voiceId;
      setVoiceId(spokenVoice);
      void speakText(text, spokenVoice, true);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      recognitionRef.current = null;
      setIsListening(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to start microphone speech recognition.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        connectionState={connectionState}
        onToggleConnect={handleToggleConnect}
      />

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-8">
        {activeTab === 'studio' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-100">
                  Real-Time AI Human Avatar
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Hindi/English Voice Chat · MuseTalk Lip-Sync · EdgeTTS Neural Voice · WebRTC
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {openaiConfigured
                  ? 'OpenAI chat endpoint active'
                  : 'Running without OpenAI key — fixed text Echo mode active'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 xl:col-span-8">
                <AvatarStage
                  avatar={selectedAvatar}
                  videoRef={videoRef}
                  connectionState={connectionState}
                  pipeline={pipeline}
                  isSpeaking={isSpeaking}
                  activeCaption={activeCaption}
                  activeWord={activeWord}
                  emotion={emotion}
                  muted={muted}
                  spectrum={spectrum}
                  stats={stats}
                  errorMessage={errorMessage}
                  onToggleMute={() => setMuted((prev) => !prev)}
                  onInterrupt={() => void handleInterrupt()}
                  onConnect={() => void connectStream(pipeline)}
                />
              </div>

              <div className="lg:col-span-5 xl:col-span-4">
                <ControlPanel
                  selectedAvatar={selectedAvatar}
                  onSelectAvatar={handleSelectAvatar}
                  pipeline={pipeline}
                  onSelectPipeline={handleSelectPipeline}
                  serverUrl={serverUrl}
                  onServerUrlChange={setServerUrl}
                  probeResult={probeResult}
                  probing={probing}
                  onProbeServer={() => void handleProbeServer()}
                  speechMode={speechMode}
                  onSelectSpeechMode={setSpeechMode}
                  openaiConfigured={openaiConfigured}
                  voiceId={voiceId}
                  onVoiceChange={setVoiceId}
                  rate={rate}
                  onRateChange={setRate}
                  emotion={emotion}
                  onSelectEmotion={handleSelectEmotion}
                  geminiConfigured={geminiConfigured}
                  generatingEmotions={generatingEmotions}
                  onGenerateEmotions={() => void handleGenerateExpressions()}
                  onUploadExpression={(target, file) => void handleUploadExpression(target, file)}
                  scriptText={scriptText}
                  onScriptTextChange={setScriptText}
                  connectionState={connectionState}
                  isSendingSpeech={isSendingSpeech}
                  onSpeak={() => void speakText()}
                  recognitionLanguage={recognitionLanguage}
                  onRecognitionLanguageChange={handleRecognitionLanguageChange}
                  isListening={isListening}
                  speechInputSupported={speechInputSupported}
                  voiceTranscript={voiceTranscript}
                  onToggleVoiceInput={handleToggleVoiceInput}
                  statusNote={statusNote}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voices' && (
          <VoiceScriptsView
            selectedVoice={voiceId}
            onSelectVoice={setVoiceId}
            onQuickTestScript={(text, customVoice) => {
              if (customVoice) setVoiceId(customVoice);
              setScriptText(text);
              setActiveTab('studio');
              void speakText(text, customVoice ?? voiceId);
            }}
            transcripts={transcripts}
            onClearTranscripts={() => setTranscripts([])}
          />
        )}

        {activeTab === 'setup' && <SetupGuideView />}
      </main>
    </div>
  );
}
