import * as THREE from 'three';

export class CharacterStage {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Turntable state
    this.rotationY = 0;
    this.targetRotationY = 0;
    this.isDragging = false;
    this.prevPointerX = 0;
    this.dragVelocity = 0;

    // Build the 3D Cheyyar glowing podium
    this.createPodium();
    this.createStageLighting();
    this.setupDragListeners();

    // Hide stage by default until character screen is active
    this.setVisible(false);
  }

  createPodium() {
    // 1. Dark graphite metallic pedestal base
    const baseGeo = new THREE.CylinderGeometry(1.22, 1.32, 0.08, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f141d,
      roughness: 0.35,
      metalness: 0.85
    });
    this.baseMesh = new THREE.Mesh(baseGeo, baseMat);
    this.baseMesh.position.y = 0.04;
    this.baseMesh.receiveShadow = true;
    this.group.add(this.baseMesh);

    // 2. Bright glowing amber outer torus rim
    const rimGeo = new THREE.TorusGeometry(1.26, 0.024, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.5,
      roughness: 0.2
    });
    this.rimMesh = new THREE.Mesh(rimGeo, rimMat);
    this.rimMesh.rotation.x = Math.PI / 2;
    this.rimMesh.position.y = 0.075;
    this.group.add(this.rimMesh);

    // 3. Inner decorative concentric ring
    const innerRingGeo = new THREE.RingGeometry(0.72, 0.77, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    this.innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    this.innerRing.rotation.x = -Math.PI / 2;
    this.innerRing.position.y = 0.085;
    this.group.add(this.innerRing);

    // 4. Outer slowly rotating dashed energy ring
    const dashedGeo = new THREE.RingGeometry(0.96, 1.0, 48);
    const dashedMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    this.dashedRing = new THREE.Mesh(dashedGeo, dashedMat);
    this.dashedRing.rotation.x = -Math.PI / 2;
    this.dashedRing.position.y = 0.084;
    this.group.add(this.dashedRing);
  }

  createStageLighting() {
    this.lightsGroup = new THREE.Group();

    // Studio key light from front-right
    this.keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    this.keyLight.position.set(1.5, 3.2, 2.6);
    this.lightsGroup.add(this.keyLight);

    // Warm golden rim light from behind (gives character glowing silhouette edges)
    this.rimLight = new THREE.DirectionalLight(0xf59e0b, 3.0);
    this.rimLight.position.set(-1.2, 2.5, -2.5);
    this.lightsGroup.add(this.rimLight);

    // Soft fill light from front-left
    this.fillLight = new THREE.DirectionalLight(0x94a3b8, 0.85);
    this.fillLight.position.set(-2.0, 1.5, 2.0);
    this.lightsGroup.add(this.fillLight);

    // Floor glow point light under character
    this.podiumGlow = new THREE.PointLight(0xf59e0b, 2.0, 4.0);
    this.podiumGlow.position.set(0, 0.25, 0);
    this.lightsGroup.add(this.podiumGlow);

    this.group.add(this.lightsGroup);
  }

  setupDragListeners() {
    const stageArea = document.getElementById('char-drag-zone');
    const targetElement = stageArea || window;

    const onPointerDown = (e) => {
      const charScreen = document.getElementById('screen-character');
      if (!charScreen || !charScreen.classList.contains('active')) return;

      // Check if target is inside right panel, tabs or bottom bar - ignore drag there
      if (e.target.closest('.char-customise-panel') || 
          e.target.closest('.char-nav-tabs') || 
          e.target.closest('.char-bottom-bar') ||
          e.target.closest('.char-topbar')) {
        return;
      }

      this.isDragging = true;
      this.prevPointerX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      this.dragVelocity = 0;
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;

      const currentX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const deltaX = currentX - this.prevPointerX;
      this.prevPointerX = currentX;

      this.dragVelocity = deltaX * 0.009;
      this.targetRotationY += this.dragVelocity;
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  update(delta, player, uiCurrentScreen) {
    if (uiCurrentScreen === 'screen-character') {
      this.setVisible(true);

      // Inertia & smooth damping for character turntable rotation
      if (!this.isDragging) {
        this.dragVelocity *= 0.92;
        this.targetRotationY += this.dragVelocity;
      }
      this.rotationY += (this.targetRotationY - this.rotationY) * 0.25;

      // Animate decorative dashed ring
      if (this.dashedRing) {
        this.dashedRing.rotation.z += delta * 0.35;
      }

      // Position player on podium in front of camera
      if (player && player.mesh) {
        player.mesh.visible = true;
        player.mesh.position.set(0, 0.08, 0);
        player.mesh.rotation.set(0, this.rotationY, 0);

        // Hide gun during character customizer preview
        if (player.gunHolder) {
          player.gunHolder.visible = false;
        }

        // Keep idle animation playing
        if (player.mixer) {
          const idleAction = player.actions['idle'] || Object.values(player.actions)[0];
          if (idleAction && player.currentAction !== idleAction) {
            idleAction.reset().fadeIn(0.2).play();
            player.currentAction = idleAction;
          }
          player.mixer.update(delta);
        }
      }

      // Frame camera perfectly centered on character
      this.camera.position.set(0, 1.05, 2.95);
      this.camera.lookAt(0, 0.95, 0);
    } else {
      this.setVisible(false);
      if (player && player.gunHolder) {
        player.gunHolder.visible = true;
      }
    }
  }
}
