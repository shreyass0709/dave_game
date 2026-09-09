import fs from 'fs';
import path from 'path';

/**
 * PDF Generator for Teacher Presentation & Viva Guide
 */
class PDFBuilder {
  constructor({ pageSize = [595.28, 841.89], margin = 38 } = {}) {
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
    this.currentPage = { commands: [] };
    this.pages.push(this.currentPage);
    this.cursorY = this.height - this.margin;
    return this.currentPage;
  }

  ensureSpace(neededPt) {
    if (this.cursorY - neededPt < this.margin + 28) {
      this.addPage();
    }
  }

  cmd(str) {
    this.currentPage.commands.push(str);
  }

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

  escapeText(str) {
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  drawText(text, x, y, { font = 'F1', size = 10, color = [0.1, 0.1, 0.15], align = 'left' } = {}) {
    this.cmd('BT');
    this.cmd(`/${font} ${size} Tf`);
    this.cmd(`${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)} rg`);
    
    let approxWidth = text.length * size * 0.52;
    if (font === 'F4' || font === 'F5') approxWidth = text.length * size * 0.6;
    
    let drawX = x;
    if (align === 'center') drawX = x - approxWidth / 2;
    else if (align === 'right') drawX = x - approxWidth;
    
    this.cmd(`${drawX.toFixed(2)} ${y.toFixed(2)} Td`);
    this.cmd(`(${this.escapeText(text)}) Tj`);
    this.cmd('ET');
  }

  drawParagraph(text, x, y, maxWidth, { font = 'F1', size = 9, lineHeight = 12.5, color = [0.2, 0.25, 0.3] } = {}) {
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
    const totalPages = this.pages.length;
    for (let p = 0; p < totalPages; p++) {
      const page = this.pages[p];
      this.currentPage = page;
      
      if (p > 0) {
        this.drawLine(this.margin, this.height - 24, this.width - this.margin, this.height - 24, [0.85, 0.88, 0.92], 0.75);
        this.drawText('Dangerous Adventure - Student Project Presentation & Viva Guide', this.margin, this.height - 18, { font: 'F1', size: 7.5, color: [0.55, 0.6, 0.7] });
      }
      
      this.drawLine(this.margin, 26, this.width - this.margin, 26, [0.85, 0.88, 0.92], 0.75);
      this.drawText('Student Project Presentation Script & Technical Q&A Guide', this.margin, 16, { font: 'F1', size: 7.5, color: [0.55, 0.6, 0.7] });
      this.drawText(`Page ${p + 1} of ${totalPages}`, this.width - this.margin, 16, { font: 'F2', size: 7.5, color: [0.35, 0.4, 0.5], align: 'right' });
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

    let headerStr = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    byteOffset += Buffer.byteLength(headerStr, 'utf-8');

    addObj('<< /Type /Catalog /Pages 2 0 R >>');

    const pageObjIds = [];
    const fontObjIds = {};

    fontObjIds['F1'] = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    fontObjIds['F2'] = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    fontObjIds['F3'] = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>');
    fontObjIds['F4'] = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');
    fontObjIds['F5'] = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>');

    for (let p = 0; p < this.pages.length; p++) {
      const streamContent = this.pages[p].commands.join('\n');
      const streamLength = Buffer.byteLength(streamContent, 'utf-8');
      const contentId = addObj(`<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);
      
      const pageId = addObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontObjIds['F1']} 0 R /F2 ${fontObjIds['F2']} 0 R /F3 ${fontObjIds['F3']} 0 R /F4 ${fontObjIds['F4']} 0 R /F5 ${fontObjIds['F5']} 0 R >> >> >>`);
      pageObjIds.push(pageId);
    }

    const pagesDict = `<< /Type /Pages /Count ${pageObjIds.length} /Kids [${pageObjIds.map(id => `${id} 0 R`).join(' ')}] >>`;
    objects[1] = `2 0 obj\n${pagesDict}\nendobj\n`;

    xrefs = [];
    byteOffset = Buffer.byteLength(headerStr, 'utf-8');
    for (let i = 0; i < objects.length; i++) {
      xrefs.push(byteOffset);
      byteOffset += Buffer.byteLength(objects[i], 'utf-8');
    }

    const startXref = byteOffset;
    let xrefStr = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 0; i < xrefs.length; i++) {
      xrefStr += `${xrefs[i].toString().padStart(10, '0')} 00000 n \n`;
    }

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
// Document Generation
// -----------------------------------------------------------------------------
console.log('Generating Teacher Presentation & Viva Guide PDF...');
const doc = new PDFBuilder();

// PALETTE
const C_DARK_BG = [0.035, 0.051, 0.086];
const C_PRIMARY_CYAN = [0.22, 0.741, 0.973];
const C_GOLD = [0.98, 0.8, 0.082];
const C_EMERALD = [0.133, 0.773, 0.369];
const C_TEXT_MAIN = [0.06, 0.09, 0.16];
const C_TEXT_MUTED = [0.35, 0.42, 0.52];
const C_TEXT_LIGHT = [0.95, 0.97, 1.0];
const C_BORDER = [0.86, 0.89, 0.93];
const C_CARD_BG = [0.97, 0.98, 0.99];

// 1. BANNER
const bannerH = 92;
const bannerY = doc.cursorY - bannerH;
doc.fillRect(doc.margin, bannerY, doc.contentWidth, bannerH, C_DARK_BG);
doc.strokeRect(doc.margin, bannerY, doc.contentWidth, bannerH, [0.15, 0.22, 0.33], 1.5);

doc.drawText('PROJECT PRESENTATION & VIVA DEFENSE GUIDE', doc.margin + 16, bannerY + bannerH - 20, { font: 'F2', size: 8, color: C_PRIMARY_CYAN });
doc.drawText('DANGEROUS ADVENTURE', doc.margin + 16, bannerY + bannerH - 40, { font: 'F2', size: 17, color: C_TEXT_LIGHT });
doc.drawText('How to Explain the Architecture, Physics Engine & Technical Innovation to Your Teacher', doc.margin + 16, bannerY + bannerH - 56, { font: 'F1', size: 9, color: [0.7, 0.78, 0.9] });

doc.drawLine(doc.margin + 16, bannerY + 24, doc.margin + doc.contentWidth - 16, bannerY + 24, [0.18, 0.25, 0.38], 0.75);
doc.drawText('Topic: Modern 60 FPS Platformer Game Engine', doc.margin + 16, bannerY + 10, { font: 'F1', size: 7.5, color: [0.75, 0.82, 0.92] });
doc.drawText('Tech: Vanilla JS (ES6) + Canvas + Web Audio', doc.margin + 215, bannerY + 10, { font: 'F1', size: 7.5, color: [0.75, 0.82, 0.92] });
doc.drawText('Score: 16/16 Test Suites Passed', doc.margin + doc.contentWidth - 16, bannerY + 10, { font: 'F2', size: 7.5, color: C_EMERALD, align: 'right' });

doc.cursorY = bannerY - 18;

function drawSectionHeader(title) {
  doc.ensureSpace(32);
  doc.drawText(title, doc.margin, doc.cursorY, { font: 'F2', size: 11, color: C_TEXT_MAIN });
  doc.drawLine(doc.margin, doc.cursorY - 3, doc.margin + doc.contentWidth, doc.cursorY - 3, C_PRIMARY_CYAN, 1.5);
  doc.cursorY -= 14;
}

// 2. 30-SECOND ELEVATOR PITCH
drawSectionHeader('1. The 30-Second Elevator Pitch (Start with This)');
const pitchH = 46;
const pitchY = doc.cursorY - pitchH;
doc.fillRect(doc.margin, pitchY, doc.contentWidth, pitchH, [0.94, 0.97, 1.0]);
doc.strokeRect(doc.margin, pitchY, doc.contentWidth, pitchH, [0.7, 0.85, 0.98], 1);
doc.drawText('"Good morning/afternoon, Sir/Ma\'am. My project is Dangerous Adventure, a full-featured 2D platformer game', doc.margin + 10, pitchY + pitchH - 12, { font: 'F3', size: 8, color: [0.08, 0.2, 0.35] });
doc.drawText('engine built entirely in pure Vanilla JavaScript and HTML5 Canvas with zero external dependencies.', doc.margin + 10, pitchY + pitchH - 22, { font: 'F3', size: 8, color: [0.08, 0.2, 0.35] });
doc.drawText('It re-engineers the classic DOS Dangerous Dave game with smooth 60 FPS sub-pixel physics, real-time procedural', doc.margin + 10, pitchY + pitchH - 32, { font: 'F3', size: 8, color: [0.08, 0.2, 0.35] });
doc.drawText('8-bit sound synthesis, dual combat mechanics, and a multi-level campaign validated by 16 automated test suites."', doc.margin + 10, pitchY + pitchH - 42, { font: 'F3', size: 8, color: [0.08, 0.2, 0.35] });
doc.cursorY = pitchY - 14;

// 3. 5 KEY ENGINEERING PILLARS
drawSectionHeader('2. The 5 Core Engineering Pillars (Technical Highlights)');

const pillars = [
  {
    num: '1',
    title: 'Custom Axis-Separated AABB Physics & Game Loop',
    text: 'Explain: "Instead of third-party physics libraries, I wrote a custom continuous Axis-Aligned Bounding Box (AABB) collision solver. Movement is decoupled from monitor frame rates using fixed-time delta-time (dt) integration. I also engineered Coyote Time (ledge forgiveness) and Jump Buffering for precision platforming."'
  },
  {
    num: '2',
    title: 'Procedural Web Audio API Sound Synthesizer',
    text: 'Explain: "The game requires zero external .mp3 audio files. Using the browser\'s native Web Audio API, I synthesize square, triangle, and noise waves procedurally on-the-fly for blaster shots, coin chimes, explosions, and fanfares with zero download lag."'
  },
  {
    num: '3',
    title: 'Dual-Mode Combat & Smart Enemy AI System',
    text: 'Explain: "Classic Dave only had one-hit deaths. I implemented a dual combat system where Dave can fire high-velocity Plasma Bolts (F key) OR perform a Super Mario-style Enemy Stomp from above for a bounce and +200 points. The enemies feature intelligent patrol AI with ledge detection."'
  },
  {
    num: '4',
    title: 'Modular ES6 Architecture & Finite State Machine (FSM)',
    text: 'Explain: "The game is architected around a strict Finite State Machine governing 9 distinct states (Main Menu, Level Select, Instructions, Settings, Playing, Paused, Game Over, Level Complete, and Victory) with decoupled single-responsibility modules."'
  },
  {
    num: '5',
    title: '16 Automated Headless Test Suites (Quality Assurance)',
    text: 'Explain: "To guarantee rock-solid stability and zero regressions, I built a test harness with 16 automated test suites executed via Node.js verifying physics, hitboxes, door logic, score persistence, and HUD rendering with 100% pass rate."'
  }
];

const cardW = doc.contentWidth;
for (let i = 0; i < pillars.length; i++) {
  const p = pillars[i];
  const pH = 44;
  doc.ensureSpace(pH + 6);
  const pY = doc.cursorY - pH;
  
  doc.fillRect(doc.margin, pY, cardW, pH, C_CARD_BG);
  doc.strokeRect(doc.margin, pY, cardW, pH, C_BORDER, 1);
  
  // Number badge
  doc.fillRect(doc.margin + 8, pY + pH - 24, 18, 18, C_DARK_BG);
  doc.drawText(p.num, doc.margin + 17, pY + pH - 15, { font: 'F2', size: 9, color: C_PRIMARY_CYAN, align: 'center' });
  
  doc.drawText(p.title, doc.margin + 34, pY + pH - 12, { font: 'F2', size: 8.5, color: C_TEXT_MAIN });
  doc.drawParagraph(p.text, doc.margin + 34, pY + pH - 22, cardW - 42, { font: 'F1', size: 7.2, lineHeight: 9.5, color: C_TEXT_MUTED });
  
  doc.cursorY = pY - 6;
}

doc.cursorY -= 8;

// 4. STEP-BY-STEP LIVE DEMO GUIDE
drawSectionHeader('3. Live Project Demonstration Script (What to Show & Say)');

const demoSteps = [
  { step: 'Step 1: Main Menu & Settings', say: 'Show the hologram pedestal and 60 FPS menu. Navigate into Settings to show the dynamic [ ON ] / [ OFF ] sound/CRT toggles and explain that all settings persist across games.' },
  { step: 'Step 2: Level 1 & Physics Demo', say: 'Click PLAY or LEVEL 1. Show the smooth variable jump (light tap vs. high jump), coin collection, and smooth camera tracking. Show that Dave never snags on wall seams.' },
  { step: 'Step 3: Combat (Blaster & Stomp)', say: 'Press F to shoot a robot with the Plasma Blaster. Then jump on top of a patrolling guard to demonstrate the Stomp kill bounce (+200 pts).' },
  { step: 'Step 4: Checkpoints & Trophy Goal', say: 'Walk into a green Checkpoint Beacon to show auto-saving. Grab the Golden Trophy (HUD changes to [ACQUIRED]) and enter the Exit Door to complete the level.' },
  { step: 'Step 5: Automated Test Execution', say: 'Open the terminal and run "node scratch/run_all_tests.js" to show the examiner 16/16 test suites passing in under 2 seconds.' }
];

for (let d = 0; d < demoSteps.length; d++) {
  const ds = demoSteps[d];
  const dH = 26;
  doc.ensureSpace(dH + 4);
  const dY = doc.cursorY - dH;
  
  doc.fillRect(doc.margin, dY, cardW, dH, [0.98, 0.98, 0.99]);
  doc.strokeRect(doc.margin, dY, cardW, dH, C_BORDER, 0.75);
  doc.drawText(ds.step, doc.margin + 8, dY + dH - 10, { font: 'F2', size: 7.5, color: [0.1, 0.35, 0.6] });
  doc.drawParagraph(ds.say, doc.margin + 8, dY + dH - 19, cardW - 16, { font: 'F1', size: 7, lineHeight: 9, color: [0.25, 0.3, 0.35] });
  doc.cursorY = dY - 4;
}

doc.cursorY -= 8;

// 5. TOP 6 VIVA QUESTIONS & READY ANSWERS
drawSectionHeader('4. Likely Teacher / Viva Questions & Exact Answers');

const vivaQA = [
  {
    q: 'Q1: Why did you build this in Vanilla JS instead of using Phaser, Unity, or React?',
    a: 'Answer: "Building in Vanilla JS demonstrates a deep understanding of core computer science fundamentals—game loops, vector math, collision physics, and audio synthesis—without relying on heavy black-box engine abstractions. It also results in near-instant load times (<50ms) and minimal memory footprint."'
  },
  {
    q: 'Q2: How does your collision detection work without tile clipping?',
    a: 'Answer: "I use Axis-Separated Continuous AABB (Axis-Aligned Bounding Box) testing. In each frame, horizontal displacement (dx) is tested and clamped against solid map tiles first, followed by vertical displacement (dy). This guarantees Dave never snags on corners or falls through floors."'
  },
  {
    q: 'Q3: How does your audio work without importing MP3/WAV files?',
    a: 'Answer: "I utilize the Web Audio API AudioContext. When an event fires (e.g. blaster shot), the engine instantiates an OscillatorNode, sets its frequency curve (880Hz to 110Hz), routes it through a GainNode envelope, and plays the procedural chiptune wave with zero network latency."'
  },
  {
    q: 'Q4: What is delta-time (dt) and why is it important in your game loop?',
    a: 'Answer: "Delta-time is the exact elapsed time between consecutive animation frames. Multiplying velocity by dt ensures that Dave and enemies move at the exact same physical speed regardless of whether the user is playing on a 60Hz, 120Hz, or 144Hz display."'
  },
  {
    q: 'Q5: How did you solve the text readability and layout bugs in retro canvas?',
    a: 'Answer: "Retro canvas bitmap fonts blur when scaled down below 6px. I engineered a Dual-Layer Typography System: retro fonts (Press Start 2P) are preserved for arcade titles, while body text and instructions use clean, high-contrast typography (Outfit 8.5px bold) with bounded coordinate clipping."'
  },
  {
    q: 'Q6: How do you verify that changes don\'t break existing levels or physics?',
    a: 'Answer: "I created 16 automated headless test suites that simulate user inputs, physics ticks, and mock canvas draw commands. Running `node scratch/run_all_tests.js` executes and validates all 16 test suites in seconds."'
  }
];

const halfW = (doc.contentWidth - 10) / 2;
for (let v = 0; v < vivaQA.length; v += 2) {
  const q1 = vivaQA[v];
  const q2 = vivaQA[v + 1];
  const qH = 68;
  doc.ensureSpace(qH + 8);
  const qY = doc.cursorY - qH;
  
  // Left Q&A Card
  doc.fillRect(doc.margin, qY, halfW, qH, C_CARD_BG);
  doc.strokeRect(doc.margin, qY, halfW, qH, C_BORDER, 1);
  doc.drawParagraph(q1.q, doc.margin + 6, qY + qH - 10, halfW - 12, { font: 'F2', size: 7.2, lineHeight: 9, color: [0.1, 0.25, 0.45] });
  doc.drawParagraph(q1.a, doc.margin + 6, qY + qH - 30, halfW - 12, { font: 'F1', size: 6.8, lineHeight: 8.8, color: [0.15, 0.35, 0.2] });

  // Right Q&A Card
  if (q2) {
    doc.fillRect(doc.margin + halfW + 10, qY, halfW, qH, C_CARD_BG);
    doc.strokeRect(doc.margin + halfW + 10, qY, halfW, qH, C_BORDER, 1);
    doc.drawParagraph(q2.q, doc.margin + halfW + 16, qY + qH - 10, halfW - 12, { font: 'F2', size: 7.2, lineHeight: 9, color: [0.1, 0.25, 0.45] });
    doc.drawParagraph(q2.a, doc.margin + halfW + 16, qY + qH - 30, halfW - 12, { font: 'F1', size: 6.8, lineHeight: 8.8, color: [0.15, 0.35, 0.2] });
  }

  doc.cursorY = qY - 6;
}

// BUILD AND SAVE
const pdfBuffer = doc.buildPDF();
const outputPath = path.resolve('Dangerous_Adventure_Teacher_Presentation_Guide.pdf');
fs.writeFileSync(outputPath, pdfBuffer);
console.log(`✅ Teacher Presentation PDF successfully created: ${outputPath} (${pdfBuffer.length} bytes)`);
