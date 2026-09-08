/**
 * Main Game Entry Point
 * Orchestrates multi-level progression (Levels 1, 2, 3), camera tracking, HUD,
 * collectibles, scoring, particle effects, shooting mechanics, enemy AI,
 * complete retro UI system (Main Menu, HUD, Pause, Game Over, Level Complete, Final Victory, Instructions, Settings),
 * and dual Keyboard + Mouse navigation.
 */

import { GameMap, TILE_SIZE } from './map.js';
import { Player, PlayerState, Direction } from './player.js';
import { PhysicsEngine } from './physics.js';
import { InputHandler } from './input.js';
import { Camera } from './camera.js';
import { Enemy } from './enemy.js';
import { EffectManager } from './effects.js';
import { UIManager, UIButton } from './ui.js';

export const GameState = {
  MAIN_MENU: 'MAIN_MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  FINAL_VICTORY: 'FINAL_VICTORY',
  INSTRUCTIONS: 'INSTRUCTIONS',
  SETTINGS: 'SETTINGS',
  QUIT: 'QUIT'
};

export class Game {
  constructor(canvasElement = null) {
    if (typeof document !== 'undefined') {
      this.canvas = canvasElement || document.getElementById('gameCanvas');
      this.ctx = this.canvas && this.canvas.getContext ? this.canvas.getContext('2d') : null;
      if (this.ctx) this.ctx.imageSmoothingEnabled = false;
      this.input = new InputHandler(this.canvas);
      const canvasW = this.canvas && this.canvas.width ? this.canvas.width : 400;
      const canvasH = this.canvas && this.canvas.height ? this.canvas.height : 240;
      this.camera = new Camera(canvasW, canvasH);
    } else {
      this.canvas = { width: 400, height: 240 };
      this.ctx = null;
      this.input = null;
      this.camera = new Camera(400, 240);
    }

    this.effects = new EffectManager();
    this.ui = new UIManager();
    this.showDebug = false;
    this.lastTime = 0;
    this.fps = 60;
    this.fpsTimer = 0;
    this.frameCount = 0;

    // Persistent Game State & Multi-Level Management
    this.score = 0;
    this.levelStartScore = 0;
    this.currentLevel = 1;
    this.maxLevels = 3;
    this.lives = 3;
    this.activeCheckpoint = null;
    this.gameState = GameState.MAIN_MENU;
    this.selectedMenuIndex = 0;
    this.messageBanner = "LEVEL 1: FIND TROPHY & GO TO EXIT!";
    this.messageTimer = 0;

    this.initButtons();
    this.loadLevel(1);
    this.updateCRTClass();

    // Start game loop in browser environment
    if (typeof window !== 'undefined') {
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }
  }

  /**
   * Synchronizes CRT scanlines CSS class with settings
   */
  updateCRTClass() {
    if (typeof document !== 'undefined') {
      const screenFrame = document.querySelector('.screen-frame');
      if (screenFrame) {
        if (this.ui.settings.crtFilter) {
          screenFrame.classList.add('crt-active');
          screenFrame.classList.remove('crt-off');
        } else {
          screenFrame.classList.remove('crt-active');
          screenFrame.classList.add('crt-off');
        }
      }
    }
  }

