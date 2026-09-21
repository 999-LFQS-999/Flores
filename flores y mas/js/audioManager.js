/**
 * FLORALIA STUDIO - AUDIO & SOUND ENGINE (Web Audio API)
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.currentMusicMode = 'piano'; // piano, lofi, ambient, nature
    this.musicInterval = null;
    this.isPlayingMusic = false;
    this.ambientNodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  /* ---------------- SOUND EFFECTS ---------------- */

  // Soft magical chime for flower blooms and UI interactions
  playChime(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 523.25 * pitchMultiplier; // C5
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.35);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  // Harp/guitar string pluck for Daisy Oracle
  playPluck(freq = 440) {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Wax stamp sound (warm tactile pop)
  playWaxStamp() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Wax crack sound
  playWaxCrack() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    // White noise burst for crackle
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
  }

  // Magical fireworks chord fanfare for surprise unboxing
  playFanfare() {
    if (this.isMuted) return;
    this.init();

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Major arpeggio
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playPluck(f);
        this.playChime(f / 261.63);
      }, i * 110);
    });
  }

  /* ---------------- PROCEDURAL ATMOSPHERIC MUSIC ---------------- */

  startMusic() {
    if (this.isMuted || this.isPlayingMusic) return;
    this.init();
    this.isPlayingMusic = true;

    // Romantic Piano / Celestial Lofi Chord Progressions
    // Progressions: Cmaj7 -> Am7 -> Fmaj7 -> G7
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];

    let chordIndex = 0;

    const playChordStep = () => {
      if (!this.isPlayingMusic || this.isMuted) return;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      // Play soft arpeggio
      currentChord.forEach((note, nIdx) => {
        setTimeout(() => {
          if (!this.isPlayingMusic || this.isMuted) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, now);

          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0005, now + 2.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 2.8);
        }, nIdx * 350);
      });
    };

    playChordStep();
    this.musicInterval = setInterval(playChordStep, 3200);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new AudioManager();
