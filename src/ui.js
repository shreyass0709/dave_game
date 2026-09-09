/**
 * Modern Retro UI Design System & Manager
 * Implements a cohesive design language: "Retro gameplay + modern animated indie game interface"
 * Provides design tokens, typography system, reusable UIButton components,
 * reusable UIPanel / modal card containers, motion easing utilities, and screen state renders.
 */

// =============================================================================
// 1. DESIGN TOKENS & PALETTE
// =============================================================================
export const UITokens = {
  // Brand & Accent Colors
  primary: '#38bdf8',               // Electric Cyan (interactive focus / primary actions)
  primaryGlow: 'rgba(56, 189, 248, 0.45)',
  primaryDark: '#0284c7',
  
  secondary: '#a855f7',             // Cyber Violet (settings / secondary accents)
  secondaryGlow: 'rgba(168, 85, 247, 0.45)',
  secondaryDark: '#7e22ce',
  
  gold: '#facc15',                  // Radiant Gold (trophy, scores, victory)
  goldGlow: 'rgba(250, 204, 21, 0.45)',
  goldDark: '#ca8a04',
  
  success: '#22c55e',               // Emerald Green (play, next level, active checkpoints)
  successGlow: 'rgba(34, 197, 94, 0.45)',
  successDark: '#16a34a',
  
  danger: '#ef4444',                // Laser Red (game over, quit, hazard warnings)
  dangerGlow: 'rgba(239, 68, 68, 0.45)',
  dangerDark: '#dc2626',
  
  disabled: '#475569',              // Slate Gray (locked / disabled)
  disabledGlow: 'rgba(71, 85, 105, 0.2)',

  // Surfaces & Backgrounds
  bgApp: '#060813',
  bgCabinet: '#111726',
  bgPanel: '#0b1120',
  bgPanelOverlay: 'rgba(11, 17, 32, 0.94)',
  bgButton: '#0f172a',
  bgButtonHover: '#1e293b',
  bgButtonActive: '#334155',

  // Borders & Specular Highlights
  borderDefault: '#1e293b',
  borderHighlight: 'rgba(255, 255, 255, 0.2)',
  borderActive: '#38bdf8',

  // Typography Palette
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textDark: '#020617',

  // Metrics & Typography
  fontFamily: '"Press Start 2P", monospace',
  fontSizeTitle: '14px',
  fontSizeSection: '10px',
  fontSizeButton: '8px',
  fontSizeBody: '7px',
  fontSizeSmall: '6px'
};

// =============================================================================
// 2. MOTION & ANIMATION UTILITIES
// =============================================================================
export class UIAnimation {
  /**
   * Linear interpolation helper
   */
  static lerp(a, b, t) {
    return a + (b - a) * Math.min(1, Math.max(0, t));
  }

  /**
   * Quadratic ease-out curve
   */
  static easeOutQuad(t) {
    return t * (2 - t);
  }

  /**
   * Back ease-out for bouncy popups
   */
  static easeOutBack(t, overshoot = 1.4) {
    const c1 = overshoot;
    const c3 = c1 + 1;
    const p = t - 1;
    return 1 + c3 * Math.pow(p, 3) + c1 * Math.pow(p, 2);
  }

  /**
   * Sine wave pulse oscillation helper between min and max
   */
  static getPulse(timer, speed = 4, min = 0, max = 1) {
    const s = (Math.sin(timer * speed) + 1) * 0.5;
    return min + s * (max - min);
  }
}

// =============================================================================
// 3. TYPOGRAPHY SYSTEM
// =============================================================================
export class UITypography {
  /**
   * Renders standardized text with optional drop shadow, glow, and alignment
   */
  static drawText(ctx, text, x, y, {
    size = '8px',
    color = UITokens.textPrimary,
    align = 'center',
    baseline = 'middle',
    shadow = true,
    shadowColor = '#020617',
    shadowOffset = 1.5,
    glow = false,
    glowColor = UITokens.primaryGlow
  } = {}) {
    ctx.save();
    ctx.font = `${size} ${UITokens.fontFamily}`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    if (shadow) {
      ctx.fillStyle = shadowColor;
      ctx.fillText(text, x + shadowOffset, y + shadowOffset);
    }

    if (glow) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6;
    }

    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }
}

// =============================================================================
// 4. REUSABLE MODERN BUTTON COMPONENT
// =============================================================================
export class UIButton {
  constructor({
    id,
    label,
    x,
    y,
    width = 140,
    height = 20,
    variant = 'primary',
    color = null,
    badge = '',
    disabled = false
  }) {
    this.id = id;
    this.label = label;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.variant = variant;
    this.customColor = color;
    this.badge = badge;
    this.disabled = disabled;

    // Animation & Feedback States
    this.hoverProgress = 0;   // Smooth 0 -> 1 hover interpolation
    this.pressProgress = 0;   // 0 -> 1 click feedback
    this.animTimer = 0;
  }

  /**
   * Resolves theme color and glowing accent for this button variant
   */
  getThemeColors() {
    if (this.customColor) {
      return {
        accent: this.customColor,
        glow: this.customColor.startsWith('#') ? `${this.customColor}66` : UITokens.primaryGlow,
        dark: UITokens.borderDefault
      };
    }

    switch (this.variant) {
      case 'success':
        return { accent: UITokens.success, glow: UITokens.successGlow, dark: UITokens.successDark };
      case 'secondary':
        return { accent: UITokens.secondary, glow: UITokens.secondaryGlow, dark: UITokens.secondaryDark };
      case 'gold':
        return { accent: UITokens.gold, glow: UITokens.goldGlow, dark: UITokens.goldDark };
      case 'danger':
        return { accent: UITokens.danger, glow: UITokens.dangerGlow, dark: UITokens.dangerDark };
      case 'primary':
      default:
        return { accent: UITokens.primary, glow: UITokens.primaryGlow, dark: UITokens.primaryDark };
    }
  }

  contains(px, py) {
    return px >= this.x && px <= this.x + this.width &&
           py >= this.y && py <= this.y + this.height;
  }

  update(dt, isActive = false) {
    this.animTimer += dt;
    const targetHover = isActive ? 1 : 0;
    this.hoverProgress = UIAnimation.lerp(this.hoverProgress, targetHover, 12 * dt);

    if (this.pressProgress > 0) {
      this.pressProgress = Math.max(0, this.pressProgress - 6 * dt);
    }
  }

  triggerPress() {
    this.pressProgress = 1.0;
  }

  render(ctx, isSelected, isHovered = false, slideOffsetX = 0, alpha = 1.0) {
    if (alpha <= 0.01) return;
    const active = isSelected || isHovered;
    const theme = this.getThemeColors();

    ctx.save();
    if (alpha < 1.0) {
      ctx.globalAlpha *= alpha;
    }

    const drawX = this.x + slideOffsetX;

    // Calculate scale transform for interactive hover & press feedback
    const scale = active ? 1.025 : (1.0 - this.pressProgress * 0.04);
    const centerX = drawX + this.width / 2;
    const centerY = this.y + this.height / 2;

    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    // 1. Ambient Glow Backing on Active
    if (active && !this.disabled) {
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 8;
    }

    // 2. Button Body Surface
    ctx.fillStyle = active ? UITokens.bgButtonHover : UITokens.bgButton;
    ctx.fillRect(drawX, this.y, this.width, this.height);

    // Reset shadow blur for crisp borders
    ctx.shadowBlur = 0;

    // 3. Double-Beveled Border
    ctx.strokeStyle = active ? theme.accent : UITokens.borderDefault;
    ctx.lineWidth = active ? 2 : 1;
    ctx.strokeRect(drawX, this.y, this.width, this.height);

    // 4. Specular Top Lip & Side Shine
    ctx.fillStyle = active ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(drawX + 1, this.y + 1, this.width - 2, 2);
    ctx.fillRect(drawX + 1, this.y + 1, 2, this.height - 2);

    // 5. Active Corner Cyber-Accents
    if (active) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(drawX, this.y, 2, 2);
      ctx.fillRect(drawX + this.width - 2, this.y, 2, 2);
      ctx.fillRect(drawX, this.y + this.height - 2, 2, 2);
      ctx.fillRect(drawX + this.width - 2, this.y + this.height - 2, 2, 2);
    }

