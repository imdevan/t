import { formatTime } from '@/lib/timer';
import { TimerStatus } from '@/hooks/useTimer';

interface TimerDisplayProps {
  remaining: number;
  totalSeconds: number;
  status: TimerStatus;
  progress: number;
}

export function TimerDisplay({ remaining, totalSeconds, status, progress }: TimerDisplayProps) {
  const { hours, minutes, seconds, hasHours } = formatTime(remaining);
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
      className={`relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto rounded-full transition-shadow duration-700 ${glowClass}`}
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

      {/* Time display */}
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
