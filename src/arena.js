import * as THREE from 'three';

// Helper to generate crisp canvas textures for street signage
function makeSignboardTexture(tamilText, englishText, bgColor = '#d97706', textColor = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  // Text
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';

  ctx.font = 'bold 36px "Segoe UI", sans-serif';
  ctx.fillText(tamilText, canvas.width / 2, 52);

  ctx.font = '800 30px "Rajdhani", sans-serif';
  ctx.fillText(englishText, canvas.width / 2, 98);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

export class TownArena {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.spawnBarriers = [];
    this.zoneRadius = 55;

    this.buildMap();
  }

  buildMap() {
    // 1. Sky & Sun Atmosphere
    this.setupLighting();

    // 2. Ground Terrain (Asphalt roads, sidewalks, lush grass)
    this.createGroundAndRoads();

    // 3. Central Roundabout & Clock Tower
    this.createClockTower(0, 0);

    // 4. Selvam Tea Stall (West Side)
    this.createTeaStall(-18, 0);

    // 5. Town Bus Stand (East Side)
    this.createBusStand(18, 0);

    // 6. Detailed Town Buildings with Shops, Windows, and Terraces
    this.createTownBuilding(-24, 22, '#1e3a8a', 'அம்பாள் ஸ்டோர்ஸ்', 'AMBAL GENERAL STORES');
    this.createTownBuilding(24, 22, '#065f46', 'நம்ம ஊர் மெடிக்கல்ஸ்', 'NAMMA OORU MEDICALS');
    this.createTownBuilding(-24, -22, '#991b1b', 'அன்னை பேக்கரி', 'ANNAI BAKERY & SWEETS');
    this.createTownBuilding(24, -22, '#854d0e', 'ஸ்ரீ முருகன் ஏஜென்சிஸ்', 'MURUGAN AGENCIES');

    // 7. Tactical Covers: Compound Walls, Crates, Auto-Rickshaws, Palm Trees
    this.createStreetProps();

    // 8. Perimeter Boundary Walls
    this.createPerimeterWalls();

    // 9. Spawn Barriers (Yellow forcefields)
    this.createSpawnBarriers();

    // 10. Safe Zone Cylinder
    this.createSafeZone();
  }

  setupLighting() {
    // Warm hemisphere ambient light for realistic outdoor fill
    const hemi = new THREE.HemisphereLight(0xbbe5ff, 0x475569, 1.1);
    this.scene.add(hemi);

    // Warm Sun Light
    const sun = new THREE.DirectionalLight(0xfff6dd, 1.8);
    sun.position.set(35, 55, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 140;
    const d = 55;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);
  }

  createGroundAndRoads() {
    // Main Grass Field
    const grassGeo = new THREE.PlaneGeometry(120, 120);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.9 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    this.scene.add(grass);

    // North-South Main Road
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e242d, roughness: 0.85 });
    const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(14, 110), roadMat);
    roadNS.rotation.x = -Math.PI / 2;
    roadNS.position.set(0, 0.02, 0);
    roadNS.receiveShadow = true;
    this.scene.add(roadNS);

    // East-West Cross Road
    const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(110, 14), roadMat);
    roadEW.rotation.x = -Math.PI / 2;
    roadEW.position.set(0, 0.02, 0);
    roadEW.receiveShadow = true;
    this.scene.add(roadEW);

    // Raised Concrete Sidewalks (Curbs)
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const sidewalks = [
      { x: -11, z: 0, w: 4, d: 110 },
      { x: 11, z: 0, w: 4, d: 110 },
      { x: 0, z: -11, w: 110, d: 4 },
      { x: 0, z: 11, w: 110, d: 4 }
    ];
    sidewalks.forEach(sw => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sw.w, 0.22, sw.d), curbMat);
      mesh.position.set(sw.x, 0.11, sw.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    });

    // White dashed road markings
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let z = -45; z <= 45; z += 6) {
      if (Math.abs(z) < 12) continue; // skip center roundabout
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 3.2), markMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.04, z);
      this.scene.add(dash);
    }
  }

  createClockTower(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Circular landscaped roundabout
    const roundBase = new THREE.Mesh(
      new THREE.CylinderGeometry(7.5, 8.2, 0.8, 32),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.75 })
    );
    roundBase.position.y = 0.4;
    roundBase.receiveShadow = true;
    group.add(roundBase);
    this.addCollider(roundBase, x, 0.4, z, 8, 0.8, 8);

    // Inner flowerbed
    const garden = new THREE.Mesh(
      new THREE.CylinderGeometry(6.6, 6.6, 0.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 })
    );
    garden.position.y = 0.85;
    group.add(garden);

    // Stone Tower Shaft
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 15, 3.6),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 })
    );
    tower.position.y = 7.5;
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);
    this.addCollider(tower, x, 7.5, z, 3.6, 15, 3.6);

    // Clock Face Chamber
    const clockHead = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 4.0, 4.6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
    );
    clockHead.position.y = 16.5;
    clockHead.castShadow = true;
    group.add(clockHead);

    // Clock Dials with Black Hands
    const dialMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [
      { pos: [0, 16.5, 2.32], rot: [0, 0, 0] },
      { pos: [0, 16.5, -2.32], rot: [0, Math.PI, 0] },
      { pos: [2.32, 16.5, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [-2.32, 16.5, 0], rot: [0, -Math.PI / 2, 0] }
    ].forEach(d => {
      const dial = new THREE.Mesh(new THREE.CircleGeometry(1.35, 24), dialMat);
      dial.position.set(...d.pos);
      dial.rotation.set(...d.rot);
      group.add(dial);
    });

    // Temple/Monument Pyramid Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.4, 4.5, 4),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.3 })
    );
    roof.position.y = 20.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    this.scene.add(group);
  }

  createTeaStall(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Shop Room
    const shopMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
    const shop = new THREE.Mesh(new THREE.BoxGeometry(9, 4.8, 6.5), shopMat);
    shop.position.y = 2.4;
    shop.castShadow = true;
    shop.receiveShadow = true;
    group.add(shop);
    this.addCollider(shop, x, 2.4, z, 9, 4.8, 6.5);

    // Signboard: Selvam Tea Stall
    const signTex = makeSignboardTexture('செல்வம் டீ ஸ்டால்', 'SELVAM TEA STALL', '#ea580c');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 2.0),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    sign.position.set(0, 5.2, 3.3);
    group.add(sign);

    // Slanted Tin Awning
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.2, 4.5),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.3 })
    );
    awning.position.set(0, 4.3, 3.2);
    awning.rotation.x = 0.25;
    awning.castShadow = true;
    group.add(awning);

    // Front Wooden Counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(6, 1.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    counter.position.set(0, 0.6, 3.8);
    counter.castShadow = true;
    group.add(counter);
    this.addCollider(counter, x, 0.6, z + 3.8, 6, 1.2, 1.2);

    // Stainless Steel Tea Boiler
    const boiler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.9, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 })
    );
    boiler.position.set(2.0, 1.55, 3.8);
    group.add(boiler);

    // Wooden Bench
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.6, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xb45309 })
    );
    bench.position.set(-2, 0.3, 5.2);
    group.add(bench);
    this.addCollider(bench, x - 2, 0.3, z + 5.2, 4.2, 0.6, 0.9);

    this.scene.add(group);
  }

  createBusStand(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Back Glass/Steel Shelter Wall
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(11, 3.8, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 })
    );
    back.position.y = 1.9;
    back.castShadow = true;
    group.add(back);
    this.addCollider(back, x, 1.9, z, 11, 3.8, 0.4);

    // Signboard: Town Bus Stand
    const signTex = makeSignboardTexture('டவுன் பஸ் ஸ்டாண்ட்', 'TOWN BUS TERMINAL', '#0284c7');
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 1.6),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    sign.position.set(0, 3.9, 0.2);
    group.add(sign);

    // Curved Modern Roof
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.25, 4.8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    roof.position.set(0, 4.2, 2.0);
    roof.castShadow = true;
    group.add(roof);

    // Pillars
    [-4.8, 4.8].forEach(px => {
      const pil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 4.0),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
      );
      pil.position.set(px, 2.0, 3.8);
      group.add(pil);
    });

    // Passenger Waiting Bench
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 0.5, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    bench.position.set(0, 0.35, 1.4);
    group.add(bench);
    this.addCollider(bench, x, 0.35, z + 1.4, 6.5, 0.5, 0.8);

    this.scene.add(group);
  }

  createTownBuilding(x, z, wallColor, tamilName, engName) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // 1st Floor (Shop Front)
    const floor1 = new THREE.Mesh(
      new THREE.BoxGeometry(13, 5.2, 13),
      new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.75 })
    );
    floor1.position.y = 2.6;
    floor1.castShadow = true;
    floor1.receiveShadow = true;
    group.add(floor1);
    this.addCollider(floor1, x, 2.6, z, 13, 5.2, 13);

    // Shop Signboard
    const signTex = makeSignboardTexture(tamilName, engName, wallColor);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 2.0),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    sign.position.set(0, 4.2, 6.55);
    group.add(sign);

    // Roll-up Shop Shutters (Metal ribbed look)
    const shutterMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.4 });
    const shutter = new THREE.Mesh(new THREE.BoxGeometry(7, 3.2, 0.2), shutterMat);
    shutter.position.set(0, 1.6, 6.52);
    group.add(shutter);

    // 2nd Floor (Slightly smaller, creating sniper terrace)
    const floor2 = new THREE.Mesh(
      new THREE.BoxGeometry(9, 4.2, 9),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
    );
    floor2.position.set(-1.5, 7.3, -1.5);
    floor2.castShadow = true;
    group.add(floor2);
    this.addCollider(floor2, x - 1.5, 7.3, z - 1.5, 9, 4.2, 9);

    // Windows with blue reflective glass
    const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.8 });
    [-2, 2].forEach(wx => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.1), winMat);
      win.position.set(wx, 7.3, 3.05);
      group.add(win);
    });

    // Terrace Railing (Tactical cover on roof)
    const railMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(12.8, 1.1, 0.3), railMat);
    rail.position.set(0, 5.75, 6.35);
    group.add(rail);
    this.addCollider(rail, x, 5.75, z + 6.35, 12.8, 1.1, 0.3);

    // Rooftop Sintex Water Tank (Iconic town feature!)
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 1.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 })
    );
    tank.position.set(-2, 10.2, -2);
    tank.castShadow = true;
    group.add(tank);

    // Outdoor Staircase / Ramp to Terrace
    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.4, 7.5),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    ramp.position.set(7.4, 2.7, 0);
    ramp.rotation.x = 0.58;
    group.add(ramp);
    this.addCollider(ramp, x + 7.4, 2.7, z, 2.8, 4.5, 7.5);

    this.scene.add(group);
  }

  createStreetProps() {
    // 1. Bajaj Auto-Rickshaws
    this.createAutoRickshaw(-10, 8);
    this.createAutoRickshaw(10, -8);

    // 2. Low-Poly Palm Trees
    this.createPalmTree(-32, 8);
    this.createPalmTree(32, -8);
    this.createPalmTree(-32, -32);
    this.createPalmTree(32, 32);

    // 3. Concrete Compound Walls for Tactical Cover
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.85 });
    const walls = [
      { x: -9, z: 18, w: 9, h: 1.4, d: 0.5 },
      { x: 9, z: 18, w: 9, h: 1.4, d: 0.5 },
      { x: -9, z: -18, w: 9, h: 1.4, d: 0.5 },
      { x: 9, z: -18, w: 9, h: 1.4, d: 0.5 }
    ];
    walls.forEach(w => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), wallMat);
      mesh.position.set(w.x, w.h / 2, w.z);
      mesh.castShadow = true;
      this.scene.add(mesh);
      this.addCollider(mesh, w.x, w.h / 2, w.z, w.w, w.h, w.d);
    });

    // 4. Wooden Crates
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75 });
    const crates = [
      { x: -5, z: 9 }, { x: -4, z: 10 },
      { x: 5, z: -9 }, { x: 4, z: -10 }
    ];
    crates.forEach(c => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), crateMat);
      mesh.position.set(c.x, 0.8, c.z);
      mesh.castShadow = true;
      this.scene.add(mesh);
      this.addCollider(mesh, c.x, 0.8, c.z, 1.6, 1.6, 1.6);
    });
  }

  createAutoRickshaw(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Yellow & Black Body
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.2 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 });

    // Lower Frame
    const lower = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.9, 3.2), yellowMat);
    lower.position.y = 0.75;
    lower.castShadow = true;
    group.add(lower);

    // Black Hood Top
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 3.0), blackMat);
    roof.position.y = 2.1;
    group.add(roof);

    // Headlight
    const light = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    light.position.set(0, 0.9, 1.62);
    group.add(light);

    // 3 Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
    // Front wheel
    const wFront = new THREE.Mesh(wheelGeo, wheelMat);
    wFront.rotation.z = Math.PI / 2;
    wFront.position.set(0, 0.35, 1.2);
    group.add(wFront);
    // Rear wheels
    [-0.95, 0.95].forEach(wx => {
      const wRear = new THREE.Mesh(wheelGeo, wheelMat);
      wRear.rotation.z = Math.PI / 2;
      wRear.position.set(wx, 0.35, -0.9);
      group.add(wRear);
    });

    this.scene.add(group);
    this.addCollider(group, x, 1.1, z, 2.2, 2.2, 3.4);
  }

  createPalmTree(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Slanted Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.45, 9, 8),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
    );
    trunk.position.set(0.4, 4.5, 0);
    trunk.rotation.z = -0.08;
    trunk.castShadow = true;
    group.add(trunk);

    // Palm Leaves Fronds
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, side: THREE.DoubleSide });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 4.2), leafMat);
      leaf.position.set(0.4 + Math.cos(angle) * 1.5, 8.8, Math.sin(angle) * 1.5);
      leaf.rotation.x = 0.8;
      leaf.rotation.y = angle;
      leaf.castShadow = true;
      group.add(leaf);
    }

    this.scene.add(group);
    this.addCollider(group, x, 4.5, z, 1.2, 9, 1.2);
  }

  createPerimeterWalls() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const size = 110;
    const height = 8;
    const thick = 2;

    const walls = [
      { x: 0, z: size / 2, w: size, h: height, d: thick },
      { x: 0, z: -size / 2, w: size, h: height, d: thick },
      { x: size / 2, z: 0, w: thick, h: height, d: size },
      { x: -size / 2, z: 0, w: thick, h: height, d: size }
    ];

    walls.forEach(w => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), mat);
      mesh.position.set(w.x, w.h / 2, w.z);
      this.scene.add(mesh);
      this.addCollider(mesh, w.x, w.h / 2, w.z, w.w, w.h, w.d);
    });
  }

  createSpawnBarriers() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });

    const bNorth = new THREE.Mesh(new THREE.BoxGeometry(50, 6, 0.5), mat);
    bNorth.position.set(0, 3, 26);
    this.scene.add(bNorth);
    this.spawnBarriers.push({ mesh: bNorth, collider: this.addCollider(bNorth, 0, 3, 26, 50, 6, 0.5) });

    const bSouth = new THREE.Mesh(new THREE.BoxGeometry(50, 6, 0.5), mat);
    bSouth.position.set(0, 3, -26);
    this.scene.add(bSouth);
    this.spawnBarriers.push({ mesh: bSouth, collider: this.addCollider(bSouth, 0, 3, -26, 50, 6, 0.5) });
  }

  lowerSpawnBarriers() {
    this.spawnBarriers.forEach(sb => {
      this.scene.remove(sb.mesh);
      const idx = this.colliders.indexOf(sb.collider);
      if (idx !== -1) this.colliders.splice(idx, 1);
    });
    this.spawnBarriers = [];
  }

  raiseSpawnBarriers() {
    if (this.spawnBarriers.length === 0) {
      this.createSpawnBarriers();
    }
  }

  createSafeZone() {
    const geo = new THREE.CylinderGeometry(this.zoneRadius, this.zoneRadius, 30, 48, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.zoneMesh = new THREE.Mesh(geo, mat);
    this.zoneMesh.position.set(0, 15, 0);
    this.scene.add(this.zoneMesh);
  }

  updateSafeZone(radius) {
    this.zoneRadius = Math.max(8, radius);
    if (this.zoneMesh) {
      this.zoneMesh.scale.set(this.zoneRadius / 55, 1, this.zoneRadius / 55);
    }
  }

  addCollider(mesh, x, y, z, sx, sy, sz) {
    const box = new THREE.Box3(
      new THREE.Vector3(x - sx / 2, y - sy / 2, z - sz / 2),
      new THREE.Vector3(x + sx / 2, y + sy / 2, z + sz / 2)
    );
    this.colliders.push(box);
    return box;
  }
}
