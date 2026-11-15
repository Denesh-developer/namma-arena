import * as THREE from 'three';
import { sound } from './audio.js';
import { WEAPON_DEFS } from './weapons.js';
import { characterAssets } from './characterLoader.js';

export class Bot {
  constructor(scene, name, team, role, spawnPos, modelKey) {
    this.scene = scene;
    this.name = name;
    this.team = team;
    this.role = role;
    this.spawnPos = spawnPos.clone();
    this.position = spawnPos.clone();
    this.velocity = new THREE.Vector3();
    this.yaw = team === 'blue' ? Math.PI : 0;
    this.modelKey = modelKey;

    // Stats
    this.maxHp = 200;
    this.hp = 200;
    this.armor = 100;
    this.isDead = false;
    this.glooCount = 1;

    // Weapon
    this.weapon = WEAPON_DEFS.mp40;
    this.lastShotTime = 0;
    this.shootDelay = 0.15;
    this.accuracy = 0.85;

    // AI State
    this.state = 'idle';
    this.target = null;

    // 3D Mesh Container
    this.mesh = new THREE.Group();
    this.scene.add(this.mesh);

    // Animation
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;

    // Load Polyfork Model
    this.loadModel();

    // Attach Gun
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.7), gunMat);
    gun.position.set(0.35, 1.05, -0.35);
    this.mesh.add(gun);
  }

  async loadModel() {
    const gltf = await characterAssets.loadModel(this.modelKey);
    if (gltf && gltf.scene) {
      const model = gltf.scene;
      model.scale.set(1.05, 1.05, 1.05);
      this.mesh.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(model);
        this.actions = {};
        gltf.animations.forEach(clip => {
          this.actions[clip.name.toLowerCase()] = this.mixer.clipAction(clip);
        });

        const idle = this.actions['idle'] || Object.values(this.actions)[0];
        if (idle) {
          idle.play();
          this.currentAction = idle;
        }
      }
    } else {
      const fallback = this.createFallbackMesh(this.team === 'blue' ? 0x2563eb : 0xdc2626);
      this.mesh.add(fallback);
    }
  }

  createFallbackMesh(color) {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), bodyMat);
    torso.position.y = 1.0;
    torso.castShadow = true;
    group.add(torso);

    const headMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), headMat);
    head.position.y = 1.7;
    head.castShadow = true;
    group.add(head);

    const limbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.8, 0.26), limbMat);
    legL.position.set(-0.2, 0.4, 0);
    group.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.8, 0.26), limbMat);
    legR.position.set(0.2, 0.4, 0);
    group.add(legR);

    return group;
  }

  resetRound(spawnPosition, roundNum) {
    this.hp = this.maxHp;
    this.armor = this.armor;
    this.isDead = false;
    this.mesh.visible = true;
    this.position.copy(spawnPosition);
    this.yaw = this.team === 'blue' ? Math.PI : 0;
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.yaw;
    this.glooCount = 1;
    this.state = 'idle';
    this.target = null;

    if (roundNum === 1) {
      this.weapon = WEAPON_DEFS.desert_eagle;
      this.shootDelay = 0.4;
    } else if (this.role === 'shotgunner') {
      this.weapon = WEAPON_DEFS.m1887;
      this.shootDelay = 0.25;
    } else if (this.role === 'sniper') {
      this.weapon = WEAPON_DEFS.awm;
      this.shootDelay = 1.4;
    } else {
      this.weapon = WEAPON_DEFS.mp40;
      this.shootDelay = 0.1;
    }
  }

  takeDamage(amount, isHeadshot, attackerName) {
    if (this.isDead) return;

    sound.playHit();
    if (isHeadshot) sound.playHeadshot();

    this.hp -= amount;

    if (this.hp <= 70 && this.glooCount > 0) {
      this.glooCount--;
      const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      window.glooManager?.deploy(this.position, forward, this.team);
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      this.mesh.visible = false;
      window.game?.onBotEliminated(this, attackerName, isHeadshot);
    }
  }

  update(delta, player, allBots, colliders, glooMeshes, isBuyPhase) {
    if (this.isDead) return;

    if (isBuyPhase) {
      this.mesh.position.copy(this.position);
      if (this.mixer) this.mixer.update(delta);
      return;
    }

    // Target Selection
    const enemies = [];
    if (player && !player.isDead && player.team !== this.team) {
      enemies.push(player);
    }
    allBots.forEach(b => {
      if (!b.isDead && b.team !== this.team) {
        enemies.push(b);
      }
    });

    let closestEnemy = null;
    let closestDistSq = Infinity;
    enemies.forEach(e => {
      const dSq = this.position.distanceToSquared(e.position);
      if (dSq < closestDistSq) {
        closestDistSq = dSq;
        closestEnemy = e;
      }
    });
    this.target = closestEnemy;

    const moveDir = new THREE.Vector3();
    const speed = 7.5;

    if (this.target) {
      const dist = Math.sqrt(closestDistSq);
      const toTarget = this.target.position.clone().sub(this.position);
      this.yaw = Math.atan2(-toTarget.x, -toTarget.z);

      if (dist > 18) {
        moveDir.copy(toTarget).normalize();
      } else if (dist < 6) {
        moveDir.copy(toTarget).multiplyScalar(-1).normalize();
        moveDir.x += (Math.random() - 0.5) * 0.8;
      } else {
        moveDir.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).multiplyScalar(Math.sin(performance.now() * 0.003));
      }

      const now = performance.now() / 1000;
      if (now - this.lastShotTime > this.shootDelay) {
        this.lastShotTime = now;
        this.shootAtTarget(this.target, glooMeshes);
      }
    } else {
      const center = new THREE.Vector3(0, 1, 0);
      moveDir.copy(center.sub(this.position)).normalize();
    }

    const isMoving = moveDir.lengthSq() > 0;

    // Movement
    if (isMoving) {
      const proposedPos = this.position.clone().add(moveDir.clone().multiplyScalar(speed * delta));
      this.position.x = Math.max(-48, Math.min(48, proposedPos.x));
      this.position.z = Math.max(-48, Math.min(48, proposedPos.z));
    }

    // Animations
    if (this.mixer) {
      const nextAnim = isMoving ? 'run' : 'idle';
      const targetAction = this.actions[nextAnim] || this.actions['idle'] || Object.values(this.actions)[0];
      if (targetAction && this.currentAction !== targetAction) {
        if (this.currentAction) this.currentAction.fadeOut(0.2);
        targetAction.reset().fadeIn(0.2).play();
        this.currentAction = targetAction;
      }
      this.mixer.update(delta);
    }

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.yaw;
  }

  shootAtTarget(target, glooMeshes) {
    if (!target) return;
    sound.playGunshot(this.weapon.id);

    const muzzle = this.position.clone().add(new THREE.Vector3(0.3, 1.2, -0.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw));
    const aimSpread = (Math.random() - 0.5) * (1 - this.accuracy) * 0.8;
    const targetHead = target.position.clone().add(new THREE.Vector3(0, 1.6, 0));
    targetHead.x += aimSpread * 3;
    targetHead.z += aimSpread * 3;

    const dir = targetHead.clone().sub(muzzle).normalize();
    const raycaster = new THREE.Raycaster(muzzle, dir, 0, this.weapon.range);

    const hits = raycaster.intersectObjects(glooMeshes, false);
    let hitPoint = targetHead;

    if (hits.length > 0 && hits[0].distance < muzzle.distanceTo(targetHead)) {
      hitPoint = hits[0].point;
      if (hits[0].object.userData?.parentWall) {
        window.glooManager?.damageWall(hits[0].object.userData.parentWall, this.weapon.damage);
      }
    } else {
      const isHeadshot = Math.random() < 0.22;
      let dmg = this.weapon.damage;
      if (isHeadshot) dmg = Math.round(dmg * this.weapon.headshotMult);

      target.takeDamage(dmg, isHeadshot, this.name);
      if (target.isDead) {
        window.game?.showDamageNumber(target.position.clone().add(new THREE.Vector3(0, 1.8, 0)), dmg, isHeadshot);
      }
    }

    window.tracerManager?.addTracer(muzzle, hitPoint, false);
  }
}
