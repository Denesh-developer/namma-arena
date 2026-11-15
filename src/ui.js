import { sound } from './audio.js';
import { WEAPON_DEFS } from './weapons.js';
import { CharacterStudio, CHEYYAR_PALETTE } from './characterStudio.js';

export class UIManager {
  constructor() {
    this.currentScreen = 'screen-splash';
    this.playerName = 'DENESH';
    this.hero = 'male';
    this.skinTone = '#8a5a3a';
    this.outfitColor = '#263238';
    this.pantColor = '#212121';
    this.hairColor = '#100a06';
    this.gender = 'male';
    this.title = 'CHEYYAR THALA';

    this.bindDomElements();
    this.initSplashScreen();
    this.initLoginScreen();
    this.initCharacterScreen();
    this.initLobbyScreen();
    this.initShopModal();
    this.initMobileControls();
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    this.currentScreen = id;

    if (id === 'screen-character') {
      if (this.charStudio) {
        this.charStudio.start();
        setTimeout(() => this.charStudio.resize(), 60);
      }
    } else {
      if (this.charStudio) {
        this.charStudio.stop();
      }
    }
  }

  bindDomElements() {
    // Top Scoreboard
    this.blueScoreEl = document.getElementById('hud-blue-score');
    this.redScoreEl = document.getElementById('hud-red-score');
    this.bluePips = document.getElementById('blue-pips');
    this.redPips = document.getElementById('red-pips');
    this.roundLabel = document.getElementById('hud-round-label');
    this.roundTimer = document.getElementById('hud-round-timer');
    this.blueAlive = document.getElementById('hud-blue-alive');
    this.redAlive = document.getElementById('hud-red-alive');
    this.killfeed = document.getElementById('killfeed');

    // Health & Ammo
    this.barHp = document.getElementById('bar-hp');
    this.valHp = document.getElementById('val-hp');
    this.barArmor = document.getElementById('bar-armor');
    this.valArmor = document.getElementById('val-armor');
    this.wepName = document.getElementById('hud-weapon-name');
    this.ammoClip = document.getElementById('hud-ammo-clip');
    this.ammoReserve = document.getElementById('hud-ammo-reserve');
    this.glooCount = document.getElementById('hud-gloo-count');
    this.medCount = document.getElementById('hud-med-count');

    // Buy banner & Shop
    this.buyBanner = document.getElementById('buy-phase-banner');
    this.buyTimerEl = document.getElementById('buy-phase-timer');
    this.shopModal = document.getElementById('modal-shop');
    this.shopCoins = document.getElementById('shop-coins');
    this.zoneWarning = document.getElementById('zone-warning');

    // Round outcome & GameOver
    this.roundBanner = document.getElementById('round-result-banner');
    this.roundOutcomeText = document.getElementById('round-outcome-text');
    this.roundOutcomeSub = document.getElementById('round-outcome-sub');
  }

