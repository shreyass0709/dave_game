/**
 * Retro UI Manager
 * Renders pixel-perfect Main Menu, HUD, Pause Menu, Game Over,
 * Level Complete, Final Victory, Instructions, and Settings screens.
 * Supports dual navigation (Keyboard & Mouse) with rich retro visuals.
 */

export class UIButton {
  constructor({ id, label, x, y, width = 140, height = 20, color = '#38bdf8' }) {
    this.id = id;
    this.label = label;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  contains(px, py) {
    return px >= this.x && px <= this.x + this.width &&
           py >= this.y && py <= this.y + this.height;
  }

  render(ctx, isSelected, isHovered) {
    const active = isSelected || isHovered;

    // Button Base Body
    ctx.fillStyle = active ? '#1e293b' : '#0f172a';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Glowing Beveled Outline
    ctx.strokeStyle = active ? this.color : '#334155';
    ctx.lineWidth = active ? 2 : 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Top-left Glossy Reflective Highlight
    ctx.fillStyle = active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(this.x + 1, this.y + 1, this.width - 2, 2);
    ctx.fillRect(this.x + 1, this.y + 1, 2, this.height - 2);

    // Button Text
    ctx.fillStyle = active ? '#ffffff' : '#94a3b8';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textToDraw = active ? `▶ ${this.label} ◀` : this.label;
    ctx.fillText(textToDraw, this.x + this.width / 2, this.y + this.height / 2 + 1);

    ctx.textAlign = 'start';
  }
}

export class UIManager {
  constructor() {
    this.animTimer = 0;
    this.settings = {
      soundFX: true,
      music: true,
      crtFilter: true
    };
  }

  update(dt) {
    this.animTimer += dt;
  }

  /**
   * Screen 1: Retro Main Menu with Golden Glowing Title & Floating Stars
   */
  renderMainMenu(ctx, width, height, selectedIndex, buttons) {
    // Backdrop
    ctx.fillStyle = '#060813';
    ctx.fillRect(0, 0, width, height);

    // Ambient floating starfield
    for (let i = 0; i < 24; i++) {
      const sx = (i * 37 + this.animTimer * 5) % width;
      const sy = (i * 23) % height;
      const twinkle = Math.sin(this.animTimer * 4 + i) > 0.3;
      if (twinkle) {
        ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#facc15';
        ctx.fillRect(sx, sy, 1, 1);
      }
    }

    // Outer decorative frame
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // Title: "DANGEROUS ADVENTURE"
    ctx.save();
    ctx.textAlign = 'center';

    const titleGlow = (Math.sin(this.animTimer * 4) + 1) * 0.5;

    // Drop shadow
    ctx.fillStyle = '#020617';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText('DANGEROUS ADVENTURE', width / 2 + 2, 42);

    // Glowing main title
    ctx.fillStyle = titleGlow > 0.4 ? '#fef08a' : '#facc15';
    ctx.fillText('DANGEROUS ADVENTURE', width / 2, 40);

    // Subtitle: "A Retro Platformer"
    ctx.fillStyle = '#38bdf8';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('~ A Retro Platformer ~', width / 2, 58);

    // Edition Badge
    ctx.fillStyle = '#c084fc';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('COLLEGE MINI-PROJECT EDITION', width / 2, 72);

    ctx.restore();

    // Render Buttons
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].render(ctx, i === selectedIndex, false);
    }

