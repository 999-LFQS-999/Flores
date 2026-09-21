/**
 * FLORALIA STUDIO - SURPRISE UNBOXING EXPERIENCE
 */

import { $, showToast } from '../utils/helpers.js';
import { audio } from '../audioManager.js';

export class UnboxingExperience {
  constructor(onOpenCallback) {
    this.overlay = $('#unboxing-overlay');
    this.giftBox = $('#gift-box-3d');
    this.promptBtn = $('#tap-to-open-prompt');
    this.canvas = $('#unboxing-particle-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.onOpenCallback = onOpenCallback;
    this.particles = [];
    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.overlay) return;

    if (this.giftBox) {
      this.giftBox.addEventListener('click', () => this.openBox());
    }
    if (this.promptBtn) {
      this.promptBtn.addEventListener('click', () => this.openBox());
    }
  }

  show() {
    if (!this.overlay) return;
    this.overlay.classList.add('active');
    this.isOpen = false;
  }

  openBox() {
    if (this.isOpen) return;
    this.isOpen = true;

    audio.playWaxCrack();
    setTimeout(() => {
      audio.playFanfare();
      this.launchConfetti();
    }, 200);

    if (this.giftBox) {
      this.giftBox.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease';
      this.giftBox.style.transform = 'scale(1.4) rotate(15deg)';
      this.giftBox.style.opacity = '0';
    }

    setTimeout(() => {
      if (this.overlay) {
        this.overlay.style.transition = 'opacity 0.8s ease';
        this.overlay.classList.remove('active');
      }
      showToast('¡Sorpresa revelada! 🌻✨ Disfruta tus flores.', '🎁');
      if (this.onOpenCallback) this.onOpenCallback();
    }, 1800);
  }

  launchConfetti() {
    if (!this.canvas || !this.ctx) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const colors = ['#ffd700', '#f59e0b', '#ec4899', '#8b5cf6', '#ffffff', '#10b981'];
    this.particles = [];

    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.5) * 22 - 6,
        size: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1
      });
    }

    const render = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let alive = false;

      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98;
        p.rotation += p.vRot;
        p.alpha -= 0.008;

        if (p.alpha > 0) {
          alive = true;
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = Math.max(0, p.alpha);
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          this.ctx.restore();
        }
      });

      if (alive) requestAnimationFrame(render);
    };

    render();
  }
}
