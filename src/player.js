/**
 * Player Character Class
 * Implements states (Idle, Walking, Jumping, Falling, Dead), facing directions,
 * responsive platformer physics, and original retro pixel sprite rendering.
 */

export const PlayerState = {
  IDLE: 'IDLE',
  WALKING: 'WALKING',
  JUMPING: 'JUMPING',
  FALLING: 'FALLING',
  DEAD: 'DEAD'
};

export const Direction = {
  LEFT: -1,
  RIGHT: 1
};

export class Player {
  constructor(x = 32, y = 192) {
    // Initial spawn coordinates for respawning
    this.spawnX = x;
    this.spawnY = y;

    // Spatial & Bounding dimensions
    this.x = x;
    this.y = y;
    this.width = 12;
    this.height = 15;

    // Movement & Physics parameters
    this.vx = 0;
    this.vy = 0;
    this.speed = 115;            // Max horizontal speed (px/sec)
    this.acceleration = 1100;    // Ground acceleration (crisp and responsive)
    this.friction = 1300;        // Ground deceleration (snappy stopping, no ice-skating)
    this.gravity = 640;          // Downward gravitational acceleration
    this.jumpForce = -235;       // Initial jump impulse
    this.terminalVelocity = 380; // Max fall speed

    // State Management
    this.state = PlayerState.IDLE;
    this.facing = Direction.RIGHT;
    this.isGrounded = false;

    // Platformer "Feel" Helpers: Coyote time & Jump buffering
    this.coyoteTimer = 0;
    this.coyoteTimeMax = 0.09;   // 90ms grace period after walking off edges
    this.jumpBufferTimer = 0;
    this.jumpBufferMax = 0.12;   // 120ms buffer for pre-landing jump press

    // Animation & Death state
    this.animTimer = 0;
    this.animFrame = 0;          // 0 = Stand, 1 = Stride 1, 2 = Stride 2
    this.deathTimer = 0;
    this.deathDuration = 1.5;    // Seconds before respawn
    this.deathRotation = 0;
  }

