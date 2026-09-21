/**
 * FLORALIA STUDIO - BOUQUET STUDIO (TALLER DE RAMOS INTERACTIVO)
 */

import { $, $$, showToast } from '../utils/helpers.js';
import { audio } from '../audioManager.js';

export class BouquetStudio {
  constructor() {
    this.canvas = $('#bouquet-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.selectedWrap = 'kraft'; // kraft, pink, black, gold
    this.selectedRibbon = 'gold'; // gold, velvet, satin
    this.fairyLightsActive = true;
    this.tagText = 'Para alguien muy especial 🌼';

    this.flowersInBouquet = [
      { type: 'girasol', count: 3 },
      { type: 'rosa_amarilla', count: 2 },
      { type: 'tulipan', count: 2 },
      { type: 'margarita', count: 4 },
      { type: 'lavanda', count: 3 }
    ];

    this.flowerDefs = {
      girasol: { name: 'Girasol Dorado', emoji: '🌻', color: '#ffd23f' },
      rosa_amarilla: { name: 'Rosa Amarilla', emoji: '💛', color: '#facc15' },
      rosa_roja: { name: 'Rosa Escarlata', emoji: '🌹', color: '#e11d48' },
      tulipan: { name: 'Tulipán Miel', emoji: '🌷', color: '#fb923c' },
      margarita: { name: 'Margarita Silvestre', emoji: '🌼', color: '#ffffff' },
      lavanda: { name: 'Lavanda Silvestre', emoji: '🪻', color: '#a855f7' },
      lirio: { name: 'Lirio Blanco', emoji: '🌸', color: '#f8fafc' },
      orquidea: { name: 'Orquídea Real', emoji: '🌺', color: '#ec4899' }
    };

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.renderFlowerPickers();
    this.renderBouquetCanvas();
    this.setupListeners();
  }

  renderFlowerPickers() {
    const grid = $('#flower-picker-grid');
    if (!grid) return;

    grid.innerHTML = '';
    Object.entries(this.flowerDefs).forEach(([key, f]) => {
      const current = this.flowersInBouquet.find(item => item.type === key);
      const count = current ? current.count : 0;

      const card = document.createElement('div');
      card.className = `flower-card ${count > 0 ? 'selected' : ''}`;
      card.innerHTML = `
        <span class="flower-emoji">${f.emoji}</span>
        <span class="flower-name">${f.name}</span>
        <span class="flower-count-badge" id="count-${key}">${count} uds</span>
      `;

      card.addEventListener('click', () => {
        this.addOrRemoveFlower(key);
        audio.playChime(1.3);
      });

      grid.appendChild(card);
    });
  }

  addOrRemoveFlower(key) {
    let item = this.flowersInBouquet.find(f => f.type === key);
    if (!item) {
      item = { type: key, count: 1 };
      this.flowersInBouquet.push(item);
    } else {
      item.count = (item.count + 1) % 6; // cycle 0 to 5
      if (item.count === 0) {
        this.flowersInBouquet = this.flowersInBouquet.filter(f => f.type !== key);
      }
    }

    this.renderFlowerPickers();
    this.renderBouquetCanvas();
  }

  setupListeners() {
    // Wrap pills
    $$('.wrap-option-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        $$('.wrap-option-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        this.selectedWrap = pill.dataset.wrap;
        audio.playChime(1.1);
        this.renderBouquetCanvas();
      });
    });

    // Fairy lights toggle
    const lightsToggle = $('#toggle-fairy-lights');
    if (lightsToggle) {
      lightsToggle.addEventListener('click', () => {
        this.fairyLightsActive = !this.fairyLightsActive;
        lightsToggle.classList.toggle('active', this.fairyLightsActive);
        const overlay = $('#stage-fairy-lights');
        if (overlay) overlay.classList.toggle('active', this.fairyLightsActive);
        audio.playChime(1.6);
        this.renderBouquetCanvas();
      });
    }

    // Tag text
    const tagInput = $('#bouquet-tag-input');
    if (tagInput) {
      tagInput.addEventListener('input', (e) => {
        this.tagText = e.target.value;
        this.renderBouquetCanvas();
      });
    }

    // Download PNG
    const downloadBtn = $('#btn-download-bouquet');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        audio.playChime(1.5);
        const link = document.createElement('a');
        link.download = `ramo-floralia-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
        showToast('¡Ramo de flores descargado con éxito! 💐', '✨');
      });
    }

    // Reset bouquet
    const resetBtn = $('#btn-reset-bouquet');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.flowersInBouquet = [
          { type: 'girasol', count: 3 },
          { type: 'rosa_amarilla', count: 2 },
          { type: 'margarita', count: 3 }
        ];
        this.renderFlowerPickers();
        this.renderBouquetCanvas();
        showToast('Ramo restaurado al diseño clásico 🌻');
      });
    }
  }

  renderBouquetCanvas() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width = 440;
    const h = this.canvas.height = 460;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Stems & Wrap Background
    ctx.save();
    ctx.translate(w / 2, h / 2 + 30);

    // Stems bundle
    ctx.strokeStyle = '#2d5a27';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 4, 20);
      ctx.lineTo(i * 2, 120);
      ctx.stroke();
    }

    // Luxury Wrapping Paper (Cone Shape)
    let wrapColor1 = '#d4a373', wrapColor2 = '#bc6c25'; // Kraft
    if (this.selectedWrap === 'pink') { wrapColor1 = '#fbcfe8'; wrapColor2 = '#f472b6'; }
    if (this.selectedWrap === 'black') { wrapColor1 = '#27272a'; wrapColor2 = '#09090b'; }
    if (this.selectedWrap === 'gold') { wrapColor1 = '#fef08a'; wrapColor2 = '#eab308'; }

    const grad = ctx.createLinearGradient(-80, 0, 80, 130);
    grad.addColorStop(0, wrapColor1);
    grad.addColorStop(1, wrapColor2);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-110, -20);
    ctx.lineTo(110, -20);
    ctx.lineTo(40, 130);
    ctx.lineTo(-40, 130);
    ctx.closePath();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Wrap folds
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-110, -20);
    ctx.lineTo(20, 130);
    ctx.stroke();

    // 2. Draw Golden Ribbon Bow
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(0, 80, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-20, 78, 14, 8, -0.4, 0, Math.PI * 2);
    ctx.ellipse(20, 78, 14, 8, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw Flowers in Layered Dome
    let flowerList = [];
    this.flowersInBouquet.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        flowerList.push(item.type);
      }
    });

    flowerList.forEach((type, idx) => {
      const angle = (idx / Math.max(1, flowerList.length)) * Math.PI * 1.6 + 2.3;
      const dist = 35 + (idx % 3) * 35;
      const fx = Math.cos(angle) * dist;
      const fy = Math.sin(angle) * (dist * 0.7) - 60;

      const fInfo = this.flowerDefs[type] || this.flowerDefs.girasol;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.font = `${32 + (idx % 2) * 8}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.fillText(fInfo.emoji, 0, 0);
      ctx.restore();
    });

    // 4. Fairy lights sparkles on canvas if active
    if (this.fairyLightsActive) {
      for (let i = 0; i < 16; i++) {
        const lx = Math.sin(i * 1.5) * 80;
        const ly = -120 + i * 14;
        ctx.fillStyle = '#fff4a3';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // 5. Hanging Gift Tag Card
    if (this.tagText) {
      ctx.save();
      ctx.translate(50, 60);
      ctx.rotate(0.2);

      // Card paper
      ctx.fillStyle = '#fffcf0';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 8;
      ctx.fillRect(-60, -20, 120, 42);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1;
      ctx.strokeRect(-58, -18, 116, 38);

      ctx.fillStyle = '#4a2f13';
      ctx.font = 'italic 11px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(this.tagText.slice(0, 22), 0, 4);

      ctx.restore();
    }

    ctx.restore();
  }
}
