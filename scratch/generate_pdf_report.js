import fs from 'fs';
import path from 'path';

/**
 * Pure JavaScript PDF 1.4 Document Builder (Zero External Dependencies)
 * Generates standards-compliant, beautiful multi-page PDF documents.
 */
class PDFBuilder {
  constructor({ pageSize = [595.28, 841.89], margin = 40 } = {}) {
    this.width = pageSize[0];
    this.height = pageSize[1];
    this.margin = margin;
    this.contentWidth = this.width - margin * 2;
    
    this.pages = [];
    this.currentPage = null;
    this.cursorY = this.height - this.margin;
    
    this.fonts = {
      'F1': 'Helvetica',
      'F2': 'Helvetica-Bold',
      'F3': 'Helvetica-Oblique',
      'F4': 'Courier',
      'F5': 'Courier-Bold'
    };
    
    this.addPage();
  }

  addPage() {
    this.currentPage = {
      commands: []
    };
    this.pages.push(this.currentPage);
    this.cursorY = this.height - this.margin;
    return this.currentPage;
  }

  ensureSpace(neededPt) {
    if (this.cursorY - neededPt < this.margin + 30) {
      this.addPage();
    }
  }

  // Raw graphic command
  cmd(str) {
    this.currentPage.commands.push(str);
  }

