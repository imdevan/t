import { Settings, X, Type, Youtube, Volume2, Palette, Plus, ChevronDown, Play } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { TimrSettings, CustomGradient } from '@/hooks/useSettings';
import { COMPLETION_SOUNDS, playCompletionSound, CompletionSound } from '@/lib/audio';

interface SettingsModalProps {
  settings: TimrSettings;
  onUpdate: (update: Partial<TimrSettings>) => void;
}

export function SettingsModal({ settings, onUpdate }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [newGradientName, setNewGradientName] = useState('');
  const [newGradientColors, setNewGradientColors] = useState(['#ff5757', '#b957ff', '#5770ff']);

  const addCustomGradient = () => {
    if (!newGradientName.trim() || newGradientColors.length < 2) return;
    const gradient: CustomGradient = {
      id: `custom-${Date.now()}`,
      name: newGradientName.trim(),
      colors: [...newGradientColors],
    };
    onUpdate({
      customGradients: [...(settings.customGradients || []), gradient],
      timerTheme: 'custom',
      activeCustomGradientId: gradient.id,
    });
    setNewGradientName('');
  };

  const removeCustomGradient = (id: string) => {
    const updated = (settings.customGradients || []).filter(g => g.id !== id);
    onUpdate({
      customGradients: updated,
      ...(settings.activeCustomGradientId === id
        ? { timerTheme: 'classic' as const, activeCustomGradientId: '' }
        : {}),
    });
  };

  const selectCustomGradient = (id: string) => {
    onUpdate({ timerTheme: 'custom', activeCustomGradientId: id });
  };

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
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-popover border border-border rounded-2xl shadow-large w-full max-w-sm mx-4 max-h-[85vh] flex flex-col fade-in-up">
            <div className="flex items-center justify-between p-6 pb-0">
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

            <div className="overflow-y-auto p-6 pt-4 space-y-5 mac-scrollbar">

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
                <div className="space-y-3">
                  {/* Sound picker */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Completion Sound</span>
                    <div className="grid grid-cols-3 gap-2">
                      {COMPLETION_SOUNDS.map(s => (
                        <button
                          key={s.id}
                          onClick={() => onUpdate({ completionSound: s.id })}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-200 text-center ${
                            settings.completionSound === s.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                        >
                          <span className="text-xs font-medium text-foreground">{s.label}</span>
                          <span className="text-[10px] text-muted-foreground leading-tight">{s.description}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => playCompletionSound(settings.volume, settings.completionSound)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Play size={12} />
                      Preview sound
                    </button>
                  </div>

                  {/* Volume */}
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

              {/* Timer Theme */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">Timer Theme</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'classic' as const, label: 'Classic', preview: <div className="w-10 h-10 rounded-full border-[3px]" style={{ borderColor: 'hsl(24 80% 50%)' }} /> },
                    { id: 'rainbow' as const, label: 'Rainbow', preview: <ThemeRing gradient="conic-gradient(#f44, #f90, #ff0, #0c0, #09f, #c4f, #f44)" /> },
                    { id: 'lovable' as const, label: 'Lovable', preview: <ThemeRing gradient="conic-gradient(#ff5757, #ff57b9, #d957ff, #b957ff, #ff8a57, #ff5757)" /> },
                    { id: 'cherry' as const, label: 'Cherry', preview: <ThemeRing gradient="conic-gradient(#ffb7c5, #ff69b4, #ff1493, #ffb7c5)" /> },
                    { id: 'wisteria' as const, label: 'Wisteria', preview: <ThemeRing gradient="conic-gradient(#c9a0dc, #8b5cf6, #6d28d9, #a78bfa, #c9a0dc)" /> },
                    { id: 'ocean' as const, label: 'Ocean', preview: <ThemeRing gradient="conic-gradient(#06d4a0, #0ea5e9, #3b82f6, #2563eb, #22c55e, #06d4a0)" /> },
                  ]).map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => onUpdate({ timerTheme: theme.id })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                        settings.timerTheme === theme.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      {theme.preview}
                      <span className="text-xs text-foreground font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Gradients */}
              <CustomGradientsSection
                settings={settings}
                onUpdate={onUpdate}
                selectCustomGradient={selectCustomGradient}
                removeCustomGradient={removeCustomGradient}
                addCustomGradient={addCustomGradient}
                newGradientName={newGradientName}
                setNewGradientName={setNewGradientName}
                newGradientColors={newGradientColors}
                setNewGradientColors={setNewGradientColors}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CustomGradientsSection({
  settings, onUpdate, selectCustomGradient, removeCustomGradient,
  addCustomGradient, newGradientName, setNewGradientName, newGradientColors, setNewGradientColors,
}: {
  settings: TimrSettings; onUpdate: (u: Partial<TimrSettings>) => void;
  selectCustomGradient: (id: string) => void; removeCustomGradient: (id: string) => void;
  addCustomGradient: () => void;
  newGradientName: string; setNewGradientName: (v: string) => void;
  newGradientColors: string[]; setNewGradientColors: (v: string[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-3">
      <span className="text-sm text-foreground font-medium">Custom Gradients</span>

      {(settings.customGradients || []).length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {(settings.customGradients || []).map(g => (
            <div key={g.id} className="relative group">
              <button
                onClick={() => selectCustomGradient(g.id)}
                className={`w-full flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                  settings.timerTheme === 'custom' && settings.activeCustomGradientId === g.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <ThemeRing gradient={`conic-gradient(${g.colors.join(', ')}, ${g.colors[0]})`} />
                <span className="text-xs text-foreground font-medium truncate w-full text-center">{g.name}</span>
              </button>
              <button
                onClick={() => removeCustomGradient(g.id)}
                className="absolute -top-1 -right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete ${g.name}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border
            text-xs text-muted-foreground font-medium hover:border-primary/50 hover:text-foreground transition-colors"
        >
          <Plus size={14} />
          Add Gradient
        </button>
      ) : (
        <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
          {/* Preview bar */}
          <div
            className="h-3 w-full"
            style={{ background: `linear-gradient(to right, ${newGradientColors.join(', ')})` }}
          />

          <div className="p-4 space-y-4">
            {/* Name input */}
            <input
              type="text"
              placeholder="Gradient name…"
              value={newGradientName}
              onChange={e => setNewGradientName(e.target.value)}
              className="w-full bg-transparent border-b border-border px-1 py-1.5 text-sm text-foreground
                placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:border-primary
                transition-colors"
            />

            {/* Color stops */}
            <div className="flex flex-wrap items-center gap-2">
              {newGradientColors.map((color, i) => (
                <div key={i} className="relative group/color">
                  <label
                    className="block w-9 h-9 rounded-lg cursor-pointer ring-2 ring-border hover:ring-foreground/40 transition-all shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    <input
                      type="color"
                      value={color}
                      onChange={e => {
                        const updated = [...newGradientColors];
                        updated[i] = e.target.value;
                        setNewGradientColors(updated);
                      }}
                      className="sr-only"
                    />
                  </label>
                  {newGradientColors.length > 2 && (
                    <button
                      onClick={() => setNewGradientColors(newGradientColors.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center
                        opacity-0 group-hover/color:opacity-100 transition-opacity"
                      aria-label="Remove color"
                    >
                      <X size={8} />
                    </button>
                  )}
                  <input
                    type="text"
                    value={color}
                    onChange={e => {
                      let v = e.target.value;
                      if (!v.startsWith('#')) v = '#' + v;
                      const updated = [...newGradientColors];
                      updated[i] = v;
                      setNewGradientColors(updated);
                    }}
                    maxLength={7}
                    className="mt-1 w-[4.2rem] bg-transparent text-center text-[10px] text-muted-foreground font-mono
                      border-none focus-visible:outline-none focus-visible:text-foreground transition-colors"
                  />
                </div>
              ))}
              {newGradientColors.length < 6 && (
                <button
                  onClick={() => setNewGradientColors([...newGradientColors, '#888888'])}
                  className="w-9 h-9 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  aria-label="Add color"
                >
                  <Plus size={12} />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => { addCustomGradient(); setShowForm(false); }}
                disabled={!newGradientName.trim()}
                className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                  disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Save Gradient
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeRing({ gradient }: { gradient: string }) {
  return (
    <div
      className="w-10 h-10 rounded-full"
      style={{
        background: gradient,
        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
        mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
      }}
    />
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
