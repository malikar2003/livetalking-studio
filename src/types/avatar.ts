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
