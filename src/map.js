/**
 * Multi-Level Tile Map System (Levels 1, 2, and 3)
 * Provides progressive retro platformer levels with start positions,
 * platforms, hazards, collectibles, enemy spawns, and exit portals.
 */

export const TILE_SIZE = 16;
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
  constructor(levelNumber = 1) {
    this.tileSize = TILE_SIZE;
    this.rows = MAP_ROWS;
    this.animTimer = 0;
    this.hasTrophy = false;
    this.loadLevel(levelNumber);
  }

  /**
   * Loads specific level layout and metadata
   */
  loadLevel(levelNumber) {
    this.levelNumber = levelNumber;
    this.hasTrophy = false;

    if (levelNumber === 1) {
      this.buildLevel1();
    } else if (levelNumber === 2) {
      this.buildLevel2();
    } else if (levelNumber === 3) {
      this.buildLevel3();
    } else {
      this.buildLevel1();
    }
  }

  // ==========================================
  // LEVEL 1: THE TRAINING VAULT (Easy)
  // ==========================================
  buildLevel1() {
    this.cols = 68;
    this.playerSpawn = { x: 32, y: 192 };
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // Boundaries
    for (let c = 0; c < this.cols; c++) this.grid[0][c] = TILE_TYPES.STEEL_BLOCK;
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.STEEL_BLOCK;
      this.grid[r][this.cols - 1] = TILE_TYPES.STEEL_BLOCK;
    }

    // Base Ground with small fire pit at cols 13..14, spikes at 28..30, fire at 47..49
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 13 && c <= 14) || (c >= 47 && c <= 49)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_FIRE;
      } else if (c >= 28 && c <= 30) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES;
      } else {
        this.grid[14][c] = TILE_TYPES.RED_BRICK;
      }
    }

    // Section 1: Intro platforms & Coins
    this.grid[11][4] = TILE_TYPES.RED_BRICK;
    this.grid[11][5] = TILE_TYPES.RED_BRICK;
    this.grid[11][6] = TILE_TYPES.RED_BRICK;
    this.grid[10][4] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[10][6] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][8] = TILE_TYPES.COLLECTIBLE_COIN; // Ground coin for easy early pickup

    // Fire hop platform
    this.grid[12][11] = TILE_TYPES.RED_BRICK;
    this.grid[12][12] = TILE_TYPES.RED_BRICK;
    this.grid[9][14] = TILE_TYPES.RED_BRICK;
    this.grid[9][15] = TILE_TYPES.RED_BRICK;
    this.grid[9][16] = TILE_TYPES.RED_BRICK;
    this.grid[8][15] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Enemy Patrol 1 (Ground) & Coins
    this.grid[13][18] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][20] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][21] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][22] = TILE_TYPES.COLLECTIBLE_COIN;

    // Section 2: Spike pit crossing
    this.grid[12][25] = TILE_TYPES.RED_BRICK;
    this.grid[9][28] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][29] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][28] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[8][29] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[12][32] = TILE_TYPES.RED_BRICK;
    this.grid[13][34] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][35] = TILE_TYPES.COLLECTIBLE_COIN;

    // Secret high ledge
    this.grid[7][36] = TILE_TYPES.RED_BRICK;
    this.grid[7][37] = TILE_TYPES.RED_BRICK;
    this.grid[6][36] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[6][37] = TILE_TYPES.COLLECTIBLE_COIN;

    // Enemy Patrol 2 (Ground)
    this.grid[13][39] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][42] = TILE_TYPES.COLLECTIBLE_COIN;

    // Section 3: Trophy Chamber
    this.grid[12][45] = TILE_TYPES.RED_BRICK;
    this.grid[11][45] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[9][48] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][49] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][49] = TILE_TYPES.ENEMY_SPAWN; // Platform guard

    // Trophy Altar
    this.grid[6][51] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][52] = TILE_TYPES.STEEL_BLOCK;
    this.grid[5][51] = TILE_TYPES.COLLECTIBLE_TROPHY;
    this.grid[5][52] = TILE_TYPES.COLLECTIBLE_RUBY;

    this.grid[9][54] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[12][57] = TILE_TYPES.RED_BRICK;
    this.grid[11][57] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][60] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][61] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][62] = TILE_TYPES.COLLECTIBLE_COIN;

    // Exit Door
    this.grid[12][64] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][64] = TILE_TYPES.EXIT_DOOR;
  }

  // ==========================================
  // LEVEL 2: THE CYBER FACTORY (Medium)
  // ==========================================
  buildLevel2() {
    this.cols = 76;
    this.playerSpawn = { x: 32, y: 192 };
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // Boundaries
    for (let c = 0; c < this.cols; c++) this.grid[0][c] = TILE_TYPES.STEEL_BLOCK;
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.STEEL_BLOCK;
      this.grid[r][this.cols - 1] = TILE_TYPES.STEEL_BLOCK;
    }

    // Ground with alternating hazards (cols 11..13 spikes, 23..25 fire, 39..42 spikes, 53..56 lava)
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 11 && c <= 13) || (c >= 39 && c <= 42)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES;
      } else if ((c >= 23 && c <= 25) || (c >= 53 && c <= 56)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_FIRE;
      } else {
        this.grid[14][c] = TILE_TYPES.STEEL_BLOCK;
      }
    }

    // Section 1: Factory Entrance & Pipe Hopping
    this.grid[11][5] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][6] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][6] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][8] = TILE_TYPES.COLLECTIBLE_COIN;

    // Elevated Girders over first spike pit
    this.grid[9][11] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][12] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][13] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][12] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    // Enemy Patrol 1
    this.grid[13][15] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][18] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][19] = TILE_TYPES.COLLECTIBLE_COIN;

    // Section 2: Stepped Conveyors over fire
    this.grid[12][22] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][24] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][25] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][24] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[8][25] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[12][27] = TILE_TYPES.STEEL_BLOCK;
    this.grid[13][28] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    // Enemy Patrol 2 (Mid-air girder)
    this.grid[8][32] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[9][31] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][32] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][33] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][31] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[8][33] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][36] = TILE_TYPES.COLLECTIBLE_COIN;

    // Section 3: High Secret Tower & Hazard crossing
    this.grid[11][37] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][40] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][41] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][40] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[6][41] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Enemy Patrol 3 (Ground)
    this.grid[13][44] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][45] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][46] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][48] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    // Section 4: Crane Altar & The Trophy
    this.grid[12][50] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][53] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][54] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][53] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[8][54] = TILE_TYPES.ENEMY_SPAWN; // Guard

    // High Altar
    this.grid[6][56] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][57] = TILE_TYPES.STEEL_BLOCK;
    this.grid[5][56] = TILE_TYPES.COLLECTIBLE_TROPHY;
    this.grid[5][57] = TILE_TYPES.COLLECTIBLE_RUBY;

    this.grid[10][60] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][60] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[12][63] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][63] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][67] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][68] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][69] = TILE_TYPES.COLLECTIBLE_COIN;

    // Exit Gate
    this.grid[12][72] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][72] = TILE_TYPES.EXIT_DOOR;
  }

  // ==========================================
  // LEVEL 3: THE DAVE FORTRESS (Hard / Climax)
  // ==========================================
  buildLevel3() {
    this.cols = 86;
    this.playerSpawn = { x: 32, y: 192 };
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // Boundaries
    for (let c = 0; c < this.cols; c++) this.grid[0][c] = TILE_TYPES.STEEL_BLOCK;
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.STEEL_BLOCK;
      this.grid[r][this.cols - 1] = TILE_TYPES.STEEL_BLOCK;
    }

    // Extensive hazard pits across the fortress floor
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 12 && c <= 16) || (c >= 35 && c <= 40) || (c >= 58 && c <= 63)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_FIRE; // Deep Lava Pits
      } else if ((c >= 24 && c <= 27) || (c >= 48 && c <= 51)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES; // Spikes
      } else {
        this.grid[14][c] = TILE_TYPES.RED_BRICK;
      }
    }

    // Section 1: The Castle Courtyard
    this.grid[11][4] = TILE_TYPES.RED_BRICK;
    this.grid[11][5] = TILE_TYPES.RED_BRICK;
    this.grid[10][4] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[13][8] = TILE_TYPES.COLLECTIBLE_COIN;

    // Stepping stones over large lava pit 1
    this.grid[12][11] = TILE_TYPES.RED_BRICK;
    this.grid[9][13] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][14] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][13] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[8][14] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[12][17] = TILE_TYPES.RED_BRICK;

    // Enemy Patrol 1 & 2
    this.grid[13][19] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][20] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[8][22] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    // Spike pit 1 traversal
    this.grid[11][23] = TILE_TYPES.RED_BRICK;
    this.grid[8][25] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][26] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][25] = TILE_TYPES.ENEMY_SPAWN; // Platform guard
    this.grid[7][26] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[11][28] = TILE_TYPES.RED_BRICK;
    this.grid[13][30] = TILE_TYPES.COLLECTIBLE_COIN;

    // Section 2: Ascending Fortress Spires
    this.grid[12][32] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][34] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][36] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][37] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[5][36] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[5][37] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Enemy Patrol 3 & 4
    this.grid[13][41] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][42] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][43] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[10][45] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][45] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[9][46] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[13][47] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][53] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    // Section 3: Deep Lava Chasm & The Grand Trophy Spire
    this.grid[12][54] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][57] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][58] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][58] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    // The Grand Fortress Altar
    this.grid[5][61] = TILE_TYPES.STEEL_BLOCK;
    this.grid[5][62] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][61] = TILE_TYPES.COLLECTIBLE_TROPHY; // Grand Trophy!
    this.grid[4][62] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Enemy Patrol 5 & 6 (Guarding exit approach)
    this.grid[8][65] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][65] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[7][66] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[11][68] = TILE_TYPES.RED_BRICK;
    this.grid[10][68] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[13][71] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][74] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][76] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][77] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][78] = TILE_TYPES.COLLECTIBLE_COIN;

    // Master Exit Portal
    this.grid[12][82] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][82] = TILE_TYPES.EXIT_DOOR;
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

  isSolid(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return true;
    const tile = this.grid[row][col];
    return tile === TILE_TYPES.RED_BRICK ||
           tile === TILE_TYPES.STEEL_BLOCK ||
           tile === TILE_TYPES.WOOD_PLATFORM;
  }

  isHazard(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
    const tile = this.grid[row][col];
    return tile === TILE_TYPES.HAZARD_FIRE || tile === TILE_TYPES.HAZARD_SPIKES;
  }

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

  collectTile(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
    const item = this.getCollectible(col, row);
    if (item) {
      if (item.type === 'TROPHY') {
        this.hasTrophy = true;
      }
      this.grid[row][col] = TILE_TYPES.EMPTY;
      return item;
    }
    return null;
  }

  isExit(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
    return this.grid[row][col] === TILE_TYPES.EXIT_DOOR;
  }

  render(ctx, camera) {
    const s = this.tileSize;
    this.animTimer += 0.03;

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

  renderCollectibleCoin(ctx, x, y) {
    const s = this.tileSize;
    const bob = Math.sin(this.animTimer * 4) * 1.5;
    const cy = y + 4 + bob;
    const spinFrame = Math.floor(this.animTimer * 8) % 4;

    ctx.fillStyle = '#ca8a04';
    if (spinFrame === 0 || spinFrame === 2) {
      ctx.fillRect(x + 4, cy, 8, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 5, cy + 1, 6, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 6, cy + 2, 2, 2);
    } else if (spinFrame === 1) {
      ctx.fillRect(x + 6, cy, 4, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 7, cy + 1, 2, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 7, cy + 2, 1, 2);
    } else {
      ctx.fillRect(x + 7, cy, 2, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 7, cy + 2, 2, 3);
    }
  }

  renderCollectibleRuby(ctx, x, y) {
    const s = this.tileSize;
    const bob = Math.sin(this.animTimer * 4 + 1) * 1.5;
    const gy = y + 3 + bob;
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(x + 4, gy + 1, 8, 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 5, gy + 2, 6, 6);
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(x + 5, gy + 2, 2, 2);
  }

  renderCollectibleSapphire(ctx, x, y) {
    const s = this.tileSize;
    const bob = Math.sin(this.animTimer * 4 + 2) * 1.5;
    const gy = y + 3 + bob;
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(x + 5, gy + 1, 6, 2);
    ctx.fillRect(x + 3, gy + 3, 10, 3);
    ctx.fillRect(x + 5, gy + 6, 6, 2);
    ctx.fillRect(x + 7, gy + 8, 2, 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 5, gy + 2, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 5, gy + 2, 2, 2);
  }

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
