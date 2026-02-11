const audioCtxRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  return audioCtxRef.current;
}

export function playCompletionSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Pleasant two-tone chime
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + i * 0.2);
    gain.gain.linearRampToValueAtTime(0.15, now + i * 0.2 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.2);
    osc.stop(now + i * 0.2 + 0.8);
  });
}
