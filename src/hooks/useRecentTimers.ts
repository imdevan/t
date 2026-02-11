import { useState, useCallback } from 'react';

const STORAGE_KEY = 'timr-recent';
const MAX_RECENT = 8;

export interface RecentTimer {
  seconds: number;
  label: string;
  timestamp: number;
}

export function useRecentTimers() {
  const [recent, setRecentState] = useState<RecentTimer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const addRecent = useCallback((seconds: number, label: string) => {
    setRecentState(prev => {
      const filtered = prev.filter(r => r.seconds !== seconds);
      const next = [{ seconds, label, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentState([]);
  }, []);

  return { recent, addRecent, clearRecent };
}
