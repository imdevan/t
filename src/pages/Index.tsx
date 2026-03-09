import { useEffect, useCallback, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TimerDisplay } from '@/components/TimerDisplay';
import { TimerControls } from '@/components/TimerControls';
import { PresetButton } from '@/components/PresetButton';
import { RecentTimers } from '@/components/RecentTimers';
import { CustomTimerInput } from '@/components/CustomTimerInput';
import { useTimer } from '@/hooks/useTimer';
import { useSettings } from '@/hooks/useSettings';
import { useRecentTimers } from '@/hooks/useRecentTimers';
import { useTheme } from '@/hooks/useTheme';
import { useWakeLock } from '@/hooks/useWakeLock';
import { playCompletionSound } from '@/lib/audio';
import { parseTimerParam, formatDuration, formatTime } from '@/lib/timer';

const PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
];

const Index = () => {
  const { settings, setSettings } = useSettings();
  const { recent, addRecent, clearRecent } = useRecentTimers();
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();

  const handleComplete = useCallback(() => {
    if (settings.audioEnabled) {
      playCompletionSound(settings.volume, settings.completionSound);
    }
  }, [settings.audioEnabled, settings.volume, settings.completionSound]);

  const { remaining, totalSeconds, status, progress, start, pause, resume, reset, stop, updateTime } = useTimer({
    onComplete: handleComplete,
  });

  const [pendingSeconds, setPendingSeconds] = useState<number | null>(null);
  const timerDisplayRef = useRef<{ clearEditing: () => void }>(null);

  useWakeLock(settings.keepAwake, status === 'running');

  const startTimer = useCallback((seconds: number, label: string) => {
    addRecent(seconds, label);
    start(seconds);
    setPendingSeconds(null);
  }, [addRecent, start]);

  // URL param handling
  useEffect(() => {
    // Parse raw query string: /timer?10 → "10", /timer?1:30m → "1:30m"
    const raw = location.search.replace(/^\?/, '');
    if (raw) {
      const seconds = parseTimerParam(raw);
      if (seconds && seconds > 0) {
        startTimer(seconds, formatDuration(seconds));
      }
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update document title
  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      const { hours, minutes, seconds: secs, hasHours } = formatTime(remaining);
      document.title = `${hasHours ? hours + ':' : ''}${minutes}:${secs} — Timr`;
    } else {
      document.title = 'Timr — Beautiful Minimal Timer';
    }
  }, [remaining, status]);

  return (
    <div className="flex flex-col min-h-screen" data-testid="app">
      <Header
        audioEnabled={settings.audioEnabled}
        onToggleAudio={() => setSettings({ audioEnabled: !settings.audioEnabled })}
        onToggleTheme={toggleTheme}
        resolvedTheme={resolvedTheme}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-4 sm:gap-6 py-4">
        {/* Hero: Timer Display */}
        <TimerDisplay
          remaining={remaining}
          totalSeconds={totalSeconds}
          status={status}
          progress={progress}
          youtubeUrl={settings.youtubeUrl}
          timerTheme={settings.timerTheme}
          customGradient={
            settings.timerTheme === 'custom'
              ? (settings.customGradients || []).find(g => g.id === settings.activeCustomGradientId) || null
              : null
          }
          onStart={startTimer}
          onUpdateTime={updateTime}
          onPendingChange={setPendingSeconds}
        />
        {/* Controls */}
        <TimerControls
          status={status}
          onPause={pause}
          onResume={resume}
          onReset={reset}
          onStop={stop}
          pendingSeconds={pendingSeconds}
          onStartPending={() => {
            if (pendingSeconds && pendingSeconds > 0) {
              startTimer(pendingSeconds, formatDuration(pendingSeconds));
            }
          }}
          onClearPending={() => {
            setPendingSeconds(null);
            // Reset the timer display editing state
            reset();
          }}
        />

        {/* Presets & Input (show when idle or completed) */}
        {(status === 'idle' || status === 'completed') && (
          <section className="w-full max-w-lg mx-auto space-y-8 fade-in-up">
            {/* Recent */}
            <RecentTimers
              recent={recent}
              onSelect={startTimer}
              onClear={clearRecent}
            />

            {/* Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full" data-testid="presets">
              {PRESETS.map(p => (
                <PresetButton
                  key={p.seconds}
                  label={p.label}
                  seconds={p.seconds}
                  onSelect={startTimer}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
