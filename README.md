# 2D Retro Platformer Game: DANGEROUS ADVENTURE

An authentic 2D retro platformer engine built with **HTML5 Canvas, Vanilla JavaScript (ES6 modules), and CSS3**. Inspired by classic DOS platformers such as *Dangerous Dave*, featuring original pixel art graphics, axis-separated AABB physics, tile-based level collision, smooth horizontal camera side-scrolling, hazards, rich collectibles & scoring with visual floating popups, intelligent retro enemies with stomp mechanics, responsive shooting blaster mechanics, complete retro UI system with dual Keyboard + Mouse support, multi-level campaign progression, and retro arcade presentation.

---

## 🖥️ Complete Retro UI System ([src/ui.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/ui.js))

### 1. Main Menu
* **Title**: `DANGEROUS ADVENTURE` with golden pixel drop shadow and glow
* **Subtitle**: `~ A Retro Platformer ~`
* **Buttons**:
  * `PLAY` -> Starts the campaign at Level 1 with 3 lives.
  * `INSTRUCTIONS` -> Opens the full controls and objective manual.
  * `SETTINGS` -> Opens audio/SFX and CRT scanline toggles.
  * `QUIT` -> Displays a retro farewell screen with return button.

### 2. Screen-Space Retro HUD
* **Top-Left**: ❤️ `Health / Lives` (`❤ ❤ ❤  x3`)
* **Top-Center**: ⭐ `Score` (`⭐ SCORE: 00500  [LVL 01]`)
* **Top-Right**: 💎 `Collectibles` (`🏆 TROPHY: [YES/NO]`)
* **Bottom Banner**: Temporary objective toast hints (`"FIND THE GOLDEN TROPHY TO OPEN EXIT!"`)

### 3. Pause Menu (Key: `P` or `ESC`)
* `RESUME` -> Smoothly unpauses gameplay.
* `RESTART LEVEL` -> Reloads the current level from initial spawn.
* `MAIN MENU` -> Saves state and returns to Title Screen.

### 4. Game Over Screen
* Displays `*** GAME OVER ***` with final accumulated score.
* `RESTART` -> Restarts campaign from Level 1 with fresh lives.
* `MAIN MENU` -> Returns to Title Screen.

### 5. Level Complete Screen
* Displays `*** LEVEL <N> COMPLETE! ***` with stage score and `+500` bonus.
* `NEXT LEVEL` -> Advances to next stage.
* `MAIN MENU` -> Returns to Title Screen.

### 6. Final Victory Screen
* Displays `*** YOU WIN! ***` with `ALL 3 LEVELS CONQUERED!` and `+2000` Grand Victory Bonus.
* `PLAY AGAIN` -> Restarts campaign from Level 1.
* `MAIN MENU` -> Returns to Title Screen.

### 7. Instructions Screen
* Complete key bindings guide and objective breakdown.
* `BACK` -> Returns to Title Screen.

### 8. Settings Screen
* Interactive toggles for `SOUND FX`, `MUSIC`, and `CRT SCANLINES`.
* `BACK` -> Returns to Title Screen.

---

## 🎮 Multi-Level Progression System

1. **Level 1: The Training Vault (Easy)**:
   * **Size**: 68 cols × 15 rows.
   * Basic platforming, ground coins, 2 fire pits, 1 spike pit, secret high ledge, 3 Cyber-Crawler enemy patrols.
   * **Goal**: Collect Golden Trophy (Col 51) and reach Exit Door (Col 64).

2. **Level 2: The Cyber Factory (Medium)**:
   * **Size**: 76 cols × 15 rows.
   * Suspended industrial steel girders, stepped conveyors over fire/spikes, high tower, 4 enemy patrols.
   * **Goal**: Ascend crane altar for Golden Trophy (Col 56) and reach Exit Gate (Col 72).

3. **Level 3: The Dave Fortress (Hard / Climax)**:
   * **Size**: 86 cols × 15 rows.
   * Deep lava chasms, ascending castle spires, multi-tiered platforms, 6 enemy patrols.
   * **Goal**: Claim the Grand Trophy (Col 61) and reach Master Exit Portal (Col 82) to achieve **GRAND VICTORY**.

---

## 🕹️ Controls Legend

| Action | Primary Key | Secondary Key / Mouse |
| :--- | :--- | :--- |
| **Move Left** | `A` | `Left Arrow` (◀) |
| **Move Right** | `D` | `Right Arrow` (▶) |
| **Jump / Stomp** | `W` | `Up Arrow` (▲) / `Space` |
| **Shoot Blaster** | `F` | - |
| **Pause / Resume** | `P` | `ESC` |
| **Menu Navigation** | `▲` / `▼` (`W` / `S`) | Mouse Hover |
| **Menu Select** | `Enter` / `Space` | Mouse Left Click |
| **Test Death State** | `K` | - |
| **Toggle Telemetry** | `B` | - |

---

## 🚀 How to Run the Game

1. Start local server in the project directory:
   ```powershell
   python -m http.server 8000
   ```
2. Open your browser to:
   ```
   http://localhost:8000
   ```


