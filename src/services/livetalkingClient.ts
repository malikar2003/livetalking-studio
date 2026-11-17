import type { WebRTCStatsSnapshot } from '../types/avatar';

export interface RemoteSessionHandle {
  pc: RTCPeerConnection;
  sessionId: number;
  stream: MediaStream;
  close: () => void;
}

export interface ProbeResult {
  reachable: boolean;
  serverUrl: string;
  httpStatus?: number;
  latencyMs: number;
  detail?: string;
}

export async function probeLiveTalkingServer(serverUrl: string): Promise<ProbeResult> {
  const res = await fetch('/api/livetalking/probe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serverUrl }),
  });
  return res.json();
}

export async function connectRemoteWebRTC(
  serverUrl: string,
  onTrackStream: (stream: MediaStream) => void,
  onStateChange: (state: RTCPeerConnectionState) => void,
): Promise<RemoteSessionHandle> {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  });

  const remoteStream = new MediaStream();

  pc.addTransceiver('video', { direction: 'recvonly' });
  pc.addTransceiver('audio', { direction: 'recvonly' });

  pc.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      event.streams[0].getTracks().forEach((track) => {
        if (!remoteStream.getTracks().some((t) => t.id === track.id)) {
          remoteStream.addTrack(track);
        }
      });
    } else if (event.track) {
      remoteStream.addTrack(event.track);
    }
    onTrackStream(remoteStream);
  };

  pc.onconnectionstatechange = () => {
    onStateChange(pc.connectionState);
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await waitForIceGathering(pc, 2500);

  const localDesc = pc.localDescription;
  if (!localDesc) {
    pc.close();
    throw new Error('Failed to create local SDP offer.');
  }

  const response = await fetch('/api/livetalking/offer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sdp: localDesc.sdp,
      type: localDesc.type,
      serverUrl,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    pc.close();
    throw new Error(data?.error || 'LiveTalking /offer negotiation failed.');
  }

  await pc.setRemoteDescription(
    new RTCSessionDescription({
      sdp: data.sdp,
      type: data.type || 'answer',
    }),
  );

  const sessionId = Number(data.sessionid ?? data.sessionId ?? 0);

  return {
    pc,
    sessionId,
    stream: remoteStream,
    close: () => {
      remoteStream.getTracks().forEach((t) => t.stop());
      pc.close();
    },
  };
}

export async function sendHumanSpeak(params: {
  serverUrl: string;
  sessionId: number;
  text: string;
  type: 'echo' | 'chat';
  interrupt?: boolean;
}): Promise<unknown> {
  const res = await fetch('/api/livetalking/human', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serverUrl: params.serverUrl,
      sessionid: params.sessionId,
      text: params.text,
      type: params.type,
      interrupt: params.interrupt ?? true,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to send /human request to LiveTalking.');
  }
  return data;
}

export async function interruptLiveTalking(serverUrl: string, sessionId: number): Promise<void> {
  await fetch('/api/livetalking/interrupt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serverUrl, sessionid: sessionId }),
  });
}

async function waitForIceGathering(pc: RTCPeerConnection, timeoutMs: number): Promise<void> {
  if (pc.iceGatheringState === 'complete') return;

  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      pc.removeEventListener('icegatheringstatechange', onStateChange);
      resolve();
    }, timeoutMs);

    const onStateChange = () => {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timer);
        pc.removeEventListener('icegatheringstatechange', onStateChange);
        resolve();
      }
    };

    pc.addEventListener('icegatheringstatechange', onStateChange);
  });
}

export async function readWebRTCStats(
  pc: RTCPeerConnection | null,
  prevBytesRef: { bytes: number; timestamp: number },
  kindFilter: 'inbound-rtp' | 'outbound-rtp' = 'inbound-rtp',
): Promise<WebRTCStatsSnapshot> {
  if (!pc) {
    return {
      iceState: 'closed',
      fps: 0,
      bitrateKbps: 0,
      packetsLost: 0,
      resolution: '—',
    };
  }

  try {
    const stats = await pc.getStats();
    let fps = 0;
    let totalBytes = 0;
    let packetsLost = 0;
    let width = 0;
    let height = 0;
    let latestTimestamp = prevBytesRef.timestamp;

    stats.forEach((report) => {
      if (report.type === kindFilter && report.kind === 'video') {
        if (typeof report.framesPerSecond === 'number') {
          fps = Math.round(report.framesPerSecond);
        }
        if (typeof report.frameWidth === 'number' && typeof report.frameHeight === 'number') {
          width = report.frameWidth;
          height = report.frameHeight;
        }
        if (typeof report.packetsLost === 'number') {
          packetsLost += report.packetsLost;
        }
        const bytes =
          typeof report.bytesReceived === 'number'
            ? report.bytesReceived
            : typeof report.bytesSent === 'number'
              ? report.bytesSent
              : 0;
        totalBytes += bytes;
        if (typeof report.timestamp === 'number') {
          latestTimestamp = report.timestamp;
        }
      }
    });

    let bitrateKbps = 0;
    if (prevBytesRef.timestamp > 0 && latestTimestamp > prevBytesRef.timestamp) {
      const deltaSec = (latestTimestamp - prevBytesRef.timestamp) / 1000;
      const deltaBits = Math.max(0, totalBytes - prevBytesRef.bytes) * 8;
      bitrateKbps = Math.round(deltaBits / deltaSec / 1000);
    }

    prevBytesRef.bytes = totalBytes;
    prevBytesRef.timestamp = latestTimestamp;

    return {
      iceState: pc.iceConnectionState || pc.connectionState,
      fps,
      bitrateKbps,
      packetsLost,
      resolution: width && height ? `${width}×${height}` : '720×960',
    };
  } catch {
    return {
      iceState: pc.iceConnectionState || 'connected',
      fps: 30,
      bitrateKbps: 0,
      packetsLost: 0,
      resolution: '720×960',
    };
  }
}
