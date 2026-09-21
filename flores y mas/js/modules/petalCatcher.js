/**
 * FLORALIA STUDIO - PETAL CATCHER (MINIJUEGO DE ATRAPAR PÉTALOS)
 */

import { $, showToast } from '../utils/helpers.js';
import { audio } from '../audioManager.js';

export class PetalCatcherGame {
  constructor() {
    this.canvas = $('#petal-catcher-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.scoreDisplay = $('#petal-score');
    this.startOverlay = $('#game-start-overlay');
    this.startBtn = $('#btn-start-petal-game');

    this.score = 0;
    this.isRunning = false;
    this.basketX = 200;
    this.basketWidth = 70;
    this.fallingItems = [];
    this.animId = null;

    this.init();
  }

  init() {
    if (!this.canvas) return;

    this.canvas.width = 600;
    this.canvas.height = 380;
    this.basketX = this.canvas.width / 2;

    this.setupListeners();
  }

  setupListeners() {
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        this.startGame();
      });
    }

    // Move basket with mouse / touch
    const moveBasket = (clientX) => {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.canvas.width / rect.width;
      this.basketX = (clientX - rect.left) * scale;
    };

    this.canvas.addEventListener('mousemove', (e) => moveBasket(e.clientX));
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches[0]) moveBasket(e.touches[0].clientX);
    });
  }

  startGame() {
    this.score = 0;
    this.fallingItems = [];
    this.isRunning = true;
    if (this.startOverlay) this.startOverlay.style.display = 'none';
    if (this.scoreDisplay) this.scoreDisplay.textContent = '0';

    audio.playChime(1.2);
    this.spawnItem();
    this.loop();
  }

  spawnItem() {
    if (!this.isRunning) return;

    const isButterfly = Math.random() > 0.75;
    this.fallingItems.push({
      x: 30 + Math.random() * (this.canvas.width - 60),
      y: -20,
      speed: 2 + Math.random() * 2.5,
      isButterfly,
      size: isButterfly ? 24 : 16,
      angle: Math.random() * Math.PI * 2,
      color: isButterfly ? '#a855f7' : '#ffd23f'
    });

    const nextSpawn = Math.max(350, 900 - this.score * 15);
    setTimeout(() => this.spawnItem(), nextSpawn);
  }

  loop() {
    if (!this.isRunning) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw basket
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 12;
    if (ctx.roundRect) {
      ctx.roundRect(this.basketX - this.basketWidth / 2, h - 35, this.basketWidth, 22, [6, 6, 12, 12]);
    } else {
      ctx.rect(this.basketX - this.basketWidth / 2, h - 35, this.basketWidth, 22);
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffd700';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧺', this.basketX, h - 18);

    // Update & Draw falling items
    for (let i = this.fallingItems.length - 1; i >= 0; i--) {
      const item = this.fallingItems[i];
      item.y += item.speed;
      item.angle += 0.05;

      // Draw item
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.angle);
      ctx.font = `${item.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.isButterfly ? '🦋' : '🌼', 0, 0);
      ctx.restore();

      // Catch check
      const basketY = h - 35;
      if (item.y >= basketY - 10 && item.y <= basketY + 20) {
        if (Math.abs(item.x - this.basketX) < this.basketWidth / 2 + 10) {
          const points = item.isButterfly ? 5 : 1;
          this.score += points;
          if (this.scoreDisplay) this.scoreDisplay.textContent = this.score;
          audio.playChime(item.isButterfly ? 1.6 : 1.2);
          this.fallingItems.splice(i, 1);
          continue;
        }
      }

      // Missed check
      if (item.y > h + 30) {
        this.fallingItems.splice(i, 1);
      }
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }

  stop() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
