/**
 * FLORALIA STUDIO - WAX SEAL LETTER STUDIO & POETRY GENERATOR
 */

import { $, $$, showToast } from '../utils/helpers.js';
import { audio } from '../audioManager.js';

export class LetterStudio {
  constructor() {
    this.recipientInput = $('#parchment-recipient');
    this.senderInput = $('#parchment-sender');
    this.textArea = $('#parchment-text');
    this.waxSeal = $('#wax-seal');

    this.currentWaxColor = 'gold';
    this.isSealed = false;

    this.poems = {
      amarillas: [
        "Hoy te regalo flores amarillas para que tu primavera nunca se acabe y tu camino siempre esté lleno de luz.",
        "Que estas flores amarillas te recuerden lo radiante que haces cada uno de mis días. Gracias por florecer a mi lado.",
        "21 de septiembre: Dicen que las flores amarillas prometen amor eterno y alegría sin fin. Hoy te las entrego de todo corazón."
      ],
      romance: [
        "En un jardín de mil estrellas, tus ojos siguen siendo mi flor favorita.",
        "Si cada pensamiento tuyo fuera una flor, caminaría para siempre en un jardín eterno.",
        "Te quiero no solo por cómo eres, sino por la luz que brota en mí cuando estoy contigo."
      ],
      amistad: [
        "Las mejores amistades son como las flores más raras: crecen con el tiempo y nunca pierden su perfume. ¡Gracias por estar!",
        "La vida es más bonita y colorida cuando se comparte con alguien como tú."
      ],
      neruda: [
        "\"Podrán cortar todas las flores, pero no podrán detener la primavera.\" — Pablo Neruda",
        "\"Te amo como se aman ciertas cosas oscuras, secretamente, entre la sombra y el alma.\" — Pablo Neruda"
      ]
    };

    this.init();
  }

  init() {
    if (!this.textArea) return;
    this.setupListeners();
  }

  setupListeners() {
    // Category chips for poems
    $$('.category-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        $$('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const cat = chip.dataset.category;
        if (this.poems[cat]) {
          const randomPoem = this.poems[cat][Math.floor(Math.random() * this.poems[cat].length)];
          this.textArea.value = randomPoem;
          audio.playChime(1.2);
          showToast('¡Poema aplicado a tu carta! 📜');
        }
      });
    });

    // Font buttons
    $$('.font-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.font-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const font = btn.dataset.font;
        this.textArea.className = `parchment-textarea ${font}`;
        audio.playChime(1.1);
      });
    });

    // Wax colors
    $$('.wax-color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        $$('.wax-color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');

        this.currentWaxColor = dot.dataset.wax;
        if (this.waxSeal) {
          this.waxSeal.className = `wax-seal ${this.currentWaxColor}`;
        }
        audio.playChime(1.3);
      });
    });

    // Wax seal click to stamp / break
    if (this.waxSeal) {
      this.waxSeal.addEventListener('click', () => {
        this.isSealed = !this.isSealed;
        if (this.isSealed) {
          audio.playWaxStamp();
          showToast('Carta sellada con lacre real 💌', '⚜️');
          this.waxSeal.style.transform = 'scale(1.15)';
        } else {
          audio.playWaxCrack();
          showToast('Sello de cera abierto 🔓', '✨');
          this.waxSeal.style.transform = 'scale(1)';
        }
      });
    }

    // Polaroid click to cycle memories
    const polaroidPhoto = $('#polaroid-photo');
    const polaroidCaption = $('#polaroid-caption');
    const photos = [
      { emoji: '🌻💛', caption: 'Nuestra Primavera' },
      { emoji: '✨💐', caption: 'Momentos Eternos' },
      { emoji: '🌷☀️', caption: 'Tarde Dorada' },
      { emoji: '🌹🌟', caption: 'Siempre Juntos' }
    ];
    let photoIdx = 0;

    if (polaroidPhoto && polaroidCaption) {
      polaroidPhoto.parentElement.addEventListener('click', () => {
        photoIdx = (photoIdx + 1) % photos.length;
        polaroidPhoto.textContent = photos[photoIdx].emoji;
        polaroidCaption.textContent = photos[photoIdx].caption;
        audio.playChime(1.4);
      });
    }
  }

  getLetterData() {
    return {
      para: this.recipientInput ? this.recipientInput.value : '',
      de: this.senderInput ? this.senderInput.value : '',
      mensaje: this.textArea ? this.textArea.value : '',
      waxColor: this.currentWaxColor
    };
  }

  setLetterData(data) {
    if (data.para && this.recipientInput) this.recipientInput.value = data.para;
    if (data.de && this.senderInput) this.senderInput.value = data.de;
    if (data.mensaje && this.textArea) this.textArea.value = data.mensaje;
  }
}
