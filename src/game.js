import * as THREE from 'three';
import { sound } from './audio.js';
import { Bot } from './bots.js';

export class GameEngine {
  constructor(arena, player, camera) {
    this.arena = arena;
    this.player = player;
    this.camera = camera;

    // Scores (First to 4 wins Clash Squad match)
    this.blueScore = 0;
    this.redScore = 0;
    this.currentRound = 1;
    this.maxRounds = 7;
    this.targetWins = 4;

    // Round States
    this.roundState = 'buy'; // 'buy', 'combat', 'round_end', 'match_end'
    this.buyTimer = 12;
    this.combatTimer = 90;
    this.zoneRadius = 55;

    // Player match stats
    this.stats = {
      kills: 0,
      headshots: 0,
      damage: 0,
      mvp: 'MVP 👑'
    };

    // Bots (3 Blue teammates + 4 Red enemies)
    this.bots = [];
    this.initBots();

    // Damage numbers
    this.damageNumbers = [];
  }

  initBots() {
    // Blue Teammates
    const blueSpawns = [
      new THREE.Vector3(-6, 1, 35),
      new THREE.Vector3(6, 1, 35),
      new THREE.Vector3(0, 1, 39)
    ];
    this.bots.push(new Bot(this.arena.scene, 'Karthi', 'blue', 'rusher', blueSpawns[0], 'karthi'));
    this.bots.push(new Bot(this.arena.scene, 'Priya', 'blue', 'sniper', blueSpawns[1], 'priya'));
    this.bots.push(new Bot(this.arena.scene, 'Bala', 'blue', 'support', blueSpawns[2], 'bala'));

    // Red Enemies
    const redSpawns = [
      new THREE.Vector3(-8, 1, -35),
      new THREE.Vector3(-2, 1, -38),
      new THREE.Vector3(4, 1, -35),
      new THREE.Vector3(8, 1, -38)
    ];
    this.bots.push(new Bot(this.arena.scene, 'Raja', 'red', 'sniper', redSpawns[0], 'raja'));
    this.bots.push(new Bot(this.arena.scene, 'Durai', 'red', 'shotgunner', redSpawns[1], 'durai'));
    this.bots.push(new Bot(this.arena.scene, 'Senthil', 'red', 'rusher', redSpawns[2], 'senthil'));
    this.bots.push(new Bot(this.arena.scene, 'Shankar', 'red', 'support', redSpawns[3], 'shankar'));
  }

  startMatch() {
    this.blueScore = 0;
    this.redScore = 0;
    this.currentRound = 1;
    this.stats = { kills: 0, headshots: 0, damage: 0, mvp: 'MVP 👑' };
    this.startRound();
  }

  startRound() {
    this.roundState = 'buy';
    this.buyTimer = 12;
    this.combatTimer = 90;
    this.zoneRadius = 55;

    // Reset arena barriers & zone
    this.arena.raiseSpawnBarriers();
    this.arena.updateSafeZone(this.zoneRadius);
    window.glooManager?.clear();
    window.tracerManager?.clear();

    // Reset Player
    const playerSpawn = new THREE.Vector3(0, 1, 34);
    this.player.resetRound(playerSpawn);

    // Reset Bots
    const blueSpawns = [
      new THREE.Vector3(-6, 1, 35),
      new THREE.Vector3(6, 1, 35),
      new THREE.Vector3(0, 1, 39)
    ];
    const redSpawns = [
      new THREE.Vector3(-8, 1, -35),
      new THREE.Vector3(-2, 1, -38),
      new THREE.Vector3(4, 1, -35),
      new THREE.Vector3(8, 1, -38)
    ];

    let bIdx = 0;
    let rIdx = 0;
    this.bots.forEach(bot => {
      if (bot.team === 'blue') {
        bot.resetRound(blueSpawns[bIdx++], this.currentRound);
      } else {
        bot.resetRound(redSpawns[rIdx++], this.currentRound);
      }
    });

    sound.playRoundStart();
    window.ui?.onRoundStart(this.currentRound, this.buyTimer);
  }

