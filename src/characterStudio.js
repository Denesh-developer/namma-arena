import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export const CHEYYAR_PALETTE = {
  skin: [0xf1c9a0, 0xd9a577, 0xc99a6a, 0xb07a50, 0x8a5a3a, 0x6e4630, 0x54331a, 0x27180e],
  cloth: [0x263238, 0x1a3a8a, 0x1565c0, 0x00838f, 0x2e7d32, 0xc62828, 0xf59e0b, 0x181818],
  pants: [0x212121, 0x111827, 0x37474f, 0x1a237e, 0x4e342e, 0x6d4c41, 0xf5f5f5, 0x8d6e63],
  shoes: [0x111111, 0xffffff, 0x263238, 0xc62828, 0x1a237e, 0xf59e0b],
  hair: [0x100a06, 0x3b2314, 0x7a4a24, 0xc9a063, 0x9e9e9e, 0xd97706]
};

export class CharacterStudio {
  constructor(canvasId = 'char-preview-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.loader = new GLTFLoader();
    this.modelCache = new Map();

    // Customizer state matching cheyyar-3d.vercel.app Screenshot 2
    this.gender = 'male';
    this.look = {
      sk: 0x8a5a3a, // Deep bronze skin tone
      c: 0x263238,  // Slate navy hoodie
      l: 0x212121,  // Dark charcoal joggers
      sh: 0x111111, // Black sneakers
      hr: 0x100a06, // Natural black hair
      br: 0x100a06  // Trimmed black beard
    };

    this.rotY = 0.05;
    this.targetRotY = this.rotY;
    this.isDragging = false;
    this.lastPointerX = 0;
    this.dragVel = 0;

    this.currentModel = null;
    this.bones = {};
    this.materials = {};
    this.isRunning = false;

    this.initThree();
    this.setupListeners();
    this.loadCharacter(this.gender);
  }

  initThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    this.camera.position.set(0, 1.08, 4.3);
    this.camera.lookAt(0, 0.92, 0);

