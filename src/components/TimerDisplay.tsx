import { formatTime, durationToSeconds, formatDuration } from '@/lib/timer';
import { TimerStatus } from '@/hooks/useTimer';
import { X } from 'lucide-react';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

interface TimerDisplayProps {
  remaining: number;
  totalSeconds: number;
  status: TimerStatus;
  progress: number;
  youtubeUrl?: string;
  onStart?: (seconds: number, label: string) => void;
}

export function TimerDisplay({ remaining, totalSeconds, status, progress, youtubeUrl = '', onStart }: TimerDisplayProps) {
  const { hours, minutes, seconds, hasHours } = formatTime(remaining);
  const [showVideo, setShowVideo] = useState(false);
  const [editing, setEditing] = useState(false);
  const [leftValue, setLeftValue] = useState('');
  const [rightValue, setRightValue] = useState('');
  const [leftUnit, setLeftUnit] = useState<'minutes' | 'hours'>(() => {
    try {
      const stored = localStorage.getItem('timr-inline-unit');
      if (stored === 'hours') return 'hours';
    } catch {}
    return 'minutes';
  });
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const videoId = extractYoutubeId(youtubeUrl);

  const rightUnit = leftUnit === 'hours' ? 'min' : 'sec';

  useEffect(() => {
    localStorage.setItem('timr-inline-unit', leftUnit);
  }, [leftUnit]);

  useEffect(() => {
    if (status === 'completed' && videoId) {
      setShowVideo(true);
    } else if (status === 'idle' || status === 'running') {
      setShowVideo(false);
    }
  }, [status, videoId]);

  useEffect(() => {
    if (status === 'running') {
      setEditing(false);
    }
  }, [status]);

  useEffect(() => {
    if (editing) {
      setTimeout(() => leftInputRef.current?.focus(), 50);
    }
  }, [editing]);

  const canEdit = (status === 'idle' || status === 'completed' || status === 'paused') && !showVideo;

  const handleClick = () => {
    if (canEdit && onStart) {
      setEditing(true);
      if (remaining > 0) {
        if (leftUnit === 'hours') {
          const h = Math.floor(remaining / 3600);
          const m = Math.floor((remaining % 3600) / 60);
          setLeftValue(h > 0 ? String(h) : '');
          setRightValue(m > 0 ? String(m) : '');
        } else {
          const m = Math.floor(remaining / 60);
          const s = remaining % 60;
          setLeftValue(m > 0 ? String(m) : '');
          setRightValue(s > 0 ? String(s) : '');
        }
      } else {
        setLeftValue('');
        setRightValue('');
      }
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const container = e.currentTarget;
    requestAnimationFrame(() => {
      if (!container.contains(document.activeElement)) {
        setEditing(false);
      }
    });
  };

  const handleSubmit = () => {
    const left = parseInt(leftValue) || 0;
    const right = parseInt(rightValue) || 0;
    if (left <= 0 && right <= 0 || !onStart) return;
    let secs: number;
    if (leftUnit === 'hours') {
      secs = left * 3600 + right * 60;
    } else {
      secs = left * 60 + right;
    }
    if (secs <= 0) return;
    onStart(secs, formatDuration(secs));
    setEditing(false);
    setLeftValue('');
    setRightValue('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setEditing(false);
  };

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  const glowClass = status === 'running'
    ? 'timer-glow-active'
    : status === 'completed'
    ? 'timer-completed-glow'
    : status === 'paused'
    ? 'timer-glow'
    : '';

  const ringColor = status === 'running'
    ? 'text-timer-active'
    : status === 'completed'
    ? 'text-timer-completed'
    : status === 'paused'
    ? 'text-timer-paused'
    : 'text-muted';

  return (
    <div
      data-testid="timer-display"
      className={`relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto rounded-full transition-shadow duration-700 ${glowClass}`}
    >
      {/* Progress ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 300 300"
        aria-hidden="true"
      >
        <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
        {totalSeconds > 0 && (
          <circle
            cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
            className={`${ringColor} transition-colors duration-500`}
            style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease, color 0.5s ease' }}
          />
        )}
      </svg>

      {/* YouTube video overlay */}
      {showVideo && videoId && (
        <div className="absolute inset-0 z-20 flex items-center justify-center animate-scale-in">
          <div className="relative w-[90%] h-[90%] rounded-full overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
              allow="autoplay; encrypted-media" allowFullScreen
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: '300%', height: '100%' }} title="Completion video"
            />
          </div>
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close video"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Inline edit mode */}
      {!showVideo && editing && (
        <div className="relative z-10 flex flex-col items-center gap-2" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            {/* Left input */}
            <div className="flex flex-col items-center">
              <input
                ref={leftInputRef}
                type="number"
                min="0"
                max="99"
                value={leftValue}
                onChange={e => {
                  const v = e.target.value.slice(0, 2);
                  setLeftValue(v);
                  if (v.length === 2) rightInputRef.current?.focus();
                }}
                onKeyDown={handleKeyDown}
                placeholder="00"
                className="w-16 sm:w-20 text-center text-5xl sm:text-6xl font-bold bg-transparent border-b-2 border-primary/50
                  text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary
                  transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <select
                value={leftUnit}
                onChange={e => setLeftUnit(e.target.value as 'minutes' | 'hours')}
                className="mt-1 px-2 py-0.5 rounded-md bg-card border border-border text-foreground text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <option value="minutes">min</option>
                <option value="hours">hr</option>
              </select>
            </div>

            <span className="text-4xl sm:text-5xl font-bold text-muted-foreground mb-5">:</span>

            {/* Right input */}
            <div className="flex flex-col items-center">
              <input
                ref={rightInputRef}
                type="number"
                min="0"
                max="59"
                value={rightValue}
                onChange={e => setRightValue(e.target.value.slice(0, 2))}
                onKeyDown={handleKeyDown}
                placeholder="00"
                className="w-16 sm:w-20 text-center text-5xl sm:text-6xl font-bold bg-transparent border-b-2 border-primary/50
                  text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary
                  transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="mt-1 px-2 py-0.5 text-xs text-muted-foreground">{rightUnit}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleSubmit}
              disabled={(parseInt(leftValue) || 0) <= 0 && (parseInt(rightValue) || 0) <= 0}
              className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-bold text-xs transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Go
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Time display */}
      {!showVideo && !editing && (
        <div
          className={`relative z-10 flex items-baseline gap-1 select-none ${status === 'completed' ? 'timer-pulse' : ''} ${canEdit ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={handleClick}
          role={canEdit ? 'button' : undefined}
          tabIndex={canEdit ? 0 : undefined}
          aria-label={canEdit ? 'Click to enter custom time' : undefined}
        >
          {hasHours && (
            <>
              <TimeSegment value={hours} label="h" status={status} />
              <span className="text-3xl sm:text-4xl md:text-5xl text-muted-foreground font-bold">:</span>
            </>
          )}
          <TimeSegment value={minutes} label="m" status={status} />
          <span className="text-3xl sm:text-4xl md:text-5xl text-muted-foreground font-bold">:</span>
          <TimeSegment value={seconds} label="s" status={status} />
        </div>
      )}
    </div>
  );
}

function TimeSegment({ value, label, status }: { value: string; label: string; status: TimerStatus }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground tabular-nums"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}