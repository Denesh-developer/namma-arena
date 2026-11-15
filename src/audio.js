// Synthesized Web Audio API sound generator for Ooru Fire
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Helper: white noise buffer
  createNoiseBuffer(duration = 0.5) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // GUNSHOTS
  playGunshot(type) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    switch (type) {
      case 'desert_eagle': {
        // Heavy Pistol
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);

        // Noise crack
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.12);
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(t);
        break;
      }

      case 'm1887': {
        // Double Barrel Shotgun - Massive Boom
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.3);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.9, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(t);
        break;
      }

      case 'mp40': {
        // Fast Rapid SMG
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }

      case 'ak47': {
        // Heavy Assault Rifle
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.22);

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.18);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        noise.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(t);
        break;
      }

      case 'awm': {
        // Thunderous Sniper
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.55);

        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.55);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.55);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.45);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.9, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(t);
        break;
      }

      default:
        this.playGunshot('desert_eagle');
    }
  }

  // GLOO WALL DEPLOY SOUND
  playGlooWall() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Whoosh up
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);

    // Crystalline ice clang
    const clang = this.ctx.createOscillator();
    const clangGain = this.ctx.createGain();
    clang.type = 'triangle';
    clang.frequency.setValueAtTime(1400, t + 0.08);
    clang.frequency.exponentialRampToValueAtTime(300, t + 0.35);
    clangGain.gain.setValueAtTime(0.6, t + 0.08);
    clangGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    clang.connect(clangGain);
    clangGain.connect(this.ctx.destination);
    clang.start(t + 0.08);
    clang.stop(t + 0.35);
  }

  // HIT SOUND (Body)
  playHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.setValueAtTime(1200, t + 0.03);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // HEADSHOT SOUND (Free Fire crisp ding)
  playHeadshot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // RELOAD SOUND
  playReload() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [0, 0.25].forEach(delay => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, t + delay);
      osc.frequency.exponentialRampToValueAtTime(200, t + delay + 0.08);
      gain.gain.setValueAtTime(0.3, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.08);
    });
  }

  // MEDKIT HEAL
  playMedkit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [300, 450, 600, 750].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      gain.gain.setValueAtTime(0.3, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.15);
    });
  }

  // ROUND START
  playRoundStart() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Whistle / Chime
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.setValueAtTime(659.25, t + 0.12); // E5
    osc.frequency.setValueAtTime(783.99, t + 0.24); // G5
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // ROUND VICTORY
  playRoundWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);
      gain.gain.setValueAtTime(0.4, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.3);
    });
  }

  // BOOYAH! (Match Win Fanfare)
  playBooyah() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    const times = [0, 0.15, 0.3, 0.45, 0.7, 0.9];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + times[i]);
      gain.gain.setValueAtTime(0.5, t + times[i]);
      gain.gain.exponentialRampToValueAtTime(0.01, t + times[i] + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + times[i]);
      osc.stop(t + times[i] + 0.4);
    });
  }

  // DEFEAT SOUND
  playDefeat() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [300, 260, 220, 180].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + i * 0.2);
      gain.gain.setValueAtTime(0.4, t + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.2 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.2);
      osc.stop(t + i * 0.2 + 0.35);
    });
  }

  // UI BUTTON CLICK
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }
}

export const sound = new SoundManager();
