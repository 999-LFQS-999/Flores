/**
 * FLORALIA STUDIO - 5 UNIQUE 3D ENVIRONMENTS
 */

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.currentEnvGroup = new THREE.Group();
    this.scene.add(this.currentEnvGroup);
    this.activeEnvName = 'sunflower';
    this.heartGroup = null;
    this.animatedObjects = [];
  }

  clearCurrent() {
    while (this.currentEnvGroup.children.length > 0) {
      const obj = this.currentEnvGroup.children[0];
      this.currentEnvGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
    this.heartGroup = null;
    this.animatedObjects = [];
  }

  loadEnvironment(name) {
    this.clearCurrent();
    this.activeEnvName = name;

    switch (name) {
      case 'sunflower':
        this.buildSunflowerField();
        break;
      case 'heart':
        this.buildHeartWorld();
        break;
      case 'rose':
        this.buildRoseSanctuary();
        break;
      case 'cosmos':
        this.buildCosmicNight();
        break;
      case 'sakura':
        this.buildSakuraZen();
        break;
      default:
        this.buildSunflowerField();
    }
  }

  /* ================= 1. SUNFLOWER FIELD ================= */
  buildSunflowerField() {
    // 1. Terrain
    const groundGeo = new THREE.PlaneGeometry(50, 50, 64, 64);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const z = Math.sin(vx * 0.15) * Math.cos(vy * 0.15) * 0.6;
      pos.setZ(i, z);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1f3d1f,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    this.currentEnvGroup.add(ground);

    // 2. Instanced Sunflowers & Yellow Flowers
    const count = 300;
    const stemGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.6, 6);
    stemGeo.translate(0, 0.8, 0);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3d702d, roughness: 0.7 });
    const stems = new THREE.InstancedMesh(stemGeo, stemMat, count);

    const diskGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12);
    diskGeo.rotateX(Math.PI / 2);
    const diskMat = new THREE.MeshStandardMaterial({ color: 0x4a2a0a, roughness: 0.9 });
    const disks = new THREE.InstancedMesh(diskGeo, diskMat, count);

    const PETALS = 10;
    const petalGeo = new THREE.ConeGeometry(0.18, 0.65, 5);
    petalGeo.rotateX(Math.PI / 2);
    petalGeo.translate(0, 0.35, 0);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.5 });
    const petals = new THREE.InstancedMesh(petalGeo, petalMat, count * PETALS);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let pIdx = 0;

    for (let i = 0; i < count; i++) {
      const radius = 1.2 + Math.random() * 12;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 0.6 - 0.5;

      const scale = 0.7 + Math.random() * 0.6;
      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.x = (Math.random() - 0.5) * 0.2;
      dummy.updateMatrix();
      stems.setMatrixAt(i, dummy.matrix);

      // Flower Head pos
      const headDummy = new THREE.Object3D();
      headDummy.position.set(x, y + 1.55 * scale, z);
      headDummy.scale.set(scale, scale, scale);
      headDummy.rotation.set(-0.35, dummy.rotation.y, 0); // Tilt toward sun
      headDummy.updateMatrix();
      disks.setMatrixAt(i, headDummy.matrix);

      for (let k = 0; k < PETALS; k++) {
        const pDummy = new THREE.Object3D();
        pDummy.position.copy(headDummy.position);
        pDummy.rotation.copy(headDummy.rotation);
        pDummy.rotateZ((k / PETALS) * Math.PI * 2);
        pDummy.scale.set(scale, scale, scale);
        pDummy.updateMatrix();
        petals.setMatrixAt(pIdx, pDummy.matrix);

        // Golden yellow hue variations
        color.setHSL(0.12 + (Math.random() - 0.5) * 0.03, 0.98, 0.52 + Math.random() * 0.1);
        petals.setColorAt(pIdx, color);
        pIdx++;
      }
    }

    stems.instanceMatrix.needsUpdate = true;
    disks.instanceMatrix.needsUpdate = true;
    petals.instanceMatrix.needsUpdate = true;
    if (petals.instanceColor) petals.instanceColor.needsUpdate = true;

    this.currentEnvGroup.add(stems);
    this.currentEnvGroup.add(disks);
    this.currentEnvGroup.add(petals);

    // Glowing Sun Sphere in sky
    const sunGeo = new THREE.SphereGeometry(2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffe680 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(10, 14, -18);
    this.currentEnvGroup.add(sun);
  }

  /* ================= 2. 3D HEART WORLD ================= */
  buildHeartWorld() {
    this.heartGroup = new THREE.Group();
    this.currentEnvGroup.add(this.heartGroup);

    // Heart Surface function
    function f(px, py, pz) {
      const x = px, y = pz, z = py;
      const a = x * x + 2.25 * y * y + z * z - 1;
      return a * a * a - x * x * z * z * z - 0.1125 * y * y * z * z * z;
    }

    function normal(p) {
      const e = 0.01;
      return new THREE.Vector3(
        f(p.x + e, p.y, p.z) - f(p.x - e, p.y, p.z),
        f(p.x, p.y + e, p.z) - f(p.x, p.y - e, p.z),
        f(p.x, p.y, p.z + e) - f(p.x, p.y, p.z - e)
      ).normalize();
    }

    const N_FLORES = 1100;
    const puntos = [];
    let intentos = 0;
    while (puntos.length < N_FLORES && intentos < 300000) {
      intentos++;
      const p = new THREE.Vector3(
        (Math.random() * 2 - 1) * 1.4,
        (Math.random() * 2 - 1) * 1.4,
        (Math.random() * 2 - 1) * 0.9
      );
      if (f(p.x, p.y, p.z) <= 0 && f(p.x * 1.09, p.y * 1.09, p.z * 1.09) > 0) {
        puntos.push(p);
      }
    }

    const PETALOS = 8;
    const petaloGeo = new THREE.SphereGeometry(1, 8, 6);
    petaloGeo.scale(0.5, 0.2, 0.07);
    petaloGeo.translate(0.5, 0, 0);

    const centroGeo = new THREE.SphereGeometry(0.28, 8, 6);
    centroGeo.scale(1, 1, 0.65);
    centroGeo.translate(0, 0, 0.04);

    const mat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.0 });
    const petalos = new THREE.InstancedMesh(petaloGeo, mat, puntos.length * PETALOS);
    const centros = new THREE.InstancedMesh(centroGeo, mat, puntos.length);

    const zAxis = new THREE.Vector3(0, 0, 1);
    const qRoll = new THREE.Quaternion();
    const qAlin = new THREE.Quaternion();
    const mFlor = new THREE.Matrix4(), mParte = new THREE.Matrix4(), mFinal = new THREE.Matrix4();
    const qParte = new THREE.Quaternion();
    const color = new THREE.Color();
    const uno = new THREE.Vector3(1, 1, 1);
    let ip = 0;

    puntos.forEach((p, i) => {
      const n = normal(p);
      const pos = p.clone().addScaledVector(n, 0.02);
      qAlin.setFromUnitVectors(zAxis, n);
      qRoll.setFromAxisAngle(zAxis, Math.random() * Math.PI * 2);
      const q = qAlin.clone().multiply(qRoll);
      const s = 0.075 + Math.random() * 0.06;
      mFlor.compose(pos, q, new THREE.Vector3(s, s, s));

      const h = 0.115 + Math.random() * 0.04;
      const l = 0.5 + Math.random() * 0.14;

      for (let k = 0; k < PETALOS; k++) {
        const ang = (k / PETALOS) * Math.PI * 2;
        qParte.setFromAxisAngle(zAxis, ang);
        mParte.compose(new THREE.Vector3(0, 0, 0), qParte, uno);
        mFinal.multiplyMatrices(mFlor, mParte);
        petalos.setMatrixAt(ip, mFinal);
        color.setHSL(h, 0.95, l + (k % 2 ? 0.04 : 0));
        petalos.setColorAt(ip, color);
        ip++;
      }

      mFinal.copy(mFlor);
      centros.setMatrixAt(i, mFinal);
      color.setHSL(0.07, 0.75, 0.22 + Math.random() * 0.08);
      centros.setColorAt(i, color);
    });

    petalos.instanceMatrix.needsUpdate = true;
    centros.instanceMatrix.needsUpdate = true;
    if (petalos.instanceColor) petalos.instanceColor.needsUpdate = true;
    if (centros.instanceColor) centros.instanceColor.needsUpdate = true;

    this.heartGroup.add(petalos);
    this.heartGroup.add(centros);
  }

  /* ================= 3. ENCHANTED ROSE SANCTUARY ================= */
  buildRoseSanctuary() {
    const groundGeo = new THREE.CircleGeometry(16, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f291e, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    this.currentEnvGroup.add(ground);

    const roseCount = 200;
    const roseGeo = new THREE.TorusKnotGeometry(0.2, 0.08, 40, 8, 2, 3);
    const roseMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.4,
      emissive: 0x881337,
      emissiveIntensity: 0.2
    });
    const roses = new THREE.InstancedMesh(roseGeo, roseMat, roseCount);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < roseCount; i++) {
      const r = 1 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      dummy.position.set(Math.cos(theta) * r, -0.3 + Math.random() * 0.2, Math.sin(theta) * r);
      dummy.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI);
      const s = 0.8 + Math.random() * 0.6;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      roses.setMatrixAt(i, dummy.matrix);

      // Crimson & Pink tones
      color.setHSL(0.96 + (Math.random() - 0.5) * 0.06, 0.9, 0.45 + Math.random() * 0.25);
      roses.setColorAt(i, color);
    }
    roses.instanceMatrix.needsUpdate = true;
    if (roses.instanceColor) roses.instanceColor.needsUpdate = true;
    this.currentEnvGroup.add(roses);
  }

  /* ================= 4. COSMIC BIOLUMINESCENT POND ================= */
  buildCosmicNight() {
    // Water plane
    const waterGeo = new THREE.PlaneGeometry(40, 40);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x040817,
      roughness: 0.1,
      metalness: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.5;
    this.currentEnvGroup.add(water);

    // Glowing Neon Flowers
    const lotusCount = 90;
    const petalGeo = new THREE.ConeGeometry(0.2, 0.7, 4);
    petalGeo.rotateX(Math.PI / 2);
    const lotusMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const lotuses = new THREE.InstancedMesh(petalGeo, lotusMat, lotusCount * 6);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let lIdx = 0;

    for (let i = 0; i < lotusCount; i++) {
      const r = 1 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const cx = Math.cos(theta) * r;
      const cz = Math.sin(theta) * r;

      for (let k = 0; k < 6; k++) {
        dummy.position.set(cx, -0.4, cz);
        dummy.rotation.set(-0.3, (k / 6) * Math.PI * 2, 0);
        dummy.scale.set(0.8, 0.8, 0.8);
        dummy.updateMatrix();
        lotuses.setMatrixAt(lIdx, dummy.matrix);

        color.setHSL(0.5 + Math.random() * 0.35, 0.9, 0.65);
        lotuses.setColorAt(lIdx, color);
        lIdx++;
      }
    }
    lotuses.instanceMatrix.needsUpdate = true;
    if (lotuses.instanceColor) lotuses.instanceColor.needsUpdate = true;
    this.currentEnvGroup.add(lotuses);
  }

  /* ================= 5. SAKURA ZEN HAVEN ================= */
  buildSakuraZen() {
    // Ground
    const groundGeo = new THREE.CircleGeometry(16, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a2e1a, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    this.currentEnvGroup.add(ground);

    // Sakura Tree Trunk & Branches
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.5, 3.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(0, 1.25, 0);
    this.currentEnvGroup.add(trunk);

    // Pink Sakura Blossom Clouds
    const blossomCount = 350;
    const bGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const bMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      emissive: 0xf472b6,
      emissiveIntensity: 0.25,
      roughness: 0.5
    });
    const blossoms = new THREE.InstancedMesh(bGeo, bMat, blossomCount);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < blossomCount; i++) {
      const radius = 0.5 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.6;
      dummy.position.set(
        Math.sin(phi) * Math.cos(theta) * radius,
        2.5 + Math.cos(phi) * radius * 0.8,
        Math.sin(phi) * Math.sin(theta) * radius
      );
      const s = 0.6 + Math.random() * 0.8;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      blossoms.setMatrixAt(i, dummy.matrix);

      color.setHSL(0.93 + (Math.random() - 0.5) * 0.05, 0.85, 0.8 + Math.random() * 0.15);
      blossoms.setColorAt(i, color);
    }
    blossoms.instanceMatrix.needsUpdate = true;
    if (blossoms.instanceColor) blossoms.instanceColor.needsUpdate = true;
    this.currentEnvGroup.add(blossoms);
  }

  update(delta, time) {
    if (this.heartGroup) {
      // Gentle breathing pulse
      const scale = 1 + Math.sin(time * 2.5) * 0.04;
      this.heartGroup.scale.set(scale, scale, scale);
      this.heartGroup.rotation.y = Math.sin(time * 0.3) * 0.2;
    }
  }
}
