/**
 * FLORALIA STUDIO - PROCEDURAL FLOWER BLOOMING GENERATOR
 */

export class FlowerBloomManager {
  constructor(scene) {
    this.scene = scene;
    this.bloomingFlowers = [];
  }

  plantFlowerAt(x, z, theme = 'gold') {
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(x, 0, z);

    // Stem
    const stemCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3((Math.random() - 0.5) * 0.2, 0.5, (Math.random() - 0.5) * 0.2),
      new THREE.Vector3((Math.random() - 0.5) * 0.3, 1.0, (Math.random() - 0.5) * 0.3),
      new THREE.Vector3(0, 1.4 + Math.random() * 0.4, 0)
    );
    const stemGeo = new THREE.TubeGeometry(stemCurve, 12, 0.035, 6, false);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.6
    });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.scale.set(1, 0.01, 1);
    flowerGroup.add(stem);

    // Head group at tip of stem
    const headGroup = new THREE.Group();
    headGroup.position.copy(stemCurve.getPoint(1));
    headGroup.scale.set(0.01, 0.01, 0.01);

    // Center disk
    const centerGeo = new THREE.SphereGeometry(0.18, 12, 8);
    centerGeo.scale(1, 0.6, 1);
    const centerMat = new THREE.MeshStandardMaterial({
      color: theme === 'rose' ? 0x881337 : theme === 'cosmos' ? 0x06b6d4 : 0x5c330a,
      roughness: 0.8,
      emissive: theme === 'cosmos' ? 0x06b6d4 : 0x000000,
      emissiveIntensity: 0.4
    });
    const center = new THREE.Mesh(centerGeo, centerMat);
    headGroup.add(center);

    // Petals
    const petalCount = theme === 'rose' ? 16 : 12;
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(0.15, 0.35, 0, 0.7);
    petalShape.quadraticCurveTo(-0.15, 0.35, 0, 0);

    const petalGeo = new THREE.ShapeGeometry(petalShape);
    petalGeo.scale(0.8, 0.8, 0.8);

    let petalColor = 0xffd23f;
    let emissiveColor = 0x000000;
    if (theme === 'rose') {
      petalColor = Math.random() > 0.4 ? 0xe11d48 : 0xf472b6;
    } else if (theme === 'sakura') {
      petalColor = 0xfbcfe8;
    } else if (theme === 'cosmos') {
      petalColor = 0xa855f7;
      emissiveColor = 0x9333ea;
    }

    const petalMat = new THREE.MeshStandardMaterial({
      color: petalColor,
      roughness: 0.5,
      side: THREE.DoubleSide,
      emissive: emissiveColor,
      emissiveIntensity: 0.3
    });

    const petalMeshes = [];
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.rotation.z = angle;
      petal.rotation.x = Math.PI * 0.4; // Closed at first
      headGroup.add(petal);
      petalMeshes.push(petal);
    }

    flowerGroup.add(headGroup);
    this.scene.add(flowerGroup);

    // Add to animation list
    this.bloomingFlowers.push({
      group: flowerGroup,
      stem,
      headGroup,
      petalMeshes,
      progress: 0,
      speed: 1.2 + Math.random() * 0.6,
      targetPetalTilt: Math.PI * 0.15 + Math.random() * 0.1
    });

    return flowerGroup;
  }

  update(delta) {
    for (let i = this.bloomingFlowers.length - 1; i >= 0; i--) {
      const f = this.bloomingFlowers[i];
      f.progress += delta * f.speed;

      // 1. Grow stem
      const stemProg = Math.min(f.progress * 1.5, 1);
      f.stem.scale.y = stemProg;

      // 2. Scale flower head
      const headProg = Math.max(0, Math.min((f.progress - 0.3) * 1.8, 1));
      f.headGroup.scale.set(headProg, headProg, headProg);

      // 3. Unfurl petals
      const bloomProg = Math.max(0, Math.min((f.progress - 0.5) * 2, 1));
      f.petalMeshes.forEach(petal => {
        petal.rotation.x = THREE.MathUtils.lerp(Math.PI * 0.4, f.targetPetalTilt, bloomProg);
      });

      // Sway in gentle breeze once fully bloomed
      if (f.progress >= 1.2) {
        f.group.rotation.z = Math.sin(Date.now() * 0.002 + f.group.position.x) * 0.05;
      }
    }
  }

  clear() {
    this.bloomingFlowers.forEach(f => {
      this.scene.remove(f.group);
    });
    this.bloomingFlowers = [];
  }
}
