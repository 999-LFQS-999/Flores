/**
 * ANIM.JS - ANIMACIONES, LETRAS SINCRONIZADAS ("ERES TÚ" - REIK), AUDIO & INTERACCIÓN
 */

// 1. Obtener parámetros de la URL (?para=Nombre&de=TuNombre&mensaje=...)
const params = new URLSearchParams(window.location.search);
const para = params.get('para') || '';
const de = params.get('de') || '';
const customMsg = params.get('mensaje') || '';

// Actualizar título y dedicatoria personalizada si existen
const tituloEl = document.querySelector(".titulo");
if (tituloEl) {
  if (para && de) {
    tituloEl.innerHTML = `Para ${para}, con todo mi cariño de ${de} 💛<br><br>Estas flores amarillas son un reflejo de la alegría que traes a mi vida.`;
  } else if (para) {
    tituloEl.innerHTML = `Para ${para} 💛<br><br>Estas flores amarillas son un reflejo de la alegría que traes a mi vida.`;
  } else if (customMsg) {
    tituloEl.innerHTML = customMsg;
  }
}

// 2. Sincronización de Letras de "Eres Tú" - Matisse & Reik
const lyrics = document.querySelector("#lyrics");
const audio = document.querySelector("audio");

const lyricsData = [
  { text: "Tengo ganas de tenerte siempre...", time: 3 },
  { text: "De conocerte una y mil veces...", time: 8 },
  { text: "Tengo ganas que todos se enteren...", time: 13 },
  { text: "Si existe suerte, la mía es quererte ✨", time: 18 },
  { text: "Si te falta vida, yo te la daría...", time: 24 },
  { text: "Si un día tú me faltas, yo no sé qué haría...", time: 29 },
  { text: "Porque eres el principio y el final...", time: 35 },
  { text: "✨ Eres tú, sólo tú ✨", time: 41 },
  { text: "¿Qué importa el mundo entero?", time: 47 },
  { text: "Si lo único que quiero...", time: 52 },
  { text: "Eres tú 💛🌻", time: 57 },
  { text: "Tengo ganas de que no me sueltes...", time: 64 },
  { text: "Que lentamente el tiempo vuele...", time: 70 },
  { text: "Yo me muero por amanecerte...", time: 75 },
  { text: "Que un beso llegue como el Sol y te despierte ☀️", time: 80 },
  { text: "Si te falta vida, yo te la daría...", time: 86 },
  { text: "Si un día tú me faltas, yo no sé qué haría...", time: 91 },
  { text: "Porque eres el principio y el final...", time: 97 },
  { text: "✨ Eres tú, sólo tú ✨", time: 103 },
  { text: "¿Qué importa el mundo entero?", time: 109 },
  { text: "Si lo único que quiero es sólo tú 💛", time: 114 },
  { text: "Eres tú, sólo tú...", time: 120 },
  { text: "No me importa nada el mundo entero...", time: 126 },
  { text: "🌻 Eres tú 🌻", time: 132 }
];

// Temporizador automático de letras si no hay audio file nativo
let manualTime = 0;
let lyricsInterval = null;

function updateLyricsDisplay(currentTime) {
  if (!lyrics) return;
  const currentLine = lyricsData.find(
    (line) => currentTime >= line.time && currentTime < line.time + 5.5
  );

  if (currentLine) {
    lyrics.style.opacity = "1";
    lyrics.style.transform = "translateY(0)";
    lyrics.innerHTML = currentLine.text;
  } else {
    lyrics.style.opacity = "0";
    lyrics.style.transform = "translateY(-6px)";
  }
}

function updateLyrics() {
  if (!audio) return;
  updateLyricsDisplay(audio.currentTime);
}

if (audio) {
  audio.addEventListener("timeupdate", updateLyrics);
}

// 3. Sintetizador de Balada Romántica de "Eres Tú" (Web Audio API)
class ReikBalladAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.virtualSeconds = 0;
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

    // Progresión acústica dulce y romántica de "Eres Tú" (G - D - Em - C)
    const chords = [
      [196.00, 246.94, 293.66, 392.00], // G Mayor
      [146.83, 220.00, 293.66, 369.99], // D Mayor
      [164.81, 196.00, 246.94, 329.63], // E Menor
      [130.81, 196.00, 261.63, 329.63]  // C Mayor
    ];

    let chordIdx = 0;

    const playChordStep = () => {
      if (!this.isPlaying) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      // Arpegio suave estilo guitarra acústica
      currentChord.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.isPlaying) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle'; // Tono cálido acústico
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 2.6);
        }, idx * 280);
      });

      // Si no hay audio HTML5 reproduciéndose, avanzar letras con el sintetizador
      if (!audio || audio.paused || audio.error) {
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

// Intentar reproducir audio al interactuar
function playMusic() {
  if (audio) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        synthMusic.start();
      });
    }
  } else {
    synthMusic.start();
  }
}

// Iniciar música en el primer clic o toque
document.addEventListener("click", () => playMusic(), { once: true });
document.addEventListener("touchstart", () => playMusic(), { once: true });

// 4. Generador de estrellas en el cielo
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

// 5. Destellos mágicos dorados al hacer clic o tocar
document.addEventListener("pointerdown", (e) => {
  for (let i = 0; i < 12; i++) {
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

// 6. Botones del Dock & Modal de Dedicatoria
const btnCarta = document.getElementById("btn-ver-carta");
const modalCarta = document.getElementById("letter-popup-overlay");
const btnCerrarCarta = document.getElementById("popup-close-btn");

if (btnCarta && modalCarta) {
  btnCarta.addEventListener("click", () => {
    modalCarta.classList.add("open");
  });
}

if (btnCerrarCarta && modalCarta) {
  btnCerrarCarta.addEventListener("click", () => {
    modalCarta.classList.remove("open");
  });
}

if (modalCarta) {
  modalCarta.addEventListener("click", (e) => {
    if (e.target === modalCarta) {
      modalCarta.classList.remove("open");
    }
  });
}

const btnMusica = document.getElementById("btn-toggle-audio");
if (btnMusica) {
  let isPlaying = true;
  btnMusica.addEventListener("click", () => {
    isPlaying = !isPlaying;
    if (!isPlaying) {
      if (audio) audio.pause();
      synthMusic.stop();
      btnMusica.textContent = "🔇 Música";
    } else {
      playMusic();
      btnMusica.textContent = "🎵 Música";
    }
  });
}
