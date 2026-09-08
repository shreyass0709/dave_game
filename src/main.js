/**
 * Main Game Entry Point
 * Orchestrates game initialization, delta-time game loop, HUD rendering, and debug views.
 */

import { GameMap, TILE_SIZE } from './map.js';
import { Player } from './player.js';
import { PhysicsEngine } from './physics.js';
import { InputHandler } from './input.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Ensure pixel crispness (no blur/anti-aliasing for retro pixels)
    this.ctx.imageSmoothingEnabled = false;

    this.map = new GameMap();
    // Start player at Col 2, Row 12
    this.player = new Player(32, 192);
    this.physics = new PhysicsEngine(this.map);
    this.input = new InputHandler();

    this.showDebug = false;
    this.lastTime = 0;
    this.fps = 60;
    this.fpsTimer = 0;
    this.frameCount = 0;

    // College Mini-Project HUD info (Dave Inspired)
    this.score = 0;
    this.level = 1;
    this.lives = 3;

    // Start loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  /**
   * Main game loop with delta-time calculation
   */
  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Clamp delta time to avoid large physics steps on lag or tab blur
    if (dt > 0.05) dt = 0.05;

    // FPS calculation
    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop);
  }

  /**
   * Update game logic and physics
   */
  update(dt) {
    if (this.input.wasDebugToggled()) {
      this.showDebug = !this.showDebug;
    }

    this.player.handleInput(this.input, dt);
    this.physics.update(this.player, dt);
    this.player.updateAnimation(dt);

    this.input.clearFrame();
  }

  /**
   * Render all visual layers
   */
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Clear Screen with retro backdrop
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    // 2. Render Tile Map
    this.map.render(ctx);

    // 3. Render Player Character
    this.player.render(ctx);

    // 4. Render Retro Top HUD Bar (Dave inspired)
    this.renderHUD(ctx);

    // 5. Render Debug Overlay (if active)
    if (this.showDebug) {
      this.renderDebug(ctx);
    }
  }

  /**
   * Authentic retro top status bar (Score, Level, Lives)
   */
  renderHUD(ctx) {
    // Top banner background
    ctx.fillStyle = '#0000aa';
    ctx.fillRect(0, 0, this.canvas.width, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';

    // SCORE
    ctx.fillText(`SCORE: ${String(this.score).padStart(5, '0')}`, 8, 8);

    // LEVEL
    ctx.fillText(`LEVEL: ${String(this.level).padStart(2, '0')}`, 160, 8);

    // DAVES / LIVES
    ctx.fillText(`DAVES: ${this.lives}`, 290, 8);

    // Bottom border line of HUD
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 15, this.canvas.width, 1);
  }

  /**
   * Diagnostic debug overlay for viva explanation & physics verification
   */
  renderDebug(ctx) {
    // Draw player hitbox
    this.player.renderDebug(ctx);

    // Draw telemetry overlay in bottom left
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(4, 20, 160, 68);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 20, 160, 68);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';

    ctx.fillText(`DEBUG TELEMETRY`, 8, 24);
    ctx.fillText(`X: ${this.player.x.toFixed(1)}  Y: ${this.player.y.toFixed(1)}`, 8, 34);
    ctx.fillText(`VX: ${this.player.vx.toFixed(1)} VY: ${this.player.vy.toFixed(1)}`, 8, 44);
    ctx.fillText(`GROUNDED: ${this.player.isGrounded ? 'YES' : 'NO'}`, 8, 54);
    ctx.fillText(`FPS: ${this.fps}`, 8, 64);
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
