# 2D Retro Platformer Game (Dave-Inspired Mini-Project)

An authentic 2D retro platformer engine built with **HTML5 Canvas, Vanilla JavaScript (ES6+), and CSS3**. Inspired by classic DOS platformers such as *Dangerous Dave*, featuring original pixel art graphics, axis-separated AABB physics, tile-based level collision, smooth horizontal camera side-scrolling, hazards, collectibles, and retro arcade presentation.

---

## 🎮 Features Implemented

### 1. Complete Playable Level 1 Design ([src/map.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/map.js))
- **70×15 Tile Map Layout (1120px wide)**:
  - **Starting Area (Cols 0..9)**: Safe spawn zone, intro jumping platform, and first Sapphire Gem.
  - **Section 1: The Fire Pit & Stepping Stones (Cols 10..22)**: Gentle gap challenge, high platform, and first enemy station marker.
  - **Section 2: Multi-Tier Platforms & Spikes (Cols 23..44)**: Spike hazard pit, elevated wood girder platforms, secret high ledge, and gems.
  - **Section 3: The High Trophy Chamber (Cols 45..58)**: Lava pit crossing leading up to the high altar holding the **Golden Trophy (Key Item)**.
  - **Section 4: The Goal & Exit Portal (Cols 59..69)**: Victory pillars and the arched golden exit door.
- **Fair & Achievable Level Geometry**:
  - Max jump height is 43px (~2.7 tiles); all platform steps are <= 2 tiles high (32px).
  - Horizontal jump reach is ~84px; all jump gaps are <= 3.5 tiles (56px) for fair, satisfying platforming.

### 2. Smooth Horizontal Camera / Side-Scrolling ([src/camera.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/camera.js))
- Smooth horizontal lerp camera that centers on the player as they traverse the world.
- Viewport boundary clamping (`0` to `720px`).
- Subpixel rounding (`Math.round`) to eliminate pixel jitter and shimmering.
- Viewport tile culling in the renderer for high-performance 60 FPS gameplay.

### 3. Collectibles, Hazards, and Exit Mechanics ([src/physics.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/physics.js))
- **Sapphire Gems**: Shimmering blue gems (+100 pts) placed across risk/reward routes.
- **Golden Trophy (Key Item)**: Classic Dave chalice item (+1000 pts) needed to unlock the exit door.
- **Hazards (Fire & Spikes)**: Animated flickering fire and sharp spikes that trigger the death sequence on touch.
- **Exit Door & Objective Flow**:
  - Approaching the exit door without the trophy prompts: *"GO FIND THE GOLDEN TROPHY FIRST!"*.
  - Reaching the door with the trophy triggers: *"LEVEL 1 COMPLETE! EXCELLENT!"*.

### 4. Player Character System ([src/player.js](file:///c:/Users/shrey/OneDrive/Desktop/dave_game/src/player.js))
- Complete state machine: `IDLE`, `WALKING`, `JUMPING`, `FALLING`, `DEAD`.
- Directional facing (`LEFT` / `RIGHT`) with sprite flipping.
- Coyote time (90ms) and jump buffering (120ms).
- Anti-infinite jump prevention and zero platform clipping.

---

## 🕹️ Controls

| Action | Primary Key | Secondary Key |
| :--- | :--- | :--- |
| **Move Left** | `A` | `Left Arrow` (◀) |
| **Move Right** | `D` | `Right Arrow` (▶) |
| **Jump** | `W` | `Up Arrow` (▲) / `Space` |
| **Test Death State** | `K` | - |
| **Toggle Telemetry / Hitboxes** | `B` | - |

---

## 🚀 How to Run the Game

1. Start a local server:
   ```powershell
   python -m http.server 8000
   ```
2. Navigate in browser to:
   ```
   http://localhost:8000
   ```
