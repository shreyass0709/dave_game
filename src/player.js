/**
 * Player Character Class
 * Handles player states, animations, input updates, and retro pixel drawing
 */

export class Player {
  constructor(x = 32, y = 192) {
    // Spatial & Box dimensions
    this.x = x;
    this.y = y;
    this.width = 12;
    this.height = 15;

    // Movement & Physics parameters
    this.vx = 0;
    this.vy = 0;
    this.speed = 110;          // Max horizontal speed (px/sec)
    this.acceleration = 700;   // Ground acceleration
    this.friction = 900;       // Ground deceleration
    this.gravity = 620;        // Downward gravitational acceleration
    this.jumpForce = -230;     // Initial jump impulse
    this.terminalVelocity = 380; // Max fall speed

    // State flags
    this.isGrounded = false;
    this.facingRight = true;
    this.isWalking = false;
    this.isJumping = false;
    this.isFalling = false;

    // Animation state
    this.animTimer = 0;
    this.animFrame = 0; // 0 = Stand, 1 = Walk 1, 2 = Walk 2
  }

  /**
   * Updates horizontal velocity based on input controls
   */
  handleInput(input, dt) {
    const moveLeft = input.isLeft();
    const moveRight = input.isRight();

    if (moveLeft && !moveRight) {
      this.vx = Math.max(this.vx - this.acceleration * dt, -this.speed);
      this.facingRight = false;
      this.isWalking = true;
    } else if (moveRight && !moveLeft) {
      this.vx = Math.min(this.vx + this.acceleration * dt, this.speed);
      this.facingRight = true;
      this.isWalking = true;
    } else {
      // Apply friction to come to a crisp stop
      this.isWalking = false;
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - this.friction * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + this.friction * dt);
      }
    }

    // Jump trigger (only when on ground)
    if (input.wasJumpJustPressed() && this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
    }

    // Variable jump height: release jump button early to shorten jump arc
    if (!input.isJump() && this.vy < -70) {
      this.vy = -70;
    }
  }

  /**
   * Advances animation timers and states
   */
  updateAnimation(dt) {
    if (!this.isGrounded) {
      this.isJumping = this.vy < 0;
      this.isFalling = this.vy >= 0;
    } else {
      this.isJumping = false;
      this.isFalling = false;
    }

    if (this.isWalking && this.isGrounded) {
      this.animTimer += dt;
      if (this.animTimer >= 0.12) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 3;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }
  }

  /**
   * Render Dave-inspired original retro character sprite
   */
  render(ctx) {
    ctx.save();

    // Round coordinates to integer for crisp retro pixel rendering
    const px = Math.round(this.x);
    const py = Math.round(this.y);

    // Apply horizontal flipping if facing left
    if (!this.facingRight) {
      ctx.translate(px + this.width / 2, py + this.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(px + this.width / 2), -(py + this.height / 2));
    }

    this.drawCharacterSprite(ctx, px, py);

    ctx.restore();
  }

  /**
   * Draws the pixel-by-pixel original retro Dave-inspired character
   */
  drawCharacterSprite(ctx, x, y) {
    // Red Cap / Hat
    ctx.fillStyle = '#dc2626'; // Red
    ctx.fillRect(x + 2, y + 0, 8, 3);
    ctx.fillRect(x + 5, y + 2, 6, 2); // Cap visor

    // Face / Skin Tone
    ctx.fillStyle = '#fed7aa'; // Peach/Skin
    ctx.fillRect(x + 3, y + 3, 6, 4);

    // Eye
    ctx.fillStyle = '#0f172a'; // Dark eye dot
    ctx.fillRect(x + 6, y + 4, 2, 2);

    // Blue Shirt / Torso
    ctx.fillStyle = '#2563eb'; // Royal Blue
    ctx.fillRect(x + 2, y + 7, 8, 4);

    // White Shirt Trim / Collar
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 4, y + 7, 2, 2);

    // Legs / Pants / Shoes
    ctx.fillStyle = '#1e3a8a'; // Dark Navy Pants
    const shoeColor = '#78350f'; // Brown Shoes

    if (!this.isGrounded) {
      // In-air / Jump Pose
      ctx.fillRect(x + 1, y + 11, 4, 2);
      ctx.fillRect(x + 7, y + 11, 4, 2);

      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 0, y + 13, 4, 2);
      ctx.fillRect(x + 8, y + 13, 4, 2);
    } else if (this.animFrame === 1) {
      // Walk Frame 1
      ctx.fillRect(x + 1, y + 11, 4, 2);
      ctx.fillRect(x + 6, y + 11, 4, 2);

      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 0, y + 13, 4, 2);
      ctx.fillRect(x + 7, y + 13, 4, 2);
    } else if (this.animFrame === 2) {
      // Walk Frame 2
      ctx.fillRect(x + 3, y + 11, 3, 2);
      ctx.fillRect(x + 6, y + 11, 3, 2);

      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 2, y + 13, 4, 2);
      ctx.fillRect(x + 6, y + 13, 4, 2);
    } else {
      // Standing Idle Frame
      ctx.fillRect(x + 2, y + 11, 3, 2);
      ctx.fillRect(x + 7, y + 11, 3, 2);

      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 1, y + 13, 4, 2);
      ctx.fillRect(x + 7, y + 13, 4, 2);
    }
  }

  /**
   * Render collision bounding box (debug mode)
   */
  renderDebug(ctx) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(this.x) + 0.5, Math.round(this.y) + 0.5, this.width - 1, this.height - 1);
  }
}
