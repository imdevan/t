import { useState, useRef, KeyboardEvent } from 'react';
import { durationToSeconds, formatDuration } from '@/lib/timer';
import { TimrSettings } from '@/hooks/useSettings';

interface CustomTimerInputProps {
  defaultUnit: TimrSettings['defaultUnit'];
  onStart: (seconds: number, label: string) => void;
}

export function CustomTimerInput({ defaultUnit, onStart }: CustomTimerInputProps) {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<TimrSettings['defaultUnit']>(defaultUnit);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    const seconds = durationToSeconds(Math.round(num), unit);
    onStart(seconds, formatDuration(seconds));
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div data-testid="custom-input" className="flex items-center gap-2 w-full max-w-xs mx-auto">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="number"
          min="1"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Custom"
          className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground text-center
            text-base font-display placeholder:text-muted-foreground
            shadow-soft focus:shadow-medium focus:border-primary/50
            transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <select
        value={unit}
        onChange={e => setUnit(e.target.value as TimrSettings['defaultUnit'])}
        className="px-3 py-3 rounded-lg bg-card border border-border text-foreground text-sm
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        <option value="seconds">sec</option>
        <option value="minutes">min</option>
        <option value="hours">hr</option>
      </select>
      <button
        onClick={handleSubmit}
        disabled={!value || parseFloat(value) <= 0}
        className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm
          shadow-soft hover:shadow-medium transition-all duration-200 scale-press
          disabled:opacity-40 disabled:cursor-not-allowed
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Go
      </button>
    </div>
  );
}
