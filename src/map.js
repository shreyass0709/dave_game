/**
 * Level & Tile Map System (Level 1 - Dave-Inspired Complete Level)
 * Features solid terrain, hazards, varied collectibles (Coins, Rubies, Sapphires, Trophy),
 * enemy patrol stations, and the level exit portal.
 */

export const TILE_SIZE = 16;
export const MAP_COLS = 70;
export const MAP_ROWS = 15;

export const TILE_TYPES = {
  EMPTY: 0,
  RED_BRICK: 1,
  STEEL_BLOCK: 2,
  WOOD_PLATFORM: 3,
  HAZARD_FIRE: 4,
  HAZARD_SPIKES: 5,
  COLLECTIBLE_COIN: 6,
  COLLECTIBLE_RUBY: 7,
  COLLECTIBLE_SAPPHIRE: 8,
  COLLECTIBLE_TROPHY: 9,
  EXIT_DOOR: 10,
  ENEMY_SPAWN: 11
};

export class GameMap {
  constructor() {
    this.tileSize = TILE_SIZE;
    this.cols = MAP_COLS;
    this.rows = MAP_ROWS;
    this.animTimer = 0;
    this.hasTrophy = false;

    this.initLevel();
  }

  initLevel() {
    // Initialize empty grid (15 rows x 70 cols)
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // 1. Top Ceiling (Row 0) and Boundary Walls (Col 0, Col 69)
    for (let c = 0; c < this.cols; c++) {
      this.grid[0][c] = TILE_TYPES.STEEL_BLOCK;
    }
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.STEEL_BLOCK;
      this.grid[r][this.cols - 1] = TILE_TYPES.STEEL_BLOCK;
    }

