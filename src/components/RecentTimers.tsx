import { Clock, Trash2 } from 'lucide-react';
import { RecentTimer } from '@/hooks/useRecentTimers';
import { formatDuration } from '@/lib/timer';

interface RecentTimersProps {
  recent: RecentTimer[];
  onSelect: (seconds: number, label: string) => void;
  onClear: () => void;
}

export function RecentTimers({ recent, onSelect, onClear }: RecentTimersProps) {
  if (recent.length === 0) return null;

  return (
    <section data-testid="recent-timers" className="w-full fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Recent</h2>
        <button
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Clear recent timers"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recent.map(r => (
          <button
            key={r.timestamp}
            onClick={() => onSelect(r.seconds, r.label)}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-border
              text-sm text-card-foreground hover:border-primary/30 hover:shadow-soft
              transition-all duration-200 scale-press
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Clock size={12} className="text-muted-foreground" />
            <span>{r.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
