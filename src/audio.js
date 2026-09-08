/**
 * Procedural Web Audio Retro Sound & Music Synthesizer
 * Generates authentic 8-bit chiptune sound effects and background themes in real time.
 * Zero external audio assets required. Safe in headless environments.
 */

export class SoundSystem {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicTimer = null;
    this.musicStep = 0;
    this.isPlayingMusic = false;
    this.soundFXEnabled = true;
    this.musicEnabled = true;
  }

  /**
   * Lazy initializes Web Audio Context upon user interaction
   */
  initContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    }

    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.soundFXEnabled ? 0.22 : 0, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.12 : 0, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);

        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  // =========================================================================
  // SOUND EFFECTS
  // =========================================================================

  /**
   * Jump upward frequency sweep
   */
  playJump() {
    if (!this.soundFXEnabled) return;
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  /**
   * Plasma blaster bolt sound
   */
  playShoot() {
    if (!this.soundFXEnabled) return;
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  /**
   * Collectible gemstone / coin pickup chime
   */
  playPickup(isGem = false) {
    if (!this.soundFXEnabled) return;
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = isGem ? 659.25 : 523.25;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.setValueAtTime(baseFreq * 1.5, now + 0.06);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  /**
   * Enemy stomped / blasted impact
   */
  playExplosion() {
    if (!this.soundFXEnabled) return;
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {}
  }

  /**
   * Player damage / hit feedback
   */
  playDamage() {
    if (!this.soundFXEnabled) return;
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.22);

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {}
  }

  /**
   * Checkpoint activation fanfare
   */
  playCheckpoint() {
    if (!this.soundFXEnabled) return;
    if (!this.initContext() || !this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);
      });
    } catch (e) {}
  }

  /**
   * Golden Trophy fanfare
   */
  playTrophy() {
    if (!this.soundFXEnabled) return;
    if (!this.initContext() || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.1;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + (idx === 3 ? 0.4 : 0.18));

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + (idx === 3 ? 0.45 : 0.2));
      });
    } catch (e) {}
  }

  /**
   * Subtle pause toggle chime
   */
  playPause() {
    if (!this.soundFXEnabled) return;
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.1);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  /**
   * Subtle resume toggle chime
   */
  playResume() {
    if (!this.soundFXEnabled) return;
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.1);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  /**
   * Game Over defeat chord
   */
  playGameOver() {
    if (!this.soundFXEnabled) return;
    if (!this.initContext() || !this.ctx) return;
    try {
      const notes = [196.00, 155.56, 123.47]; // G3 -> D#3 -> B2
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.14;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + 0.3);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.38);
      });
    } catch (e) {}
  }

  // =========================================================================
  // BACKGROUND CHIPTUNE MUSIC
  // =========================================================================

  /**
   * Starts procedural 8-bit chiptune loop
   */
  startMusic() {
    if (this.isPlayingMusic || !this.musicEnabled) return;
    if (!this.initContext() || !this.ctx) return;

    this.isPlayingMusic = true;
    const melody = [
      261.63, 0, 329.63, 0, 392.00, 0, 523.25, 392.00,
      329.63, 0, 261.63, 0, 293.66, 0, 349.23, 0
    ];

    const playBeat = () => {
      if (!this.isPlayingMusic || !this.ctx || !this.musicEnabled) return;
      try {
        const freq = melody[this.musicStep % melody.length];
        this.musicStep++;

        if (freq > 0) {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.16);

          osc.connect(gain);
          gain.connect(this.musicGain);

          osc.start(now);
          osc.stop(now + 0.18);
        }
      } catch (e) {}
    };

    if (typeof setInterval !== 'undefined') {
      this.musicTimer = setInterval(playBeat, 220);
    }
  }

  /**
   * Stops background chiptune music
   */
  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  /**
   * Toggle Sound Effects on/off
   */
  setSoundFX(enabled) {
    this.soundFXEnabled = enabled;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enabled ? 0.22 : 0, this.ctx.currentTime);
    }
  }

  /**
   * Toggle Music on/off
   */
  setMusic(enabled) {
    this.musicEnabled = enabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(enabled ? 0.12 : 0, this.ctx.currentTime);
    }
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }
}
