/**
 * Main Game Entry Point
 * Orchestrates multi-level progression (Levels 1, 2, 3), camera tracking, HUD,
 * collectibles, scoring, particle effects, shooting mechanics, enemy AI, and Grand Victory.
 */

import { GameMap, TILE_SIZE } from './map.js';
import { Player, PlayerState, Direction } from './player.js';
import { PhysicsEngine } from './physics.js';
import { InputHandler } from './input.js';
import { Camera } from './camera.js';
import { Enemy } from './enemy.js';
import { EffectManager } from './effects.js';

export const GameState = {
  PLAYING: 'PLAYING',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_VICTORY: 'GAME_VICTORY'
};

export class Game {
  constructor(canvasElement = null) {
    if (typeof document !== 'undefined') {
      this.canvas = canvasElement || document.getElementById('gameCanvas');
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      if (this.ctx) this.ctx.imageSmoothingEnabled = false;
      this.input = new InputHandler();
      this.camera = new Camera(this.canvas.width, this.canvas.height);
    } else {
      this.canvas = { width: 400, height: 240 };
      this.ctx = null;
      this.input = null;
      this.camera = new Camera(400, 240);
    }

    this.effects = new EffectManager();
    this.showDebug = false;
    this.lastTime = 0;
    this.fps = 60;
    this.fpsTimer = 0;
    this.frameCount = 0;

    // Persistent Game State & Multi-Level Management
    this.score = 0;
    this.currentLevel = 1;
    this.maxLevels = 3;
    this.lives = 3;
    this.gameState = GameState.PLAYING;
    this.messageBanner = "LEVEL 1: FIND TROPHY & GO TO EXIT!";
    this.messageTimer = 4;

    this.loadLevel(1);

    // Start game loop in browser environment
    if (typeof window !== 'undefined') {
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }
  }

  /**
   * Loads a specific level and resets entities cleanly
   */
  loadLevel(levelNumber) {
    this.currentLevel = levelNumber;
    this.map = new GameMap(levelNumber);

    if (!this.player) {
      this.player = new Player(this.map.playerSpawn.x, this.map.playerSpawn.y);
    } else {
      this.player.spawnX = this.map.playerSpawn.x;
      this.player.spawnY = this.map.playerSpawn.y;
      this.player.respawn(this.map.playerSpawn.x, this.map.playerSpawn.y);
    }

    this.physics = new PhysicsEngine(this.map);
    this.projectiles = [];
    this.enemies = this.map.getEnemySpawns().map(spawn => new Enemy(spawn.x, spawn.y));
    this.effects.clear();
    this.camera.snapTo(this.player, this.map.cols * TILE_SIZE);
    this.gameState = GameState.PLAYING;
    this.messageBanner = `LEVEL ${levelNumber}: FIND TROPHY & GO TO EXIT!`;
    this.messageTimer = 3.5;
  }

  restartGame() {
    this.score = 0;
    this.loadLevel(1);
  }

  /**
   * Main game loop with delta-time calculation
   */
  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    if (dt > 0.05) dt = 0.05;

    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    this.update(dt);
    this.render();

