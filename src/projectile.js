/**
 * Projectile Entity Class (Retro Blaster Plasma Bolt)
 * Handles high-speed projectile motion, solid obstacle impacts,
 * enemy collision checks, and retro glowing visual rendering.
 */

import { Direction } from './player.js';

export class Projectile {
  constructor(x, y, direction = Direction.RIGHT) {
    this.x = x;
    this.y = y;
    this.width = 8;
    this.height = 3;
    this.direction = direction;
    this.speed = 280; // Fast and snappy projectile velocity (px/sec)
    this.vx = this.direction * this.speed;
    this.isRemoved = false;
    this.animTimer = 0;
  }

  /**
   * Update projectile position, tile collision, and boundary culling
   * @param {GameMap} map 
   * @param {number} dt Delta time in seconds
   */
  update(map, dt) {
    if (this.isRemoved) return;

    this.x += this.vx * dt;
    this.animTimer += dt;

    const mapPixelWidth = map.cols * map.tileSize;
    const mapPixelHeight = map.rows * map.tileSize;

    // 1. Playable Area Boundaries Check
    if (this.x < 0 || this.x + this.width > mapPixelWidth || this.y < 0 || this.y > mapPixelHeight) {
      this.isRemoved = true;
      return;
    }

    // 2. Solid Map Collision Check (Wall impact)
    const checkX = this.direction > 0 ? this.x + this.width : this.x;
    const checkY = this.y + this.height / 2;
    const col = Math.floor(checkX / map.tileSize);
    const row = Math.floor(checkY / map.tileSize);

    if (map.isSolid(col, row)) {
      this.isRemoved = true;
      this.hitWall = true;
      this.wallHitPos = { x: checkX, y: checkY };
    }
  }

  /**
   * Checks collision with enemy entity
   * @param {Enemy} enemy 
   * @returns {boolean} True if collided
   */
  checkEnemyCollision(enemy) {
    if (this.isRemoved || enemy.state === 'DEAD' || enemy.isRemoved) {
      return false;
    }

    const overlapX = this.x < enemy.x + enemy.width && this.x + this.width > enemy.x;
    const overlapY = this.y < enemy.y + enemy.height && this.y + this.height > enemy.y;

    if (overlapX && overlapY) {
      this.isRemoved = true;
      return true;
    }

    return false;
  }

  /**
   * Render glowing retro plasma blaster bolt
   */
  render(ctx) {
    if (this.isRemoved) return;

    ctx.save();
    const px = Math.round(this.x);
    const py = Math.round(this.y);

    // Glowing cyan/yellow energy halo
    ctx.fillStyle = '#06b6d4'; // Cyan outer glow
    ctx.fillRect(px - 1, py - 1, this.width + 2, this.height + 2);

    // Bright plasma core
    ctx.fillStyle = '#fef08a'; // Bright yellow core
    ctx.fillRect(px, py, this.width, this.height);

    // Hot white center line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + (this.direction > 0 ? 2 : 0), py + 1, this.width - 2, 1);

    // Trailing sparks
    const sparkX = this.direction > 0 ? px - 3 : px + this.width + 1;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(sparkX, py + 1, 2, 1);

    ctx.restore();
  }

  renderDebug(ctx) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(this.x) + 0.5, Math.round(this.y) + 0.5, this.width - 1, this.height - 1);
  }
}
