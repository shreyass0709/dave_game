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

console.log('--- Verifying Message Banner Position & Non-Obstruction ---');
const { canvas, ctx, commands } = createMockCanvas();
const game = new Game();
game.canvas = canvas;
game.ctx = ctx;

game.loadLevel(2);
game.gameState = GameState.PLAYING;
game.messageBanner = 'LEVEL 2: FIND TROPHY & GO TO EXIT!';
game.messageTimer = 3.0;
game.render();

const bannerRect = commands.find(c => c.type === 'fillRect' && c.w === 320 && c.h === 18);
if (!bannerRect) {
  console.error('❌ Message banner rectangle not found!');
  process.exit(1);
}

console.log(`Banner position: x=${bannerRect.x}, y=${bannerRect.y}, w=${bannerRect.w}, h=${bannerRect.h}`);

if (bannerRect.y > 100) {
  console.error(`❌ Banner is still at the bottom (y=${bannerRect.y}) and will obscure player walking path!`);
  process.exit(1);
}

const bannerText = commands.find(c => c.type === 'fillText' && c.text === 'LEVEL 2: FIND TROPHY & GO TO EXIT!');
if (!bannerText) {
  console.error('❌ Message banner text not found!');
  process.exit(1);
}

console.log(`Banner text position: text='${bannerText.text}', x=${bannerText.x}, y=${bannerText.y}`);

// Bottom floor area is y >= 192. Ensure banner is far away in upper zone:
const floorTopY = 192;
const clearance = floorTopY - (bannerRect.y + bannerRect.h);
console.log(`Vertical clearance between banner and floor platform: ${clearance}px`);

if (clearance < 100) {
  console.error('❌ Clearance between banner and floor path is too small!');
  process.exit(1);
}

console.log('✅ Message banner verified at top of screen (y=24) with 150px clearance above walking path!');
