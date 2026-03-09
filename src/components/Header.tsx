import { Sun, Moon } from 'lucide-react';
import { AudioToggle } from './AudioToggle';
import { SettingsModal } from './SettingsModal';
import { TimrSettings } from '@/hooks/useSettings';

interface HeaderProps {
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onToggleTheme: () => void;
  resolvedTheme: 'light' | 'dark';
  settings: TimrSettings;
  onUpdateSettings: (update: Partial<TimrSettings>) => void;
}

export function Header({ audioEnabled, onToggleAudio, onToggleTheme, resolvedTheme, settings, onUpdateSettings }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 w-full max-w-lg mx-auto" data-testid="header">
      <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Timr</h1>
      <div className="flex items-center gap-1">
        <AudioToggle enabled={audioEnabled} onToggle={onToggleAudio} />
        <button
          data-testid="theme-toggle"
          onClick={onToggleTheme}
          className="p-2 rounded-lg transition-all duration-200
            hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            text-foreground scale-press"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <SettingsModal settings={settings} onUpdate={onUpdateSettings} />
      </div>
    </header>
  );
}
