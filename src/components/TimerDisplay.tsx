import { formatTime } from '@/lib/timer';
import { TimerStatus } from '@/hooks/useTimer';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

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
}

export function TimerDisplay({ remaining, totalSeconds, status, progress, youtubeUrl = '' }: TimerDisplayProps) {
  const { hours, minutes, seconds, hasHours } = formatTime(remaining);
  const [showVideo, setShowVideo] = useState(false);
  const videoId = extractYoutubeId(youtubeUrl);

  useEffect(() => {
    if (status === 'completed' && videoId) {
      setShowVideo(true);
    } else if (status === 'idle' || status === 'running') {
      setShowVideo(false);
    }
  }, [status, videoId]);
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
        <circle
          cx="150"
          cy="150"
          r="140"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-border"
        />
        {totalSeconds > 0 && (
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className={`${ringColor} transition-colors duration-500`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.3s ease, color 0.5s ease',
            }}
          />
        )}
      </svg>

      {/* YouTube video overlay */}
      {showVideo && videoId && (
        <div className="absolute inset-0 z-20 flex items-center justify-center animate-scale-in">
          <div className="relative w-[90%] h-[90%] rounded-full overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: '300%', height: '100%' }}
              title="Completion video"
            />
          </div>
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-background/80 backdrop-blur-sm
              border border-border text-foreground hover:bg-background transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close video"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Time display */}
      {!showVideo && (
        <div className={`relative z-10 flex items-baseline gap-1 select-none ${status === 'completed' ? 'timer-pulse' : ''}`}>
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
