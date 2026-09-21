/**
 * FLORALIA STUDIO - MAIN APPLICATION HUB
 */

import { $, $$, showToast, getUrlParams } from './utils/helpers.js';
import { audio } from './audioManager.js';
import { SceneManager } from './garden/sceneManager.js';
import { BouquetStudio } from './modules/bouquetStudio.js';
import { LetterStudio } from './modules/letterStudio.js';
import { DaisyOracleGame } from './modules/oracleGame.js';
import { PetalCatcherGame } from './modules/petalCatcher.js';
import { FloralConstellationGame } from './modules/constellation.js';
import { UnboxingExperience } from './modules/unboxingExperience.js';
import { ShareModal } from './modules/shareModal.js';

class FloraliaApp {
  constructor() {
    this.sceneManager = null;
    this.bouquetStudio = null;
    this.letterStudio = null;
    this.oracleGame = null;
    this.petalGame = null;
    this.constellationGame = null;
    this.unboxing = null;
    this.shareModal = null;

    this.quotes = [
      { text: "Hoy te regalo flores amarillas para que tu primavera nunca se acabe.", author: "Tradición Floral" },
      { text: "Que cada día florezca algo bonito y brillante en tu vida.", author: "Floralia" },
      { text: "Las flores amarillas dicen lo que a veces cuesta decir: gracias por existir.", author: "Dedicatoria" },
      { text: "Eres de esas personas que hacen que todo a su alrededor florezca con luz propia.", author: "Pensamiento" },
      { text: "Ojalá tu camino siempre huela a jazmines y primavera eterna.", author: "Deseo" }
    ];
    this.currentQuoteIdx = 0;

    this.init();
  }

  init() {
    const urlParams = getUrlParams();

    // 1. Initialize 3D Engine
    const canvas = $('#viewport-canvas');
    if (canvas) {
      this.sceneManager = new SceneManager(canvas);
      if (urlParams.mundo) {
        this.sceneManager.switchEnvironment(urlParams.mundo);
      }
    }

    // 2. Initialize Studios & Mini-games
    this.bouquetStudio = new BouquetStudio();
    this.letterStudio = new LetterStudio();
    this.oracleGame = new DaisyOracleGame();
    this.petalGame = new PetalCatcherGame();
    this.constellationGame = new FloralConstellationGame();

    // 3. Initialize Share Modal
    this.shareModal = new ShareModal(() => ({
      mundo: this.sceneManager ? this.sceneManager.environments.activeEnvName : 'sunflower'
    }));

    // 4. Initialize Surprise Unboxing
    this.unboxing = new UnboxingExperience(() => {
      // Upon opening surprise box:
      audio.startMusic();
      if (urlParams.mensaje || urlParams.para) {
        this.openModal('modal-letter');
      }
    });

    // If URL requests surprise gift box mode, trigger it
    if (urlParams.regalo) {
      setTimeout(() => this.unboxing.show(), 600);
    }

    // Set URL personalizations
    if (urlParams.para || urlParams.de) {
      const banner = $('#dedication-header-title');
      if (banner) {
        if (urlParams.para && urlParams.de) banner.textContent = `Para ${urlParams.para} de ${urlParams.de}`;
        else if (urlParams.para) banner.textContent = `Para ${urlParams.para} 💛`;
        else banner.textContent = `De parte de ${urlParams.de} 🌻`;
      }
      this.letterStudio.setLetterData(urlParams);
    }

    // 5. Setup UI & Navigation Handlers
    this.setupNavigation();
    this.setupGardenHUD();
    this.setupQuoteBubble();
    this.setupAudioControls();

    // Welcome Toast
    setTimeout(() => {
      showToast('¡Bienvenido a Floralia Studio! 🌻 Toca cualquier lugar para plantar flores.', '✨', 4500);
    }, 1200);
  }