  /**
   * Process input controls, acceleration, deceleration, and jump triggers
   */
  handleInput(input, dt) {
    if (this.state === PlayerState.DEAD) {
      return; // No input control while in death state
    }

    const moveLeft = input.isLeft();
    const moveRight = input.isRight();

    // 1. Horizontal Movement & Facing Direction
    if (moveLeft && !moveRight) {
      this.vx = Math.max(this.vx - this.acceleration * dt, -this.speed);
      this.facing = Direction.LEFT;
    } else if (moveRight && !moveLeft) {
      this.vx = Math.min(this.vx + this.acceleration * dt, this.speed);
      this.facing = Direction.RIGHT;
    } else {
      // Apply snappy friction when no direction key is held
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - this.friction * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + this.friction * dt);
      }
    }

    // 2. Coyote Time & Jump Buffer Management
    if (this.isGrounded) {
      this.coyoteTimer = this.coyoteTimeMax;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    if (input.wasJumpJustPressed()) {
      this.jumpBufferTimer = this.jumpBufferMax;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // 3. Jump Execution (Trigger if buffer active and either grounded or in coyote window)
    if (this.jumpBufferTimer > 0 && (this.isGrounded || this.coyoteTimer > 0)) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
    }

    // 4. Variable Jump Height: Shorten jump if button is released early
    if (!input.isJump() && this.vy < -75) {
      this.vy = -75;
    }
  }

  /**
   * Advance animations and update state machine
   */
  updateAnimation(dt) {
    // Handle Death State Progression
    if (this.state === PlayerState.DEAD) {
      this.deathTimer += dt;
      this.deathRotation += dt * 720; // Fast retro spin
      if (this.deathTimer >= this.deathDuration) {
        this.respawn();
      }
      return;
    }

    // Determine State (Jumping, Falling, Walking, Idle)
    if (!this.isGrounded) {
      if (this.vy < 0) {
        this.state = PlayerState.JUMPING;
      } else {
        this.state = PlayerState.FALLING;
      }
    } else {
      if (Math.abs(this.vx) > 5) {
        this.state = PlayerState.WALKING;
      } else {
        this.state = PlayerState.IDLE;
      }
    }

    // Advance Walk Animation Frames
    if (this.state === PlayerState.WALKING) {
      this.animTimer += dt;
      if (this.animTimer >= 0.11) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 3;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }
  }

  /**
   * Trigger player death sequence
   */
  die() {
    if (this.state === PlayerState.DEAD) return;

    this.state = PlayerState.DEAD;
    this.vx = 0;
    this.vy = -180; // Classic retro death hop
    this.deathTimer = 0;
    this.deathRotation = 0;
    this.isGrounded = false;
  }

  /**
   * Respawn player at spawn position or specified coordinates
   */
  respawn(x = this.spawnX, y = this.spawnY) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.state = PlayerState.IDLE;
    this.isGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.deathTimer = 0;
  }

  /**
   * Render Dave-inspired original retro character sprite
   */
  render(ctx) {
    ctx.save();

    const px = Math.round(this.x);
    const py = Math.round(this.y);
    const centerX = px + this.width / 2;
    const centerY = py + this.height / 2;

    // Handle Death Render (Rotation + Hop)
    if (this.state === PlayerState.DEAD) {
      ctx.translate(centerX, centerY);
      ctx.rotate((this.deathRotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
      this.drawDeathSprite(ctx, px, py);
      ctx.restore();
      return;
    }

    // Apply horizontal flipping based on facing direction
    if (this.facing === Direction.LEFT) {
      ctx.translate(centerX, centerY);
      ctx.scale(-1, 1);
      ctx.translate(-centerX, -centerY);
    }

    this.drawCharacterSprite(ctx, px, py);

    ctx.restore();
  }

  /**
   * Pixel-by-pixel original retro Dave-inspired character
   */
  drawCharacterSprite(ctx, x, y) {
    // Red Cap / Visor
    ctx.fillStyle = '#dc2626'; // Red Cap
    ctx.fillRect(x + 2, y + 0, 8, 3);
    ctx.fillRect(x + 5, y + 2, 6, 2); // Cap visor

    // Face / Skin Tone
    ctx.fillStyle = '#fed7aa'; // Peach Skin
    ctx.fillRect(x + 3, y + 3, 6, 4);

    // Expressive Eye
    ctx.fillStyle = '#0f172a'; // Dark eye
    ctx.fillRect(x + 6, y + 4, 2, 2);

    // Blue Shirt / Torso
    ctx.fillStyle = '#2563eb'; // Royal Blue Shirt
    ctx.fillRect(x + 2, y + 7, 8, 4);

    // Shirt Collar / Accent
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 4, y + 7, 2, 2);

    // Pants and Shoes
    ctx.fillStyle = '#1e3a8a';   // Navy Pants
    const shoeColor = '#78350f'; // Brown Shoes

    if (this.state === PlayerState.JUMPING) {
      // Jump Pose: Legs tucked up, arms raised forward
      ctx.fillRect(x + 1, y + 10, 4, 3);
      ctx.fillRect(x + 6, y + 10, 4, 3);

      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 0, y + 12, 4, 2);
      ctx.fillRect(x + 7, y + 12, 4, 2);
    } else if (this.state === PlayerState.FALLING) {
      // Fall Pose: Legs slightly extended downwards
      ctx.fillRect(x + 2, y + 11, 3, 3);
      ctx.fillRect(x + 7, y + 11, 3, 3);

      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 1, y + 13, 4, 2);
      ctx.fillRect(x + 7, y + 13, 4, 2);
    } else if (this.state === PlayerState.WALKING) {
      if (this.animFrame === 1) {
        // Walk Stride 1: Left leg forward, right leg back
        ctx.fillRect(x + 1, y + 11, 4, 2);
        ctx.fillRect(x + 6, y + 11, 4, 2);

        ctx.fillStyle = shoeColor;
        ctx.fillRect(x + 0, y + 13, 4, 2);
        ctx.fillRect(x + 7, y + 13, 4, 2);
      } else if (this.animFrame === 2) {
        // Walk Stride 2: Legs crossing
        ctx.fillRect(x + 3, y + 11, 3, 2);
        ctx.fillRect(x + 6, y + 11, 3, 2);

        ctx.fillStyle = shoeColor;
        ctx.fillRect(x + 2, y + 13, 4, 2);
        ctx.fillRect(x + 6, y + 13, 4, 2);
      } else {
        // Walk Passing frame
        ctx.fillRect(x + 2, y + 11, 4, 2);
        ctx.fillRect(x + 6, y + 11, 4, 2);

        ctx.fillStyle = shoeColor;
        ctx.fillRect(x + 1, y + 13, 4, 2);
        ctx.fillRect(x + 6, y + 13, 4, 2);
      }
    } else {
      // Idle / Standing Pose
      ctx.fillRect(x + 2, y + 11, 3, 2);
      ctx.fillRect(x + 7, y + 11, 3, 2);

      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 1, y + 13, 4, 2);
      ctx.fillRect(x + 7, y + 13, 4, 2);
    }
  }

  /**
   * Render death sprite (shocked expression with "X" eyes and disheveled pose)
   */
  drawDeathSprite(ctx, x, y) {
    // Red Cap
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 2, y + 0, 8, 3);
    ctx.fillRect(x + 4, y + 2, 6, 2);

    // Shocked Pale Face
    ctx.fillStyle = '#fef08a'; // Pale yellow/shock tone
    ctx.fillRect(x + 3, y + 3, 6, 4);

    // "X" Eye
    ctx.fillStyle = '#b91c1c'; // Red X
    ctx.fillRect(x + 5, y + 4, 1, 1);
    ctx.fillRect(x + 7, y + 4, 1, 1);
    ctx.fillRect(x + 6, y + 5, 1, 1);
    ctx.fillRect(x + 5, y + 6, 1, 1);
    ctx.fillRect(x + 7, y + 6, 1, 1);

    // Torso
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x + 2, y + 7, 8, 4);

    // Flailing Legs & Shoes
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x + 0, y + 11, 4, 2);
    ctx.fillRect(x + 8, y + 11, 4, 2);

    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 0, y + 13, 4, 2);
    ctx.fillRect(x + 8, y + 13, 4, 2);
  }

  /**
   * Render collision bounding box (debug mode)
   */
  renderDebug(ctx) {
    ctx.strokeStyle = this.state === PlayerState.DEAD ? '#f43f5e' : '#22c55e';
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(this.x) + 0.5, Math.round(this.y) + 0.5, this.width - 1, this.height - 1);
  }
}