    // 6. Button Typography & Animated Side Indicators
    ctx.font = `8px ${UITokens.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textY = this.y + this.height / 2 + 1;

    if (active && !this.disabled) {
      // Animated Chevrons pulsing horizontally
      const chevronPulse = Math.sin(this.animTimer * 8) * 1.5;
      ctx.fillStyle = theme.accent;
      ctx.fillText('▶', drawX + 10 - chevronPulse, textY);
      ctx.fillText('◀', drawX + this.width - 10 + chevronPulse, textY);

      // Bright white label with deep drop shadow
      ctx.fillStyle = '#020617';
      ctx.fillText(this.label, centerX + 1.5, textY + 1.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.label, centerX, textY);
    } else {
      // Non-active button: High contrast crisp text with dark shadow
      ctx.fillStyle = '#020617';
      ctx.fillText(this.label, centerX + 1, textY + 1);
      ctx.fillStyle = this.disabled ? '#64748b' : '#f1f5f9';
      ctx.fillText(this.label, centerX, textY);
    }

    // 7. Optional Badge (e.g. [ON] / [OFF] / [LVL 1])
    if (this.badge) {
      ctx.font = `6px ${UITokens.fontFamily}`;
      ctx.textAlign = 'end';
      const badgeX = drawX + this.width - 8;
      // Drop shadow for badge
      ctx.fillStyle = '#020617';
      ctx.fillText(this.badge, badgeX + 1, textY + 1);
      ctx.fillStyle = active ? '#ffffff' : (theme.accent || '#38bdf8');
      ctx.fillText(this.badge, badgeX, textY);
    }

    ctx.restore();
  }
}

// =============================================================================
// 5. REUSABLE MODERN PANEL / MODAL CARD COMPONENT
// =============================================================================
export class UIPanel {
  /**
   * Renders a modern glassmorphic card frame with cyber-tech corner brackets and header
   */
  static render(ctx, {
    x,
    y,
    width,
    height,
    title = '',
    subtitle = '',
    variant = 'primary',
    customColor = null,
    badge = '',
    showBackdrop = true,
    screenWidth = 400,
    screenHeight = 240
  }) {
    ctx.save();

    // 1. Fullscreen Dimming Backdrop
    if (showBackdrop) {
      ctx.fillStyle = 'rgba(4, 6, 14, 0.85)';
      ctx.fillRect(0, 0, screenWidth, screenHeight);
    }

    // 2. Resolve Border & Accent Theme
    let accentColor = UITokens.primary;
    let glowColor = UITokens.primaryGlow;

    if (customColor) {
      accentColor = customColor;
      glowColor = customColor.startsWith('#') ? `${customColor}55` : UITokens.primaryGlow;
    } else if (variant === 'success') {
      accentColor = UITokens.success;
      glowColor = UITokens.successGlow;
    } else if (variant === 'danger') {
      accentColor = UITokens.danger;
      glowColor = UITokens.dangerGlow;
    } else if (variant === 'gold') {
      accentColor = UITokens.gold;
      glowColor = UITokens.goldGlow;
    } else if (variant === 'secondary') {
      accentColor = UITokens.secondary;
      glowColor = UITokens.secondaryGlow;
    }

    // 3. Card Ambient Shadow
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;

    // 4. Panel Surface (Dark Glassmorphic Fill)
    ctx.fillStyle = UITokens.bgPanelOverlay;
    ctx.fillRect(x, y, width, height);

    ctx.shadowBlur = 0;

    // 5. Double Beveled Border Frame
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Inner subtle specular border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 3, y + 3, width - 6, height - 6);

    // 6. Corner Cyber-Tech Accents (L-Brackets)
    ctx.fillStyle = '#ffffff';
    // Top-Left
    ctx.fillRect(x, y, 4, 2);
    ctx.fillRect(x, y, 2, 4);
    // Top-Right
    ctx.fillRect(x + width - 4, y, 4, 2);
    ctx.fillRect(x + width - 2, y, 2, 4);
    // Bottom-Left
    ctx.fillRect(x, y + height - 2, 4, 2);
    ctx.fillRect(x, y + height - 4, 2, 4);
    // Bottom-Right
    ctx.fillRect(x + width - 4, y + height - 2, 4, 2);
    ctx.fillRect(x + width - 2, y + height - 4, 2, 4);

    // 7. Title Header & Divider
    if (title) {
      const headerCenterY = y + 22;

      // Drop shadow
      UITypography.drawText(ctx, title, x + width / 2, headerCenterY, {
        size: '10px',
        color: accentColor,
        align: 'center',
        shadow: true,
        glow: true,
        glowColor: glowColor
      });

      // Subtitle if provided
      if (subtitle) {
        UITypography.drawText(ctx, subtitle, x + width / 2, y + 36, {
          size: '7px',
          color: UITokens.textMuted,
          align: 'center',
          shadow: false
        });
      }

      // Glowing Accent Header Divider Line
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 16, y + (subtitle ? 46 : 34));
      ctx.lineTo(x + width - 16, y + (subtitle ? 46 : 34));
      ctx.stroke();
    }

    ctx.restore();
  }
}

// =============================================================================
// 6. UI MANAGER & SCREEN RENDERERS
// =============================================================================
export class UIManager {
  constructor() {
    this.animTimer = 0;
    this.menuTimer = 0;
    this.levelSelectTimer = 0;
    this.instructionsTimer = 0;
    this.settingsTimer = 0;
    this.pauseTimer = 0;
    this.gameOverTimer = 0;
    this.levelCompleteTimer = 0;
    this.victoryTimer = 0;
    this.settings = {
      soundFX: true,
      music: true,
      crtFilter: true
    };

    // HUD Dynamic Animation States
    this.scorePulseTimer = 0;
    this.trophyAcquiredTimer = 0;
    this.levelIntroTimer = 0;
    this.levelIntroNumber = 1;
    this.checkpointBannerTimer = 0;
    this.checkpointBannerText = '';
    this.lastObservedScore = 0;
    this.lastObservedTrophy = false;

    // Pre-allocated particles for atmospheric background
    this.bgParticles = [];
    for (let i = 0; i < 28; i++) {
      this.bgParticles.push({
        x: (i * 14.5 + Math.sin(i * 1.7) * 40 + 400) % 400,
        y: (i * 8.7 + Math.cos(i * 2.3) * 30 + 240) % 240,
        vx: (i % 3 === 0 ? 9 : 5) * ((i % 2 === 0) ? 1 : 0.7),
        vy: -3 - (i % 4) * 1.2,
        size: (i % 5 === 0) ? 2 : 1,
        color: (i % 4 === 0) ? UITokens.gold : (i % 3 === 0 ? UITokens.secondary : UITokens.primary),
        phase: i * 0.4
      });
    }

    // Pre-allocated cosmic stars for Grand Victory celebration
    this.victoryStars = [];
    for (let i = 0; i < 40; i++) {
      this.victoryStars.push({
        x: (i * 23.7 + 17) % 400,
        y: (i * 19.3 + 11) % 240,
        size: (i % 3 === 0) ? 2 : 1,
        phase: i * 0.35,
        speed: 1.5 + (i % 4) * 0.8
      });
    }

    // Pre-allocated celebration confetti for Grand Victory
    this.victoryConfetti = [];
    for (let i = 0; i < 30; i++) {
      this.victoryConfetti.push({
        x: (i * 27.3 + 30) % 360 + 20,
        y: (i * 13.5 + 40) % 200 + 20,
        color: ['#facc15', '#38bdf8', '#34d399', '#f43f5e', '#a855f7'][i % 5],
        speed: 18 + (i % 4) * 12,
        rotSpeed: 2.0 + (i % 4) * 1.5,
        phase: i * 0.5
      });
    }

    // Pre-allocated warp speed lines for cinematic level transition
    this.warpSpeedLines = [];
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2 + (i % 2 === 0 ? 0.08 : -0.08);
      this.warpSpeedLines.push({
        angle: angle,
        dist: 10 + (i * 13) % 220,
        speed: 260 + (i % 6) * 60,
        length: 12 + (i % 5) * 14,
        color: i % 3 === 0 ? '#facc15' : (i % 2 === 0 ? '#38bdf8' : '#ffffff')
      });
    }
  }

  resetMenuAnimation() {
    this.menuTimer = 0;
  }

  resetLevelSelectAnimation() {
    this.levelSelectTimer = 0;
  }

  resetInstructionsAnimation() {
    this.instructionsTimer = 0;
  }

  resetSettingsAnimation() {
    this.settingsTimer = 0;
  }

  resetPauseAnimation() {
    this.pauseTimer = 0;
  }

  resetGameOverAnimation() {
    this.gameOverTimer = 0;
  }

  resetLevelCompleteAnimation() {
    this.levelCompleteTimer = 0;
  }

  resetVictoryAnimation() {
    this.victoryTimer = 0;
  }

  triggerScorePulse() {
    this.scorePulseTimer = 0.35;
  }

  triggerTrophyAcquisition() {
    this.trophyAcquiredTimer = 1.5;
  }

  triggerLevelIntro(levelNumber = 1) {
    this.levelIntroNumber = levelNumber;
    this.levelIntroTimer = 2.8;
  }

  triggerCheckpointNotification(text = 'CHECKPOINT ACTIVATED') {
    this.checkpointBannerText = text;
    this.checkpointBannerTimer = 2.0;
  }

  update(dt) {
    this.animTimer += dt;
    this.menuTimer += dt;
    this.levelSelectTimer += dt;
    this.instructionsTimer += dt;
    this.settingsTimer += dt;
    this.pauseTimer += dt;
    this.gameOverTimer += dt;
    this.levelCompleteTimer += dt;
    this.victoryTimer += dt;

    if (this.scorePulseTimer > 0) this.scorePulseTimer = Math.max(0, this.scorePulseTimer - dt);
    if (this.trophyAcquiredTimer > 0) this.trophyAcquiredTimer = Math.max(0, this.trophyAcquiredTimer - dt);
    if (this.levelIntroTimer > 0) this.levelIntroTimer = Math.max(0, this.levelIntroTimer - dt);
    if (this.checkpointBannerTimer > 0) this.checkpointBannerTimer = Math.max(0, this.checkpointBannerTimer - dt);

    // Update background particles with smooth wrap-around
    for (let i = 0; i < this.bgParticles.length; i++) {
      const p = this.bgParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x > 405) p.x = -5;
      if (p.y < -5) p.y = 245;
    }

    // Update victory confetti
    for (let i = 0; i < this.victoryConfetti.length; i++) {
      const c = this.victoryConfetti[i];
      c.y += c.speed * dt;
      if (c.y > 245) c.y = -5;
    }

    // Update warp speed lines
    for (let i = 0; i < this.warpSpeedLines.length; i++) {
      const line = this.warpSpeedLines[i];
      line.dist += line.speed * dt;
      if (line.dist > 280) {
        line.dist = 6;
      }
    }
  }

  /**
   * Screen 1: Cinematic Modern Retro Main Menu with Hero Preview & Cyber Accents
   */
  renderMainMenu(ctx, width, height, selectedIndex, buttons) {
    // 1. Layered Atmospheric Background with Radial Gradient
    const bgGradient = ctx.createRadialGradient(
      width * 0.5, height * 0.4, 10,
      width * 0.5, height * 0.5, width * 0.75
    );
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(0.5, '#080d1a');
    bgGradient.addColorStop(1, '#03050a');

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Dynamic Scrolling Isometric Cyber Floor Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.09)';
    ctx.lineWidth = 1;

    const horizonY = 135;
    const vpX = 200;
    for (let angle = -1.2; angle <= 1.2; angle += 0.3) {
      ctx.beginPath();
      ctx.moveTo(vpX, horizonY);
      ctx.lineTo(vpX + Math.tan(angle) * (height - horizonY) * 2.2, height);
      ctx.stroke();
    }

    const gridScroll = (this.animTimer * 28) % 20;
    for (let base = 145; base <= 245; base += 18) {
      const y = base + gridScroll;
      if (y >= 140 && y <= height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 3. Floating Atmospheric Energy Motes / Star Particles
    ctx.save();
    for (let i = 0; i < this.bgParticles.length; i++) {
      const p = this.bgParticles[i];
      const pulseAlpha = 0.35 + 0.55 * (Math.sin(this.animTimer * 3.5 + p.phase) * 0.5 + 0.5);
      ctx.globalAlpha = pulseAlpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.restore();

    // 4. Outer Cyber Frame & Corner L-Brackets
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.fillStyle = UITokens.primary;
    // Top-Left
    ctx.fillRect(8, 8, 6, 2);
    ctx.fillRect(8, 8, 2, 6);
    // Top-Right
    ctx.fillRect(width - 14, 8, 6, 2);
    ctx.fillRect(width - 10, 8, 2, 6);
    // Bottom-Left
    ctx.fillRect(8, height - 10, 6, 2);
    ctx.fillRect(8, height - 14, 2, 6);
    // Bottom-Right
    ctx.fillRect(width - 14, height - 10, 6, 2);
    ctx.fillRect(width - 10, height - 14, 2, 6);

    // 5. Minimal Cyber-HUD Header Status Badges
    const readyPulse = Math.sin(this.animTimer * 5) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(74, 222, 128, ${readyPulse})`;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('● SYSTEM: READY', 18, 16);

    UITypography.drawText(ctx, 'DAVE-ENGINE v2.4 PRO', width - 18, 16, {
      size: '6px',
      color: '#93c5fd',
      align: 'right',
      shadow: false
    });

    // 6. Animated Title Entrance & Settle
    const titleEnter = Math.min(1, this.menuTimer / 0.55);
    const titleEase = UIAnimation.easeOutBack(titleEnter, 1.15);
    const titleScale = UIAnimation.lerp(0.85, 1.0, titleEase);
    const titleY = UIAnimation.lerp(20, 36, titleEase);
    const titleAlpha = UIAnimation.easeOutQuad(titleEnter);

    ctx.save();
    ctx.globalAlpha = titleAlpha;
    ctx.translate(width / 2, titleY);
    ctx.scale(titleScale, titleScale);

    // Ambient gold glow behind title
    const glowPulse = UIAnimation.getPulse(this.animTimer, 2.5, 0.4, 0.85);
    ctx.shadowColor = `rgba(250, 204, 21, ${glowPulse})`;
    ctx.shadowBlur = 14;

    // Dual-layer crisp title typography
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Drop shadow
    ctx.fillStyle = '#020617';
    ctx.fillText('DANGEROUS ADVENTURE', 1.5, 1.5);

    // Radiant Gold Fill
    ctx.fillStyle = UITokens.gold;
    ctx.fillText('DANGEROUS ADVENTURE', 0, 0);

    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('~ A RETRO PLATFORMER ~', 0, 16);

