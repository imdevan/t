export function formatTime(totalSeconds: number): { hours: string; minutes: string; seconds: string; hasHours: boolean } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
    hasHours: h > 0,
  };
}

export function parseTimerParam(param: string): number | null {
  // Support colon format: 1:30 (1h 30m), 1:30m (1m 30s)
  const colonMatch = param.match(/^(\d+):(\d+)(m|s)?$/i);
  if (colonMatch) {
    const left = parseInt(colonMatch[1]);
    const right = parseInt(colonMatch[2]);
    const suffix = (colonMatch[3] || '').toLowerCase();
    if (suffix === 'm' || suffix === 's') {
      // e.g. 1:30m → 1 min 30 sec
      return left * 60 + right;
    }
    // e.g. 1:30 → 1 hour 30 min
    return left * 3600 + right * 60;
  }

  const match = param.match(/^(\d+(?:\.\d+)?)(s|m|h|d)?$/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'm').toLowerCase();
  switch (unit) {
    case 's': return Math.round(value);
    case 'm': return Math.round(value * 60);
    case 'h': return Math.round(value * 3600);
    case 'd': return Math.round(value * 86400);
    default: return Math.round(value * 60);
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function durationToSeconds(value: number, unit: 'seconds' | 'minutes' | 'hours'): number {
  switch (unit) {
    case 'seconds': return value;
    case 'minutes': return value * 60;
    case 'hours': return value * 3600;
  }
}
