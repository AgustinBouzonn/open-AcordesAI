import { useEffect, useRef } from 'react';
import { api, ApiError } from '../../services/apiClient';

const FLUSH_INTERVAL_MS = 60_000;
const MIN_FLUSH_SEC = 30;
const MAX_IDLE_MS = 90_000;
const MAX_ACCUMULATE_SEC = 60 * 60;

export function usePracticeTracker(songId: string, enabled: boolean) {
  const accumulated = useRef(0);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let visible = document.visibilityState === 'visible';
    let lastActivity = Date.now();
    lastTickRef.current = visible ? Date.now() : null;

    const tick = () => {
      const now = Date.now();
      if (visible && lastTickRef.current !== null && now - lastActivity < MAX_IDLE_MS) {
        const delta = (now - lastTickRef.current) / 1000;
        accumulated.current = Math.min(MAX_ACCUMULATE_SEC, accumulated.current + delta);
      }
      lastTickRef.current = visible ? now : null;
    };

    const flush = async () => {
      tick();
      const sec = Math.round(accumulated.current);
      if (sec < MIN_FLUSH_SEC) return;
      accumulated.current = 0;
      try {
        await api.practice.log(songId, sec);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return;
        accumulated.current += sec;
      }
    };

    const onVisibility = () => {
      tick();
      visible = document.visibilityState === 'visible';
      if (visible) {
        lastActivity = Date.now();
        lastTickRef.current = Date.now();
      }
    };

    const onActivity = () => { lastActivity = Date.now(); };

    const interval = window.setInterval(flush, FLUSH_INTERVAL_MS);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('keydown', onActivity, { passive: true });
    window.addEventListener('mousemove', onActivity, { passive: true });
    window.addEventListener('touchstart', onActivity, { passive: true });
    window.addEventListener('scroll', onActivity, { passive: true });

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('touchstart', onActivity);
      window.removeEventListener('scroll', onActivity);
      void flush();
    };
  }, [songId, enabled]);
}
