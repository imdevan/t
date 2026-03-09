import { useEffect, useState, useCallback } from 'react';
import { CompletionSound } from '@/lib/audio';
const STORAGE_KEY = 'timr-settings';

export type TimerTheme = 'classic' | 'rainbow' | 'lovable' | 'cherry' | 'wisteria' | 'ocean' | 'custom';

export interface CustomGradient {
  id: string;
  name: string;
  colors: string[]; // array of hex colors
}

export interface TimrSettings {
  audioEnabled: boolean;
  completionSound: CompletionSound;
  volume: number;
  defaultUnit: 'seconds' | 'minutes' | 'hours';
  keepAwake: boolean;
  googleFontUrl: string;
  youtubeUrl: string;
  timerTheme: TimerTheme;
  customGradients: CustomGradient[];
  activeCustomGradientId: string;
}

const DEFAULT_FONT_URL = 'https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&display=swap';

const defaultSettings: TimrSettings = {
  audioEnabled: true,
  completionSound: 'chime' as CompletionSound,
  volume: 0.5,
  defaultUnit: 'minutes',
  keepAwake: true,
  googleFontUrl: DEFAULT_FONT_URL,
  youtubeUrl: '',
  timerTheme: 'classic',
  customGradients: [],
  activeCustomGradientId: '',
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

    const hexToHsl = (hex: string): string => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Theme color definitions: [light, dark] pairs as HSL values
    const themeColors: Partial<Record<TimerTheme, {
      primary: [string, string];
      accent: [string, string];
      ring: [string, string];
      timerGlow: [string, string];
      timerActive: [string, string];
    }>> = {
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

    const vars = ['--primary', '--accent', '--ring', '--timer-glow', '--timer-active'] as const;
    const keys = ['primary', 'accent', 'ring', 'timerGlow', 'timerActive'] as const;

    if (settings.timerTheme === 'classic') {
      // Classic: remove overrides so CSS defaults (burnt orange) apply
      vars.forEach(v => root.style.removeProperty(v));
    } else if (settings.timerTheme === 'custom') {
      // Custom gradient: derive colors from gradient's hex colors
      const gradient = (settings.customGradients || []).find(g => g.id === settings.activeCustomGradientId);
      if (gradient && gradient.colors.length >= 2) {
        const primaryHsl = hexToHsl(gradient.colors[0]);
        const accentHsl = hexToHsl(gradient.colors[1]);
        root.style.setProperty('--primary', primaryHsl);
        root.style.setProperty('--accent', accentHsl);
        root.style.setProperty('--ring', primaryHsl);
        root.style.setProperty('--timer-glow', primaryHsl);
        root.style.setProperty('--timer-active', accentHsl);
      } else {
        vars.forEach(v => root.style.removeProperty(v));
      }
    } else {
      const colors = themeColors[settings.timerTheme];
      if (colors) {
        const idx = isDark ? 1 : 0;
        keys.forEach((key, i) => {
          root.style.setProperty(vars[i], colors[key][idx]);
        });
      }
    }
  }, [settings.timerTheme, settings.activeCustomGradientId, settings.customGradients]);

  return { settings, setSettings };
}