  // 1. SPLASH SCREEN (Auto-transitions to Login once loaded)
  initSplashScreen() {
    const loadingBar = document.getElementById('loading-bar');
    let pct = 0;

    const interval = setInterval(() => {
      pct += 4;
      if (pct > 100) pct = 100;
      if (loadingBar) loadingBar.style.width = pct + '%';

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          sound.init();
          this.showScreen('screen-login');
        }, 350);
      }
    }, 35);
  }

  // 2. AUTHENTICATION & LOGIN SCREEN (Policies enabled by default, Name asked after login)
  initLoginScreen() {
    const chkAge = document.getElementById('chk-age-policy');
    const chkTerms = document.getElementById('chk-terms-policy');
    const warningMsg = document.getElementById('policy-warning');
    const btnGoogle = document.getElementById('btn-login-google');
    const btnGuest = document.getElementById('btn-login-guest');

    // Ensure policies are checked and buttons unlocked by default
    if (chkAge) chkAge.checked = true;
    if (chkTerms) chkTerms.checked = true;

    const isPolicyAccepted = () => {
      return chkAge && chkTerms && chkAge.checked && chkTerms.checked;
    };

    const updateButtonStates = () => {
      const accepted = isPolicyAccepted();
      if (accepted) {
        btnGoogle?.classList.remove('locked');
        btnGuest?.classList.remove('locked');
        if (warningMsg) warningMsg.style.display = 'none';
      } else {
        btnGoogle?.classList.add('locked');
        btnGuest?.classList.add('locked');
      }
    };

    updateButtonStates();

    chkAge?.addEventListener('change', () => {
      sound.playClick();
      updateButtonStates();
    });

    chkTerms?.addEventListener('change', () => {
      sound.playClick();
      updateButtonStates();
    });

    // Clicking Google or Guest transitions smoothly to the Cheyyar Character Customizer screen!
    const proceedToCharacterScreen = (isGoogle = false) => {
      console.log('[UI] proceedToCharacterScreen called. isGoogle =', isGoogle, 'accepted =', isPolicyAccepted());
      if (!isPolicyAccepted()) {
        sound.playDefeat();
        if (warningMsg) {
          warningMsg.style.display = 'block';
          warningMsg.classList.add('shake');
          setTimeout(() => warningMsg.classList.remove('shake'), 400);
        }
        return;
      }

      sound.playClick();
      const nickInput = document.getElementById('input-char-name');
      if (nickInput && isGoogle) {
        nickInput.value = 'DENESH';
      } else if (nickInput && !nickInput.value) {
        nickInput.value = 'DENESH';
      }

      console.log('[UI] showing screen-character');
      this.showScreen('screen-character');
      window.player?.applyHero(this.hero);
      window.player?.setSkinTone(this.skinTone);
      window.player?.setOutfitColor(this.outfitColor);
    };

    btnGoogle?.addEventListener('click', () => proceedToCharacterScreen(true));
    btnGuest?.addEventListener('click', () => proceedToCharacterScreen(false));
  }

  // 2B. CHEYYAR 3D CHARACTER CUSTOMIZER SCREEN (Exact match to cheyyar-3d.vercel.app)
  initCharacterScreen() {
    this.charStudio = new CharacterStudio('char-preview-canvas');
    window.charStudio = this.charStudio;

    const navTabs = document.querySelectorAll('.char-nav-tabs .nav-tab-btn');
    const tabPanes = document.querySelectorAll('.char-customise-panel .tab-pane');
    const skinSwatches = document.querySelectorAll('.skin-tone-grid .swatch-btn');
    const hairSwatches = document.querySelectorAll('.hair-grid .swatch-btn');
    const clothSwatches = document.querySelectorAll('.cloth-grid .swatch-btn');
    const pantSwatches = document.querySelectorAll('.pant-grid .swatch-btn');
    const titleCards = document.querySelectorAll('.title-cards-list .title-card');
    const btnMale = document.getElementById('gender-btn-male');
    const btnFemale = document.getElementById('gender-btn-female');
    const btnRandom = document.getElementById('btn-char-random');
    const btnReset = document.getElementById('btn-char-reset');
    const btnEnter = document.getElementById('btn-enter-cheyyar');
    const nameInput = document.getElementById('input-char-name');
    const googleAltLink = document.getElementById('btn-char-google-alt');

    // Tab switching (BODY, HAIR, OUTFIT, TITLE, SAVED)
    navTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        navTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tabKey = btn.dataset.tab;
        tabPanes.forEach(pane => pane.classList.remove('active'));
        const activePane = document.getElementById(`tab-pane-${tabKey}`);
        if (activePane) activePane.classList.add('active');
      });
    });

    // 1. Skin Tone Swatches
    skinSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        sound.playClick();
        skinSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const color = swatch.dataset.color;
        this.skinTone = color;
        this.charStudio?.setSkinTone(color);
        window.player?.setSkinTone(color);
      });
    });

    // 2. Hair & Beard Colour Swatches
    hairSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        sound.playClick();
        hairSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const color = swatch.dataset.hair;
        this.hairColor = color;
        this.charStudio?.setHairColor(color);
        window.player?.setHairColor(color);
      });
    });

    // 3. Hoodie / Top Colour Swatches
    clothSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        sound.playClick();
        clothSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const color = swatch.dataset.cloth;
        this.outfitColor = color;
        this.charStudio?.setClothColor(color);
        window.player?.setOutfitColor(color);
      });
    });

    // 4. Pant Colour Swatches
    pantSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        sound.playClick();
        pantSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const color = swatch.dataset.pant;
        this.pantColor = color;
        this.charStudio?.setPantsColor(color);
        window.player?.setPantsColor(color);
      });
    });

    // 5. Title / Squad Badge Cards
    titleCards.forEach(card => {
      card.addEventListener('click', () => {
        sound.playClick();
        titleCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.title = card.dataset.title;
      });
    });

    // Gender Toggle: MALE (young man with beard, hoodie, sneakers)
    btnMale?.addEventListener('click', () => {
      sound.playClick();
      btnMale.classList.add('active');
      btnFemale?.classList.remove('active');
      this.gender = 'male';
      this.hero = 'male';

      this.charStudio?.setGender('male');
      window.player?.loadHeroModel('male');
    });

    // Gender Toggle: FEMALE (young woman with athletic attire)
    btnFemale?.addEventListener('click', () => {
      sound.playClick();
      btnFemale.classList.add('active');
      btnMale?.classList.remove('active');
      this.gender = 'female';
      this.hero = 'female';

      this.charStudio?.setGender('female');
      window.player?.loadHeroModel('female');
    });

    // 🎲 RANDOM look generator (from CHEYYAR_PALETTE)
    btnRandom?.addEventListener('click', () => {
      sound.playFanfare();
      const pick = arr => arr[Math.floor(Math.random() * arr.length)];
      const toHex = n => '#' + ('000000' + n.toString(16)).slice(-6);

      const rSkin = toHex(pick(CHEYYAR_PALETTE.skin));
      const rCloth = toHex(pick(CHEYYAR_PALETTE.cloth));
      const rPant = toHex(pick(CHEYYAR_PALETTE.pants));
      const rHair = toHex(pick(CHEYYAR_PALETTE.hair));

      this.skinTone = rSkin;
      this.outfitColor = rCloth;
      this.pantColor = rPant;
      this.hairColor = rHair;

      skinSwatches.forEach(s => s.classList.toggle('active', s.dataset.color.toLowerCase() === rSkin.toLowerCase()));
      clothSwatches.forEach(s => s.classList.toggle('active', s.dataset.cloth.toLowerCase() === rCloth.toLowerCase()));
      pantSwatches.forEach(s => s.classList.toggle('active', s.dataset.pant.toLowerCase() === rPant.toLowerCase()));
      hairSwatches.forEach(s => s.classList.toggle('active', s.dataset.hair.toLowerCase() === rHair.toLowerCase()));

      this.charStudio?.setSkinTone(rSkin);
      this.charStudio?.setClothColor(rCloth);
      this.charStudio?.setPantsColor(rPant);
      this.charStudio?.setHairColor(rHair);

      window.player?.setSkinTone(rSkin);
      window.player?.setOutfitColor(rCloth);
      window.player?.setPantsColor(rPant);
      window.player?.setHairColor(rHair);
    });

    // ↺ RESET to Cheyyar Denesh default
    btnReset?.addEventListener('click', () => {
      sound.playClick();
      this.skinTone = '#8a5a3a';
      this.outfitColor = '#263238';
      this.pantColor = '#212121';
      this.hairColor = '#100a06';
      this.gender = 'male';
      this.hero = 'male';

      if (nameInput) nameInput.value = 'DENESH';

      skinSwatches.forEach(s => s.classList.toggle('active', s.dataset.color === '#8a5a3a'));
      clothSwatches.forEach(s => s.classList.toggle('active', s.dataset.cloth === '#263238'));
      pantSwatches.forEach(s => s.classList.toggle('active', s.dataset.pant === '#212121'));
      hairSwatches.forEach(s => s.classList.toggle('active', s.dataset.hair === '#100a06'));

      btnMale?.classList.add('active');
      btnFemale?.classList.remove('active');

      this.charStudio?.setGender('male');
      this.charStudio?.setSkinTone('#8a5a3a');
      this.charStudio?.setClothColor('#263238');
      this.charStudio?.setPantsColor('#212121');
      this.charStudio?.setHairColor('#100a06');

      window.player?.loadHeroModel('male');
      window.player?.setSkinTone('#8a5a3a');
      window.player?.setOutfitColor('#263238');
      window.player?.setPantsColor('#212121');
      window.player?.setHairColor('#100a06');
    });

    // Google Sign-In Alt link
    googleAltLink?.addEventListener('click', () => {
      sound.playFanfare();
      if (nameInput) nameInput.value = 'DENESH';
      googleAltLink.innerHTML = '<span>✓ Google Account Connected</span>';
    });

    // ▶ ENTER CHEYYAR (Confirm and launch lobby)
    btnEnter?.addEventListener('click', () => {
      sound.playFanfare();
      let chosen = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'DENESH';
      this.playerName = chosen;

      this.updateLobbyProfile();
      window.player?.loadHeroModel(this.gender === 'female' ? 'female' : 'male');
      window.player?.setSkinTone(this.skinTone);
      window.player?.setOutfitColor(this.outfitColor);
      window.player?.setPantsColor(this.pantColor);
      window.player?.setHairColor(this.hairColor);

      this.showScreen('screen-lobby');
    });
  }

  // 3. LOBBY SCREEN
  initLobbyScreen() {
    const startMatchBtn = document.getElementById('btn-start-match');
    const audioBtn = document.getElementById('btn-lobby-audio');
    const playerPill = document.querySelector('.player-pill');

    // Clicking player pill in lobby allows re-customizing character!
    playerPill?.addEventListener('click', () => {
      sound.playClick();
      this.showScreen('screen-character');
    });

    audioBtn?.addEventListener('click', () => {
      const active = sound.toggle();
      audioBtn.innerText = active ? '🔊' : '🔇';
    });

    startMatchBtn?.addEventListener('click', () => {
      sound.playClick();
      this.triggerMatchmaking();
    });
  }

  updateLobbyProfile() {
    const nameEl = document.getElementById('lobby-player-name');
    const slot0Name = document.getElementById('squad-slot-0-name');
    const avatarEl = document.getElementById('lobby-avatar-icon');
    const slot0Avatar = document.getElementById('squad-slot-0-avatar');
    const levelEl = document.querySelector('.player-level');

    const avatars = { mani: '🥊', karthi: '⚡', priya: '🎯', bala: '🛡️' };
    const icon = avatars[this.hero] || '🥊';

    if (nameEl) nameEl.innerText = this.playerName;
    if (slot0Name) slot0Name.innerText = `${this.playerName} (You)`;
    if (avatarEl) avatarEl.innerText = icon;
    if (slot0Avatar) slot0Avatar.innerText = icon;
    if (levelEl) levelEl.innerText = `LVL 32 · ${this.title || 'CHEYYAR THALA'} 👑`;
  }

  // 4. MATCHMAKING
  triggerMatchmaking() {
    this.showScreen('screen-matchmaking');
    const countdownEl = document.getElementById('mm-countdown-text');
    let count = 3;

    const interval = setInterval(() => {
      count--;
      if (countdownEl) countdownEl.innerText = `MATCH STARTING IN ${count}...`;
      sound.playClick();

      if (count <= 0) {
        clearInterval(interval);
        this.showScreen('screen-game');
        window.game?.startMatch();
      }
    }, 1000);
  }

  // 5. BUY SHOP MODAL
  initShopModal() {
    const openBtn = document.getElementById('btn-open-shop');
    const closeBtn = document.getElementById('btn-close-shop');
    const readyBtn = document.getElementById('btn-shop-ready');

    const openShop = () => {
      if (window.game?.roundState !== 'buy') return;
      sound.playClick();
      this.updateShopButtons();
      this.shopModal?.classList.add('active');
    };

    const closeShop = () => {
      sound.playClick();
      this.shopModal?.classList.remove('active');
    };

    openBtn?.addEventListener('click', openShop);
    closeBtn?.addEventListener('click', closeShop);
    readyBtn?.addEventListener('click', closeShop);

    // Press 'B' to toggle shop
    window.addEventListener('keydown', e => {
      if (e.code === 'KeyB') {
        if (this.shopModal?.classList.contains('active')) closeShop();
        else openShop();
      }
    });

    // Buy Items Handling
    document.querySelectorAll('.shop-item').forEach(item => {
      const btn = item.querySelector('.btn-buy');
      const itemKey = item.dataset.item;
      const cost = parseInt(btn.dataset.cost);

      btn.addEventListener('click', () => {
        const player = window.player;
        if (!player || player.coins < cost) return;

        player.coins -= cost;
        sound.playClick();

        if (itemKey === 'vest') {
          player.armor = player.maxArmor;
        } else if (itemKey === 'gloo') {
          player.glooCount += 2;
        } else if (itemKey === 'medkit') {
          player.medCount += 2;
        } else {
          // Weapons
          player.weapons[itemKey] = {
            ...WEAPON_DEFS[itemKey],
            clip: WEAPON_DEFS[itemKey].magSize,
            reserve: WEAPON_DEFS[itemKey].reserveAmmo
          };
          player.currentWeaponKey = itemKey;
        }

        this.updateShopButtons();
      });
    });
  }

  updateShopButtons() {
    const player = window.player;
    if (!player) return;

    if (this.shopCoins) this.shopCoins.innerText = `$${player.coins}`;

    document.querySelectorAll('.shop-item').forEach(item => {
      const btn = item.querySelector('.btn-buy');
      const cost = parseInt(btn.dataset.cost);
      if (player.coins < cost) {
        btn.classList.add('disabled');
      } else {
        btn.classList.remove('disabled');
      }
    });
  }

  // HUD UPDATES
  onRoundStart(roundNum, buyTimer) {
    if (this.roundLabel) this.roundLabel.innerText = `ROUND ${roundNum} / 7`;
    if (this.buyBanner) this.buyBanner.style.display = 'block';
    this.updateBuyTimer(buyTimer);
    this.showZoneWarning(false);
    this.openQuickBuyModal();
  }

  openQuickBuyModal() {
    this.updateShopButtons();
    this.shopModal?.classList.add('active');
  }

  updateBuyTimer(seconds) {
    if (this.buyTimerEl) this.buyTimerEl.innerText = seconds;
  }

  onCombatStart() {
    if (this.buyBanner) this.buyBanner.style.display = 'none';
    this.shopModal?.classList.remove('active');
  }

  updateCombatTimer(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const str = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (this.roundTimer) this.roundTimer.innerText = str;
  }

  updateAliveCounts(blue, red) {
    if (this.blueAlive) this.blueAlive.innerText = blue;
    if (this.redAlive) this.redAlive.innerText = red;
  }

  updateScoreboard(blueScore, redScore) {
    if (this.blueScoreEl) this.blueScoreEl.innerText = blueScore;
    if (this.redScoreEl) this.redScoreEl.innerText = redScore;

    // Update Pips
    const bluePipsArr = this.bluePips?.querySelectorAll('.pip') || [];
    const redPipsArr = this.redPips?.querySelectorAll('.pip') || [];

    bluePipsArr.forEach((p, idx) => {
      if (idx < blueScore) p.classList.add('won');
      else p.classList.remove('won');
    });

    redPipsArr.forEach((p, idx) => {
      if (idx < redScore) p.classList.add('won');
      else p.classList.remove('won');
    });
  }

  showZoneWarning(show) {
    if (this.zoneWarning) {
      this.zoneWarning.style.display = show ? 'block' : 'none';
    }
  }

  showRoundOutcome(title, sub) {
    if (this.roundOutcomeText) this.roundOutcomeText.innerText = title;
    if (this.roundOutcomeSub) this.roundOutcomeSub.innerText = sub;
    if (this.roundBanner) {
      this.roundBanner.classList.add('show');
      setTimeout(() => this.roundBanner.classList.remove('show'), 3000);
    }
  }

  showGameOver(playerWon, stats) {
    this.showScreen('screen-gameover');
    const banner = document.getElementById('gameover-banner');
    const title = document.getElementById('gameover-title');
    const sub = document.getElementById('gameover-sub');

    if (playerWon) {
      if (title) title.innerText = 'BOOYAH!';
      if (sub) sub.innerText = 'NORTH STREET SQUAD DOMINATED THE TOWN!';
    } else {
      if (title) title.innerText = 'DEFEAT';
      if (sub) sub.innerText = 'SOUTH STREET TOOK CONTROL OF THE STREETS';
    }

    document.getElementById('stat-kills').innerText = stats.kills;
    document.getElementById('stat-headshots').innerText = stats.headshots;
    document.getElementById('stat-damage').innerText = stats.damage;

    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      sound.playClick();
      this.showScreen('screen-game');
      window.game?.startMatch();
    }, { once: true });

    document.getElementById('btn-return-lobby')?.addEventListener('click', () => {
      sound.playClick();
      this.showScreen('screen-lobby');
    }, { once: true });
  }

  addKillfeed(text, isPlayerKill) {
    if (!this.killfeed) return;
    const item = document.createElement('div');
    item.className = 'killfeed-item' + (isPlayerKill ? ' player-kill' : '');
    item.innerText = text;
    this.killfeed.appendChild(item);
    setTimeout(() => item.remove(), 4000);
  }

  // Update In-Game HUD Bars
  updateHUD(player) {
    if (!player) return;

    // HP Bar
    const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
    if (this.barHp) this.barHp.style.width = hpPct + '%';
    if (this.valHp) this.valHp.innerText = `${Math.ceil(player.hp)} / ${player.maxHp}`;

    // Armor Bar
    const armorPct = Math.max(0, (player.armor / player.maxArmor) * 100);
    if (this.barArmor) this.barArmor.style.width = armorPct + '%';
    if (this.valArmor) this.valArmor.innerText = `${Math.ceil(player.armor)} / ${player.maxArmor}`;

    // Weapon & Ammo
    const wep = player.getCurrentWeapon();
    if (wep) {
      if (this.wepName) this.wepName.innerText = wep.name.toUpperCase();
      if (this.ammoClip) this.ammoClip.innerText = player.isReloading ? '...' : wep.clip;
      if (this.ammoReserve) this.ammoReserve.innerText = wep.reserve;
    }

    // Gloo & Medkit
    if (this.glooCount) this.glooCount.innerText = `x${player.glooCount}`;
    if (this.medCount) this.medCount.innerText = `x${player.medCount}`;
  }

  // 6. MOBILE TOUCH CONTROLS
  initMobileControls() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileContainer = document.getElementById('mobile-controls');
    if (!isTouch || !mobileContainer) return;

    mobileContainer.style.display = 'block';

    const joystickZone = document.getElementById('touch-joystick-zone');
    const joystickThumb = document.getElementById('touch-joystick-thumb');

    let touchOrigin = null;

    joystickZone?.addEventListener('touchstart', e => {
      const touch = e.touches[0];
      touchOrigin = { x: touch.clientX, y: touch.clientY };
    });

    joystickZone?.addEventListener('touchmove', e => {
      if (!touchOrigin || !window.player) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchOrigin.x;
      const dy = touch.clientY - touchOrigin.y;
      const dist = Math.min(45, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);

      joystickThumb.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px))`;

      window.player.keys.forward = dy < -15;
      window.player.keys.backward = dy > 15;
      window.player.keys.left = dx < -15;
      window.player.keys.right = dx > 15;
    });

    const resetJoystick = () => {
      touchOrigin = null;
      if (joystickThumb) joystickThumb.style.transform = 'translate(-50%, -50%)';
      if (window.player) {
        window.player.keys.forward = false;
        window.player.keys.backward = false;
        window.player.keys.left = false;
        window.player.keys.right = false;
      }
    };

    joystickZone?.addEventListener('touchend', resetJoystick);
    joystickZone?.addEventListener('touchcancel', resetJoystick);

    // Touch Action Buttons
    document.getElementById('touch-btn-fire')?.addEventListener('touchstart', () => {
      if (window.player) window.player.keys.fire = true;
    });
    document.getElementById('touch-btn-fire')?.addEventListener('touchend', () => {
      if (window.player) window.player.keys.fire = false;
    });

    document.getElementById('touch-btn-jump')?.addEventListener('touchstart', () => {
      if (window.player) window.player.keys.jump = true;
    });
    document.getElementById('touch-btn-jump')?.addEventListener('touchend', () => {
      if (window.player) window.player.keys.jump = false;
    });

    document.getElementById('touch-btn-gloo')?.addEventListener('touchstart', () => {
      window.player?.triggerGloo();
    });

    document.getElementById('touch-btn-reload')?.addEventListener('touchstart', () => {
      window.player?.reload();
    });

    document.getElementById('touch-btn-scope')?.addEventListener('touchstart', () => {
      window.player?.toggleScope();
    });
  }
}
