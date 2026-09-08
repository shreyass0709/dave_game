/**
 * Input Manager for Keyboard Controls and Mouse Interaction
 * Tracks gameplay keys, menu navigation, pause triggers, and canvas mouse coordinates
 */
export class InputHandler {
  constructor(canvasElement = null) {
    this.keys = new Set();
    this.justPressed = new Set();
    this.mouse = { x: -1, y: -1, isDown: false, wasClicked: false };
    this.canvas = canvasElement;

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        // Prevent default browser scrolling for game and menu keys
        if ([
          'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
          'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyK', 'KeyB', 'KeyF', 'KeyR', 'KeyP',
          'Enter', 'Escape'
        ].includes(e.code)) {
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

      // Mouse tracking on Canvas
      if (this.canvas) {
        this.attachMouseListeners(this.canvas);
      }

      // Reset input on window blur to avoid stuck keys
      window.addEventListener('blur', () => {
        this.keys.clear();
        this.justPressed.clear();
        this.mouse.isDown = false;
        this.mouse.wasClicked = false;
      });
    }
  }

  attachMouseListeners(canvas) {
    this.canvas = canvas;

    const updateMousePos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
    };

    this.canvas.addEventListener('mousemove', (e) => {
      updateMousePos(e);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      updateMousePos(e);
      this.mouse.isDown = true;
      this.mouse.wasClicked = true;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1;
      this.mouse.y = -1;
      this.mouse.isDown = false;
    });
  }

  // Gameplay Key Queries
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

  wasRestartJustPressed() {
    return this.justPressed.has('Enter') || this.justPressed.has('KeyR') || this.justPressed.has('Space');
  }

  // Menu & Pause Navigation Queries
  wasPauseJustPressed() {
    return this.justPressed.has('KeyP') || this.justPressed.has('Escape');
  }

  wasMenuUp() {
    return this.justPressed.has('ArrowUp') || this.justPressed.has('KeyW');
  }

  wasMenuDown() {
    return this.justPressed.has('ArrowDown') || this.justPressed.has('KeyS');
  }

  wasMenuLeft() {
    return this.justPressed.has('ArrowLeft') || this.justPressed.has('KeyA');
  }

  wasMenuRight() {
    return this.justPressed.has('ArrowRight') || this.justPressed.has('KeyD');
  }

  wasMenuSelect() {
    return this.justPressed.has('Enter') || this.justPressed.has('Space');
  }

  wasMenuBack() {
    return this.justPressed.has('Escape') || this.justPressed.has('KeyB');
  }

  wasDebugToggled() {
    return this.justPressed.has('KeyB');
  }

  wasDeathTestPressed() {
    return this.justPressed.has('KeyK');
  }

  getMousePos() {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  wasMouseClicked() {
    return this.mouse.wasClicked;
  }

  /**
   * Clears single-frame trigger keys and clicks. Must be called at the end of every game frame.
   */
  clearFrame() {
    this.justPressed.clear();
    this.mouse.wasClicked = false;
  }
}

