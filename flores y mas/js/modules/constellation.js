/**
 * FLORALIA STUDIO - FLORAL CONSTELLATION MINIGAME
 */

import { $, showToast } from '../utils/helpers.js';
import { audio } from '../audioManager.js';

export class FloralConstellationGame {
  constructor() {
    this.canvas = $('#constellation-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.stars = [];
    this.connections = [];
    this.activeStar = null;
    this.isCompleted = false;

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.canvas.width = 600;
    this.canvas.height = 380;

    this.setupFlowerPattern();
    this.setupListeners();
    this.render();
  }

  setupFlowerPattern() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    this.stars = [];
    this.connections = [];
    this.isCompleted = false;

    // Center star
    this.stars.push({ x: cx, y: cy, radius: 6, id: 0, connected: false });

    // 6 Petal tips
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      this.stars.push({
        x: cx + Math.cos(ang) * 95,
        y: cy + Math.sin(ang) * 95,
        radius: 5,
        id: i + 1,
        connected: false
      });
    }

    // Outer aura stars
    for (let i = 0; i < 25; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: 2 + Math.random() * 2,
        id: 100 + i,
        isBackground: true
      });
    }
  }

  setupListeners() {
    let dragging = false;
    let dragStart = null;

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      const pos = getPos(e);
      const clicked = this.stars.find(s => !s.isBackground && Math.hypot(s.x - pos.x, s.y - pos.y) < 20);
      if (clicked) {
        dragging = true;
        dragStart = clicked;
        audio.playPluck(500);
      }
    });

    this.canvas.addEventListener('pointerup', (e) => {
      if (!dragging || !dragStart) return;
      const pos = getPos(e);
      const target = this.stars.find(s => !s.isBackground && s.id !== dragStart.id && Math.hypot(s.x - pos.x, s.y - pos.y) < 20);

      if (target) {
        // Add connection
        const exists = this.connections.some(c =>
          (c.from === dragStart.id && c.to === target.id) ||
          (c.from === target.id && c.to === dragStart.id)
        );

        if (!exists) {
          this.connections.push({ from: dragStart.id, to: target.id, p1: dragStart, p2: target });
          audio.playChime(1.3 + this.connections.length * 0.1);
          this.checkWinCondition();
        }
      }

      dragging = false;
      dragStart = null;
      this.render();
    });
  }

  checkWinCondition() {
    if (this.connections.length >= 6 && !this.isCompleted) {
      this.isCompleted = true;
      audio.playFanfare();
      showToast('✨ ¡Constelación de la Flor Dorada Despierta! 🌟', '🌻');
    }
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw connected lines
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 12;

    this.connections.forEach(conn => {
      ctx.beginPath();
      ctx.moveTo(conn.p1.x, conn.p1.y);
      ctx.lineTo(conn.p2.x, conn.p2.y);
      ctx.stroke();
    });

    // Draw stars
    this.stars.forEach(star => {
      ctx.fillStyle = star.isBackground ? '#ffffff' : '#ffd23f';
      ctx.shadowColor = star.isBackground ? 'transparent' : '#ffd700';
      ctx.shadowBlur = star.isBackground ? 0 : 15;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  }
}
