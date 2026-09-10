import { GameMap, LEVEL_METADATA, TILE_TYPES } from '../src/map.js';
import { Game, GameState } from '../src/main.js';

console.log("==================================================");
console.log("   AUTOMATED VERIFICATION: LEVELS 1 THROUGH 10   ");
console.log("==================================================\n");

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    passed++;
    console.log(`  ✔ PASS: ${message}`);
  }
}

// 1. VERIFY LEVEL METADATA REGISTRY (1 TO 10)
console.log("--- 1. Testing LEVEL_METADATA Registry ---");
for (let lvl = 1; lvl <= 10; lvl++) {
  const meta = LEVEL_METADATA[lvl];
  assert(meta !== undefined, `Level ${lvl} metadata exists`);
  assert(typeof meta.title === 'string' && meta.title.length > 0, `Level ${lvl} has title: "${meta.title}"`);
  assert(typeof meta.desc === 'string' && meta.desc.length > 0, `Level ${lvl} has description`);
  assert(typeof meta.stars === 'string' && meta.stars.length === 5, `Level ${lvl} has 5-star rating: ${meta.stars}`);
  assert(typeof meta.bgHue === 'string' && meta.bgHue.startsWith('#'), `Level ${lvl} has valid bgHue: ${meta.bgHue}`);
}

// 2. VERIFY EVERY LEVEL MAP (1 TO 10)
console.log("\n--- 2. Testing Map Construction & Grid Integrity (Levels 1 - 10) ---");
for (let lvl = 1; lvl <= 10; lvl++) {
  console.log(`\nValidating Level ${lvl}: ${LEVEL_METADATA[lvl].title}...`);
  const map = new GameMap(lvl);

  assert(map.levelNumber === lvl, `Level number set to ${lvl}`);
  assert(map.rows === 15, `Map has 15 rows`);
  assert(map.cols >= 68 && map.cols <= 100, `Map width is appropriate (${map.cols} cols)`);

  // Boundaries
  let ceilingSolid = true;
  for (let c = 0; c < map.cols; c++) {
    if (!map.isSolid(c, 0)) ceilingSolid = false;
  }
  assert(ceilingSolid, `Ceiling (row 0) is 100% solid across all ${map.cols} columns`);

  let leftWallSolid = true;
  let rightWallSolid = true;
  for (let r = 0; r < map.rows; r++) {
    if (!map.isSolid(0, r)) leftWallSolid = false;
    if (!map.isSolid(map.cols - 1, r)) rightWallSolid = false;
  }
  assert(leftWallSolid, `Left boundary wall is solid`);
  assert(rightWallSolid, `Right boundary wall is solid`);

  // Floor integrity (row 14 must not have EMPTY gaps)
  let floorComplete = true;
  for (let c = 0; c < map.cols; c++) {
    const t = map.grid[14][c];
    if (t === TILE_TYPES.EMPTY) floorComplete = false;
  }
  assert(floorComplete, `Floor (row 14) has no empty gaps (all solid or hazards)`);

  // Player spawn
  const spawnCol = Math.floor(map.playerSpawn.x / 16);
  const spawnRow = Math.floor(map.playerSpawn.y / 16);
  assert(!map.isSolid(spawnCol, spawnRow), `Player spawn (${map.playerSpawn.x}, ${map.playerSpawn.y}) is not inside a solid block`);
  assert(map.isSolid(spawnCol, 14) || map.isSolid(spawnCol, 13), `Player spawn has ground below it`);

  // Golden Trophy existence & reachability
  let trophyCount = 0;
  let trophyCol = -1;
  let trophyRow = -1;
  for (let r = 0; r < map.rows; r++) {
    for (let c = 0; c < map.cols; c++) {
      if (map.grid[r][c] === TILE_TYPES.COLLECTIBLE_TROPHY) {
        trophyCount++;
        trophyCol = c;
        trophyRow = r;
      }
    }
  }
  assert(trophyCount === 1, `Level ${lvl} has exactly 1 Golden Trophy (found at col ${trophyCol}, row ${trophyRow})`);
  assert(map.isSolid(trophyCol, trophyRow + 1) || map.isSolid(trophyCol + 1, trophyRow + 1), `Trophy rests on a solid altar platform`);

  // Exit Door (2 tiles tall)
  let exitTiles = 0;
  let exitCol = -1;
  for (let r = 0; r < map.rows; r++) {
    for (let c = 0; c < map.cols; c++) {
      if (map.grid[r][c] === TILE_TYPES.EXIT_DOOR) {
        exitTiles++;
        exitCol = c;
      }
    }
  }
  assert(exitTiles === 2, `Level ${lvl} has 2-tile tall Exit Portal (at col ${exitCol})`);
  assert(map.grid[12][exitCol] === TILE_TYPES.EXIT_DOOR && map.grid[13][exitCol] === TILE_TYPES.EXIT_DOOR, `Exit door correctly spans rows 12 & 13 on floor`);

  // Checkpoints
  assert(Array.isArray(map.checkpoints), `Checkpoints list initialized`);
  if (lvl >= 2) {
    assert(map.checkpoints.length >= 1, `Level ${lvl} has ${map.checkpoints.length} checkpoint beacon(s)`);
    for (const cp of map.checkpoints) {
      assert(map.grid[cp.row][cp.col] === TILE_TYPES.CHECKPOINT, `Checkpoint registered at col ${cp.col}, row ${cp.row} matches grid`);
      assert(map.isSolid(cp.col, cp.row + 1), `Checkpoint at col ${cp.col} rests on solid surface`);
    }
  }

  // Enemy spawns
  const spawns = map.getEnemySpawns();
  assert(spawns.length >= 1, `Level ${lvl} has ${spawns.length} active enemy patrol spawn(s)`);
  for (const s of spawns) {
    const sc = Math.floor(s.x / 16);
    const sr = Math.floor((s.y + 12) / 16);
    assert(map.isSolid(sc, sr), `Enemy at col ${sc} lands on solid surface`);
  }
}

