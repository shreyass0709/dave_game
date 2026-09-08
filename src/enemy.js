/**
 * Enemy Entity Class (Retro Mech-Crawler)
 * Features patrol AI, solid wall bouncing, platform ledge detection,
 * animated retro pixel sprite, player damage, and jump-stomp defeat state.
 */

import { Direction } from './player.js';

export const EnemyState = {
  PATROL: 'PATROL',
  DEAD: 'DEAD'
};

export class Enemy {
  constructor(x, y, patrolDistance = 0) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.width = 14;
    this.height = 12;

    // Movement & AI
    this.speed = 45; // Fair, readable patrol velocity
    this.vx = -this.speed; // Start moving left by default
    this.facing = Direction.LEFT;
    this.state = EnemyState.PATROL;
    this.gravity = 640;
    this.vy = 0;
    this.isGrounded = false;

    // Optional patrol distance limit (0 = patrol entire platform)
    this.patrolDistance = patrolDistance;
    this.minX = patrolDistance > 0 ? x - patrolDistance : 0;
    this.maxX = patrolDistance > 0 ? x + patrolDistance : 9999;

    // Animation & Defeat
    this.animTimer = 0;
    this.animFrame = 0;
    this.deathTimer = 0;
    this.deathDuration = 0.5; // Half second squash before removal
    this.isRemoved = false;
  }

  /**
   * Update enemy patrol AI, platform edge detection, and physics
   */
  update(map, dt) {
    if (this.state === EnemyState.DEAD) {
      this.deathTimer += dt;
      if (this.deathTimer >= this.deathDuration) {
        this.isRemoved = true;
      }
      return;
    }

    const s = map.tileSize;

    // 1. Horizontal Movement & Solid Wall Collisions
    this.x += this.vx * dt;

    let minCol = Math.floor(this.x / s);
    let maxCol = Math.floor((this.x + this.width - 0.001) / s);
    let minRow = Math.floor(this.y / s);
    let maxRow = Math.floor((this.y + this.height - 0.001) / s);

    // Wall Collision Check & Reversal
    if (this.vx > 0) {
      for (let r = minRow; r <= maxRow; r++) {
        if (map.isSolid(maxCol, r)) {
          this.x = maxCol * s - this.width;
          this.reverseDirection();
          break;
        }
      }
    } else if (this.vx < 0) {
      for (let r = minRow; r <= maxRow; r++) {
        if (map.isSolid(minCol, r)) {
          this.x = (minCol + 1) * s;
          this.reverseDirection();
          break;
        }
      }
    }

    // 2. Vertical Movement & Platform Landing
    this.vy = Math.min(this.vy + this.gravity * dt, 380);
    this.y += this.vy * dt;

    minCol = Math.floor(this.x / s);
    maxCol = Math.floor((this.x + this.width - 0.001) / s);
    minRow = Math.floor(this.y / s);
    maxRow = Math.floor((this.y + this.height - 0.001) / s);

    if (this.vy > 0) {
      for (let c = minCol; c <= maxCol; c++) {
        if (map.isSolid(c, maxRow)) {
          this.y = maxRow * s - this.height;
          this.vy = 0;
          this.isGrounded = true;
          break;
        }
      }
    }

    // 3. Platform Ledge Detection (Turn around before walking off platform)
    if (this.isGrounded) {
      const footRow = Math.floor((this.y + this.height + 2) / s);
      if (this.vx > 0) {
        const aheadCol = Math.floor((this.x + this.width + 2) / s);
        if (!map.isSolid(aheadCol, footRow)) {
          this.reverseDirection();
        }
      } else if (this.vx < 0) {
        const aheadCol = Math.floor((this.x - 2) / s);
        if (!map.isSolid(aheadCol, footRow)) {
          this.reverseDirection();
        }
      }
    }

    // 4. Patrol Distance & Boundary Limit Enforcement
    if (this.x <= this.minX && this.vx < 0) {
      this.x = this.minX;
      this.reverseDirection();
    } else if (this.x + this.width >= this.maxX && this.vx > 0) {
      this.x = this.maxX - this.width;
      this.reverseDirection();
    }

    // 5. Animation Timer
    this.animTimer += dt;
    if (this.animTimer >= 0.12) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  reverseDirection() {
    this.vx = -this.vx;
    this.facing = this.vx > 0 ? Direction.RIGHT : Direction.LEFT;
  }

  /**
   * Defeat enemy (triggered by jumping on top)
   */
  defeat() {
    if (this.state === EnemyState.DEAD) return;
    this.state = EnemyState.DEAD;
    this.vx = 0;
    this.vy = 0;
    this.deathTimer = 0;
  }

  /**
   * Check collision against player
   * @param {Player} player 
   * @returns {'NONE' | 'STOMP' | 'DAMAGE'}
   */
  checkPlayerCollision(player) {
    if (this.state === EnemyState.DEAD || player.state === 'DEAD') {
      return 'NONE';
    }

    // AABB Overlap check
    const overlapX = player.x < this.x + this.width && player.x + player.width > this.x;
    const overlapY = player.y < this.y + this.height && player.y + player.height > this.y;

    if (!overlapX || !overlapY) {
      return 'NONE';
    }

    // Check if player landed on top of enemy (Stomp Defeat)
    // Player's feet must be near top of enemy and moving downwards
    const playerBottom = player.y + player.height;
    const enemyTop = this.y;

    if (player.vy > 0 && playerBottom <= enemyTop + 6) {
      return 'STOMP';
    }

    return 'DAMAGE';
  }

  /**
   * Render enemy in retro pixel art style
   */
  render(ctx) {
    if (this.isRemoved) return;

    ctx.save();
    const px = Math.round(this.x);
    const py = Math.round(this.y);
    const centerX = px + this.width / 2;
    const centerY = py + this.height / 2;

    if (this.state === EnemyState.DEAD) {
      this.drawDefeatedSprite(ctx, px, py);
      ctx.restore();
      return;
    }

    // Horizontal flip based on facing direction
    if (this.facing === Direction.LEFT) {
      ctx.translate(centerX, centerY);
      ctx.scale(-1, 1);
      ctx.translate(-centerX, -centerY);
    }

    this.drawEnemySprite(ctx, px, py);
    ctx.restore();
  }

  /**
   * Retro Cyber-Crawler Sprite (Distinct emerald green & neon purple)
   */
  drawEnemySprite(ctx, x, y) {
    // 1. Armored Emerald Carapace (Base)
    ctx.fillStyle = '#047857'; // Deep Emerald Green
    ctx.fillRect(x + 2, y + 2, 10, 6);

    // 2. Metallic Carapace Ridge & Top Highlight
    ctx.fillStyle = '#10b981'; // Emerald Bright
    ctx.fillRect(x + 3, y + 1, 8, 2);
    ctx.fillStyle = '#6ee7b7'; // White-green shine
    ctx.fillRect(x + 4, y + 1, 3, 1);

    // 3. Inner Mech Energy Core (Pulsing Neon Violet)
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(x + 4, y + 4, 5, 3);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(x + 5, y + 5, 2, 1);

    // 4. Scanning Robotic Eye (Pulsing / Moving)
    const scanOffset = Math.sin(this.animTimer * 6) > 0 ? 1 : 0;
    ctx.fillStyle = '#1e1b4b'; // Eye Socket
    ctx.fillRect(x + 8, y + 2, 4, 3);
    ctx.fillStyle = '#ef4444'; // Red Scanner Laser
    ctx.fillRect(x + 8 + scanOffset, y + 3, 2, 2);
    ctx.fillStyle = '#fecaca'; // Glint
    ctx.fillRect(x + 9 + scanOffset, y + 3, 1, 1);

    // 5. 4-Frame Animated Mechanical Claws / Legs
    ctx.fillStyle = '#064e3b'; // Dark Emerald Steel Legs
    const legFrame = Math.floor(this.animTimer * 10) % 4;

    if (legFrame === 0) {
      ctx.fillRect(x + 1, y + 8, 3, 4);
      ctx.fillRect(x + 6, y + 8, 2, 4);
      ctx.fillRect(x + 10, y + 8, 3, 4);
    } else if (legFrame === 1) {
      ctx.fillRect(x + 0, y + 8, 3, 4);
      ctx.fillRect(x + 5, y + 8, 3, 4);
      ctx.fillRect(x + 11, y + 8, 2, 4);
    } else if (legFrame === 2) {
      ctx.fillRect(x + 1, y + 8, 2, 4);
      ctx.fillRect(x + 5, y + 8, 3, 4);
      ctx.fillRect(x + 10, y + 8, 3, 4);
    } else {
      ctx.fillRect(x + 2, y + 8, 2, 4);
      ctx.fillRect(x + 6, y + 8, 3, 4);
      ctx.fillRect(x + 9, y + 8, 3, 4);
    }
  }

  /**
   * Defeated / Flattened Sprite with spark burst
   */
  drawDefeatedSprite(ctx, x, y) {
    const progress = Math.min(1, this.deathTimer / this.deathDuration);
    const alpha = Math.max(0, 1 - progress);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Squashed green shell
    ctx.fillStyle = '#047857';
    ctx.fillRect(x + 0, y + 9, 14, 3);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x + 2, y + 8, 10, 2);

    // Poof spark burst
    ctx.fillStyle = '#fbbf24'; // Gold sparks
    ctx.fillRect(x + 1, y + 3, 2, 2);
    ctx.fillRect(x + 11, y + 3, 2, 2);
    ctx.fillRect(x + 6, y + 1, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 3, y + 5, 2, 2);
    ctx.fillRect(x + 9, y + 5, 2, 2);

    ctx.restore();
  }

  renderDebug(ctx) {
    ctx.strokeStyle = this.state === EnemyState.DEAD ? '#64748b' : '#a855f7';
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(this.x) + 0.5, Math.round(this.y) + 0.5, this.width - 1, this.height - 1);
  }
}
