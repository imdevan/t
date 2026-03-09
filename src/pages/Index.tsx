import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();

  const handleComplete = useCallback(() => {
    if (settings.audioEnabled) {
      playCompletionSound(settings.volume);
    }
  }, [settings.audioEnabled, settings.volume]);

  const { remaining, totalSeconds, status, progress, start, pause, resume, reset } = useTimer({
    onComplete: handleComplete,
  });

  useWakeLock(settings.keepAwake, status === 'running');

  const startTimer = useCallback((seconds: number, label: string) => {
    addRecent(seconds, label);
    start(seconds);
  }, [addRecent, start]);

  // URL param handling
  useEffect(() => {
    const timerParam = searchParams.get('timer');
    if (timerParam) {
      const seconds = parseTimerParam(timerParam);
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

      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6 py-4">
        {/* Hero: Timer Display */}
        <TimerDisplay
          remaining={remaining}
          totalSeconds={totalSeconds}
          status={status}
          progress={progress}
          youtubeUrl={settings.youtubeUrl}
        />

        {/* Controls */}
        <TimerControls
          status={status}
          onPause={pause}
          onResume={resume}
          onReset={reset}
        />

        {/* Presets & Input (show when idle or completed) */}
        {(status === 'idle' || status === 'completed') && (
          <section className="w-full max-w-lg mx-auto space-y-8 fade-in-up">
            {/* Presets */}
            <div className="flex flex-wrap justify-center gap-3" data-testid="presets">
              {PRESETS.map(p => (
                <PresetButton
                  key={p.seconds}
                  label={p.label}
                  seconds={p.seconds}
                  onSelect={startTimer}
                />
              ))}
            </div>

            {/* Custom input */}
            <CustomTimerInput
              defaultUnit={settings.defaultUnit}
              onStart={startTimer}
            />

            {/* Recent */}
            <RecentTimers
              recent={recent}
              onSelect={startTimer}
              onClear={clearRecent}
            />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
