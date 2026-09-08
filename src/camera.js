/**
 * Camera / Viewport System
 * Smooth horizontal side-scrolling camera with clamping and subpixel jitter prevention
 */

export class Camera {
  constructor(viewportWidth = 400, viewportHeight = 240) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;

    // Camera smoothing factor (0.1 = smooth lerp, 1.0 = instant lock)
    this.smoothSpeed = 0.12;
    this.lookAheadDistance = 24; // Forward visibility lead in player's facing direction
  }

  /**
   * Follows player smoothly within map boundaries with directional lookahead
   * @param {Player} player 
   * @param {number} mapWidth Total width of the map in pixels
   * @param {number} dt Delta time
   */
  update(player, mapWidth, dt) {
    // Target position centers the player horizontally with directional lead
    const playerCenterX = player.x + player.width / 2;
    const leadOffset = player.facing === 1 ? this.lookAheadDistance : -this.lookAheadDistance;
    this.targetX = playerCenterX - this.viewportWidth / 2 + leadOffset;

    // Smooth linear interpolation (lerp) towards target
    this.x += (this.targetX - this.x) * Math.min(1, this.smoothSpeed * (dt * 60));

    // Clamp camera within map boundaries
    const maxCameraX = Math.max(0, mapWidth - this.viewportWidth);
    if (this.x < 0) this.x = 0;
    if (this.x > maxCameraX) this.x = maxCameraX;
  }

  /**
   * Reset camera position instantly (e.g. on respawn)
   */
  snapTo(player, mapWidth) {
    const playerCenterX = player.x + player.width / 2;
    const leadOffset = player.facing === 1 ? this.lookAheadDistance : -this.lookAheadDistance;
    this.targetX = playerCenterX - this.viewportWidth / 2 + leadOffset;
    this.x = this.targetX;
    const maxCameraX = Math.max(0, mapWidth - this.viewportWidth);
    if (this.x < 0) this.x = 0;
    if (this.x > maxCameraX) this.x = maxCameraX;
  }

  /**
   * Returns rounded integer offset to eliminate subpixel shimmering
   */
  getRenderOffset() {
    return {
      x: Math.round(this.x),
      y: Math.round(this.y)
    };
  }
}
