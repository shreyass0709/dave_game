# 2D Retro Platformer Game (Dave-Inspired Mini-Project)

An authentic 2D retro platformer engine built with **HTML5 Canvas, Vanilla JavaScript (ES6+), and CSS3**. Inspired by classic DOS platformers such as *Dangerous Dave*, featuring original pixel art graphics, axis-separated AABB physics, tile-based level collision, and retro arcade presentation.

---

## 🎮 Features Implemented (Phase 1 Foundation)

1. **Game Canvas & Resolution**:
   - Native 400x240 retro resolution scaled with crisp, pixel-perfect rendering (`image-rendering: pixelated`).
   - Authentic CRT scanline overlay and retro arcade cabinet bezel.
2. **Game Loop**:
   - Smooth 60 FPS game loop using `requestAnimationFrame` and delta-time (`dt`) physics calculation.
3. **Physics & Gravity Engine**:
   - Deterministic gravity, terminal fall velocity, acceleration, and crisp friction braking.
   - Variable jump height (releasing the jump key early caps jump height).
4. **Collision Detection System**:
   - Axis-separated AABB (Axis-Aligned Bounding Box) vs Tile Grid collision solver.
   - Prevents player from falling through platforms or clipping into walls.
   - Handles ceiling bonks and overhead platforms seamlessly.
5. **Player Character & Animation**:
   - Original pixel-art character sprite (Dave-inspired hero with red cap, peach skin, blue shirt, dark trousers, brown boots).
   - Animated walk cycle, jumping pose, idle pose, and directional flipping.
6. **Tile Map & Retro Visuals**:
   - Red brick platforms with mortar lines and highlights.
   - Metallic steel blocks with corner rivets.
   - Dave-inspired retro top status HUD (Score, Level, Lives/Daves).
7. **Developer / Viva Diagnostics**:
   - Real-time debug telemetry overlay (`B` key) showing player coordinates, velocities, grounded state, and FPS.

---

## 🕹️ Controls

| Action | Primary Key | Secondary Key |
| :--- | :--- | :--- |
| **Move Left** | `A` | `Left Arrow` (◀) |
| **Move Right** | `D` | `Right Arrow` (▶) |
| **Jump** | `W` | `Up Arrow` (▲) / `Space` |
| **Toggle Debug / Hitbox** | `B` | - |

---

## 🚀 How to Run the Game

### Method 1: Using Python (Recommended)
From the project folder, start the local server:
```bash
python -m http.server 8000
```
Open your browser and navigate to:
```
http://localhost:8000
```

### Method 2: Using Node.js (Alternative)
```bash
npx serve .
```

### Method 3: VS Code Live Server
Right-click `index.html` and select **"Open with Live Server"**.

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
    ├── player.js      # Player state, physics parameters, and sprite renderer
    ├── map.js         # Tile grid definitions, layout, and pixel textures
    └── physics.js     # Axis-separated AABB tile collision solver
```

---

## 🎓 College Viva / Technical Explanation Points

- **Why use Axis-Separated Collision?**  
  Separating horizontal and vertical collision steps ensures the solver knows exactly which axis caused an overlap, preventing "corner catching" and guaranteeing zero pass-through glitches.
- **Why use Delta-Time (`dt`) in Physics?**  
  Scaling velocities and accelerations by `dt` (`player.x += player.vx * dt`) ensures that game physics and movement speed remain identical across different refresh rate monitors (60Hz, 144Hz, etc.).
- **Zero External Dependencies**:  
  Built entirely using standard Web APIs without heavy game engines, making the codebase clean, modular, and easy to explain.
