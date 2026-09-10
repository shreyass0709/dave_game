/**
 * Multi-Level Tile Map System (Levels 1 through 10)
 * Provides progressive retro platformer levels with start positions,
 * platforms, hazards, collectibles, checkpoints, enemy spawns, and exit portals.
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
  ENEMY_SPAWN: 11,
  CHECKPOINT: 12
};

export const LEVEL_METADATA = {
  1: {
    num: '01',
    title: 'THE LOST VAULT',
    subtitle: 'TRAINING VAULT',
    themeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    stars: '★☆☆☆☆',
    starsColor: '#38bdf8',
    desc: 'Master platforming, gather diamonds & collect the Golden Trophy.',
    bgHue: '#0c2338'
  },
  2: {
    num: '02',
    title: 'CYBER FACTORY',
    subtitle: 'INDUSTRIAL CONDUIT',
    themeColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    stars: '★★☆☆☆',
    starsColor: '#a855f7',
    desc: 'Traverse moving girders, toxic pipes & patrolling slime guards.',
    bgHue: '#1c1038'
  },
  3: {
    num: '03',
    title: 'DAVE FORTRESS',
    subtitle: 'MOLTEN CITADEL',
    themeColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    stars: '★★★☆☆',
    starsColor: '#f97316',
    desc: 'Ascend fortress spires over deep molten lava to breach the gate.',
    bgHue: '#2d0e14'
  },
  4: {
    num: '04',
    title: 'TOXIC SEWERS',
    subtitle: 'ACID DRAINAGE',
    themeColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.45)',
    stars: '★★☆☆☆',
    starsColor: '#22c55e',
    desc: 'Navigate acid channels, rusty drainage grates & sludge drones.',
    bgHue: '#0d2818'
  },
  5: {
    num: '05',
    title: 'CRYSTAL CAVERNS',
    subtitle: 'GEODE DEPTHS',
    themeColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    stars: '★★★☆☆',
    starsColor: '#06b6d4',
    desc: 'Leap across luminous geode pillars & subterranean spike chasms.',
    bgHue: '#092434'
  },
  6: {
    num: '06',
    title: 'MAGMA CORE',
    subtitle: 'TECTONIC FOUNDRY',
    themeColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    stars: '★★★★☆',
    starsColor: '#ef4444',
    desc: 'Survive intense thermal blasts, basalt stepping pillars & magma vents.',
    bgHue: '#340f12'
  },
  7: {
    num: '07',
    title: 'NEO SKYWAY',
    subtitle: 'FLOATING METROPOLIS',
    themeColor: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.45)',
    stars: '★★★★☆',
    starsColor: '#60a5fa',
    desc: 'Scale high-altitude floating suspension girders above neon clouds.',
    bgHue: '#0f1f3d'
  },
  8: {
    num: '08',
    title: 'SHADOW CITADEL',
    subtitle: 'COVERT BASTION',
    themeColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    stars: '★★★★☆',
    starsColor: '#ec4899',
    desc: 'Infiltrate midnight laser grids, stealth turrets & obsidian towers.',
    bgHue: '#290b2c'
  },
  9: {
    num: '09',
    title: 'QUANTUM REACTOR',
    subtitle: 'ENERGY ACCELERATOR',
    themeColor: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.45)',
    stars: '★★★★★',
    starsColor: '#818cf8',
    desc: 'Race along overcharged particle accelerators & pulsating conduits.',
    bgHue: '#17163b'
  },
  10: {
    num: '10',
    title: "EMPEROR'S SANCTUM",
    subtitle: 'THE FINAL THRONE',
    themeColor: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.55)',
    stars: '★★★★★',
    starsColor: '#facc15',
    desc: 'Conquer the royal gilded citadel & claim the Grand Emperor Trophy!',
    bgHue: '#2a1e06'
  }
};

export class GameMap {
  constructor(levelNumber = 1) {
    this.tileSize = TILE_SIZE;
    this.rows = MAP_ROWS;
    this.animTimer = 0;
    this.hasTrophy = false;
    this.checkpoints = [];
    this.loadLevel(levelNumber);
  }

  /**
   * Loads specific level layout and metadata (Levels 1 to 10)
   */
  loadLevel(levelNumber) {
    this.levelNumber = Math.max(1, Math.min(10, levelNumber));
    this.hasTrophy = false;
    this.checkpoints = [];

    switch (this.levelNumber) {
      case 1: this.buildLevel1(); break;
      case 2: this.buildLevel2(); break;
      case 3: this.buildLevel3(); break;
      case 4: this.buildLevel4(); break;
      case 5: this.buildLevel5(); break;
      case 6: this.buildLevel6(); break;
      case 7: this.buildLevel7(); break;
      case 8: this.buildLevel8(); break;
      case 9: this.buildLevel9(); break;
      case 10: this.buildLevel10(); break;
      default: this.buildLevel1(); break;
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

    // Checkpoint 1 (Midpoint Flag)
    this.grid[13][33] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 33, row: 13, x: 33 * this.tileSize, y: 13 * this.tileSize, activated: false });

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

    // Checkpoint 1 (Cyber Tower Flag)
    this.grid[10][37] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 37, row: 10, x: 37 * this.tileSize, y: 10 * this.tileSize, activated: false });

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

    // Checkpoint 1 (Fortress Spires Midway Flag)
    this.grid[11][32] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 32, row: 11, x: 32 * this.tileSize, y: 11 * this.tileSize, activated: false });

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

    // Checkpoint 2 (Chasm Approach Flag)
    this.grid[11][54] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 54, row: 11, x: 54 * this.tileSize, y: 11 * this.tileSize, activated: false });

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

  // ==========================================
  // LEVEL 4: TOXIC SEWERS (Acid Drainage)
  // ==========================================
  buildLevel4() {
    this.cols = 78;
    this.playerSpawn = { x: 32, y: 192 };
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // Boundaries
    for (let c = 0; c < this.cols; c++) this.grid[0][c] = TILE_TYPES.STEEL_BLOCK;
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.STEEL_BLOCK;
      this.grid[r][this.cols - 1] = TILE_TYPES.STEEL_BLOCK;
    }

    // Floor with acid channels (HAZARD_FIRE) and rusted drain spikes (HAZARD_SPIKES)
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 12 && c <= 15) || (c >= 50 && c <= 53)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_FIRE; // Acid sludge pit
      } else if (c >= 30 && c <= 33) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES; // Rusted drain spikes
      } else {
        this.grid[14][c] = TILE_TYPES.STEEL_BLOCK;
      }
    }

    // Section 1: Pipe Entrance & Early Diamonds
    this.grid[11][5] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][6] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][6] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][8] = TILE_TYPES.COLLECTIBLE_COIN;

    // Acid pit 1 hop
    this.grid[12][10] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][13] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][14] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][14] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[12][17] = TILE_TYPES.STEEL_BLOCK;

    // Section 2: Sewer Walkway & Sludge Patrol 1
    this.grid[13][19] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][21] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][23] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][25] = TILE_TYPES.COLLECTIBLE_COIN;

    // Stepped drainage pipe climb
    this.grid[11][26] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][27] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][26] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[8][29] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][30] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][30] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Section 3: Central Filtration Hub & Checkpoint 1
    this.grid[11][34] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][35] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][36] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][35] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 35, row: 10, x: 35 * this.tileSize, y: 10 * this.tileSize, activated: false });

    // High secret ventilation pipe
    this.grid[8][38] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][39] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][39] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[5][35] = TILE_TYPES.STEEL_BLOCK;
    this.grid[5][36] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][36] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Section 4: Sludge Canal & Patrol 2
    this.grid[13][42] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][44] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][47] = TILE_TYPES.COLLECTIBLE_COIN;

    // Acid Pit 2 crossing
    this.grid[12][49] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][51] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][52] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][51] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[12][54] = TILE_TYPES.STEEL_BLOCK;
    this.grid[13][56] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][57] = TILE_TYPES.COLLECTIBLE_COIN;

    // Section 5: Chemical Altar & The Golden Trophy
    this.grid[9][59] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][60] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][59] = TILE_TYPES.ENEMY_SPAWN; // Ledge Guard
    this.grid[8][60] = TILE_TYPES.COLLECTIBLE_COIN;

    // High Chemical Altar
    this.grid[8][62] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][64] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][65] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][64] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][65] = TILE_TYPES.STEEL_BLOCK;
    this.grid[3][64] = TILE_TYPES.COLLECTIBLE_TROPHY;
    this.grid[3][65] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Section 6: Drainage Descent to Exit
    this.grid[8][68] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][69] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[11][71] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][72] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][71] = TILE_TYPES.COLLECTIBLE_COIN;

    // Exit Portal
    this.grid[12][74] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][74] = TILE_TYPES.EXIT_DOOR;
  }

  // ==========================================
  // LEVEL 5: CRYSTAL CAVERNS (Subterranean Geode)
  // ==========================================
  buildLevel5() {
    this.cols = 82;
    this.playerSpawn = { x: 32, y: 192 };
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // Boundaries
    for (let c = 0; c < this.cols; c++) this.grid[0][c] = TILE_TYPES.RED_BRICK;
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.RED_BRICK;
      this.grid[r][this.cols - 1] = TILE_TYPES.RED_BRICK;
    }

    // Floor with crystal spike chasms (HAZARD_SPIKES)
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 13 && c <= 16) || (c >= 32 && c <= 35) || (c >= 52 && c <= 55)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES;
      } else {
        this.grid[14][c] = TILE_TYPES.RED_BRICK;
      }
    }

    // Section 1: Cavern Entry
    this.grid[11][4] = TILE_TYPES.RED_BRICK;
    this.grid[11][5] = TILE_TYPES.RED_BRICK;
    this.grid[11][6] = TILE_TYPES.RED_BRICK;
    this.grid[10][4] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][6] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[13][9] = TILE_TYPES.COLLECTIBLE_COIN;

    // Spike Chasm 1 crossing
    this.grid[12][12] = TILE_TYPES.RED_BRICK;
    this.grid[9][14] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][15] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][15] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[11][17] = TILE_TYPES.RED_BRICK;
    this.grid[11][18] = TILE_TYPES.RED_BRICK;

    // Section 2: Amethyst Ledges & Patrol 1 & 2
    this.grid[13][20] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][22] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][24] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][26] = TILE_TYPES.COLLECTIBLE_COIN;

    this.grid[11][27] = TILE_TYPES.RED_BRICK;
    this.grid[8][29] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][30] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][31] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][30] = TILE_TYPES.ENEMY_SPAWN; // Platform Guard
    this.grid[7][31] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    // Checkpoint 1 (Crystal Ledge)
    this.grid[11][30] = TILE_TYPES.RED_BRICK;
    this.grid[10][30] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 30, row: 10, x: 30 * this.tileSize, y: 10 * this.tileSize, activated: false });

    // Spike Chasm 2 hop
    this.grid[9][33] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][34] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][34] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[12][36] = TILE_TYPES.RED_BRICK;

    // Section 3: Vertical Stalagmite Ascent
    this.grid[10][39] = TILE_TYPES.RED_BRICK;
    this.grid[10][40] = TILE_TYPES.RED_BRICK;
    this.grid[9][39] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[7][42] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][43] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][42] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[6][43] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[10][46] = TILE_TYPES.RED_BRICK;

    // Ground Patrol 3
    this.grid[13][48] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][50] = TILE_TYPES.COLLECTIBLE_COIN;

    // Spike Chasm 3 & Checkpoint 2
    this.grid[9][53] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][54] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][54] = TILE_TYPES.COLLECTIBLE_RUBY;

    this.grid[12][57] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][57] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 57, row: 11, x: 57 * this.tileSize, y: 11 * this.tileSize, activated: false });

    // Section 4: Great Geode Throne & Golden Trophy
    this.grid[9][60] = TILE_TYPES.RED_BRICK;
    this.grid[9][61] = TILE_TYPES.RED_BRICK;
    this.grid[6][63] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][64] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][65] = TILE_TYPES.STEEL_BLOCK;
    this.grid[5][64] = TILE_TYPES.ENEMY_SPAWN; // Throne Guardian
    this.grid[5][65] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    // Crystal Throne Altar
    this.grid[4][66] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][67] = TILE_TYPES.STEEL_BLOCK;
    this.grid[3][66] = TILE_TYPES.COLLECTIBLE_TROPHY;
    this.grid[3][67] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Section 5: Portal Descent
    this.grid[7][70] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][71] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[10][73] = TILE_TYPES.RED_BRICK;
    this.grid[10][74] = TILE_TYPES.RED_BRICK;
    this.grid[13][76] = TILE_TYPES.COLLECTIBLE_COIN;

    // Exit Door
    this.grid[12][78] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][78] = TILE_TYPES.EXIT_DOOR;
  }

  // ==========================================
  // LEVEL 6: MAGMA CORE (Tectonic Foundry)
  // ==========================================
  buildLevel6() {
    this.cols = 84;
    this.playerSpawn = { x: 32, y: 192 };
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // Boundaries
    for (let c = 0; c < this.cols; c++) this.grid[0][c] = TILE_TYPES.STEEL_BLOCK;
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.STEEL_BLOCK;
      this.grid[r][this.cols - 1] = TILE_TYPES.STEEL_BLOCK;
    }

    // Floor with deep lava pits (HAZARD_FIRE) and molten heat spikes (HAZARD_SPIKES)
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 12 && c <= 16) || (c >= 32 && c <= 37) || (c >= 54 && c <= 59)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_FIRE;
      } else if ((c >= 24 && c <= 26) || (c >= 44 && c <= 46)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES;
      } else {
        this.grid[14][c] = TILE_TYPES.STEEL_BLOCK;
      }
    }

    // Section 1: Foundry Entry
    this.grid[11][4] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][5] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][4] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][8] = TILE_TYPES.COLLECTIBLE_COIN;

    // Lava Pit 1 leap
    this.grid[12][11] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][13] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][14] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][14] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[12][17] = TILE_TYPES.STEEL_BLOCK;

    // Section 2: Basalt Runway & Patrol 1
    this.grid[13][19] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][20] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][22] = TILE_TYPES.COLLECTIBLE_COIN;

    // Spikes 1 hop
    this.grid[10][24] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[10][25] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[10][26] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][25] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[12][28] = TILE_TYPES.STEEL_BLOCK;

    // Section 3: High Pumping Station & Checkpoint 1
    this.grid[10][30] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][31] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][30] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 30, row: 9, x: 30 * this.tileSize, y: 9 * this.tileSize, activated: false });

    this.grid[7][33] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][34] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][35] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][34] = TILE_TYPES.ENEMY_SPAWN; // High Platform Guard
    this.grid[6][35] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    // Lava Caldera 2 crossing
    this.grid[9][36] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][37] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][36] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[11][39] = TILE_TYPES.STEEL_BLOCK;

    // Section 4: Heat Exchanger & Checkpoint 2
    this.grid[13][41] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][42] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][44] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][45] = TILE_TYPES.STEEL_BLOCK;

    this.grid[12][49] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][49] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 49, row: 11, x: 49 * this.tileSize, y: 11 * this.tileSize, activated: false });

    this.grid[9][50] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][51] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][52] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][51] = TILE_TYPES.ENEMY_SPAWN; // Guard
    this.grid[8][52] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    // Section 5: The Molten Anvil & Golden Trophy
    this.grid[10][55] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][57] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][58] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][58] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[9][60] = TILE_TYPES.STEEL_BLOCK;

    // Great Magma Spire
    this.grid[7][63] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][64] = TILE_TYPES.STEEL_BLOCK;
    this.grid[5][66] = TILE_TYPES.STEEL_BLOCK;
    this.grid[5][67] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][66] = TILE_TYPES.ENEMY_SPAWN; // Altar Guard
    this.grid[3][69] = TILE_TYPES.STEEL_BLOCK;
    this.grid[3][70] = TILE_TYPES.STEEL_BLOCK;
    this.grid[2][69] = TILE_TYPES.COLLECTIBLE_TROPHY;
    this.grid[2][70] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Section 6: Cooling Chamber Exit
    this.grid[6][73] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][74] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][76] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][77] = TILE_TYPES.STEEL_BLOCK;
    this.grid[12][79] = TILE_TYPES.STEEL_BLOCK;
    this.grid[13][80] = TILE_TYPES.COLLECTIBLE_COIN;

    // Exit Door
    this.grid[12][81] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][81] = TILE_TYPES.EXIT_DOOR;
  }

  // ==========================================
  // LEVEL 7: NEO SKYWAY (Floating Metropolis)
  // ==========================================
  buildLevel7() {
    this.cols = 88;
    this.playerSpawn = { x: 32, y: 192 };
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // Boundaries
    for (let c = 0; c < this.cols; c++) this.grid[0][c] = TILE_TYPES.STEEL_BLOCK;
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.STEEL_BLOCK;
      this.grid[r][this.cols - 1] = TILE_TYPES.STEEL_BLOCK;
    }

    // Floor with bottomless sky abyss gaps (HAZARD_SPIKES representing plasma discharge)
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 14 && c <= 18) || (c >= 34 && c <= 38) || (c >= 56 && c <= 61) || (c >= 72 && c <= 75)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES;
      } else {
        this.grid[14][c] = TILE_TYPES.STEEL_BLOCK;
      }
    }

    // Section 1: Sky Launch Pad
    this.grid[11][5] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][6] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][6] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][8] = TILE_TYPES.COLLECTIBLE_COIN;

    // Sky Gap 1 leap
    this.grid[12][13] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][15] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][16] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][15] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[11][19] = TILE_TYPES.STEEL_BLOCK;

    // Section 2: Rooftop Highway & Patrol 1 & 2
    this.grid[13][21] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][23] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][25] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][27] = TILE_TYPES.COLLECTIBLE_COIN;

    this.grid[10][28] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[10][29] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[10][30] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][29] = TILE_TYPES.ENEMY_SPAWN; // Highway Patrol
    this.grid[9][30] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Section 3: Antenna Mast & Checkpoint 1
    this.grid[11][32] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][32] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 32, row: 10, x: 32 * this.tileSize, y: 10 * this.tileSize, activated: false });

    // Sky Gap 2 hop
    this.grid[9][35] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][36] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][36] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[11][39] = TILE_TYPES.STEEL_BLOCK;

    // Section 4: Dual-Level Skyway & Checkpoint 2
    this.grid[13][41] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][43] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[8][43] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][44] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][45] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][46] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][44] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[7][46] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    this.grid[12][51] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][51] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 51, row: 11, x: 51 * this.tileSize, y: 11 * this.tileSize, activated: false });

    // Section 5: Radio Tower Spire & Golden Trophy
    this.grid[10][57] = TILE_TYPES.STEEL_BLOCK;
    this.grid[8][59] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][60] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][59] = TILE_TYPES.ENEMY_SPAWN; // Mast Guard

    // Ascending Radio Mast
    this.grid[6][63] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][64] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][66] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][67] = TILE_TYPES.STEEL_BLOCK;
    this.grid[2][69] = TILE_TYPES.STEEL_BLOCK;
    this.grid[2][70] = TILE_TYPES.STEEL_BLOCK;
    this.grid[1][69] = TILE_TYPES.COLLECTIBLE_TROPHY;
    this.grid[1][70] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Section 6: Sky Terminal Descent
    this.grid[5][73] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[5][74] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][76] = TILE_TYPES.STEEL_BLOCK;
    this.grid[8][77] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][80] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[11][81] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[13][83] = TILE_TYPES.COLLECTIBLE_COIN;

    // Exit Door
    this.grid[12][84] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][84] = TILE_TYPES.EXIT_DOOR;
  }

  // ==========================================
  // LEVEL 8: SHADOW CITADEL (Covert Bastion)
  // ==========================================
  buildLevel8() {
    this.cols = 90;
    this.playerSpawn = { x: 32, y: 192 };
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // Boundaries
    for (let c = 0; c < this.cols; c++) this.grid[0][c] = TILE_TYPES.STEEL_BLOCK;
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.STEEL_BLOCK;
      this.grid[r][this.cols - 1] = TILE_TYPES.STEEL_BLOCK;
    }

    // Floor with incinerator pits (HAZARD_FIRE) and laser security spikes (HAZARD_SPIKES)
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 13 && c <= 17) || (c >= 36 && c <= 41) || (c >= 60 && c <= 65)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_FIRE;
      } else if ((c >= 26 && c <= 28) || (c >= 50 && c <= 52)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES;
      } else {
        this.grid[14][c] = TILE_TYPES.STEEL_BLOCK;
      }
    }

    // Section 1: Infiltration Bastion
    this.grid[11][5] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][6] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][7] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][6] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][9] = TILE_TYPES.COLLECTIBLE_COIN;

    // Moat 1 hop
    this.grid[12][12] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][14] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][15] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][15] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[11][18] = TILE_TYPES.STEEL_BLOCK;

    // Section 2: Security Corridor & Patrol 1 & 2
    this.grid[13][20] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][21] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][23] = TILE_TYPES.COLLECTIBLE_COIN;

    this.grid[9][24] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][25] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][26] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][27] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][25] = TILE_TYPES.ENEMY_SPAWN; // Gantry Guard
    this.grid[8][26] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Checkpoint 1
    this.grid[11][31] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][31] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 31, row: 10, x: 31 * this.tileSize, y: 10 * this.tileSize, activated: false });

    // Section 3: Central Prison Block & Moat 2
    this.grid[10][37] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[10][38] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][37] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[8][39] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][40] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][40] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[11][42] = TILE_TYPES.STEEL_BLOCK;

    this.grid[13][44] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][45] = TILE_TYPES.ENEMY_SPAWN;

    // Checkpoint 2
    this.grid[12][48] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][48] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 48, row: 11, x: 48 * this.tileSize, y: 11 * this.tileSize, activated: false });

    // Section 4: Citadel Armory & High Spire Ascent
    this.grid[9][50] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][51] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][52] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][51] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    this.grid[10][55] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][56] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][58] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][59] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][60] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][59] = TILE_TYPES.ENEMY_SPAWN; // Tower Guard

    // Moat 3 hop
    this.grid[6][62] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][63] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[5][63] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[8][66] = TILE_TYPES.STEEL_BLOCK;

    // Section 5: The Shadow Vault & Golden Trophy
    this.grid[6][69] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][70] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][72] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][73] = TILE_TYPES.STEEL_BLOCK;
    this.grid[3][75] = TILE_TYPES.STEEL_BLOCK;
    this.grid[3][76] = TILE_TYPES.STEEL_BLOCK;
    this.grid[2][75] = TILE_TYPES.COLLECTIBLE_TROPHY;
    this.grid[2][76] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Section 6: Airlock Extraction & Exit Door
    this.grid[6][79] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][80] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][82] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][83] = TILE_TYPES.STEEL_BLOCK;
    this.grid[12][85] = TILE_TYPES.STEEL_BLOCK;
    this.grid[13][86] = TILE_TYPES.COLLECTIBLE_COIN;

    // Exit Door
    this.grid[12][87] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][87] = TILE_TYPES.EXIT_DOOR;
  }

  // ==========================================
  // LEVEL 9: QUANTUM REACTOR (Energy Accelerator)
  // ==========================================
  buildLevel9() {
    this.cols = 92;
    this.playerSpawn = { x: 32, y: 192 };
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // Boundaries
    for (let c = 0; c < this.cols; c++) this.grid[0][c] = TILE_TYPES.STEEL_BLOCK;
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.STEEL_BLOCK;
      this.grid[r][this.cols - 1] = TILE_TYPES.STEEL_BLOCK;
    }

    // Floor with plasma discharge (HAZARD_FIRE) and ionized grids (HAZARD_SPIKES)
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 14 && c <= 18) || (c >= 38 && c <= 43) || (c >= 62 && c <= 67)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_FIRE;
      } else if ((c >= 28 && c <= 30) || (c >= 52 && c <= 54)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES;
      } else {
        this.grid[14][c] = TILE_TYPES.STEEL_BLOCK;
      }
    }

    // Section 1: Injection Chamber
    this.grid[11][5] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][6] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][7] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][6] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][8] = TILE_TYPES.COLLECTIBLE_COIN;

    // Plasma Leap 1
    this.grid[12][13] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][15] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][16] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][16] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[11][19] = TILE_TYPES.STEEL_BLOCK;

    // Section 2: Accelerator Ring & Patrol 1 & 2
    this.grid[13][21] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][22] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][24] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][26] = TILE_TYPES.COLLECTIBLE_COIN;

    this.grid[9][27] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][28] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][29] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][30] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][28] = TILE_TYPES.ENEMY_SPAWN; // Ledge Guard
    this.grid[8][29] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Checkpoint 1
    this.grid[11][33] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][33] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 33, row: 10, x: 33 * this.tileSize, y: 10 * this.tileSize, activated: false });

    // Section 3: Magnetic Compression Core
    this.grid[10][39] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[10][40] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][39] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[8][41] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][42] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][42] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[11][44] = TILE_TYPES.STEEL_BLOCK;

    this.grid[13][46] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][47] = TILE_TYPES.ENEMY_SPAWN;

    // Checkpoint 2
    this.grid[12][50] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][50] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 50, row: 11, x: 50 * this.tileSize, y: 11 * this.tileSize, activated: false });

    // Section 4: Quantum Split Conduit
    this.grid[9][52] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][53] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][54] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][53] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    this.grid[10][56] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][57] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][59] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][60] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][61] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][60] = TILE_TYPES.ENEMY_SPAWN; // Conduit Guard

    // Plasma 3 leap
    this.grid[6][63] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][64] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[5][64] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[8][68] = TILE_TYPES.STEEL_BLOCK;

    // Section 5: The Quantum Core Altar & Golden Trophy
    this.grid[6][71] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][72] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][74] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][75] = TILE_TYPES.STEEL_BLOCK;
    this.grid[3][77] = TILE_TYPES.STEEL_BLOCK;
    this.grid[3][78] = TILE_TYPES.STEEL_BLOCK;
    this.grid[2][77] = TILE_TYPES.COLLECTIBLE_TROPHY;
    this.grid[2][78] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Section 6: Evacuation Shunt to Exit
    this.grid[6][81] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][82] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][84] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][85] = TILE_TYPES.STEEL_BLOCK;
    this.grid[12][87] = TILE_TYPES.STEEL_BLOCK;
    this.grid[13][88] = TILE_TYPES.COLLECTIBLE_COIN;

    // Exit Door
    this.grid[12][89] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][89] = TILE_TYPES.EXIT_DOOR;
  }

  // ==========================================
  // LEVEL 10: THE EMPEROR'S SANCTUM (The Final Climax)
  // ==========================================
  buildLevel10() {
    this.cols = 96;
    this.playerSpawn = { x: 32, y: 192 };
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(TILE_TYPES.EMPTY));

    // Boundaries
    for (let c = 0; c < this.cols; c++) this.grid[0][c] = TILE_TYPES.STEEL_BLOCK;
    for (let r = 0; r < this.rows; r++) {
      this.grid[r][0] = TILE_TYPES.STEEL_BLOCK;
      this.grid[r][this.cols - 1] = TILE_TYPES.STEEL_BLOCK;
    }

    // Floor with imperial lava moats (HAZARD_FIRE) and royal spikes (HAZARD_SPIKES)
    for (let c = 0; c < this.cols; c++) {
      if ((c >= 15 && c <= 20) || (c >= 40 && c <= 46) || (c >= 66 && c <= 72)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_FIRE;
      } else if ((c >= 30 && c <= 33) || (c >= 56 && c <= 58)) {
        this.grid[14][c] = TILE_TYPES.HAZARD_SPIKES;
      } else {
        this.grid[14][c] = TILE_TYPES.RED_BRICK;
      }
    }

    // Section 1: The Golden Gate of Dave
    this.grid[11][5] = TILE_TYPES.RED_BRICK;
    this.grid[11][6] = TILE_TYPES.RED_BRICK;
    this.grid[11][7] = TILE_TYPES.RED_BRICK;
    this.grid[11][8] = TILE_TYPES.RED_BRICK;
    this.grid[10][5] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][6] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[10][7] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[13][10] = TILE_TYPES.COLLECTIBLE_COIN;

    // Moat of Champions (cols 15..20)
    this.grid[12][14] = TILE_TYPES.RED_BRICK;
    this.grid[9][16] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][17] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][17] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[9][18] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][19] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][18] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[11][21] = TILE_TYPES.RED_BRICK;

    // Section 2: Colonnade of Honor & Patrol 1 & 2
    this.grid[13][23] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][24] = TILE_TYPES.ENEMY_SPAWN;
    this.grid[13][26] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][28] = TILE_TYPES.COLLECTIBLE_COIN;

    this.grid[9][29] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][30] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][31] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][32] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][30] = TILE_TYPES.ENEMY_SPAWN; // Royal Colonnade Guard
    this.grid[8][31] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Checkpoint 1
    this.grid[11][35] = TILE_TYPES.RED_BRICK;
    this.grid[10][35] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 35, row: 10, x: 35 * this.tileSize, y: 10 * this.tileSize, activated: false });

    // Section 3: Grand Throne Moat & Patrol 3
    this.grid[10][41] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[10][42] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][41] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;
    this.grid[8][43] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][44] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[7][44] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[11][47] = TILE_TYPES.STEEL_BLOCK;

    this.grid[13][49] = TILE_TYPES.COLLECTIBLE_COIN;
    this.grid[13][50] = TILE_TYPES.ENEMY_SPAWN;

    // Checkpoint 2
    this.grid[12][53] = TILE_TYPES.STEEL_BLOCK;
    this.grid[11][53] = TILE_TYPES.CHECKPOINT;
    this.checkpoints.push({ col: 53, row: 11, x: 53 * this.tileSize, y: 11 * this.tileSize, activated: false });

    // Section 4: Hall of Statues & High Spire Climb
    this.grid[9][56] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][57] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][58] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[8][57] = TILE_TYPES.ENEMY_SPAWN; // Statue Guard
    this.grid[8][58] = TILE_TYPES.COLLECTIBLE_SAPPHIRE;

    this.grid[10][60] = TILE_TYPES.STEEL_BLOCK;
    this.grid[10][61] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][63] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][64] = TILE_TYPES.STEEL_BLOCK;
    this.grid[7][65] = TILE_TYPES.STEEL_BLOCK;

    // Moat 3 hop
    this.grid[6][67] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][68] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[5][68] = TILE_TYPES.COLLECTIBLE_RUBY;
    this.grid[8][73] = TILE_TYPES.STEEL_BLOCK;

    // Section 5: The Emperor's Grand Altar & The Ultimate Golden Trophy
    this.grid[6][76] = TILE_TYPES.STEEL_BLOCK;
    this.grid[6][77] = TILE_TYPES.STEEL_BLOCK;
    this.grid[5][76] = TILE_TYPES.ENEMY_SPAWN; // Elite Emperor Champion
    this.grid[4][79] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][80] = TILE_TYPES.STEEL_BLOCK;
    this.grid[4][81] = TILE_TYPES.STEEL_BLOCK;

    // Imperial Dais
    this.grid[3][82] = TILE_TYPES.STEEL_BLOCK;
    this.grid[3][83] = TILE_TYPES.STEEL_BLOCK;
    this.grid[2][82] = TILE_TYPES.COLLECTIBLE_TROPHY; // The Grand Emperor Trophy!
    this.grid[2][83] = TILE_TYPES.COLLECTIBLE_RUBY;

    // Section 6: Master Campaign Victory Portal
    this.grid[6][85] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[6][86] = TILE_TYPES.WOOD_PLATFORM;
    this.grid[9][88] = TILE_TYPES.STEEL_BLOCK;
    this.grid[9][89] = TILE_TYPES.STEEL_BLOCK;
    this.grid[12][91] = TILE_TYPES.RED_BRICK;
    this.grid[13][92] = TILE_TYPES.COLLECTIBLE_COIN;

    // The Master Victory Exit Door
    this.grid[12][93] = TILE_TYPES.EXIT_DOOR;
    this.grid[13][93] = TILE_TYPES.EXIT_DOOR;
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

  isCheckpoint(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
    return this.grid[row][col] === TILE_TYPES.CHECKPOINT;
  }

  getCheckpoint(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
    return this.checkpoints.find(cp => cp.col === col && cp.row === row) || null;
  }

  activateCheckpoint(col, row) {
    const cp = this.getCheckpoint(col, row);
    if (cp && !cp.activated) {
      cp.activated = true;
      return cp;
    }
    return null;
  }

  isExit(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
    return this.grid[row][col] === TILE_TYPES.EXIT_DOOR;
  }

  render(ctx, camera) {
    const s = this.tileSize;
    this.animTimer += 0.035;

    // 1. Render Themed Parallax Background
    this.renderBackground(ctx, camera);

    const startCol = Math.max(0, Math.floor(camera.x / s));
    const endCol = Math.min(this.cols - 1, Math.ceil((camera.x + camera.viewportWidth) / s));

    // 2. Render Tile Map
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
          case TILE_TYPES.CHECKPOINT:
            this.renderCheckpoint(ctx, x, y, c, r);
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

  /**
   * Themed Parallax Backgrounds
   */
  renderBackground(ctx, camera) {
    const vw = camera.viewportWidth;
    const vh = camera.viewportHeight;

    if (this.levelNumber === 1) {
      // Level 1: Deep Cosmic Vault with Twinkling Starfield & Distant Pillars
      ctx.fillStyle = '#070a16';
      ctx.fillRect(camera.x, 0, vw, vh);

      // Parallax starfield (0.2x scroll)
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 20; i++) {
        const starX = ((i * 53 + 17) - camera.x * 0.2) % (vw + 40);
        const actualX = starX < 0 ? starX + vw + 40 : starX;
        const starY = (i * 29 + 11) % (vh - 40) + 10;
        const twinkle = Math.sin(this.animTimer * 3 + i) > 0.2;
        if (twinkle) {
          ctx.fillRect(camera.x + actualX, starY, 1, 1);
        }
      }

      // Distant Arch Silhouettes (0.3x scroll)
      ctx.fillStyle = '#0e172e';
      for (let i = 0; i < 6; i++) {
        const archX = (i * 120 - camera.x * 0.3) % (vw + 120);
        const actualX = archX < -120 ? archX + vw + 240 : archX;
        ctx.fillRect(camera.x + actualX, 40, 24, vh - 40);
        ctx.fillRect(camera.x + actualX - 8, 40, 40, 8);
      }
    } else if (this.levelNumber === 2) {
      // Level 2: Cyber Factory with Circuit Grids & Industrial Girders
      ctx.fillStyle = '#080c14';
      ctx.fillRect(camera.x, 0, vw, vh);

      // Cyber Grid Lines (0.25x scroll)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.lineWidth = 1;
      const offsetX = (camera.x * 0.25) % 32;
      for (let x = -32; x < vw + 32; x += 32) {
        ctx.beginPath();
        ctx.moveTo(camera.x + x - offsetX, 0);
        ctx.lineTo(camera.x + x - offsetX, vh);
        ctx.stroke();
      }

      // Background Steel Girders (0.35x scroll)
      ctx.fillStyle = '#111827';
      for (let i = 0; i < 5; i++) {
        const girderX = (i * 140 - camera.x * 0.35) % (vw + 140);
        const actualX = girderX < -140 ? girderX + vw + 280 : girderX;
        ctx.fillRect(camera.x + actualX, 30, 16, vh - 30);
        ctx.fillRect(camera.x + actualX - 10, 60, 36, 6);
      }
    } else if (this.levelNumber === 3) {
      // Level 3: Dave Fortress with Obsidian Spires & Rising Embers
      ctx.fillStyle = '#100609';
      ctx.fillRect(camera.x, 0, vw, vh);

      // Distant Fortress Spire Silhouettes (0.25x scroll)
      ctx.fillStyle = '#1f0d14';
      for (let i = 0; i < 5; i++) {
        const spireX = (i * 130 - camera.x * 0.25) % (vw + 130);
        const actualX = spireX < -130 ? spireX + vw + 260 : spireX;
        ctx.fillRect(camera.x + actualX, 20, 28, vh - 20);
        // Spire Roof
        ctx.beginPath();
        ctx.moveTo(camera.x + actualX, 20);
        ctx.lineTo(camera.x + actualX + 14, 4);
        ctx.lineTo(camera.x + actualX + 28, 20);
        ctx.fill();
      }

      // Rising Lava Embers
      for (let i = 0; i < 15; i++) {
        const emberX = ((i * 47 + 23) - camera.x * 0.4) % (vw + 30);
        const actualX = emberX < 0 ? emberX + vw + 30 : emberX;
        const emberY = (vh - ((this.animTimer * 20 + i * 24) % vh));
        ctx.fillStyle = i % 2 === 0 ? '#f97316' : '#facc15';
        ctx.fillRect(camera.x + actualX, emberY, 1, 1);
      }
    } else if (this.levelNumber === 4) {
      // Level 4: Toxic Sewers with Acid Mist & Dripping Chemical Conduits
      ctx.fillStyle = '#06130b';
      ctx.fillRect(camera.x, 0, vw, vh);

      // Distant Sewer Pipes & Grate Silhouettes (0.28x scroll)
      ctx.fillStyle = '#0c2616';
      for (let i = 0; i < 6; i++) {
        const pipeX = (i * 110 - camera.x * 0.28) % (vw + 110);
        const actualX = pipeX < -110 ? pipeX + vw + 220 : pipeX;
        ctx.fillRect(camera.x + actualX, 15, 20, vh - 15);
        ctx.fillRect(camera.x + actualX - 6, 45, 32, 10);
      }

      // Falling Toxic Sludge Droplets
      ctx.fillStyle = '#22c55e';
      for (let i = 0; i < 16; i++) {
        const dropX = ((i * 37 + 19) - camera.x * 0.15) % (vw + 20);
        const actualX = dropX < 0 ? dropX + vw + 20 : dropX;
        const dropY = (this.animTimer * 45 + i * 31) % (vh - 20) + 10;
        ctx.fillRect(camera.x + actualX, dropY, 1, 3);
      }
    } else if (this.levelNumber === 5) {
      // Level 5: Crystal Caverns with Subterranean Indigo & Shimmering Stalactites
      ctx.fillStyle = '#060d1f';
      ctx.fillRect(camera.x, 0, vw, vh);

      // Hanging Geode Stalactites (0.3x scroll)
      ctx.fillStyle = '#111f3d';
      for (let i = 0; i < 8; i++) {
        const stX = (i * 85 - camera.x * 0.3) % (vw + 85);
        const actualX = stX < -85 ? stX + vw + 170 : stX;
        const h = (i % 3 === 0) ? 35 : ((i % 2 === 0) ? 24 : 18);
        ctx.beginPath();
        ctx.moveTo(camera.x + actualX, 0);
        ctx.lineTo(camera.x + actualX + 12, 0);
        ctx.lineTo(camera.x + actualX + 6, h);
        ctx.fill();
      }

      // Sparkle Shimmer Dust (0.35x scroll)
      for (let i = 0; i < 18; i++) {
        const pX = ((i * 49 + 13) - camera.x * 0.35) % (vw + 30);
        const actualX = pX < 0 ? pX + vw + 30 : pX;
        const pY = (i * 27 + 19) % (vh - 40) + 15;
        const pulse = Math.sin(this.animTimer * 4 + i) > 0.3;
        if (pulse) {
          ctx.fillStyle = (i % 2 === 0) ? '#06b6d4' : '#c084fc';
          ctx.fillRect(camera.x + actualX, pY, 2, 2);
        }
      }
    } else if (this.levelNumber === 6) {
      // Level 6: Magma Core with Basalt Chimneys & Thermal Shockwaves
      ctx.fillStyle = '#170406';
      ctx.fillRect(camera.x, 0, vw, vh);

      // Basalt Chimneys (0.28x scroll)
      ctx.fillStyle = '#260a0f';
      for (let i = 0; i < 6; i++) {
        const chX = (i * 125 - camera.x * 0.28) % (vw + 125);
        const actualX = chX < -125 ? chX + vw + 250 : chX;
        ctx.fillRect(camera.x + actualX, 35, 24, vh - 35);
        ctx.fillRect(camera.x + actualX - 4, 30, 32, 6);
      }

      // Intense Rising Heat Sparks
      for (let i = 0; i < 22; i++) {
        const spX = ((i * 41 + 17) - camera.x * 0.45) % (vw + 20);
        const actualX = spX < 0 ? spX + vw + 20 : spX;
        const spY = (vh - ((this.animTimer * 35 + i * 21) % vh));
        ctx.fillStyle = (i % 3 === 0) ? '#ef4444' : ((i % 2 === 0) ? '#f97316' : '#fef08a');
        ctx.fillRect(camera.x + actualX, spY, 1, 2);
      }
    } else if (this.levelNumber === 7) {
      // Level 7: Neo Skyway with High Altitude Clouds & Cyberpunk Towers
      ctx.fillStyle = '#061024';
      ctx.fillRect(camera.x, 0, vw, vh);

      // Layer 1: Distant City Silhouettes (0.15x scroll)
      ctx.fillStyle = '#0d1d3a';
      for (let i = 0; i < 7; i++) {
        const bX = (i * 95 - camera.x * 0.15) % (vw + 95);
        const actualX = bX < -95 ? bX + vw + 190 : bX;
        const bH = 60 + (i % 4) * 25;
        ctx.fillRect(camera.x + actualX, vh - bH, 22, bH);
        // Antennas
        ctx.fillRect(camera.x + actualX + 10, vh - bH - 12, 2, 12);
      }

      // Layer 2: Floating Neon Clouds (0.35x scroll)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      for (let i = 0; i < 5; i++) {
        const cX = ((i * 140 + this.animTimer * 10) - camera.x * 0.35) % (vw + 140);
        const actualX = cX < -140 ? cX + vw + 280 : cX;
        ctx.fillRect(camera.x + actualX, 70 + (i % 3) * 35, 90, 14);
      }
    } else if (this.levelNumber === 8) {
      // Level 8: Shadow Citadel with Midnight Lasers & Surveillance Scanners
      ctx.fillStyle = '#0c0414';
      ctx.fillRect(camera.x, 0, vw, vh);

      // Shadow Citadel Monoliths (0.25x scroll)
      ctx.fillStyle = '#190a26';
      for (let i = 0; i < 5; i++) {
        const mX = (i * 135 - camera.x * 0.25) % (vw + 135);
        const actualX = mX < -135 ? mX + vw + 270 : mX;
        ctx.fillRect(camera.x + actualX, 25, 30, vh - 25);
        ctx.fillRect(camera.x + actualX + 4, 35, 22, 4);
      }

      // Sweeping Laser Scanner Beams
      const scanBeamY = 40 + Math.sin(this.animTimer * 2) * 25;
      ctx.fillStyle = 'rgba(236, 72, 153, 0.09)';
      ctx.fillRect(camera.x, scanBeamY, vw, 4);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(camera.x, scanBeamY + 1, vw, 1);
    } else if (this.levelNumber === 9) {
      // Level 9: Quantum Reactor with Pulsing Plasma Conduits & Flux Particles
      ctx.fillStyle = '#060618';
      ctx.fillRect(camera.x, 0, vw, vh);

      // Vertical Plasma Flux Pillars (0.28x scroll)
      ctx.fillStyle = '#101033';
      for (let i = 0; i < 6; i++) {
        const pX = (i * 115 - camera.x * 0.28) % (vw + 115);
        const actualX = pX < -115 ? pX + vw + 230 : pX;
        ctx.fillRect(camera.x + actualX, 10, 18, vh - 10);

        // Core plasma glow inside pillar
        const coreAlpha = 0.3 + 0.4 * Math.sin(this.animTimer * 5 + i);
        ctx.fillStyle = `rgba(129, 140, 248, ${coreAlpha})`;
        ctx.fillRect(camera.x + actualX + 6, 20, 6, vh - 30);
        ctx.fillStyle = '#101033';
      }

      // Quantum flux particles
      for (let i = 0; i < 20; i++) {
        const qX = ((i * 43 + 29) - camera.x * 0.4) % (vw + 30);
        const actualX = qX < 0 ? qX + vw + 30 : qX;
        const qY = (i * 31 + 7 + Math.sin(this.animTimer * 4 + i) * 12) % (vh - 30) + 15;
        ctx.fillStyle = (i % 2 === 0) ? '#818cf8' : '#38bdf8';
        ctx.fillRect(camera.x + actualX, qY, 1, 1);
      }
    } else {
      // Level 10: The Emperor's Sanctum with Royal Colonnades & Gold Aura
      ctx.fillStyle = '#120d04';
      ctx.fillRect(camera.x, 0, vw, vh);

      // Imperial Golden Colonnades (0.24x scroll)
      ctx.fillStyle = '#261b08';
      for (let i = 0; i < 6; i++) {
        const cX = (i * 120 - camera.x * 0.24) % (vw + 120);
        const actualX = cX < -120 ? cX + vw + 240 : cX;
        ctx.fillRect(camera.x + actualX, 15, 24, vh - 15);
        ctx.fillRect(camera.x + actualX - 6, 15, 36, 6);
        ctx.fillRect(camera.x + actualX - 4, 45, 32, 4);
      }

      // Royal Golden Light Pillars (0.35x scroll)
      for (let i = 0; i < 4; i++) {
        const lX = (i * 170 - camera.x * 0.35) % (vw + 170);
        const actualX = lX < -170 ? lX + vw + 340 : lX;
        const pulse = 0.08 + 0.06 * Math.sin(this.animTimer * 3 + i);
        ctx.fillStyle = `rgba(250, 204, 21, ${pulse})`;
        ctx.fillRect(camera.x + actualX, 0, 32, vh);
      }

      // Rising Imperial Gold Dust
      for (let i = 0; i < 18; i++) {
        const dX = ((i * 47 + 11) - camera.x * 0.3) % (vw + 30);
        const actualX = dX < 0 ? dX + vw + 30 : dX;
        const dY = (vh - ((this.animTimer * 18 + i * 22) % vh));
        ctx.fillStyle = (i % 2 === 0) ? '#facc15' : '#fef08a';
        ctx.fillRect(camera.x + actualX, dY, 1, 1);
      }
    }
  }

  /**
   * 3D Beveled Red Brick
   */
  renderRedBrick(ctx, x, y) {
    const s = this.tileSize;
    // Brick Base Body
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(x, y, s, s);

    // Top Highlight Lip
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 1, y, s - 1, 2);
    ctx.fillRect(x + 1, y + 8, s - 1, 1);

    // Brick Texture Fills
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(x + 1, y + 2, 6, 5);
    ctx.fillRect(x + 8, y + 2, 7, 5);
    ctx.fillRect(x + 1, y + 9, 14, 5);

    // Dark Mortar Seams
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(x, y + 7, s, 1);
    ctx.fillRect(x, y + 15, s, 1);
    ctx.fillRect(x + 7, y, 1, 7);
    ctx.fillRect(x, y, 1, s);
  }

  /**
   * High-Tech Metallic Steel Block
   */
  renderSteelBlock(ctx, x, y) {
    const s = this.tileSize;
    // Dark Frame
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, s, s);

    // Chrome Face
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 1, y + 1, s - 2, s - 2);

    // Top & Left Chrome Highlights
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 1, y + 1, s - 2, 1);
    ctx.fillRect(x + 1, y + 1, 1, s - 2);

    // Bottom & Right Shadows
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 1, y + s - 2, s - 2, 1);
    ctx.fillRect(x + s - 2, y + 1, 1, s - 2);

    // Center Metallic Ventilation Louvers
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 4, y + 5, s - 8, 1);
    ctx.fillRect(x + 4, y + 8, s - 8, 1);
    ctx.fillRect(x + 4, y + 11, s - 8, 1);

    // Corner Hex Rivets
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 2, y + 2, 1, 1);
    ctx.fillRect(x + s - 3, y + 2, 1, 1);
    ctx.fillRect(x + 2, y + s - 3, 1, 1);
    ctx.fillRect(x + s - 3, y + s - 3, 1, 1);
  }

  /**
   * Polished Hardwood Platform
   */
  renderWoodPlatform(ctx, x, y) {
    const s = this.tileSize;
    // Wood Planks Base
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x, y, s, s);

    // Polished Amber Top Lip
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x, y, s, 2);

    // Grain Texture
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x, y + 3, s, 3);
    ctx.fillRect(x, y + 8, s, 3);

    // Gold Trim Brackets
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 1, y + 1, 2, 2);
    ctx.fillRect(x + s - 3, y + 1, 2, 2);

    // Deep Base Shadow
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, y + s - 2, s, 2);
  }

  /**
   * Dynamic 4-Frame Roaring Flame Hazards
   */
  renderHazardFire(ctx, x, y) {
    const s = this.tileSize;
    const flameFrame = Math.floor(this.animTimer * 12) % 4;

    // Fire Pit Hearth
    ctx.fillStyle = '#292524';
    ctx.fillRect(x, y + 12, s, 4);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 1, y + 12, s - 2, 2);

    // Outer Red Roar
    ctx.fillStyle = '#dc2626';
    if (flameFrame === 0) {
      ctx.fillRect(x + 1, y + 4, 4, 9);
      ctx.fillRect(x + 6, y + 2, 4, 11);
      ctx.fillRect(x + 11, y + 5, 4, 8);
    } else if (flameFrame === 1) {
      ctx.fillRect(x + 2, y + 2, 4, 11);
      ctx.fillRect(x + 7, y + 5, 4, 8);
      ctx.fillRect(x + 11, y + 3, 4, 10);
    } else if (flameFrame === 2) {
      ctx.fillRect(x + 1, y + 5, 4, 8);
      ctx.fillRect(x + 6, y + 1, 4, 12);
      ctx.fillRect(x + 10, y + 4, 4, 9);
    } else {
      ctx.fillRect(x + 2, y + 3, 4, 10);
      ctx.fillRect(x + 6, y + 4, 4, 9);
      ctx.fillRect(x + 11, y + 2, 4, 11);
    }

    // Mid Orange Core
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 2, y + 6, 3, 7);
    ctx.fillRect(x + 7, y + 5, 3, 8);
    ctx.fillRect(x + 11, y + 7, 3, 6);

    // White-Hot Yellow Heart
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 3, y + 8, 2, 5);
    ctx.fillRect(x + 8, y + 7, 2, 6);
  }

  /**
   * Razor Chrome Spikes with Caution Base
   */
  renderHazardSpikes(ctx, x, y) {
    const s = this.tileSize;

    // Caution Striped Base (Yellow & Black)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x, y + 13, s, 3);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 2, y + 13, 2, 3);
    ctx.fillRect(x + 7, y + 13, 2, 3);
    ctx.fillRect(x + 12, y + 13, 2, 3);

    // 3 Razor Sharp Chrome Spikes
    for (let i = 0; i < 3; i++) {
      const sx = x + i * 5 + 1;
      // Shadow / Back Edge
      ctx.fillStyle = '#475569';
      ctx.fillRect(sx + 0, y + 8, 5, 5);
      ctx.fillRect(sx + 1, y + 5, 3, 3);
      ctx.fillRect(sx + 2, y + 2, 1, 3);

      // Chrome Reflection Highlight
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(sx + 1, y + 6, 1, 6);
      ctx.fillRect(sx + 2, y + 2, 1, 2);
    }
  }

  /**
   * 6-Frame Animated Spinning Gold Coin with Bobbing
   */
  renderCollectibleCoin(ctx, x, y) {
    const bob = Math.sin(this.animTimer * 5) * 1.5;
    const cy = y + 4 + bob;
    const frame = Math.floor(this.animTimer * 10) % 6;

    // Outer Gold Rim
    ctx.fillStyle = '#ca8a04';
    if (frame === 0 || frame === 3) {
      // Full Face View
      ctx.fillRect(x + 4, cy, 8, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 5, cy + 1, 6, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 6, cy + 2, 2, 3);
    } else if (frame === 1 || frame === 5) {
      // 3/4 Perspective View
      ctx.fillRect(x + 5, cy, 6, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 6, cy + 1, 4, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 7, cy + 2, 1, 3);
    } else {
      // Edge-On View
      ctx.fillRect(x + 7, cy, 2, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 7, cy + 1, 2, 6);
    }
  }

  /**
   * Faceted Ruby Gem with Sparkle Glint
   */
  renderCollectibleRuby(ctx, x, y) {
    const bob = Math.sin(this.animTimer * 5 + 1) * 1.5;
    const gy = y + 3 + bob;

    // Dark Facet Base
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(x + 5, gy + 1, 6, 2);
    ctx.fillRect(x + 3, gy + 3, 10, 4);
    ctx.fillRect(x + 5, gy + 7, 6, 2);
    ctx.fillRect(x + 7, gy + 9, 2, 1);

    // Crimson Facet Center
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 5, gy + 3, 6, 4);
    ctx.fillRect(x + 6, gy + 2, 4, 1);

    // Diamond Glint Sparkle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 5, gy + 3, 2, 2);
  }

  /**
   * Faceted Sapphire Diamond with Sparkle Glint
   */
  renderCollectibleSapphire(ctx, x, y) {
    const bob = Math.sin(this.animTimer * 5 + 2) * 1.5;
    const gy = y + 3 + bob;

    // Dark Cobalt Base
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(x + 5, gy + 1, 6, 2);
    ctx.fillRect(x + 3, gy + 3, 10, 4);
    ctx.fillRect(x + 5, gy + 7, 6, 2);
    ctx.fillRect(x + 7, gy + 9, 2, 1);

    // Cyan Crystal Center
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 5, gy + 3, 6, 4);
    ctx.fillRect(x + 6, gy + 2, 4, 1);

    // White Star Reflection
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 5, gy + 3, 2, 2);
  }

  /**
   * Grand Golden Trophy (Radiant Pulsating Halo)
   */
  renderCollectibleTrophy(ctx, x, y) {
    const pulse = (Math.sin(this.animTimer * 6) + 1) * 0.5;

    // Radiant Aura Glow
    ctx.fillStyle = pulse > 0.4 ? 'rgba(250, 204, 21, 0.25)' : 'rgba(250, 204, 21, 0.1)';
    ctx.fillRect(x - 2, y - 2, 20, 18);

    // Golden Chalice Body
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(x + 2, y + 1, 12, 5);
    ctx.fillRect(x + 4, y + 6, 8, 3);
    ctx.fillRect(x + 6, y + 9, 4, 3);
    ctx.fillRect(x + 3, y + 12, 10, 3);

    // Golden Handles
    ctx.fillRect(x + 0, y + 2, 2, 4);
    ctx.fillRect(x + 14, y + 2, 2, 4);

    // Brilliant Gold Face
    ctx.fillStyle = pulse > 0.5 ? '#fef08a' : '#facc15';
    ctx.fillRect(x + 4, y + 2, 8, 3);
    ctx.fillRect(x + 5, y + 5, 6, 2);
    ctx.fillRect(x + 4, y + 13, 8, 1);

    // Royal Ruby Jewel in Cup Center
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 7, y + 3, 2, 2);
  }

  /**
   * Animated Dimensional Exit Portal (Locked vs Unlocked)
   */
  renderExitDoor(ctx, x, y) {
    const w = this.tileSize;
    const h = this.tileSize * 2;

    if (this.hasTrophy) {
      // UNLOCKED: Swirling Animated Neon Portal
      const vortexFrame = Math.floor(this.animTimer * 10) % 4;

      // Golden Archway Frame
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 1, y, w - 2, h);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 2, y + 1, w - 4, 2);

      // Deep Void Center
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 3, y + 3, w - 6, h - 3);

      // Swirling Cyan/Magenta Vortex Core
      ctx.fillStyle = vortexFrame % 2 === 0 ? '#06b6d4' : '#a855f7';
      ctx.fillRect(x + 5, y + 8, 6, 14);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 6, y + 11, 4, 8);

      // Radiant White Core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 7, y + 13, 2, 4);
    } else {
      // LOCKED: Iron Portcullis with Red Warning Padlock
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 1, y, w - 2, h);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 3, y + 3, w - 6, h - 3);

      // Vertical Iron Bars
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 5, y + 4, 1, h - 4);
      ctx.fillRect(x + 8, y + 4, 1, h - 4);
      ctx.fillRect(x + 11, y + 4, 1, h - 4);

      // Glowing Red Warning Lock
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 6, y + 13, 5, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 8, y + 14, 1, 2);
    }
  }

  /**
   * Cyber-Flag Checkpoint Beacon (Inactive vs Active)
   */
  renderCheckpoint(ctx, x, y, col, row) {
    const cp = this.getCheckpoint(col, row);
    const isActivated = cp ? cp.activated : false;
    const s = this.tileSize;

    // Base Stand (Dark steel bracket)
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 2, y + 13, s - 4, 3);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 4, y + 12, s - 8, 1);

    // Vertical Chrome Pole
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 4, y + 1, 2, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 4, y + 1, 1, 12);

    // Top Beacon Light & Banner
    if (isActivated) {
      const pulse = (Math.sin(this.animTimer * 8) + 1) * 0.5;
      ctx.fillStyle = pulse > 0.4 ? '#4ade80' : '#22c55e';
      ctx.fillRect(x + 3, y - 1, 4, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4, y, 2, 1);

      // Cyber Beacon Light Ray
      ctx.fillStyle = 'rgba(74, 222, 128, 0.18)';
      ctx.fillRect(x + 1, y - 6, 8, 6);

      // Glowing Active Emerald Flag Banner (Waving)
      const wave = Math.floor(this.animTimer * 8) % 3;
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(x + 6, y + 2, 8, 6);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x + 6, y + 2, 7, 5);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(x + 7 + wave, y + 4, 3, 2);
    } else {
      // Unactivated Dim Slate/Cyan Flag
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 3, y - 1, 4, 3);
      ctx.fillStyle = '#334155';
      ctx.fillRect(x + 6, y + 2, 8, 6);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 6, y + 2, 7, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 7, y + 4, 2, 2);
    }
  }
}
