/**
 * ANIM.JS - ANIMACIONES, LETRAS SINCRONIZADAS ("ERES TÚ" & "NO HAY NADIE MÁS"), AUDIO DUAL & INTERACCIÓN
 */

// 1. Obtener parámetros de la URL (?para=Nombre&de=TuNombre&mensaje=...)
const params = new URLSearchParams(window.location.search);
const para = params.get('para') || '';
const de = params.get('de') || '';
const customMsg = params.get('mensaje') || '';

// Actualizar título y dedicatoria personalizada si existen
const tituloEl = document.querySelector(".titulo");
const cardTitle = document.getElementById("card-modal-title");
const cardMsg = document.getElementById("card-modal-msg");
const cardSender = document.getElementById("card-modal-sender");

if (tituloEl) {
  if (para && de) {
    tituloEl.innerHTML = `Para ${para}, con todo mi cariño de ${de} 💛<br><br>Estas flores amarillas son un reflejo de la alegría que traes a mi vida.`;
    if (cardTitle) cardTitle.textContent = `Para ${para} 🌻`;
    if (cardSender) cardSender.textContent = `— Con amor, ${de} 🌼`;
  } else if (para) {
    tituloEl.innerHTML = `Para ${para} 💛<br><br>Estas flores amarillas son un reflejo de la alegría que traes a mi vida.`;
    if (cardTitle) cardTitle.textContent = `Para ${para} 🌻`;
  } else if (customMsg) {
    tituloEl.innerHTML = customMsg;
    if (cardMsg) cardMsg.textContent = customMsg;
  }
}

// 2. Elementos de Audio Dual
const bgAudio = document.getElementById("bg-audio"); // Eres Tú
const letterAudio = document.getElementById("letter-audio"); // No Hay Nadie Más

// 3. Sintetizador de Balada Romántica (Web Audio API - Fallback)
class ReikBalladAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Progresión acústica dulce (G - D - Em - C)
    const chords = [
      [196.00, 246.94, 293.66, 392.00], // G
      [146.83, 220.00, 293.66, 369.99], // D
      [164.81, 196.00, 246.94, 329.63], // Em
      [130.81, 196.00, 261.63, 329.63]  // C
    ];

    let chordIdx = 0;

    const playChordStep = () => {
      if (!this.isPlaying) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.isPlaying) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 2.6);
        }, idx * 280);
      });

      if (!bgAudio || bgAudio.paused || bgAudio.error) {
        manualTime += 2.8;
        if (manualTime > 140) manualTime = 0;
        updateLyricsDisplay(manualTime);
      }
    };

    playChordStep();
    this.timer = setInterval(playChordStep, 2800);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) clearInterval(this.timer);
  }
}

const synthMusic = new ReikBalladAudio();

// Reproducir música de fondo principal
function playMainMusic() {
  if (bgAudio) {
    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        synthMusic.start();
      });
    }
  } else {
    synthMusic.start();
  }
}

// Iniciar música en el primer toque/clic
document.addEventListener("click", () => playMainMusic(), { once: true });
document.addEventListener("touchstart", () => playMainMusic(), { once: true });

// 5. Generador de estrellas en el cielo nocturno
function createStars() {
  const container = document.createElement("div");
  container.className = "stars-container";
  document.body.appendChild(container);

  for (let i = 0; i < 90; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 70}%`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.animationDuration = `${2 + Math.random() * 3}s`;
    container.appendChild(star);
  }
}
createStars();

// 6. Destellos mágicos dorados al hacer clic
document.addEventListener("pointerdown", (e) => {
  for (let i = 0; i < 10; i++) {
    const sparkle = document.createElement("div");
    sparkle.style.position = "fixed";
    sparkle.style.left = `${e.clientX}px`;
    sparkle.style.top = `${e.clientY}px`;
    sparkle.style.width = `${6 + Math.random() * 8}px`;
    sparkle.style.height = sparkle.style.width;
    sparkle.style.borderRadius = "50%";
    sparkle.style.backgroundColor = "#ffd700";
    sparkle.style.boxShadow = "0 0 14px #ffe600, 0 0 24px #ffd700";
    sparkle.style.pointerEvents = "none";
    sparkle.style.zIndex = "999";
    sparkle.style.transition = "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease";

    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 80;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    requestAnimationFrame(() => {
      sparkle.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
      sparkle.style.opacity = "0";
    });

    setTimeout(() => sparkle.remove(), 800);
  }
});

// 7. Modal de Dedicatoria con Cambio Automático de Música ("No Hay Nadie Más")
const btnCarta = document.getElementById("btn-ver-carta");
const modalCarta = document.getElementById("letter-popup-overlay");
const btnCerrarCarta = document.getElementById("popup-close-btn");

if (btnCarta && modalCarta) {
  btnCarta.addEventListener("click", () => {
    modalCarta.classList.add("open");

    // Pausar música de fondo principal
    if (bgAudio) bgAudio.pause();
    synthMusic.stop();

    // Reproducir "No Hay Nadie Más"
    if (letterAudio) {
      letterAudio.currentTime = 0;
      letterAudio.play().catch(() => {});
    }
  });
}

function closeLetterModal() {
  if (!modalCarta) return;
  modalCarta.classList.remove("open");

  // Pausar "No Hay Nadie Más"
  if (letterAudio) letterAudio.pause();

  // Reanudar canción principal "Eres Tú"
  if (bgAudio) {
    bgAudio.play().catch(() => synthMusic.start());
  } else {
    synthMusic.start();
  }
}

if (btnCerrarCarta) {
  btnCerrarCarta.addEventListener("click", closeLetterModal);
}

if (modalCarta) {
  modalCarta.addEventListener("click", (e) => {
    if (e.target === modalCarta) {
      closeLetterModal();
    }
  });
}

// 8. Botón Flotante de Silenciar / Reproducir Música
const btnMusica = document.getElementById("btn-toggle-audio");
if (btnMusica) {
  let isMuted = false;
  btnMusica.addEventListener("click", () => {
    isMuted = !isMuted;
    if (isMuted) {
      if (bgAudio) bgAudio.pause();
      if (letterAudio) letterAudio.pause();
      synthMusic.stop();
      btnMusica.textContent = "🔇 Música";
    } else {
      if (modalCarta && modalCarta.classList.contains("open")) {
        if (letterAudio) letterAudio.play().catch(() => {});
      } else {
        playMainMusic();
      }
      btnMusica.textContent = "🎵 Música";
    }
  });
}
