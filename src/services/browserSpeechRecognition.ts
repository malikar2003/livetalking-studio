export type VoiceInputLanguage = 'en-IN' | 'hi-IN';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  readonly 0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

export interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
}

export function isBrowserSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const speechWindow = window as SpeechRecognitionWindow;
  return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition);
}

export function createBrowserSpeechRecognition(): BrowserSpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  const speechWindow = window as SpeechRecognitionWindow;
  const SpeechRecognition =
    speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
  return SpeechRecognition ? new SpeechRecognition() : null;
}
