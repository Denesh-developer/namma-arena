import * as THREE from 'three';
import { sound } from './audio.js';

function createGlooTexture(isBlue = true) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Cyan / Blue Energy gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  if (isBlue) {
    grad.addColorStop(0, '#00e5ff');
    grad.addColorStop(0.5, '#0099ff');
    grad.addColorStop(1, '#0055ff');
  } else {
    grad.addColorStop(0, '#ff6600');
    grad.addColorStop(0.5, '#ff2200');
    grad.addColorStop(1, '#990000');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Hex energy pattern
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.45;

  const hexRadius = 24;
  for (let y = 0; y < 280; y += hexRadius * 1.5) {
    for (let x = 0; x < 280; x += hexRadius * Math.sqrt(3)) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const hx = x + hexRadius * Math.cos(angle);
        const hy = y + hexRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export class GlooWallManager {
  constructor(scene) {
    this.scene = scene;
    this.walls = [];
    this.texBlue = createGlooTexture(true);
    this.texRed = createGlooTexture(false);
  }

  deploy(position, forwardDirection, team = 'blue') {
    sound.playGlooWall();

    const wallGroup = new THREE.Group();
    const segmentWidth = 1.4;
    const height = 2.6;
    const depth = 0.25;

    const wallColor = team === 'blue' ? 0x00f0ff : 0xff4500;
    const tex = team === 'blue' ? this.texBlue : this.texRed;

    const material = new THREE.MeshStandardMaterial({
      color: wallColor,
      map: tex,
      roughness: 0.2,
      metalness: 0.5,
      emissive: wallColor,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.95
    });

    // Center curved segment
    const centerMesh = new THREE.Mesh(new THREE.BoxGeometry(segmentWidth * 1.4, height, depth), material);
    centerMesh.castShadow = true;
    centerMesh.receiveShadow = true;
    wallGroup.add(centerMesh);

    // Left curved wing
    const leftMesh = new THREE.Mesh(new THREE.BoxGeometry(segmentWidth, height, depth), material);
    leftMesh.position.set(-segmentWidth * 1.05, 0, 0.35);
    leftMesh.rotation.y = 0.5;
    leftMesh.castShadow = true;
    wallGroup.add(leftMesh);

    // Right curved wing
    const rightMesh = new THREE.Mesh(new THREE.BoxGeometry(segmentWidth, height, depth), material);
    rightMesh.position.set(segmentWidth * 1.05, 0, 0.35);
    rightMesh.rotation.y = -0.5;
    rightMesh.castShadow = true;
    wallGroup.add(rightMesh);

    // Glowing Point Light
    const light = new THREE.PointLight(wallColor, 2.0, 7);
    light.position.set(0, height * 0.5, 0.5);
    wallGroup.add(light);

    // Spawn 2.4m in front on ground
    const flatForward = new THREE.Vector3(forwardDirection.x, 0, forwardDirection.z).normalize();
    const spawnPos = position.clone().add(flatForward.clone().multiplyScalar(2.4));
    spawnPos.y = height / 2;
    wallGroup.position.copy(spawnPos);

    const angle = Math.atan2(flatForward.x, flatForward.z);
    wallGroup.rotation.y = angle;

    const wallData = {
      group: wallGroup,
      hp: 400,
      maxHp: 400,
      lifetime: 35,
      material: material,
      light: light,
      isGlooWall: true
    };

    this.scene.add(wallGroup);
    this.walls.push(wallData);

    return wallData;
  }

  damageWall(wall, amount) {
    wall.hp -= amount;
    wall.material.emissiveIntensity = 1.0;
    setTimeout(() => {
      if (wall.material) wall.material.emissiveIntensity = 0.5;
    }, 80);

    if (wall.hp <= 0) {
      this.destroyWall(wall);
    }
  }

  destroyWall(wall) {
    const idx = this.walls.indexOf(wall);
    if (idx !== -1) this.walls.splice(idx, 1);
    this.scene.remove(wall.group);
    wall.group.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }

  update(delta) {
    for (let i = this.walls.length - 1; i >= 0; i--) {
      const wall = this.walls[i];
      wall.lifetime -= delta;
      if (wall.lifetime <= 0) {
        this.destroyWall(wall);
      }
    }
  }

  getWallMeshes() {
    const meshes = [];
    this.walls.forEach(w => {
      w.group.traverse(child => {
        if (child.isMesh) {
          child.userData = { parentWall: w };
          meshes.push(child);
        }
      });
    });
    return meshes;
  }

  clear() {
    this.walls.forEach(w => {
      this.scene.remove(w.group);
      w.group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    this.walls = [];
  }
}
