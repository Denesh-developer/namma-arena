import * as THREE from 'three';
import { sound } from './audio.js';

export const WEAPON_DEFS = {
  desert_eagle: {
    id: 'desert_eagle',
    name: 'Desert Eagle',
    type: 'pistol',
    damage: 54,
    headshotMult: 2.8,
    pellets: 1,
    fireRate: 0.35,
    magSize: 7,
    reserveAmmo: 35,
    reloadTime: 1.5,
    spread: 0.015,
    range: 120,
    recoil: 0.035,
    hasScope: false
  },
  m1887: {
    id: 'm1887',
    name: 'M1887 Shotgun',
    type: 'shotgun',
    damage: 24,
    headshotMult: 1.8,
    pellets: 8,
    fireRate: 0.22,
    magSize: 2,
    reserveAmmo: 24,
    reloadTime: 1.8,
    spread: 0.065,
    range: 45,
    recoil: 0.08,
    hasScope: false
  },
  mp40: {
    id: 'mp40',
    name: 'MP40',
    type: 'smg',
    damage: 22,
    headshotMult: 2.5,
    pellets: 1,
    fireRate: 0.085,
    magSize: 30,
    reserveAmmo: 120,
    reloadTime: 2.0,
    spread: 0.035,
    range: 75,
    recoil: 0.02,
    hasScope: false
  },
  ak47: {
    id: 'ak47',
    name: 'AK-47',
    type: 'rifle',
    damage: 38,
    headshotMult: 2.6,
    pellets: 1,
    fireRate: 0.13,
    magSize: 30,
    reserveAmmo: 90,
    reloadTime: 2.2,
    spread: 0.025,
    range: 150,
    recoil: 0.035,
    hasScope: true,
    zoomFov: 40
  },
  awm: {
    id: 'awm',
    name: 'AWM Sniper',
    type: 'sniper',
    damage: 150,
    headshotMult: 2.5,
    pellets: 1,
    fireRate: 1.3,
    magSize: 5,
    reserveAmmo: 15,
    reloadTime: 2.6,
    spread: 0.005,
    range: 300,
    recoil: 0.1,
    hasScope: true,
    zoomFov: 18
  }
};

// 3D Gun Model Generator
export function createGunMesh(weaponId) {
  const group = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x22262c, metalness: 0.85, roughness: 0.25 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd8dde6, metalness: 0.9, roughness: 0.15 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6e3d1c, roughness: 0.7 });
  const oliveMat = new THREE.MeshStandardMaterial({ color: 0x3d4a36, roughness: 0.6 });

  switch (weaponId) {
    case 'desert_eagle': {
      // Heavy Chrome Pistol
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.42), chromeMat);
      slide.position.set(0, 0.06, -0.06);
      group.add(slide);

      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.22, 0.12), steelMat);
      grip.position.set(0, -0.08, 0.08);
      grip.rotation.x = -0.25;
      group.add(grip);
      break;
    }

    case 'm1887': {
      // Double Barrel Shotgun
      // Dual Barrels
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.65, 12), steelMat);
      b1.rotation.x = Math.PI / 2;
      b1.position.set(-0.032, 0.04, -0.2);
      group.add(b1);

      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.65, 12), steelMat);
      b2.rotation.x = Math.PI / 2;
      b2.position.set(0.032, 0.04, -0.2);
      group.add(b2);

      // Wooden Stock & Lever
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.38), woodMat);
      stock.position.set(0, -0.04, 0.22);
      stock.rotation.x = -0.15;
      group.add(stock);

      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.22), steelMat);
      receiver.position.set(0, 0.02, 0.06);
      group.add(receiver);
      break;
    }

    case 'mp40': {
      // SMG with vertical mag
      const receiver = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.58, 12), steelMat);
      receiver.rotation.x = Math.PI / 2;
      receiver.position.set(0, 0.04, -0.12);
      group.add(receiver);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 10), steelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.04, -0.5);
      group.add(barrel);

      // Long vertical clip
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.07), steelMat);
      mag.position.set(0, -0.16, -0.12);
      group.add(mag);

      // Grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.09), woodMat);
      grip.position.set(0, -0.08, 0.08);
      grip.rotation.x = -0.3;
      group.add(grip);
      break;
    }

    case 'ak47': {
      // Assault Rifle
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.5), steelMat);
      body.position.set(0, 0.04, 0);
      group.add(body);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 10), steelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.06, -0.48);
      group.add(barrel);

      const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.28), woodMat);
      handguard.position.set(0, 0.04, -0.32);
      group.add(handguard);

      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.36), woodMat);
      stock.position.set(0, -0.02, 0.36);
      stock.rotation.x = -0.1;
      group.add(stock);

      // Banana Magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.12), steelMat);
      mag.position.set(0, -0.14, -0.08);
      mag.rotation.x = 0.28;
      group.add(mag);
      break;
    }

    case 'awm': {
      // Sniper Rifle
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.65), oliveMat);
      body.position.set(0, 0.02, 0);
      group.add(body);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.85, 12), steelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.05, -0.7);
      group.add(barrel);

      const muzzleBrake = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.12), steelMat);
      muzzleBrake.position.set(0, 0.05, -1.14);
      group.add(muzzleBrake);

      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.4), oliveMat);
      stock.position.set(0, -0.02, 0.42);
      group.add(stock);

      // High Powered Scope
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.36, 12), steelMat);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0, 0.16, -0.08);
      group.add(scope);
      break;
    }
  }

  // Muzzle flash point light & sprite
  const flash = new THREE.PointLight(0xffaa22, 0, 8);
  flash.position.set(0, 0.05, -0.9);
  group.add(flash);
  group.userData.flash = flash;

  group.scale.set(0.9, 0.9, 0.9);
  return group;
}

// Tracer and Muzzle Visuals Manager
export class TracerManager {
  constructor(scene) {
    this.scene = scene;
    this.tracers = [];
  }

  addTracer(from, to, isHeadshot = false) {
    const points = [from.clone(), to.clone()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: isHeadshot ? 0xff2200 : 0xffea00,
      linewidth: 3,
      transparent: true,
      opacity: 1.0
    });
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.tracers.push({ line, life: 0.14 });
  }

  update(delta) {
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const tr = this.tracers[i];
      tr.life -= delta;
      tr.line.material.opacity = Math.max(0, tr.life / 0.14);
      if (tr.life <= 0) {
        this.scene.remove(tr.line);
        tr.line.geometry.dispose();
        tr.line.material.dispose();
        this.tracers.splice(i, 1);
      }
    }
  }

  clear() {
    this.tracers.forEach(tr => {
      this.scene.remove(tr.line);
      tr.line.geometry.dispose();
      tr.line.material.dispose();
    });
    this.tracers = [];
  }
}