    // Footer legend
    ctx.fillStyle = '#64748b';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[▲/▼] NAVIGATE   [ENTER/SPACE] SELECT   MOUSE CLICK', width / 2, height - 16);
    ctx.textAlign = 'start';
  }

  /**
   * Screen 2: Top Screen-Space HUD Bar
   */
  renderHUD(ctx, width, height, { lives = 3, score = 0, level = 1, hasTrophy = false, gemCount = 0 }) {
    // HUD Bar Background (Retro Navy DOS banner)
    ctx.fillStyle = '#0a1026';
    ctx.fillRect(0, 0, width, 18);

    // Top subtle highlight & bottom border
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 17, width, 1);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';

    // 1. TOP-LEFT: ❤️ Health/Lives with beating animation
    const heartBeat = Math.sin(this.animTimer * 6) > 0.6 ? 1 : 0;
    for (let i = 0; i < 3; i++) {
      const hx = 8 + i * 12;
      const hy = 6 - (i < lives ? heartBeat : 0);
      if (i < lives) {
        // Red pixel heart
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(hx + 1, hy, 2, 2);
        ctx.fillRect(hx + 5, hy, 2, 2);
        ctx.fillRect(hx, hy + 2, 8, 3);
        ctx.fillRect(hx + 1, hy + 5, 6, 2);
        ctx.fillRect(hx + 3, hy + 7, 2, 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx + 2, hy + 1, 1, 1);
      } else {
        // Empty heart outline
        ctx.fillStyle = '#475569';
        ctx.fillRect(hx + 1, hy, 2, 2);
        ctx.fillRect(hx + 5, hy, 2, 2);
        ctx.fillRect(hx, hy + 2, 8, 3);
        ctx.fillRect(hx + 1, hy + 5, 6, 2);
        ctx.fillRect(hx + 3, hy + 7, 2, 1);
        ctx.fillStyle = '#0a1026';
        ctx.fillRect(hx + 2, hy + 2, 4, 3);
      }
    }

    ctx.fillStyle = '#f87171';
    ctx.fillText(`x${lives}`, 48, 9);

    // 2. TOP-CENTER: ⭐ Score & Level
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.fillText(`⭐ SCORE:${String(score).padStart(5, '0')}  [LVL ${level}]`, width / 2, 9);

    // 3. TOP-RIGHT: 💎 Collectibles (Trophy status)
    ctx.textAlign = 'end';
    if (hasTrophy) {
      ctx.fillStyle = '#facc15';
      ctx.fillText(`🏆 TROPHY:YES`, width - 8, 9);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`💎 TROPHY:NO`, width - 8, 9);
    }

    ctx.textAlign = 'start';
  }

  /**
   * Screen 3: Pause Menu
   */
  renderPauseMenu(ctx, width, height, selectedIndex, buttons) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    const boxW = 240;
    const boxH = 150;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('*** GAME PAUSED ***', width / 2, boxY + 24);

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].render(ctx, i === selectedIndex, false);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS [P] OR [ESC] TO RESUME', width / 2, boxY + boxH - 12);
    ctx.textAlign = 'start';
  }

  /**
   * Screen 4: Game Over
   */
  renderGameOver(ctx, width, height, selectedIndex, buttons, finalScore = 0) {
    ctx.fillStyle = 'rgba(25, 5, 5, 0.88)';
    ctx.fillRect(0, 0, width, height);

    const boxW = 260;
    const boxH = 145;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    ctx.fillStyle = '#1a0d0d';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#ef4444';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('*** GAME OVER ***', width / 2, boxY + 26);

    ctx.fillStyle = '#facc15';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`FINAL SCORE: ${finalScore}`, width / 2, boxY + 48);

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].render(ctx, i === selectedIndex, false);
    }

    ctx.textAlign = 'start';
  }

  /**
   * Screen 5: Level Complete
   */
  renderLevelComplete(ctx, width, height, selectedIndex, buttons, { currentLevel = 1, score = 0, bonus = 500 }) {
    ctx.fillStyle = 'rgba(0, 20, 10, 0.82)';
    ctx.fillRect(0, 0, width, height);

    const boxW = 280;
    const boxH = 150;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    ctx.fillStyle = '#062817';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#4ade80';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`*** LEVEL ${currentLevel} COMPLETE! ***`, width / 2, boxY + 26);

    ctx.fillStyle = '#facc15';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`CURRENT SCORE: ${score}`, width / 2, boxY + 46);

    ctx.fillStyle = '#86efac';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(`LEVEL BONUS: +${bonus} PTS`, width / 2, boxY + 62);

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].render(ctx, i === selectedIndex, false);
    }

    ctx.textAlign = 'start';
  }

  /**
   * Screen 6: Final Victory
   */
  renderFinalVictory(ctx, width, height, selectedIndex, buttons, finalScore = 0) {
    ctx.fillStyle = 'rgba(10, 5, 30, 0.9)';
    ctx.fillRect(0, 0, width, height);

    const boxW = 300;
    const boxH = 155;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#facc15';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('*** YOU WIN! ***', width / 2, boxY + 26);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('ALL 3 LEVELS CONQUERED!', width / 2, boxY + 45);

    ctx.fillStyle = '#4ade80';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`FINAL SCORE: ${finalScore}`, width / 2, boxY + 63);

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].render(ctx, i === selectedIndex, false);
    }

    ctx.textAlign = 'start';
  }

  /**
   * Screen 7: Instructions Screen
   */
  renderInstructions(ctx, width, height, selectedIndex, buttons) {
    ctx.fillStyle = '#060d1a';
    ctx.fillRect(0, 0, width, height);

    const boxW = 340;
    const boxH = 200;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('*** INSTRUCTIONS ***', width / 2, boxY + 22);

    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'start';
    const leftX = boxX + 24;
    let lineY = boxY + 44;

    const instructions = [
      { key: 'A / Left Arrow', desc: '= Move Left' },
      { key: 'D / Right Arrow', desc: '= Move Right' },
      { key: 'Space / W / Up', desc: '= Jump & Stomp' },
      { key: 'F', desc: '= Shoot Blaster Bolt' },
      { key: 'P / ESC', desc: '= Pause Menu' }
    ];

    for (const item of instructions) {
      ctx.fillStyle = '#facc15';
      ctx.fillText(item.key.padEnd(18, ' '), leftX, lineY);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(item.desc, leftX + 110, lineY);
      lineY += 14;
    }

    ctx.fillStyle = '#4ade80';
    ctx.fillText('GOAL: Find Golden Trophy to open Exit Portal!', leftX, lineY + 6);

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].render(ctx, i === selectedIndex, false);
    }
  }

  /**
   * Screen 8: Settings Screen
   */
  renderSettings(ctx, width, height, selectedIndex, buttons) {
    ctx.fillStyle = '#060d1a';
    ctx.fillRect(0, 0, width, height);

    const boxW = 320;
    const boxH = 190;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#c084fc';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('*** SETTINGS ***', width / 2, boxY + 22);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'start';
    const leftX = boxX + 24;
    let lineY = boxY + 46;

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`SOUND FX : ${this.settings.soundFX ? 'ON' : 'OFF'}`, leftX, lineY);
    lineY += 16;
    ctx.fillText(`MUSIC    : ${this.settings.music ? 'ON' : 'OFF'}`, leftX, lineY);
    lineY += 16;
    ctx.fillText(`CRT SCAN : ${this.settings.crtFilter ? 'ON' : 'OFF'}`, leftX, lineY);

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].render(ctx, i === selectedIndex, false);
    }
  }

  /**
   * Screen 9: Quit Farewell
   */
  renderQuit(ctx, width, height, selectedIndex, buttons) {
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#facc15';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('*** DANGEROUS ADVENTURE ***', width / 2, height / 2 - 30);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('THANKS FOR PLAYING!', width / 2, height / 2 - 10);

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].render(ctx, i === selectedIndex, false);
    }

    ctx.textAlign = 'start';
  }

  /**
   * Screen Transition Curtain Fade
   */
  renderScreenFade(ctx, width, height, alpha) {
    if (alpha > 0.01) {
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }
}