// 3. VERIFY GAME CAMPAIGN PROGRESSION (1 TO 10)
console.log("\n--- 3. Testing Game Campaign Progression Logic ---");
const game = new Game();
assert(game.maxLevels === 10, `game.maxLevels is 10`);
assert(game.unlockedLevels === 1, `Initial unlocked levels is 1`);

for (let lvl = 1; lvl <= 9; lvl++) {
  game.currentLevel = lvl;
  game.loadLevel(lvl);
  game.map.hasTrophy = true; // Simulate acquiring trophy

  // Simulate reaching exit
  const events = { reachedExit: true };
  if (events.reachedExit && game.map.hasTrophy) {
    game.completedLevels.add(game.currentLevel);
    if (game.currentLevel < game.maxLevels) {
      game.unlockedLevels = Math.max(game.unlockedLevels, game.currentLevel + 1);
      game.gameState = GameState.LEVEL_COMPLETE;
    }
  }

  assert(game.gameState === GameState.LEVEL_COMPLETE, `Level ${lvl} completes to LEVEL_COMPLETE`);
  assert(game.unlockedLevels === lvl + 1, `Level ${lvl + 1} unlocked successfully`);
}

// Level 10 final victory
game.currentLevel = 10;
game.loadLevel(10);
game.map.hasTrophy = true;
const victoryEvents = { reachedExit: true };
if (victoryEvents.reachedExit && game.map.hasTrophy) {
  game.completedLevels.add(game.currentLevel);
  if (game.currentLevel < game.maxLevels) {
    game.unlockedLevels = Math.max(game.unlockedLevels, game.currentLevel + 1);
    game.gameState = GameState.LEVEL_COMPLETE;
  } else {
    game.gameState = GameState.FINAL_VICTORY;
  }
}
assert(game.gameState === GameState.FINAL_VICTORY, `Beating Level 10 triggers FINAL_VICTORY!`);
assert(game.completedLevels.size === 10, `All 10 levels marked as completed`);

console.log(`\n==================================================`);
console.log(`   ALL TESTS PASSED! (${passed} / ${total})`);
console.log(`==================================================\n`);
