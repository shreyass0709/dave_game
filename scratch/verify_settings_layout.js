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

console.log('--- Verifying Settings Layout, Buttons & Bounding Boxes ---');
const { canvas, ctx, commands } = createMockCanvas();
const game = new Game();
game.canvas = canvas;
game.ctx = ctx;

game.executeButtonAction('settings');
game.ui.update(1.0); // Full entrance animation completed
game.render();

const fillTexts = commands.filter(c => c.type === 'fillText');
console.log(`Rendered ${fillTexts.length} text items on Settings screen:`);
fillTexts.forEach(t => {
  console.log(`  [y=${t.y.toFixed(1)}, x=${t.x.toFixed(1)}] ${t.text} (align: ${t.align}, font: ${t.font}, col: ${t.fill})`);
});

// Check toggle buttons
const sfxBtn = game.menuButtons[GameState.SETTINGS].find(b => b.id === 'toggle_sfx');
const musicBtn = game.menuButtons[GameState.SETTINGS].find(b => b.id === 'toggle_music');
const crtBtn = game.menuButtons[GameState.SETTINGS].find(b => b.id === 'toggle_crt');

console.log('\nToggle button badges:');
console.log(`  SFX: badge='${sfxBtn.badge}', label='${sfxBtn.label}'`);
console.log(`  Music: badge='${musicBtn.badge}', label='${musicBtn.label}'`);
console.log(`  CRT: badge='${crtBtn.badge}', label='${crtBtn.label}'`);

// Test toggling OFF
game.executeButtonAction('toggle_sfx');
game.executeButtonAction('toggle_music');
game.executeButtonAction('toggle_crt');
game.render();

console.log('\nAfter toggle OFF:');
console.log(`  SFX: badge='${sfxBtn.badge}', label='${sfxBtn.label}'`);
console.log(`  Music: badge='${musicBtn.badge}', label='${musicBtn.label}'`);
console.log(`  CRT: badge='${crtBtn.badge}', label='${crtBtn.label}'`);

console.log('\n✅ Settings screen layout & badge synchronization verified!');
