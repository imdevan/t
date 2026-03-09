import { useState, useRef, useCallback, useEffect } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface UseTimerOptions {
  onComplete?: () => void;
}

export function useTimer({ onComplete }: UseTimerOptions = {}) {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setRemaining(prev => {
      if (prev <= 1) {
        clearTimer();
        setStatus('completed');
        onCompleteRef.current?.();
        return 0;
      }
      return prev - 1;
    });
  }, [clearTimer]);

  const start = useCallback((seconds: number) => {
    clearTimer();
    setTotalSeconds(seconds);
    setRemaining(seconds);
    setStatus('running');
    intervalRef.current = setInterval(tick, 1000);
  }, [clearTimer, tick]);

  const pause = useCallback(() => {
    if (status === 'running') {
      clearTimer();
      setStatus('paused');
    }
  }, [status, clearTimer]);

  const resume = useCallback(() => {
    if (status === 'paused' && remaining > 0) {
      setStatus('running');
      intervalRef.current = setInterval(tick, 1000);
    }
  }, [status, remaining, tick]);

  const reset = useCallback(() => {
    clearTimer();
    if (totalSeconds > 0) {
      setRemaining(totalSeconds);
      setStatus('running');
      intervalRef.current = setInterval(tick, 1000);
    } else {
      setRemaining(0);
      setTotalSeconds(0);
      setStatus('idle');
    }
  }, [clearTimer, totalSeconds, tick]);

  const stop = useCallback(() => {
    clearTimer();
    setRemaining(0);
    setTotalSeconds(0);
    setStatus('idle');
  }, [clearTimer]);

  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return { remaining, totalSeconds, status, progress, start, pause, resume, reset, stop };
}
