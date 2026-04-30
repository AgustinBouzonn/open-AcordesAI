const memory = new Map<string, string>();
let storageAvailable: boolean | null = null;

const probeStorage = (): boolean => {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const probe = '__acordesai_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
};

export const safeStorage = {
  get(key: string): string | null {
    if (probeStorage()) {
      try { return window.localStorage.getItem(key); } catch { /* fallthrough */ }
    }
    return memory.has(key) ? memory.get(key)! : null;
  },
  set(key: string, value: string): void {
    if (probeStorage()) {
      try { window.localStorage.setItem(key, value); return; } catch { /* fallthrough */ }
    }
    memory.set(key, value);
  },
  remove(key: string): void {
    if (probeStorage()) {
      try { window.localStorage.removeItem(key); } catch { /* fallthrough */ }
    }
    memory.delete(key);
  },
};
