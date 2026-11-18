export type PipelineTarget = 'preview-webrtc' | 'livetalking-remote';
export type SpeechMode = 'echo' | 'openai-ready';
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface FaceCalibration {
  mouthX: number; // normalized 0..1
  mouthY: number; // normalized 0..1
  mouthWidth: number; // normalized width
  jawHeight: number; // normalized jaw displacement
  leftEyeX: number;
  rightEyeX: number;
  eyeY: number;
  eyeWidth: number;
}

export interface AvatarProfile {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  midImageUrl: string;
  speakingImageUrl: string;
  recommendedVoice: string;
  liveTalkingAvatarId: string;
  calibration: FaceCalibration;
  emotionImages?: Partial<Record<AvatarEmotion, string>>;
}

export interface EdgeVoiceOption {
  id: string;
  label: string;
  locale: string;
  gender: string;
}

export interface FixedTestScript {
  id: string;
  title: string;
  text: string;
  durationHint: string;
}

export interface WebRTCStatsSnapshot {
  iceState: string;
  fps: number;
  bitrateKbps: number;
  packetsLost: number;
  resolution: string;
}

export interface TranscriptEntry {
  id: string;
  text: string;
  voice: string;
  speechMode: SpeechMode;
  pipeline: PipelineTarget;
  provider: string;
  latencyMs: number;
  timestamp: string;
}

export interface WordBoundary {
  offsetMs: number;
  durationMs: number;
  text: string;
}

export type AvatarEmotion = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';

export interface EmotionVisuals {
  browRaise: number;
  browFurrow: number;
  browInner: number;
  eyeSquint: number;
  eyeWide: number;
  smile: number;
  frown: number;
  jawTension: number;
}

export interface EmotionPreset {
  id: AvatarEmotion;
  label: string;
  emoji: string;
  hint: string;
  rateMultiplier: number;
  pitch: string;
  visuals: EmotionVisuals;
}

export const EMOTION_PRESETS: EmotionPreset[] = [
  {
    id: 'neutral',
    label: 'Neutral',
    emoji: '😐',
    hint: 'Default relaxed expression and voice',
    rateMultiplier: 1,
    pitch: '+0Hz',
    visuals: {
      browRaise: 0,
      browFurrow: 0,
      browInner: 0,
      eyeSquint: 0,
      eyeWide: 0,
      smile: 0,
      frown: 0,
      jawTension: 0,
    },
  },
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    hint: 'Smile corners, softer eyes, brighter voice',
    rateMultiplier: 1.08,
    pitch: '+35Hz',
    visuals: {
      browRaise: 0.2,
      browFurrow: 0,
      browInner: 0,
      eyeSquint: 0.6,
      eyeWide: 0,
      smile: 0.95,
      frown: 0,
      jawTension: 0,
    },
  },
  {
    id: 'angry',
    label: 'Angry',
    emoji: '😠',
    hint: 'Furrowed brows, tight jaw, faster low voice',
    rateMultiplier: 1.16,
    pitch: '-35Hz',
    visuals: {
      browRaise: 0,
      browFurrow: 0.9,
      browInner: 0.85,
      eyeSquint: 0.65,
      eyeWide: 0,
      smile: 0,
      frown: 0.5,
      jawTension: 0.75,
    },
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😔',
    hint: 'Lowered corners, heavy lids, slow soft voice',
    rateMultiplier: 0.88,
    pitch: '-22Hz',
    visuals: {
      browRaise: 0.45,
      browFurrow: 0,
      browInner: 0.3,
      eyeSquint: 0.35,
      eyeWide: 0,
      smile: 0,
      frown: 0.95,
      jawTension: 0.25,
    },
  },
  {
    id: 'surprised',
    label: 'Surprised',
    emoji: '😲',
    hint: 'Raised brows, wide eyes, lifted voice',
    rateMultiplier: 1.05,
    pitch: '+20Hz',
    visuals: {
      browRaise: 1,
      browFurrow: 0,
      browInner: 0,
      eyeSquint: 0,
      eyeWide: 0.9,
      smile: 0,
      frown: 0,
      jawTension: 0,
    },
  },
];

export function getEmotionPreset(id: AvatarEmotion): EmotionPreset {
  return EMOTION_PRESETS.find((preset) => preset.id === id) ?? EMOTION_PRESETS[0];
}