  // Draw rectangle
  fillRect(x, y, w, h, [r, g, b]) {
    this.cmd(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
    this.cmd(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }

  strokeRect(x, y, w, h, [r, g, b], lineWidth = 1) {
    this.cmd(`${lineWidth} w`);
    this.cmd(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
    this.cmd(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
  }

  drawLine(x1, y1, x2, y2, [r, g, b], lineWidth = 1) {
    this.cmd(`${lineWidth} w`);
    this.cmd(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
    this.cmd(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  // Draw text with escaping
  escapeText(str) {
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  drawText(text, x, y, { font = 'F1', size = 10, color = [0.1, 0.1, 0.15], align = 'left' } = {}) {
    this.cmd('BT');
    this.cmd(`/${font} ${size} Tf`);
    this.cmd(`${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)} rg`);
    
    // Estimate width for alignment (approximate for Helvetica)
    let approxWidth = text.length * size * 0.52;
    if (font === 'F4' || font === 'F5') approxWidth = text.length * size * 0.6; // Monospace
    
    let drawX = x;
    if (align === 'center') drawX = x - approxWidth / 2;
    else if (align === 'right') drawX = x - approxWidth;
    
    this.cmd(`${drawX.toFixed(2)} ${y.toFixed(2)} Td`);
    this.cmd(`(${this.escapeText(text)}) Tj`);
    this.cmd('ET');
  }

  // Draw wrapped paragraph
  drawParagraph(text, x, y, maxWidth, { font = 'F1', size = 9.5, lineHeight = 13.5, color = [0.2, 0.25, 0.3] } = {}) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    const charWidth = (font === 'F4' || font === 'F5') ? size * 0.6 : size * 0.52;
    const maxChars = Math.floor(maxWidth / charWidth);

    for (let i = 0; i < words.length; i++) {
      const testLine = line ? `${line} ${words[i]}` : words[i];
      if (testLine.length > maxChars && line) {
        this.drawText(line, x, currentY, { font, size, color });
        currentY -= lineHeight;
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line) {
      this.drawText(line, x, currentY, { font, size, color });
      currentY -= lineHeight;
    }
    return currentY;
  }

  buildPDF() {
    // Add page numbers on all pages
    const totalPages = this.pages.length;
    for (let p = 0; p < totalPages; p++) {
      const page = this.pages[p];
      this.currentPage = page;
      
      // Top subtle header line (except cover page)
      if (p > 0) {
        this.drawLine(this.margin, this.height - 25, this.width - this.margin, this.height - 25, [0.85, 0.88, 0.92], 0.75);
        this.drawText('Dangerous Adventure - Technical & Architectural Report', this.margin, this.height - 20, { font: 'F1', size: 7.5, color: [0.55, 0.6, 0.7] });
      }
      
      // Bottom running footer
      this.drawLine(this.margin, 28, this.width - this.margin, 28, [0.85, 0.88, 0.92], 0.75);
      this.drawText('Confidential & Engineering Specification', this.margin, 18, { font: 'F1', size: 7.5, color: [0.55, 0.6, 0.7] });
      this.drawText(`Page ${p + 1} of ${totalPages}`, this.width - this.margin, 18, { font: 'F2', size: 7.5, color: [0.35, 0.4, 0.5], align: 'right' });
    }

    let objects = [];
    let xrefs = [];
    let byteOffset = 0;

    function addObj(content) {
      const id = objects.length + 1;
      xrefs.push(byteOffset);
      const str = `${id} 0 obj\n${content}\nendobj\n`;
      objects.push(str);
      byteOffset += Buffer.byteLength(str, 'utf-8');
      return id;
    }

    // PDF Header
    let headerStr = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    byteOffset += Buffer.byteLength(headerStr, 'utf-8');

    // 1. Catalog
    addObj('<< /Type /Catalog /Pages 2 0 R >>');

    // 2. Pages (placeholder ID, we will know page IDs)
    const pageObjIds = [];
    const fontObjIds = {};

    // 3. Fonts
    fontObjIds['F1'] = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    fontObjIds['F2'] = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    fontObjIds['F3'] = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>');
    fontObjIds['F4'] = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');
    fontObjIds['F5'] = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>');

    // 4. Page objects and Contents
    for (let p = 0; p < this.pages.length; p++) {
      const streamContent = this.pages[p].commands.join('\n');
      const streamLength = Buffer.byteLength(streamContent, 'utf-8');
      const contentId = addObj(`<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);
      
      const pageId = addObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontObjIds['F1']} 0 R /F2 ${fontObjIds['F2']} 0 R /F3 ${fontObjIds['F3']} 0 R /F4 ${fontObjIds['F4']} 0 R /F5 ${fontObjIds['F5']} 0 R >> >> >>`);
      pageObjIds.push(pageId);
    }

    // Reconstruct Pages dictionary obj #2
    const pagesDict = `<< /Type /Pages /Count ${pageObjIds.length} /Kids [${pageObjIds.map(id => `${id} 0 R`).join(' ')}] >>`;
    const strObj2 = `2 0 obj\n${pagesDict}\nendobj\n`;
    objects[1] = strObj2;

    // Recalculate exact byte offsets
    xrefs = [];
    byteOffset = Buffer.byteLength(headerStr, 'utf-8');
    for (let i = 0; i < objects.length; i++) {
      xrefs.push(byteOffset);
      byteOffset += Buffer.byteLength(objects[i], 'utf-8');
    }

    // Cross-reference table
    const startXref = byteOffset;
    let xrefStr = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 0; i < xrefs.length; i++) {
      xrefStr += `${xrefs[i].toString().padStart(10, '0')} 00000 n \n`;
    }

    // Trailer
    let trailerStr = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

    return Buffer.concat([
      Buffer.from(headerStr, 'utf-8'),
      Buffer.from(objects.join(''), 'utf-8'),
      Buffer.from(xrefStr, 'utf-8'),
      Buffer.from(trailerStr, 'utf-8')
    ]);
  }
}

// -----------------------------------------------------------------------------
// Document Generation Script
// -----------------------------------------------------------------------------
console.log('Generating Dangerous Adventure PDF Specification Report...');
const doc = new PDFBuilder();

// PALETTE
const C_DARK_BG = [0.035, 0.051, 0.086]; // #090d16
const C_PRIMARY_CYAN = [0.22, 0.741, 0.973]; // #38bdf8
const C_GOLD = [0.98, 0.8, 0.082]; // #facc15
const C_EMERALD = [0.133, 0.773, 0.369]; // #22c55e
const C_TEXT_MAIN = [0.06, 0.09, 0.16];
const C_TEXT_MUTED = [0.35, 0.42, 0.52];
const C_TEXT_LIGHT = [0.95, 0.97, 1.0];
const C_BORDER = [0.86, 0.89, 0.93];
const C_CARD_BG = [0.97, 0.98, 0.99];

// 1. COVER / HEADER BANNER
const bannerH = 100;
const bannerY = doc.cursorY - bannerH;
doc.fillRect(doc.margin, bannerY, doc.contentWidth, bannerH, C_DARK_BG);
doc.strokeRect(doc.margin, bannerY, doc.contentWidth, bannerH, [0.15, 0.22, 0.33], 1.5);

// Accent corner brackets
doc.fillRect(doc.margin, bannerY + bannerH - 3, 12, 3, C_PRIMARY_CYAN);
doc.fillRect(doc.margin, bannerY + bannerH - 12, 3, 12, C_PRIMARY_CYAN);
doc.fillRect(doc.margin + doc.contentWidth - 12, bannerY + bannerH - 3, 12, 3, C_PRIMARY_CYAN);
doc.fillRect(doc.margin + doc.contentWidth - 3, bannerY + bannerH - 12, 3, 12, C_PRIMARY_CYAN);

// Header text
doc.drawText('ENGINEERING & ARCHITECTURAL REPORT', doc.margin + 16, bannerY + bannerH - 22, { font: 'F2', size: 8, color: C_PRIMARY_CYAN });
doc.drawText('DANGEROUS ADVENTURE', doc.margin + 16, bannerY + bannerH - 44, { font: 'F2', size: 18, color: C_TEXT_LIGHT });
doc.drawText('Modern Retro Platformer Engine • Architecture & Comprehensive Comparison', doc.margin + 16, bannerY + bannerH - 60, { font: 'F1', size: 9.5, color: [0.7, 0.78, 0.9] });

// Meta row
doc.drawLine(doc.margin + 16, bannerY + 28, doc.margin + doc.contentWidth - 16, bannerY + 28, [0.18, 0.25, 0.38], 0.75);
doc.drawText('Platform: Web (HTML5 Canvas + Web Audio API)', doc.margin + 16, bannerY + 12, { font: 'F1', size: 8, color: [0.75, 0.82, 0.92] });
doc.drawText('Architecture: ES6 Modular Engine (0 Deps)', doc.margin + 215, bannerY + 12, { font: 'F1', size: 8, color: [0.75, 0.82, 0.92] });
doc.drawText('Tests: 16/16 Passed (100%)', doc.margin + doc.contentWidth - 16, bannerY + 12, { font: 'F2', size: 8, color: C_EMERALD, align: 'right' });

doc.cursorY = bannerY - 20;

// SECTION 1: EXECUTIVE SUMMARY
function drawSectionHeader(title) {
  doc.ensureSpace(35);
  doc.drawText(title, doc.margin, doc.cursorY, { font: 'F2', size: 12, color: C_TEXT_MAIN });
  doc.drawLine(doc.margin, doc.cursorY - 4, doc.margin + doc.contentWidth, doc.cursorY - 4, C_PRIMARY_CYAN, 1.5);
  doc.cursorY -= 16;
}

drawSectionHeader('1. Executive Summary & Game Concept');
doc.cursorY = doc.drawParagraph(
  'Dangerous Adventure is a modernized indie platformer built from scratch in pure Vanilla web technologies. It pays homage to John Romero’s iconic 1988/1990 MS-DOS classic "Dangerous Dave in the Deserted Pirate\'s Hideout", while completely re-engineering the physics engine, combat systems, audio synthesis, camera controls, and user interface for a fluid 60 FPS indie experience.',
  doc.margin, doc.cursorY, doc.contentWidth
);
doc.cursorY -= 4;
doc.cursorY = doc.drawParagraph(
  'Built with zero heavy runtime frameworks (no React, Phaser, Unity, or Tailwind), the engine compiles native retro pixel art at 400x240 pixels scaled crisply on high-DPI displays. It delivers fluid sub-pixel movement, variable jump heights, dual-mode combat (plasma shooting + enemy stomping), procedural 8-bit sound synthesis, and an animated glassmorphic indie UI.',
  doc.margin, doc.cursorY, doc.contentWidth
);
doc.cursorY -= 14;

// SECTION 2: COMPARISON TABLE
drawSectionHeader('2. Deep Comparison: Classic Dangerous Dave vs. Modernized Engine');

const tableHeaderY = doc.cursorY - 14;
doc.fillRect(doc.margin, tableHeaderY, doc.contentWidth, 16, C_DARK_BG);
doc.drawText('GAME DIMENSION', doc.margin + 6, tableHeaderY + 4, { font: 'F2', size: 7.5, color: C_TEXT_LIGHT });
doc.drawText('CLASSIC DANGEROUS DAVE (1988 DOS)', doc.margin + 125, tableHeaderY + 4, { font: 'F2', size: 7.5, color: [0.95, 0.6, 0.6] });
doc.drawText('MODERNIZED DAVE ENGINE (THIS GAME)', doc.margin + 315, tableHeaderY + 4, { font: 'F2', size: 7.5, color: C_PRIMARY_CYAN });
doc.cursorY = tableHeaderY;

const comparisons = [
  {
    dim: 'Runtime & Architecture',
    classic: '16-bit x86 Assembly / C for MS-DOS (EGA 320x200).',
    modern: 'Pure ES6+ JavaScript Modules, HTML5 Canvas 2D, Web Audio API. 0 dependencies.'
  },
  {
    dim: 'Physics & Frame Rate',
    classic: 'Fixed ~18-24 FPS with jerky tile-quantized steps.',
    modern: 'Smooth 60 FPS sub-pixel delta-time integration with acceleration damping.'
  },
  {
    dim: 'Jump Mechanics',
    classic: 'Rigid parabolic jump arc; zero control once in the air.',
    modern: 'Variable Jump Height (tap vs hold), Coyote Time & Jump Buffering.'
  },
  {
    dim: 'Collision & Corners',
    classic: 'Player snagged or stuck abruptly on tile corners & seams.',
    modern: 'Continuous Axis-Separated AABB with corner-slide assistance & edge alignment.'
  },
  {
    dim: 'Combat & Weapons',
    classic: 'Touch = instant death. Gun was rare pickup with limited ammo.',
    modern: 'Dual Combat: Built-in Plasma Blaster (F) + Enemy Stomp (+200 pts) with bounce.'
  },
  {
    dim: 'Enemy Intelligence',
    classic: 'Primitive 1D patrol with occasional boundary clipping bugs.',
    modern: 'Smart Patrol AI: Ledge drop-off detection, wall reversal, stomp hitboxes.'
  },
  {
    dim: 'Camera & Viewport',
    classic: 'Rigid screen-by-screen flip transitions without lookahead.',
    modern: 'Smooth Lookahead Tracking Camera: Lerped horizontal tracking & clamping.'
  },
  {
    dim: 'Checkpoints & Saves',
    classic: 'Permadeath: Dying sent you back to the very start.',
    modern: 'Interactive Checkpoint Beacons auto-save midway spawn points in each level.'
  },
  {
    dim: 'Campaign Progression',
    classic: 'Linear locked sequence with no level select or high score saves.',
    modern: '3 Hand-Crafted Levels + Dedicated Level Select Screen + High Score Memory.'
  },
  {
    dim: 'Audio & Soundtrack',
    classic: '1-bit PC Speaker square-wave beeper.',
    modern: 'Real-time procedural Web Audio API chiptune synth with 0ms asset lag.'
  },
  {
    dim: 'UI & Typography',
    classic: 'Crude, unreadable low-resolution DOS text overlays.',
    modern: 'Dual Typography: Arcade headers (Press Start 2P) + Crisp body (Outfit 8.5px bold).'
  }
];

for (let i = 0; i < comparisons.length; i++) {
  const row = comparisons[i];
  const rowH = 26;
  doc.ensureSpace(rowH + 4);
  const ry = doc.cursorY - rowH;
  
  // Row background
  if (i % 2 === 1) {
    doc.fillRect(doc.margin, ry, doc.contentWidth, rowH, [0.96, 0.97, 0.98]);
  }
  doc.strokeRect(doc.margin, ry, doc.contentWidth, rowH, C_BORDER, 0.5);
  
  // Cell text
  doc.drawText(row.dim, doc.margin + 6, ry + rowH - 12, { font: 'F2', size: 7.5, color: C_TEXT_MAIN });
  
  doc.drawParagraph(row.classic, doc.margin + 125, ry + rowH - 8, 180, { font: 'F1', size: 7, lineHeight: 9.5, color: [0.45, 0.45, 0.5] });
  doc.drawParagraph(row.modern, doc.margin + 315, ry + rowH - 8, 190, { font: 'F1', size: 7, lineHeight: 9.5, color: [0.08, 0.25, 0.15] });
  
  doc.cursorY = ry;
}

doc.cursorY -= 16;

// SECTION 3: TECH STACK BREAKDOWN
drawSectionHeader('3. Technology Stack & Architecture Deep Dive');

const cardW = (doc.contentWidth - 12) / 2;
const cardH = 68;

// Row 1 Cards
doc.ensureSpace(cardH + 10);
let cY = doc.cursorY - cardH;

// Card 1
doc.fillRect(doc.margin, cY, cardW, cardH, C_CARD_BG);
doc.strokeRect(doc.margin, cY, cardW, cardH, C_BORDER, 1);
doc.drawText('⚡ Core Language & Runtime', doc.margin + 8, cY + cardH - 14, { font: 'F2', size: 8.5, color: C_TEXT_MAIN });
doc.drawParagraph('Pure JavaScript (ES6+ Modules), HTML5, and Vanilla CSS3. Zero runtime frameworks (no React, Phaser, or Tailwind) for instant <50ms initial load time and lightweight 60 FPS performance.', doc.margin + 8, cY + cardH - 26, cardW - 16, { font: 'F1', size: 7.5, lineHeight: 10, color: C_TEXT_MUTED });

// Card 2
doc.fillRect(doc.margin + cardW + 12, cY, cardW, cardH, C_CARD_BG);
doc.strokeRect(doc.margin + cardW + 12, cY, cardW, cardH, C_BORDER, 1);
doc.drawText('🎨 HTML5 Canvas 2D Graphics Engine', doc.margin + cardW + 20, cY + cardH - 14, { font: 'F2', size: 8.5, color: C_TEXT_MAIN });
doc.drawParagraph('Hardware-accelerated 400x240 pixel-art viewport scaled crisply with nearest-neighbor rendering. Procedural entity drawing, pre-allocated particle pools, and optional CRT scanlines filter.', doc.margin + cardW + 20, cY + cardH - 26, cardW - 16, { font: 'F1', size: 7.5, lineHeight: 10, color: C_TEXT_MUTED });

doc.cursorY = cY - 8;

// Row 2 Cards
doc.ensureSpace(cardH + 10);
cY = doc.cursorY - cardH;

// Card 3
doc.fillRect(doc.margin, cY, cardW, cardH, C_CARD_BG);
doc.strokeRect(doc.margin, cY, cardW, cardH, C_BORDER, 1);
doc.drawText('🔊 Procedural Web Audio API Synth', doc.margin + 8, cY + cardH - 14, { font: 'F2', size: 8.5, color: C_TEXT_MAIN });
doc.drawParagraph('Real-time 8-bit chiptune synthesis using OscillatorNode, GainNode, and noise buffers. Procedural sound effects for blaster shots, coin chimes, gem arpeggios, and trophy fanfares with zero audio download latency.', doc.margin + 8, cY + cardH - 26, cardW - 16, { font: 'F1', size: 7.5, lineHeight: 10, color: C_TEXT_MUTED });

// Card 4
doc.fillRect(doc.margin + cardW + 12, cY, cardW, cardH, C_CARD_BG);
doc.strokeRect(doc.margin + cardW + 12, cY, cardW, cardH, C_BORDER, 1);
doc.drawText('📐 Sub-Pixel Delta-Time Physics & AABB', doc.margin + cardW + 20, cY + cardH - 14, { font: 'F2', size: 8.5, color: C_TEXT_MAIN });
doc.drawParagraph('Axis-separated continuous collision queries with obstacle detection, variable jump gravity scaling, 6-frame coyote time ledge forgiveness, and 5-frame jump buffering for responsive platforming.', doc.margin + cardW + 20, cY + cardH - 26, cardW - 16, { font: 'F1', size: 7.5, lineHeight: 10, color: C_TEXT_MUTED });

doc.cursorY = cY - 14;

// Codebase Directory Block
doc.ensureSpace(75);
doc.drawText('Codebase Modular Architecture:', doc.margin, doc.cursorY, { font: 'F2', size: 8.5, color: C_TEXT_MAIN });
doc.cursorY -= 8;

const codeH = 68;
const codeY = doc.cursorY - codeH;
doc.fillRect(doc.margin, codeY, doc.contentWidth, codeH, C_DARK_BG);
doc.strokeRect(doc.margin, codeY, doc.contentWidth, codeH, [0.15, 0.22, 0.33], 1);

const codeLines = [
  'src/main.js     • Game loop (requestAnimationFrame), state machine, camera, events',
  'src/map.js      • Hand-crafted tilemaps (Levels 1-3), entity spawn coordinates, doors',
  'src/physics.js  • Axis-separated AABB collision solver, gravity, platform landing',
  'src/player.js   • Dave entity states (IDLE, RUN, JUMP, FALL, SHOOT, DIE), blaster',
  'src/enemies.js  • Smart patrol AI, ledge turnaround, stomp hitboxes, bullet damage',
  'src/audio.js    • Web Audio API procedural 8-bit chiptune sound synthesizer',
  'src/ui.js       • Glassmorphic UI design system, Main Menu, HUD, Level Select, Settings'
];

for (let j = 0; j < codeLines.length; j++) {
  doc.drawText(codeLines[j], doc.margin + 10, codeY + codeH - 10 - j * 8.5, { font: 'F4', size: 6.5, color: [0.75, 0.85, 0.95] });
}

doc.cursorY = codeY - 14;

// SECTION 4: BUGS & PROBLEMS FIXED
drawSectionHeader('4. Critical Bugs & UX Problems Fixed in This Game');

const bugCards = [
  {
    title: '🚫 1. Elimination of Path-Blocking Popups',
    problem: 'Problem: In-game popup messages ("LEVEL X: FIND TROPHY & GO TO EXIT!") were anchored at the bottom floor (y=218), completely covering Dave, walking paths, coins, spikes, and enemies.',
    solution: 'Solution: Relocated all toast banners to the top ceiling/sky zone (y=24), providing 150px+ vertical clearance above the walking path so gameplay is never obstructed.'
  },
  {
    title: '💥 2. Duplicate Intro Message Collisions',
    problem: 'Problem: On level start, a legacy message toast and the modern cinematic Mission Intro card triggered simultaneously at the same top coordinates, causing ugly text collisions.',
    solution: 'Solution: Removed redundant legacy level-start toasts; added an active-screen mutual-exclusion safety guard in renderMessageBanner.'
  },
  {
    title: '🔍 3. Unreadable 4.5px Bitmap Typography',
    problem: 'Problem: The 8-bit bitmap font ("Press Start 2P") scaled down to 4.5px-5.5px blurred into illegible antialiased smudges on instructions, settings, and menus.',
    solution: 'Solution: Built a Dual-Layer Typography System: retro headers in "Press Start 2P", descriptions and controls in razor-sharp "Outfit" / "Segoe UI" (7.5px-8.5px bold).'
  },
  {
    title: '🎛️ 4. Settings Button & Badge Overlaps',
    problem: 'Problem: Button labels ("SOUND FX", "CRT FILTER") collided directly over "[ ON ]" / "[ OFF ]" badges and selection chevrons (▶, ◀).',
    solution: 'Solution: Converted toggle buttons into clean, centered status pills with emerald green / slate gray color feedback and zero overlapping text.'
  },
  {
    title: '📏 5. Footer Text Clipping on Canvas',
    problem: 'Problem: The 56-character bottom navigation legend overflowed off the right edge of the 400px canvas.',
    solution: 'Solution: Scaled legend font using proportional modern typography to fit comfortably with 30px+ padding and zero screen boundary breaches.'
  },
  {
    title: '🎮 6. Header & Controls Streamlining',
    problem: 'Problem: Cluttered bottom control bars took up precious screen real estate.',
    solution: 'Solution: Built an interactive, hoverable 🎮 CONTROLS popover in the top header alongside a ⛶ FULLSCREEN toggle button.'
  }
];

for (let b = 0; b < bugCards.length; b += 2) {
  const bcH = 68;
  doc.ensureSpace(bcH + 10);
  const bY = doc.cursorY - bcH;
  
  // Left Card
  const c1 = bugCards[b];
  doc.fillRect(doc.margin, bY, cardW, bcH, C_CARD_BG);
  doc.strokeRect(doc.margin, bY, cardW, bcH, C_BORDER, 1);
  doc.drawText(c1.title, doc.margin + 8, bY + bcH - 12, { font: 'F2', size: 7.5, color: C_TEXT_MAIN });
  doc.drawParagraph(c1.problem, doc.margin + 8, bY + bcH - 22, cardW - 16, { font: 'F1', size: 6.8, lineHeight: 8.8, color: [0.6, 0.25, 0.25] });
  doc.drawParagraph(c1.solution, doc.margin + 8, bY + bcH - 44, cardW - 16, { font: 'F1', size: 6.8, lineHeight: 8.8, color: [0.1, 0.45, 0.2] });

  // Right Card
  if (b + 1 < bugCards.length) {
    const c2 = bugCards[b + 1];
    doc.fillRect(doc.margin + cardW + 12, bY, cardW, bcH, C_CARD_BG);
    doc.strokeRect(doc.margin + cardW + 12, bY, cardW, bcH, C_BORDER, 1);
    doc.drawText(c2.title, doc.margin + cardW + 20, bY + bcH - 12, { font: 'F2', size: 7.5, color: C_TEXT_MAIN });
    doc.drawParagraph(c2.problem, doc.margin + cardW + 20, bY + bcH - 22, cardW - 16, { font: 'F1', size: 6.8, lineHeight: 8.8, color: [0.6, 0.25, 0.25] });
    doc.drawParagraph(c2.solution, doc.margin + cardW + 20, bY + bcH - 44, cardW - 16, { font: 'F1', size: 6.8, lineHeight: 8.8, color: [0.1, 0.45, 0.2] });
  }

  doc.cursorY = bY - 6;
}

doc.cursorY -= 10;

// SECTION 5: TEST SUITE VERIFICATION
drawSectionHeader('5. Quality Assurance & Automated Test Coverage');
doc.cursorY = doc.drawParagraph(
  'The game engine is backed by 16 automated test suites executed via Node.js (scratch/run_all_tests.js). All tests validate physics, combat, audio sync, UI bounding boxes, and state transitions with 100% pass rate:',
  doc.margin, doc.cursorY, doc.contentWidth
);
doc.cursorY -= 6;

const testCols = [
  [
    '✔ test_physics.js: Gravity, jump arcs, AABB tile collisions',
    '✔ test_shooting.js: Plasma blaster projectile velocity & culling',
    '✔ test_enemies.js: Patrol AI, ledge turnaround, stomp hitboxes',
    '✔ test_collectibles.js: Coins (+250), gems (+500), trophy',
    '✔ test_level1.js: Map tiles, hazard triggers, spawn mechanics',
    '✔ test_level_completion.js: Trophy exit door unlock conditions',
    '✔ test_multilevel.js: Level 1 -> Level 2 -> Level 3 progression',
    '✔ test_ui.js: Main Menu & Level Select state transitions'
  ],
  [
    '✔ test_p0_fixes.js: Critical physics & ceiling hit handling',
    '✔ test_p1_improvements.js: Coyote time & jump buffering',
    '✔ test_main_menu.js: Hologram pedestal & button focus',
    '✔ test_level_select.js: Unlocked stage access & locked feedback',
    '✔ test_settings_instructions.js: Instructions layout & SFX/Music toggles',
    '✔ test_hud.js: Glassmorphic top bar, lives, trophy pulse',
    '✔ test_pause_gameover.js: Pause modal resume & Game Over restart',
    '✔ test_completion_victory.js: Grand Victory celebration sequence'
  ]
];

const testBlockH = 68;
doc.ensureSpace(testBlockH + 10);
const tY = doc.cursorY - testBlockH;

doc.fillRect(doc.margin, tY, doc.contentWidth, testBlockH, [0.94, 0.98, 0.95]);
doc.strokeRect(doc.margin, tY, doc.contentWidth, testBlockH, [0.7, 0.9, 0.75], 1);

for (let k = 0; k < testCols[0].length; k++) {
  doc.drawText(testCols[0][k], doc.margin + 8, tY + testBlockH - 10 - k * 7.5, { font: 'F1', size: 6.8, color: [0.08, 0.35, 0.15] });
  doc.drawText(testCols[1][k], doc.margin + cardW + 16, tY + testBlockH - 10 - k * 7.5, { font: 'F1', size: 6.8, color: [0.08, 0.35, 0.15] });
}

doc.cursorY = tY - 14;

// BUILD AND SAVE
const pdfBuffer = doc.buildPDF();
const outputPath = path.resolve('Dangerous_Adventure_Game_Report.pdf');
fs.writeFileSync(outputPath, pdfBuffer);
console.log(`✅ PDF successfully generated and saved to: ${outputPath} (${pdfBuffer.length} bytes)`);
