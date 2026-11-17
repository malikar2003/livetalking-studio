import type { AvatarProfile, WordBoundary } from '../types/avatar';

export interface PreviewSpeakResult {
  provider: 'edgetts' | 'browser-fallback';
  latencyMs: number;
  boundaries: WordBoundary[];
  durationMs: number;
}

const VERTEX_SHADER_SRC = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAGMENT_SHADER_SRC = `#version 300 es
precision highp float;

uniform sampler2D u_imageClosed;
uniform sampler2D u_imageMid;
uniform sampler2D u_imageOpen;
uniform vec2 u_resolution;
uniform vec2 u_sway;
uniform float u_tilt;
uniform float u_mouthX;
uniform float u_mouthY;
uniform float u_mouthWidth;
uniform float u_open;
uniform float u_spread;
uniform float u_leftEyeX;
uniform float u_rightEyeX;
uniform float u_eyeY;
uniform float u_eyeWidth;
uniform float u_blink;
uniform float u_hasMidTex;
uniform float u_hasOpenTex;

in vec2 v_uv;
out vec4 outColor;

vec2 applyHeadTransform(vec2 uv) {
  vec2 centered = uv - 0.5;
  centered.x *= u_resolution.x / u_resolution.y;
  float c = cos(u_tilt);
  float s = sin(u_tilt);
  vec2 rot = vec2(centered.x * c - centered.y * s, centered.x * s + centered.y * c);
  rot /= 1.004;
  rot.x /= u_resolution.x / u_resolution.y;
  return rot + 0.5 - u_sway;
}

float eyeBlinkDisplacement(vec2 p, float ex, float ey, float ew) {
  if (u_blink <= 0.001) return 0.0;
  float rx = ew * 0.58;
  float ry = 0.017;
  vec2 d = vec2((p.x - ex) / rx, (p.y - ey) / ry);
  float dist2 = dot(d, d);
  if (dist2 >= 1.0) return 0.0;
  float w = (1.0 - dist2);
  w = w * w;
  float upperBias = smoothstep(ey + ry * 0.65, ey - ry * 0.9, p.y);
  return u_blink * 0.018 * w * (0.4 + 0.6 * upperBias);
}

vec3 sampleCrisp(sampler2D tex, vec2 uv, vec2 texel) {
  vec3 c = texture(tex, uv).rgb;
  vec3 n = texture(tex, clamp(uv + vec2(0.0, -texel.y), 0.001, 0.999)).rgb;
  vec3 s = texture(tex, clamp(uv + vec2(0.0,  texel.y), 0.001, 0.999)).rgb;
  vec3 e = texture(tex, clamp(uv + vec2( texel.x, 0.0), 0.001, 0.999)).rgb;
  vec3 w = texture(tex, clamp(uv + vec2(-texel.x, 0.0), 0.001, 0.999)).rgb;
  vec3 blur = (n + s + e + w) * 0.25;
  return clamp(c + (c - blur) * 0.26, 0.0, 1.0);
}

void main() {
  vec2 p = applyHeadTransform(v_uv);
  vec2 texel = 1.0 / max(u_resolution, vec2(1.0));

  // Natural upper-eyelid blink deformation using portrait skin texture
  float blinkShift = eyeBlinkDisplacement(p, u_leftEyeX, u_eyeY, u_eyeWidth)
                   + eyeBlinkDisplacement(p, u_rightEyeX, u_eyeY, u_eyeWidth);
  p.y -= blinkShift;

  vec2 clampedP = clamp(p, 0.001, 0.999);
  vec3 closedColor = texture(u_imageClosed, clampedP).rgb;
  vec3 finalColor = closedColor;

  if (u_open > 0.01 && (u_hasMidTex > 0.5 || u_hasOpenTex > 0.5)) {
    float t = clamp(u_open, 0.0, 1.0);

    // 3-state real photographic lip progression with tight S-curves so each
    // syllable snaps crisply onto sharp textures instead of lingering in blurry 50/50 blends.
    float midBlend = smoothstep(0.08, 0.34, t);
    float openWeight = smoothstep(0.50, 0.80, t);

    float rx = u_mouthWidth * mix(0.86, 1.24, openWeight);
    float dy = p.y - (u_mouthY + 0.006);
    float ryTop = 0.025;
    float ryBot = mix(0.042, 0.118, openWeight);
    float ry = dy < 0.0 ? ryTop : ryBot;

    vec2 md = vec2((p.x - u_mouthX) / rx, dy / ry);
    float lipMask = smoothstep(1.0, 0.32, length(md));

    if (lipMask > 0.001) {
      vec3 midColor = u_hasMidTex > 0.5
        ? sampleCrisp(u_imageMid, clampedP, texel)
        : sampleCrisp(u_imageOpen, clampedP, texel);
      vec3 openColor = u_hasOpenTex > 0.5
        ? sampleCrisp(u_imageOpen, clampedP, texel)
        : midColor;

      // Local skin-tone calibration at upper philtrum border to ensure zero color seam
      vec2 refUv = vec2(u_mouthX, u_mouthY - 0.018);
      vec3 refClosed = texture(u_imageClosed, refUv).rgb;
      vec3 refMid = u_hasMidTex > 0.5 ? texture(u_imageMid, refUv).rgb : refClosed;
      vec3 refOpen = u_hasOpenTex > 0.5 ? texture(u_imageOpen, refUv).rgb : refMid;

      midColor *= clamp(refClosed / max(refMid, vec3(0.05)), vec3(0.92), vec3(1.08));
      openColor *= clamp(refClosed / max(refOpen, vec3(0.05)), vec3(0.92), vec3(1.08));

      vec3 targetLips = t <= 0.48
        ? mix(sampleCrisp(u_imageClosed, clampedP, texel), midColor, midBlend)
        : mix(midColor, openColor, openWeight);

      finalColor = mix(closedColor, targetLips, lipMask);
    }
  }

  if (blinkShift > 0.004) {
    float crease = clamp(blinkShift * 18.0, 0.0, 0.22);
    finalColor *= (1.0 - crease);
  }

  outColor = vec4(finalColor, 1.0);
}`;

