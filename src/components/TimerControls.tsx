import { Play, Pause, RotateCcw, Square, X } from 'lucide-react';
import { TimerStatus } from '@/hooks/useTimer';

interface TimerControlsProps {
  status: TimerStatus;
  onStart?: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStop: () => void;
  pendingSeconds?: number | null;
  onStartPending?: () => void;
  onClearPending?: () => void;
}

export function TimerControls({ status, onPause, onResume, onReset, onStop, pendingSeconds, onStartPending, onClearPending }: TimerControlsProps) {
  // Show Start/Clear when user has entered a pending time while idle
  if ((status === 'idle' || status === 'completed') && pendingSeconds && pendingSeconds > 0) {
    return (
      <div data-testid="timer-controls" className="flex items-center justify-center gap-4 fade-in-up">
        <ControlButton icon={<X size={18} />} label="Clear" onClick={onClearPending!} variant="secondary" />
        <ControlButton icon={<Play size={22} />} label="Start" onClick={onStartPending!} variant="primary" />
      </div>
    );
  }

  if (status === 'idle') return null;

  return (
    <div data-testid="timer-controls" className="flex items-center justify-center gap-4 fade-in-up">
      {status === 'running' && (
        <ControlButton icon={<Pause size={22} />} label="Pause" onClick={onPause} variant="primary" />
      )}
      {status === 'paused' && (
        <>
          <ControlButton icon={<Square size={20} />} label="Stop" onClick={onStop} variant="secondary" />
          <ControlButton icon={<Play size={22} />} label="Resume" onClick={onResume} variant="primary" />
        </>
      )}
      <ControlButton icon={<RotateCcw size={18} />} label="Reset" onClick={onReset} variant="secondary" />
    </div>
  );
}

function ControlButton({
  icon, label, onClick, variant,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary';
}) {
  const base = "flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm transition-all duration-200 scale-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-medium hover:shadow-large",
    secondary: "bg-card text-card-foreground border border-border shadow-soft hover:shadow-medium hover:border-primary/30",
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`} aria-label={label}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
