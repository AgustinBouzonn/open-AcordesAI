let ctx: AudioContext | null = null;
let osc: OscillatorNode | null = null;
let gainNode: GainNode | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
  return ctx;
}

export function playReferenceTone(freq: number, durationMs = 1800): void {
  stopReferenceTone();
  const c = getCtx();
  const now = c.currentTime;
  const dur = durationMs / 1000;

  osc = c.createOscillator();
  gainNode = c.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.25, now + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.4);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(gainNode);
  gainNode.connect(c.destination);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

export function stopReferenceTone(): void {
  if (osc) {
    try { osc.stop(); } catch { /* noop */ }
    try { osc.disconnect(); } catch { /* noop */ }
    osc = null;
  }
  if (gainNode) {
    try { gainNode.disconnect(); } catch { /* noop */ }
    gainNode = null;
  }
}
