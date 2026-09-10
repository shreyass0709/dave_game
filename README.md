# 🎮 DANGEROUS ADVENTURE — 2D Retro Platformer Engine

[![GitHub Pages](https://img.shields.io/badge/Live_Demo-GitHub_Pages-brightgreen?style=for-the-badge&logo=github)](https://shreyass0709.github.io/dave_game/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6_Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas_2D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural_Synth-38BDF8?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Tests](https://img.shields.io/badge/Tests-16%2F16_Passed-22C55E?style=for-the-badge)](scratch/run_all_tests.js)

> 🕹️ **Play Live on GitHub Pages:** [https://shreyass0709.github.io/dave_game/](https://shreyass0709.github.io/dave_game/)

An authentic 60 FPS 2D retro platformer engine built in pure **Vanilla JavaScript, HTML5 Canvas 2D, and Web Audio API** with **zero external dependencies**. Inspired by John Romero’s classic 1988 MS-DOS game *Dangerous Dave*, modernized with sub-pixel physics, variable jump heights, dual-mode combat, procedural 8-bit sound synthesis, and multi-level progression.

---

## 📄 Project Documentation & Reports

- 📑 **[Teacher Presentation & Viva Defense Guide (PDF)](Dangerous_Adventure_Teacher_Presentation_Guide.pdf)** — Presentation script, live demo walkthrough, and technical viva Q&A.
- 📄 **[Comprehensive Technical & Architectural Report (PDF)](Dangerous_Adventure_Game_Report.pdf)** — Detailed engineering specification, comparison matrix, and subsystem deep dive.

---

## 🌟 Key Features

1. **60 FPS Delta-Time (`dt`) Physics Engine**:
   - Axis-separated continuous **AABB (Axis-Aligned Bounding Box)** collision solver.
   - **Variable Jump Heights**: Tap for small hop, hold for maximum jump height.
   - **Coyote Time** (ledge jump forgiveness) & **Jump Buffering** for responsive controls.

2. **Dual Combat & Intelligent Enemy AI**:
   - **Plasma Blaster (`F`)**: High-velocity energy bolts with muzzle flash and screen culling.
   - **Enemy Stomp (+200 pts)**: Defeat patrolling robotic guards from above with an upward bounce.
   - **Patrol AI**: Ledge drop-off detection, wall reversal, and animated walk cycles.

3. **Procedural Web Audio API Synthesizer**:
   - Real-time 8-bit chiptune sound waves constructed on-the-fly using `OscillatorNode`, `GainNode`, and frequency sweeps (0ms asset load latency).

4. **Multi-Level Campaign (10 Progressive Missions) & Checkpoints**:
   - **Level 1**: *The Lost Vault* (Platforming basics, fire hazards, high trophy ledge).
   - **Level 2**: *The Cyber Factory* (Suspended girders, stepped conveyors, enemy drones).
   - **Level 3**: *The Dave Fortress* (Lava chasms, ascending spires, fortress ramparts).
   - **Level 4**: *Toxic Sewers* (Acid drainage channels, rusty grates, chemical sludge).
   - **Level 5**: *Crystal Caverns* (Luminous geode pillars, sparkling stalactites, spike chasms).
   - **Level 6**: *Magma Core* (Basalt stepping pillars, roaring lava lakes, thermal vents).
   - **Level 7**: *Neo Skyway* (Floating high-altitude girders, vertigo drops, skyscraper spires).
   - **Level 8**: *Shadow Citadel* (Midnight laser grids, covert surveillance, obsidian bastions).
   - **Level 9**: *Quantum Reactor* (High-voltage plasma conduits, accelerator rings).
   - **Level 10**: *The Emperor's Sanctum* (Grand imperial citadel, royal throne dais, Grand Golden Trophy).
   - **Interactive Checkpoint Beacons**: Auto-saves midway spawn points on every level.

5. **Modern Glassmorphic Indie UI**:
   - Dual-Layer Typography (`Press Start 2P` arcade headers + `Outfit` 8.5px high-contrast body).
   - Interactive hoverable **🎮 CONTROLS** popover & **⛶ FULLSCREEN** mode.
   - Dynamic Settings toggles for Sound FX, BGM, and CRT scanlines.

---

## 🕹️ Controls

| Action | Primary Key | Secondary Key / Mouse |
| :--- | :--- | :--- |
| **Move Left** | `A` | `Left Arrow` (◀) |
| **Move Right** | `D` | `Right Arrow` (▶) |
| **Jump / Stomp** | `W` | `Up Arrow` (▲) / `Space` |
| **Plasma Blaster** | `F` | - |
| **Pause / Resume** | `P` | `ESC` |
| **Menu Navigate** | `▲` / `▼` (`W` / `S`) | Mouse Hover |
| **Menu Select** | `Enter` / `Space` | Mouse Left Click |
| **Toggle Telemetry** | `B` | - |

---

## 🚀 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/shreyass0709/dave_game.git
cd dave_game

# Run using any local static server:
npx serve .
# Or using Python:
python -m http.server 3000
```
Open your browser at `http://localhost:3000`.

---

## 🧪 Automated Testing

Execute the 16 automated test suites covering physics, shooting, enemy AI, collectibles, and UI states:
```bash
node scratch/run_all_tests.js
```
Result: **16/16 Test Suites Passed (100%)**.


