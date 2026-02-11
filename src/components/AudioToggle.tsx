import { Volume2, VolumeX } from 'lucide-react';

interface AudioToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function AudioToggle({ enabled, onToggle }: AudioToggleProps) {
  return (
    <button
      data-testid="audio-toggle"
      onClick={onToggle}
      className="p-2 rounded-lg transition-all duration-200
        hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        text-foreground scale-press"
      aria-label={enabled ? 'Disable audio' : 'Enable audio'}
      title={enabled ? 'Audio on' : 'Audio off'}
    >
      {enabled ? <Volume2 size={20} /> : <VolumeX size={20} className="text-muted-foreground" />}
    </button>
  );
}