  /**
   * Initializes all UI buttons for all interactive screens
   */
  initButtons() {
    this.menuButtons = {
      [GameState.MAIN_MENU]: [
        new UIButton({ id: 'play', label: 'PLAY', x: 130, y: 92, width: 140, height: 20, color: '#38bdf8' }),
        new UIButton({ id: 'instructions', label: 'INSTRUCTIONS', x: 130, y: 118, width: 140, height: 20, color: '#38bdf8' }),
        new UIButton({ id: 'settings', label: 'SETTINGS', x: 130, y: 144, width: 140, height: 20, color: '#38bdf8' }),
        new UIButton({ id: 'quit', label: 'QUIT', x: 130, y: 170, width: 140, height: 20, color: '#ef4444' })
      ],
      [GameState.PAUSED]: [
        new UIButton({ id: 'resume', label: 'RESUME', x: 130, y: 80, width: 140, height: 20, color: '#38bdf8' }),
        new UIButton({ id: 'restart_level', label: 'RESTART LEVEL', x: 130, y: 106, width: 140, height: 20, color: '#facc15' }),
        new UIButton({ id: 'main_menu', label: 'MAIN MENU', x: 130, y: 132, width: 140, height: 20, color: '#ef4444' })
      ],
      [GameState.GAME_OVER]: [
        new UIButton({ id: 'restart_game', label: 'RESTART', x: 130, y: 96, width: 140, height: 20, color: '#22c55e' }),
        new UIButton({ id: 'main_menu', label: 'MAIN MENU', x: 130, y: 124, width: 140, height: 20, color: '#ef4444' })
      ],
      [GameState.LEVEL_COMPLETE]: [
        new UIButton({ id: 'next_level', label: 'NEXT LEVEL', x: 130, y: 100, width: 140, height: 20, color: '#22c55e' }),
        new UIButton({ id: 'main_menu', label: 'MAIN MENU', x: 130, y: 128, width: 140, height: 20, color: '#ef4444' })
      ],
      [GameState.FINAL_VICTORY]: [
        new UIButton({ id: 'play_again', label: 'PLAY AGAIN', x: 130, y: 102, width: 140, height: 20, color: '#facc15' }),
        new UIButton({ id: 'main_menu', label: 'MAIN MENU', x: 130, y: 130, width: 140, height: 20, color: '#ef4444' })
      ],
      [GameState.INSTRUCTIONS]: [
        new UIButton({ id: 'back_main', label: 'BACK', x: 130, y: 184, width: 140, height: 20, color: '#38bdf8' })
      ],
      [GameState.SETTINGS]: [
        new UIButton({ id: 'toggle_sfx', label: 'TOGGLE SOUND', x: 130, y: 102, width: 140, height: 18, color: '#a855f7' }),
        new UIButton({ id: 'toggle_music', label: 'TOGGLE MUSIC', x: 130, y: 126, width: 140, height: 18, color: '#a855f7' }),
        new UIButton({ id: 'toggle_crt', label: 'TOGGLE CRT', x: 130, y: 150, width: 140, height: 18, color: '#a855f7' }),
        new UIButton({ id: 'back_main', label: 'BACK', x: 130, y: 174, width: 140, height: 18, color: '#38bdf8' })
      ],
      [GameState.QUIT]: [
        new UIButton({ id: 'return_title', label: 'RETURN TO TITLE', x: 120, y: 130, width: 160, height: 22, color: '#38bdf8' })
      ]
    };
  }

  /**
   * Loads a specific level and resets entities cleanly
   */
  loadLevel(levelNumber) {
    this.currentLevel = levelNumber;
    this.map = new GameMap(levelNumber);
    this.screenFadeAlpha = 1.0; // Trigger smooth fade transition
    this.activeCheckpoint = { x: this.map.playerSpawn.x, y: this.map.playerSpawn.y };

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
    this.messageBanner = `LEVEL ${levelNumber}: FIND TROPHY & GO TO EXIT!`;
    this.messageTimer = 3.5;
  }

