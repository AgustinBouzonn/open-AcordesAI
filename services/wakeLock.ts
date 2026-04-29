interface WakeLockSentinel {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', cb: () => void) => void;
}

interface WakeLockNavigator {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
}

let current: WakeLockSentinel | null = null;
let visibilityHandler: (() => void) | null = null;
let activeRequests = 0;

const w = () => navigator as unknown as WakeLockNavigator;

async function actuallyAcquire(): Promise<void> {
  if (current && !current.released) return;
  const lock = w().wakeLock;
  if (!lock) return;
  try {
    current = await lock.request('screen');
    current.addEventListener('release', () => { current = null; });
  } catch {
    current = null;
  }
}

function ensureVisibilityHandler() {
  if (visibilityHandler) return;
  visibilityHandler = () => {
    if (document.visibilityState === 'visible' && activeRequests > 0) {
      void actuallyAcquire();
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);
}

export async function acquireWakeLock(): Promise<void> {
  activeRequests++;
  ensureVisibilityHandler();
  await actuallyAcquire();
}

export async function releaseWakeLock(): Promise<void> {
  if (activeRequests > 0) activeRequests--;
  if (activeRequests > 0) return;
  if (current && !current.released) {
    try { await current.release(); } catch { /* noop */ }
  }
  current = null;
}
