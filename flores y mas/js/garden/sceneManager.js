/**
 * FLORALIA STUDIO - 3D SCENE MANAGER (Three.js & Controls)
 */

import { ParticleSystem } from './particles.js';
import { EnvironmentManager } from './environments.js';
import { FlowerBloomManager } from './flowerBloom.js';
import { audio } from '../audioManager.js';
import { showToast } from '../utils/helpers.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.particles = null;
    this.environments = null;
    this.flowerBlooms = null;

    this.ambientLight = null;
    this.sunLight = null;
    this.warmPointLight = null;

    this.isCinematic = false;
    this.currentLighting = 'sunset';
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  init() {
    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 3, 7.5);

    // 3. OrbitControls
    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
      this.controls.minDistance = 2;
      this.controls.maxDistance = 22;
      this.controls.target.set(0, 1, 0);
    }

    // 4. Lights
    this.setupLighting();

    // 5. Systems
    this.particles = new ParticleSystem(this.scene);
    this.environments = new EnvironmentManager(this.scene);
    this.flowerBlooms = new FlowerBloomManager(this.scene);

    // Initial world
    this.environments.loadEnvironment('sunflower');

    // 6. Listeners
    window.addEventListener('resize', () => this.onResize());
    this.setupRaycasting();

    // 7. Start Loop
    this.animate();
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xfff4d6, 0.8);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sunLight.position.set(8, 12, 8);
    this.scene.add(this.sunLight);

    this.warmPointLight = new THREE.PointLight(0xffa114, 1.5, 20);
    this.warmPointLight.position.set(-4, 2, 4);
    this.scene.add(this.warmPointLight);
  }

  setLightingMode(mode) {
    this.currentLighting = mode;
    if (mode === 'day') {
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 1.0;
      this.sunLight.color.setHex(0xfffde8);
      this.sunLight.intensity = 1.4;
      this.warmPointLight.intensity = 0.5;
      document.body.style.background = 'radial-gradient(circle at 50% 30%, #4361ee 0%, #1e1b4b 60%, #09091b 100%)';
    } else if (mode === 'sunset') {
      this.ambientLight.color.setHex(0xffeedb);
      this.ambientLight.intensity = 0.8;
      this.sunLight.color.setHex(0xffaa44);
      this.sunLight.intensity = 1.2;
      this.warmPointLight.color.setHex(0xff7700);
      this.warmPointLight.intensity = 1.6;
      document.body.style.background = 'radial-gradient(circle at 50% 30%, #7e22ce 0%, #2e1065 50%, #0a0614 100%)';
    } else if (mode === 'night') {
      this.ambientLight.color.setHex(0x1e1b4b);
      this.ambientLight.intensity = 0.4;
      this.sunLight.color.setHex(0x38bdf8);
      this.sunLight.intensity = 0.5;
      this.warmPointLight.color.setHex(0xffd700);
      this.warmPointLight.intensity = 2.2;
      document.body.style.background = 'radial-gradient(circle at 50% 30%, #0f172a 0%, #030712 70%, #000000 100%)';
    }
  }

  switchEnvironment(envName) {
    this.environments.loadEnvironment(envName);
    this.particles.setThemeColors(envName);
    audio.playChime(1.2);
  }

  setupRaycasting() {
    this.canvas.addEventListener('pointerdown', (e) => {
      // Raycast to plant flower if clicked
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.environments.currentEnvGroup.children, true);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        if (Math.abs(point.x) < 14 && Math.abs(point.z) < 14) {
          const theme = this.environments.activeEnvName;
          this.flowerBlooms.plantFlowerAt(point.x, point.z, theme);
          audio.playChime(1.4 + Math.random() * 0.4);
        }
      }
    });
  }

  toggleCinematic() {
    this.isCinematic = !this.isCinematic;
    if (this.controls) {
      this.controls.autoRotate = this.isCinematic;
      this.controls.autoRotateSpeed = 0.8;
    }
    showToast(this.isCinematic ? 'Cámara Cinemática Activada 🎬' : 'Cámara Libre 🎮', '🎥');
    return this.isCinematic;
  }

  takeSnapshot() {
    audio.playChime(1.5);
    const link = document.createElement('a');
    link.download = `floralia-${this.environments.activeEnvName}-${Date.now()}.png`;
    link.href = this.renderer.domElement.toDataURL('image/png');
    link.click();
    showToast('¡Fotografía floral guardada! 📸', '✨');
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.controls) this.controls.update();

    this.particles.update(delta, time);
    this.environments.update(delta, time);
    this.flowerBlooms.update(delta);

    this.renderer.render(this.scene, this.camera);
  }
}
