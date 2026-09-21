/**
 * FLORALIA STUDIO - DAISY ORACLE (EL ORÁCULO DE LOS PÉTALOS)
 */

import { $, $$, showToast } from '../utils/helpers.js';
import { audio } from '../audioManager.js';

export class DaisyOracleGame {
  constructor() {
    this.container = $('#daisy-svg-container');
    this.resultDisplay = $('#daisy-result-text');
    this.remainingPetals = 12;
    this.totalPetals = 12;

    this.phrases = [
      "Me quiere... 💛",
      "Mucho... ✨",
      "Con todo el corazón... 💖",
      "Me adora... 🌻",
      "Con el alma... 💫",
      "¡Para siempre! 💍✨"
    ];

    this.init();
  }

  init() {
    if (!this.container) return;
    this.buildDaisy();
  }

  buildDaisy() {
    this.container.innerHTML = '';
    this.remainingPetals = this.totalPetals;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 280 280");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    // Petals
    for (let i = 0; i < this.totalPetals; i++) {
      const angle = (i / this.totalPetals) * 360;
      const petal = document.createElementNS(svgNS, "path");
      petal.setAttribute("d", "M 140 140 Q 125 50, 140 20 Q 155 50, 140 140");
      petal.setAttribute("fill", "#ffffff");
      petal.setAttribute("stroke", "#fde047");
      petal.setAttribute("stroke-width", "1.5");
      petal.setAttribute("class", "daisy-petal");
      petal.style.transform = `rotate(${angle}deg)`;

      petal.addEventListener('click', (e) => {
        this.pluckPetal(petal, i);
      });

      svg.appendChild(petal);
    }

    // Daisy Center
    const center = document.createElementNS(svgNS, "circle");
    center.setAttribute("cx", "140");
    center.setAttribute("cy", "140");
    center.setAttribute("r", "32");
    center.setAttribute("fill", "url(#daisyCenterGrad)");
    center.setAttribute("class", "daisy-center");

    // Gradient def
    const defs = document.createElementNS(svgNS, "defs");
    defs.innerHTML = `
      <radialGradient id="daisyCenterGrad" cx="40%" cy="40%">
        <stop offset="0%" stop-color="#fff066" />
        <stop offset="70%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#b45309" />
      </radialGradient>
    `;
    svg.appendChild(defs);
    svg.appendChild(center);

    this.container.appendChild(svg);
    if (this.resultDisplay) {
      this.resultDisplay.textContent = "Toca un pétalo para deshojar la margarita... 🌼";
    }
  }

  pluckPetal(petalElement, index) {
    if (petalElement.classList.contains('plucked')) return;

    petalElement.classList.add('plucked');
    this.remainingPetals--;

    audio.playPluck(350 + (this.totalPetals - this.remainingPetals) * 45);

    const phraseIndex = (this.totalPetals - this.remainingPetals - 1) % this.phrases.length;
    let currentPhrase = this.phrases[phraseIndex];

    if (this.remainingPetals === 0) {
      currentPhrase = "✨ ¡Te ama con todo su ser para siempre! 💛🌻";
      audio.playFanfare();
      showToast('¡El oráculo ha hablado! 🌼✨', '💛');
    }

    if (this.resultDisplay) {
      this.resultDisplay.textContent = currentPhrase;
    }
  }

  reset() {
    this.buildDaisy();
  }
}
