/**
 * Visual Effects & Particle System
 * Manages floating score indicators, sparkle bursts, dust puffs,
 * blaster explosions, screen shakes, and damage flashes.
 */

export class EffectManager {
  constructor() {
    this.effects = [];
    this.shakeTimer = 0;
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.flashTimer = 0;
    this.flashDuration = 0;
    this.flashColor = 'rgba(239, 68, 68, 0.4)';
  }

  /**
   * Spawns floating score text and theme sparkle burst
   */
  addScorePopup(x, y, score, color = '#facc15', label = '') {
    const text = label ? `+${score} ${label}` : `+${score}`;
    this.effects.push({
      type: 'TEXT',
      x: x + 4,
      y: y - 2,
      text: text,
      color: color,
      timer: 0,
      duration: 0.85,
      vy: -35
    });

    const particleColors = [color, '#ffffff', '#fef08a'];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + (Math.random() * 0.4 - 0.2);
      const speed = 25 + Math.random() * 25;
      this.effects.push({
        type: 'SPARKLE',
        x: x + 8,
        y: y + 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: particleColors[i % particleColors.length],
        timer: 0,
        duration: 0.45 + Math.random() * 0.2,
        size: 2
      });
    }
  }

  /**
   * Spawns landing or jump dust puff particles
   */
  addDustPuff(x, y) {
    for (let i = 0; i < 4; i++) {
      const vx = (Math.random() - 0.5) * 30;
      const vy = -Math.random() * 15;
      this.effects.push({
        type: 'DUST',
        x: x + 6 + (Math.random() * 4 - 2),
        y: y + 15,
        vx: vx,
        vy: vy,
        color: '#94a3b8',
        timer: 0,
        duration: 0.3,
        size: Math.random() > 0.5 ? 2 : 1
      });
    }
  }

  /**
   * Spawns multi-particle enemy blast explosion and smoke
   */
  addExplosion(x, y, color = '#38bdf8') {
    // 8 Spark particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
      const speed = 35 + Math.random() * 35;
      this.effects.push({
        type: 'SPARKLE',
        x: x + 8,
        y: y + 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? color : '#ffffff',
        timer: 0,
        duration: 0.5,
        size: 2
      });
    }

    // 4 Smoke particles
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 10 + Math.random() * 15;
      this.effects.push({
        type: 'SMOKE',
        x: x + 8,
        y: y + 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 10,
        color: '#64748b',
        timer: 0,
        duration: 0.4,
        size: 3
      });
    }

    this.addScreenShake(3, 0.15);
  }

  /**
   * Spawns cyan muzzle flash on blaster shot
   */
  addMuzzleFlash(x, y, direction = 1) {
    this.effects.push({
      type: 'MUZZLE',
      x: direction === 1 ? x + 12 : x - 4,
      y: y + 7,
      color: '#06b6d4',
      timer: 0,
      duration: 0.08,
      size: 4
    });
  }

  /**
   * Spawns small cyan sparks when a projectile hits a solid wall
   */
  addWallImpact(x, y, direction = 1) {
    for (let i = 0; i < 4; i++) {
      const angle = (direction > 0 ? Math.PI : 0) + (Math.random() - 0.5) * 1.2;
      const speed = 20 + Math.random() * 30;
      this.effects.push({
        type: 'SPARKLE',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? '#38bdf8' : '#ffffff',
        timer: 0,
        duration: 0.25,
        size: 1
      });
    }
  }

  /**
   * Spawns celebratory victory confetti shower
   */
  addVictoryConfetti(x, y) {
    const colors = ['#facc15', '#38bdf8', '#4ade80', '#ec4899', '#f43f5e', '#a855f7'];
    for (let i = 0; i < 15; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = 50 + Math.random() * 70;
      this.effects.push({
        type: 'CONFETTI',
        x: x + (Math.random() * 20 - 10),
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[i % colors.length],
        timer: 0,
        duration: 0.8 + Math.random() * 0.4,
        size: 2 + Math.floor(Math.random() * 2)
      });
    }
  }

  /**
   * Triggers micro screen shake
   */
  addScreenShake(intensity = 3, duration = 0.2) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  /**
   * Triggers damage flash vignette
   */
  addDamageFlash(color = 'rgba(239, 68, 68, 0.35)', duration = 0.2) {
    this.flashColor = color;
    this.flashDuration = duration;
    this.flashTimer = duration;
    this.addScreenShake(4, 0.2);
  }

  /**
   * Get current screen shake camera offset
   */
  getShakeOffset() {
    if (this.shakeTimer > 0) {
      const progress = this.shakeTimer / this.shakeDuration;
      const currentIntensity = this.shakeIntensity * progress;
      return {
        x: (Math.random() - 0.5) * 2 * currentIntensity,
        y: (Math.random() - 0.5) * 2 * currentIntensity
      };
    }
    return { x: 0, y: 0 };
  }

  /**
   * Update active effect animations and cull expired effects
   */
  update(dt) {
    if (this.shakeTimer > 0) this.shakeTimer -= dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;

    for (let i = this.effects.length - 1; i >= 0; i--) {
      const fx = this.effects[i];
      fx.timer += dt;

      if (fx.type === 'TEXT') {
        fx.y += fx.vy * dt;
      } else if (fx.type === 'SPARKLE' || fx.type === 'CONFETTI') {
        fx.x += fx.vx * dt;
        fx.y += fx.vy * dt;
        fx.vy += 80 * dt; // Gravity
      } else if (fx.type === 'DUST') {
        fx.x += fx.vx * dt;
        fx.y += fx.vy * dt;
      } else if (fx.type === 'SMOKE') {
        fx.x += fx.vx * dt;
        fx.y += fx.vy * dt;
        fx.size += 2 * dt;
      }

      if (fx.timer >= fx.duration) {
        this.effects.splice(i, 1);
      }
    }
  }

  /**
   * Render all visual effects in world camera coordinates
   */
  render(ctx) {
    for (const fx of this.effects) {
      const progress = fx.timer / fx.duration;
      const alpha = Math.max(0, 1 - progress);

      ctx.save();
      ctx.globalAlpha = alpha;

      if (fx.type === 'TEXT') {
        ctx.fillStyle = fx.color;
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.strokeStyle = '#050508';
        ctx.lineWidth = 2;
        ctx.strokeText(fx.text, Math.round(fx.x), Math.round(fx.y));
        ctx.fillText(fx.text, Math.round(fx.x), Math.round(fx.y));
      } else if (fx.type === 'SPARKLE' || fx.type === 'CONFETTI' || fx.type === 'DUST') {
        ctx.fillStyle = fx.color;
        const px = Math.round(fx.x);
        const py = Math.round(fx.y);
        ctx.fillRect(px, py, fx.size, fx.size);
      } else if (fx.type === 'SMOKE') {
        ctx.fillStyle = fx.color;
        const s = Math.round(fx.size);
        ctx.fillRect(Math.round(fx.x - s / 2), Math.round(fx.y - s / 2), s, s);
      } else if (fx.type === 'MUZZLE') {
        ctx.fillStyle = fx.color;
        ctx.fillRect(Math.round(fx.x), Math.round(fx.y), fx.size, fx.size);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(fx.x + 1), Math.round(fx.y + 1), 2, 2);
      }

      ctx.restore();
    }
  }

  /**
   * Render screen-space damage flash overlay
   */
  renderScreenFlash(ctx, width, height) {
    if (this.flashTimer > 0) {
      const alpha = (this.flashTimer / this.flashDuration) * 0.4;
      ctx.save();
      ctx.fillStyle = this.flashColor;
      ctx.globalAlpha = alpha;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  clear() {
    this.effects = [];
    this.shakeTimer = 0;
    this.flashTimer = 0;
  }
}
