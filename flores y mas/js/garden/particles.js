/**
 * FLORALIA STUDIO - 3D PARTICLES, BUTTERFLIES & FIREFLIES
 */

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.butterflies = [];
    this.petals = null;
    this.fireflies = null;
    this.petalCount = 350;
    this.fireflyCount = 120;
    this.petalPositions = null;
    this.petalRotations = null;
    this.petalSpeeds = null;

    this.initPetals();
    this.initFireflies();
    this.initButterflies();
  }

  /* ---------------- FLOATING PETALS ---------------- */
  initPetals() {
    const geo = new THREE.PlaneGeometry(0.12, 0.18);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      roughness: 0.6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    this.petals = new THREE.InstancedMesh(geo, mat, this.petalCount);
    this.petalPositions = [];
    this.petalRotations = [];
    this.petalSpeeds = [];

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < this.petalCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        Math.random() * 10 - 1,
        (Math.random() - 0.5) * 20
      );
      const rot = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      const speed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        -(0.008 + Math.random() * 0.015),
        (Math.random() - 0.5) * 0.02
      );

      this.petalPositions.push(pos);
      this.petalRotations.push(rot);
      this.petalSpeeds.push(speed);

      dummy.position.copy(pos);
      dummy.rotation.set(rot.x, rot.y, rot.z);
      dummy.updateMatrix();
      this.petals.setMatrixAt(i, dummy.matrix);

      // Gold / Yellow / Warm Pink variations
      const hue = 0.11 + (Math.random() - 0.5) * 0.04;
      color.setHSL(hue, 0.95, 0.55 + Math.random() * 0.15);
      this.petals.setColorAt(i, color);
    }

    this.petals.instanceMatrix.needsUpdate = true;
    if (this.petals.instanceColor) this.petals.instanceColor.needsUpdate = true;
    this.scene.add(this.petals);
  }

  /* ---------------- GLOWING FIREFLIES ---------------- */
  initFireflies() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.fireflyCount * 3);
    const colors = new Float32Array(this.fireflyCount * 3);

    for (let i = 0; i < this.fireflyCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = Math.random() * 6 + 0.2;
      positions[i + 2] = (Math.random() - 0.5) * 16;

      colors[i] = 1.0;
      colors[i + 1] = 0.9 + Math.random() * 0.1;
      colors[i + 2] = 0.4 + Math.random() * 0.3;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Simple sprite texture for glow
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 245, 180, 1)');
    grad.addColorStop(0.3, 'rgba(255, 215, 64, 0.7)');
    grad.addColorStop(1, 'rgba(255, 215, 64, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireflies = new THREE.Points(geo, mat);
    this.scene.add(this.fireflies);
  }

  /* ---------------- 3D BUTTERFLIES WITH FLAPPING WINGS ---------------- */
  initButterflies() {
    const butterflyCount = 6;
    for (let i = 0; i < butterflyCount; i++) {
      const bGroup = new THREE.Group();

      // Wing geometry
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.bezierCurveTo(0.2, 0.3, 0.4, 0.4, 0.5, 0.2);
      wingShape.bezierCurveTo(0.6, 0.0, 0.4, -0.3, 0.2, -0.2);
      wingShape.bezierCurveTo(0.1, -0.1, 0, -0.05, 0, 0);

      const wingGeo = new THREE.ShapeGeometry(wingShape);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0xffe066,
        emissive: 0xaa7700,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide,
        roughness: 0.4
      });

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.scale.x = -1;

      bGroup.add(leftWing);
      bGroup.add(rightWing);

      // Random starting pos & flight path parameters
      const startPos = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        1.2 + Math.random() * 2.5,
        (Math.random() - 0.5) * 10
      );
      bGroup.position.copy(startPos);
      bGroup.scale.set(0.6, 0.6, 0.6);

      this.scene.add(bGroup);

      this.butterflies.push({
        group: bGroup,
        leftWing,
        rightWing,
        speed: 0.8 + Math.random() * 0.5,
        flapSpeed: 14 + Math.random() * 6,
        radius: 2 + Math.random() * 3,
        baseY: startPos.y,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  setThemeColors(type = 'gold') {
    if (!this.petals) return;
    const color = new THREE.Color();
    for (let i = 0; i < this.petalCount; i++) {
      if (type === 'sakura') {
        color.setHSL(0.95 + (Math.random() - 0.5) * 0.06, 0.85, 0.75 + Math.random() * 0.15);
      } else if (type === 'rose') {
        color.setHSL(0.98 + (Math.random() - 0.5) * 0.04, 0.9, 0.45 + Math.random() * 0.2);
      } else if (type === 'cosmos') {
        color.setHSL(0.55 + Math.random() * 0.3, 0.9, 0.65);
      } else {
        // Gold / Yellow
        color.setHSL(0.115 + (Math.random() - 0.5) * 0.04, 0.95, 0.55 + Math.random() * 0.15);
      }
      this.petals.setColorAt(i, color);
    }
    if (this.petals.instanceColor) this.petals.instanceColor.needsUpdate = true;
  }

  update(delta, time) {
    // 1. Update Petals
    if (this.petals) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.petalCount; i++) {
        const pos = this.petalPositions[i];
        const rot = this.petalRotations[i];
        const spd = this.petalSpeeds[i];

        pos.x += spd.x + Math.sin(time * 0.5 + i) * 0.008;
        pos.y += spd.y;
        pos.z += spd.z + Math.cos(time * 0.5 + i) * 0.008;

        rot.x += 0.015;
        rot.y += 0.02;
        rot.z += 0.01;

        // Reset if too low
        if (pos.y < -1) {
          pos.y = 8 + Math.random() * 2;
          pos.x = (Math.random() - 0.5) * 20;
          pos.z = (Math.random() - 0.5) * 20;
        }

        dummy.position.copy(pos);
        dummy.rotation.set(rot.x, rot.y, rot.z);
        dummy.updateMatrix();
        this.petals.setMatrixAt(i, dummy.matrix);
      }
      this.petals.instanceMatrix.needsUpdate = true;
    }

    // 2. Update Fireflies
    if (this.fireflies) {
      const positions = this.fireflies.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time * 1.5 + i) * 0.012;
        positions[i + 1] += Math.cos(time * 1.2 + i) * 0.01;
        positions[i + 2] += Math.sin(time * 1.8 + i) * 0.012;
      }
      this.fireflies.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Update Butterflies
    this.butterflies.forEach(b => {
      b.angle += delta * b.speed * 0.6;
      b.group.position.x = Math.sin(b.angle) * b.radius;
      b.group.position.z = Math.cos(b.angle) * b.radius;
      b.group.position.y = b.baseY + Math.sin(time * 2 + b.phase) * 0.4;
      b.group.rotation.y = -b.angle + Math.PI / 2;

      const flap = Math.sin(time * b.flapSpeed) * 0.85;
      b.leftWing.rotation.y = flap;
      b.rightWing.rotation.y = -flap;
    });
  }
}
