import * as THREE from 'three';
import { sound } from './audio.js';
import { WEAPON_DEFS, createGunMesh } from './weapons.js';
import { characterAssets } from './characterLoader.js';

export class Player {
  constructor(scene, camera, domElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    // Stats & Hero
    this.hero = 'mani';
    this.maxHp = 200;
    this.hp = 200;
    this.maxArmor = 100;
    this.armor = 100;
    this.coins = 500;
    this.glooCount = 2;
    this.medCount = 1;
    this.team = 'blue';
    this.isDead = false;

    // Movement & Physics
    this.position = new THREE.Vector3(0, 0, 35);
    this.velocity = new THREE.Vector3();
    this.moveSpeed = 10.5;
    this.sprintMult = 1.45;
    this.jumpForce = 8.5;
    this.isGrounded = false;
    this.isCrouched = false;
    this.isScoped = false;

    // Camera rotation
    this.pitch = 0;
    this.yaw = Math.PI; // Face North
    this.sensitivity = 0.0022;

    // Weapons
    this.weapons = {
      desert_eagle: { ...WEAPON_DEFS.desert_eagle, clip: WEAPON_DEFS.desert_eagle.magSize, reserve: WEAPON_DEFS.desert_eagle.reserveAmmo },
      m1887: null,
      mp40: null,
      ak47: null,
      awm: null
    };
    this.currentWeaponKey = 'desert_eagle';
    this.lastShotTime = 0;
    this.isReloading = false;

    // Input state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false,
      crouch: false,
      fire: false
    };

    // 3D Player Root
    this.mesh = new THREE.Group();
    this.scene.add(this.mesh);

    // Gun Holder
    this.gunHolder = new THREE.Group();
    this.gunHolder.position.set(0.32, 1.15, -0.28);
    this.mesh.add(this.gunHolder);
    this.updateGunMesh();

    // Animations
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.characterModel = null;

    // Appearance customization (matching Cheyyar 3D Screenshot 2)
    this.customSkinTone = '#8a5a3a';
    this.customOutfitColor = '#263238';
    this.customPantColor = '#212121';
    this.customShoeColor = '#111111';
    this.customHairColor = '#100a06';
    this.gender = 'male';
    this.title = 'CHEYYAR THALA';
    this.walkCycle = 0;
    this.bones = {};

    this.loadHeroModel('male');

