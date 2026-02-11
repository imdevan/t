interface PresetButtonProps {
  label: string;
  seconds: number;
  onSelect: (seconds: number, label: string) => void;
}

export function PresetButton({ label, seconds, onSelect }: PresetButtonProps) {
  return (
    <button
      data-testid={`preset-${seconds}`}
      onClick={() => onSelect(seconds, label)}
      className="px-5 py-3 rounded-lg bg-card text-card-foreground border border-border
        shadow-soft hover:shadow-medium hover:border-primary/30
        transition-all duration-200 scale-press
        font-display text-sm sm:text-base font-bold
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {label}
    </button>
  );
}
