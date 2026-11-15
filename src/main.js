import './style.css';
import * as THREE from 'three';
import { TownArena } from './arena.js';
import { Player } from './player.js';
import { GameEngine } from './game.js';
import { GlooWallManager } from './gloowall.js';
import { TracerManager } from './weapons.js';
import { UIManager } from './ui.js';

class App {
  constructor() {
    this.canvas = document.getElementById('three-canvas');
    this.lastTime = performance.now();

    // 1. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // 2. Scene Atmosphere
    this.scene = new THREE.Scene();
    this.skyColor = new THREE.Color(0x93c5fd); // Vibrant summer sky
    this.skyFog = new THREE.FogExp2(0xbbe1fa, 0.009); // Gentle horizon haze

    this.scene.background = this.skyColor;
    this.scene.fog = this.skyFog;

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 350);

    // 3. Game Systems
    this.arena = new TownArena(this.scene);
    window.glooManager = new GlooWallManager(this.scene);
    window.tracerManager = new TracerManager(this.scene);

    this.player = new Player(this.scene, this.camera, this.canvas);
    window.player = this.player;

    this.game = new GameEngine(this.arena, this.player, this.camera);
    window.game = this.game;

    this.ui = new UIManager();
    window.ui = this.ui;

    // 4. Window Resize
    window.addEventListener('resize', () => this.onWindowResize());

    // 5. Start Loop
    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate(now = performance.now()) {
    requestAnimationFrame((t) => this.animate(t));

    const delta = Math.min((now - this.lastTime) * 0.001, 0.1);
    this.lastTime = now;

    if (this.ui.currentScreen === 'screen-game') {
      this.game.update(delta);
      this.ui.updateHUD(this.player);
    } else {
      // Menu / Lobby Showcase Camera
      const time = performance.now() * 0.00035;
      this.camera.position.x = Math.sin(time) * 16;
      this.camera.position.z = Math.cos(time) * 16;
      this.camera.position.y = 5.5;
      this.camera.lookAt(0, 2.5, 0);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
