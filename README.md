# 2D Retro Platformer Game (Dave-Inspired Mini-Project)

An authentic 2D retro platformer engine built with **HTML5 Canvas, Vanilla JavaScript (ES6+), and CSS3**. Inspired by classic DOS platformers such as *Dangerous Dave*, featuring original pixel art graphics, axis-separated AABB physics, tile-based level collision, smooth horizontal camera side-scrolling, hazards, collectibles & scoring with visual floating popups, intelligent retro enemies with stomp mechanics, responsive shooting blaster mechanics, and retro arcade presentation.

---

## 🎮 Features Implemented

### 1. Collectibles & Scoring System ([src/map.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/map.js) & [src/effects.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/effects.js))
- **Varied Exploration Collectibles (28 items in Level 1)**:
  - **Gold Coins (+100 pts)**: Animated spinning golden coins with edge shine.
  - **Ruby Gems (+200 pts)**: Multifaceted sparkling red gems on elevated platforms.
  - **Sapphire Diamonds (+300 pts)**: Rare deep-blue diamond crystals on secret ledges and above hazard pits.
  - **Golden Trophy Chalice (+1000 pts)**: Classic key item required to unlock the exit door.
- **Duplicate Pickup Prevention**: Immediate tile clearing upon contact guarantees every item is collected exactly once.
- **Score Persistence**: Score persists across player deaths, respawns, and throughout the level.
- **Visual Collection Effects**: Floating `+100` / `+200` / `+300` / `+1000` text fading upward with matching 5-particle sparkle star bursts.

### 2. Retro Blaster Shooting Mechanic ([src/projectile.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/projectile.js))
- **Directional Shooting (`F` Key)**: Fires plasma bolts in the player's facing direction (`LEFT` or `RIGHT`) at `280 px/s`.
- **Shooting Cooldown (`220ms`)**: Throttles firing rate to prevent object spamming.
- **Solid Wall & Boundary Impacts**: Projectiles self-destruct upon striking solid walls or traveling beyond the map.
- **Enemy Combat**: Defeats Cyber-Crawlers on impact and awards **+200 points**.

### 3. Cyber-Crawler Enemy System ([src/enemy.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/enemy.js))
- **Patrol AI & Boundary Navigation**:
  - Automatically patrols left and right at a steady pace (`45 px/s`).
  - Solid wall rebound upon contact with solid tiles.
  - **Ledge Detection (Respects Platforms)**: Turns around before walking off platform edges.
- **Combat Interactions**:
  - **Jump Stomp Defeat**: Landing on an enemy while falling (`player.vy > 0`) defeats the enemy, awards **+200 points**, and provides an upward bounce impulse (`vy = -190`).
  - **Horizontal Damage**: Touching enemies horizontally defeats the player.

### 4. Complete Level 1 Design ([src/map.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/map.js))
- **70×15 Tile Map Grid (1120px wide)**:
  - Starting Area, Section 1 (Fire Pit), Section 2 (Spike Pit & Wood Girders), Section 3 (Trophy Chamber Altar), and Section 4 (Arched Exit Door).

---

## 🕹️ Controls

| Action | Primary Key | Secondary Key |
| :--- | :--- | :--- |
| **Move Left** | `A` | `Left Arrow` (◀) |
| **Move Right** | `D` | `Right Arrow` (▶) |
| **Jump / Stomp** | `W` | `Up Arrow` (▲) / `Space` |
| **Shoot Blaster** | `F` | - |
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