    // Glowing divider line with diamond pip
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-110, 24);
    ctx.lineTo(-12, 24);
    ctx.moveTo(12, 24);
    ctx.lineTo(110, 24);
    ctx.stroke();

    ctx.fillStyle = UITokens.gold;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('✦', 0, 24);

    ctx.restore();

    // 7. Hero Preview Character on Floating Hologram Pedestal (Left Side)
    this.renderHeroPreview(ctx, 82, 134, this.animTimer);

    // 8. Staggered Animated Menu Buttons (Right Side)
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      btn.update(0.016, i === selectedIndex);

      const btnEnterDelay = 0.12 + i * 0.07;
      const btnProgress = Math.min(1, Math.max(0, (this.menuTimer - btnEnterDelay) / 0.3));
      const btnEase = UIAnimation.easeOutQuad(btnProgress);
      const slideOffsetX = (1 - btnEase) * 35;
      const btnAlpha = btnEase;

      btn.render(ctx, i === selectedIndex, false, slideOffsetX, btnAlpha);
    }

    // 9. Footer Navigation Legend (Crisp readable text)
    UITypography.drawText(ctx, '[W/S / ARROWS] NAVIGATE   [ENTER/SPACE] SELECT   MOUSE CLICK', width / 2, height - 16, {
      size: '6px',
      color: '#cbd5e1',
      align: 'center',
      shadow: true,
      shadowColor: '#020617'
    });
  }

  /**
   * Renders decorative Dave hero character on a floating tech hologram pedestal
   */
  renderHeroPreview(ctx, x, y, animTimer) {
    ctx.save();

    // 1. Floating Hologram Base Pedestal
    const baseBob = Math.sin(animTimer * 2) * 1.5;
    const baseY = y + 42 + baseBob;

    // Upward soft blue light beam
    const beamGrad = ctx.createLinearGradient(x, baseY, x, y - 10);
    beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
    beamGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.09)');
    beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(x - 30, baseY);
    ctx.lineTo(x - 18, y - 10);
    ctx.lineTo(x + 18, y - 10);
    ctx.lineTo(x + 30, baseY);
    ctx.closePath();
    ctx.fill();

    // Pedestal Plate (Glassmorphic ellipse)
    ctx.fillStyle = '#0b1329';
    ctx.beginPath();
    ctx.ellipse(x, baseY, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = UITokens.primaryGlow;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner specular ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, baseY, 22, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Hologram upward particle motes
    for (let i = 0; i < 4; i++) {
      const moteX = x + Math.sin(animTimer * 2.5 + i * 1.5) * 16;
      const moteY = baseY - ((animTimer * 20 + i * 12) % 36);
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(Math.round(moteX), Math.round(moteY), 1.5, 1.5);
    }

    // 2. Decorative Hero Sprite (Scaled Pixel Character with Idle Bobbing)
    const charBobY = Math.sin(animTimer * 3.2) * 2;
    const px = Math.round(x - 12);
    const py = Math.round(y + charBobY);

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(1.8, 1.8);

    // Red Cap
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(2, 0, 9, 3);
    ctx.fillRect(0, 2, 13, 2);
    // Cap peak
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(8, 3, 5, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 1, 2, 1);

    // Face / Skin
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(2, 4, 8, 4);
    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(7, 4, 1, 2);
    // Nose / smile
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(8, 6, 2, 1);

    // White Undershirt
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(2, 7, 8, 3);

    // Blue Denim Overalls
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(1, 8, 10, 4);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(3, 7, 2, 4);
    ctx.fillRect(7, 7, 2, 4);
    // Brass buckles
    ctx.fillStyle = '#facc15';
    ctx.fillRect(3, 8, 1, 1);
    ctx.fillRect(7, 8, 1, 1);

    // Pants / Legs
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(2, 12, 3, 2);
    ctx.fillRect(7, 12, 3, 2);

    // Boots
    ctx.fillStyle = '#78350f';
    ctx.fillRect(1, 14, 4, 2);
    ctx.fillRect(7, 14, 4, 2);

    // Plasma Blaster in hand
    ctx.fillStyle = '#64748b';
    ctx.fillRect(8, 8, 6, 2);
    ctx.fillStyle = '#334155';
    ctx.fillRect(7, 9, 2, 3);
    // Blaster tip spark
    const sparkPulse = Math.sin(animTimer * 8) > 0;
    ctx.fillStyle = sparkPulse ? '#38bdf8' : '#67e8f9';
    ctx.fillRect(14, 8, 2, 2);

    ctx.restore();

    // 3. Hero Label & Subtitle (Crisp high-contrast typography)
    UITypography.drawText(ctx, 'AGENT DAVE', x, baseY + 14, {
      size: '7px',
      color: UITokens.gold,
      align: 'center',
      shadow: true,
      shadowColor: '#020617',
      glow: true,
      glowColor: UITokens.goldGlow
    });

    UITypography.drawText(ctx, 'COMBAT READY', x, baseY + 23, {
      size: '6px',
      color: '#38bdf8',
      align: 'center',
      shadow: true,
      shadowColor: '#020617'
    });

    ctx.restore();
  }

  /**
   * Screen 1.5: Dedicated Modern Level Selection Screen with Interactive Mission Cards
   */
  renderLevelSelect(ctx, width, height, selectedLevelIndex, backButton, {
    unlockedLevels = 1,
    completedLevels = new Set(),
    highScores = {}
  } = {}) {
    // 1. Atmosphere Shift Background based on selected level
    const themeHues = ['#0c2338', '#1c1038', '#330e18'];
    const activeHue = themeHues[selectedLevelIndex] || '#0f172a';

    const bgGradient = ctx.createRadialGradient(
      width * 0.5, height * 0.4, 10,
      width * 0.5, height * 0.5, width * 0.75
    );
    bgGradient.addColorStop(0, activeHue);
    bgGradient.addColorStop(0.5, '#080d1a');
    bgGradient.addColorStop(1, '#03050a');

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Perspective Floor Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    const horizonY = 145;
    const vpX = 200;
    for (let angle = -1.2; angle <= 1.2; angle += 0.3) {
      ctx.beginPath();
      ctx.moveTo(vpX, horizonY);
      ctx.lineTo(vpX + Math.tan(angle) * (height - horizonY) * 2.2, height);
      ctx.stroke();
    }
    const hGridLines = [160, 180, 205, 235];
    for (let y of hGridLines) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Floating Background Particles
    ctx.save();
    for (let i = 0; i < this.bgParticles.length; i++) {
      const p = this.bgParticles[i];
      const pulseAlpha = 0.2 + 0.5 * (Math.sin(this.animTimer * 3 + p.phase) * 0.5 + 0.5);
      ctx.globalAlpha = pulseAlpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.restore();

    // 4. Outer Cyber Frame & Corner L-Brackets
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.fillStyle = UITokens.primary;
    ctx.fillRect(8, 8, 6, 2); ctx.fillRect(8, 8, 2, 6);
    ctx.fillRect(width - 14, 8, 6, 2); ctx.fillRect(width - 10, 8, 2, 6);
    ctx.fillRect(8, height - 10, 6, 2); ctx.fillRect(8, height - 14, 2, 6);
    ctx.fillRect(width - 14, height - 10, 6, 2); ctx.fillRect(width - 10, height - 14, 2, 6);

    // 5. Header: "SELECT MISSION" & "CHOOSE YOUR NEXT ADVENTURE"
    const headerEnter = Math.min(1, this.levelSelectTimer / 0.45);
    const headerEase = UIAnimation.easeOutBack(headerEnter, 1.1);
    const headerY = UIAnimation.lerp(12, 22, headerEase);
    const headerAlpha = UIAnimation.easeOutQuad(headerEnter);

    ctx.save();
    ctx.globalAlpha = headerAlpha;
    UITypography.drawText(ctx, 'SELECT MISSION', width / 2, headerY, {
      size: '11px',
      color: UITokens.gold,
      align: 'center',
      shadow: true,
      glow: true,
      glowColor: UITokens.goldGlow
    });

    UITypography.drawText(ctx, 'CHOOSE YOUR NEXT ADVENTURE', width / 2, headerY + 14, {
      size: '7px',
      color: UITokens.primary,
      align: 'center',
      shadow: false
    });

    // Header divider line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, headerY + 21);
    ctx.lineTo(width / 2 - 12, headerY + 21);
    ctx.moveTo(width / 2 + 12, headerY + 21);
    ctx.lineTo(width / 2 + 120, headerY + 21);
    ctx.stroke();

    ctx.fillStyle = UITokens.gold;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('✦', width / 2, headerY + 21);
    ctx.restore();

    // 6. Level Cards Configuration
    const levelCards = [
      {
        level: 1,
        num: '01',
        title: 'TRAINING VAULT',
        themeColor: UITokens.primary,
        glowColor: UITokens.primaryGlow,
        stars: '★☆☆☆☆',
        starsColor: '#38bdf8',
        desc: 'Master platforming, gather diamonds & collect the Golden Trophy.',
        x: 18,
        y: 48,
        w: 114,
        h: 142
      },
      {
        level: 2,
        num: '02',
        title: 'CYBER FACTORY',
        themeColor: UITokens.secondary,
        glowColor: UITokens.secondaryGlow,
        stars: '★★★☆☆',
        starsColor: '#a855f7',
        desc: 'Traverse moving girders, toxic pipes & patrolling slime guards.',
        x: 143,
        y: 48,
        w: 114,
        h: 142
      },
      {
        level: 3,
        num: '03',
        title: 'DAVE FORTRESS',
        themeColor: UITokens.danger,
        glowColor: UITokens.dangerGlow,
        stars: '★★★★★',
        starsColor: '#ef4444',
        desc: 'Ascend fortress spires over deep molten lava to final victory.',
        x: 268,
        y: 48,
        w: 114,
        h: 142
      }
    ];

    // Render 3 Level Cards
    for (let i = 0; i < levelCards.length; i++) {
      const card = levelCards[i];
      const isSelected = (i === selectedLevelIndex);
      const isUnlocked = card.level <= unlockedLevels;
      const isCompleted = completedLevels && (completedLevels.has ? completedLevels.has(card.level) : (completedLevels.includes && completedLevels.includes(card.level)));
      const bestScore = (highScores && highScores[card.level]) || 0;

      // Staggered Entrance Animation
      const cardDelay = 0.08 + i * 0.08;
      const cardProgress = Math.min(1, Math.max(0, (this.levelSelectTimer - cardDelay) / 0.35));
      const cardEase = UIAnimation.easeOutBack(cardProgress, 1.05);
      const slideOffsetY = (1 - cardEase) * 25;
      const cardAlpha = UIAnimation.easeOutQuad(cardProgress);

      this.renderLevelCard(ctx, {
        ...card,
        y: card.y + slideOffsetY,
        isSelected,
        isUnlocked,
        isCompleted,
        bestScore,
        alpha: cardAlpha,
        animTimer: this.animTimer
      });
    }

    // 7. Back Button & Controls Legend
    if (backButton) {
      backButton.update(0.016, selectedLevelIndex === 3);
      backButton.render(ctx, selectedLevelIndex === 3, false);
    }

    // Navigation guide
    UITypography.drawText(ctx, '[◄/►] SELECT MISSION   [ENTER] LAUNCH   [ESC] BACK', width / 2 + 35, height - 16, {
      size: '6px',
      color: UITokens.textMuted,
      align: 'center',
      shadow: true
    });
  }

  /**
   * Renders an individual stylized Level Card
   */
  renderLevelCard(ctx, {
    level,
    num,
    title,
    themeColor,
    glowColor,
    stars,
    starsColor,
    desc,
    x,
    y,
    w,
    h,
    isSelected,
    isUnlocked,
    isCompleted,
    bestScore,
    alpha = 1.0,
    animTimer = 0
  }) {
    if (alpha <= 0.01) return;

    ctx.save();
    if (alpha < 1.0) ctx.globalAlpha *= alpha;

    const scale = isSelected ? 1.03 : 1.0;
    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    // 1. Ambient Glow when Selected
    if (isSelected && isUnlocked) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 12;
    }

    // 2. Card Surface Fill
    ctx.fillStyle = isSelected
      ? (isUnlocked ? 'rgba(15, 23, 42, 0.96)' : 'rgba(15, 23, 42, 0.7)')
      : 'rgba(8, 12, 22, 0.92)';
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;

    // 3. Card Border Frame
    ctx.strokeStyle = isSelected
      ? (isUnlocked ? themeColor : UITokens.disabled)
      : (isUnlocked ? 'rgba(56, 189, 248, 0.3)' : '#1e293b');
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(x, y, w, h);

    // Specular inner sheen
    ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(x + 1, y + 1, w - 2, 1);
    ctx.fillRect(x + 1, y + 1, 1, h - 2);

    // 4. Corner Cyber-Tech Accents
    if (isSelected) {
      ctx.fillStyle = isUnlocked ? '#ffffff' : UITokens.disabled;
      ctx.fillRect(x, y, 3, 2); ctx.fillRect(x, y, 2, 3);
      ctx.fillRect(x + w - 3, y, 3, 2); ctx.fillRect(x + w - 2, y, 2, 3);
      ctx.fillRect(x, y + h - 2, 3, 2); ctx.fillRect(x, y + h - 3, 2, 3);
      ctx.fillRect(x + w - 3, y + h - 2, 3, 2); ctx.fillRect(x + w - 2, y + h - 3, 2, 3);
    }

    // 5. Header: LEVEL number & status badge
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = isUnlocked ? UITokens.textPrimary : UITokens.disabled;
    ctx.fillText(`LVL ${num}`, x + 6, y + 6);

    ctx.textAlign = 'right';
    if (isCompleted) {
      ctx.fillStyle = UITokens.gold;
      ctx.fillText('★ CLEARED', x + w - 6, y + 6);
    } else if (isUnlocked) {
      ctx.fillStyle = UITokens.success;
      ctx.fillText('ACTIVE', x + w - 6, y + 6);
    } else {
      ctx.fillStyle = UITokens.disabled;
      ctx.fillText('🔒 LOCKED', x + w - 6, y + 6);
    }

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = isUnlocked ? themeColor : UITokens.disabled;
    ctx.font = '6.5px "Press Start 2P", monospace';
    ctx.fillText(title, cx, y + 18);

    // 6. Stylized Mini-Environment Thumbnail
    this.renderMiniThumbnail(ctx, x + 6, y + 28, w - 12, 32, level, isUnlocked, animTimer);

    // 7. Difficulty & Best Score
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText('DIFF:', x + 6, y + 66);
    ctx.fillStyle = isUnlocked ? starsColor : UITokens.disabled;
    ctx.fillText(stars, x + 38, y + 66);

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText('BEST:', x + 6, y + 76);
    ctx.fillStyle = bestScore > 0 ? UITokens.gold : UITokens.textSecondary;
    ctx.fillText(bestScore > 0 ? `${bestScore} PTS` : '---', x + 38, y + 76);

    // 8. Description lines (Compact multi-line rendering)
    ctx.fillStyle = isUnlocked ? UITokens.textSecondary : UITokens.disabled;
    ctx.font = '5.5px "Press Start 2P", monospace';
    const words = desc.split(' ');
    let line1 = '';
    let line2 = '';
    for (let w of words) {
      if ((line1 + w).length < 18) {
        line1 += (line1 ? ' ' : '') + w;
      } else {
        line2 += (line2 ? ' ' : '') + w;
      }
    }
    ctx.fillText(line1, x + 6, y + 88);
    if (line2) ctx.fillText(line2, x + 6, y + 97);

    // 9. Bottom Launch Prompt / Status Tag
    const tagY = y + h - 18;
    ctx.textAlign = 'center';
    if (isSelected && isUnlocked) {
      ctx.fillStyle = UITokens.bgButtonHover;
      ctx.fillRect(x + 6, tagY, w - 12, 14);
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 6, tagY, w - 12, 14);

      ctx.fillStyle = '#ffffff';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText('▶ LAUNCH [ENTER]', cx, tagY + 4);
    } else if (isUnlocked) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(x + 6, tagY, w - 12, 14);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 6, tagY, w - 12, 14);

      ctx.fillStyle = UITokens.textMuted;
      ctx.font = '5.5px "Press Start 2P", monospace';
      ctx.fillText('[CLICK / ENTER]', cx, tagY + 4);
    } else {
      ctx.fillStyle = 'rgba(71, 85, 105, 0.1)';
      ctx.fillRect(x + 6, tagY, w - 12, 14);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 6, tagY, w - 12, 14);

      ctx.fillStyle = UITokens.disabled;
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText(`BEAT LVL ${level - 1}`, cx, tagY + 4);
    }

    ctx.restore();
  }

  /**
   * Renders pixel-art stylized environment thumbnail for level cards
   */
  renderMiniThumbnail(ctx, tx, ty, tw, th, level, isUnlocked, animTimer) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(tx, ty, tw, th);
    ctx.clip();

    if (level === 1) {
      // Level 1: Vault / Ruins
      ctx.fillStyle = '#061324';
      ctx.fillRect(tx, ty, tw, th);

      ctx.fillStyle = '#0f2942';
      ctx.fillRect(tx, ty + 18, tw, th - 18);

      ctx.fillStyle = '#991b1b';
      ctx.fillRect(tx + 6, ty + 20, 30, 6);
      ctx.fillRect(tx + 42, ty + 12, 28, 6);
      ctx.fillRect(tx + 75, ty + 22, 22, 6);

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(tx + 6, ty + 20, 30, 2);
      ctx.fillRect(tx + 42, ty + 12, 28, 2);
      ctx.fillRect(tx + 75, ty + 22, 22, 2);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(tx + 18, ty + 15, 3, 3);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(tx + 54, ty + 7, 3, 3);
    } else if (level === 2) {
      // Level 2: Cyber Factory
      ctx.fillStyle = '#150a26';
      ctx.fillRect(tx, ty, tw, th);

      ctx.fillStyle = '#334155';
      ctx.fillRect(tx + 4, ty + 20, 40, 5);
      ctx.fillRect(tx + 50, ty + 14, 46, 5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(tx + 4, ty + 20, 40, 1);
      ctx.fillRect(tx + 50, ty + 14, 46, 1);

      ctx.fillStyle = '#a855f7';
      ctx.fillRect(tx + 70, ty + 4, 8, 10);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(tx + 73, ty + 14, 2, 4);

      ctx.fillStyle = '#facc15';
      ctx.fillRect(tx + 20, ty + 28, 4, 4);
      ctx.fillRect(tx + 30, ty + 28, 4, 4);
    } else if (level === 3) {
      // Level 3: Dave Fortress
      ctx.fillStyle = '#22080d';
      ctx.fillRect(tx, ty, tw, th);

      ctx.fillStyle = '#3b0713';
      ctx.fillRect(tx + 8, ty + 8, 20, 24);
      ctx.fillRect(tx + 48, ty + 12, 34, 20);

      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(tx + 8, ty + 8, 4, 3);
      ctx.fillRect(tx + 16, ty + 8, 4, 3);
      ctx.fillRect(tx + 24, ty + 8, 4, 3);

      ctx.fillStyle = '#ea580c';
      ctx.fillRect(tx, ty + 26, tw, 6);
      ctx.fillStyle = '#facc15';
      const lavaPulse = Math.sin(animTimer * 6) * 1.5;
      ctx.fillRect(tx + 24 + lavaPulse, ty + 27, 16, 2);

      ctx.fillStyle = '#facc15';
      ctx.fillRect(tx + 62, ty + 5, 6, 6);
    }

    if (!isUnlocked) {
      ctx.fillStyle = 'rgba(4, 6, 14, 0.78)';
      ctx.fillRect(tx, ty, tw, th);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒 LOCKED', tx + tw / 2, ty + th / 2);
    }

    ctx.restore();

    ctx.strokeStyle = isUnlocked ? 'rgba(56, 189, 248, 0.4)' : '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, ty, tw, th);
  }

  /**
   * Screen 2: Modern Animated In-Game HUD
   */
  renderHUD(ctx, width, height, { lives = 3, score = 0, level = 1, hasTrophy = false }) {
    // Detect score changes automatically if triggerScorePulse wasn't called directly
    if (score !== this.lastObservedScore) {
      if (score > this.lastObservedScore) {
        this.scorePulseTimer = 0.35;
      }
      this.lastObservedScore = score;
    }
    // Detect trophy state change
    if (hasTrophy && !this.lastObservedTrophy) {
      this.trophyAcquiredTimer = 1.5;
    }
    this.lastObservedTrophy = hasTrophy;

    ctx.save();

    // 1. TOP HUD GLASSMORPHIC BAR
    const barH = 20;
    ctx.fillStyle = 'rgba(8, 13, 26, 0.92)';
    ctx.fillRect(0, 0, width, barH);

    // Specular top edge highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, 0, width, 1);

    // Bottom accent border
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.fillRect(0, barH - 1, width, 1);

    // Accent corner badges
    ctx.fillStyle = UITokens.primary;
    ctx.fillRect(0, 0, 3, 2);
    ctx.fillRect(width - 3, 0, 3, 2);

    // =========================================================================
    // 2. LEFT: ❤️ LIVES & HEALTH STATUS
    // =========================================================================
    const isLowLife = (lives <= 1);
    const lifePulse = isLowLife ? (Math.sin(this.animTimer * 10) * 0.5 + 0.5) : 0;

    const heartStartX = 8;
    const heartY = 6;
    for (let i = 0; i < 3; i++) {
      const hx = heartStartX + i * 11;
      const isAlive = i < lives;
      const isCurrentHeart = (i === lives - 1);
      const bobY = (isAlive && isLowLife && isCurrentHeart) ? Math.round(Math.sin(this.animTimer * 10) * 1.5) : 0;

      if (isAlive) {
        ctx.fillStyle = isLowLife ? `rgba(239, 68, 68, ${0.7 + lifePulse * 0.3})` : UITokens.danger;
        // Draw crisp 7x7 pixel heart
        ctx.fillRect(hx + 1, heartY + bobY, 2, 2);
        ctx.fillRect(hx + 4, heartY + bobY, 2, 2);
        ctx.fillRect(hx, heartY + 2 + bobY, 7, 3);
        ctx.fillRect(hx + 1, heartY + 5 + bobY, 5, 1);
        ctx.fillRect(hx + 2, heartY + 6 + bobY, 3, 1);
        ctx.fillRect(hx + 3, heartY + 7 + bobY, 1, 1);

        // Specular highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx + 1, heartY + 1 + bobY, 1, 1);
      } else {
        // Empty heart outline
        ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.fillRect(hx + 1, heartY, 2, 2);
        ctx.fillRect(hx + 4, heartY, 2, 2);
        ctx.fillRect(hx, heartY + 2, 7, 3);
        ctx.fillRect(hx + 1, heartY + 5, 5, 1);
        ctx.fillRect(hx + 3, heartY + 6, 1, 1);
        ctx.fillStyle = 'rgba(8, 13, 26, 0.9)';
        ctx.fillRect(hx + 1, heartY + 2, 5, 2);
      }
    }

    // Lives counter text
    ctx.font = '6.5px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = isLowLife ? '#fca5a5' : UITokens.textPrimary;
    ctx.fillText(`x${lives}`, heartStartX + 36, barH / 2);

    if (isLowLife) {
      ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + lifePulse * 0.6})`;
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText(`WARN`, heartStartX + 54, barH / 2);
    }

    // =========================================================================
    // 3. CENTER: 💎 SCORE WITH DYNAMIC INCREASE PULSE
    // =========================================================================
    const scoreText = `SCORE ${String(score).padStart(5, '0')}`;
    const scoreCenterX = width / 2;

    ctx.save();
    if (this.scorePulseTimer > 0) {
      const pulseProgress = this.scorePulseTimer / 0.35;
      const scoreScale = 1.0 + 0.15 * Math.sin(pulseProgress * Math.PI);
      ctx.translate(scoreCenterX, barH / 2);
      ctx.scale(scoreScale, scoreScale);
      ctx.translate(-scoreCenterX, -barH / 2);

      ctx.shadowColor = UITokens.goldGlow;
      ctx.shadowBlur = 8;
    }

    // Score pill background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(scoreCenterX - 52, 2, 104, 16);
    ctx.strokeStyle = this.scorePulseTimer > 0 ? UITokens.gold : 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(scoreCenterX - 52, 2, 104, 16);

    ctx.font = '6.5px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.scorePulseTimer > 0 ? '#fef08a' : UITokens.gold;
    ctx.fillText(scoreText, scoreCenterX, barH / 2);
    ctx.restore();

    // =========================================================================
    // 4. RIGHT: LEVEL BADGE & TROPHY OBJECTIVE
    // =========================================================================
    const lvlText = `LVL ${level}`;
    const lvlX = width - 122;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(lvlX, 2, 40, 16);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(lvlX, 2, 40, 16);

    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = UITokens.primary;
    ctx.fillText(lvlText, lvlX + 20, barH / 2);

    // Trophy Status Badge
    const trophyX = width - 78;
    const trophyW = 72;
    const isTrophyFlashing = this.trophyAcquiredTimer > 0;
    const trophyPulse = isTrophyFlashing ? (Math.sin(this.animTimer * 16) * 0.5 + 0.5) : 0;

    ctx.save();
    if (hasTrophy) {
      ctx.fillStyle = isTrophyFlashing ? `rgba(34, 197, 94, ${0.3 + trophyPulse * 0.4})` : 'rgba(34, 197, 94, 0.15)';
      ctx.fillRect(trophyX, 2, trophyW, 16);
      ctx.strokeStyle = isTrophyFlashing ? '#4ade80' : UITokens.success;
      ctx.lineWidth = 1;
      if (isTrophyFlashing) {
        ctx.shadowColor = UITokens.goldGlow;
        ctx.shadowBlur = 10;
      }
      ctx.strokeRect(trophyX, 2, trophyW, 16);

      ctx.font = '5.5px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isTrophyFlashing ? '#ffffff' : '#4ade80';
      ctx.fillText('🏆 [ACQUIRED]', trophyX + trophyW / 2, barH / 2);
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(trophyX, 2, trophyW, 16);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(trophyX, 2, trophyW, 16);

      ctx.font = '5.5px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = UITokens.textMuted;
      ctx.fillText('🏆 [SEEK]', trophyX + trophyW / 2, barH / 2);
    }
    ctx.restore();

    // =========================================================================
    // 5. CINEMATIC LEVEL INTRO NOTIFICATION BANNER
    // =========================================================================
    if (this.levelIntroTimer > 0) {
      const introProgress = this.levelIntroTimer / 2.8;
      let introAlpha = 1.0;
      if (introProgress < 0.2) {
        introAlpha = introProgress / 0.2;
      } else if (introProgress > 0.85) {
        introAlpha = (1.0 - introProgress) / 0.15;
      }

      const cardW = 232;
      const cardH = 26;
      const cardX = (width - cardW) / 2;
      const cardY = 26;

      const levelNames = {
        1: 'THE LOST VAULT',
        2: 'CYBER FACTORY',
        3: 'DAVE FORTRESS'
      };
      const currentLevelName = levelNames[level] || `SECTOR ${level}`;

      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, introAlpha));

      ctx.fillStyle = 'rgba(11, 17, 32, 0.94)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1;
      ctx.shadowColor = UITokens.primaryGlow;
      ctx.shadowBlur = 8;
      ctx.strokeRect(cardX, cardY, cardW, cardH);
      ctx.shadowBlur = 0;

      UITypography.drawText(ctx, `MISSION 0${level}: ${currentLevelName}`, width / 2, cardY + 7, {
        size: '6px',
        color: UITokens.gold,
        align: 'center',
        shadow: true
      });

      UITypography.drawText(ctx, 'OBJECTIVE: RETRIEVE GOLDEN TROPHY & ESCAPE', width / 2, cardY + 17, {
        size: '5px',
        color: UITokens.primary,
        align: 'center',
        shadow: false
      });

      ctx.restore();
    }

    // =========================================================================
    // 6. TEMPORARY CHECKPOINT ACTIVATION NOTIFICATION
    // =========================================================================
    if (this.checkpointBannerTimer > 0) {
      const bannerProgress = this.checkpointBannerTimer / 2.0;
      const bannerAlpha = bannerProgress < 0.25 ? (bannerProgress / 0.25) : (bannerProgress > 0.85 ? (1.0 - bannerProgress) / 0.15 : 1.0);

      const bannerW = 210;
      const bannerH = 20;
      const bannerX = (width - bannerW) / 2;
      const bannerY = 28;

      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, bannerAlpha));

      ctx.fillStyle = 'rgba(6, 78, 59, 0.92)';
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(52, 211, 153, 0.6)';
      ctx.shadowBlur = 10;
      ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);
      ctx.shadowBlur = 0;

      UITypography.drawText(ctx, '⚡ CHECKPOINT ACTIVATED • SPAWN SAVED', width / 2, bannerY + 10, {
        size: '5.5px',
        color: '#a7f3d0',
        align: 'center',
        shadow: true
      });

      ctx.restore();
    }

    // =========================================================================
    // 7. SUBTLE PAUSE HINT IN BOTTOM CORNER
    // =========================================================================
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.fillText('[P / ESC] PAUSE', width - 6, height - 4);

    ctx.restore();
  }

  /**
   * Screen 3: Modern Cinematic Pause Menu Overlay
   */
  renderPauseMenu(ctx, width, height, selectedIndex, buttons, meta = {}) {
    const currentLevel = meta.currentLevel || 1;
    const score = meta.score || 0;
    const hasTrophy = meta.hasTrophy || false;
    const hasCheckpoint = meta.hasCheckpoint || false;

    const levelNames = {
      1: 'THE LOST VAULT',
      2: 'CYBER FACTORY',
      3: 'DAVE FORTRESS'
    };
    const levelTitle = levelNames[currentLevel] || `SECTOR 0${currentLevel}`;

    // 1. Dark Translucent Backdrop with Vignette
    ctx.save();
    ctx.fillStyle = 'rgba(3, 7, 18, 0.76)';
    ctx.fillRect(0, 0, width, height);

    // 2. Entrance Animation
    const pauseEnter = Math.min(1, this.pauseTimer / 0.35);
    const pauseEase = UIAnimation.easeOutBack(pauseEnter, 1.08);
    const pauseScale = UIAnimation.lerp(0.92, 1.0, pauseEase);
    const pauseAlpha = UIAnimation.easeOutQuad(pauseEnter);

    const boxW = 270;
    const boxH = 184;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    ctx.globalAlpha = pauseAlpha;
    ctx.translate(width / 2, height / 2);
    ctx.scale(pauseScale, pauseScale);
    ctx.translate(-width / 2, -height / 2);

    // 3. Glassmorphic Modal Panel
    ctx.fillStyle = 'rgba(11, 17, 32, 0.94)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1;
    ctx.shadowColor = UITokens.primaryGlow;
    ctx.shadowBlur = 12;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.shadowBlur = 0;

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(boxX + 1, boxY + 1, boxW - 2, 1);

    // Corner Tech Accents
    ctx.fillStyle = UITokens.primary;
    ctx.fillRect(boxX, boxY, 5, 2); ctx.fillRect(boxX, boxY, 2, 5);
    ctx.fillRect(boxX + boxW - 5, boxY, 5, 2); ctx.fillRect(boxX + boxW - 2, boxY, 2, 5);
    ctx.fillRect(boxX, boxY + boxH - 2, 5, 2); ctx.fillRect(boxX, boxY + boxH - 5, 2, 5);
    ctx.fillRect(boxX + boxW - 5, boxY + boxH - 2, 5, 2); ctx.fillRect(boxX + boxW - 2, boxY + boxH - 5, 2, 5);

    // 4. Header Section
    UITypography.drawText(ctx, 'GAME PAUSED', width / 2, boxY + 16, {
      size: '10px',
      color: UITokens.gold,
      align: 'center',
      shadow: true,
      glow: true,
      glowColor: UITokens.goldGlow
    });

    UITypography.drawText(ctx, 'SYSTEM STANDBY', width / 2, boxY + 28, {
      size: '6px',
      color: UITokens.primary,
      align: 'center',
      shadow: false
    });

    // Status indicator with pulsing LED dot
    const dotPulse = Math.sin(this.animTimer * 6) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(34, 197, 94, ${dotPulse})`;
    ctx.beginPath();
    ctx.arc(width / 2 - 58, boxY + 39, 2.5, 0, Math.PI * 2);
    ctx.fill();

    UITypography.drawText(ctx, 'GAMEPLAY SUSPENDED', width / 2 + 4, boxY + 39, {
      size: '5px',
      color: '#86efac',
      align: 'center',
      shadow: false
    });

    // Divider Line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.beginPath();
    ctx.moveTo(boxX + 12, boxY + 46);
    ctx.lineTo(boxX + boxW - 12, boxY + 46);
    ctx.stroke();

    // 5. Telemetry / Mission Info Strip
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fillRect(boxX + 12, boxY + 50, boxW - 24, 28);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(boxX + 12, boxY + 50, boxW - 24, 28);

    ctx.font = '5.5px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText(`MISSION:`, boxX + 18, boxY + 55);
    ctx.fillStyle = UITokens.textPrimary;
    ctx.fillText(`0${currentLevel} ${levelTitle}`, boxX + 72, boxY + 55);

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText(`SCORE:`, boxX + 18, boxY + 67);
    ctx.fillStyle = UITokens.gold;
    ctx.fillText(`${String(score).padStart(5, '0')}`, boxX + 72, boxY + 67);

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText(`TROPHY:`, boxX + 140, boxY + 67);
    ctx.fillStyle = hasTrophy ? '#4ade80' : UITokens.disabled;
    ctx.fillText(hasTrophy ? `FOUND` : `SEEKING`, boxX + 192, boxY + 67);

    // Divider Line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.beginPath();
    ctx.moveTo(boxX + 12, boxY + 83);
    ctx.lineTo(boxX + boxW - 12, boxY + 83);
    ctx.stroke();

    // 6. Pause Menu Buttons
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      btn.update(0.016, i === selectedIndex);
      btn.render(ctx, i === selectedIndex, false);
    }

    // 7. Footer Hint
    UITypography.drawText(ctx, '[P / ESC] RESUME   [ENTER/SPACE] SELECT', width / 2, boxY + boxH - 8, {
      size: '5px',
      color: UITokens.textMuted,
      align: 'center',
      shadow: false
    });

    ctx.restore();
  }

  /**
   * Screen 4: Modern Animated Game Over Screen
   */
  renderGameOver(ctx, width, height, selectedIndex, buttons, metaOrScore = {}) {
    let finalScore = 0;
    let currentLevel = 1;
    let hasTrophy = false;
    let hasCheckpoint = false;

    if (typeof metaOrScore === 'number') {
      finalScore = metaOrScore;
    } else if (typeof metaOrScore === 'object' && metaOrScore !== null) {
      finalScore = metaOrScore.finalScore || metaOrScore.score || 0;
      currentLevel = metaOrScore.currentLevel || 1;
      hasTrophy = metaOrScore.hasTrophy || false;
      hasCheckpoint = metaOrScore.hasCheckpoint || false;
    }

    const levelNames = {
      1: 'THE LOST VAULT',
      2: 'CYBER FACTORY',
      3: 'DAVE FORTRESS'
    };
    const levelTitle = levelNames[currentLevel] || `SECTOR 0${currentLevel}`;

    // 1. Dark Crimson Backdrop with Edge Vignette
    ctx.save();
    ctx.fillStyle = 'rgba(15, 3, 6, 0.86)';
    ctx.fillRect(0, 0, width, height);

    // 2. Entrance Animation
    const goEnter = Math.min(1, this.gameOverTimer / 0.4);
    const goEase = UIAnimation.easeOutBack(goEnter, 1.1);
    const goScale = UIAnimation.lerp(0.9, 1.0, goEase);
    const goAlpha = UIAnimation.easeOutQuad(goEnter);

    const boxW = 270;
    const boxH = 176;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    ctx.globalAlpha = goAlpha;
    ctx.translate(width / 2, height / 2);
    ctx.scale(goScale, goScale);
    ctx.translate(-width / 2, -height / 2);

    // 3. Glassmorphic Modal Panel
    ctx.fillStyle = 'rgba(18, 8, 14, 0.96)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
    ctx.lineWidth = 1;
    ctx.shadowColor = UITokens.dangerGlow;
    ctx.shadowBlur = 14;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.shadowBlur = 0;

    // Top sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(boxX + 1, boxY + 1, boxW - 2, 1);

    // Corner Red Brackets
    ctx.fillStyle = UITokens.danger;
    ctx.fillRect(boxX, boxY, 5, 2); ctx.fillRect(boxX, boxY, 2, 5);
    ctx.fillRect(boxX + boxW - 5, boxY, 5, 2); ctx.fillRect(boxX + boxW - 2, boxY, 2, 5);
    ctx.fillRect(boxX, boxY + boxH - 2, 5, 2); ctx.fillRect(boxX, boxY + boxH - 5, 2, 5);
    ctx.fillRect(boxX + boxW - 5, boxY + boxH - 2, 5, 2); ctx.fillRect(boxX + boxW - 2, boxY + boxH - 5, 2, 5);

    // 4. Header Section
    UITypography.drawText(ctx, 'SYSTEM FAILURE', width / 2, boxY + 16, {
      size: '10px',
      color: UITokens.danger,
      align: 'center',
      shadow: true,
      glow: true,
      glowColor: UITokens.dangerGlow
    });

    UITypography.drawText(ctx, 'DAVE HAS FALLEN', width / 2, boxY + 28, {
      size: '6px',
      color: '#fca5a5',
      align: 'center',
      shadow: false
    });

    const warnPulse = Math.sin(this.animTimer * 8) * 0.4 + 0.6;
    UITypography.drawText(ctx, '⚠ CRITICAL LIFE FORCE DEPLETED', width / 2, boxY + 39, {
      size: '5px',
      color: `rgba(248, 113, 113, ${warnPulse})`,
      align: 'center',
      shadow: false
    });

    // Divider Line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.moveTo(boxX + 12, boxY + 46);
    ctx.lineTo(boxX + boxW - 12, boxY + 46);
    ctx.stroke();

    // 5. Debrief Results Card
    ctx.fillStyle = 'rgba(24, 10, 16, 0.75)';
    ctx.fillRect(boxX + 12, boxY + 50, boxW - 24, 38);
    ctx.strokeStyle = '#450a0a';
    ctx.strokeRect(boxX + 12, boxY + 50, boxW - 24, 38);

    ctx.font = '5.5px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText(`SECTOR:`, boxX + 18, boxY + 56);
    ctx.fillStyle = UITokens.textPrimary;
    ctx.fillText(`0${currentLevel} ${levelTitle}`, boxX + 76, boxY + 56);

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText(`FINAL SCORE:`, boxX + 18, boxY + 68);
    ctx.fillStyle = UITokens.gold;
    ctx.fillText(`${String(finalScore).padStart(5, '0')}`, boxX + 104, boxY + 68);

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText(`TROPHY:`, boxX + 18, boxY + 79);
    ctx.fillStyle = hasTrophy ? '#4ade80' : UITokens.disabled;
    ctx.fillText(hasTrophy ? `ACQUIRED` : `NOT FOUND`, boxX + 76, boxY + 79);

    // Divider Line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.moveTo(boxX + 12, boxY + 94);
    ctx.lineTo(boxX + boxW - 12, boxY + 94);
    ctx.stroke();

    // 6. Action Buttons
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      btn.update(0.016, i === selectedIndex);
      btn.render(ctx, i === selectedIndex, false);
    }

    // 7. Footer Hint
    UITypography.drawText(ctx, '[▲/▼] NAVIGATE   [ENTER / SPACE] SELECT', width / 2, boxY + boxH - 8, {
      size: '5px',
      color: UITokens.textMuted,
      align: 'center',
      shadow: false
    });

    ctx.restore();
  }

  /**
   * Screen 5: Modern Cinematic Mission Complete Screen
   */
  renderLevelComplete(ctx, width, height, selectedIndex, buttons, meta = {}) {
    let currentLevel = 1;
    let score = 0;
    let baseScore = 0;
    let bonus = 500;

    if (typeof meta === 'number') {
      score = meta;
    } else if (typeof meta === 'object' && meta !== null) {
      currentLevel = meta.currentLevel || 1;
      score = meta.score || 0;
      baseScore = meta.baseScore !== undefined ? meta.baseScore : (score - bonus);
      bonus = meta.bonus !== undefined ? meta.bonus : 500;
    }

    const levelNames = {
      1: 'THE LOST VAULT',
      2: 'CYBER FACTORY',
      3: 'DAVE FORTRESS'
    };
    const levelTitle = levelNames[currentLevel] || `SECTOR 0${currentLevel}`;

    // 1. Dark Translucent Backdrop with Vignette & Gold Energy
    ctx.save();
    ctx.fillStyle = 'rgba(3, 7, 18, 0.82)';
    ctx.fillRect(0, 0, width, height);

    // Subtle Radial Gold Glow in Center
    const centerGlow = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, 180);
    centerGlow.addColorStop(0, 'rgba(250, 204, 21, 0.12)');
    centerGlow.addColorStop(0.6, 'rgba(56, 189, 248, 0.04)');
    centerGlow.addColorStop(1, 'rgba(3, 7, 18, 0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Entrance Animation
    const lcEnter = Math.min(1, this.levelCompleteTimer / 0.4);
    const lcEase = UIAnimation.easeOutBack(lcEnter, 1.08);
    const lcScale = UIAnimation.lerp(0.92, 1.0, lcEase);
    const lcAlpha = UIAnimation.easeOutQuad(lcEnter);

    const boxW = 280;
    const boxH = 194;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    ctx.globalAlpha = lcAlpha;
    ctx.translate(width / 2, height / 2);
    ctx.scale(lcScale, lcScale);
    ctx.translate(-width / 2, -height / 2);

    // 3. Glassmorphic Modal Panel
    ctx.fillStyle = 'rgba(11, 18, 36, 0.95)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
    ctx.lineWidth = 1;
    ctx.shadowColor = UITokens.goldGlow;
    ctx.shadowBlur = 14;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.shadowBlur = 0;

    // Specular top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(boxX + 1, boxY + 1, boxW - 2, 1);

    // Corner Gold Cyber-Accents
    ctx.fillStyle = UITokens.gold;
    ctx.fillRect(boxX, boxY, 5, 2); ctx.fillRect(boxX, boxY, 2, 5);
    ctx.fillRect(boxX + boxW - 5, boxY, 5, 2); ctx.fillRect(boxX + boxW - 2, boxY, 2, 5);
    ctx.fillRect(boxX, boxY + boxH - 2, 5, 2); ctx.fillRect(boxX, boxY + boxH - 5, 2, 5);
    ctx.fillRect(boxX + boxW - 5, boxY + boxH - 2, 5, 2); ctx.fillRect(boxX + boxW - 2, boxY + boxH - 5, 2, 5);

    // 4. Header Section
    UITypography.drawText(ctx, 'MISSION COMPLETE', width / 2, boxY + 16, {
      size: '10px',
      color: UITokens.gold,
      align: 'center',
      shadow: true,
      glow: true,
      glowColor: UITokens.goldGlow
    });

    UITypography.drawText(ctx, 'EXTRACTION SUCCESSFUL', width / 2, boxY + 28, {
      size: '6px',
      color: UITokens.primary,
      align: 'center',
      shadow: false
    });

    // Pulsing LED dot for objective complete
    const dotPulse = Math.sin(this.animTimer * 6) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(74, 222, 128, ${dotPulse})`;
    ctx.beginPath();
    ctx.arc(width / 2 - 58, boxY + 39, 2.5, 0, Math.PI * 2);
    ctx.fill();

    UITypography.drawText(ctx, 'OBJECTIVE COMPLETE', width / 2 + 4, boxY + 39, {
      size: '5px',
      color: '#86efac',
      align: 'center',
      shadow: false
    });

    // Divider Line
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.beginPath();
    ctx.moveTo(boxX + 12, boxY + 46);
    ctx.lineTo(boxX + boxW - 12, boxY + 46);
    ctx.stroke();

    // 5. Stylized Golden Trophy Centerpiece (Left side)
    const trophyProgress = Math.min(1, Math.max(0, (this.levelCompleteTimer - 0.15) / 0.35));
    const trophyEase = UIAnimation.easeOutBack(trophyProgress, 1.25);
    const trophyCenterY = UIAnimation.lerp(boxY + 84, boxY + 74, trophyEase);
    const trophyCenterX = boxX + 40;

    // Glowing trophy halo
    const haloGlow = UIAnimation.getPulse(this.animTimer, 3, 0.4, 0.9);
    ctx.save();
    ctx.shadowColor = `rgba(250, 204, 21, ${haloGlow})`;
    ctx.shadowBlur = 12;

    // Draw stylized Golden Trophy
    ctx.fillStyle = '#facc15';
    // Cup body
    ctx.fillRect(trophyCenterX - 9, trophyCenterY - 10, 18, 11);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(trophyCenterX - 7, trophyCenterY + 1, 14, 4);
    // Stem
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(trophyCenterX - 2, trophyCenterY + 5, 4, 6);
    // Base
    ctx.fillStyle = '#facc15';
    ctx.fillRect(trophyCenterX - 8, trophyCenterY + 11, 16, 4);
    // Handles
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(trophyCenterX - 13, trophyCenterY - 9, 4, 7);
    ctx.strokeRect(trophyCenterX + 9, trophyCenterY - 9, 4, 7);
    // Cup specular shine
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(trophyCenterX - 6, trophyCenterY - 8, 3, 7);
    ctx.fillRect(trophyCenterX - 7, trophyCenterY + 12, 14, 1);
    ctx.restore();

    // Orbiting sparkles around trophy
    for (let i = 0; i < 4; i++) {
      const angle = this.animTimer * 2.5 + i * (Math.PI / 2);
      const sx = trophyCenterX + Math.cos(angle) * 16;
      const sy = trophyCenterY + Math.sin(angle) * 10;
      ctx.fillStyle = (i % 2 === 0) ? '#fde047' : '#38bdf8';
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }

    // 6. Results & Score Count-up Card (Right side)
    const cardX = boxX + 76;
    const cardY = boxY + 50;
    const cardW = boxW - 88;
    const cardH = 48;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    ctx.font = '5.5px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText('MISSION:', cardX + 6, cardY + 6);
    ctx.fillStyle = UITokens.textPrimary;
    ctx.fillText(`0${currentLevel} ${levelTitle}`, cardX + 58, cardY + 6);

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText('TROPHY:', cardX + 6, cardY + 17);
    ctx.fillStyle = '#4ade80';
    ctx.fillText('ACQUIRED', cardX + 58, cardY + 17);

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText('BONUS:', cardX + 6, cardY + 28);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`+${bonus} PTS`, cardX + 58, cardY + 28);

    // Score animated rolling count-up
    const countProgress = Math.min(1, Math.max(0, (this.levelCompleteTimer - 0.25) / 0.5));
    const countEase = UIAnimation.easeOutQuad(countProgress);
    const currentDisplayScore = Math.floor(UIAnimation.lerp(baseScore, score, countEase));

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText('SCORE:', cardX + 6, cardY + 39);
    ctx.fillStyle = UITokens.gold;
    ctx.fillText(`${String(currentDisplayScore).padStart(5, '0')}`, cardX + 58, cardY + 39);

    // Divider Line
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.beginPath();
    ctx.moveTo(boxX + 12, boxY + 104);
    ctx.lineTo(boxX + boxW - 12, boxY + 104);
    ctx.stroke();

    // 7. Action Buttons (NEXT LEVEL, REPLAY LEVEL, MAIN MENU)
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      btn.update(0.016, i === selectedIndex);
      btn.render(ctx, i === selectedIndex, false);
    }

    // 8. Footer Hint
    UITypography.drawText(ctx, '[▲/▼] NAVIGATE   [ENTER / SPACE] SELECT', width / 2, boxY + boxH - 8, {
      size: '5px',
      color: UITokens.textMuted,
      align: 'center',
      shadow: false
    });

    ctx.restore();
  }

  /**
   * Screen 6: Modern Cinematic Grand Victory Screen
   */
  renderFinalVictory(ctx, width, height, selectedIndex, buttons, metaOrScore = {}) {
    let finalScore = 0;
    if (typeof metaOrScore === 'number') {
      finalScore = metaOrScore;
    } else if (typeof metaOrScore === 'object' && metaOrScore !== null) {
      finalScore = metaOrScore.finalScore || metaOrScore.score || 0;
    }

    // 1. Deep Space Atmospheric Cosmic Background
    ctx.save();
    const bgGradient = ctx.createRadialGradient(
      width * 0.5, height * 0.45, 15,
      width * 0.5, height * 0.5, width * 0.75
    );
    bgGradient.addColorStop(0, '#0f1026');
    bgGradient.addColorStop(0.5, '#080816');
    bgGradient.addColorStop(1, '#020308');

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Twinkling cosmic stars
    for (let i = 0; i < this.victoryStars.length; i++) {
      const s = this.victoryStars[i];
      const starAlpha = Math.sin(this.animTimer * s.speed + s.phase) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(254, 240, 138, ${starAlpha})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    // Celebratory falling confetti
    for (let i = 0; i < this.victoryConfetti.length; i++) {
      const c = this.victoryConfetti[i];
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(this.animTimer * c.rotSpeed + c.phase);
      ctx.fillStyle = c.color;
      ctx.fillRect(-2, -1.5, 4, 3);
      ctx.restore();
    }

    // 2. Entrance Animation
    const vicEnter = Math.min(1, this.victoryTimer / 0.45);
    const vicEase = UIAnimation.easeOutBack(vicEnter, 1.1);
    const vicScale = UIAnimation.lerp(0.9, 1.0, vicEase);
    const vicAlpha = UIAnimation.easeOutQuad(vicEnter);

    const boxW = 320;
    const boxH = 208;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2;

    ctx.globalAlpha = vicAlpha;
    ctx.translate(width / 2, height / 2);
    ctx.scale(vicScale, vicScale);
    ctx.translate(-width / 2, -height / 2);

    // 3. Glassmorphic Modal Panel
    ctx.fillStyle = 'rgba(13, 11, 28, 0.96)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = UITokens.goldGlow;
    ctx.shadowBlur = 18;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.shadowBlur = 0;

    // Specular top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.fillRect(boxX + 1, boxY + 1, boxW - 2, 1);

    // Corner Gold Cyber-Accents
    ctx.fillStyle = UITokens.gold;
    ctx.fillRect(boxX, boxY, 7, 2); ctx.fillRect(boxX, boxY, 2, 7);
    ctx.fillRect(boxX + boxW - 7, boxY, 7, 2); ctx.fillRect(boxX + boxW - 2, boxY, 2, 7);
    ctx.fillRect(boxX, boxY + boxH - 2, 7, 2); ctx.fillRect(boxX, boxY + boxH - 7, 2, 7);
    ctx.fillRect(boxX + boxW - 7, boxY + boxH - 2, 7, 2); ctx.fillRect(boxX + boxW - 2, boxY + boxH - 7, 2, 7);

    // 4. Header Section
    UITypography.drawText(ctx, 'GRAND VICTORY', width / 2, boxY + 15, {
      size: '11px',
      color: UITokens.gold,
      align: 'center',
      shadow: true,
      glow: true,
      glowColor: UITokens.goldGlow
    });

    UITypography.drawText(ctx, 'ALL MISSIONS COMPLETE', width / 2, boxY + 27, {
      size: '6.5px',
      color: UITokens.primary,
      align: 'center',
      shadow: false
    });

    const dotPulse = Math.sin(this.animTimer * 6) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(74, 222, 128, ${dotPulse})`;
    ctx.beginPath();
    ctx.arc(width / 2 - 58, boxY + 38, 2.5, 0, Math.PI * 2);
    ctx.fill();

    UITypography.drawText(ctx, 'CAMPAIGN COMPLETE', width / 2 + 4, boxY + 38, {
      size: '5.5px',
      color: '#86efac',
      align: 'center',
      shadow: false
    });

    // Divider Line
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.beginPath();
    ctx.moveTo(boxX + 12, boxY + 45);
    ctx.lineTo(boxX + boxW - 12, boxY + 45);
    ctx.stroke();

    // 5. Hero Preview (Agent Dave on Hologram Pedestal, Left Side)
    this.renderHeroPreview(ctx, boxX + 44, boxY + 54, this.animTimer);

    // 6. Campaign Summary Card (Right Side)
    const cardX = boxX + 88;
    const cardY = boxY + 49;
    const cardW = boxW - 100;
    const cardH = 55;

    ctx.fillStyle = 'rgba(20, 15, 38, 0.75)';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = '#3b2d54';
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#86efac';
    ctx.fillText('MISSION 01: THE LOST VAULT  ✓', cardX + 6, cardY + 6);
    ctx.fillText('MISSION 02: CYBER FACTORY   ✓', cardX + 6, cardY + 16);
    ctx.fillText('MISSION 03: DAVE FORTRESS   ✓', cardX + 6, cardY + 26);

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText('CAMPAIGN STATUS:', cardX + 6, cardY + 36);
    ctx.fillStyle = '#facc15';
    ctx.fillText('100% COMPLETE', cardX + 106, cardY + 36);

    ctx.fillStyle = UITokens.textMuted;
    ctx.fillText('GOLDEN TROPHY:', cardX + 6, cardY + 45);
    ctx.fillStyle = '#4ade80';
    ctx.fillText('ACQUIRED 🏆', cardX + 106, cardY + 45);

    // 7. Large Animated Final Score Banner
    const scoreProgress = Math.min(1, Math.max(0, (this.victoryTimer - 0.2) / 0.6));
    const scoreEase = UIAnimation.easeOutQuad(scoreProgress);
    const displayFinalScore = Math.floor(UIAnimation.lerp(0, finalScore, scoreEase));

    const scoreCardY = boxY + 108;
    ctx.fillStyle = 'rgba(30, 20, 50, 0.65)';
    ctx.fillRect(boxX + 12, scoreCardY, boxW - 24, 18);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
    ctx.strokeRect(boxX + 12, scoreCardY, boxW - 24, 18);

    UITypography.drawText(ctx, `FINAL SCORE: ${String(displayFinalScore).padStart(6, '0')}`, width / 2, scoreCardY + 9, {
      size: '7px',
      color: UITokens.gold,
      align: 'center',
      shadow: true,
      glow: true,
      glowColor: UITokens.goldGlow
    });

    // Divider Line
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.beginPath();
    ctx.moveTo(boxX + 12, boxY + 130);
    ctx.lineTo(boxX + boxW - 12, boxY + 130);
    ctx.stroke();

    // Memorable Tagline
    UITypography.drawText(ctx, 'MISSION ACCOMPLISHED', width / 2, boxY + 138, {
      size: '6px',
      color: '#93c5fd',
      align: 'center',
      shadow: false
    });

    // 8. Action Buttons (PLAY AGAIN, LEVEL SELECT, MAIN MENU)
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      btn.update(0.016, i === selectedIndex);
      btn.render(ctx, i === selectedIndex, false);
    }

    // 9. Footer Hint
    UITypography.drawText(ctx, '[◄/►] NAVIGATE   [ENTER / SPACE] SELECT', width / 2, boxY + boxH - 8, {
      size: '5px',
      color: UITokens.textMuted,
      align: 'center',
      shadow: false
    });

    ctx.restore();
  }

  /**
   * Screen 7: Modernized "HOW TO PLAY: MASTER THE DAVE PROTOCOL" Screen
   */
  renderInstructions(ctx, width, height, selectedIndex, buttons) {
    // 1. Layered Atmospheric Background with Radial Gradient
    const bgGradient = ctx.createRadialGradient(
      width * 0.5, height * 0.4, 10,
      width * 0.5, height * 0.5, width * 0.75
    );
    bgGradient.addColorStop(0, '#0c1b33');
    bgGradient.addColorStop(0.5, '#080d1a');
    bgGradient.addColorStop(1, '#03050a');

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Perspective Floor Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    const horizonY = 145;
    const vpX = 200;
    for (let angle = -1.2; angle <= 1.2; angle += 0.3) {
      ctx.beginPath();
      ctx.moveTo(vpX, horizonY);
      ctx.lineTo(vpX + Math.tan(angle) * (height - horizonY) * 2.2, height);
      ctx.stroke();
    }
    const hGridLines = [160, 180, 205, 235];
    for (let y of hGridLines) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Floating Background Particles
    ctx.save();
    for (let i = 0; i < this.bgParticles.length; i++) {
      const p = this.bgParticles[i];
      const pulseAlpha = 0.2 + 0.5 * (Math.sin(this.animTimer * 3 + p.phase) * 0.5 + 0.5);
      ctx.globalAlpha = pulseAlpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.restore();

    // 4. Outer Cyber Frame & Corner L-Brackets
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.fillStyle = UITokens.primary;
    ctx.fillRect(8, 8, 6, 2); ctx.fillRect(8, 8, 2, 6);
    ctx.fillRect(width - 14, 8, 6, 2); ctx.fillRect(width - 10, 8, 2, 6);
    ctx.fillRect(8, height - 10, 6, 2); ctx.fillRect(8, height - 14, 2, 6);
    ctx.fillRect(width - 14, height - 10, 6, 2); ctx.fillRect(width - 10, height - 14, 2, 6);

    // 5. Animated Header: "HOW TO PLAY" & "MASTER THE DAVE PROTOCOL"
    const headerEnter = Math.min(1, this.instructionsTimer / 0.45);
    const headerEase = UIAnimation.easeOutBack(headerEnter, 1.1);
    const headerY = UIAnimation.lerp(12, 22, headerEase);
    const headerAlpha = UIAnimation.easeOutQuad(headerEnter);

    ctx.save();
    ctx.globalAlpha = headerAlpha;
    UITypography.drawText(ctx, 'HOW TO PLAY', width / 2, headerY, {
      size: '11px',
      color: UITokens.gold,
      align: 'center',
      shadow: true,
      glow: true,
      glowColor: UITokens.goldGlow
    });

    UITypography.drawText(ctx, 'MASTER THE DAVE PROTOCOL', width / 2, headerY + 14, {
      size: '7px',
      color: UITokens.primary,
      align: 'center',
      shadow: false
    });

    // Header divider line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, headerY + 21);
    ctx.lineTo(width / 2 - 12, headerY + 21);
    ctx.moveTo(width / 2 + 12, headerY + 21);
    ctx.lineTo(width / 2 + 120, headerY + 21);
    ctx.stroke();

    ctx.fillStyle = UITokens.gold;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('✦', width / 2, headerY + 21);
    ctx.restore();

    // 6. Left Card: Combat Controls & 3D Keycaps with Stagger Entry
    const leftEnter = Math.min(1, Math.max(0, (this.instructionsTimer - 0.1) / 0.35));
    const leftEase = UIAnimation.easeOutBack(leftEnter, 1.05);
    const leftOffsetY = UIAnimation.lerp(12, 0, leftEase);
    const leftAlpha = UIAnimation.easeOutQuad(leftEnter);

    const leftCardX = 18;
    const leftCardY = 48 + leftOffsetY;
    const leftCardW = 176;
    const leftCardH = 144;

    ctx.save();
    ctx.globalAlpha = leftAlpha;
    ctx.fillStyle = 'rgba(11, 17, 32, 0.94)';
    ctx.fillRect(leftCardX, leftCardY, leftCardW, leftCardH);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(leftCardX, leftCardY, leftCardW, leftCardH);

    // Header tag
    UITypography.drawText(ctx, '🎮 TACTICAL CONTROLS', leftCardX + leftCardW / 2, leftCardY + 12, {
      size: '6.5px',
      color: UITokens.primary,
      align: 'center',
      shadow: true
    });

    // Control rows with 3D Keycaps
    const controls = [
      { keys: ['A', 'D'], label: 'MOVE LEFT / RIGHT', sub: 'or [◄] [►] ARROWS' },
      { keys: ['SPACE', 'W'], label: 'JUMP / HIGH JUMP', sub: 'or [▲] UP ARROW' },
      { keys: ['F'], label: 'PLASMA BLASTER', sub: 'SHOOT ENEMIES' },
      { keys: ['P', 'ESC'], label: 'PAUSE / RESUME', sub: 'QUICK TOGGLE' }
    ];

    let rowY = leftCardY + 24;
    for (let i = 0; i < controls.length; i++) {
      const c = controls[i];
      const keyEnter = Math.min(1, Math.max(0, (this.instructionsTimer - 0.15 - i * 0.05) / 0.25));
      const keyScale = keyEnter > 0 ? UIAnimation.easeOutBack(keyEnter, 1.15) : 0;

      let kx = leftCardX + 8;
      for (let k = 0; k < c.keys.length; k++) {
        const keyText = c.keys[k];
        const kw = keyText.length > 2 ? 38 : 16;
        if (keyScale > 0) {
          this.drawKeycap(ctx, keyText, kx, rowY, kw, 13, keyScale);
        }
        kx += kw + 4;
      }

      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = UITokens.textPrimary;
      ctx.fillText(c.label, leftCardX + 78, rowY + 1);

      ctx.fillStyle = UITokens.textMuted;
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText(c.sub, leftCardX + 78, rowY + 9);

      rowY += 24;
    }

    ctx.fillStyle = UITokens.success;
    ctx.font = '5.5px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ BEACONS AUTO-SAVE MIDWAY', leftCardX + leftCardW / 2, leftCardY + leftCardH - 10);
    ctx.restore();

    // 7. Right Card: Objectives & Tactical Tips with Stagger Entry
    const rightEnter = Math.min(1, Math.max(0, (this.instructionsTimer - 0.2) / 0.35));
    const rightEase = UIAnimation.easeOutBack(rightEnter, 1.05);
    const rightOffsetY = UIAnimation.lerp(12, 0, rightEase);
    const rightAlpha = UIAnimation.easeOutQuad(rightEnter);

    const rightCardX = 202;
    const rightCardY = 48 + rightOffsetY;
    const rightCardW = 180;
    const rightCardH = 144;

    ctx.save();
    ctx.globalAlpha = rightAlpha;
    ctx.fillStyle = 'rgba(11, 17, 32, 0.94)';
    ctx.fillRect(rightCardX, rightCardY, rightCardW, rightCardH);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rightCardX, rightCardY, rightCardW, rightCardH);

    UITypography.drawText(ctx, '🎯 MISSION DIRECTIVES', rightCardX + rightCardW / 2, rightCardY + 11, {
      size: '6.5px',
      color: UITokens.secondary,
      align: 'center',
      shadow: true
    });

    const objectives = [
      { tag: '1. EXPLORE', desc: 'Navigate platforms, hazards & spike pits.', col: UITokens.primary },
      { tag: '2. COLLECT', desc: 'Coins (+100), Gems (+250/+500 pts).', col: UITokens.gold },
      { tag: '3. SURVIVE', desc: 'Stomp guards (+200) or fire blaster (+200).', col: UITokens.danger },
      { tag: '4. ESCAPE', desc: 'Collect Golden Trophy (+1000) to open Exit!', col: UITokens.success }
    ];

    let objY = rightCardY + 21;
    for (let item of objectives) {
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = item.col;
      ctx.fillText(item.tag, rightCardX + 8, objY);

      ctx.fillStyle = UITokens.textSecondary;
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText(item.desc, rightCardX + 8, objY + 7);
      objY += 16;
    }

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.beginPath();
    ctx.moveTo(rightCardX + 10, objY + 2);
    ctx.lineTo(rightCardX + rightCardW - 10, objY + 2);
    ctx.stroke();

    UITypography.drawText(ctx, '💡 TACTICAL TIPS', rightCardX + rightCardW / 2, objY + 10, {
      size: '6px',
      color: UITokens.gold,
      align: 'center',
      shadow: false
    });

    const tips = [
      '• Stomp enemies from above (+200 pts).',
      '• Jump near ledge edges for max clearance.',
      '• Golden Trophy unlocks the exit door.',
      '• Checkpoints auto-save mid-level progress.'
    ];

    let tipY = objY + 19;
    for (let t = 0; t < tips.length; t++) {
      const tipEnter = Math.min(1, Math.max(0, (this.instructionsTimer - 0.3 - t * 0.05) / 0.25));
      ctx.globalAlpha = rightAlpha * UIAnimation.easeOutQuad(tipEnter);
      ctx.fillStyle = UITokens.textMuted;
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(tips[t], rightCardX + 8, tipY);
      tipY += 8.5;
    }
    ctx.restore();

    // 8. Back Button & Footer Legend
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].update(0.016, i === selectedIndex);
      buttons[i].render(ctx, i === selectedIndex, false);
    }

    UITypography.drawText(ctx, '[ENTER / SPACE / ESC] RETURN TO MAIN MENU', width / 2 + 40, height - 16, {
      size: '6px',
      color: UITokens.textMuted,
      align: 'center',
      shadow: true
    });
  }

  /**
   * Helper to draw a modern 3D keycap badge
   */
  drawKeycap(ctx, text, x, y, w, h, scale = 1.0) {
    ctx.save();
    if (scale !== 1.0) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.scale(scale, scale);
      ctx.translate(-(x + w / 2), -(y + h / 2));
    }

    ctx.fillStyle = '#020617';
    ctx.fillRect(x, y + 2, w, h);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + 1, y + 1, w - 2, 1);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
  }

  /**
   * Screen 8: Modernized "SETTINGS: CONFIGURE YOUR EXPERIENCE" Screen
   */
  renderSettings(ctx, width, height, selectedIndex, buttons) {
    // 1. Layered Atmospheric Background with Radial Gradient
    const bgGradient = ctx.createRadialGradient(
      width * 0.5, height * 0.4, 10,
      width * 0.5, height * 0.5, width * 0.75
    );
    bgGradient.addColorStop(0, '#1a0c2e');
    bgGradient.addColorStop(0.5, '#080d1a');
    bgGradient.addColorStop(1, '#03050a');

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Perspective Floor Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.06)';
    ctx.lineWidth = 1;
    const horizonY = 145;
    const vpX = 200;
    for (let angle = -1.2; angle <= 1.2; angle += 0.3) {
      ctx.beginPath();
      ctx.moveTo(vpX, horizonY);
      ctx.lineTo(vpX + Math.tan(angle) * (height - horizonY) * 2.2, height);
      ctx.stroke();
    }
    const hGridLines = [160, 180, 205, 235];
    for (let y of hGridLines) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Floating Background Particles
    ctx.save();
    for (let i = 0; i < this.bgParticles.length; i++) {
      const p = this.bgParticles[i];
      const pulseAlpha = 0.2 + 0.5 * (Math.sin(this.animTimer * 3 + p.phase) * 0.5 + 0.5);
      ctx.globalAlpha = pulseAlpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.restore();

    // 4. Outer Cyber Frame & Corner L-Brackets
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.fillStyle = UITokens.secondary;
    ctx.fillRect(8, 8, 6, 2); ctx.fillRect(8, 8, 2, 6);
    ctx.fillRect(width - 14, 8, 6, 2); ctx.fillRect(width - 10, 8, 2, 6);
    ctx.fillRect(8, height - 10, 6, 2); ctx.fillRect(8, height - 14, 2, 6);
    ctx.fillRect(width - 14, height - 10, 6, 2); ctx.fillRect(width - 10, height - 14, 2, 6);

    // 5. Header: "SETTINGS" & "CONFIGURE YOUR EXPERIENCE"
    const headerEnter = Math.min(1, this.settingsTimer / 0.45);
    const headerEase = UIAnimation.easeOutBack(headerEnter, 1.1);
    const headerY = UIAnimation.lerp(12, 22, headerEase);
    const headerAlpha = UIAnimation.easeOutQuad(headerEnter);

    ctx.save();
    ctx.globalAlpha = headerAlpha;
    UITypography.drawText(ctx, 'SETTINGS', width / 2, headerY, {
      size: '11px',
      color: UITokens.gold,
      align: 'center',
      shadow: true,
      glow: true,
      glowColor: UITokens.goldGlow
    });

    UITypography.drawText(ctx, 'CONFIGURE YOUR EXPERIENCE', width / 2, headerY + 14, {
      size: '7px',
      color: UITokens.secondary,
      align: 'center',
      shadow: false
    });

    // Header divider line
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, headerY + 21);
    ctx.lineTo(width / 2 - 12, headerY + 21);
    ctx.moveTo(width / 2 + 12, headerY + 21);
    ctx.lineTo(width / 2 + 120, headerY + 21);
    ctx.stroke();

    ctx.fillStyle = UITokens.gold;
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('✦', width / 2, headerY + 21);
    ctx.restore();

    // 6. Interactive Setting Rows with Stagger Animation
    const settingRows = [
      {
        id: 'toggle_sfx',
        icon: '🔊',
        title: 'SOUND EFFECTS',
        desc: 'Blaster plasma, stomp impacts, gem pickups & jump audio',
        state: this.settings.soundFX,
        btnIndex: 0
      },
      {
        id: 'toggle_music',
        icon: '🎵',
        title: 'BGM CHIPTUNE',
        desc: 'Atmospheric retro arcade background soundtrack',
        state: this.settings.music,
        btnIndex: 1
      },
      {
        id: 'toggle_crt',
        icon: '📺',
        title: 'CRT SCANLINES',
        desc: 'Authentic retro arcade cabinet scanlines & curvature',
        state: this.settings.crtFilter,
        btnIndex: 2
      }
    ];

    const rowX = 18;
    const rowW = 364;
    const rowH = 34;

    for (let i = 0; i < settingRows.length; i++) {
      const row = settingRows[i];
      const rowEnter = Math.min(1, Math.max(0, (this.settingsTimer - 0.08 * i) / 0.3));
      const rowEase = UIAnimation.easeOutBack(rowEnter, 1.05);
      const rowOffsetY = UIAnimation.lerp(10, 0, rowEase);
      const rowAlpha = UIAnimation.easeOutQuad(rowEnter);

      const ry = 48 + i * 38 + rowOffsetY;
      const isFocused = (selectedIndex === row.btnIndex);

      ctx.save();
      ctx.globalAlpha = rowAlpha;
      ctx.fillStyle = isFocused ? 'rgba(30, 41, 59, 0.95)' : 'rgba(11, 17, 32, 0.9)';
      ctx.fillRect(rowX, ry, rowW, rowH);

      ctx.strokeStyle = isFocused ? UITokens.secondary : '#1e293b';
      ctx.lineWidth = isFocused ? 2 : 1;
      if (isFocused) {
        ctx.shadowColor = UITokens.secondaryGlow;
        ctx.shadowBlur = 8;
      }
      ctx.strokeRect(rowX, ry, rowW, rowH);
      ctx.shadowBlur = 0;

      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = isFocused ? '#ffffff' : UITokens.textPrimary;
      ctx.fillText(`${row.icon} ${row.title}`, rowX + 10, ry + 7);

      ctx.font = '5.5px "Press Start 2P", monospace';
      ctx.fillStyle = UITokens.textMuted;
      ctx.fillText(row.desc, rowX + 10, ry + 20);

      if (isFocused) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(rowX, ry, 3, 2);
        ctx.fillRect(rowX + rowW - 3, ry, 3, 2);
        ctx.fillRect(rowX, ry + rowH - 2, 3, 2);
        ctx.fillRect(rowX + rowW - 3, ry + rowH - 2, 3, 2);
      }
      ctx.restore();
    }

    // Hardware Audio Status Banner
    const statusY = 162;
    ctx.save();
    ctx.fillStyle = 'rgba(11, 17, 32, 0.85)';
    ctx.fillRect(rowX, statusY, rowW, 26);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rowX, statusY, rowW, 26);

    UITypography.drawText(ctx, '⚡ HARDWARE SYNTH: WEB AUDIO API READY', rowX + rowW / 2, statusY + 8, {
      size: '6px',
      color: UITokens.primary,
      align: 'center',
      shadow: false
    });
    UITypography.drawText(ctx, 'Real-time procedural 8-bit chiptune synthesis • Zero lag', rowX + rowW / 2, statusY + 18, {
      size: '5px',
      color: UITokens.textMuted,
      align: 'center',
      shadow: false
    });
    ctx.restore();

    // 7. Render Buttons (Toggle Buttons on Right + Back Button on Bottom Left)
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      btn.update(0.016, i === selectedIndex);

      if (btn.id === 'toggle_sfx') {
        btn.label = this.settings.soundFX ? 'SOUND FX' : 'SOUND FX';
        btn.badge = this.settings.soundFX ? '[ ON ]' : '[ OFF ]';
        btn.customColor = this.settings.soundFX ? UITokens.success : UITokens.disabled;
      } else if (btn.id === 'toggle_music') {
        btn.label = this.settings.music ? 'MUSIC' : 'MUSIC';
        btn.badge = this.settings.music ? '[ ON ]' : '[ OFF ]';
        btn.customColor = this.settings.music ? UITokens.success : UITokens.disabled;
      } else if (btn.id === 'toggle_crt') {
        btn.label = this.settings.crtFilter ? 'CRT FILTER' : 'CRT FILTER';
        btn.badge = this.settings.crtFilter ? '[ ON ]' : '[ OFF ]';
        btn.customColor = this.settings.crtFilter ? UITokens.success : UITokens.disabled;
      }

      btn.render(ctx, i === selectedIndex, false);
    }

    // 8. Footer Legend
    UITypography.drawText(ctx, '[▲/▼] NAVIGATE ROWS   [ENTER/SPACE] TOGGLE   [ESC] BACK', width / 2 + 40, height - 16, {
      size: '6px',
      color: UITokens.textMuted,
      align: 'center',
      shadow: true
    });
  }

  /**
   * Screen 9: Quit Screen
   */
  renderQuit(ctx, width, height, selectedIndex, buttons) {
    ctx.fillStyle = UITokens.bgApp;
    ctx.fillRect(0, 0, width, height);

    UITypography.drawText(ctx, '*** DANGEROUS ADVENTURE ***', width / 2, height / 2 - 30, {
      size: '11px',
      color: UITokens.gold,
      align: 'center'
    });

    UITypography.drawText(ctx, 'THANKS FOR PLAYING!', width / 2, height / 2 - 10, {
      size: '8px',
      color: UITokens.primary,
      align: 'center'
    });

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].update(0.016, i === selectedIndex);
      buttons[i].render(ctx, i === selectedIndex, false);
    }
  }

  /**
   * Screen Transition Curtain Fade & Cinematic Hyper-Warp Jump Animation
   */
  renderScreenFade(ctx, width, height, alpha, levelNumber = 1) {
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);

    // Deep space backdrop
    ctx.fillStyle = '#03050a';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // 1. Hyper-warp speed star streaks radiating from vortex center
    if (this.warpSpeedLines && this.warpSpeedLines.length > 0) {
      ctx.lineWidth = 1.5;
      for (let i = 0; i < this.warpSpeedLines.length; i++) {
        const line = this.warpSpeedLines[i];
        const startDist = line.dist * (1.0 - alpha * 0.4);
        const endDist = startDist + line.length * (alpha * 1.8 + 0.5);

        const x1 = cx + Math.cos(line.angle) * startDist;
        const y1 = cy + Math.sin(line.angle) * startDist;
        const x2 = cx + Math.cos(line.angle) * endDist;
        const y2 = cy + Math.sin(line.angle) * endDist;

        if (ctx.beginPath && ctx.moveTo && ctx.lineTo && ctx.stroke) {
          ctx.strokeStyle = line.color;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // 2. Expanding central warp shockwave ring
    const ringRadius = (1.0 - alpha) * 160 + 15;
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.8})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = UITokens.primaryGlow;
    ctx.shadowBlur = 14;
    if (ctx.beginPath && ctx.arc && ctx.stroke) {
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // 3. Cinematic Sector Telemetry Briefing (Centered Cyber Card)
    const levelNames = {
      1: 'THE LOST VAULT',
      2: 'CYBER FACTORY',
      3: 'DAVE FORTRESS'
    };
    const sectorName = levelNames[levelNumber] || `SECTOR 0${levelNumber}`;

    UITypography.drawText(ctx, '>> HYPER-WARP ENGAGED <<', cx, cy - 28, {
      size: '8px',
      color: UITokens.gold,
      align: 'center',
      shadow: true,
      shadowColor: '#020617',
      glow: true,
      glowColor: UITokens.goldGlow
    });

    UITypography.drawText(ctx, `ENTERING SECTOR 0${levelNumber}: ${sectorName}`, cx, cy - 10, {
      size: '7.5px',
      color: '#ffffff',
      align: 'center',
      shadow: true,
      shadowColor: '#020617'
    });

    UITypography.drawText(ctx, '● ATMOSPHERE: HAZARDOUS   ● RADAR: ONLINE', cx, cy + 8, {
      size: '5.5px',
      color: '#38bdf8',
      align: 'center',
      shadow: false
    });

    UITypography.drawText(ctx, 'GET READY...', cx, cy + 26, {
      size: '6px',
      color: '#4ade80',
      align: 'center',
      shadow: true,
      shadowColor: '#020617'
    });

    ctx.restore();
  }
}

