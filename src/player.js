/**
 * Player Character Class
 * Implements states (Idle, Walking, Jumping, Falling, Dead), facing directions,
 * responsive platformer physics, shooting mechanics, and original retro pixel sprite rendering.
 */

import { Projectile } from './projectile.js';

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
    this.acceleration = 1100;    // Ground acceleration
    this.friction = 1300;        // Ground deceleration
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

    // Shooting Mechanics & Cooldown
    this.shootCooldown = 0.22;   // 220ms cooldown between shots (prevents spamming)
    this.shootCooldownTimer = 0;
    this.isShooting = false;
    this.shootPoseTimer = 0;

    // Animation & Death state
    this.animTimer = 0;
    this.animFrame = 0;          // 0 = Stand, 1 = Stride 1, 2 = Stride 2
    this.deathTimer = 0;
    this.deathDuration = 1.5;    // Seconds before respawn
    this.deathRotation = 0;
  }

  /**
   * Can the player shoot right now?
   */
  canShoot() {
    return this.state !== PlayerState.DEAD && this.shootCooldownTimer <= 0;
  }

  /**
   * Process input controls, movement, jumping, and shooting triggers
   * @returns {Projectile | null} Newly fired projectile if shot was triggered
   */
  handleInput(input, dt) {
    if (this.state === PlayerState.DEAD) {
      return null;
    }

    // Advance shooting cooldown
    if (this.shootCooldownTimer > 0) {
      this.shootCooldownTimer = Math.max(0, this.shootCooldownTimer - dt);
    }
    if (this.shootPoseTimer > 0) {
      this.shootPoseTimer = Math.max(0, this.shootPoseTimer - dt);
      if (this.shootPoseTimer <= 0) this.isShooting = false;
    }

    const moveLeft = input.isLeft ? input.isLeft() : false;
    const moveRight = input.isRight ? input.isRight() : false;

    // 1. Horizontal Movement & Facing Direction
    if (moveLeft && !moveRight) {
      this.vx = Math.max(this.vx - this.acceleration * dt, -this.speed);
      this.facing = Direction.LEFT;
    } else if (moveRight && !moveLeft) {
      this.vx = Math.min(this.vx + this.acceleration * dt, this.speed);
      this.facing = Direction.RIGHT;
    } else {
      // Apply friction when no movement key held
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

    if (input.wasJumpJustPressed && input.wasJumpJustPressed()) {
      this.jumpBufferTimer = this.jumpBufferMax;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // 3. Jump Execution
    if (this.jumpBufferTimer > 0 && (this.isGrounded || this.coyoteTimer > 0)) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
    }

    // 4. Variable Jump Height
    if (input.isJump && !input.isJump() && this.vy < -75) {
      this.vy = -75;
    }

    // 5. Shooting Trigger (F key)
    const wantsShoot = (input.wasShootJustPressed && input.wasShootJustPressed()) ||
                       (input.isShoot && input.isShoot());
    if (wantsShoot && this.canShoot()) {
      this.shootCooldownTimer = this.shootCooldown;
      this.isShooting = true;
      this.shootPoseTimer = 0.12;

      // Spawn projectile at player's gun level
      const projX = this.facing === Direction.RIGHT ? this.x + this.width : this.x - 8;
      const projY = this.y + 7;
      return new Projectile(projX, projY, this.facing);
    }

    return null;
  }

  /**
   * Advance animations and update state machine
   */
  updateAnimation(dt) {
    // Handle Death State Progression
    if (this.state === PlayerState.DEAD) {
      this.deathTimer += dt;
      this.deathRotation += dt * 720;
      if (this.deathTimer >= this.deathDuration) {
        this.respawn();
      }
      return;
    }

    // Determine State
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
    this.vy = -180;
    this.deathTimer = 0;
    this.deathRotation = 0;
    this.isGrounded = false;
    this.isShooting = false;
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
    this.shootCooldownTimer = 0;
    this.deathTimer = 0;
    this.isShooting = false;
  }

  /**
   * Render Dave-inspired original retro character sprite with visual feedback
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

    // Jump Stretch / Fall Dynamics
    if (this.state === PlayerState.JUMPING) {
      ctx.translate(centerX, centerY);
      ctx.scale(0.92, 1.08); // Vertical stretch
      ctx.translate(-centerX, -centerY);
    } else if (this.state === PlayerState.FALLING) {
      ctx.translate(centerX, centerY);
      ctx.scale(1.05, 0.95); // Slight wide squash
      ctx.translate(-centerX, -centerY);
    }

    this.drawCharacterSprite(ctx, px, py);

    ctx.restore();
  }

  /**
   * Pixel-by-pixel original retro Dave-inspired character
   */
  drawCharacterSprite(ctx, x, y) {
    // 1. Red Cap / Visor with Shadow Brim
    ctx.fillStyle = '#b91c1c'; // Cap shadow
    ctx.fillRect(x + 2, y + 0, 8, 3);
    ctx.fillStyle = '#ef4444'; // Bright Cap Crown
    ctx.fillRect(x + 3, y + 0, 6, 2);
    ctx.fillStyle = '#dc2626'; // Visor Brim
    ctx.fillRect(x + 5, y + 2, 6, 2);

    // 2. Face / Skin Tone
    ctx.fillStyle = '#fed7aa'; // Warm Peach Skin
    ctx.fillRect(x + 3, y + 3, 6, 4);

    // 3. Expressive Eye (with periodic blink)
    const isBlinking = Math.sin(this.animTimer * 1.5) > 0.96;
    if (isBlinking) {
      ctx.fillStyle = '#78350f'; // Closed eye lash
      ctx.fillRect(x + 6, y + 4, 2, 1);
    } else {
      ctx.fillStyle = '#0f172a'; // Pupil
      ctx.fillRect(x + 6, y + 4, 2, 2);
      ctx.fillStyle = '#ffffff'; // White glint
      ctx.fillRect(x + 7, y + 4, 1, 1);
    }

    // 4. Blue Shirt / Jacket
    ctx.fillStyle = '#1d4ed8'; // Shadow Blue
    ctx.fillRect(x + 2, y + 7, 8, 4);
    ctx.fillStyle = '#3b82f6'; // Bright Blue jacket front
    ctx.fillRect(x + 3, y + 7, 6, 3);

    // Gun / Arm Shooting Extension
    if (this.isShooting) {
      ctx.fillStyle = '#475569'; // Blaster metal
      ctx.fillRect(x + 8, y + 8, 5, 2);
      ctx.fillStyle = '#06b6d4'; // Cyan Muzzle glow
      ctx.fillRect(x + 12, y + 7, 2, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 13, y + 8, 1, 2);
    } else {
      // White Shirt Collar & Brass Zipper
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + 4, y + 7, 2, 1);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 4, y + 8, 1, 2);
    }

    // 5. Belt with Golden Buckle
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 2, y + 10, 8, 1);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 5, y + 10, 2, 1);

    // 6. Navy Pants and Brown Boots
    ctx.fillStyle = '#1e3a8a';   // Navy Pants
    const shoeColor = '#78350f'; // Dark Brown
    const shoeHighlight = '#b45309';

    if (this.state === PlayerState.JUMPING) {
      ctx.fillRect(x + 1, y + 11, 4, 2);
      ctx.fillRect(x + 6, y + 11, 4, 2);

      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 0, y + 12, 4, 2);
      ctx.fillRect(x + 7, y + 12, 4, 2);
      ctx.fillStyle = shoeHighlight;
      ctx.fillRect(x + 0, y + 12, 2, 1);
      ctx.fillRect(x + 7, y + 12, 2, 1);
    } else if (this.state === PlayerState.FALLING) {
      ctx.fillRect(x + 2, y + 11, 3, 2);
      ctx.fillRect(x + 7, y + 11, 3, 2);

      ctx.fillStyle = shoeColor;
      ctx.fillRect(x + 1, y + 13, 4, 2);
      ctx.fillRect(x + 7, y + 13, 4, 2);
    } else if (this.state === PlayerState.WALKING) {
      if (this.animFrame === 1) {
        ctx.fillRect(x + 1, y + 11, 4, 2);
        ctx.fillRect(x + 6, y + 11, 4, 2);

        ctx.fillStyle = shoeColor;
        ctx.fillRect(x + 0, y + 13, 4, 2);
        ctx.fillRect(x + 7, y + 13, 4, 2);
        ctx.fillStyle = shoeHighlight;
        ctx.fillRect(x + 0, y + 13, 2, 1);
      } else if (this.animFrame === 2) {
        ctx.fillRect(x + 3, y + 11, 3, 2);
        ctx.fillRect(x + 6, y + 11, 3, 2);

        ctx.fillStyle = shoeColor;
        ctx.fillRect(x + 2, y + 13, 4, 2);
        ctx.fillRect(x + 6, y + 13, 4, 2);
        ctx.fillStyle = shoeHighlight;
        ctx.fillRect(x + 7, y + 13, 2, 1);
      } else {
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
   * Render death sprite
   */
  drawDeathSprite(ctx, x, y) {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 2, y + 0, 8, 3);
    ctx.fillRect(x + 4, y + 2, 6, 2);

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 3, y + 3, 6, 4);

    // Dizzy X eyes
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(x + 4, y + 4, 1, 1);
    ctx.fillRect(x + 6, y + 4, 1, 1);
    ctx.fillRect(x + 5, y + 5, 1, 1);
    ctx.fillRect(x + 4, y + 6, 1, 1);
    ctx.fillRect(x + 6, y + 6, 1, 1);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x + 2, y + 7, 8, 4);

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
