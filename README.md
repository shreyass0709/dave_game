# 2D Retro Platformer Game (Dave-Inspired Mini-Project)

An authentic 2D retro platformer engine built with **HTML5 Canvas, Vanilla JavaScript (ES6+), and CSS3**. Inspired by classic DOS platformers such as *Dangerous Dave*, featuring original pixel art graphics, axis-separated AABB physics, tile-based level collision, smooth horizontal camera side-scrolling, hazards, collectibles & scoring with visual floating popups, intelligent retro enemies with stomp mechanics, responsive shooting blaster mechanics, level objective completion, and retro arcade presentation.

---

## 🎮 Features Implemented

### 1. Level Objective & Completion System ([src/main.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/main.js) & [src/map.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/map.js))
- **Key Item Objective**: The golden arched exit door at the end of Level 1 (Col 66) is locked until the player retrieves the **Golden Trophy (Chalice)** from the altar in Section 3.
- **Strict Center-Door Collision**: Requires player to be standing genuinely within the doorway frame (prevents accidental triggers from ceilings or adjacent blocks).
- **`LEVEL_COMPLETE` State**:
  - Normal gameplay freezes: player movement, jumping, and shooting are locked.
  - Enemies freeze immediately and cannot damage the player.
  - Projectiles are cleared.
  - Displays a clean retro completion modal showing final level score.
- **Quick Replay / Restart**: Pressing **`Space`**, **`Enter`**, or **`R`** cleanly resets and restarts the level.

### 2. Collectibles & Scoring System ([src/map.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/map.js) & [src/effects.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/effects.js))
- **28 Exploration Collectibles**:
  - **Gold Coins (+100 pts)**: Animated spinning coins.
  - **Ruby Gems (+200 pts)**: Elevated platform gems.
  - **Sapphire Diamonds (+300 pts)**: High-risk crystals over hazard pits.
  - **Golden Trophy (+1000 pts)**: Goal key item.
- **Duplicate Prevention & Score Persistence**: Single-pickup enforcement and persistence through respawns.
- **Visual Effects**: Rising `+100` / `+200` / `+300` / `+1000` text with 5-particle sparkle star bursts.

### 3. Retro Blaster Shooting Mechanic ([src/projectile.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/projectile.js))
- **Directional Shooting (`F` Key)**: Fires high-velocity plasma bolts (`280 px/s`) with a 220ms cooldown.
- **Solid Obstacle & Boundary Destruction**: Destroys projectiles on wall impacts.
- **Enemy Blaster Combat**: Defeats Cyber-Crawlers on impact (+200 pts).

### 4. Cyber-Crawler Enemy System ([src/enemy.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/enemy.js))
- **Patrol AI & Ledge Sensing**: Automatically patrols platforms and reverses at ledges/walls.
- **Jump Stomp Defeat**: Landing on an enemy while falling defeats it (+200 pts) and provides an upward bounce (`vy = -190`).

### 5. Level 1 Layout & Camera
- **70×15 Tile Map (1120px wide)** with smooth lerp side-scrolling camera and 60 FPS performance.

---

## 🕹️ Controls

| Action | Primary Key | Secondary Key |
| :--- | :--- | :--- |
| **Move Left** | `A` | `Left Arrow` (◀) |
| **Move Right** | `D` | `Right Arrow` (▶) |
| **Jump / Stomp** | `W` | `Up Arrow` (▲) / `Space` |
| **Shoot Blaster** | `F` | - |
| **Restart (on Complete)** | `Enter` | `Space` / `R` |
| **Test Death State** | `K` | - |
| **Toggle Telemetry / Hitboxes** | `B` | - |

---

## 🚀 How to Run the Game

1. Start local server:
   ```powershell
   python -m http.server 8000
   ```
2. Navigate in browser to:
   ```
   http://localhost:8000
   ```
