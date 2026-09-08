/**
 * Visual Effects & Particle System
 * Manages floating score indicators and sparkle particle bursts upon collecting items
 */

export class EffectManager {
  constructor() {
    this.effects = [];
  }

  /**
   * Spawns a floating score popup and sparkle burst at world coordinates
   * @param {number} x World X coordinate
   * @param {number} y World Y coordinate
   * @param {number} score Score amount (e.g. 100, 200, 300, 1000)
   * @param {string} color Primary theme color
   */
  addScorePopup(x, y, score, color = '#facc15') {
    // Floating score text entity
    this.effects.push({
      type: 'TEXT',
      x: x + 4,
      y: y - 2,
      text: `+${score}`,
      color: color,
      timer: 0,
      duration: 0.8, // 800ms
      vy: -35 // Float upward speed
    });

    // Sparkle star particles (4-6 tiny burst particles)
    const particleColors = [color, '#ffffff', '#fef08a'];
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 + (Math.random() * 0.4 - 0.2);
      const speed = 25 + Math.random() * 20;
      this.effects.push({
        type: 'SPARKLE',
        x: x + 8,
        y: y + 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: particleColors[i % particleColors.length],
        timer: 0,
        duration: 0.4 + Math.random() * 0.2,
        size: 2
      });
    }
  }

  /**
   * Update active effect animations and cull expired effects
   */
  update(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const fx = this.effects[i];
      fx.timer += dt;

      if (fx.type === 'TEXT') {
        fx.y += fx.vy * dt;
      } else if (fx.type === 'SPARKLE') {
        fx.x += fx.vx * dt;
        fx.y += fx.vy * dt;
        fx.vy += 60 * dt; // Slight gravity on sparkles
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
        // Dark text outline for clarity
        ctx.strokeStyle = '#050508';
        ctx.lineWidth = 2;
        ctx.strokeText(fx.text, Math.round(fx.x), Math.round(fx.y));
        ctx.fillText(fx.text, Math.round(fx.x), Math.round(fx.y));
      } else if (fx.type === 'SPARKLE') {
        ctx.fillStyle = fx.color;
        const px = Math.round(fx.x);
        const py = Math.round(fx.y);
        ctx.fillRect(px, py, fx.size, fx.size);
      }

      ctx.restore();
    }
  }

  clear() {
    this.effects = [];
  }
}