    // Warm Studio Lighting (identical to cheyyar-3d)
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xdbe8ff, 0x4a3426, 0.55);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.1);
    keyLight.position.set(2, 4, 3.5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.4);
    rimLight.position.set(-2.5, 3, -3.5);
    this.scene.add(rimLight);

    const groundGlow = new THREE.PointLight(0xf59e0b, 1.8, 6);
    groundGlow.position.set(0, 0.2, 0);
    this.scene.add(groundGlow);

    // Cheyyar Glowing Podium Platform
    const pedGeo = new THREE.CylinderGeometry(0.72, 0.78, 0.06, 48);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x10141e,
      roughness: 0.4,
      metalness: 0.8
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -0.03;
    this.scene.add(pedestal);

    // Amber glowing ring rim
    const ringGeo = new THREE.RingGeometry(0.74, 0.81, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;
    this.scene.add(ring);

    this.resize();
  }

  setupListeners() {
    window.addEventListener('resize', () => this.resize());

    // Drag to rotate character
    const onDown = (e) => {
      this.isDragging = true;
      this.lastPointerX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      this.dragVel = 0;
    };

    const onMove = (e) => {
      if (!this.isDragging) return;
      const x = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const dx = x - this.lastPointerX;
      this.lastPointerX = x;
      this.dragVel = dx * 0.012;
      this.targetRotY += this.dragVel;
    };

    const onUp = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  }

  resize() {
    if (!this.canvas) return;
    const w = this.canvas.clientWidth || 400;
    const h = this.canvas.clientHeight || 500;
    const pr = this.renderer.getPixelRatio();

    if (this.canvas.width !== Math.round(w * pr) || this.canvas.height !== Math.round(h * pr)) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
  }

  async loadCharacter(gender = 'male') {
    this.gender = gender;
    const file = `/models/${gender}.glb`;

    let gltf = this.modelCache.get(file);
    if (!gltf) {
      try {
        gltf = await this.loader.loadAsync(file);
        this.modelCache.set(file, gltf);
      } catch (err) {
        console.error(`Failed to load ${file}:`, err);
        return;
      }
    }

    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.currentModel = null;
    }

    const scene = SkeletonUtils.clone(gltf.scene);
    this.currentModel = scene;

    // Scale from Centimeters (178cm) to Meters (1.78m)
    scene.scale.setScalar(0.0102);
    scene.position.set(0, 0, 0);

    // Extract bones and materials
    this.bones = {};
    this.materials = {};

    scene.traverse(node => {
      if (node.isBone) {
        const n = node.name || '';
        if (/LeftArm$/i.test(n)) this.bones.lArm = node;
        if (/RightArm$/i.test(n)) this.bones.rArm = node;
        if (/LeftForeArm$/i.test(n)) this.bones.lFore = node;
        if (/RightForeArm$/i.test(n)) this.bones.rFore = node;
        if (/Spine$/i.test(n)) this.bones.spine = node;
        if (/Spine1$/i.test(n)) this.bones.spine1 = node;
        if (/Head$/i.test(n)) this.bones.head = node;
      }

      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = false;
        node.frustumCulled = false;

        const nm = node.name || '';
        let key = 'skin';
        if (/sneaker|shoe/i.test(nm)) key = 'shoe';
        else if (/beard/i.test(nm)) key = 'beard';
        else if (/hair/i.test(nm)) key = 'hair';
        else if (/pant|bottom/i.test(nm)) key = 'bottom';
        else if (/hoodie|top|cloth|jacket/i.test(nm)) key = 'top';
        else if (/body|skin/i.test(nm)) key = 'skin';

        // Clone existing GLTF material to retain SkinnedMesh attributes & skinning shaders
        let mat = null;
        if (node.material && !Array.isArray(node.material)) {
          mat = node.material.clone();
          mat.map = null; // Remove baked texture so custom hex colour displays accurately
          mat.roughness = 0.65;
          mat.metalness = 0.08;
        } else {
          mat = new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0.08 });
        }
        node.material = mat;
        (this.materials[key] || (this.materials[key] = [])).push(mat);
      }
    });

    // Pose arms down from T-pose to natural standing stance (identical to cheyyar-3d)
    if (this.bones.lArm) {
      this.bones.lArm.rotation.set(0, 0, 1.35);
    }
    if (this.bones.rArm) {
      this.bones.rArm.rotation.set(0, 0, -1.35);
    }
    if (this.bones.lFore) {
      this.bones.lFore.rotation.set(0, 0, 0);
    }
    if (this.bones.rFore) {
      this.bones.rFore.rotation.set(0, 0, 0);
    }

    this.scene.add(this.currentModel);
    this.applyColors();
    this.resize();
    this.renderer.render(this.scene, this.camera);
    this.start();
  }

  setGender(gender) {
    if (gender === this.gender) return;
    this.loadCharacter(gender);
  }

  setSkinTone(hex) {
    this.look.sk = typeof hex === 'string' ? parseInt(hex.replace('#', '0x')) : hex;
    this.applyColors();
  }

  setClothColor(hex) {
    this.look.c = typeof hex === 'string' ? parseInt(hex.replace('#', '0x')) : hex;
    this.applyColors();
  }

  setPantsColor(hex) {
    this.look.l = typeof hex === 'string' ? parseInt(hex.replace('#', '0x')) : hex;
    this.applyColors();
  }

  setShoeColor(hex) {
    this.look.sh = typeof hex === 'string' ? parseInt(hex.replace('#', '0x')) : hex;
    this.applyColors();
  }

  setHairColor(hex) {
    this.look.hr = typeof hex === 'string' ? parseInt(hex.replace('#', '0x')) : hex;
    this.look.br = this.look.hr;
    this.applyColors();
  }

  applyColors() {
    const setMatList = (list, col) => {
      if (!list) return;
      list.forEach(m => {
        if (m && m.color) m.color.setHex(col);
      });
    };

    setMatList(this.materials.skin, this.look.sk);
    setMatList(this.materials.top, this.look.c);
    setMatList(this.materials.bottom, this.look.l);
    setMatList(this.materials.shoe, this.look.sh);
    setMatList(this.materials.hair, this.look.hr);
    setMatList(this.materials.beard, this.look.br);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    // Turntable smooth damping
    if (!this.isDragging) {
      this.dragVel *= 0.92;
      this.targetRotY += this.dragVel;
    }
    this.rotY += (this.targetRotY - this.rotY) * 0.2;

    if (this.currentModel) {
      this.currentModel.rotation.y = this.rotY;

      // Subtle breathing motion on spine
      const time = performance.now() * 0.002;
      if (this.bones.spine) {
        this.bones.spine.rotation.x = Math.sin(time) * 0.02;
      }
    }

    this.resize();
    this.renderer.render(this.scene, this.camera);
  }
}
