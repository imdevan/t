import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'timr-settings';

export interface TimrSettings {
  audioEnabled: boolean;
  defaultUnit: 'seconds' | 'minutes' | 'hours';
  keepAwake: boolean;
  googleFontUrl: string;
}

const DEFAULT_FONT_URL = 'https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&display=swap';

const defaultSettings: TimrSettings = {
  audioEnabled: true,
  defaultUnit: 'minutes',
  keepAwake: true,
  googleFontUrl: DEFAULT_FONT_URL,
};

export function useSettings() {
  const [settings, setSettingsState] = useState<TimrSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {}
    return defaultSettings;
  });

  const setSettings = useCallback((update: Partial<TimrSettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...update };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, setSettings };
}
