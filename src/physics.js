/**
 * Physics & Collision Engine
 * Implements axis-separated AABB collision detection against tile maps
 */

export class PhysicsEngine {
  constructor(gameMap) {
    this.map = gameMap;
  }

  /**
   * Updates player physics, applies gravity, moves player, and resolves all collisions
   * @param {Player} player 
   * @param {number} dt Delta time in seconds
   */
  update(player, dt) {
    const tileSize = this.map.tileSize;

    // 1. Resolve Horizontal Movement & Collisions
    player.x += player.vx * dt;

    // Calculate tile bounding range for player's current position
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

    // 2. Apply Gravity & Resolve Vertical Movement & Collisions
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

    // 3. Screen Boundary Enforcements
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
  }
}