  restartGame() {
    this.score = 0;
    this.lives = 3;
    this.loadLevel(1);
    this.gameState = GameState.PLAYING;
    this.screenFadeAlpha = 1.0;
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
   * Handles UI menu navigation (Keyboard & Mouse)
   */
  handleMenuNavigation(buttons) {
    if (!this.input || !buttons || buttons.length === 0) return;

    const isKeyUp = this.input.wasMenuUp();
    const isKeyDown = this.input.wasMenuDown();
    const isEnterPressed = this.input.wasMenuSelect();
    const isMouseClick = this.input.wasMouseClicked();
    const mousePos = this.input.getMousePos();

    // 1. Keyboard Navigation
    if (isKeyUp) {
      this.selectedMenuIndex = (this.selectedMenuIndex - 1 + buttons.length) % buttons.length;
    } else if (isKeyDown) {
      this.selectedMenuIndex = (this.selectedMenuIndex + 1) % buttons.length;
    } else if (isMouseClick && mousePos.x >= 0 && mousePos.y >= 0) {
      // 2. Mouse Click Selection
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].contains(mousePos.x, mousePos.y)) {
          this.selectedMenuIndex = i;
          break;
        }
      }
    }

    // 3. Trigger Action
    let triggeredButton = null;
    if (isEnterPressed) {
      triggeredButton = buttons[this.selectedMenuIndex];
    } else if (isMouseClick && mousePos.x >= 0 && mousePos.y >= 0) {
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].contains(mousePos.x, mousePos.y)) {
          triggeredButton = buttons[i];
          break;
        }
      }
    }

    if (triggeredButton) {
      this.executeButtonAction(triggeredButton.id);
    }
  }

  /**
   * Executes UI button commands
   */
  executeButtonAction(actionId) {
    switch (actionId) {
      case 'play':
        this.restartGame();
        this.gameState = GameState.PLAYING;
        break;
      case 'instructions':
        this.gameState = GameState.INSTRUCTIONS;
        this.selectedMenuIndex = 0;
        break;
      case 'settings':
        this.gameState = GameState.SETTINGS;
        this.selectedMenuIndex = 0;
        break;
      case 'quit':
        this.gameState = GameState.QUIT;
        this.selectedMenuIndex = 0;
        break;
      case 'resume':
        this.gameState = GameState.PLAYING;
        break;
      case 'restart_level':
        this.score = this.levelStartScore;
        this.loadLevel(this.currentLevel);
        this.gameState = GameState.PLAYING;
        break;
      case 'restart_game':
      case 'play_again':
        this.restartGame();
        break;
      case 'next_level':
        if (this.currentLevel < this.maxLevels) {
          this.loadLevel(this.currentLevel + 1);
          this.levelStartScore = this.score;
          this.gameState = GameState.PLAYING;
        } else {
          this.gameState = GameState.FINAL_VICTORY;
          this.selectedMenuIndex = 0;
        }
        break;
      case 'main_menu':
      case 'back_main':
      case 'return_title':
        this.gameState = GameState.MAIN_MENU;
        this.selectedMenuIndex = 0;
        break;
      case 'toggle_sfx':
        this.ui.settings.soundFX = !this.ui.settings.soundFX;
        break;
      case 'toggle_music':
        this.ui.settings.music = !this.ui.settings.music;
        break;
      case 'toggle_crt':
        this.ui.settings.crtFilter = !this.ui.settings.crtFilter;
        this.updateCRTClass();
        break;
    }
  }

  /**
   * Update game logic, player, projectiles, enemies, effects, physics, and state transitions
   */
  update(dt) {
    this.ui.update(dt);

    if (this.screenFadeAlpha > 0) {
      this.screenFadeAlpha = Math.max(0, this.screenFadeAlpha - 2.5 * dt);
    }

    if (this.input && this.input.wasDebugToggled()) {
      this.showDebug = !this.showDebug;
    }

    // 1. MAIN MENU & MODAL STATES
    if (this.gameState !== GameState.PLAYING) {
      const activeButtons = this.menuButtons[this.gameState] || [];

      // Shortcut ESC to resume if in PAUSED state
      if (this.gameState === GameState.PAUSED && this.input && this.input.wasPauseJustPressed()) {
        this.gameState = GameState.PLAYING;
        if (this.input) this.input.clearFrame();
        return;
      }

      this.handleMenuNavigation(activeButtons);

      if (this.input) this.input.clearFrame();
      return;
    }

    // 2. PLAYING STATE: Check Pause Key (P / ESC)
    if (this.input && this.input.wasPauseJustPressed()) {
      this.gameState = GameState.PAUSED;
      this.selectedMenuIndex = 0;
      if (this.input) this.input.clearFrame();
      return;
    }

    // Debug death test
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
      const wasGroundedBefore = this.player.isGrounded;
      const newProjectile = this.player.handleInput(this.input, dt);

      // Landing / Takeoff dust puff feedback
      if (wasGroundedBefore && !this.player.isGrounded && this.player.vy < -100) {
        this.effects.addDustPuff(this.player.x, this.player.y);
      }

      if (newProjectile && this.projectiles.length < 8) {
        this.projectiles.push(newProjectile);
        this.effects.addMuzzleFlash(this.player.x, this.player.y, this.player.facing);
      }
    }

    // 6. Update Projectiles & Wall Impact Sparks
    for (const proj of this.projectiles) {
      proj.update(this.map, dt);
      if (proj.hitWall && proj.wallHitPos) {
        this.effects.addWallImpact(proj.wallHitPos.x, proj.wallHitPos.y, proj.direction);
      }
    }

    // 7. Track previous death state for life decrement & checkpoint respawn
    const wasDeadBefore = this.player.state === PlayerState.DEAD;

    // Update Physics & Process Collisions
    const events = this.physics.update(this.player, dt, this.enemies, this.projectiles);
    this.player.updateAnimation(dt);

    // Detect respawn event (Transition from DEAD to IDLE)
    if (wasDeadBefore && this.player.state === PlayerState.IDLE) {
      this.lives--;
      if (this.lives <= 0) {
        this.gameState = GameState.GAME_OVER;
        this.selectedMenuIndex = 0;
        if (this.input) this.input.clearFrame();
        return;
      } else {
        const respawnPos = this.activeCheckpoint || this.map.playerSpawn;
        this.player.respawn(respawnPos.x, respawnPos.y);
        this.camera.snapTo(this.player, this.map.cols * TILE_SIZE);
      }
    }

    // Filter out destroyed projectiles
    this.projectiles = this.projectiles.filter(p => !p.isRemoved);

    // 8. Process Collectibles & Score Popups
    if (events.collectedItems && events.collectedItems.length > 0) {
      for (const item of events.collectedItems) {
        this.score += item.score;
        this.effects.addScorePopup(item.x, item.y, item.score, item.color);

        if (item.type === 'TROPHY') {
          this.showMessage("TROPHY COLLECTED! EXIT IS OPEN!", 4);
          this.effects.addVictoryConfetti(item.x, item.y);
        }
      }
    }

    // Checkpoint Activation Feedback
    if (events.activatedCheckpoint) {
      this.activeCheckpoint = { x: events.activatedCheckpoint.x, y: events.activatedCheckpoint.y - 2 };
      this.showMessage("CHECKPOINT ACTIVATED!", 2.5);
      this.effects.addVictoryConfetti(events.activatedCheckpoint.x + 8, events.activatedCheckpoint.y + 4);
    }

    // Stomp & Shooting Combat Rewards
    if (events.stompedEnemies && events.stompedEnemies.length > 0) {
      for (const enemy of events.stompedEnemies) {
        this.score += 200;
        this.effects.addScorePopup(enemy.x, enemy.y, 200, '#34d399');
        this.effects.addExplosion(enemy.x, enemy.y, '#34d399');
      }
      this.showMessage("ENEMY STOMPED! +200", 2.0);
    }
    if (events.shotEnemies && events.shotEnemies.length > 0) {
      for (const enemy of events.shotEnemies) {
        this.score += 200;
        this.effects.addScorePopup(enemy.x, enemy.y, 200, '#38bdf8');
        this.effects.addExplosion(enemy.x, enemy.y, '#38bdf8');
      }
      this.showMessage("ENEMY BLASTED! +200", 2.0);
    }

    if (events.hitEnemy) {
      this.showMessage("HIT BY ENEMY! OUCH!", 2.5);
      this.effects.addDamageFlash('rgba(239, 68, 68, 0.4)', 0.25);
    }

    if (events.hitHazard) {
      this.showMessage("OUCH! WATCH OUT FOR HAZARDS!", 2.5);
      this.effects.addDamageFlash('rgba(239, 68, 68, 0.4)', 0.25);
    }

    // 9. Process Level Completion Flow
    if (events.reachedExit) {
      if (this.map.hasTrophy) {
        this.player.vx = 0;
        this.player.vy = 0;
        this.projectiles = [];
        this.effects.addVictoryConfetti(this.player.x, this.player.y);

        if (this.currentLevel < this.maxLevels) {
          this.score += 500; // Level completion bonus
          this.gameState = GameState.LEVEL_COMPLETE;
          this.selectedMenuIndex = 0;
        } else {
          this.score += 2000; // Grand campaign victory bonus
          this.gameState = GameState.FINAL_VICTORY;
          this.selectedMenuIndex = 0;
        }
      } else {
        if (this.messageBanner !== "FIND THE GOLDEN TROPHY TO OPEN EXIT!" || this.messageTimer <= 0.5) {
          this.showMessage("FIND THE GOLDEN TROPHY TO OPEN EXIT!", 2.5);
        }
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
   * Render all game layers: World, HUD, and UI States
   */
  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Clear Screen
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    // 2. Render Main Menu if active
    if (this.gameState === GameState.MAIN_MENU) {
      this.ui.renderMainMenu(ctx, w, h, this.selectedMenuIndex, this.menuButtons[GameState.MAIN_MENU]);
      this.ui.renderScreenFade(ctx, w, h, this.screenFadeAlpha);
      return;
    }

    if (this.gameState === GameState.INSTRUCTIONS) {
      this.ui.renderInstructions(ctx, w, h, this.selectedMenuIndex, this.menuButtons[GameState.INSTRUCTIONS]);
      return;
    }

    if (this.gameState === GameState.SETTINGS) {
      this.ui.renderSettings(ctx, w, h, this.selectedMenuIndex, this.menuButtons[GameState.SETTINGS]);
      return;
    }

    if (this.gameState === GameState.QUIT) {
      this.ui.renderQuit(ctx, w, h, this.selectedMenuIndex, this.menuButtons[GameState.QUIT]);
      return;
    }

    // 3. Render World Objects in Camera Coordinates with Screen Shake
    ctx.save();
    const cameraOffset = this.camera.getRenderOffset();
    const shakeOffset = this.effects.getShakeOffset();
    ctx.translate(-cameraOffset.x + shakeOffset.x, -cameraOffset.y + shakeOffset.y);

    // Tile Map & Collectibles
    this.map.render(ctx, this.camera);

    // Floating Score Effects & Sparkles
    this.effects.render(ctx);

    // Projectiles
    for (const proj of this.projectiles) {
      proj.render(ctx);
      if (this.showDebug) proj.renderDebug(ctx);
    }

    // Enemies
    for (const enemy of this.enemies) {
      enemy.render(ctx);
      if (this.showDebug) enemy.renderDebug(ctx);
    }

    // Player
    this.player.render(ctx);
    if (this.showDebug) this.player.renderDebug(ctx);

    ctx.restore();

    // 4. Render Screen-Space Retro HUD Bar
    this.ui.renderHUD(ctx, w, h, {
      lives: this.lives,
      score: this.score,
      level: this.currentLevel,
      hasTrophy: this.map.hasTrophy
    });

    // 5. Render Damage Flash Overlay
    this.effects.renderScreenFlash(ctx, w, h);

    // 6. Render Center Message Toast in Playing State
    if (this.gameState === GameState.PLAYING && this.messageTimer > 0) {
      this.renderMessageBanner(ctx);
    }

    // 7. Render Overlaid Menus
    if (this.gameState === GameState.PAUSED) {
      this.ui.renderPauseMenu(ctx, w, h, this.selectedMenuIndex, this.menuButtons[GameState.PAUSED]);
    } else if (this.gameState === GameState.GAME_OVER) {
      this.ui.renderGameOver(ctx, w, h, this.selectedMenuIndex, this.menuButtons[GameState.GAME_OVER], this.score);
    } else if (this.gameState === GameState.LEVEL_COMPLETE) {
      this.ui.renderLevelComplete(ctx, w, h, this.selectedMenuIndex, this.menuButtons[GameState.LEVEL_COMPLETE], {
        currentLevel: this.currentLevel,
        score: this.score,
        bonus: 500
      });
    } else if (this.gameState === GameState.FINAL_VICTORY) {
      this.ui.renderFinalVictory(ctx, w, h, this.selectedMenuIndex, this.menuButtons[GameState.FINAL_VICTORY], this.score);
    }

    // 8. Screen Transition Fade Curtain
    this.ui.renderScreenFade(ctx, w, h, this.screenFadeAlpha);

    // 9. Render Debug Overlay
    if (this.showDebug) {
      this.renderDebug(ctx);
    }
  }

  renderMessageBanner(ctx) {
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
