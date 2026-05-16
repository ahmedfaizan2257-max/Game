// Synthesized Web Audio API Sound Effects for Arcade Gameplay
// Uses native Browser AudioContext so it works fully without any static sound files.

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play a classic coin insert / ticketing sound
export function playSoundCoin() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Sequence of two clean, fast high tones
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn("Web Audio API not supported or interaction blocked", e);
  }
}

// Play sound on placing/stacking a block
export function playSoundStack() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.1); // Upward pitch
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    // Fail silently
  }
}

// Play perfect alignment chime
export function playSoundPerfect(streak: number) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Higher pitch and fuller sound with streak multiplier
    const freqAmt = 880 + (streak * 110);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freqAmt, now);
    osc.frequency.exponentialRampToValueAtTime(freqAmt * 1.5, now + 0.2);
    
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freqAmt * 1.2, now);
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.3);
    osc2.stop(now + 0.3);
  } catch (e) {
    // Fail silently
  }
}

// Play chopping/slicing sound on block trimming
export function playSoundTrim() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(330, now); // E4
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12); // Downward drop
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {
    // Fail silently
  }
}

// Play game over explosion sound
export function playSoundGameOver() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Generate low noise synth explosion
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.6);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.6);
  } catch (e) {
    // Fail silently
  }
}

// Play victory chime string
export function playSoundVictory() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major chords
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gainNode.gain.setValueAtTime(0.0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + idx * 0.1 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.45);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.5);
    });
  } catch (e) {
    // Fail silently
  }
}
