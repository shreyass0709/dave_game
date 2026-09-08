/**
 * Input Manager for Keyboard Controls
 * Tracks key states, just-pressed triggers, shooting, and buffers
 */
export class InputHandler {
  constructor() {
    this.keys = new Set();
    this.justPressed = new Set();

    window.addEventListener('keydown', (e) => {
      // Prevent default browser scrolling for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyK', 'KeyB', 'KeyF'].includes(e.code)) {
        e.preventDefault();
      }

      if (!this.keys.has(e.code)) {
        this.justPressed.add(e.code);
      }
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    // Reset input on window blur to avoid stuck keys
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.justPressed.clear();
    });
  }

  isLeft() {
    return this.keys.has('KeyA') || this.keys.has('ArrowLeft');
  }

  isRight() {
    return this.keys.has('KeyD') || this.keys.has('ArrowRight');
  }

  isJump() {
    return this.keys.has('Space') || this.keys.has('KeyW') || this.keys.has('ArrowUp');
  }

  wasJumpJustPressed() {
    return this.justPressed.has('Space') || this.justPressed.has('KeyW') || this.justPressed.has('ArrowUp');
  }

  isShoot() {
    return this.keys.has('KeyF');
  }

  wasShootJustPressed() {
    return this.justPressed.has('KeyF');
  }

  wasDebugToggled() {
    return this.justPressed.has('KeyB');
  }

  wasDeathTestPressed() {
    return this.justPressed.has('KeyK');
  }

  /**
   * Clears single-frame trigger keys. Must be called at the end of every game frame.
   */
  clearFrame() {
    this.justPressed.clear();
  }
}