export class PreviewAvatarEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private fallbackCtx: CanvasRenderingContext2D | null = null;
  private program: WebGLProgram | null = null;
  private closedTexture: WebGLTexture | null = null;
  private midTexture: WebGLTexture | null = null;
  private openTexture: WebGLTexture | null = null;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};

  private avatar: AvatarProfile;
  private portraitImg: HTMLImageElement | null = null;
  private midImg: HTMLImageElement | null = null;
  private speakingImg: HTMLImageElement | null = null;
  private rafId: number | null = null;
  private startedAt = performance.now();

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaDest: MediaStreamAudioDestinationNode | null = null;
  private freqBins: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(128));

  private senderPc: RTCPeerConnection | null = null;
  private receiverPc: RTCPeerConnection | null = null;
  private remoteStream: MediaStream | null = null;

  private currentSource: AudioBufferSourceNode | null = null;
  private isSpeaking = false;
  private syntheticSpeakTimer: number | null = null;
  private syntheticEnergy = 0;
  private smoothedOpen = 0;
  private smoothedSpread = 0;

  private blinkNextAt = performance.now() + 2600;
  private blinkStartedAt = 0;
  private activeBoundaries: WordBoundary[] = [];
  private speechStartedAt = 0;
  private speechCtxStartTime = 0;
  private speechEnvelope: Float32Array | null = null;
  private onSpeakingStateChange?: (speaking: boolean, activeWord?: string) => void;
  private lastReportedWord = '';

  constructor(
    avatar: AvatarProfile,
    onSpeakingStateChange?: (speaking: boolean, activeWord?: string) => void,
  ) {
    this.avatar = avatar;
    this.onSpeakingStateChange = onSpeakingStateChange;

    this.canvas = document.createElement('canvas');
    // Match native portrait resolution 1:1 so WebGL never softens fine skin/lip detail
    this.canvas.width = 896;
    this.canvas.height = 1200;

    const gl = this.canvas.getContext('webgl2', {
      alpha: false,
      antialias: true,
      preserveDrawingBuffer: false,
    });

    if (gl && this.initWebGL(gl)) {
      this.gl = gl;
    } else {
      const ctx = this.canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Unable to initialize WebGL2 or 2D canvas for avatar rendering.');
      }
      this.fallbackCtx = ctx;
    }
  }

  private createConfiguredTexture(gl: WebGL2RenderingContext): WebGLTexture | null {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  private initWebGL(gl: WebGL2RenderingContext): boolean {
    const compile = (type: number, src: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) return false;

    const program = gl.createProgram();
    if (!program) return false;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return false;
    }

    gl.useProgram(program);
    this.program = program;

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const names = [
      'u_imageClosed',
      'u_imageMid',
      'u_imageOpen',
      'u_resolution',
      'u_sway',
      'u_tilt',
      'u_mouthX',
      'u_mouthY',
      'u_mouthWidth',
      'u_open',
      'u_spread',
      'u_leftEyeX',
      'u_rightEyeX',
      'u_eyeY',
      'u_eyeWidth',
      'u_blink',
      'u_hasMidTex',
      'u_hasOpenTex',
    ];
    for (const name of names) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }

    this.closedTexture = this.createConfiguredTexture(gl);
    this.midTexture = this.createConfiguredTexture(gl);
    this.openTexture = this.createConfiguredTexture(gl);

    return true;
  }

  private uploadTexture(tex: WebGLTexture | null, img: HTMLImageElement): void {
    if (!this.gl || !tex) return;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  }

  async setAvatar(avatar: AvatarProfile): Promise<void> {
    this.avatar = avatar;
    await this.loadPortraitSet(avatar);
  }

  private loadImage(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private async loadPortraitSet(avatar: AvatarProfile): Promise<void> {
    const [closed, mid, open] = await Promise.all([
      this.loadImage(avatar.imageUrl),
      this.loadImage(avatar.midImageUrl),
      this.loadImage(avatar.speakingImageUrl),
    ]);
    this.portraitImg = closed;
    this.midImg = mid;
    this.speakingImg = open;

    if (closed) this.uploadTexture(this.closedTexture, closed);
    if (mid) this.uploadTexture(this.midTexture, mid);
    if (open) this.uploadTexture(this.openTexture, open);
  }

  async startWebRTCLoopback(): Promise<{
    stream: MediaStream;
    pc: RTCPeerConnection;
  }> {
    await this.loadPortraitSet(this.avatar);

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioCtx();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.25;
    this.freqBins = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

    this.mediaDest = this.audioCtx.createMediaStreamDestination();
    this.analyser.connect(this.mediaDest);

    const silentGain = this.audioCtx.createGain();
    silentGain.gain.value = 0.0001;
    const silentOsc = this.audioCtx.createOscillator();
    silentOsc.frequency.value = 180;
    silentOsc.connect(silentGain);
    silentGain.connect(this.mediaDest);
    silentOsc.start();

    this.startRenderLoop();

    const canvasStream = this.canvas.captureStream(30);
    const videoTrack = canvasStream.getVideoTracks()[0];
    if (videoTrack && 'contentHint' in videoTrack) {
      videoTrack.contentHint = 'detail';
    }
    const audioTrack = this.mediaDest.stream.getAudioTracks()[0];
    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
    }

    this.senderPc = new RTCPeerConnection();
    this.receiverPc = new RTCPeerConnection();

    this.senderPc.onicecandidate = (e) => {
      if (e.candidate && this.receiverPc) {
        this.receiverPc.addIceCandidate(e.candidate).catch(() => {});
      }
    };
    this.receiverPc.onicecandidate = (e) => {
      if (e.candidate && this.senderPc) {
        this.senderPc.addIceCandidate(e.candidate).catch(() => {});
      }
    };

    const incomingStream = new MediaStream();
    const trackReady = new Promise<MediaStream>((resolve) => {
      const timeout = setTimeout(() => resolve(incomingStream), 1500);
      this.receiverPc!.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          event.streams[0].getTracks().forEach((track) => {
            if (!incomingStream.getTracks().some((t) => t.id === track.id)) {
              incomingStream.addTrack(track);
            }
          });
        } else {
          incomingStream.addTrack(event.track);
        }
        if (incomingStream.getVideoTracks().length > 0) {
          clearTimeout(timeout);
          resolve(incomingStream);
        }
      };
    });

    canvasStream.getTracks().forEach((track) => {
      this.senderPc!.addTrack(track, canvasStream);
    });

    const boostVideoBitrate = (sdp?: string): string | undefined => {
      if (!sdp) return sdp;
      const lines = sdp.split('\r\n');
      const out: string[] = [];
      let inVideo = false;
      for (const line of lines) {
        if (line.startsWith('m=')) {
          inVideo = line.startsWith('m=video');
        }
        out.push(line);
        if (inVideo && line.startsWith('c=IN')) {
          out.push('b=AS:5000');
        }
      }
      return out.join('\r\n');
    };

    const offer = await this.senderPc.createOffer();
    await this.senderPc.setLocalDescription(offer);
    await this.receiverPc.setRemoteDescription({
      type: offer.type,
      sdp: boostVideoBitrate(offer.sdp),
    });
    const answer = await this.receiverPc.createAnswer();
    await this.receiverPc.setLocalDescription(answer);
    await this.senderPc.setRemoteDescription({
      type: answer.type,
      sdp: boostVideoBitrate(answer.sdp),
    });

    // Lock WebRTC video encoder to high bitrate and maintain full resolution during speech
    for (const sender of this.senderPc.getSenders()) {
      if (sender.track?.kind === 'video') {
        try {
          const params = sender.getParameters();
          params.degradationPreference = 'maintain-resolution';
          if (!params.encodings || params.encodings.length === 0) {
            params.encodings = [{}];
          }
          params.encodings[0].maxBitrate = 5_000_000;
          params.encodings[0].maxFramerate = 30;
          await sender.setParameters(params);
        } catch {
          // Ignore browsers that restrict sender parameter overrides
        }
      }
    }

    this.remoteStream = await trackReady;
    return {
      stream: this.remoteStream.getVideoTracks().length > 0 ? this.remoteStream : canvasStream,
      pc: this.receiverPc,
    };
  }

  getAudioSpectrum(): number[] {
    if (!this.analyser || !this.isSpeaking) {
      return Array.from({ length: 24 }, (_, idx) =>
        this.isSpeaking ? Math.abs(Math.sin(performance.now() * 0.01 + idx)) * 0.5 : 0.06,
      );
    }
    this.analyser.getByteFrequencyData(this.freqBins);
    const out: number[] = [];
    const step = Math.max(1, Math.floor(this.freqBins.length / 24));
    for (let i = 0; i < 24; i++) {
      const val = this.freqBins[Math.min(this.freqBins.length - 1, i * step)] / 255;
      out.push(Math.max(0.06, Math.min(1, val * 1.45)));
    }
    return out;
  }

  async speakEcho(params: {
    text: string;
    voice: string;
    rate: number;
    pitch: string;
    muted?: boolean;
  }): Promise<PreviewSpeakResult> {
    this.interrupt();

    const startedAt = performance.now();
    const res = await fetch('/api/tts/edge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: params.text,
        voice: params.voice,
        rate: params.rate,
        pitch: params.pitch,
      }),
    });

    const data = await res.json();

    if (
      data?.provider === 'edgetts' &&
      data?.audioBase64 &&
      this.audioCtx &&
      this.analyser
    ) {
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const decodedBuffer = await this.audioCtx.decodeAudioData(bytes.buffer.slice(0));
      const boundaries: WordBoundary[] = Array.isArray(data.boundaries) ? data.boundaries : [];
      this.speechEnvelope = this.buildSpeechEnvelope(decodedBuffer, boundaries);

      const source = this.audioCtx.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(this.analyser);

      this.currentSource = source;
      this.activeBoundaries = boundaries;
      this.speechStartedAt = performance.now();
      this.speechCtxStartTime = this.audioCtx.currentTime;
      this.isSpeaking = true;
      this.lastReportedWord = '';
      this.onSpeakingStateChange?.(true, '');

      source.onended = () => {
        if (this.currentSource === source) {
          this.currentSource = null;
          this.isSpeaking = false;
          this.activeBoundaries = [];
          this.speechEnvelope = null;
          this.onSpeakingStateChange?.(false, '');
        }
      };

      source.start();

      return {
        provider: 'edgetts',
        latencyMs: data.latencyMs || Math.round(performance.now() - startedAt),
        boundaries: this.activeBoundaries,
        durationMs: Math.round(decodedBuffer.duration * 1000),
      };
    }

    return this.speakWithBrowserSpeechSynthesis(
      params.text,
      params.voice,
      params.rate,
      params.muted,
    );
  }

  private speakWithBrowserSpeechSynthesis(
    text: string,
    voiceId: string,
    rate: number,
    muted?: boolean,
  ): Promise<PreviewSpeakResult> {
    const startedAt = performance.now();
    this.isSpeaking = true;
    this.speechStartedAt = startedAt;
    this.onSpeakingStateChange?.(true, '');

    const wordList = text.split(/\s+/).filter(Boolean);
    const approxMsPerWord = Math.max(210, Math.round(320 / Math.max(0.5, rate)));
    let wordIndex = 0;

    if (this.syntheticSpeakTimer) {
      window.clearInterval(this.syntheticSpeakTimer);
    }

    this.syntheticSpeakTimer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const pulse =
        0.3 + 0.6 * Math.abs(Math.sin(elapsed * 0.015) * Math.cos(elapsed * 0.008));
      this.syntheticEnergy = pulse;

      const idx = Math.min(wordList.length - 1, Math.floor(elapsed / approxMsPerWord));
      if (idx !== wordIndex && wordList[idx]) {
        wordIndex = idx;
        this.onSpeakingStateChange?.(true, wordList[idx]);
      }
    }, 35);

    const stopSynthetic = () => {
      if (this.syntheticSpeakTimer) {
        window.clearInterval(this.syntheticSpeakTimer);
        this.syntheticSpeakTimer = null;
      }
      this.syntheticEnergy = 0;
      this.isSpeaking = false;
      this.onSpeakingStateChange?.(false, '');
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.6, Math.min(1.6, rate));
      utterance.volume = muted ? 0 : 1;

      const voices = window.speechSynthesis.getVoices();
      const targetLocale = voiceId.split('-').slice(0, 2).join('-').toLowerCase();
      const matched = voices.find((v) => v.lang.toLowerCase().startsWith(targetLocale));
      if (matched) utterance.voice = matched;

      utterance.onend = stopSynthetic;
      utterance.onerror = stopSynthetic;
      window.speechSynthesis.speak(utterance);
    } else {
      globalThis.setTimeout(stopSynthetic, Math.max(1500, wordList.length * approxMsPerWord));
    }

    return Promise.resolve({
      provider: 'browser-fallback',
      latencyMs: Math.round(performance.now() - startedAt),
      boundaries: [],
      durationMs: wordList.length * approxMsPerWord,
    });
  }

  interrupt(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // Ignore already-stopped source
      }
      this.currentSource = null;
    }
    if (this.syntheticSpeakTimer) {
      window.clearInterval(this.syntheticSpeakTimer);
      this.syntheticSpeakTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.syntheticEnergy = 0;
    this.isSpeaking = false;
    this.activeBoundaries = [];
    this.speechEnvelope = null;
    this.onSpeakingStateChange?.(false, '');
  }

  private startRenderLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    const render = (now: number) => {
      this.drawFrame(now);
      this.rafId = requestAnimationFrame(render);
    };

    this.rafId = requestAnimationFrame(render);
  }

  private buildSpeechEnvelope(
    buffer: AudioBuffer,
    boundaries: WordBoundary[],
  ): Float32Array {
    const channel = buffer.getChannelData(0);
    const sr = buffer.sampleRate;
    const frameHz = 100; // 10ms resolution
    const hop = Math.max(1, Math.floor(sr / frameHz));
    const win = Math.max(hop, Math.floor(sr * 0.025));
    const numFrames = Math.max(1, Math.ceil(channel.length / hop));
    const raw = new Float32Array(numFrames);

    for (let f = 0; f < numFrames; f++) {
      const start = f * hop;
      const end = Math.min(channel.length, start + win);
      let sumSq = 0;
      for (let i = start; i < end; i++) {
        const s = channel[i];
        sumSq += s * s;
      }
      raw[f] = Math.sqrt(sumSq / Math.max(1, end - start));
    }

    const sorted = Array.from(raw).sort((a, b) => a - b);
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] || 0.15;
    const noiseFloor = Math.min(0.015, p95 * 0.08);
    const denom = Math.max(0.02, p95 - noiseFloor);

    const shaped = new Float32Array(numFrames);
    for (let f = 0; f < numFrames; f++) {
      const ms = f * 10;
      const norm = Math.max(0, Math.min(1, (raw[f] - noiseFloor) / denom));
      let val = Math.pow(norm, 1.35);

      if (boundaries.length > 0) {
        const active = boundaries.find(
          (b) => ms >= b.offsetMs - 15 && ms <= b.offsetMs + b.durationMs + 15,
        );
        if (!active) {
          val *= 0.08;
        } else if (/^[mbp]/i.test(active.text) && ms - active.offsetMs < 55) {
          val *= 0.1;
        }
      }
      shaped[f] = val;
    }

    // Zero-phase [0.25, 0.5, 0.25] smoothing for fluid video-like lip motion
    const smoothed = new Float32Array(numFrames);
    for (let f = 0; f < numFrames; f++) {
      const prev = shaped[Math.max(0, f - 1)];
      const curr = shaped[f];
      const next = shaped[Math.min(numFrames - 1, f + 1)];
      smoothed[f] = prev * 0.25 + curr * 0.5 + next * 0.25;
    }
    return smoothed;
  }

  private computeSpeechEnvelope(now: number): { open: number; spread: number } {
    if (!this.isSpeaking) {
      this.smoothedOpen *= 0.65;
      this.smoothedSpread *= 0.65;
      return { open: this.smoothedOpen, spread: this.smoothedSpread };
    }

    const elapsedMs =
      this.audioCtx && this.currentSource
        ? Math.max(0, (this.audioCtx.currentTime - this.speechCtxStartTime) * 1000)
        : now - this.speechStartedAt;

    if (this.activeBoundaries.length > 0) {
      const current = this.activeBoundaries.find(
        (b) => elapsedMs >= b.offsetMs && elapsedMs <= b.offsetMs + b.durationMs + 70,
      );
      if (current && current.text !== this.lastReportedWord) {
        this.lastReportedWord = current.text;
        this.onSpeakingStateChange?.(true, current.text);
      }
    }

    let targetOpen = this.syntheticEnergy;
    let targetSpread = this.syntheticEnergy * 0.55;

    if (this.speechEnvelope && this.currentSource) {
      const idx = Math.min(
        this.speechEnvelope.length - 1,
        Math.max(0, Math.floor(elapsedMs / 10)),
      );
      targetOpen = this.speechEnvelope[idx];

      if (this.analyser) {
        this.analyser.getByteFrequencyData(this.freqBins);
        let highBand = 0;
        for (let i = 14; i < 40; i++) {
          highBand += this.freqBins[i];
        }
        highBand /= 26 * 255;
        targetSpread = Math.min(1, Math.max(0, highBand - 0.03) * 2.2);
      }
    }

    const openAlpha = targetOpen > this.smoothedOpen ? 0.62 : 0.45;
    this.smoothedOpen = this.smoothedOpen * (1 - openAlpha) + targetOpen * openAlpha;
    this.smoothedSpread = this.smoothedSpread * 0.65 + targetSpread * 0.35;

    return { open: this.smoothedOpen, spread: this.smoothedSpread };
  }

  private computeBlink(now: number): number {
    if (now >= this.blinkNextAt) {
      this.blinkStartedAt = now;
      this.blinkNextAt = now + 3200 + Math.random() * 2800;
    }
    const elapsed = now - this.blinkStartedAt;
    if (this.blinkStartedAt > 0 && elapsed < 155) {
      return Math.sin((elapsed / 155) * Math.PI);
    }
    return 0;
  }

  private drawFrame(now: number): void {
    const { width: w, height: h } = this.canvas;
    if (!this.portraitImg) {
      if (this.fallbackCtx) {
        this.fallbackCtx.fillStyle = '#0B0F17';
        this.fallbackCtx.fillRect(0, 0, w, h);
      }
      return;
    }

    const t = (now - this.startedAt) / 1000;
    const { open, spread } = this.computeSpeechEnvelope(now);
    const blink = this.computeBlink(now);

    const speechMotionBoost = this.isSpeaking ? 1.12 : 1.0;
    const swayXNorm =
      ((Math.sin(t * 0.78) * 0.5 + Math.sin(t * 1.45) * 0.25) * speechMotionBoost) / w;
    const swayYNorm =
      (Math.sin(t * 1.35) * 0.55 + (this.isSpeaking ? Math.sin(t * 2.4) * 0.3 + open * 0.45 : 0)) /
      h;
    const tiltRad =
      (Math.sin(t * 0.58) * 0.0011 + Math.sin(t * 1.25) * 0.0005) * speechMotionBoost;
    const cal = this.avatar.calibration;

    if (this.gl && this.program) {
      const gl = this.gl;
      gl.viewport(0, 0, w, h);
      gl.useProgram(this.program);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.closedTexture);
      gl.uniform1i(this.uniforms.u_imageClosed, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.midTexture);
      gl.uniform1i(this.uniforms.u_imageMid, 1);

      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.openTexture);
      gl.uniform1i(this.uniforms.u_imageOpen, 2);

      gl.uniform1f(this.uniforms.u_hasMidTex, this.midImg ? 1.0 : 0.0);
      gl.uniform1f(this.uniforms.u_hasOpenTex, this.speakingImg ? 1.0 : 0.0);
      gl.uniform2f(this.uniforms.u_resolution, w, h);
      gl.uniform2f(this.uniforms.u_sway, swayXNorm, swayYNorm);
      gl.uniform1f(this.uniforms.u_tilt, tiltRad);
      gl.uniform1f(this.uniforms.u_mouthX, cal.mouthX);
      gl.uniform1f(this.uniforms.u_mouthY, cal.mouthY);
      gl.uniform1f(this.uniforms.u_mouthWidth, cal.mouthWidth);
      gl.uniform1f(this.uniforms.u_open, open);
      gl.uniform1f(this.uniforms.u_spread, spread);
      gl.uniform1f(this.uniforms.u_leftEyeX, cal.leftEyeX);
      gl.uniform1f(this.uniforms.u_rightEyeX, cal.rightEyeX);
      gl.uniform1f(this.uniforms.u_eyeY, cal.eyeY);
      gl.uniform1f(this.uniforms.u_eyeWidth, cal.eyeWidth);
      gl.uniform1f(this.uniforms.u_blink, blink);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return;
    }

    // 2D fallback blending real closed -> mid -> speaking portraits strictly around lips
    if (this.fallbackCtx) {
      this.fallbackCtx.globalAlpha = 1;
      this.fallbackCtx.drawImage(this.portraitImg, 0, 0, w, h);
      const targetImg = open <= 0.48 ? this.midImg || this.speakingImg : this.speakingImg || this.midImg;
      if (targetImg && open > 0.02) {
        this.fallbackCtx.save();
        this.fallbackCtx.beginPath();
        this.fallbackCtx.ellipse(
          cal.mouthX * w,
          (cal.mouthY + 0.015) * h,
          cal.mouthWidth * w * 0.9,
          0.065 * h,
          0,
          0,
          Math.PI * 2,
        );
        this.fallbackCtx.clip();
        this.fallbackCtx.globalAlpha = Math.min(1, open * 2.1);
        this.fallbackCtx.drawImage(targetImg, 0, 0, w, h);
        this.fallbackCtx.restore();
      }
    }
  }

  destroy(): void {
    this.interrupt();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.senderPc?.close();
    this.receiverPc?.close();
    this.remoteStream?.getTracks().forEach((t) => t.stop());
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
  }
}
