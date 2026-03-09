import { Settings, X, Type, Youtube, Volume2, Palette } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { TimrSettings } from '@/hooks/useSettings';

interface SettingsModalProps {
  settings: TimrSettings;
  onUpdate: (update: Partial<TimrSettings>) => void;
}

export function SettingsModal({ settings, onUpdate }: SettingsModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        data-testid="settings-button"
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg transition-all duration-200
          hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          text-foreground scale-press"
        aria-label="Open settings"
      >
        <Settings size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-popover border border-border rounded-2xl shadow-large w-full max-w-sm mx-4 p-6 fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-display">Settings</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-secondary transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Timer Theme */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">Timer Theme</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdate({ timerTheme: 'classic' })}
                    className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                      settings.timerTheme === 'classic'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full border-[3px] border-primary" />
                    <span className="text-xs text-foreground font-medium">Classic</span>
                  </button>
                  <button
                    onClick={() => onUpdate({ timerTheme: 'rainbow' })}
                    className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                      settings.timerTheme === 'rainbow'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full"
                      style={{
                        background: 'conic-gradient(#f44, #f90, #ff0, #0c0, #09f, #c4f, #f44)',
                        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
                        mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
                      }}
                    />
                    <span className="text-xs text-foreground font-medium">Rainbow</span>
                  </button>
                </div>
              </div>

              {/* Audio */}
              <SettingRow label="Audio notifications">
                <ToggleSwitch
                  checked={settings.audioEnabled}
                  onChange={v => onUpdate({ audioEnabled: v })}
                  id="audio-setting"
                />
              </SettingRow>

              {/* Volume */}
              {settings.audioEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Volume2 size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Volume</span>
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                      {Math.round(settings.volume * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={([v]) => onUpdate({ volume: v })}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              )}

              {/* Keep awake */}
              <SettingRow label="Keep screen awake">
                <ToggleSwitch
                  checked={settings.keepAwake}
                  onChange={v => onUpdate({ keepAwake: v })}
                  id="wake-setting"
                />
              </SettingRow>

              {/* Default unit */}
              <SettingRow label="Default time unit">
                <select
                  value={settings.defaultUnit}
                  onChange={e => onUpdate({ defaultUnit: e.target.value as TimrSettings['defaultUnit'] })}
                  className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    cursor-pointer"
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </select>
              </SettingRow>

              {/* Google Font URL */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Type size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">Google Font</span>
                </div>
                <input
                  type="url"
                  placeholder="Paste Google Fonts CSS URL…"
                  value={settings.googleFontUrl}
                  onChange={e => onUpdate({ googleFontUrl: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground
                    placeholder:text-muted-foreground
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    transition-colors"
                />
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Paste a Google Fonts CSS URL, e.g. fonts.googleapis.com/css2?family=Inter
                </p>
              </div>

              {/* YouTube URL */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Youtube size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">Completion Video</span>
                </div>
                <input
                  type="url"
                  placeholder="Paste YouTube video URL…"
                  value={settings.youtubeUrl}
                  onChange={e => onUpdate({ youtubeUrl: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground
                    placeholder:text-muted-foreground
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    transition-colors"
                />
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Plays inside the timer ring when the countdown ends
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 scale-press
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-primary-foreground shadow-sm
          transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}