    if (typeof window !== 'undefined') {
      requestAnimationFrame(this.loop);
    }
  }

  /**
   * Update game logic, player, projectiles, enemies, effects, physics, and level transitions
   */
  update(dt) {
    if (this.input && this.input.wasDebugToggled()) {
      this.showDebug = !this.showDebug;
    }

    // 1. Handle LEVEL_COMPLETE state (Advance to next level)
    if (this.gameState === GameState.LEVEL_COMPLETE) {
      if (this.input && this.input.wasRestartJustPressed()) {
        if (this.currentLevel < this.maxLevels) {
          this.loadLevel(this.currentLevel + 1);
        } else {
          this.gameState = GameState.GAME_VICTORY;
        }
      }
      if (this.input) this.input.clearFrame();
      return;
    }

    // 2. Handle GAME_VICTORY state (Replay from Level 1)
    if (this.gameState === GameState.GAME_VICTORY) {
      if (this.input && this.input.wasRestartJustPressed()) {
        this.restartGame();
      }
      if (this.input) this.input.clearFrame();
      return;
    }

    if (this.input && this.input.wasDeathTestPressed()) {
      this.player.die();
    }

    // 3. Update Visual Particle & Score Effects
    this.effects.update(dt);

    // 4. Update Enemies
    for (const enemy of this.enemies) {
      enemy.update(this.map, dt);
    }
    this.enemies = this.enemies.filter(e => !e.isRemoved);

    // 5. Handle Player Input & Shooting
    if (this.input) {
      const newProjectile = this.player.handleInput(this.input, dt);
      if (newProjectile && this.projectiles.length < 8) {
        this.projectiles.push(newProjectile);
      }
    }

    // 6. Update Projectiles
    for (const proj of this.projectiles) {
      proj.update(this.map, dt);
    }

    // 7. Update Physics & Process Collisions
    const events = this.physics.update(this.player, dt, this.enemies, this.projectiles);
    this.player.updateAnimation(dt);

    // Filter out destroyed projectiles
    this.projectiles = this.projectiles.filter(p => !p.isRemoved);

    // 8. Process Collectibles & Score Popups
    if (events.collectedItems && events.collectedItems.length > 0) {
      for (const item of events.collectedItems) {
        this.score += item.score;
        this.effects.addScorePopup(item.x, item.y, item.score, item.color);

        if (item.type === 'TROPHY') {
          this.showMessage("TROPHY COLLECTED! EXIT IS OPEN!", 4);
        }
      }
    }

    // Stomp & Shooting Combat Rewards
    if (events.stompedEnemies && events.stompedEnemies.length > 0) {
      for (const enemy of events.stompedEnemies) {
        this.score += 200;
        this.effects.addScorePopup(enemy.x, enemy.y, 200, '#34d399');
      }
      this.showMessage("ENEMY STOMPED! +200", 2.0);
    }
    if (events.shotEnemies && events.shotEnemies.length > 0) {
      for (const enemy of events.shotEnemies) {
        this.score += 200;
        this.effects.addScorePopup(enemy.x, enemy.y, 200, '#38bdf8');
      }
      this.showMessage("ENEMY BLASTED! +200", 2.0);
    }

    if (events.hitEnemy) {
      this.showMessage("HIT BY ENEMY! OUCH!", 2.5);
    }

    if (events.hitHazard) {
      this.showMessage("OUCH! WATCH OUT FOR HAZARDS!", 2.5);
    }

    // 9. Process Level Completion Flow
    if (events.reachedExit) {
      if (this.map.hasTrophy) {
        this.player.vx = 0;
        this.player.vy = 0;
        this.projectiles = [];

        if (this.currentLevel < this.maxLevels) {
          this.score += 500; // Level completion bonus
          this.gameState = GameState.LEVEL_COMPLETE;
        } else {
          this.score += 2000; // Grand campaign victory bonus
          this.gameState = GameState.GAME_VICTORY;
        }
      } else {
        this.showMessage("FIND THE GOLDEN TROPHY TO OPEN EXIT!", 2.5);
      }
    }

    // Update Message Banner Timer
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
    }

    // Update Camera position smoothly
    const mapPixelWidth = this.map.cols * TILE_SIZE;
    this.camera.update(this.player, mapPixelWidth, dt);

    if (this.input) this.input.clearFrame();
  }

  showMessage(text, duration = 3) {
    this.messageBanner = text;
    this.messageTimer = duration;
  }

  /**
   * Render all game layers: World (Camera space) and HUD (Screen space)
   */
  render() {
    if (!this.ctx) return;
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

    // Tile Map & Collectibles
    this.map.render(ctx, this.camera);

    // Floating Score Effects & Sparkles
    this.effects.render(ctx);

    // Projectiles
    for (const proj of this.projectiles) {
      proj.render(ctx);
      if (this.showDebug) {
        proj.renderDebug(ctx);
      }
    }

    // Enemies
    for (const enemy of this.enemies) {
      enemy.render(ctx);
      if (this.showDebug) {
        enemy.renderDebug(ctx);
      }
    }

    // Player
    this.player.render(ctx);

    if (this.showDebug) {
      this.player.renderDebug(ctx);
    }

    ctx.restore();

    // 3. Render Screen-Space Retro HUD Bar
    this.renderHUD(ctx);

    // 4. Render Center Message Banner
    if (this.gameState === GameState.PLAYING) {
      this.renderMessageBanner(ctx);
    }

    // 5. Render Modals (LEVEL COMPLETE or GAME VICTORY)
    if (this.gameState === GameState.LEVEL_COMPLETE) {
      this.renderLevelCompleteModal(ctx);
    } else if (this.gameState === GameState.GAME_VICTORY) {
      this.renderVictoryModal(ctx);
    }

    // 6. Render Debug Overlay
    if (this.showDebug) {
      this.renderDebug(ctx);
    }
  }

  /**
   * Retro top status banner (Score, Level, Trophy Status, Lives)
   */
  renderHUD(ctx) {
    ctx.fillStyle = '#0000aa';
    ctx.fillRect(0, 0, this.canvas.width, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';

    // SCORE
    ctx.fillText(`SCORE:${String(this.score).padStart(5, '0')}`, 6, 8);

    // LEVEL
    ctx.fillText(`LVL:${String(this.currentLevel).padStart(2, '0')}`, 140, 8);

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

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, this.canvas.height - 18, this.canvas.width, 18);

      ctx.fillStyle = '#fef08a';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.messageBanner, this.canvas.width / 2, this.canvas.height - 9);
      ctx.textAlign = 'start';
    }
  }

  /**
   * LEVEL COMPLETE modal between levels
   */
  renderLevelCompleteModal(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, w, h);

    const boxW = 300;
    const boxH = 115;
    const boxX = (w - boxW) / 2;
    const boxY = (h - boxH) / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#4ade80';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`*** LEVEL ${this.currentLevel} COMPLETE! ***`, w / 2, boxY + 28);

    ctx.fillStyle = '#facc15';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`SCORE: ${this.score} (+500 BONUS)`, w / 2, boxY + 54);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText(`PRESS [ENTER] TO ENTER LEVEL ${this.currentLevel + 1}`, w / 2, boxY + 86);

    ctx.textAlign = 'start';
  }

  /**
   * GRAND VICTORY modal after Level 3
   */
  renderVictoryModal(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, w, h);

    const boxW = 320;
    const boxH = 125;
    const boxX = (w - boxW) / 2;
    const boxY = (h - boxH) / 2;

    ctx.fillStyle = '#1e1b4b'; // Deep Indigo Victory box
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = '#fbbf24'; // Gold Border
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#facc15';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('*** YOU WIN! ***', w / 2, boxY + 28);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('ALL 3 LEVELS CONQUERED!', w / 2, boxY + 50);

    ctx.fillStyle = '#4ade80';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`FINAL SCORE: ${this.score}`, w / 2, boxY + 72);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('PRESS [SPACE] OR [ENTER] TO REPLAY', w / 2, boxY + 98);

    ctx.textAlign = 'start';
  }

  /**
   * Live diagnostics telemetry overlay
   */
  renderDebug(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(4, 20, 205, 108);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 20, 205, 108);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';

    ctx.fillText(`DEBUG TELEMETRY`, 8, 24);
    ctx.fillText(`STATE: ${this.gameState} (LVL ${this.currentLevel})`, 8, 34);
    ctx.fillText(`PLAYER: ${this.player.state} (${this.player.facing === Direction.RIGHT ? 'RIGHT' : 'LEFT'})`, 8, 44);
    ctx.fillText(`POS: ${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)}  CAM: ${this.camera.x.toFixed(0)}`, 8, 54);
    ctx.fillText(`VEL: ${this.player.vx.toFixed(1)}, ${this.player.vy.toFixed(1)}`, 8, 64);
    ctx.fillText(`SHOTS: ${this.projectiles.length} | ENEMIES: ${this.enemies.length}`, 8, 74);
    ctx.fillText(`TROPHY: ${this.map.hasTrophy ? 'YES' : 'NO'} | SCORE: ${this.score}`, 8, 84);
    ctx.fillText(`FPS: ${this.fps}`, 8, 94);
  }
}

// Initialize on browser DOM load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    new Game();
  });
}
