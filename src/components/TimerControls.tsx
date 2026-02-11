import { Play, Pause, RotateCcw } from 'lucide-react';
import { TimerStatus } from '@/hooks/useTimer';

interface TimerControlsProps {
  status: TimerStatus;
  onStart?: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function TimerControls({ status, onPause, onResume, onReset }: TimerControlsProps) {
  if (status === 'idle') return null;

  return (
    <div data-testid="timer-controls" className="flex items-center justify-center gap-4 fade-in-up">
      {status === 'running' && (
        <ControlButton icon={<Pause size={22} />} label="Pause" onClick={onPause} variant="primary" />
      )}
      {status === 'paused' && (
        <ControlButton icon={<Play size={22} />} label="Resume" onClick={onResume} variant="primary" />
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
  const base = "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 scale-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
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