export const AVATAR_PROFILES: AvatarProfile[] = [
  {
    id: 'elena',
    name: 'Elena Vance',
    role: 'Studio Presenter',
    imageUrl: '/src/assets/images/avatar_elena_presenter_1794908439719.jpg',
    midImageUrl: '/src/assets/images/avatar_elena_mid_1794914092221.jpg',
    speakingImageUrl: '/src/assets/images/avatar_elena_speaking_1794913274371.jpg',
    recommendedVoice: 'en-US-JennyNeural',
    liveTalkingAvatarId: 'musetalk_elena_v1',
    emotionImages: {
      happy: '/expressions/elena_happy.jpg',
      angry: '/expressions/elena_angry.jpg',
      sad: '/expressions/elena_sad.jpg',
      surprised: '/expressions/elena_surprised.jpg',
    },
    calibration: {
      mouthX: 0.512,
      mouthY: 0.435,
      mouthWidth: 0.114,
      jawHeight: 0.036,
      leftEyeX: 0.446,
      rightEyeX: 0.576,
      eyeY: 0.325,
      eyeWidth: 0.064,
    },
  },
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Technical Host',
    imageUrl: '/src/assets/images/avatar_marcus_host_1794908441251.jpg',
    midImageUrl: '/src/assets/images/avatar_marcus_mid_1794914092822.jpg',
    speakingImageUrl: '/src/assets/images/avatar_marcus_speaking_1794913274082.jpg',
    recommendedVoice: 'en-US-GuyNeural',
    liveTalkingAvatarId: 'musetalk_marcus_v1',
    emotionImages: {
      happy: '/expressions/marcus_happy.jpg',
      angry: '/expressions/marcus_angry.jpg',
      sad: '/expressions/marcus_sad.jpg',
      surprised: '/expressions/marcus_surprised.jpg',
    },
    calibration: {
      mouthX: 0.506,
      mouthY: 0.408,
      mouthWidth: 0.132,
      jawHeight: 0.04,
      leftEyeX: 0.435,
      rightEyeX: 0.58,
      eyeY: 0.292,
      eyeWidth: 0.068,
    },
  },
  {
    id: 'sofia',
    name: 'Sofia Alvarez',
    role: 'Executive Advisor',
    imageUrl: '/src/assets/images/avatar_sofia_advisor_1794908441663.jpg',
    midImageUrl: '/src/assets/images/avatar_sofia_mid_1794914093972.jpg',
    speakingImageUrl: '/src/assets/images/avatar_sofia_speaking_1794913274917.jpg',
    recommendedVoice: 'en-US-AriaNeural',
    liveTalkingAvatarId: 'musetalk_sofia_v1',
    emotionImages: {
      happy: '/expressions/sofia_happy.jpg',
      angry: '/expressions/sofia_angry.jpg',
      sad: '/expressions/sofia_sad.jpg',
      surprised: '/expressions/sofia_surprised.jpg',
    },
    calibration: {
      mouthX: 0.506,
      mouthY: 0.423,
      mouthWidth: 0.13,
      jawHeight: 0.038,
      leftEyeX: 0.422,
      rightEyeX: 0.58,
      eyeY: 0.292,
      eyeWidth: 0.068,
    },
  },
];

export const EDGE_VOICES: EdgeVoiceOption[] = [
  { id: 'en-US-JennyNeural', label: 'Jenny Neural', locale: 'en-US', gender: 'Female' },
  { id: 'en-US-AriaNeural', label: 'Aria Neural', locale: 'en-US', gender: 'Female' },
  { id: 'en-US-GuyNeural', label: 'Guy Neural', locale: 'en-US', gender: 'Male' },
  { id: 'en-US-DavisNeural', label: 'Davis Neural', locale: 'en-US', gender: 'Male' },
  { id: 'en-GB-SoniaNeural', label: 'Sonia Neural', locale: 'en-GB', gender: 'Female' },
  { id: 'hi-IN-SwaraNeural', label: 'Swara Neural', locale: 'hi-IN', gender: 'Female' },
  { id: 'hi-IN-MadhurNeural', label: 'Madhur Neural', locale: 'hi-IN', gender: 'Male' },
  { id: 'zh-CN-XiaoxiaoNeural', label: 'Xiaoxiao Neural', locale: 'zh-CN', gender: 'Female' },
];

export const FIXED_TEST_SCRIPTS: FixedTestScript[] = [
  {
    id: 'broadcast-intro',
    title: 'Studio Greeting',
    text: 'Hello, welcome to LiveTalking Studio. I am speaking in Echo mode using EdgeTTS neural voice synthesis and real-time MuseTalk lip synchronization over WebRTC.',
    durationHint: '8s',
  },
  {
    id: 'phoneme-check',
    title: 'Lip-Sync Phoneme Test',
    text: 'Peter Piper picked a peck of pickled peppers while vibrant vowels open wide and balanced bilabial consonants close crisply on frame.',
    durationHint: '7s',
  },
  {
    id: 'product-brief',
    title: 'Product Briefing',
    text: 'Our pipeline is currently running without an OpenAI key by driving fixed text directly into the avatar renderer. Once configured, conversational replies will route seamlessly through the same WebRTC stream.',
    durationHint: '10s',
  },
  {
    id: 'short-ping',
    title: 'Quick Echo Ping',
    text: 'Audio stream active. Lip synchronization and WebRTC transport are nominal.',
    durationHint: '4s',
  },
];
