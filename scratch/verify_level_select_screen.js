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
    clip: () => commands.push({ type: 'clip' }),
    rect: (x, y, w, h) => commands.push({ type: 'rect', x, y, w, h }),
    arc: (x, y, r, sa, ea) => commands.push({ type: 'arc', x, y, r, sa, ea }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} })
  };

  return {
    canvas: { width: 400, height: 240, getContext: () => ctx },
    ctx,
    commands
  };
}

console.log("--- Verifying Level Select Screen (10 Missions Layout & Carousel) ---");
const { canvas, ctx, commands } = createMockCanvas();
const game = new Game();
game.canvas = canvas;
game.ctx = ctx;

// Navigate to LEVEL_SELECT
game.executeButtonAction('levels');
game.ui.update(1.0); // complete animation

// Render Level Select
game.render();

const fillTexts = commands.filter(c => c.type === 'fillText');
console.log(`Rendered ${fillTexts.length} text elements on Level Select screen:`);
fillTexts.forEach(t => {
  console.log(`  [y=${t.y.toFixed(1)}, x=${t.x.toFixed(1)}] "${t.text}" (font: ${t.font}, col: ${t.fill})`);
});

// Check header
const selectMissionText = fillTexts.find(t => t.text === 'SELECT MISSION');
if (!selectMissionText) throw new Error("Missing 'SELECT MISSION' header!");
console.log("✔ Header 'SELECT MISSION' found.");

// Check top track chips (should have chips for 01..10)
for (let i = 1; i <= 10; i++) {
  const pad = String(i).padStart(2, '0');
  const chip = fillTexts.find(t => t.text.includes(pad));
  if (!chip) throw new Error(`Missing track chip for level ${pad}`);
}
console.log("✔ All 10 mission track chips (01 to 10) rendered on track!");

// Check cards (Level 1, 2, 3 should be visible initially)
const cardLvl1 = fillTexts.find(t => t.text.includes('THE LOST VAULT'));
const cardLvl2 = fillTexts.find(t => t.text.includes('CYBER FACTORY'));
const cardLvl3 = fillTexts.find(t => t.text.includes('DAVE FORTRESS'));
if (!cardLvl1 || !cardLvl2 || !cardLvl3) throw new Error("Initial 3 cards not rendered!");
console.log("✔ Initial carousel cards for Levels 1, 2, 3 rendered successfully!");

// Now test sliding carousel to Level 7
game.selectedLevelIndex = 6; // Level 7 (0-indexed 6)
commands.length = 0;
game.render();

const fillTextsLvl7 = commands.filter(c => c.type === 'fillText');
const cardLvl7 = fillTextsLvl7.find(t => t.text.includes('NEO SKYWAY'));
if (!cardLvl7) throw new Error("Sliding carousel did not display Level 7 (NEO SKYWAY)!");
console.log("✔ Carousel successfully slid and rendered Level 7: NEO SKYWAY!");

// Now test sliding carousel to Level 10
game.selectedLevelIndex = 9; // Level 10 (0-indexed 9)
commands.length = 0;
game.render();

const fillTextsLvl10 = commands.filter(c => c.type === 'fillText');
const cardLvl10 = fillTextsLvl10.find(t => t.text.includes("EMPEROR'S SANCTUM"));
if (!cardLvl10) throw new Error("Sliding carousel did not display Level 10 (EMPEROR'S SANCTUM)!");
console.log("✔ Carousel successfully slid and rendered Level 10: EMPEROR'S SANCTUM!");

console.log("\n🎉 LEVEL SELECT SCREEN FULLY VERIFIED!");
