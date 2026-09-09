import { Game, GameState } from '../src/main.js';

function createMockCanvas() {
  const commands = [];
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    globalAlpha: 1.0,
    shadowColor: '',
    shadowBlur: 0,
    fillRect: (x, y, w, h) => commands.push({ type: 'fillRect', x, y, w, h, fill: ctx.fillStyle, alpha: ctx.globalAlpha }),
    strokeRect: (x, y, w, h) => commands.push({ type: 'strokeRect', x, y, w, h, stroke: ctx.strokeStyle }),
    fillText: (text, x, y) => commands.push({ type: 'fillText', text, x, y, font: ctx.font, fill: ctx.fillStyle, align: ctx.textAlign, alpha: ctx.globalAlpha }),
    strokeText: (text, x, y) => commands.push({ type: 'strokeText', text, x, y }),
    measureText: (text) => ({ width: text.length * 6 }),
    save: () => commands.push({ type: 'save' }),
    restore: () => commands.push({ type: 'restore' }),
    translate: (x, y) => commands.push({ type: 'translate', x, y }),
    scale: (sx, sy) => commands.push({ type: 'scale', sx, sy }),
    beginPath: () => commands.push({ type: 'beginPath' }),
    moveTo: (x, y) => commands.push({ type: 'moveTo', x, y }),
    lineTo: (x, y) => commands.push({ type: 'lineTo', x, y }),
    stroke: () => commands.push({ type: 'stroke' }),
    fill: () => commands.push({ type: 'fill' }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} })
  };

  return {
    canvas: { width: 400, height: 240, getContext: () => ctx },
    ctx,
    commands
  };
}

console.log('--- 1. Testing Level Load (Should show ONLY Level Intro, NO duplicate toast banner) ---');
const { canvas, ctx, commands } = createMockCanvas();
const game = new Game();
game.canvas = canvas;
game.ctx = ctx;

game.loadLevel(1);
game.gameState = GameState.PLAYING;
game.render();

const fillTexts = commands.filter(c => c.type === 'fillText').map(c => c.text);
console.log('Rendered text items at Level 1 start:');
fillTexts.forEach(t => console.log(`  -> "${t}"`));

if (fillTexts.includes('LEVEL 1: FIND TROPHY & GO TO EXIT!')) {
  console.error('❌ Duplicate banner "LEVEL 1: FIND TROPHY & GO TO EXIT!" is still colliding with Level Intro card!');
  process.exit(1);
}

if (!fillTexts.includes('MISSION 01: THE LOST VAULT')) {
  console.error('❌ Level intro card missing!');
  process.exit(1);
}

console.log('✅ Level 1 load shows single clean Mission Intro card with zero collision.');

console.log('\n--- 2. Testing In-Game Toast (e.g. Exit Door locked feedback) ---');
// Advance time past level intro
game.ui.levelIntroTimer = 0;
commands.length = 0;
game.messageBanner = 'FIND THE GOLDEN TROPHY TO OPEN EXIT!';
game.messageTimer = 2.5;
game.render();

const toastTexts = commands.filter(c => c.type === 'fillText').map(c => c.text);
console.log('Rendered text items during locked door toast:');
toastTexts.forEach(t => console.log(`  -> "${t}"`));

if (!toastTexts.includes('FIND THE GOLDEN TROPHY TO OPEN EXIT!')) {
  console.error('❌ Toast message not rendered!');
  process.exit(1);
}

const toastRect = commands.find(c => c.type === 'fillRect' && c.w === 320 && c.h === 18);
if (!toastRect || toastRect.y !== 24) {
  console.error('❌ Toast message rectangle not positioned at y=24!');
  process.exit(1);
}

console.log(`✅ Toast banner rendered cleanly at y=${toastRect.y} with no collision.`);