    // 2. Base Ground (Row 14) with strategic pits and solid floors
    for (let c = 0; c < this.cols; c++) {
      // Pits at cols 13..14 (Fire Pit), 26..29 (Spike Pit), 48..51 (Lava/Fire Pit)
      if ((c >= 13 && c <= 14) || (c >= 48 && c <= 51)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_FIRE;
      } else if (c >= 26 && c <= 29) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES;
      } else {
        this.grid[14][c] = TILE_TYPES.RED_BRICK;
      }
    }

    // 3. SECTION 1: STARTING AREA & GENTLE HOP (Cols 1..22)
    // Starting platforms & intro collectibles
    this.grid[11][4] = TILE_TYPES.RED_BRICK;
    this.grid[11][5] = TILE_TYPES.RED_BRICK;
    this.grid[11][6] = TILE_TYPES.RED_BRICK;
    this.grid[10][4] = TILE_TYPES.COLLECTIBLE_COIN;     // +100
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_SAPPHIRE; // +300
    this.grid[10][6] = TILE_TYPES.COLLECTIBLE_COIN;     // +100

    // Ground coins
    this.grid[13][8] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][9] = TILE_TYPES.COLLECTIBLE_COIN;

    // Hop across first small fire pit (cols 13..14)
    this.grid[12][11] = TILE_TYPES.RED_BRICK;
    this.grid[12][12] = TILE_TYPES.RED_BRICK;
    this.grid[11][11] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[11][12] = TILE_TYPES.COLLECTIBLE_COIN;

    this.grid[9][14] = TILE_TYPES.RED_BRICK;
    this.grid[9][15] = TILE_TYPES.RED_BRICK;
    this.grid[9][16] = TILE_TYPES.RED_BRICK;
    this.grid[8][15] = TILE_TYPES.COLLECTIBLE_RUBY;     // +200
    this.grid[8][16] = TILE_TYPES.COLLECTIBLE_COIN;

    this.grid[12][18] = TILE_TYPES.RED_BRICK;
    this.grid[12][19] = TILE_TYPES.RED_BRICK;
    this.grid[11][18] = TILE_TYPES.COLLECTIBLE_COIN;

    // Enemy Patrol Station 1 (Col 21, Row 13)
    this.grid[13][21] = TILE_TYPES.ENEMY_SPAWN;

    // 4. SECTION 2: MULTI-TIER PLATFORMS & SPIKE PIT (Cols 23..44)
    this.grid[12][24] = TILE_TYPES.RED_BRICK;
    this.grid[12][25] = TILE_TYPES.RED_BRICK;
    this.grid[11][24] = TILE_TYPES.COLLECTIBLE_COIN;

    // Island platform directly above spike pit (spikes at 26..29)
    this.grid[9][27] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][28] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][27] = TILE_TYPES.COLLECTIBLE_SAPPHIRE; // +300
    this.grid[8][28] = TILE_TYPES.COLLECTIBLE_SAPPHIRE; // +300

    this.grid[11][30] = TILE_TYPES.RED_BRICK;
    this.grid[11][31] = TILE_TYPES.RED_BRICK;
    this.grid[10][30] = TILE_TYPES.COLLECTIBLE_COIN;

    // Stepped wall hurdle
    this.grid[12][34] = TILE_TYPES.STEEL_BLOCK;
    this.grid[13][34] = TILE_TYPES.STEEL_BLOCK;

    // High secret ledge
    this.grid[7][36] = TILE_TYPES.RED_BRICK;
    this.grid[7][37] = TILE_TYPES.RED_BRICK;
    this.grid[7][38] = TILE_TYPES.RED_BRICK;
    this.grid[6][36] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[6][37] = TILE_TYPES.COLLECTIBLE_RUBY;     // +200
    this.grid[6][38] = TILE_TYPES.COLLECTIBLE_COIN;

    // Enemy Patrol Station 2 (Col 40, Row 13)
    this.grid[13][40] = TILE_TYPES.ENEMY_SPAWN;

    this.grid[11][42] = TILE_TYPES.RED_BRICK;
    this.grid[11][43] = TILE_TYPES.RED_BRICK;
    this.grid[10][42] = TILE_TYPES.COLLECTIBLE_COIN;

    // 5. SECTION 3: THE TROPHY CHAMBER (Cols 45..58)
    this.grid[12][46] = TILE_TYPES.RED_BRICK;
    this.grid[12][47] = TILE_TYPES.RED_BRICK;
    this.grid[11][46] = TILE_TYPES.COLLECTIBLE_COIN;

    // Floating platforms above lava pit (48..51)
    this.grid[9][49] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][50] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][51] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][49] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[8][50] = TILE_TYPES.ENEMY_SPAWN; // Platform guard
    this.grid[8][51] = TILE_TYPES.COLLECTIBLE_RUBY;

    // High Trophy Pedestal
    this.grid[6][52] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][53] = TILE_TYPES.STEEL_BLOCK;
    this.grid[5][52] = TILE_TYPES.COLLECTIBLE_TROPHY; // Golden Trophy Key Item! (+1000)

    this.grid[9][55] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][56] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][55] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[8][56] = TILE_TYPES.COLLECTIBLE_SAPPHIRE; // +300

    this.grid[12][58] = TILE_TYPES.RED_BRICK;
    this.grid[12][59] = TILE_TYPES.RED_BRICK;
    this.grid[11][58] = TILE_TYPES.COLLECTIBLE_COIN;

    // 6. SECTION 4: THE GOAL & EXIT PORTAL (Cols 60..69)
    this.grid[13][61] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][63] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][64] = TILE_TYPES.COLLECTIBLE_COIN;

    // Pillar decoration
    this.grid[11][62] = TILE_TYPES.STEEL_BLOCK;
    this.grid[12][62] = TILE_TYPES.STEEL_BLOCK;
    this.grid[13][62] = TILE_TYPES.STEEL_BLOCK;

    // The Exit Door (Row 12 & 13, Col 66)
    this.grid[12][66] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][66] = TILE_TYPES.EXIT_DOOR;
  }

  /**
   * Returns list of configured enemy spawn coordinates
   */
  getEnemySpawns() {
    const spawns = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === TILE_TYPES.ENEMY_SPAWN) {
          spawns.push({
            x: c * this.tileSize,
            y: (r + 1) * this.tileSize - 12
          });
        }
      }
    }
    return spawns;
  }

  /**
   * Check if a tile is solid terrain (blocks movement)
   */
  isSolid(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return true; // Map boundaries are solid
    }
    const tile = this.grid[row][col];
    return tile === TILE_TYPES.RED_BRICK ||
           tile === TILE_TYPES.STEEL_BLOCK ||
           tile === TILE_TYPES.WOOD_PLATFORM;
  }

  /**
   * Check if tile is a deadly hazard
   */
  isHazard(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
    const tile = this.grid[row][col];
    return tile === TILE_TYPES.HAZARD_FIRE || tile === TILE_TYPES.HAZARD_SPIKES;
  }

  /**
   * Check if tile contains a collectible item and returns metadata
   */
  getCollectible(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
    const tile = this.grid[row][col];
    const worldX = col * this.tileSize;
    const worldY = row * this.tileSize;

    if (tile === TILE_TYPES.COLLECTIBLE_COIN) {
      return { type: 'COIN', score: 100, color: '#facc15', x: worldX, y: worldY };
    }
    if (tile === TILE_TYPES.COLLECTIBLE_RUBY) {
      return { type: 'RUBY', score: 200, color: '#ef4444', x: worldX, y: worldY };
    }
    if (tile === TILE_TYPES.COLLECTIBLE_SAPPHIRE) {
      return { type: 'SAPPHIRE', score: 300, color: '#38bdf8', x: worldX, y: worldY };
    }
    if (tile === TILE_TYPES.COLLECTIBLE_TROPHY) {
      return { type: 'TROPHY', score: 1000, color: '#fef08a', x: worldX, y: worldY };
    }
    return null;
  }

  /**
   * Collects item at tile and clears tile to empty (prevents duplicate collection)
   */
  collectTile(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
    const item = this.getCollectible(col, row);
    if (item) {
      if (item.type === 'TROPHY') {
        this.hasTrophy = true;
      }
      this.grid[row][col] = TILE_TYPES.EMPTY; // Clear immediately
      return item;
    }
    return null;
  }

  /**
   * Check if tile is the exit portal
   */
  isExit(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
    return this.grid[row][col] === TILE_TYPES.EXIT_DOOR;
  }

  /**
   * Render tile map and animated objects
   */
  render(ctx, camera) {
    const s = this.tileSize;
    this.animTimer += 0.03;

    // Viewport tile culling for maximum performance
    const startCol = Math.max(0, Math.floor(camera.x / s));
    const endCol = Math.min(this.cols - 1, Math.ceil((camera.x + camera.viewportWidth) / s));

    for (let r = 0; r < this.rows; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileType = this.grid[r][c];
        const x = c * s;
        const y = r * s;

        switch (tileType) {
          case TILE_TYPES.RED_BRICK:
            this.renderRedBrick(ctx, x, y);
            break;
          case TILE_TYPES.STEEL_BLOCK:
            this.renderSteelBlock(ctx, x, y);
            break;
          case TILE_TYPES.WOOD_PLATFORM:
            this.renderWoodPlatform(ctx, x, y);
            break;
          case TILE_TYPES.HAZARD_FIRE:
            this.renderHazardFire(ctx, x, y);
            break;
          case TILE_TYPES.HAZARD_SPIKES:
            this.renderHazardSpikes(ctx, x, y);
            break;
          case TILE_TYPES.COLLECTIBLE_COIN:
            this.renderCollectibleCoin(ctx, x, y);
            break;
          case TILE_TYPES.COLLECTIBLE_RUBY:
            this.renderCollectibleRuby(ctx, x, y);
            break;
          case TILE_TYPES.COLLECTIBLE_SAPPHIRE:
            this.renderCollectibleSapphire(ctx, x, y);
            break;
          case TILE_TYPES.COLLECTIBLE_TROPHY:
            this.renderCollectibleTrophy(ctx, x, y);
            break;
          case TILE_TYPES.EXIT_DOOR:
            if (r === 12) {
              this.renderExitDoor(ctx, x, y);
            }
            break;
        }
      }
    }
  }

  renderRedBrick(ctx, x, y) {
    const s = this.tileSize;
    ctx.fillStyle = '#b81414';
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#e54545';
    ctx.fillRect(x, y, s, 2);
    ctx.fillRect(x, y + 8, s, 2);
    ctx.fillStyle = '#4a0000';
    ctx.fillRect(x, y + 7, s, 1);
    ctx.fillRect(x, y + 15, s, 1);
    ctx.fillRect(x + 7, y, 1, 7);
    ctx.fillRect(x + 15, y + 8, 1, 7);
  }

  renderSteelBlock(ctx, x, y) {
    const s = this.tileSize;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#374151';
    ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(x + 1, y + 1, s - 2, 1);
    ctx.fillRect(x + 1, y + 1, 1, s - 2);
    ctx.fillStyle = '#111827';
    ctx.fillRect(x + 1, y + s - 2, s - 2, 1);
    ctx.fillRect(x + s - 2, y + 1, 1, s - 2);
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(x + 3, y + 3, 1, 1);
    ctx.fillRect(x + s - 4, y + 3, 1, 1);
    ctx.fillRect(x + 3, y + s - 4, 1, 1);
    ctx.fillRect(x + s - 4, y + s - 4, 1, 1);
  }

  renderWoodPlatform(ctx, x, y) {
    const s = this.tileSize;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, y + 2, s, 3);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, y + s - 2, s, 2);
  }

  renderHazardFire(ctx, x, y) {
    const s = this.tileSize;
    const flicker = Math.floor(this.animTimer * 10) % 3;

    ctx.fillStyle = '#450a0a';
    ctx.fillRect(x, y + 10, s, 6);

    ctx.fillStyle = '#ea580c';
    ctx.fillRect(x + 1, y + 4 + (flicker === 0 ? 1 : 0), 4, 10);
    ctx.fillRect(x + 6, y + 2 + (flicker === 1 ? 1 : 0), 4, 12);
    ctx.fillRect(x + 11, y + 5 + (flicker === 2 ? 1 : 0), 4, 9);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 2, y + 7, 2, 7);
    ctx.fillRect(x + 7, y + 5, 2, 9);
    ctx.fillRect(x + 12, y + 8, 2, 6);
  }

  renderHazardSpikes(ctx, x, y) {
    const s = this.tileSize;
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, y + 13, s, 3);

    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 3; i++) {
      const sx = x + i * 5 + 1;
      ctx.fillRect(sx + 2, y + 3, 1, 2);
      ctx.fillRect(sx + 1, y + 5, 3, 3);
      ctx.fillRect(sx + 0, y + 8, 5, 5);
    }
  }

  /**
   * Animated spinning gold coin (+100)
   */
  renderCollectibleCoin(ctx, x, y) {
    const s = this.tileSize;
    const bob = Math.sin(this.animTimer * 4) * 1.5;
    const cy = y + 4 + bob;
    const spinFrame = Math.floor(this.animTimer * 8) % 4;

    ctx.fillStyle = '#ca8a04'; // Dark Gold border

    if (spinFrame === 0 || spinFrame === 2) {
      // Full circle coin
      ctx.fillRect(x + 4, cy, 8, 8);
      ctx.fillStyle = '#facc15'; // Bright Gold
      ctx.fillRect(x + 5, cy + 1, 6, 6);
      ctx.fillStyle = '#fef08a'; // Specular highlight
      ctx.fillRect(x + 6, cy + 2, 2, 2);
    } else if (spinFrame === 1) {
      // 3/4 turn
      ctx.fillRect(x + 6, cy, 4, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 7, cy + 1, 2, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 7, cy + 2, 1, 2);
    } else {
      // Edge turn (thin sliver)
      ctx.fillRect(x + 7, cy, 2, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 7, cy + 2, 2, 3);
    }
  }

  /**
   * Sparkling Ruby Gem (+200)
   */
  renderCollectibleRuby(ctx, x, y) {
    const s = this.tileSize;
    const bob = Math.sin(this.animTimer * 4 + 1) * 1.5;
    const gy = y + 3 + bob;

    ctx.fillStyle = '#991b1b'; // Dark Red Outline
    ctx.fillRect(x + 4, gy + 1, 8, 8);

    ctx.fillStyle = '#ef4444'; // Bright Red Facet
    ctx.fillRect(x + 5, gy + 2, 6, 6);

    ctx.fillStyle = '#fca5a5'; // Pink / White Sparkle
    ctx.fillRect(x + 5, gy + 2, 2, 2);
  }

  /**
   * Sparkling Sapphire Gem (+300)
   */
  renderCollectibleSapphire(ctx, x, y) {
    const s = this.tileSize;
    const bob = Math.sin(this.animTimer * 4 + 2) * 1.5;
    const gy = y + 3 + bob;

    // Diamond cut sapphire
    ctx.fillStyle = '#0369a1'; // Deep Blue
    ctx.fillRect(x + 5, gy + 1, 6, 2);
    ctx.fillRect(x + 3, gy + 3, 10, 3);
    ctx.fillRect(x + 5, gy + 6, 6, 2);
    ctx.fillRect(x + 7, gy + 8, 2, 2);

    ctx.fillStyle = '#38bdf8'; // Sky Blue Facet
    ctx.fillRect(x + 5, gy + 2, 4, 4);

    ctx.fillStyle = '#ffffff'; // White glint
    ctx.fillRect(x + 5, gy + 2, 2, 2);
  }

  /**
   * Golden Trophy Chalice (+1000, Key Item)
   */
  renderCollectibleTrophy(ctx, x, y) {
    const s = this.tileSize;
    const shimmer = Math.sin(this.animTimer * 6) > 0.5;

    ctx.fillStyle = shimmer ? '#fef08a' : '#eab308';
    ctx.fillRect(x + 2, y + 1, 12, 5);
    ctx.fillRect(x + 4, y + 6, 8, 3);
    ctx.fillRect(x + 6, y + 9, 4, 3);
    ctx.fillRect(x + 3, y + 12, 10, 3);

    ctx.fillRect(x + 0, y + 2, 2, 4);
    ctx.fillRect(x + 14, y + 2, 2, 4);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 7, y + 3, 2, 2);
  }

  renderExitDoor(ctx, x, y) {
    const w = this.tileSize;
    const h = this.tileSize * 2;

    ctx.fillStyle = this.hasTrophy ? '#fbbf24' : '#71717a';
    ctx.fillRect(x + 1, y, w - 2, h);

    ctx.fillStyle = '#050508';
    ctx.fillRect(x + 3, y + 3, w - 6, h - 3);

    if (this.hasTrophy) {
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(x + 6, y + 10, 4, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 7, y + 12, 2, 4);
    }
  }
}