  update(delta) {
    if (this.roundState === 'buy') {
      this.buyTimer -= delta;
      window.ui?.updateBuyTimer(Math.ceil(this.buyTimer));
      if (this.buyTimer <= 0) {
        this.roundState = 'combat';
        this.arena.lowerSpawnBarriers();
        window.ui?.onCombatStart();
      }
    } else if (this.roundState === 'combat') {
      // Combat timer & zone shrink
      this.combatTimer -= delta;
      window.ui?.updateCombatTimer(Math.max(0, Math.ceil(this.combatTimer)));

      if (this.combatTimer < 70) {
        // Safe zone gradually shrinks to center
        this.zoneRadius = Math.max(8, 55 * (this.combatTimer / 70));
        this.arena.updateSafeZone(this.zoneRadius);
        window.ui?.showZoneWarning(true);
      }

      // Check Safe Zone Damage (Distance from center > zoneRadius)
      if (this.player && !this.player.isDead) {
        const distFromCenter = new THREE.Vector2(this.player.position.x, this.player.position.z).length();
        if (distFromCenter > this.zoneRadius) {
          this.player.takeDamage(6 * delta, false);
        }
      }

      // Update alive counts & check round win conditions
      this.checkRoundStatus();
    }

    // Update Gloo walls & tracers
    window.glooManager?.update(delta);
    window.tracerManager?.update(delta);

    // Update Bots
    const glooMeshes = window.glooManager?.getWallMeshes() || [];
    this.bots.forEach(b => {
      b.update(delta, this.player, this.bots, this.arena.colliders, glooMeshes, this.roundState === 'buy');
    });

    // Update Player
    this.player.update(delta, this.arena.colliders, glooMeshes, this.bots);

    // Update floating damage numbers
    this.updateDamageNumbers(delta);
  }

  checkRoundStatus() {
    if (this.roundState !== 'combat') return;

    let blueAlive = (!this.player.isDead ? 1 : 0);
    let redAlive = 0;

    this.bots.forEach(b => {
      if (!b.isDead) {
        if (b.team === 'blue') blueAlive++;
        else redAlive++;
      }
    });

    window.ui?.updateAliveCounts(blueAlive, redAlive);

    if (redAlive === 0) {
      this.endRound('blue');
    } else if (blueAlive === 0) {
      this.endRound('red');
    }
  }

  endRound(winningTeam) {
    this.roundState = 'round_end';
    window.ui?.showZoneWarning(false);

    if (winningTeam === 'blue') {
      this.blueScore++;
      this.player.coins += 1500;
      sound.playRoundWin();
      window.ui?.showRoundOutcome('ROUND VICTORY! 🏆', 'ALL ENEMIES ELIMINATED');
    } else {
      this.redScore++;
      this.player.coins += 1000;
      sound.playDefeat();
      window.ui?.showRoundOutcome('ROUND DEFEAT 💀', 'SQUAD WAS WIPED OUT');
    }

    window.ui?.updateScoreboard(this.blueScore, this.redScore);

    // Check Match Win (First to 4)
    setTimeout(() => {
      if (this.blueScore >= this.targetWins) {
        this.endMatch(true);
      } else if (this.redScore >= this.targetWins) {
        this.endMatch(false);
      } else {
        this.currentRound++;
        this.startRound();
      }
    }, 3500);
  }

  endMatch(playerWon) {
    this.roundState = 'match_end';
    if (playerWon) {
      sound.playBooyah();
    } else {
      sound.playDefeat();
    }
    window.ui?.showGameOver(playerWon, this.stats);
  }

  onPlayerEliminated() {
    this.checkRoundStatus();
  }

  onBotEliminated(bot, killerName, isHeadshot) {
    if (killerName === 'Thunder_Gully') {
      this.stats.kills++;
      this.player.coins += 200;
      if (isHeadshot) this.stats.headshots++;
    }

    const hsTxt = isHeadshot ? ' (HEADSHOT 🎯)' : '';
    window.ui?.addKillfeed(`${killerName} knocked ${bot.name} with ${bot.weapon?.name || 'Weapon'}${hsTxt}`, killerName === 'Thunder_Gully');
    this.checkRoundStatus();
  }

  showDamageNumber(worldPos, amount, isHeadshot) {
    this.stats.damage += amount;
    this.damageNumbers.push({
      worldPos: worldPos.clone(),
      amount,
      isHeadshot,
      life: 0.8
    });
  }

  updateDamageNumbers(delta) {
    const layer = document.getElementById('damage-numbers-layer');
    if (!layer) return;

    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.life -= delta;

      if (!dn.element) {
        const el = document.createElement('div');
        el.className = 'dmg-num' + (dn.isHeadshot ? ' headshot' : '');
        el.innerText = dn.amount;
        layer.appendChild(el);
        dn.element = el;
      }

      // Project world to screen
      const screenPos = dn.worldPos.clone().project(this.camera);
      const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

      dn.element.style.left = `${x}px`;
      dn.element.style.top = `${y}px`;

      if (dn.life <= 0) {
        dn.element.remove();
        this.damageNumbers.splice(i, 1);
      }
    }
  }
}
