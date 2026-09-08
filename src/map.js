/**
 * Level & Tile Map System
 * Handles tile definitions, level grid representation, and retro pixel art rendering
 */

export const TILE_SIZE = 16;
export const MAP_COLS = 25;
export const MAP_ROWS = 15;

export const TILE_TYPES = {
  EMPTY: 0,
  RED_BRICK: 1,
  STEEL_BLOCK: 2,
  WOOD_PLATFORM: 3
};

export class GameMap {
  constructor() {
    this.tileSize = TILE_SIZE;
    this.cols = MAP_COLS;
    this.rows = MAP_ROWS;

    // 25 x 15 grid (400 x 240 pixels)
    // 0 = Empty, 1 = Red Brick, 2 = Steel Block, 3 = Wood Platform
    this.grid = [
      // Row 0: Top boundary / HUD base
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      // Row 1: Ceiling
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      // Row 2: High platform
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      // Row 3: Ledge left & high floating block
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      // Row 4
      [2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 2],
      // Row 5
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      // Row 6: Mid-level platforms & stepping stones
      [2, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2],
      // Row 7
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      // Row 8: Low floating platforms
      [2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2],
      // Row 9
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      // Row 10: Stepping blocks
      [2, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      // Row 11: Low obstacles
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      // Row 12: Low steps & ledges
      [2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 2],
      // Row 13: Above ground
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      // Row 14: Solid Ground Floor
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
  }

  /**
   * Check if a specific grid cell is solid
   */
  isSolid(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return true; // Boundaries outside map are solid
    }
    return this.grid[row][col] !== TILE_TYPES.EMPTY;
  }

  /**
   * Get tile type at grid coordinates
   */
  getTile(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return TILE_TYPES.STEEL_BLOCK;
    }
    return this.grid[row][col];
  }

  /**
   * Render the entire tile map using retro pixel styling
   */
  render(ctx) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tileType = this.grid[r][c];
        const x = c * this.tileSize;
        const y = r * this.tileSize;

        if (tileType === TILE_TYPES.RED_BRICK) {
          this.renderRedBrick(ctx, x, y);
        } else if (tileType === TILE_TYPES.STEEL_BLOCK) {
          this.renderSteelBlock(ctx, x, y);
        } else if (tileType === TILE_TYPES.WOOD_PLATFORM) {
          this.renderWoodPlatform(ctx, x, y);
        }
      }
    }
  }

  /**
   * Classic Red Brick tile drawing (Dave inspired EGA brick texture)
   */
  renderRedBrick(ctx, x, y) {
    const s = this.tileSize;
    // Base red color
    ctx.fillStyle = '#b81414';
    ctx.fillRect(x, y, s, s);

    // Top brick highlight
    ctx.fillStyle = '#e54545';
    ctx.fillRect(x, y, s, 2);
    ctx.fillRect(x, y + 8, s, 2);

    // Dark mortar lines
    ctx.fillStyle = '#4a0000';
    ctx.fillRect(x, y + 7, s, 1);
    ctx.fillRect(x, y + 15, s, 1);
    ctx.fillRect(x + 7, y, 1, 7);
    ctx.fillRect(x + 15, y + 8, 1, 7);

    // Subtle 3D bottom shadow
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(x, y + s - 1, s, 1);
  }

  /**
   * Metallic steel block with corner rivets
   */
  renderSteelBlock(ctx, x, y) {
    const s = this.tileSize;
    // Outer border
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x, y, s, s);

    // Inner plate
    ctx.fillStyle = '#374151';
    ctx.fillRect(x + 1, y + 1, s - 2, s - 2);

    // Top & Left Highlight
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(x + 1, y + 1, s - 2, 1);
    ctx.fillRect(x + 1, y + 1, 1, s - 2);

    // Bottom & Right Shadow
    ctx.fillStyle = '#111827';
    ctx.fillRect(x + 1, y + s - 2, s - 2, 1);
    ctx.fillRect(x + s - 2, y + 1, 1, s - 2);

    // Corner rivets (4 dots)
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(x + 3, y + 3, 1, 1);
    ctx.fillRect(x + s - 4, y + 3, 1, 1);
    ctx.fillRect(x + 3, y + s - 4, 1, 1);
    ctx.fillRect(x + s - 4, y + s - 4, 1, 1);
  }

  /**
   * Wooden girder/platform
   */
  renderWoodPlatform(ctx, x, y) {
    const s = this.tileSize;
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(x, y + 2, s, 3);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, y + s - 2, s, 2);
  }
}
