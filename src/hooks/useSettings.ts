import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'timr-settings';

export type TimerTheme = 'classic' | 'rainbow' | 'lovable' | 'cherry' | 'wisteria' | 'ocean';

export interface TimrSettings {
  audioEnabled: boolean;
  volume: number;
  defaultUnit: 'seconds' | 'minutes' | 'hours';
  keepAwake: boolean;
  googleFontUrl: string;
  youtubeUrl: string;
  timerTheme: TimerTheme;
}

const DEFAULT_FONT_URL = 'https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&display=swap';

const defaultSettings: TimrSettings = {
  audioEnabled: true,
  volume: 0.5,
  defaultUnit: 'minutes',
  keepAwake: true,
  googleFontUrl: DEFAULT_FONT_URL,
  youtubeUrl: '',
  timerTheme: 'classic',
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

  // Apply theme colors dynamically
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    // Theme color definitions: [light, dark] pairs as HSL values
    const themeColors: Record<TimerTheme, {
      primary: [string, string];
      accent: [string, string];
      ring: [string, string];
      timerGlow: [string, string];
      timerActive: [string, string];
    } | null> = {
      classic: null, // uses CSS defaults
      rainbow: {
        primary: ['0 85% 60%', '0 85% 62%'],
        accent: ['280 80% 60%', '280 75% 65%'],
        ring: ['0 85% 60%', '0 85% 62%'],
        timerGlow: ['0 85% 60%', '0 85% 62%'],
        timerActive: ['280 80% 60%', '280 75% 65%'],
      },
      lovable: {
        primary: ['335 90% 60%', '335 90% 65%'],
        accent: ['290 90% 62%', '290 90% 67%'],
        ring: ['335 90% 60%', '335 90% 65%'],
        timerGlow: ['335 90% 60%', '335 90% 65%'],
        timerActive: ['290 90% 58%', '290 85% 63%'],
      },
      cherry: {
        primary: ['330 100% 71%', '330 100% 74%'],
        accent: ['338 100% 55%', '338 100% 60%'],
        ring: ['330 100% 71%', '330 100% 74%'],
        timerGlow: ['330 100% 71%', '330 100% 74%'],
        timerActive: ['338 100% 55%', '338 95% 60%'],
      },
      wisteria: {
        primary: ['263 90% 66%', '263 90% 70%'],
        accent: ['271 81% 46%', '271 81% 55%'],
        ring: ['263 90% 66%', '263 90% 70%'],
        timerGlow: ['263 90% 66%', '263 90% 70%'],
        timerActive: ['271 81% 46%', '271 81% 55%'],
      },
      ocean: {
        primary: ['200 90% 48%', '200 90% 52%'],
        accent: ['217 91% 55%', '217 91% 60%'],
        ring: ['200 90% 48%', '200 90% 52%'],
        timerGlow: ['200 90% 48%', '200 90% 52%'],
        timerActive: ['217 91% 55%', '217 91% 60%'],
      },
    };

    const colors = themeColors[settings.timerTheme];
    const vars = ['--primary', '--accent', '--ring', '--timer-glow', '--timer-active'] as const;
    const keys = ['primary', 'accent', 'ring', 'timerGlow', 'timerActive'] as const;

    if (!colors) {
      // Classic: remove overrides so CSS defaults apply
      vars.forEach(v => root.style.removeProperty(v));
    } else {
      const idx = isDark ? 1 : 0;
      keys.forEach((key, i) => {
        root.style.setProperty(vars[i], colors[key][idx]);
      });
    }
  }, [settings.timerTheme]);

  return { settings, setSettings };
}
