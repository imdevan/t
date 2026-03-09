const audioCtxRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  return audioCtxRef.current;
}

export type CompletionSound = 'chime' | 'birds' | 'synth';

export const COMPLETION_SOUNDS: { id: CompletionSound; label: string; description: string }[] = [
  { id: 'chime', label: 'Soft Chime', description: 'A gentle, simple chime' },
  { id: 'birds', label: 'Birds', description: 'Morning birdsong melody' },
  { id: 'synth', label: 'Retro Synth', description: 'Cheesy synth fanfare' },
];

export function playCompletionSound(volume: number = 0.5, sound: CompletionSound = 'chime') {
  switch (sound) {
    case 'chime':
      playChime(volume);
      break;
    case 'birds':
      playBirds(volume);
      break;
    case 'synth':
      playSynth(volume);
      break;
  }
}

/** Soft chime — gentle sine tones ascending */
function playChime(volume: number) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const frequencies = [523.25, 659.25, 783.99];
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + i * 0.2);
    gain.gain.linearRampToValueAtTime(volume * 0.6, now + i * 0.2 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.2);
    osc.stop(now + i * 0.2 + 1.2);
  });
}

/** Birds — high-pitched chirpy warbling tones */
function playBirds(volume: number) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Bird chirp patterns: frequency, start offset, duration, vibrato speed
  const chirps = [
    { freq: 2200, start: 0, dur: 0.15, vib: 30 },
    { freq: 2600, start: 0.18, dur: 0.12, vib: 35 },
    { freq: 2000, start: 0.35, dur: 0.2, vib: 25 },
    { freq: 2800, start: 0.5, dur: 0.1, vib: 40 },
    { freq: 2400, start: 0.55, dur: 0.18, vib: 30 },
    { freq: 3000, start: 0.75, dur: 0.12, vib: 45 },
    { freq: 2200, start: 0.9, dur: 0.25, vib: 20 },
    { freq: 2600, start: 1.1, dur: 0.15, vib: 35 },
  ];

  chirps.forEach(({ freq, start, dur, vib }) => {
    const osc = ctx.createOscillator();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    const gain = ctx.createGain();

    // Vibrato for warble effect
    vibrato.type = 'sine';
    vibrato.frequency.value = vib;
    vibratoGain.gain.value = freq * 0.03;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    osc.type = 'sine';
    osc.frequency.value = freq;
    // Slight pitch slide up
    osc.frequency.linearRampToValueAtTime(freq * 1.1, now + start + dur * 0.5);
    osc.frequency.linearRampToValueAtTime(freq * 0.95, now + start + dur);

    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(volume * 0.35, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
    vibrato.start(now + start);
    vibrato.stop(now + start + dur + 0.05);
  });
}

/** Retro Synth — cheesy 80s fanfare with sawtooth waves */
function playSynth(volume: number) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Cheesy ascending synth fanfare
  const notes = [
    { freq: 261.63, start: 0, dur: 0.2 },      // C4
    { freq: 329.63, start: 0.15, dur: 0.2 },    // E4
    { freq: 392.00, start: 0.3, dur: 0.2 },     // G4
    { freq: 523.25, start: 0.45, dur: 0.6 },    // C5 (held)
    { freq: 659.25, start: 0.45, dur: 0.6 },    // E5 (harmony)
  ];

  notes.forEach(({ freq, start, dur }) => {
    // Main sawtooth
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 2;

    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(volume * 0.25, now + start + 0.03);
    gain.gain.setValueAtTime(volume * 0.2, now + start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.35);

    // Sub oscillator for thickness
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'square';
    sub.frequency.value = freq * 0.5;
    subGain.gain.setValueAtTime(0, now + start);
    subGain.gain.linearRampToValueAtTime(volume * 0.08, now + start + 0.03);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + start + dur + 0.3);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now + start);
    sub.stop(now + start + dur + 0.35);
  });
}