    this.setupListeners();
  }

  async loadHeroModel(modelKey = 'male') {
    if (this.characterModel) {
      this.mesh.remove(this.characterModel);
      this.characterModel = null;
    }

    const gltf = await characterAssets.loadModel(modelKey);
    if (gltf && gltf.scene) {
      this.characterModel = gltf.scene;
      this.characterModel.position.set(0, 0, 0);
      this.mesh.add(this.characterModel);

      // Extract Mixamo bones for procedural walking and idle stance
      this.bones = {};
      this.characterModel.traverse(node => {
        if (node.isBone) {
          const n = node.name || '';
          if (/LeftUpLeg$/i.test(n)) this.bones.lUp = node;
          if (/RightUpLeg$/i.test(n)) this.bones.rUp = node;
          if (/LeftLeg$/i.test(n)) this.bones.lLeg = node;
          if (/RightLeg$/i.test(n)) this.bones.rLeg = node;
          if (/LeftArm$/i.test(n)) this.bones.lArm = node;
          if (/RightArm$/i.test(n)) this.bones.rArm = node;
          if (/LeftForeArm$/i.test(n)) this.bones.lFore = node;
          if (/RightForeArm$/i.test(n)) this.bones.rFore = node;
          if (/Spine$/i.test(n)) this.bones.spine = node;
          if (/Hips$/i.test(n)) this.bones.hips = node;
        }
      });

      // Pose arms down from T-pose to natural relaxed stance
      if (this.bones.lArm) {
        this.bones.lArm.rotation.z = 1.45;
        this.bones.lArm.rotation.x = 0.08;
      }
      if (this.bones.rArm) {
        this.bones.rArm.rotation.z = -1.45;
        this.bones.rArm.rotation.x = 0.08;
      }
      if (this.bones.lFore) this.bones.lFore.rotation.x = 0.12;
      if (this.bones.rFore) this.bones.rFore.rotation.x = 0.12;

      this.applyMaterialCustomizations();
    }
  }

  setSkinTone(hex) {
    this.customSkinTone = hex;
    this.applyMaterialCustomizations();
  }

  setOutfitColor(hex) {
    this.customOutfitColor = hex;
    this.applyMaterialCustomizations();
  }

  setPantsColor(hex) {
    this.customPantColor = hex;
    this.applyMaterialCustomizations();
  }

  setShoeColor(hex) {
    this.customShoeColor = hex;
    this.applyMaterialCustomizations();
  }

  setHairColor(hex) {
    this.customHairColor = hex;
    this.applyMaterialCustomizations();
  }

  applyMaterialCustomizations() {
    if (!this.characterModel) return;

    this.characterModel.traverse(node => {
      if (node.isMesh && node.material) {
        const nm = node.name.toLowerCase();

        // 1. Skin
        if (nm.includes('body') || nm.includes('skin')) {
          if (this.customSkinTone) node.material.color.set(this.customSkinTone);
        }
        // 2. Hoodie / Top
        else if (nm.includes('hoodie') || nm.includes('top') || nm.includes('cloth') || nm.includes('coat')) {
          if (this.customOutfitColor) node.material.color.set(this.customOutfitColor);
        }
        // 3. Pants / Bottom
        else if (nm.includes('pant') || nm.includes('bottom')) {
          if (this.customPantColor) node.material.color.set(this.customPantColor);
        }
        // 4. Sneakers / Shoes
        else if (nm.includes('sneaker') || nm.includes('shoe')) {
          if (this.customShoeColor) node.material.color.set(this.customShoeColor);
        }
        // 5. Hair & Beard
        else if (nm.includes('hair') || nm.includes('beard')) {
          if (this.customHairColor) node.material.color.set(this.customHairColor);
        }
      }
    });
  }

  updateGunMesh() {
    while (this.gunHolder.children.length > 0) {
      this.gunHolder.remove(this.gunHolder.children[0]);
    }
    const gun = createGunMesh(this.currentWeaponKey);
    this.gunHolder.add(gun);
    this.gunMesh = gun;
  }

  applyHero(heroKey) {
    this.hero = heroKey;
    this.loadHeroModel(heroKey);

    if (heroKey === 'mani') {
      this.maxHp = 230;
      this.hp = 230;
    } else if (heroKey === 'karthi') {
      this.moveSpeed = 13.0;
    } else if (heroKey === 'bala') {
      this.glooCount = 3;
    }
  }

  setupListeners() {
    window.addEventListener('keydown', e => this.onKeyDown(e));
    window.addEventListener('keyup', e => this.onKeyUp(e));

    this.domElement.addEventListener('click', () => {
      if (document.getElementById('screen-game').classList.contains('active')) {
        this.domElement.requestPointerLock();
      }
    });

    document.addEventListener('mousemove', e => {
      if (document.pointerLockElement === this.domElement) {
        this.yaw -= e.movementX * this.sensitivity;
        this.pitch -= e.movementY * this.sensitivity;
        this.pitch = Math.max(-Math.PI / 2.4, Math.min(Math.PI / 2.4, this.pitch));
      }
    });

    this.domElement.addEventListener('mousedown', e => {
      if (document.pointerLockElement !== this.domElement) return;
      if (e.button === 0) {
        this.keys.fire = true;
      } else if (e.button === 2) {
        this.toggleScope();
      }
    });

    this.domElement.addEventListener('mouseup', e => {
      if (e.button === 0) this.keys.fire = false;
    });

    window.addEventListener('contextmenu', e => {
      if (document.getElementById('screen-game').classList.contains('active')) {
        e.preventDefault();
      }
    });
  }

  onKeyDown(e) {
    switch (e.code) {
      case 'KeyW': this.keys.forward = true; break;
      case 'KeyS': this.keys.backward = true; break;
      case 'KeyA': this.keys.left = true; break;
      case 'KeyD': this.keys.right = true; break;
      case 'ShiftLeft': this.keys.sprint = true; break;
      case 'Space': this.keys.jump = true; break;
      case 'KeyC': this.isCrouched = !this.isCrouched; break;
      case 'KeyR': this.reload(); break;
      case 'KeyE': case 'KeyG': this.triggerGloo(); break;
      case 'KeyM': case 'Digit4': this.useMedkit(); break;
      case 'Digit1': this.switchWeaponSlot('primary'); break;
      case 'Digit2': this.switchWeaponSlot('secondary'); break;
      case 'Digit3': this.switchWeaponSlot('pistol'); break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': this.keys.forward = false; break;
      case 'KeyS': this.keys.backward = false; break;
      case 'KeyA': this.keys.left = false; break;
      case 'KeyD': this.keys.right = false; break;
      case 'ShiftLeft': this.keys.sprint = false; break;
      case 'Space': this.keys.jump = false; break;
    }
  }

  toggleScope() {
    const curWep = this.getCurrentWeapon();
    if (curWep.hasScope) {
      this.isScoped = !this.isScoped;
      const scopeElem = document.getElementById('scope-overlay');
      if (scopeElem) {
        if (this.isScoped) scopeElem.classList.add('active');
        else scopeElem.classList.remove('active');
      }
    }
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeaponKey] || this.weapons.desert_eagle;
  }

  switchWeaponSlot(slot) {
    if (slot === 'pistol') {
      this.currentWeaponKey = 'desert_eagle';
    } else {
      const priority = ['awm', 'ak47', 'm1887', 'mp40', 'desert_eagle'];
      for (const k of priority) {
        if (this.weapons[k]) {
          this.currentWeaponKey = k;
          break;
        }
      }
    }
    this.updateGunMesh();
    this.isScoped = false;
    document.getElementById('scope-overlay')?.classList.remove('active');
  }

  reload() {
    const wep = this.getCurrentWeapon();
    if (!wep || this.isReloading || wep.clip === wep.magSize || wep.reserve <= 0) return;
    this.isReloading = true;
    sound.playReload();
    setTimeout(() => {
      const needed = wep.magSize - wep.clip;
      const amount = Math.min(needed, wep.reserve);
      wep.clip += amount;
      wep.reserve -= amount;
      this.isReloading = false;
    }, wep.reloadTime * 1000);
  }

  useMedkit() {
    if (this.medCount <= 0 || this.hp >= this.maxHp) return;
    this.medCount--;
    sound.playMedkit();
    this.hp = Math.min(this.maxHp, this.hp + 75);
  }

  triggerGloo() {
    if (this.glooCount <= 0 || this.isDead) return;
    this.glooCount--;
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    window.glooManager?.deploy(this.position, forward, this.team);
  }

  takeDamage(amount, isHeadshot = false) {
    if (this.isDead) return;

    sound.playHit();
    if (isHeadshot) sound.playHeadshot();

    let remaining = amount;
    if (this.armor > 0) {
      const absorb = Math.min(this.armor, remaining * 0.5);
      this.armor -= absorb;
      remaining -= absorb;
    }

    this.hp -= remaining;

    const reticle = document.getElementById('hit-marker');
    if (reticle) {
      reticle.classList.add('show');
      setTimeout(() => reticle.classList.remove('show'), 120);
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      this.mesh.visible = false;
      window.game?.onPlayerEliminated();
    }
  }

  resetRound(spawnPosition) {
    this.hp = this.maxHp;
    this.armor = this.maxArmor;
    this.isDead = false;
    this.mesh.visible = true;
    this.position.copy(spawnPosition);
    this.velocity.set(0, 0, 0);
    this.isReloading = false;
    this.isScoped = false;
    document.getElementById('scope-overlay')?.classList.remove('active');

    Object.values(this.weapons).forEach(w => {
      if (w) w.clip = w.magSize;
    });

    if (this.hero === 'bala') {
      this.glooCount = Math.max(this.glooCount, 3);
    } else {
      this.glooCount = Math.max(this.glooCount, 2);
    }
    this.medCount = Math.max(this.medCount, 1);
  }

  update(delta, colliders, glooMeshes, bots) {
    if (this.isDead) return;

    // Movement Direction
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const moveDir = new THREE.Vector3();
    if (this.keys.forward) moveDir.add(forward);
    if (this.keys.backward) moveDir.sub(forward);
    if (this.keys.right) moveDir.add(right);
    if (this.keys.left) moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0;

    if (isMoving) {
      moveDir.normalize();
      let currentSpeed = this.moveSpeed;
      if (this.keys.sprint && this.keys.forward) currentSpeed *= this.sprintMult;
      if (this.isCrouched) currentSpeed *= 0.55;
      if (this.isScoped) currentSpeed *= 0.35;

      this.velocity.x = moveDir.x * currentSpeed;
      this.velocity.z = moveDir.z * currentSpeed;
    } else {
      this.velocity.x *= 0.6;
      this.velocity.z *= 0.6;
    }

    // Animation transition: Idle vs Run
    if (this.mixer) {
      const nextActionName = isMoving ? (this.keys.sprint ? 'run' : 'walk') : 'idle';
      const targetAction = this.actions[nextActionName] || this.actions['idle'] || Object.values(this.actions)[0];
      if (targetAction && this.currentAction !== targetAction) {
        if (this.currentAction) this.currentAction.fadeOut(0.15);
        targetAction.reset().fadeIn(0.15).play();
        this.currentAction = targetAction;
      }
      this.mixer.update(delta);
    }

    // Procedural Mixamo bone animation (walk, sprint, idle breathing)
    if (this.bones && this.bones.lUp) {
      if (isMoving) {
        this.walkCycle = (this.walkCycle || 0) + delta * (this.keys.sprint ? 14 : 9);
        const legSwing = Math.sin(this.walkCycle) * 0.55;
        this.bones.lUp.rotation.x = legSwing;
        this.bones.rUp.rotation.x = -legSwing;
        if (this.bones.lLeg) this.bones.lLeg.rotation.x = Math.max(0, -legSwing * 1.1);
        if (this.bones.rLeg) this.bones.rLeg.rotation.x = Math.max(0, legSwing * 1.1);

        // Arms swing naturally with movement
        if (this.bones.lArm) this.bones.lArm.rotation.x = -legSwing * 0.4 + 0.08;
        if (this.bones.rArm) this.bones.rArm.rotation.x = legSwing * 0.4 + 0.08;
      } else {
        // Return smoothly to idle stance
        this.bones.lUp.rotation.x *= 0.85;
        this.bones.rUp.rotation.x *= 0.85;
        if (this.bones.lLeg) this.bones.lLeg.rotation.x *= 0.85;
        if (this.bones.rLeg) this.bones.rLeg.rotation.x *= 0.85;

        // Subtle breathing
        const breathe = Math.sin(performance.now() * 0.002) * 0.03;
        if (this.bones.spine) this.bones.spine.rotation.x = breathe;
        if (this.bones.lArm) this.bones.lArm.rotation.x = 0.08 + breathe * 0.5;
        if (this.bones.rArm) this.bones.rArm.rotation.x = 0.08 + breathe * 0.5;
      }
    }

    // Jump & Gravity
    if (this.keys.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    this.velocity.y -= 22 * delta;

    // Proposed Position
    const proposedPos = this.position.clone().add(this.velocity.clone().multiplyScalar(delta));

    if (proposedPos.y <= 0) {
      proposedPos.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // Collision Detection
    const playerBox = new THREE.Box3(
      new THREE.Vector3(proposedPos.x - 0.45, proposedPos.y, proposedPos.z - 0.45),
      new THREE.Vector3(proposedPos.x + 0.45, proposedPos.y + 1.8, proposedPos.z + 0.45)
    );

    let collided = false;
    for (const box of colliders) {
      if (playerBox.intersectsBox(box)) {
        collided = true;
        break;
      }
    }

    if (!collided) {
      this.position.copy(proposedPos);
    } else {
      // Slide X
      const posX = this.position.clone();
      posX.x = proposedPos.x;
      playerBox.set(
        new THREE.Vector3(posX.x - 0.45, posX.y, posX.z - 0.45),
        new THREE.Vector3(posX.x + 0.45, posX.y + 1.8, posX.z + 0.45)
      );
      let colX = false;
      for (const box of colliders) {
        if (playerBox.intersectsBox(box)) { colX = true; break; }
      }
      if (!colX) this.position.x = posX.x;

      // Slide Z
      const posZ = this.position.clone();
      posZ.z = proposedPos.z;
      playerBox.set(
        new THREE.Vector3(posZ.x - 0.45, posZ.y, posZ.z - 0.45),
        new THREE.Vector3(posZ.x + 0.45, posZ.y + 1.8, posZ.z + 0.45)
      );
      let colZ = false;
      for (const box of colliders) {
        if (playerBox.intersectsBox(box)) { colZ = true; break; }
      }
      if (!colZ) this.position.z = posZ.z;

      this.position.y = proposedPos.y;
    }

    // Sync Mesh Position and Rotation
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.yaw;

    // Gun tilt with pitch
    if (this.gunHolder) {
      this.gunHolder.rotation.x = this.pitch;
    }

    // FREE FIRE THIRD-PERSON OVER-THE-SHOULDER CAMERA
    const camOffset = new THREE.Vector3(
      this.isScoped ? 0.28 : 0.68,
      this.isCrouched ? 1.3 : 1.78,
      this.isScoped ? 0.95 : 2.75
    );
    camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const targetCamPos = this.position.clone().add(camOffset);
    this.camera.position.lerp(targetCamPos, 0.45);

    // Aim Look Target
    const aimDir = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();
    const lookTarget = this.camera.position.clone().add(aimDir.clone().multiplyScalar(50));
    this.camera.lookAt(lookTarget);

    // Fire Weapon
    if (this.keys.fire) {
      this.fireWeapon(aimDir, glooMeshes, bots);
    }
  }

  fireWeapon(aimDir, glooMeshes, bots) {
    const wep = this.getCurrentWeapon();
    const now = performance.now() / 1000;

    if (now - this.lastShotTime < wep.fireRate || this.isReloading) return;
    if (wep.clip <= 0) {
      this.reload();
      return;
    }

    wep.clip--;
    this.lastShotTime = now;
    sound.playGunshot(wep.id);

    // Muzzle Flash
    if (this.gunMesh && this.gunMesh.userData.flash) {
      const flash = this.gunMesh.userData.flash;
      flash.intensity = 8;
      setTimeout(() => { if (flash) flash.intensity = 0; }, 50);
    }

    // Recoil
    this.pitch += wep.recoil * (0.8 + Math.random() * 0.4);

    const raycaster = new THREE.Raycaster();
    const muzzlePos = this.position.clone().add(
      new THREE.Vector3(0.32, 1.25, -0.9).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw)
    );

    for (let p = 0; p < wep.pellets; p++) {
      const spreadX = (Math.random() - 0.5) * wep.spread;
      const spreadY = (Math.random() - 0.5) * wep.spread;
      const shotDir = aimDir.clone();
      shotDir.x += spreadX;
      shotDir.y += spreadY;
      shotDir.normalize();

      raycaster.set(this.camera.position, shotDir);

      const hitCandidates = [...glooMeshes];
      bots.forEach(b => {
        if (!b.isDead && b.team !== this.team) {
          b.mesh.traverse(child => {
            if (child.isMesh) {
              child.userData = { parentBot: b };
              hitCandidates.push(child);
            }
          });
        }
      });

      const intersects = raycaster.intersectObjects(hitCandidates, false);
      let hitPos = this.camera.position.clone().add(shotDir.clone().multiplyScalar(wep.range));

      if (intersects.length > 0) {
        const hit = intersects[0];
        hitPos = hit.point;

        if (hit.object.userData?.parentWall) {
          window.glooManager?.damageWall(hit.object.userData.parentWall, wep.damage);
        } else if (hit.object.userData?.parentBot) {
          const bot = hit.object.userData.parentBot;
          const isHeadshot = hit.point.y > (bot.position.y + 1.45);
          let dmg = wep.damage;
          if (isHeadshot) {
            dmg = Math.round(dmg * wep.headshotMult);
            if (this.hero === 'priya') dmg = Math.round(dmg * 1.25);
          }

          bot.takeDamage(dmg, isHeadshot, 'Thunder_Gully');
          window.game?.showDamageNumber(hit.point, dmg, isHeadshot);
        }
      }

      window.tracerManager?.addTracer(muzzlePos, hitPos);
    }
  }
}
