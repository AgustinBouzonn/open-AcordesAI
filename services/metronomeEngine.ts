export interface MetronomeOptions {
  bpm: number;
  beatsPerBar: number;
  subdivisions: number;
  volume: number;
  onTick?: (info: { beat: number; subBeat: number; isAccent: boolean; time: number }) => void;
}

const SCHEDULE_AHEAD_S = 0.1;
const LOOKAHEAD_MS = 25;

export class MetronomeEngine {
  private audioContext: AudioContext | null = null;
  private bpm = 100;
  private beatsPerBar = 4;
  private subdivisions = 1;
  private volume = 0.7;
  private nextNoteTime = 0;
  private currentBeat = 0;
  private currentSub = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private onTick: MetronomeOptions['onTick'];

  isRunning(): boolean {
    return this.timerId !== null;
  }

  setBpm(bpm: number) { this.bpm = Math.max(20, Math.min(300, bpm)); }
  setBeatsPerBar(n: number) { this.beatsPerBar = Math.max(1, Math.min(16, n)); }
  setSubdivisions(n: number) { this.subdivisions = Math.max(1, Math.min(8, n)); }
  setVolume(v: number) { this.volume = Math.max(0, Math.min(1, v)); }

  start(opts: MetronomeOptions) {
    if (this.timerId !== null) this.stop();
    this.bpm = opts.bpm;
    this.beatsPerBar = opts.beatsPerBar;
    this.subdivisions = opts.subdivisions;
    this.volume = opts.volume;
    this.onTick = opts.onTick;

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!this.audioContext) this.audioContext = new Ctx();
    if (this.audioContext.state === 'suspended') void this.audioContext.resume();

    this.currentBeat = 0;
    this.currentSub = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;
    this.timerId = setInterval(() => this.scheduler(), LOOKAHEAD_MS);
  }

  stop() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.currentBeat = 0;
    this.currentSub = 0;
  }

  destroy() {
    this.stop();
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }

  private scheduler() {
    if (!this.audioContext) return;
    while (this.nextNoteTime < this.audioContext.currentTime + SCHEDULE_AHEAD_S) {
      this.scheduleNote(this.currentBeat, this.currentSub, this.nextNoteTime);
      this.advanceNote();
    }
  }

  private advanceNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    const secondsPerSub = secondsPerBeat / this.subdivisions;
    this.nextNoteTime += secondsPerSub;
    this.currentSub += 1;
    if (this.currentSub >= this.subdivisions) {
      this.currentSub = 0;
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;
    }
  }

  private scheduleNote(beat: number, sub: number, time: number) {
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const isAccent = beat === 0 && sub === 0;
    const isMainBeat = sub === 0;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = isAccent ? 1500 : isMainBeat ? 1100 : 800;
    const peak = this.volume * (isAccent ? 0.9 : isMainBeat ? 0.65 : 0.35);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.06);

    if (this.onTick) {
      const delayMs = Math.max(0, (time - ctx.currentTime) * 1000);
      setTimeout(() => this.onTick?.({ beat, subBeat: sub, isAccent, time }), delayMs);
    }
  }
}
