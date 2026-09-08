/**
 * Main Game Entry Point
 * Orchestrates Level 1 gameplay, smooth camera tracking, HUD, collectibles, and exit events.
 */

import { GameMap, TILE_SIZE } from './map.js';
import { Player, PlayerState, Direction } from './player.js';
import { PhysicsEngine } from './physics.js';
import { InputHandler } from './input.js';
import { Camera } from './camera.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Ensure pixel crispness (no blur/anti-aliasing)
    this.ctx.imageSmoothingEnabled = false;

    this.map = new GameMap();
    // Start player at Col 2, Row 12 (32, 192)
    this.player = new Player(32, 192);
    this.physics = new PhysicsEngine(this.map);
    this.input = new InputHandler();
    this.camera = new Camera(this.canvas.width, this.canvas.height);

    this.showDebug = false;
    this.lastTime = 0;
    this.fps = 60;
    this.fpsTimer = 0;
    this.frameCount = 0;

    // HUD and Game State
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.levelComplete = false;
    this.messageBanner = "GO THRU THE DOOR!";
    this.messageTimer = 0;

    // Start game loop
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

    // Clamp delta time to avoid large physics steps
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
   * Update game logic, player, physics, camera, and level interactions
   */
  update(dt) {
    if (this.input.wasDebugToggled()) {
      this.showDebug = !this.showDebug;
    }

    if (this.input.wasDeathTestPressed()) {
      this.player.die();
    }

    // Update Player & Physics
    this.player.handleInput(this.input, dt);
    const events = this.physics.update(this.player, dt);
    this.player.updateAnimation(dt);

    // Process Interaction Events
    if (events.collectedItems && events.collectedItems.length > 0) {
      for (const item of events.collectedItems) {
        this.score += item.score;
        if (item.type === 'TROPHY') {
          this.showMessage("TROPHY COLLECTED! GO TO EXIT!", 4);
        }
      }
    }

    if (events.hitHazard) {
      this.showMessage("OUCH! WATCH OUT FOR HAZARDS!", 2.5);
    }

    if (events.reachedExit) {
      if (this.map.hasTrophy) {
        this.levelComplete = true;
        this.showMessage("LEVEL 1 COMPLETE! EXCELLENT!", 10);
      } else {
        this.showMessage("GO FIND THE GOLDEN TROPHY FIRST!", 2);
      }
    }

    // Update Message Banner Timer
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
    }

    // Update Camera position smoothly
    const mapPixelWidth = this.map.cols * TILE_SIZE;
    this.camera.update(this.player, mapPixelWidth, dt);

    this.input.clearFrame();
  }

  showMessage(text, duration = 3) {
    this.messageBanner = text;
    this.messageTimer = duration;
  }

  /**
   * Render all game layers: World (Camera space) and HUD (Screen space)
   */
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Clear Screen with dark retro backdrop
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    // 2. Render World Objects in Camera Coordinates
    ctx.save();
    const cameraOffset = this.camera.getRenderOffset();
    ctx.translate(-cameraOffset.x, -cameraOffset.y);

    // Tile Map
    this.map.render(ctx, this.camera);

    // Player
    this.player.render(ctx);

    if (this.showDebug) {
      this.player.renderDebug(ctx);
    }

    ctx.restore();

    // 3. Render Screen-Space Retro HUD Bar
    this.renderHUD(ctx);

    // 4. Render Center Message / Objective Banner
    this.renderMessageBanner(ctx);

    // 5. Render Debug Overlay (if active)
    if (this.showDebug) {
      this.renderDebug(ctx);
    }
  }

  /**
   * Retro top status banner (Score, Level, Trophy Status, Lives)
   */
  renderHUD(ctx) {
    // Top banner background
    ctx.fillStyle = '#0000aa';
    ctx.fillRect(0, 0, this.canvas.width, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';

    // SCORE
    ctx.fillText(`SCORE:${String(this.score).padStart(5, '0')}`, 6, 8);

    // LEVEL
    ctx.fillText(`LVL:${String(this.level).padStart(2, '0')}`, 140, 8);

    // TROPHY STATUS (Key item indicator)
    if (this.map.hasTrophy) {
      ctx.fillStyle = '#facc15';
      ctx.fillText(`TROPHY:YES`, 220, 8);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`TROPHY:NO`, 220, 8);
    }

    // LIVES
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`DAVES:${this.lives}`, 330, 8);

    // Bottom border line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 15, this.canvas.width, 1);
  }

  /**
   * Objective message banner (Dave style bottom alert bar)
   */
  renderMessageBanner(ctx) {
    if (this.messageTimer > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, this.canvas.height - 18, this.canvas.width, 18);

      ctx.strokeStyle = this.levelComplete ? '#22c55e' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, this.canvas.height - 18, this.canvas.width, 18);

      ctx.fillStyle = this.levelComplete ? '#86efac' : '#fef08a';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.messageBanner, this.canvas.width / 2, this.canvas.height - 9);
      ctx.textAlign = 'start'; // Reset
    }
  }

  /**
   * Live diagnostics telemetry overlay
   */
  renderDebug(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(4, 20, 190, 82);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 20, 190, 82);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';

    ctx.fillText(`DEBUG TELEMETRY`, 8, 24);
    ctx.fillText(`STATE: ${this.player.state}`, 8, 34);
    ctx.fillText(`FACING: ${this.player.facing === Direction.RIGHT ? 'RIGHT' : 'LEFT'}`, 8, 44);
    ctx.fillText(`POS: ${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)}  CAM: ${this.camera.x.toFixed(0)}`, 8, 54);
    ctx.fillText(`VEL: ${this.player.vx.toFixed(1)}, ${this.player.vy.toFixed(1)}`, 8, 64);
    ctx.fillText(`TROPHY: ${this.map.hasTrophy ? 'COLLECTED' : 'NONE'} | FPS:${this.fps}`, 8, 74);
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