  setupNavigation() {
    // Bottom Dock Items
    $$('.dock-item').forEach(item => {
      item.addEventListener('click', () => {
        const mode = item.dataset.mode;
        audio.playChime(1.2);

        if (mode === 'garden') {
          this.closeAllModals();
        } else if (mode === 'bouquet') {
          this.openModal('modal-bouquet');
        } else if (mode === 'letter') {
          this.openModal('modal-letter');
        } else if (mode === 'games') {
          this.openModal('modal-games');
        } else if (mode === 'surprise') {
          this.unboxing.show();
        } else if (mode === 'share') {
          this.shareModal.openWithData(this.letterStudio.getLetterData());
          this.openModal('modal-share');
        }
      });
    });

    // Modal Close buttons & backdrop clicks
    $$('.btn-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          this.closeAllModals();
        }
      });
    });

    // Mini-game subtabs
    $$('.game-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.game-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const game = btn.dataset.game;
        $$('.game-panel').forEach(p => p.style.display = 'none');
        const targetPanel = $(`#panel-${game}`);
        if (targetPanel) targetPanel.style.display = 'block';

        audio.playChime(1.3);
      });
    });
  }

  setupGardenHUD() {
    // World Switcher Buttons (Left bar)
    $$('.world-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.world-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const world = btn.dataset.world;
        if (this.sceneManager) {
          this.sceneManager.switchEnvironment(world);
          showToast(`Mundo: ${btn.querySelector('.tooltip').textContent} 🌸`);
        }
      });
    });

    // Right Controls
    const btnLighting = $('#btn-toggle-lighting');
    if (btnLighting) {
      const lights = ['sunset', 'day', 'night'];
      let lightIdx = 0;
      btnLighting.addEventListener('click', () => {
        lightIdx = (lightIdx + 1) % lights.length;
        const current = lights[lightIdx];
        this.sceneManager.setLightingMode(current);
        audio.playChime(1.4);
        showToast(`Iluminación: ${current.toUpperCase()} ☀️🌙`);
      });
    }

    const btnCamera = $('#btn-toggle-camera');
    if (btnCamera) {
      btnCamera.addEventListener('click', () => {
        const isCinematic = this.sceneManager.toggleCinematic();
        btnCamera.classList.toggle('active', isCinematic);
      });
    }

    const btnSnapshot = $('#btn-take-snapshot');
    if (btnSnapshot) {
      btnSnapshot.addEventListener('click', () => {
        this.sceneManager.takeSnapshot();
      });
    }
  }

  setupQuoteBubble() {
    const textEl = $('#quote-text');
    const authorEl = $('#quote-author');
    const nextBtn = $('#btn-next-quote');
    const plantBtn = $('#btn-quote-plant-burst');

    const updateQuote = () => {
      this.currentQuoteIdx = (this.currentQuoteIdx + 1) % this.quotes.length;
      const q = this.quotes[this.currentQuoteIdx];
      if (textEl) textEl.textContent = `"${q.text}"`;
      if (authorEl) authorEl.textContent = `— ${q.author}`;
      audio.playChime(1.1);
    };

    if (nextBtn) nextBtn.addEventListener('click', updateQuote);

    // Burst plant 6 flowers around
    if (plantBtn) {
      plantBtn.addEventListener('click', () => {
        if (!this.sceneManager) return;
        audio.playFanfare();
        for (let i = 0; i < 6; i++) {
          const r = 2 + Math.random() * 4;
          const a = (i / 6) * Math.PI * 2 + Math.random() * 0.4;
          this.sceneManager.flowerBlooms.plantFlowerAt(Math.cos(a) * r, Math.sin(a) * r, this.sceneManager.environments.activeEnvName);
        }
        showToast('¡Lluvia de flores floreciendo a tu alrededor! 🌼✨', '💛');
      });
    }
  }

  setupAudioControls() {
    const btnMusic = $('#btn-toggle-music');
    if (btnMusic) {
      btnMusic.addEventListener('click', () => {
        if (!audio.isPlayingMusic) {
          audio.startMusic();
          btnMusic.classList.add('active');
          showToast('Música ambiental iniciada 🎵');
        } else {
          audio.stopMusic();
          btnMusic.classList.remove('active');
          showToast('Música pausada 🔇');
        }
      });
    }
  }

  openModal(modalId) {
    this.closeAllModals();
    const modal = $(`#${modalId}`);
    if (modal) {
      modal.classList.add('open');
    }
  }

  closeAllModals() {
    $$('.modal-backdrop').forEach(m => m.classList.remove('open'));
  }
}

// Start app once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new FloraliaApp();
});
