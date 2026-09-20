/**
 * LIFELANE Audio Synthesizer
 * Original, non-infringing emergency alert sound engine utilizing Web Audio API.
 * Designed for in-cabin Connected Vehicle (V2X) and Traffic Operations HUD.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastAlertPlayedAt: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Original Emergency In-Cabin Warning Audio
   * Rapid, crisp dual-frequency alert burst designed for high clarity in noisy cockpits.
   */
  public playEmergencyAlert(throttled = true) {
    if (this.isMuted) return;
    const now = Date.now();
    if (throttled && now - this.lastAlertPlayedAt < 2200) {
      return; // Avoid audio stutter
    }
    this.lastAlertPlayedAt = now;

    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime + 0.02;

      // Pulse 1: 780 Hz -> 520 Hz quick downward chime
      // Pulse 2: 880 Hz -> 587 Hz urgent confirmation
      const frequencies = [784, 988, 784, 1046];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const stepStart = startTime + idx * 0.12;
        const stepDuration = 0.09;

        osc.type = 'triangle'; // Clean, soft-edged harmonic
        osc.frequency.setValueAtTime(freq, stepStart);

        gain.gain.setValueAtTime(0.001, stepStart);
        gain.gain.exponentialRampToValueAtTime(0.25, stepStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, stepStart + stepDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(stepStart);
        osc.stop(stepStart + stepDuration + 0.05);
      });
    } catch {
      // AudioContext blocked or not allowed yet
    }
  }

  /**
   * Subtle advance warning chime (Yellow / Orange zone notification)
   */
  public playWarningChime() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastAlertPlayedAt < 1500) return;
    this.lastAlertPlayedAt = now;

    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime + 0.02;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, startTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, startTime + 0.15); // A5

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    } catch {
      // AudioContext blocked
    }
  }

  /**
   * Positive chime when vehicle clears lane or ambulance safely reaches destination
   */
  public playSuccessChime() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime + 0.02;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = startTime + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch {
      // ignore
    }
  }
}

export const soundEffects = new SoundService();
