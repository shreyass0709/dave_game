import { GameMap } from '../src/map.js';
import { Player, PlayerState } from '../src/player.js';
import { PhysicsEngine } from '../src/physics.js';

class MockInput {
  constructor() {
    this.left = false;
    this.right = false;
    this.jump = false;
    this.jumpJustPressed = false;
  }
  isLeft() { return this.left; }
  isRight() { return this.right; }
  isJump() { return this.jump; }
  wasJumpJustPressed() { return this.jumpJustPressed; }
  clearFrame() { this.jumpJustPressed = false; }
}

function verifyTrophyJump() {
  console.log("=== VERIFYING TROPHY JUMP ROUTE IN LEVEL 1 ===");
  const map = new GameMap(1);
  const physics = new PhysicsEngine(map);
  const input = new MockInput();
  const dt = 1 / 60;

  // 1. Place Dave on the red brick platform at col 57, row 12 (as shown in user's screenshot)
  const player = new Player(57 * 16 + 2, 12 * 16 - 15); // x = 914, y = 177
  player.isGrounded = true;

  console.log(`Initial position on right platform: x=${player.x}, y=${player.y}, grounded=${player.isGrounded}`);

  // 2. Jump LEFT towards the wood platform at col 54, row 9 (top at y = 144)
  input.left = true;
  input.jump = true;
  input.jumpJustPressed = true;

  let reachedWoodPlatform = false;
  for (let f = 0; f < 60; f++) {
    player.handleInput(input, dt);
    physics.update(player, dt);
    player.updateAnimation(dt);
    input.clearFrame();

    // Check if player landed on wood platform (row 9, y = 144 - 15 = 129)
    if (player.isGrounded && player.y === 129 && player.x >= 53 * 16 && player.x <= 55 * 16) {
      reachedWoodPlatform = true;
      console.log(`[Step 1] Successfully landed on Wood Platform at frame ${f}: x=${player.x.toFixed(1)}, y=${player.y.toFixed(1)}`);
      break;
    }
  }

  if (!reachedWoodPlatform) {
    throw new Error(`Failed Step 1: Could not land on wood platform at row 9! Player final pos: x=${player.x}, y=${player.y}, grounded=${player.isGrounded}`);
  }

  // 3. Jump LEFT towards the Steel Trophy Altar at col 51, row 6 (top at y = 96)
  input.left = true;
  input.jump = true;
  input.jumpJustPressed = true;

  let collectedTrophy = false;
  for (let f = 0; f < 60; f++) {
    player.handleInput(input, dt);
    const events = physics.update(player, dt);
    player.updateAnimation(dt);
    input.clearFrame();

    if (events.collectedItems && events.collectedItems.some(item => item.type === 'TROPHY')) {
      collectedTrophy = true;
      console.log(`[Step 2] Successfully COLLECTED GOLDEN TROPHY at frame ${f}: x=${player.x.toFixed(1)}, y=${player.y.toFixed(1)}!`);
      break;
    }
  }

  if (!collectedTrophy) {
    throw new Error(`Failed Step 2: Could not collect Golden Trophy! Player pos: x=${player.x}, y=${player.y}`);
  }

  console.log("🎉 TROPHY JUMP ROUTE FULLY VERIFIED!");
}

verifyTrophyJump();
