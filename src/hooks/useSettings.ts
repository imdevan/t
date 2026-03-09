import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'timr-settings';

export interface TimrSettings {
  audioEnabled: boolean;
  volume: number;
  defaultUnit: 'seconds' | 'minutes' | 'hours';
  keepAwake: boolean;
  googleFontUrl: string;
  youtubeUrl: string;
}

const DEFAULT_FONT_URL = 'https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&display=swap';

const defaultSettings: TimrSettings = {
  audioEnabled: true,
  defaultUnit: 'minutes',
  keepAwake: true,
  googleFontUrl: DEFAULT_FONT_URL,
  youtubeUrl: '',
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

  // Apply Google Font dynamically
  useEffect(() => {
    const url = settings.googleFontUrl;
    if (!url) return;

    const id = 'timr-google-font';
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = url;

    // Extract font family name from URL
    const match = url.match(/family=([^:&]+)/);
    if (match) {
      const fontFamily = decodeURIComponent(match[1]).replace(/\+/g, ' ');
      document.documentElement.style.setProperty('--font-display', `'${fontFamily}', cursive`);
      document.documentElement.style.setProperty('--font-body', `'${fontFamily}', cursive`);
    }
  }, [settings.googleFontUrl]);

  return { settings, setSettings };
}
