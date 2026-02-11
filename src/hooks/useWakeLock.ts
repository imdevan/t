import { useEffect, useRef, useCallback } from 'react';

export function useWakeLock(enabled: boolean, active: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {}
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {}
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled && active) {
      request();
    } else {
      release();
    }
    return () => { release(); };
  }, [enabled, active, request, release]);
}
