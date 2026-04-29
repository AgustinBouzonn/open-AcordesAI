import { PitchDetector } from 'pitchy';

export interface TunerSample {
  freq: number;
  clarity: number;
  rms: number;
  hasSignal: boolean;
}

export class TunerEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private detector: PitchDetector<Float32Array> | null = null;
  private buffer: Float32Array | null = null;
  private rafId: number | null = null;
  private smoothedPitch = 0;
  private onUpdate: ((s: TunerSample) => void) | null = null;

  isRunning(): boolean {
    return this.audioContext !== null;
  }

  async start(onUpdate: (s: TunerSample) => void): Promise<void> {
    if (this.isRunning()) return;
    this.onUpdate = onUpdate;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
    });

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioContext = new Ctx();
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 4096;
    this.analyser.smoothingTimeConstant = 0;
    this.source.connect(this.analyser);

    this.detector = PitchDetector.forFloat32Array(this.analyser.fftSize);
    this.detector.minVolumeDecibels = -60;
    this.buffer = new Float32Array(this.detector.inputLength);

    const tick = () => {
      if (!this.analyser || !this.detector || !this.buffer || !this.audioContext || !this.onUpdate) return;
      this.analyser.getFloatTimeDomainData(this.buffer);

      let sumSq = 0;
      for (let i = 0; i < this.buffer.length; i++) sumSq += this.buffer[i] * this.buffer[i];
      const rms = Math.sqrt(sumSq / this.buffer.length);

      const [pitch, clarity] = this.detector.findPitch(this.buffer, this.audioContext.sampleRate);

      const valid = rms > 0.005 && clarity > 0.92 && pitch > 30 && pitch < 2200;
      if (valid) {
        this.smoothedPitch = this.smoothedPitch === 0 ? pitch : 0.65 * this.smoothedPitch + 0.35 * pitch;
        this.onUpdate({ freq: this.smoothedPitch, clarity, rms, hasSignal: true });
      } else {
        this.smoothedPitch = 0;
        this.onUpdate({ freq: 0, clarity, rms, hasSignal: false });
      }

      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.source) {
      try { this.source.disconnect(); } catch { /* noop */ }
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => undefined);
      this.audioContext = null;
    }
    this.analyser = null;
    this.detector = null;
    this.buffer = null;
    this.smoothedPitch = 0;
    this.onUpdate = null;
  }
}
