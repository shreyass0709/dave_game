/**
 * Physics & Collision Engine
 * Implements axis-separated AABB collision detection against tile maps,
 * hazard triggers, collectible pickups, exit door checks,
 * projectile-enemy impacts, and player-enemy combat.
 */

import { PlayerState } from './player.js';

export class PhysicsEngine {
  constructor(gameMap) {
    this.map = gameMap;
  }

  /**
   * Updates player physics, applies gravity, moves player, and resolves all collisions and triggers
   * @param {Player} player 
   * @param {number} dt Delta time in seconds
   * @param {Array<Enemy>} enemies List of active enemy entities
   * @param {Array<Projectile>} projectiles List of active projectiles
   * @returns {Object} Frame interaction events (collectedItems, hitHazard, reachedExit, stompedEnemies, shotEnemies, hitEnemy)
   */
  update(player, dt, enemies = [], projectiles = []) {
    const events = {
      collectedItems: [],
      hitHazard: false,
      reachedExit: false,
      stompedEnemies: [],
      shotEnemies: [],
      hitEnemy: false
    };

    // 1. If Dead, apply free-fall gravity for death animation without tile collision
    if (player.state === PlayerState.DEAD) {
      player.y += player.vy * dt;
      player.vy = Math.min(player.vy + player.gravity * dt, player.terminalVelocity);
      return events;
    }

    const tileSize = this.map.tileSize;

    // 2. Resolve Horizontal Movement & Solid Collisions
    player.x += player.vx * dt;

    let minCol = Math.floor(player.x / tileSize);
    let maxCol = Math.floor((player.x + player.width - 0.001) / tileSize);
    let minRow = Math.floor(player.y / tileSize);
    let maxRow = Math.floor((player.y + player.height - 0.001) / tileSize);

    if (player.vx > 0) {
      // Moving right -> check rightmost tiles
      for (let r = minRow; r <= maxRow; r++) {
        if (this.map.isSolid(maxCol, r)) {
          player.x = maxCol * tileSize - player.width;
          player.vx = 0;
          break;
        }
      }
    } else if (player.vx < 0) {
      // Moving left -> check leftmost tiles
      for (let r = minRow; r <= maxRow; r++) {
        if (this.map.isSolid(minCol, r)) {
          player.x = (minCol + 1) * tileSize;
          player.vx = 0;
          break;
        }
      }
    }

    // 3. Apply Gravity & Resolve Vertical Movement & Solid Collisions
    player.vy = Math.min(player.vy + player.gravity * dt, player.terminalVelocity);
    player.y += player.vy * dt;

    // Recalculate tile bounds after vertical position update
    minCol = Math.floor(player.x / tileSize);
    maxCol = Math.floor((player.x + player.width - 0.001) / tileSize);
    minRow = Math.floor(player.y / tileSize);
    maxRow = Math.floor((player.y + player.height - 0.001) / tileSize);

    let landed = false;

    if (player.vy > 0) {
      // Falling / moving down -> check bottommost tiles
      for (let c = minCol; c <= maxCol; c++) {
        if (this.map.isSolid(c, maxRow)) {
          player.y = maxRow * tileSize - player.height;
          player.vy = 0;
          landed = true;
          break;
        }
      }
      player.isGrounded = landed;
    } else if (player.vy < 0) {
      // Moving up (jumping) -> check topmost tiles (bonk ceiling)
      player.isGrounded = false;
      for (let c = minCol; c <= maxCol; c++) {
        if (this.map.isSolid(c, minRow)) {
          player.y = (minRow + 1) * tileSize;
          player.vy = 0;
          break;
        }
      }
    } else {
      // vy == 0: Verify if player is still supported by solid ground beneath feet
      const footRow = Math.floor((player.y + player.height + 0.1) / tileSize);
      let groundUnderfoot = false;
      for (let c = minCol; c <= maxCol; c++) {
        if (this.map.isSolid(c, footRow)) {
          groundUnderfoot = true;
          break;
        }
      }
      player.isGrounded = groundUnderfoot;
    }

    // 4. Screen / Map Boundary Enforcements (Alive state only)
    const maxX = this.map.cols * tileSize - player.width;
    const maxY = this.map.rows * tileSize - player.height;

    if (player.x < 0) {
      player.x = 0;
      player.vx = 0;
    } else if (player.x > maxX) {
      player.x = maxX;
      player.vx = 0;
    }

    if (player.y < 0) {
      player.y = 0;
      player.vy = 0;
    } else if (player.y > maxY) {
      player.y = maxY;
      player.vy = 0;
      player.isGrounded = true;
    }

    // 5. Trigger Queries (Hazards, Collectibles, Exit Portal)
    minCol = Math.floor(player.x / tileSize);
    maxCol = Math.floor((player.x + player.width - 0.001) / tileSize);
    minRow = Math.floor(player.y / tileSize);
    maxRow = Math.floor((player.y + player.height - 0.001) / tileSize);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        // A. Hazard Check
        if (this.map.isHazard(c, r)) {
          player.die();
          events.hitHazard = true;
          return events;
        }

        // B. Collectible Check
        const item = this.map.collectTile(c, r);
        if (item) {
          events.collectedItems.push(item);
        }

        // C. Exit Portal Check
        if (this.map.isExit(c, r)) {
          events.reachedExit = true;
        }
      }
    }

    // 6. Projectile-Enemy Collisions
    if (projectiles && projectiles.length > 0 && enemies && enemies.length > 0) {
      for (const proj of projectiles) {
        if (proj.isRemoved) continue;
        for (const enemy of enemies) {
          if (enemy.isRemoved || enemy.state === 'DEAD') continue;
          if (proj.checkEnemyCollision(enemy)) {
            enemy.defeat();
            events.shotEnemies.push(enemy);
            break;
          }
        }
      }
    }

    // 7. Player-Enemy Combat & Stomp Interactions
    if (enemies && enemies.length > 0) {
      for (const enemy of enemies) {
        if (enemy.isRemoved) continue;

        const interaction = enemy.checkPlayerCollision(player);
        if (interaction === 'STOMP') {
          enemy.defeat();
          player.vy = -190;
          player.isGrounded = false;
          events.stompedEnemies.push(enemy);
        } else if (interaction === 'DAMAGE') {
          player.die();
          events.hitEnemy = true;
          return events;
        }
      }
    }

    return events;
  }
}
