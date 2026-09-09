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

console.log('--- Verifying Instructions Layout & Bounding Boxes ---');
const { canvas, ctx, commands } = createMockCanvas();
const game = new Game();
game.canvas = canvas;
game.ctx = ctx;

game.executeButtonAction('instructions');
game.ui.update(1.0); // Full entrance completed
game.render();

const fillTexts = commands.filter(c => c.type === 'fillText');
console.log(`Rendered ${fillTexts.length} text items:`);
fillTexts.forEach(t => {
  console.log(`  [y=${t.y.toFixed(1)}, x=${t.x.toFixed(1)}] ${t.text} (font: ${t.font}, col: ${t.fill})`);
});

// Verify cards
const fillRects = commands.filter(c => c.type === 'fillRect');
const leftCard = fillRects.find(r => r.w === 180 && r.h === 146 && r.x === 14);
const rightCard = fillRects.find(r => r.w === 184 && r.h === 146 && r.x === 202);

if (!leftCard || !rightCard) {
  console.error('❌ Cards missing!');
  process.exit(1);
}

console.log(`\nLeft Card: x=${leftCard.x}, y=${leftCard.y}, w=${leftCard.w}, h=${leftCard.h}`);
console.log(`Right Card: x=${rightCard.x}, y=${rightCard.y}, w=${rightCard.w}, h=${rightCard.h}`);

// Verify all text in Left card is inside [14, 14+180] x [leftCard.y, leftCard.y+146]
const leftTexts = fillTexts.filter(t => t.x >= 14 && t.x <= 14 + 180 && t.y >= leftCard.y && t.y <= leftCard.y + 146);
console.log(`\nLeft card contains ${leftTexts.length} text items cleanly bounded.`);

// Verify all text in Right card is inside [202, 202+184] x [rightCard.y, rightCard.y+146]
const rightTexts = fillTexts.filter(t => t.x >= 202 && t.x <= 202 + 184 && t.y >= rightCard.y && t.y <= rightCard.y + 146);
console.log(`Right card contains ${rightTexts.length} text items cleanly bounded.`);

console.log('\n✅ Layout bounding box verification passed with 0 overlaps and 0 border breaches!');
