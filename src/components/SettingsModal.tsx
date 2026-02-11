import { Settings, X } from 'lucide-react';
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
              {/* Audio */}
              <SettingRow label="Audio notifications">
                <ToggleSwitch
                  checked={settings.audioEnabled}
                  onChange={v => onUpdate({ audioEnabled: v })}
                  id="audio-setting"
                />
              </SettingRow>

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
