# 2D Retro Platformer Game (Dave-Inspired Mini-Project)

An authentic 2D retro platformer engine built with **HTML5 Canvas, Vanilla JavaScript (ES6+), and CSS3**. Inspired by classic DOS platformers such as *Dangerous Dave*, featuring original pixel art graphics, axis-separated AABB physics, tile-based level collision, and retro arcade presentation.

---

## 🎮 Features Implemented

### 1. Enhanced Player Character System
- **Comprehensive State Machine**:
  - `IDLE`: Stationary grounded state with classic standing pose.
  - `WALKING`: Active left/right locomotion with 3-frame animated walk cycle.
  - `JUMPING`: Ascending in-air state (`vy < 0`) with bent knees and raised arms.
  - `FALLING`: Descending in-air state (`vy >= 0`) with extended fall pose.
  - `DEAD`: Death animation foundation (upward hop, tumbling spin with shocked "X" eyes, input lock, and auto-respawn timer).
- **Directional Facing**:
  - Seamless horizontal mirroring (`LEFT` / `RIGHT`) for all animations.
- **Responsive Platformer Feel**:
  - Snappy acceleration (`1100 px/s²`) and crisp friction stopping (`1300 px/s²`, no ice-skating).
  - **Coyote Time** (90ms grace period to jump after stepping off a platform edge).
  - **Jump Buffering** (120ms pre-landing jump window).
  - **Variable Jump Height** (tap jump for a short hop, hold jump for full height).
  - Strict anti-air jump protection (no infinite jumps).

### 2. Physics & Level Engine
- **Axis-Separated AABB Collision Solver**:
  - Independent X and Y axis collision resolution against solid tile maps.
  - Guarantees zero clipping through floors or walls, smooth traversal under overhead platforms, and solid ceiling bonks.
- **25×15 Tile Map Layout (400×240 native retro resolution)**:
  - Procedurally textured EGA-style red bricks with mortar lines.
  - Metallic steel blocks with corner rivets.
  - Floating platforms, ledges, and steps.

### 3. Retro Presentation & Diagnostics
- **Arcade Bezel & Scanlines**: Responsive retro cabinet frame with CRT scanline overlays.
- **Authentic Top HUD**: Top banner with `SCORE`, `LEVEL`, and `DAVES` (lives).
- **Developer / Viva Diagnostics**: Press `B` to toggle live telemetry (State, Facing, Pos, Vel, Grounded, FPS, and hitboxes).

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

### Method 1: Using Python (Recommended)
```bash
python -m http.server 8000
```
Open your browser and navigate to:
```
http://localhost:8000
```

### Method 2: Using Node.js
```bash
npx serve .
```

---

## 📂 Project Structure

```
dave_game/
├── index.html         # HTML5 canvas container and arcade cabinet wrapper
├── style.css          # Retro styling, arcade frame, and CRT scanlines
├── README.md          # Project documentation and guide
└── src/
    ├── main.js        # Engine initialization, game loop, and HUD renderer
    ├── input.js       # Keyboard event manager and input state handler
    ├── player.js      # Player state machine, physics parameters, and sprite renderer
    ├── map.js         # Tile grid definitions, layout, and pixel textures
    └── physics.js     # Axis-separated AABB tile collision solver
```
