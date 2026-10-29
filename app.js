
/**
 * ============================================================================
 * PREMIUM 3D INTERACTIVE LOVE EXPERIENCE — CORE ENGINE & 13 SCENE CONTROLLERS
 * ============================================================================
 */
(function() {
  "use strict";

  // State Machine
  window.APP_STATE = {
    currentScene: 1,
    totalScenes: 13,
    unlocked: false,
    visitedScenes: { 1: true },
    passcodeInput: "",
    wrongAttempts: 0,
    skipAllIntros: false,
    storyAutoplay: false,
    storyAutoplayTimer: null,
    reducedMotion: false,
    globalMuted: false,
    editMode: false,
    activeEditTarget: null,
    activeLightboxItem: null,
    // Scene 3
    heartWordsAnimId: null,
    heartWordsProgress: 0,
    heartWordsPulseBoost: 1,
    // Scene 6
    outlineMiniScene: 0,
    outlineDrawProgress: 0,
    outlineAutoplay: true,
    outlineTiltX: 0,
    outlineTiltY: 0,
    outlineSparkles: [],
    // Scene 7
    gardenTime: "dusk",
    gardenFlowers: [],
    gardenPetals: [],
    gardenFireflies: [],
    gardenButterflies: [],
    gardenWind: 0,
    gardenTargetWind: 0,
    gardenAmbiencePlaying: false,
    gardenAmbienceNodes: null,
    bouquetStems: [
      { type: "rose", x: -38, y: -15, scale: 1.05 },
      { type: "tulip", x: 0, y: -32, scale: 1.1 },
      { type: "sunflower", x: 38, y: -12, scale: 1.05 },
      { type: "lotus", x: -18, y: 12, scale: 0.95 },
      { type: "daisy", x: 22, y: 14, scale: 0.95 }
    ],
    bouquetRibbonColor: "#ff8aa1",
    // Scene 8
    threeScene: null,
    threeRenderer: null,
    threeCamera: null,
    threeMeshes: [],
    shapeFilterIndex: 0,
    // Scene 9
    rooftopProgress: 0,
    rooftopSpeed: 1,
    rooftopSparkles: [],
    // Scene 11
    candlesLit: [true, true, true, true, true],
    micStream: null,
    micAnalyser: null,
    // Scene 12
    typewriterTimer: null,
    typewriterIndex: 0,
    // Scene 13
    currentTrackIndex: 0,
    musicPlaying: false,
    musicProgress: 0,
    musicVolume: 0.75,
    musicSynthTimer: null,
    musicNoteStep: 0,
    htmlAudioEl: null,
    // Ambient & Fireworks
    pointerX: window.innerWidth / 2,
    pointerY: window.innerHeight / 2,
    trailParticles: [],
    fireworks: [],
    skyLanterns: []
  };

  // Safe Storage Helpers (wrapped in try/catch per specification)
  function safeSessionGet(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSessionSet(key, val) {
    try { window.sessionStorage.setItem(key, val); } catch (e) {}
  }
  function safeLocalGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeLocalSet(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) {}
  }

  // Haptic helper
  function triggerHaptic(ms) {
    try {
      if (navigator && typeof navigator.vibrate === "function") {
        navigator.vibrate(ms || 25);
      }
    } catch (e) {}
  }

  // Toast helper
  var toastTimeout = null;
  window.showToast = function(msg, durationMs) {
    var el = document.getElementById("hud-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("visible");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function() {
      el.classList.remove("visible");
    }, durationMs || 2900);
  };

  // -------------------------------------------------------------------------
  // Web Audio Synthesizer (Soft UI Clicks, Unlock Chime, Wish Sparkle, Music)
  // -------------------------------------------------------------------------
  var audioCtx = null;
  function getAudioContext() {
    if (window.APP_STATE.globalMuted) return null;
    try {
      if (!audioCtx) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtx = new Ctx();
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  window.playSoundEffect = function(type) {
    var ctx = getAudioContext();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      if (type === "click") {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.075);
      } else if (type === "unlock" || type === "wish") {
        var freqs = type === "unlock" ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 739.99, 880, 1174.66, 1479.98];
        freqs.forEach(function(f, idx) {
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          o.type = "triangle";
          o.frequency.setValueAtTime(f, now + idx * 0.08);
          g.gain.setValueAtTime(0.09, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.08 + 0.55);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + idx * 0.08);
          o.stop(now + idx * 0.08 + 0.58);
        });
      } else if (type === "wrong") {
        var ow = ctx.createOscillator();
        var gw = ctx.createGain();
        ow.type = "sawtooth";
        ow.frequency.setValueAtTime(190, now);
        ow.frequency.linearRampToValueAtTime(135, now + 0.22);
        gw.gain.setValueAtTime(0.07, now);
        gw.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        ow.connect(gw);
        gw.connect(ctx.destination);
        ow.start(now);
        ow.stop(now + 0.26);
      }
    } catch (e) {}
  };

  // -------------------------------------------------------------------------
  // Pure-JS SHA-256 + WebCrypto SHA-256 Verification
  // -------------------------------------------------------------------------
  function sha256PureJS(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = "length";
    var i, j;
    var result = "";
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    var hash = sha256PureJS.h = sha256PureJS.h || [];
    var k = sha256PureJS.k = sha256PureJS.k || [];
    var primeCounter = k[lengthProperty];
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += "\x80";
    while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00";
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return "";
      words[i >> 2] |= j << ((3 - (i % 4)) * 8);
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;
    for (j = 0; j < words[lengthProperty]; ) {
      var w = words.slice(j, (j += 16));
      var oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var i2 = i + j;
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0);
        var temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? 0 : "") + b.toString(16);
      }
    }
    return result;
  }

  async function computeSHA256(str) {
    try {
      if (window.crypto && window.crypto.subtle) {
        var buf = new TextEncoder().encode(str);
        var digest = await window.crypto.subtle.digest("SHA-256", buf);
        return Array.from(new Uint8Array(digest))
          .map(function(b) { return b.toString(16).padStart(2, "0"); })
          .join("");
      }
    } catch (e) {}
    return sha256PureJS(str);
  }

  // -------------------------------------------------------------------------
  // Bespoke Romantic SVG Artwork Generator (Zero Broken External Links)
  // -------------------------------------------------------------------------
  window.generateRomanticSVGDataURI = function(preset, titleText) {
    var safeTitle = (titleText || "Our Memory").replace(/[<>&"']/g, "");
    var palettes = {
      "rooftop-coffee": ["#0c142c", "#2d1e3e", "#f0be72", "#ff8aa1"],
      "rainy-umbrella": ["#091526", "#1b364c", "#7cc6fe", "#ff8aa1"],
      "sunflower-field": ["#1a2418", "#3e4f24", "#f7c844", "#f8edd9"],
      "midnight-stargaze": ["#040711", "#141e3c", "#f0be72", "#c8b6ff"],
      "autumn-lanterns": ["#1c1018", "#3d1e24", "#ff9e5e", "#f0be72"],
      "birthday-sparkler": ["#140c24", "#2f1942", "#ff8aa1", "#f0be72"],
      "couple-cameo": ["#12182f", "#2b1e38", "#ff8aa1", "#f0be72"],
      "vinyl-midnight": ["#060a17", "#1e294a", "#f0be72", "#ff8aa1"],
      "vinyl-garden": ["#102019", "#284434", "#f0be72", "#8de0a6"],
      "vinyl-rose": ["#220d1b", "#451a35", "#ff8aa1", "#f0be72"]
    };
    var p = palettes[preset] || palettes["rooftop-coffee"];
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="600" height="420">' +
      '<defs>' +
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + p[0] + '"/>' +
      '<stop offset="100%" stop-color="' + p[1] + '"/>' +
      '</linearGradient>' +
      '<radialGradient id="glow" cx="50%" cy="42%" r="48%">' +
      '<stop offset="0%" stop-color="' + p[2] + '" stop-opacity="0.45"/>' +
      '<stop offset="100%" stop-color="' + p[0] + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<rect width="600" height="420" fill="url(#bg)"/>' +
      '<circle cx="300" cy="180" r="190" fill="url(#glow)"/>' +
      '<g stroke="' + p[2] + '" stroke-width="1.8" fill="none" opacity="0.65">' +
      '<circle cx="110" cy="75" r="2"/><circle cx="480" cy="65" r="2.5"/><circle cx="520" cy="135" r="1.8"/><circle cx="85" cy="150" r="2"/>' +
      '<path d="M 70 340 Q 300 305 530 340"/>' +
      '</g>' +
      // Couple silhouette + floating heart
      '<g transform="translate(300, 210)">' +
      '<path d="M0 -65 C0 -65 -26 -86 -26 -102 C-26 -114 -14 -120 -6 -120 C-1 -120 0 -115 0 -111 C0 -115 1 -120 6 -120 C14 -120 26 -114 26 -102 C26 -86 0 -65 0 -65 Z" fill="' + p[3] + '" opacity="0.9"/>' +
      '<circle cx="-26" cy="-18" r="18" fill="none" stroke="#f8edd9" stroke-width="2.5"/>' +
      '<path d="M-48 55 C-48 15 -10 15 -8 55" fill="none" stroke="#f8edd9" stroke-width="2.5"/>' +
      '<circle cx="26" cy="-14" r="17" fill="none" stroke="' + p[3] + '" stroke-width="2.5"/>' +
      '<path d="M8 55 C10 18 48 18 48 55" fill="none" stroke="' + p[3] + '" stroke-width="2.5"/>' +
      '</g>' +
      '<text x="300" y="382" text-anchor="middle" fill="#f8edd9" font-family="Georgia, serif" font-size="20" font-style="italic" opacity="0.92">' +
      safeTitle +
      '</text>' +
      '</svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  };

  // Helper to get effective photo src
  window.getPhotoSrc = function(photoObj) {
    if (photoObj && photoObj.src && photoObj.src.trim() !== "") {
      return photoObj.src;
    }
    return window.generateRomanticSVGDataURI(
      (photoObj && photoObj.svgPreset) || "rooftop-coffee",
      (photoObj && photoObj.title) || "Our Moment"
    );
  };

  // -------------------------------------------------------------------------
  // Navigation, Scene Transitions & History State Machine
  // -------------------------------------------------------------------------
  window.renderSceneDots = function() {
    var container = document.getElementById("hud-scene-dots");
    if (!container) return;
    container.innerHTML = "";
    for (var i = 1; i <= window.APP_STATE.totalScenes; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "scene-dot" +
        (i === window.APP_STATE.currentScene ? " active" : "") +
        (window.APP_STATE.visitedScenes[i] ? " visited" : "");
      btn.title = "Scene " + i;
      btn.setAttribute("aria-label", "Go to Scene " + i);
      // Lock scenes > 2 until passcode is unlocked
      if (i > 2 && !window.APP_STATE.unlocked) {
        btn.disabled = true;
      }
      (function(sceneNum) {
        btn.addEventListener("click", function() {
          window.goToScene(sceneNum);
        });
      })(i);
      container.appendChild(btn);
    }
    var counter = document.getElementById("hud-scene-counter");
    if (counter) {
      counter.textContent = window.APP_STATE.currentScene + " / " + window.APP_STATE.totalScenes;
    }
  };

  window.goToScene = function(targetScene, fromPopState) {
    var s = parseInt(targetScene, 10);
    if (isNaN(s) || s < 1) s = 1;
    if (s > window.APP_STATE.totalScenes) s = window.APP_STATE.totalScenes;

    // Guard locked scenes unless unlocked
    if (s > 2 && !window.APP_STATE.unlocked) {
      window.showToast("🔒 Enter our special passcode (0214) first!");
      s = 2;
    }

    window.playSoundEffect("click");
    var overlay = document.getElementById("scene-transition-overlay");
    var caption = document.getElementById("transition-caption");
    if (overlay && !window.APP_STATE.reducedMotion) {
      var chapterNames = [
        "", "I · Loading", "II · Passcode", "III · Heart of Words", "IV · Date Quiz",
        "V · Mystery Boxes", "VI · Outline Story", "VII · Living Garden", "VIII · 3D Memories",
        "IX · Midnight Rooftop", "X · Time Together", "XI · Birthday Wish", "XII · Love Letter", "XIII · Finale"
      ];
      if (caption) caption.textContent = chapterNames[s] || "♥";
      overlay.classList.add("active");
      setTimeout(function() {
        overlay.classList.remove("active");
      }, 460);
    }

    // Switch active panel
    for (var i = 1; i <= window.APP_STATE.totalScenes; i++) {
      var panel = document.getElementById("scene-" + i);
      if (panel) {
        if (i === s) panel.classList.add("active");
        else panel.classList.remove("active");
      }
    }

    window.APP_STATE.currentScene = s;
    window.APP_STATE.visitedScenes[s] = true;
    safeSessionSet("love_last_scene", String(s));

    if (!fromPopState) {
      try {
        window.history.pushState({ scene: s }, "", "#scene-" + s);
      } catch (e) {}
    }

    window.renderSceneDots();
    window.scrollTo({ top: 0, behavior: "smooth" });
    onSceneEntered(s);
  };

  window.nextScene = function() {
    if (window.APP_STATE.currentScene === 2 && !window.APP_STATE.unlocked) {
      window.showToast("🔒 Enter passcode 0214 (or click Auto-Fill 0214) to unlock!");
      return;
    }
    if (window.APP_STATE.currentScene < window.APP_STATE.totalScenes) {
      window.goToScene(window.APP_STATE.currentScene + 1);
    } else {
      window.goToScene(1);
    }
  };

  window.prevScene = function() {
    if (window.APP_STATE.currentScene > 1) {
      window.goToScene(window.APP_STATE.currentScene - 1);
    }
  };

  function onSceneEntered(s) {
    if (s === 1) window.replayLoadingScene();
    if (s === 2) renderPasscodeDots();
    if (s === 3) window.restartHeartOfWords();
    if (s === 6) window.selectOutlineMiniScene(window.APP_STATE.outlineMiniScene || 0);
    if (s === 7) resizeAndInitGarden();
    if (s === 8) {
      window.renderMemoryWallAndClothesline();
      initOrResizeThreeHero();
    }
    if (s === 9) window.startRooftopSketch();
    if (s === 10) updateClockAndCounter();
    if (s === 11) renderCakeCandles();
    if (s === 12) {
      renderMiniBouquetOnLetter();
      window.startLetterTypewriter(false);
    }
    if (s === 13) updateMusicPlayerUI();
  }

  // -------------------------------------------------------------------------
  // Global Toolbar Toggles (Story Autoplay, Fast Skip, Theme, Motion, Mute, Edit)
  // -------------------------------------------------------------------------
  window.toggleStoryAutoplay = function() {
    window.APP_STATE.storyAutoplay = !window.APP_STATE.storyAutoplay;
    var btn = document.getElementById("btn-story-autoplay");
    if (window.APP_STATE.storyAutoplay) {
      if (!window.APP_STATE.unlocked) {
        unlockSuccessFlow(false);
      }
      if (btn) {
        btn.textContent = "⏸ Pause Story";
        btn.classList.add("active-toggle");
      }
      window.showToast("▶ Autoplay Story Mode enabled — advancing every 8 seconds");
      window.APP_STATE.storyAutoplayTimer = setInterval(function() {
        if (!window.APP_STATE.storyAutoplay) return;
        if (window.APP_STATE.currentScene < window.APP_STATE.totalScenes) {
          window.nextScene();
        } else {
          window.toggleStoryAutoplay();
        }
      }, 8000);
    } else {
      if (btn) {
        btn.textContent = "▶ Story";
        btn.classList.remove("active-toggle");
      }
      if (window.APP_STATE.storyAutoplayTimer) {
        clearInterval(window.APP_STATE.storyAutoplayTimer);
        window.APP_STATE.storyAutoplayTimer = null;
      }
      window.showToast("⏸ Story autoplay paused");
    }
  };

  window.toggleSkipAllIntros = function() {
    window.APP_STATE.skipAllIntros = !window.APP_STATE.skipAllIntros;
    var btn = document.getElementById("btn-skip-intros");
    if (btn) btn.classList.toggle("active-toggle", window.APP_STATE.skipAllIntros);
    if (window.APP_STATE.skipAllIntros) {
      if (!window.APP_STATE.unlocked) unlockSuccessFlow(false);
      window.goToScene(8);
      window.showToast("⚡ Jumped straight to 3D Memory Space & Unlocked all scenes!");
    } else {
      window.showToast("Standard intro progression restored");
    }
  };

  window.toggleThemeMode = function() {
    var current = document.documentElement.getAttribute("data-theme");
    var next = current === "paper" ? "midnight" : "paper";
    if (next === "paper") {
      document.documentElement.setAttribute("data-theme", "paper");
      window.showToast("☀ Switched to Warm Paper Editorial Theme");
    } else {
      document.documentElement.removeAttribute("data-theme");
      window.showToast("🌙 Switched to Midnight Navy Theme");
    }
    window.LOVE_CONFIG.theme.mode = next;
  };

  window.toggleReducedMotion = function() {
    window.APP_STATE.reducedMotion = !window.APP_STATE.reducedMotion;
    document.body.setAttribute("data-reduced-motion", window.APP_STATE.reducedMotion ? "true" : "false");
    var btn = document.getElementById("btn-motion-toggle");
    if (btn) {
      btn.textContent = window.APP_STATE.reducedMotion ? "✦ Motion: Off" : "✦ Motion";
      btn.classList.toggle("active-toggle", window.APP_STATE.reducedMotion);
    }
    window.showToast(window.APP_STATE.reducedMotion ? "Reduced motion enabled (static fallbacks)" : "Full smooth animations enabled");
  };

  window.toggleGlobalMute = function() {
    window.APP_STATE.globalMuted = !window.APP_STATE.globalMuted;
    var btn = document.getElementById("btn-audio-mute");
    if (btn) {
      btn.textContent = window.APP_STATE.globalMuted ? "🔇 Muted" : "🔊 Sound";
      btn.classList.toggle("active-toggle", window.APP_STATE.globalMuted);
    }
    if (window.APP_STATE.globalMuted) {
      if (window.APP_STATE.gardenAmbiencePlaying) window.toggleGardenAmbience();
      if (window.APP_STATE.musicPlaying) window.toggleMusicPlayback();
    }
    window.showToast(window.APP_STATE.globalMuted ? "🔇 All audio muted" : "🔊 Audio enabled");
  };

  window.toggleEditMode = function() {
    if (!window.APP_STATE.unlocked) {
      window.showToast("🔒 Unlock passcode first to enter Edit Mode");
      return;
    }
    window.APP_STATE.editMode = !window.APP_STATE.editMode;
    document.body.classList.toggle("edit-mode-active", window.APP_STATE.editMode);
    var btn = document.getElementById("btn-edit-mode");
    if (btn) btn.classList.toggle("active-toggle", window.APP_STATE.editMode);
    if (window.APP_STATE.editMode) {
      window.openEditStudioModal();
      window.showToast("⚙ Edit Mode ON: Click or drag photos onto any frame to swap live!");
    } else {
      window.showToast("⚙ Edit Mode OFF");
    }
  };

  window.lockExperienceAgain = function() {
    window.APP_STATE.unlocked = false;
    window.APP_STATE.editMode = false;
    document.body.classList.remove("edit-mode-active");
    safeSessionSet("love_unlocked", "false");
    var editBtn = document.getElementById("btn-edit-mode");
    var lockBtn = document.getElementById("btn-lock-again");
    if (editBtn) editBtn.style.display = "none";
    if (lockBtn) lockBtn.style.display = "none";
    window.APP_STATE.passcodeInput = "";
    window.goToScene(2);
    window.showToast("🔒 Experience locked. Enter passcode to unlock again.");
  };

  window.openReadmeModal = function() {
    var m = document.getElementById("readme-guide-modal");
    if (m) m.classList.add("open");
  };
  window.closeReadmeModal = function() {
    var m = document.getElementById("readme-guide-modal");
    if (m) m.classList.remove("open");
  };

  // -------------------------------------------------------------------------
  // SCENE 1: LOADING SCREEN (Heart Fill + ECG Heartbeat)
  // -------------------------------------------------------------------------
  var loadInterval = null;
  window.replayLoadingScene = function() {
    if (loadInterval) clearInterval(loadInterval);
    var pct = 0;
    var rect = document.getElementById("heart-load-rect");
    var txt = document.getElementById("loading-pct-text");
    var ecg = document.getElementById("ecg-line-path");
    if (window.APP_STATE.reducedMotion || window.APP_STATE.skipAllIntros) {
      if (rect) rect.setAttribute("y", "0");
      if (txt) txt.textContent = "100%";
      if (ecg) ecg.style.strokeDashoffset = "0";
      return;
    }
    loadInterval = setInterval(function() {
      pct += 4;
      if (pct > 100) pct = 100;
      if (rect) {
        var yPos = 185 - (185 * pct) / 100;
        rect.setAttribute("y", String(yPos));
      }
      if (txt) txt.textContent = pct + "%";
      if (ecg) {
        var offset = 480 - (480 * pct) / 100;
        ecg.style.strokeDashoffset = String(offset);
      }
      if (pct >= 100) {
        clearInterval(loadInterval);
        loadInterval = null;
      }
    }, 45);
  };

  // -------------------------------------------------------------------------
  // SCENE 2: PASSCODE LOCK (SHA-256 Verification, Shake, Hints, Heart Burst)
  // -------------------------------------------------------------------------
  function renderPasscodeDots() {
    var container = document.getElementById("passcode-dots-container");
    if (!container) return;
    var len = window.LOVE_CONFIG.passcodeLength || 4;
    container.innerHTML = "";
    for (var i = 0; i < len; i++) {
      var box = document.createElement("div");
      var filled = i < window.APP_STATE.passcodeInput.length;
      box.className = "passcode-dot-box" + (filled ? " filled" : "");
      box.textContent = filled ? "♥" : "";
      container.appendChild(box);
    }
  }

  window.pressPasscodeDigit = function(digit) {
    var len = window.LOVE_CONFIG.passcodeLength || 4;
    if (window.APP_STATE.passcodeInput.length >= len) return;
    window.playSoundEffect("click");
    triggerHaptic(15);
    window.APP_STATE.passcodeInput += String(digit);
    renderPasscodeDots();
    if (window.APP_STATE.passcodeInput.length === len) {
      setTimeout(function() {
        window.submitPasscode();
      }, 160);
    }
  };

  window.deletePasscodeDigit = function() {
    if (window.APP_STATE.passcodeInput.length > 0) {
      window.playSoundEffect("click");
      window.APP_STATE.passcodeInput = window.APP_STATE.passcodeInput.slice(0, -1);
      renderPasscodeDots();
    }
  };

  window.fillDemoPasscode = function() {
    window.APP_STATE.passcodeInput = "0214";
    renderPasscodeDots();
    window.submitPasscode();
  };

  window.testWrongPasscode = function() {
    window.APP_STATE.passcodeInput = "9999";
    renderPasscodeDots();
    window.submitPasscode();
  };

  window.submitPasscode = async function() {
    var code = window.APP_STATE.passcodeInput;
    if (!code) return;
    var digest = await computeSHA256(code);
    if (digest === window.LOVE_CONFIG.passcodeHash || code === "0214") {
      unlockSuccessFlow(true);
    } else {
      window.APP_STATE.wrongAttempts += 1;
      window.playSoundEffect("wrong");
      triggerHaptic([40, 60, 40]);
      var card = document.getElementById("passcode-card-box");
      if (card) {
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
      }
      var hint1 = document.getElementById("passcode-hint-text");
      var hint2 = document.getElementById("passcode-second-hint");
      if (hint1) hint1.textContent = window.LOVE_CONFIG.hints.first;
      if (window.APP_STATE.wrongAttempts >= 3 && hint2) {
        hint2.style.display = "block";
        hint2.textContent = window.LOVE_CONFIG.hints.second;
      }
      window.showToast("Not quite! " + window.LOVE_CONFIG.hints.first);
      window.APP_STATE.passcodeInput = "";
      setTimeout(renderPasscodeDots, 380);
    }
  };

  function unlockSuccessFlow(advanceScene) {
    window.APP_STATE.unlocked = true;
    for (var i = 1; i <= window.APP_STATE.totalScenes; i++) {
      window.APP_STATE.visitedScenes[i] = true;
    }
    safeSessionSet("love_unlocked", "true");
    var lockIcon = document.getElementById("lock-shackle-icon");
    if (lockIcon) lockIcon.textContent = "🔓";
    var editBtn = document.getElementById("btn-edit-mode");
    var lockBtn = document.getElementById("btn-lock-again");
    if (editBtn) editBtn.style.display = "inline-flex";
    if (lockBtn) lockBtn.style.display = "inline-flex";

    window.playSoundEffect("unlock");
    triggerHaptic([30, 50, 80]);
    window.spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.4, 42);
    window.renderSceneDots();

    if (advanceScene) {
      window.showToast("💖 Unlocked! Welcome to our story, " + window.LOVE_CONFIG.names.to + "!");
      setTimeout(function() {
        window.goToScene(3);
      }, 650);
    }
  }

  // -------------------------------------------------------------------------
  // SCENE 3: HEART OF WORDS CANVAS (Exact Dual-Canvas Algorithm & Repulsion)
  // -------------------------------------------------------------------------
  var hwParticles = [];
  var hwBgParticles = [];
  var hwWidth = 900;
  var hwHeight = 540;
  var hwCenterX = 450;
  var hwCenterY = 270;
  var hwMouse = { x: -1000, y: -1000 };
  var hwAnimationStartTime = performance.now();
  var hwOutlineEndTime = 0;
  var hwTotalAnimDuration = 8000;
  var hwInteractionsBound = false;

  var HW_MESSAGE = "I Love You";
  var HW_SHADES = ["#ff1758", "#ff2a6d", "#ff5285", "#ff789e", "#ffa8c0", "#ffd6e3", "#ffffff"];
  var HW_GLOW_COLOR = "rgba(255, 42, 109, 0.75)";

  // Parametric Heart Equations:
  // x = 16 * sin^3(t)
  // y = -(13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t))
  function getHeartPoint(t, scale) {
    var s = scale === undefined ? 1 : scale;
    var x = 16 * Math.pow(Math.sin(t), 3);
    var y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x * s, y: y * s };
  }

  // Check if a point is inside the heart boundary polygon
  function isInsideHeartPolygon(px, py, polygon) {
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var xi = polygon[i].x, yi = polygon[i].y;
      var xj = polygon[j].x, yj = polygon[j].y;
      var intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function createHeartWordParticle(targetX, targetY, isOutline, delay) {
    var color = HW_SHADES[Math.floor(Math.random() * HW_SHADES.length)];
    var fontSize = 10;
    var dx = targetX - hwCenterX;
    var dy = targetY - hwCenterY;
    var distFromCenter = Math.sqrt(dx * dx + dy * dy);

    // Outline slides in horizontally;
    // Interior appears right inside, descending softly from above (top to bottom fill)
    var startX = isOutline ? targetX - 8 : targetX;
    var startY = isOutline ? targetY : targetY - 14;
    var duration = isOutline ? 380 : 550;

    hwParticles.push({
      startX: startX,
      startY: startY,
      currX: startX,
      currY: startY,
      targetX: targetX,
      targetY: targetY,
      distFromCenter: distFromCenter,
      text: (window.LOVE_CONFIG && window.LOVE_CONFIG.heartOfWordsMessage) || HW_MESSAGE,
      fontSize: fontSize,
      color: color,
      glowIntensity: isOutline ? 6 : 5,
      isOutline: isOutline,
      delay: delay,
      duration: duration,
      alpha: 0
    });
  }

  function initHeartParticles() {
    hwParticles = [];
    var minDim = Math.min(hwWidth, hwHeight);
    var scale = minDim < 600 ? minDim / 38 : minDim / 34;
    var yOffset = 2.5 * scale;

    // Build continuous heart polygon for boundary detection
    var heartPolygon = [];
    var polygonSteps = 200;
    for (var i = 0; i < polygonSteps; i++) {
      var t = (i / polygonSteps) * Math.PI * 2;
      var pt = getHeartPoint(t, scale);
      heartPolygon.push({ x: pt.x, y: pt.y - yOffset });
    }

    // 1. OUTLINE PARTICLES (Sequential around the perimeter from t = 0 to 2*PI)
    var outlinePoints = [];
    var fineSteps = 3000;
    var lastPt = null;

    for (var s = 0; s <= fineSteps; s++) {
      var ts = (s / fineSteps) * Math.PI * 2;
      var pts = getHeartPoint(ts, scale);
      var currX = pts.x;
      var currY = pts.y - yOffset;

      if (!lastPt) {
        outlinePoints.push({ x: currX, y: currY });
        lastPt = { x: currX, y: currY };
      } else {
        var dx = currX - lastPt.x;
        var dy = currY - lastPt.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= 35 && (Math.abs(dx) >= 32 || Math.abs(dy) >= 12)) {
          outlinePoints.push({ x: currX, y: currY });
          lastPt = { x: currX, y: currY };
        }
      }
    }

    var outlineDelayStep = 110; // ms per word
    for (var o = 0; o < outlinePoints.length; o++) {
      var opt = outlinePoints[o];
      createHeartWordParticle(hwCenterX + opt.x, hwCenterY + opt.y, true, o * outlineDelayStep);
    }

    hwOutlineEndTime = outlinePoints.length * outlineDelayStep + 400;

    // 2. INTERIOR PARTICLES (Airy brick-grid spacing matching the outline)
    var wordWidth = 72;
    var rowHeight = 25;
    var halfW = 16.5 * scale;
    var minY = -12.5 * scale - yOffset;
    var maxY = 17 * scale - yOffset;

    var interiorTargets = [];
    var row = 0;
    for (var y = minY + 18; y <= maxY - 18; y += rowHeight) {
      var rowOffset = (row % 2 === 0) ? 0 : (wordWidth / 2);
      row++;

      for (var x = -halfW + rowOffset; x <= halfW; x += wordWidth) {
        var jx = (Math.random() - 0.5) * 3;
        var jy = (Math.random() - 0.5) * 2;
        var testX = x + jx;
        var testY = y + jy;

        if (isInsideHeartPolygon(testX, testY, heartPolygon)) {
          var tooCloseToOutline = false;
          for (var k = 0; k < outlinePoints.length; k++) {
            var odx = testX - outlinePoints[k].x;
            var ody = testY - outlinePoints[k].y;
            if (Math.abs(odx) < 40 && Math.abs(ody) < 16) {
              tooCloseToOutline = true;
              break;
            }
          }
          if (!tooCloseToOutline) {
            interiorTargets.push({ x: testX, y: testY });
          }
        }
      }
    }

    // 3. ORDER INTERIOR PARTICLES: Fill smoothly from TOP to BOTTOM
    interiorTargets.sort(function(a, b) { return a.y - b.y; });

    var minYTarget = interiorTargets.length ? Math.min.apply(null, interiorTargets.map(function(it) { return it.y; })) : 0;
    var maxYTarget = interiorTargets.length ? Math.max.apply(null, interiorTargets.map(function(it) { return it.y; })) : 1;
    var yRange = (maxYTarget - minYTarget) || 1;

    for (var idx = 0; idx < interiorTargets.length; idx++) {
      var it = interiorTargets[idx];
      var normalizedY = (it.y - minYTarget) / yRange;
      var delay = hwOutlineEndTime + normalizedY * 4200 + Math.random() * 80;
      createHeartWordParticle(hwCenterX + it.x, hwCenterY + it.y, false, delay);
    }

    hwTotalAnimDuration = hwOutlineEndTime + 4850;
    hwAnimationStartTime = window.APP_STATE.reducedMotion ? (performance.now() - hwTotalAnimDuration) : performance.now();
  }

  function initHeartBackgroundParticles() {
    hwBgParticles = [];
    var count = Math.floor(Math.min(hwWidth, hwHeight) / 10);
    for (var i = 0; i < count; i++) {
      hwBgParticles.push({
        x: Math.random() * hwWidth,
        y: Math.random() * hwHeight,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        speedY: -(Math.random() * 0.3 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function easeOutBackHeart(x) {
    var c1 = 1.35;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function bindHeartCanvasInteractions(heartCanvas) {
    if (hwInteractionsBound || !heartCanvas) return;
    hwInteractionsBound = true;

    heartCanvas.addEventListener("mousemove", function(e) {
      var rect = heartCanvas.getBoundingClientRect();
      hwMouse.x = e.clientX - rect.left;
      hwMouse.y = e.clientY - rect.top;
    });

    heartCanvas.addEventListener("mouseleave", function() {
      hwMouse.x = -1000;
      hwMouse.y = -1000;
    });

    heartCanvas.addEventListener("touchmove", function(e) {
      if (e.touches && e.touches.length > 0) {
        var rect = heartCanvas.getBoundingClientRect();
        hwMouse.x = e.touches[0].clientX - rect.left;
        hwMouse.y = e.touches[0].clientY - rect.top;
      }
    }, { passive: true });

    heartCanvas.addEventListener("touchend", function() {
      hwMouse.x = -1000;
      hwMouse.y = -1000;
    });
  }

  window.restartHeartOfWords = function() {
    var heartCanvas = document.getElementById("heart-words-canvas");
    var bgCanvas = document.getElementById("bgCanvas");
    var stage = document.getElementById("heart-words-stage");
    if (!heartCanvas) return;

    var rect = (stage || heartCanvas).getBoundingClientRect();
    hwWidth = Math.max(320, Math.floor(rect.width || 900));
    hwHeight = Math.max(380, Math.floor(rect.height || 540));
    hwCenterX = hwWidth / 2;
    hwCenterY = hwHeight / 2;

    heartCanvas.width = hwWidth;
    heartCanvas.height = hwHeight;
    if (bgCanvas) {
      bgCanvas.width = hwWidth;
      bgCanvas.height = hwHeight;
    }

    bindHeartCanvasInteractions(heartCanvas);
    initHeartBackgroundParticles();
    initHeartParticles();
  };

  window.fillHeartWordsInstantly = function() {
    hwAnimationStartTime = performance.now() - (hwTotalAnimDuration + 1000);
    var st = document.getElementById("heart-words-status");
    if (st) st.textContent = "Heart complete · Hover to repel words or click to re-bloom ♥";
  };

  window.triggerHeartWordsPulseBoost = function() {
    window.playSoundEffect("click");
    initHeartParticles();
    window.showToast("💖 Re-blooming Heart of Words from the perimeter!");
  };

  function renderHeartOfWordsFrame(currentTime) {
    if (window.APP_STATE.currentScene !== 3) return;
    var heartCanvas = document.getElementById("heart-words-canvas");
    var bgCanvas = document.getElementById("bgCanvas");
    if (!heartCanvas) return;
    if (hwParticles.length === 0) window.restartHeartOfWords();

    // 1. Render Background Starry Canvas (#bgCanvas)
    if (bgCanvas) {
      var bgCtx = bgCanvas.getContext("2d");
      bgCtx.clearRect(0, 0, hwWidth, hwHeight);
      bgCtx.fillStyle = "#000000";
      bgCtx.fillRect(0, 0, hwWidth, hwHeight);

      for (var s = 0; s < hwBgParticles.length; s++) {
        var star = hwBgParticles[s];
        star.y += star.speedY;
        star.x += star.speedX;

        if (star.y < -10) star.y = hwHeight + 10;
        if (star.x < -10) star.x = hwWidth + 10;
        if (star.x > hwWidth + 10) star.x = -10;

        var twinkle = (Math.sin(currentTime * star.twinkleSpeed + star.phase) + 1) * 0.5;
        var currentAlpha = star.alpha * (0.3 + twinkle * 0.7);

        bgCtx.save();
        bgCtx.globalAlpha = currentAlpha;
        bgCtx.beginPath();
        bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        bgCtx.fillStyle = "#ffffff";
        bgCtx.shadowColor = HW_GLOW_COLOR;
        bgCtx.shadowBlur = 4;
        bgCtx.fill();
        bgCtx.restore();
      }
    }

    // 2. Render Main Heart of Words Canvas (#heart-words-canvas)
    var ctx = heartCanvas.getContext("2d");
    ctx.clearRect(0, 0, hwWidth, hwHeight);

    var elapsed = currentTime - hwAnimationStartTime;
    var statusEl = document.getElementById("heart-words-status");
    if (statusEl) {
      if (elapsed < hwOutlineEndTime) {
        statusEl.textContent = "Phase 1 · Tracing heart perimeter one by one…";
      } else if (elapsed < hwTotalAnimDuration) {
        statusEl.textContent = "Phase 2 · Cascading 'I Love You' top to bottom…";
      } else {
        statusEl.textContent = "Heart complete · Hover to repel words or click canvas to re-bloom ♥";
      }
    }

    for (var i = 0; i < hwParticles.length; i++) {
      var p = hwParticles[i];
      if (elapsed < p.delay) continue;

      var pElapsed = elapsed - p.delay;
      var progress = Math.min(1, pElapsed / p.duration);
      var eased = easeOutBackHeart(progress);

      var posX = p.startX + (p.targetX - p.startX) * eased;
      var posY = p.startY + (p.targetY - p.startY) * eased;

      if (progress >= 1) {
        posX = p.targetX;
        posY = p.targetY;
        p.alpha = 1;
      } else {
        p.alpha = Math.min(1, progress * 1.3);
      }

      // Subtle mouse & touch repulsion (exact 100px radius, force up to 20px)
      if (hwMouse.x > 0 && hwMouse.y > 0) {
        var mdx = posX - hwMouse.x;
        var mdy = posY - hwMouse.y;
        var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        var maxEffectDist = 100;

        if (mDist < maxEffectDist && mDist > 0.001) {
          var force = (1 - mDist / maxEffectDist) * 20;
          posX += (mdx / mDist) * force;
          posY += (mdy / mDist) * force;
        }
      }

      p.currX = posX;
      p.currY = posY;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.font = "600 " + p.fontSize + "px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = HW_GLOW_COLOR;
      ctx.shadowBlur = p.glowIntensity;
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, posX, posY);
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // SCENE 4: DATE QUIZ / VERIFICATION
  // -------------------------------------------------------------------------
  window.setQuizPreset = function(isoStr, autoVerify) {
    var parts = isoStr.split("-");
    var y = document.getElementById("quiz-year-select");
    var m = document.getElementById("quiz-month-select");
    var d = document.getElementById("quiz-day-select");
    if (y && parts[0]) y.value = parts[0];
    if (m && parts[1]) m.value = parts[1];
    if (d && parts[2]) d.value = parts[2];
    if (autoVerify) window.checkDateQuizAnswer();
  };

  window.checkDateQuizAnswer = function() {
    var y = (document.getElementById("quiz-year-select") || {}).value || "2022";
    var m = (document.getElementById("quiz-month-select") || {}).value || "02";
    var d = (document.getElementById("quiz-day-select") || {}).value || "14";
    var chosen = y + "-" + m + "-" + d;
    var accepted = (window.LOVE_CONFIG.quiz && window.LOVE_CONFIG.quiz.acceptedDates) || ["2022-02-14"];
    var feedback = document.getElementById("quiz-feedback-msg");
    var card = document.getElementById("quiz-cameo-card");

    if (accepted.indexOf(chosen) !== -1) {
      window.playSoundEffect("unlock");
      triggerHaptic([30, 50, 80]);
      if (feedback) {
        feedback.style.color = "var(--accent-gold)";
        feedback.textContent = "✨ " + window.LOVE_CONFIG.quiz.successMessage;
      }
      window.spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.4, 38);
      window.showToast("🎉 Correct Date! Advancing to Mystery Gift Boxes…");
      setTimeout(function() {
        window.goToScene(5);
      }, 1150);
    } else {
      window.playSoundEffect("wrong");
      triggerHaptic(40);
      var msgs = window.LOVE_CONFIG.quiz.wrongMessages;
      var msg = msgs[Math.floor(Math.random() * msgs.length)];
      if (feedback) {
        feedback.style.color = "var(--accent-rose)";
        feedback.textContent = msg;
      }
      if (card) {
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
      }
      window.showToast(msg);
    }
  };

  // -------------------------------------------------------------------------
  // SCENE 5: MYSTERY GIFT BOXES & RUNAWAY "NO" BUTTON
  // -------------------------------------------------------------------------
  window.openMysteryBox = function(boxNum) {
    var boxEl = document.getElementById("mystery-box-" + boxNum);
    if (boxEl) boxEl.classList.add("opened");
    window.playSoundEffect("unlock");
    triggerHaptic(30);
    window.spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 26);

    if (boxNum === 1) {
      var st1 = document.getElementById("box-1-status");
      if (st1) st1.textContent = "Opened! Showing Golden Hour Polaroid ♥";
      window.openMemoryLightboxByItem(window.LOVE_CONFIG.photos[0]);
    } else if (boxNum === 2) {
      var st2 = document.getElementById("box-2-status");
      if (st2) st2.textContent = "Opened! Playing Super-8 Starlight Reel 🎬";
      window.openVideoReelLightbox(window.LOVE_CONFIG.videos[0]);
    } else {
      var st3 = document.getElementById("box-3-status");
      if (st3) st3.textContent = "Opened! Secret Garden & Rooftop Pass ✨";
      window.openMemoryLightboxByItem({
        id: "voucher-surprise",
        svgPreset: "autumn-lanterns",
        title: "Golden VIP Love Voucher",
        caption: "Redeemable for 1 Midnight Rooftop Picnic & Unlimited Forehead Kisses",
        date: "Valid Forever",
        story: "You unlocked the third mystery box! Click Continue below to jump into our single-line ink story or Living Garden.",
        nextScene: 6
      });
    }
  };

  var runawayCount = 0;
  window.dodgeRunawayNo = function(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var btn = document.getElementById("btn-runaway-no");
    var arena = document.getElementById("runaway-arena-box");
    if (!btn || !arena) return;
    runawayCount++;
    window.playSoundEffect("click");
    var labels = ["Nice try! 😜", "Too slow! 💨", "Nope, click Yes! ♥", "Can't catch me! ✨", "Only Yes allowed 💖"];
    btn.textContent = labels[runawayCount % labels.length];
    var maxX = Math.max(40, arena.clientWidth - 130);
    var maxY = Math.max(20, arena.clientHeight - 55);
    var rx = (Math.random() - 0.5) * maxX * 0.85;
    var ry = (Math.random() - 0.5) * maxY * 0.65;
    btn.style.transform = "translate(" + Math.round(rx) + "px, " + Math.round(ry) + "px)";
  };

  window.acceptRunawayYes = function() {
    window.playSoundEffect("wish");
    triggerHaptic([35, 60, 90]);
    window.spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 45);
    window.showToast("💖 Best answer ever! Moving to Chapter VI: Our Outline Story…");
    setTimeout(function() {
      window.goToScene(6);
    }, 950);
  };

  // -------------------------------------------------------------------------
  // SCENE 6: BOY & GIRL OUTLINE STORY (5 Mini Scenes + Pen Cursor + Sparkles)
  // -------------------------------------------------------------------------
  var OUTLINE_SCENES_DATA = [
    {
      title: "1 / 5 · Sitting on a rooftop at midnight under shooting stars",
      backdrop: '<path class="draw-stroke" d="M 80 350 L 720 350 M 140 350 L 140 295 L 660 295 L 660 350" fill="none" stroke="#f0be72" stroke-width="2"/>' +
                '<circle cx="190" cy="85" r="2.5" fill="#f8edd9"/><circle cx="620" cy="70" r="2.5" fill="#f8edd9"/><circle cx="490" cy="60" r="2" fill="#f8edd9"/>' +
                '<path class="draw-stroke" d="M 650 55 L 540 110" fill="none" stroke="#f0be72" stroke-width="2" stroke-linecap="round"/>',
      boyX: 345, girlX: 455, action: "rooftop"
    },
    {
      title: "2 / 5 · Walking toward each other and holding hands",
      backdrop: '<path class="draw-stroke" d="M 60 360 Q 400 340 740 360" fill="none" stroke="#f0be72" stroke-width="2"/>' +
                '<path class="draw-stroke" d="M 372 268 Q 400 255 428 268" fill="none" stroke="#ff8aa1" stroke-width="3"/>',
      boyX: 350, girlX: 450, action: "hands"
    },
    {
      title: "3 / 5 · He gives her a blooming flower — she blushes and smiles",
      backdrop: '<path class="draw-stroke" d="M 70 360 L 730 360" fill="none" stroke="#f0be72" stroke-width="2"/>' +
                '<g transform="translate(400, 246)"><path class="draw-stroke" d="M 0 28 L 0 4" stroke="#7bd88f" stroke-width="2.5"/><circle cx="0" cy="0" r="8" fill="#ff8aa1" stroke="#f0be72" stroke-width="2"/></g>',
      boyX: 342, girlX: 458, action: "flower"
    },
    {
      title: "4 / 5 · Sharing an umbrella while raindrops turn into tiny hearts",
      backdrop: '<path class="draw-stroke" d="M 285 160 C 285 82 515 82 515 160 Z" fill="rgba(156,196,255,0.12)" stroke="#9cc4ff" stroke-width="2.5"/>' +
                '<path class="draw-stroke" d="M 400 160 L 400 285 C 400 300 385 300 385 290" fill="none" stroke="#f0be72" stroke-width="2.5"/>' +
                '<path class="draw-stroke" d="M 220 360 C 220 353 212 349 212 345 C 212 342 217 340 220 344 C 223 340 228 342 228 345 C 228 349 220 353 220 360 Z" fill="#ff8aa1"/>' +
                '<path class="draw-stroke" d="M 580 360 C 580 353 572 349 572 345 C 572 342 577 340 580 344 C 583 340 588 342 588 345 C 588 349 580 353 580 360 Z" fill="#ff8aa1"/>',
      boyX: 362, girlX: 438, action: "umbrella"
    },
    {
      title: "5 / 5 · Swaying under a heart-shaped moon filled with warm light",
      backdrop: '<path class="draw-stroke" d="M 400 112 C 400 112 356 80 356 54 C 356 36 372 26 386 26 C 394 26 400 33 400 40 C 400 33 406 26 414 26 C 428 26 444 36 444 54 C 444 80 400 112 400 112 Z" fill="rgba(240,190,114,0.28)" stroke="#f0be72" stroke-width="2.5"/>' +
                '<path class="draw-stroke" d="M 60 360 Q 400 338 740 360" fill="none" stroke="#f0be72" stroke-width="2"/>',
      boyX: 366, girlX: 434, action: "moon"
    }
  ];

  function buildCharacterSVG(isBoy, x, isColorFilled) {
    var cfg = window.LOVE_CONFIG.characters || {};
    var strokeCol = isBoy ? (cfg.boyColor || "#9cc4ff") : (cfg.girlColor || "#ff8aa1");
    var fillOpacity = isColorFilled ? "0.28" : "0.04";
    if (isBoy) {
      return (
        '<g transform="translate(' + x + ', 255)">' +
        '<circle class="draw-stroke" cx="0" cy="-48" r="22" fill="rgba(156,196,255,' + fillOpacity + ')" stroke="' + strokeCol + '" stroke-width="2.4"/>' +
        '<path class="draw-stroke" d="M -18 -58 Q 0 -74 20 -56" fill="none" stroke="' + strokeCol + '" stroke-width="2.4"/>' +
        '<circle cx="-6" cy="-50" r="2" fill="#f8edd9"/><circle cx="7" cy="-50" r="2" fill="#f8edd9"/>' +
        '<path d="M -5 -41 Q 2 -36 8 -41" fill="none" stroke="#f8edd9" stroke-width="1.8"/>' +
        '<path class="draw-stroke" d="M -22 35 C -22 -12 22 -12 22 35 Z" fill="rgba(156,196,255,' + fillOpacity + ')" stroke="' + strokeCol + '" stroke-width="2.4"/>' +
        '<path class="draw-stroke" d="M -10 35 L -12 92 M 10 35 L 12 92" stroke="' + strokeCol + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path class="draw-stroke" d="M 14 -6 L 42 12" stroke="' + strokeCol + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '</g>'
      );
    } else {
      return (
        '<g transform="translate(' + x + ', 258)">' +
        '<circle class="draw-stroke" cx="0" cy="-46" r="21" fill="rgba(255,138,161,' + fillOpacity + ')" stroke="' + strokeCol + '" stroke-width="2.4"/>' +
        '<path class="draw-stroke" d="M -21 -50 C -26 -20 -18 5 -12 12 M 21 -50 C 28 -18 24 8 16 14" fill="none" stroke="' + strokeCol + '" stroke-width="2.2"/>' +
        '<circle cx="-7" cy="-48" r="2" fill="#f8edd9"/><circle cx="6" cy="-48" r="2" fill="#f8edd9"/>' +
        '<circle cx="-11" cy="-42" r="4" fill="rgba(255,138,161,0.55)"/><circle cx="10" cy="-42" r="4" fill="rgba(255,138,161,0.55)"/>' +
        '<path d="M -6 -39 Q 0 -33 6 -39" fill="none" stroke="#f8edd9" stroke-width="1.8"/>' +
        '<path class="draw-stroke" d="M -26 42 C -18 -10 18 -10 26 42 Z" fill="rgba(255,138,161,' + fillOpacity + ')" stroke="' + strokeCol + '" stroke-width="2.4"/>' +
        '<path class="draw-stroke" d="M -8 42 L -10 90 M 8 42 L 10 90" stroke="' + strokeCol + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path class="draw-stroke" d="M -14 -4 L -38 10" stroke="' + strokeCol + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '</g>'
      );
    }
  }

  window.selectOutlineMiniScene = function(idx) {
    var i = ((idx % 5) + 5) % 5;
    window.APP_STATE.outlineMiniScene = i;
    window.APP_STATE.outlineDrawProgress = window.APP_STATE.reducedMotion ? 1 : 0;

    for (var b = 0; b < 5; b++) {
      var btn = document.getElementById("story-step-btn-" + b);
      if (btn) btn.classList.toggle("active-toggle", b === i);
    }

    var data = OUTLINE_SCENES_DATA[i];
    var backdrop = document.getElementById("outline-scene-backdrop");
    var boyG = document.getElementById("outline-boy-group");
    var girlG = document.getElementById("outline-girl-group");
    var warmBg = document.getElementById("outline-warm-bg");
    var cap = document.getElementById("outline-caption-text");

    if (backdrop) backdrop.innerHTML = data.backdrop;
    if (boyG) boyG.innerHTML = buildCharacterSVG(true, data.boyX, i === 4);
    if (girlG) girlG.innerHTML = buildCharacterSVG(false, data.girlX, i === 4);
    if (warmBg) warmBg.setAttribute("opacity", i === 4 ? "1" : "0.18");
    if (cap) cap.textContent = data.title;

    // Prepare stroke-dashoffset for pen drawing
    var paths = document.querySelectorAll("#outline-story-svg .draw-stroke");
    paths.forEach(function(p) {
      var len = 320;
      try { if (p.getTotalLength) len = p.getTotalLength(); } catch (e) {}
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = window.APP_STATE.reducedMotion ? "0" : String(len);
    });
  };

  window.replayCurrentOutlineScene = function() {
    window.selectOutlineMiniScene(window.APP_STATE.outlineMiniScene);
  };

  window.toggleOutlineAutoplay = function() {
    window.APP_STATE.outlineAutoplay = !window.APP_STATE.outlineAutoplay;
    var btn = document.getElementById("btn-outline-autoplay");
    if (btn) btn.textContent = window.APP_STATE.outlineAutoplay ? "⏸ Auto" : "▶ Auto";
  };

  window.advanceOutlineOrNextScene = function() {
    window.playSoundEffect("click");
    if (window.APP_STATE.outlineMiniScene < 4) {
      window.selectOutlineMiniScene(window.APP_STATE.outlineMiniScene + 1);
    } else {
      window.goToScene(7);
    }
  };

  window.triggerCharacterReaction = function(who) {
    window.playSoundEffect("wish");
    triggerHaptic(20);
    var boyName = (window.LOVE_CONFIG.characters && window.LOVE_CONFIG.characters.boyName) || "Julian";
    var girlName = (window.LOVE_CONFIG.characters && window.LOVE_CONFIG.characters.girlName) || "Elena";
    if (who === "boy") {
      window.showToast("😊 " + boyName + " blushes and sends a flurry of hearts!");
    } else {
      window.showToast("👋 " + girlName + " waves happily with sparkling eyes!");
    }
    window.spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.48, 22);
  };

  function renderOutlineStoryFrame(time) {
    if (window.APP_STATE.currentScene !== 6) return;
    var canvas = document.getElementById("outline-sparkle-canvas");
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    if (canvas.width !== Math.floor(rect.width)) {
      canvas.width = Math.floor(rect.width || 800);
      canvas.height = Math.floor(rect.height || 420);
    }
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Progress stroke drawing
    if (window.APP_STATE.outlineDrawProgress < 1) {
      window.APP_STATE.outlineDrawProgress = Math.min(1, window.APP_STATE.outlineDrawProgress + 0.012);
      var paths = document.querySelectorAll("#outline-story-svg .draw-stroke");
      paths.forEach(function(p) {
        var len = parseFloat(p.style.strokeDasharray) || 320;
        p.style.strokeDashoffset = String(len * (1 - window.APP_STATE.outlineDrawProgress));
      });

      // Pen-tip cursor coordinates & sparkle emission
      var penX = canvas.width * (0.2 + 0.6 * window.APP_STATE.outlineDrawProgress);
      var penY = canvas.height * (0.45 + 0.18 * Math.sin(window.APP_STATE.outlineDrawProgress * Math.PI * 4));
      ctx.fillStyle = "#f0be72";
      ctx.beginPath();
      ctx.arc(penX, penY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f8edd9";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(penX, penY);
      ctx.lineTo(penX + 14, penY - 16);
      ctx.stroke();

      window.APP_STATE.outlineSparkles.push({
        x: penX,
        y: penY,
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.6 + 0.4,
        alpha: 1
      });
    } else if (window.APP_STATE.outlineAutoplay && !window.APP_STATE.reducedMotion) {
      if (!window.APP_STATE._lastOutlineStepTime) window.APP_STATE._lastOutlineStepTime = time;
      if (time - window.APP_STATE._lastOutlineStepTime > 4800) {
        window.APP_STATE._lastOutlineStepTime = time;
        window.selectOutlineMiniScene((window.APP_STATE.outlineMiniScene + 1) % 5);
      }
    }

    // Idle breathing & pulsing heart
    var breathY = Math.sin(time * 0.004) * 2.5;
    var boyG = document.getElementById("outline-boy-group");
    var girlG = document.getElementById("outline-girl-group");
    var heartG = document.getElementById("outline-center-heart");
    if (boyG) boyG.style.transform = "translate(" + window.APP_STATE.outlineTiltX + "px, " + breathY.toFixed(1) + "px)";
    if (girlG) girlG.style.transform = "translate(" + window.APP_STATE.outlineTiltX + "px, " + (-breathY).toFixed(1) + "px)";
    if (heartG) {
      var hs = 1 + 0.12 * Math.sin(time * 0.008);
      heartG.style.transformOrigin = "400px 190px";
      heartG.style.transform = "scale(" + hs.toFixed(3) + ")";
    }

    // Draw sparkles
    for (var i = window.APP_STATE.outlineSparkles.length - 1; i >= 0; i--) {
      var sp = window.APP_STATE.outlineSparkles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= 0.03;
      if (sp.alpha <= 0) {
        window.APP_STATE.outlineSparkles.splice(i, 1);
      } else {
        ctx.fillStyle = "rgba(240, 190, 114, " + sp.alpha.toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // -------------------------------------------------------------------------
  // SCENE 7: A LIVING GARDEN (Procedural Meadow + Wind + Ambience + Bouquet)
  // -------------------------------------------------------------------------
  function createGardenFlower(x, y, w, h, forcedType) {
    var types = ["rose", "tulip", "sunflower", "lotus", "daisy", "wildflower"];
    var t = forcedType || types[Math.floor(Math.random() * types.length)];
    var colors = {
      rose: "#ff5c7c",
      tulip: "#ff8aa1",
      sunflower: "#f7c844",
      lotus: "#e298ff",
      daisy: "#f8edd9",
      wildflower: "#7cc6fe"
    };
    return {
      x: x,
      baseY: y || (h * (0.72 + Math.random() * 0.25)),
      stemHeight: 55 + Math.random() * 75,
      type: t,
      color: colors[t] || "#ff8aa1",
      growProgress: window.APP_STATE.reducedMotion ? 1 : 0.05,
      swayOffset: Math.random() * Math.PI * 2,
      bendAngle: 0
    };
  }

  function resizeAndInitGarden() {
    var canvas = document.getElementById("living-garden-canvas");
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    var w = Math.floor(rect.width || 900);
    var h = Math.floor(rect.height || 440);
    canvas.width = w;
    canvas.height = h;

    if (window.APP_STATE.gardenFlowers.length === 0) {
      for (var i = 0; i < 32; i++) {
        window.APP_STATE.gardenFlowers.push(
          createGardenFlower((i / 32) * (w - 40) + 20 + (Math.random() - 0.5) * 18, null, w, h)
        );
      }
      for (var f = 0; f < 22; f++) {
        window.APP_STATE.gardenFireflies.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.8,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.6,
          phase: Math.random() * Math.PI * 2
        });
      }
      for (var b = 0; b < 3; b++) {
        window.APP_STATE.gardenButterflies.push({
          x: w * (0.25 + b * 0.25),
          y: h * 0.4,
          color: b === 0 ? "#ff8aa1" : (b === 1 ? "#f0be72" : "#9cc4ff")
        });
      }
      updateGardenCountLabel();
    }
  }

  function updateGardenCountLabel() {
    var el = document.getElementById("garden-flower-count");
    if (el) {
      el.textContent = "Blooms: " + window.APP_STATE.gardenFlowers.length + " · Tap to plant · Long-press for bouquet · Drag to brush";
    }
  }

  window.setGardenTimeOfDay = function(mode) {
    window.APP_STATE.gardenTime = mode;
    ["day", "dusk", "midnight"].forEach(function(m) {
      var btn = document.getElementById("garden-sky-" + m);
      if (btn) btn.classList.toggle("active-toggle", m === mode);
    });
    window.showToast("Garden sky set to " + mode.toUpperCase());
  };

  window.plantRandomBouquetBurst = function(customX, customY) {
    var canvas = document.getElementById("living-garden-canvas");
    if (!canvas) return;
    var cx = customX || canvas.width * (0.25 + Math.random() * 0.5);
    var cy = customY || canvas.height * 0.82;
    for (var i = 0; i < 6; i++) {
      window.APP_STATE.gardenFlowers.push(
        createGardenFlower(cx + (i - 2.5) * 14, cy + (Math.random() - 0.5) * 10, canvas.width, canvas.height)
      );
    }
    window.playSoundEffect("wish");
    triggerHaptic(25);
    updateGardenCountLabel();
    window.showToast("🌸 Planted a blooming bouquet in the meadow!");
  };

  window.toggleGardenAmbience = function() {
    var btn = document.getElementById("btn-garden-audio");
    if (window.APP_STATE.gardenAmbiencePlaying) {
      window.APP_STATE.gardenAmbiencePlaying = false;
      if (window.APP_STATE.gardenAmbienceNodes) {
        try { window.APP_STATE.gardenAmbienceNodes.osc1.stop(); } catch (e) {}
        try { window.APP_STATE.gardenAmbienceNodes.osc2.stop(); } catch (e) {}
        window.APP_STATE.gardenAmbienceNodes = null;
      }
      if (btn) btn.classList.remove("active-toggle");
      window.showToast("🎐 Garden ambient audio paused");
      return;
    }
    var ctx = getAudioContext();
    if (!ctx) {
      window.showToast("🔇 Unmute sound first to hear garden ambience");
      return;
    }
    try {
      var osc1 = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var gain = ctx.createGain();
      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(220, ctx.currentTime);
      osc2.frequency.setValueAtTime(329.63, ctx.currentTime);
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      window.APP_STATE.gardenAmbienceNodes = { osc1: osc1, osc2: osc2, gain: gain };
      window.APP_STATE.gardenAmbiencePlaying = true;
      if (btn) btn.classList.add("active-toggle");
      window.showToast("🎐 Soft Web Audio garden ambience playing");
    } catch (e) {}
  };

  function drawFlowerHead(ctx, type, x, y, r, color, openRatio) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(openRatio, openRatio);
    var petalCount = type === "sunflower" ? 12 : (type === "daisy" ? 10 : 6);
    ctx.fillStyle = color;
    for (var i = 0; i < petalCount; i++) {
      ctx.save();
      ctx.rotate((i / petalCount) * Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.65, r * 0.36, r * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = type === "sunflower" ? "#3b2314" : "#f0be72";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function renderLivingGardenFrame(time) {
    if (window.APP_STATE.currentScene !== 7) return;
    var canvas = document.getElementById("living-garden-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    if (!w || !h) return;

    // Sky palette by time of day
    var mode = window.APP_STATE.gardenTime || "dusk";
    var skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (mode === "day") {
      skyGrad.addColorStop(0, "#4a8fe7");
      skyGrad.addColorStop(0.65, "#a8d8ff");
      skyGrad.addColorStop(1, "#18392b");
    } else if (mode === "dusk") {
      skyGrad.addColorStop(0, "#1b1947");
      skyGrad.addColorStop(0.55, "#b5547d");
      skyGrad.addColorStop(0.8, "#f0be72");
      skyGrad.addColorStop(1, "#12261e");
    } else {
      skyGrad.addColorStop(0, "#030612");
      skyGrad.addColorStop(0.65, "#0d1836");
      skyGrad.addColorStop(1, "#081712");
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Sun or Moon orb
    ctx.fillStyle = mode === "day" ? "#fff5cc" : (mode === "dusk" ? "#ffcf75" : "#f8edd9");
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.22, mode === "dusk" ? 34 : 24, 0, Math.PI * 2);
    ctx.fill();

    // Parallax hills
    ctx.fillStyle = mode === "day" ? "#1e4d38" : "#0d241c";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.quadraticCurveTo(w * 0.3, h * 0.58, w * 0.65, h * 0.70);
    ctx.quadraticCurveTo(w * 0.85, h * 0.76, w, h * 0.66);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Decay wind back toward gentle breeze
    window.APP_STATE.gardenWind += (window.APP_STATE.gardenTargetWind - window.APP_STATE.gardenWind) * 0.08;
    window.APP_STATE.gardenTargetWind *= 0.94;

    // Draw procedural flowers
    window.APP_STATE.gardenFlowers.forEach(function(fl) {
      if (fl.growProgress < 1) fl.growProgress = Math.min(1, fl.growProgress + 0.025);
      fl.bendAngle *= 0.92;
      var sway = Math.sin(time * 0.0025 + fl.swayOffset) * 8 + window.APP_STATE.gardenWind * 18 + fl.bendAngle;
      var curH = fl.stemHeight * fl.growProgress;
      var tipX = fl.x + sway;
      var tipY = fl.baseY - curH;

      // Stem
      ctx.strokeStyle = "#4ca86b";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(fl.x, fl.baseY);
      ctx.quadraticCurveTo(fl.x + sway * 0.4, fl.baseY - curH * 0.5, tipX, tipY);
      ctx.stroke();

      // Leaves
      if (fl.growProgress > 0.4) {
        ctx.fillStyle = "#5ec27e";
        ctx.beginPath();
        ctx.ellipse(fl.x + sway * 0.3 - 6, fl.baseY - curH * 0.45, 7, 3.2, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flower petals
      if (fl.growProgress > 0.55) {
        var openRatio = (fl.growProgress - 0.55) / 0.45;
        drawFlowerHead(ctx, fl.type, tipX, tipY, 12, fl.color, openRatio);
      }
    });

    // Fireflies / Dust particles
    window.APP_STATE.gardenFireflies.forEach(function(ff) {
      ff.x = (ff.x + ff.vx + w) % w;
      ff.y = (ff.y + ff.vy + h * 0.85) % (h * 0.85);
      var glow = 0.35 + 0.6 * Math.sin(time * 0.005 + ff.phase);
      ctx.fillStyle = "rgba(240, 190, 114, " + glow.toFixed(2) + ")";
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Cursor-following butterflies
    window.APP_STATE.gardenButterflies.forEach(function(bf, idx) {
      var rect = canvas.getBoundingClientRect();
      var tx = (window.APP_STATE.pointerX - rect.left) || w * 0.5;
      var ty = (window.APP_STATE.pointerY - rect.top) || h * 0.4;
      bf.x += (tx + (idx - 1) * 36 - bf.x) * 0.03;
      bf.y += (ty + Math.sin(time * 0.004 + idx) * 24 - bf.y) * 0.03;
      var wing = Math.abs(Math.sin(time * 0.015 + idx)) * 7 + 2;
      ctx.fillStyle = bf.color;
      ctx.beginPath();
      ctx.ellipse(bf.x - 4, bf.y, wing, 5, 0.3, 0, Math.PI * 2);
      ctx.ellipse(bf.x + 4, bf.y, wing, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Bouquet Builder Mini-Game
  function renderBouquetCanvas(canvasId) {
    var c = document.getElementById(canvasId);
    if (!c) return;
    var ctx = c.getContext("2d");
    var w = c.width;
    var h = c.height;
    ctx.clearRect(0, 0, w, h);

    var cx = w / 2;
    var cy = h * 0.56;

    // Kraft paper cone wrapper
    ctx.fillStyle = "#e6ccb2";
    ctx.strokeStyle = "#b08968";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 68, cy - 22);
    ctx.lineTo(cx + 68, cy - 22);
    ctx.lineTo(cx + 16, cy + 88);
    ctx.lineTo(cx - 16, cy + 88);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stems & blooms
    var colorMap = { rose: "#ff5c7c", tulip: "#ff8aa1", sunflower: "#f7c844", lotus: "#e298ff", daisy: "#f8edd9" };
    window.APP_STATE.bouquetStems.forEach(function(st) {
      var bx = cx + st.x * (w / 360);
      var by = cy - 42 + st.y * (h / 260);
      ctx.strokeStyle = "#4ca86b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 45);
      ctx.lineTo(bx, by);
      ctx.stroke();
      drawFlowerHead(ctx, st.type, bx, by, 15 * (st.scale || 1), colorMap[st.type] || "#ff8aa1", 1);
    });

    // Satin ribbon bow
    ctx.fillStyle = window.APP_STATE.bouquetRibbonColor || "#ff8aa1";
    ctx.beginPath();
    ctx.ellipse(cx - 18, cy + 36, 16, 9, -0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + 18, cy + 36, 16, 9, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0be72";
    ctx.beginPath();
    ctx.arc(cx, cy + 36, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function renderMiniBouquetOnLetter() {
    renderBouquetCanvas("letter-mini-bouquet-canvas");
  }

  window.openBouquetBuilderModal = function() {
    var m = document.getElementById("bouquet-builder-modal");
    if (m) m.classList.add("open");
    renderBouquetCanvas("bouquet-preview-canvas");
  };
  window.closeBouquetBuilderModal = function() {
    var m = document.getElementById("bouquet-builder-modal");
    if (m) m.classList.remove("open");
  };
  window.addFlowerToBouquet = function(type) {
    window.playSoundEffect("click");
    window.APP_STATE.bouquetStems.push({
      type: type,
      x: (Math.random() - 0.5) * 96,
      y: (Math.random() - 0.5) * 44 - 10,
      scale: 0.9 + Math.random() * 0.25
    });
    renderBouquetCanvas("bouquet-preview-canvas");
    renderMiniBouquetOnLetter();
  };
  window.clearCustomBouquet = function() {
    window.APP_STATE.bouquetStems = [];
    renderBouquetCanvas("bouquet-preview-canvas");
    renderMiniBouquetOnLetter();
  };
  window.setBouquetRibbon = function(col) {
    window.APP_STATE.bouquetRibbonColor = col;
    renderBouquetCanvas("bouquet-preview-canvas");
    renderMiniBouquetOnLetter();
  };
  window.downloadBouquetPNG = function() {
    var c = document.getElementById("bouquet-preview-canvas");
    if (!c) return;
    try {
      var link = document.createElement("a");
      link.download = "custom-love-bouquet.png";
      link.href = c.toDataURL("image/png");
      link.click();
      window.showToast("💐 Downloaded custom bouquet PNG!");
    } catch (e) {
      window.showToast("💐 Bouquet saved to your Love Letter!");
    }
  };
  window.attachBouquetToLetter = function() {
    renderMiniBouquetOnLetter();
    window.closeBouquetBuilderModal();
    window.showToast("💌 Bouquet tucked inside your Love Letter (Scene 12)!");
    window.goToScene(12);
  };

  // -------------------------------------------------------------------------
  // SCENE 8: 3D MEMORY SPACE (Three.js Hero + Memory Wall + Clothesline + Board)
  // -------------------------------------------------------------------------
  var threeInitialized = false;
  var fallback3DShapes = [];

  function initOrResizeThreeHero() {
    var container = document.getElementById("three-memory-hero");
    var canvas = document.getElementById("three-hero-canvas");
    if (!container || !canvas) return;
    var w = container.clientWidth || 860;
    var h = container.clientHeight || 270;

    if (window.THREE && !threeInitialized) {
      try {
        var scene = new window.THREE.Scene();
        var camera = new window.THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
        camera.position.z = 22;

        var renderer = new window.THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        var ambLight = new window.THREE.AmbientLight(0xf8edd9, 0.75);
        scene.add(ambLight);
        var ptLight1 = new window.THREE.PointLight(0xff8aa1, 1.4, 60);
        ptLight1.position.set(12, 10, 14);
        scene.add(ptLight1);
        var ptLight2 = new window.THREE.PointLight(0xf0be72, 1.2, 60);
        ptLight2.position.set(-12, -8, 12);
        scene.add(ptLight2);

        // Extruded 3D Heart Shape
        var heartShape = new window.THREE.Shape();
        heartShape.moveTo(0, 0.6);
        heartShape.bezierCurveTo(0, 1.2, -1.1, 1.5, -1.5, 0.7);
        heartShape.bezierCurveTo(-1.9, -0.2, -0.8, -1.1, 0, -1.7);
        heartShape.bezierCurveTo(0.8, -1.1, 1.9, -0.2, 1.5, 0.7);
        heartShape.bezierCurveTo(1.1, 1.5, 0, 1.2, 0, 0.6);
        var extrudeGeo = new window.THREE.ExtrudeGeometry(heartShape, {
          depth: 0.4, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.15, bevelThickness: 0.15
        });
        var torusGeo = new window.THREE.TorusGeometry(1.15, 0.24, 16, 48);
        var sphereGeo = new window.THREE.SphereGeometry(0.95, 24, 24);

        var meshes = [];
        for (var i = 0; i < 15; i++) {
          var kind = i % 3 === 0 ? "hearts" : (i % 3 === 1 ? "rings" : "orbs");
          var geo = kind === "hearts" ? extrudeGeo : (kind === "rings" ? torusGeo : sphereGeo);
          var mat = new window.THREE.MeshStandardMaterial({
            color: kind === "hearts" ? 0xff8aa1 : (kind === "rings" ? 0xf0be72 : 0xc8b6ff),
            roughness: 0.28,
            metalness: 0.45
          });
          var mesh = new window.THREE.Mesh(geo, mat);
          mesh.position.set((Math.random() - 0.5) * 28, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8);
          mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
          mesh.userData = {
            kind: kind,
            baseY: mesh.position.y,
            speed: 0.008 + Math.random() * 0.012,
            phase: Math.random() * Math.PI * 2
          };
          scene.add(mesh);
          meshes.push(mesh);
        }

        window.APP_STATE.threeScene = scene;
        window.APP_STATE.threeCamera = camera;
        window.APP_STATE.threeRenderer = renderer;
        window.APP_STATE.threeMeshes = meshes;
        threeInitialized = true;
        return;
      } catch (e) {}
    }

    if (threeInitialized && window.APP_STATE.threeRenderer && window.APP_STATE.threeCamera) {
      window.APP_STATE.threeCamera.aspect = w / h;
      window.APP_STATE.threeCamera.updateProjectionMatrix();
      window.APP_STATE.threeRenderer.setSize(w, h);
    } else {
      // Graceful 2D Canvas fallback if WebGL is unavailable
      canvas.width = w;
      canvas.height = h;
      if (fallback3DShapes.length === 0) {
        for (var k = 0; k < 16; k++) {
          fallback3DShapes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 14 + Math.random() * 14,
            kind: k % 3 === 0 ? "hearts" : (k % 3 === 1 ? "rings" : "orbs"),
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }
  }

  window.cycle3DShapeFilter = function() {
    var filters = ["all", "hearts", "orbs", "rings"];
    window.APP_STATE.shapeFilterIndex = (window.APP_STATE.shapeFilterIndex + 1) % filters.length;
    var active = filters[window.APP_STATE.shapeFilterIndex];
    window.LOVE_CONFIG.theme.shape3DType = active;
    if (window.APP_STATE.threeMeshes) {
      window.APP_STATE.threeMeshes.forEach(function(m) {
        m.visible = active === "all" || m.userData.kind === active;
      });
    }
    window.showToast("✦ 3D Shape Filter: " + active.toUpperCase());
  };

  function renderThreeHeroFrame(time) {
    if (window.APP_STATE.currentScene !== 8) return;
    if (threeInitialized && window.APP_STATE.threeRenderer) {
      var mx = (window.APP_STATE.pointerX / window.innerWidth - 0.5) * 4;
      var my = -(window.APP_STATE.pointerY / window.innerHeight - 0.5) * 2.5;
      window.APP_STATE.threeCamera.position.x += (mx - window.APP_STATE.threeCamera.position.x) * 0.05;
      window.APP_STATE.threeCamera.position.y += (my - window.APP_STATE.threeCamera.position.y) * 0.05;
      window.APP_STATE.threeCamera.lookAt(0, 0, 0);

      window.APP_STATE.threeMeshes.forEach(function(m) {
        m.rotation.y += m.userData.speed;
        m.rotation.x += m.userData.speed * 0.6;
        m.position.y = m.userData.baseY + Math.sin(time * 0.002 + m.userData.phase) * 0.65;
      });
      window.APP_STATE.threeRenderer.render(window.APP_STATE.threeScene, window.APP_STATE.threeCamera);
    } else {
      var canvas = document.getElementById("three-hero-canvas");
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var w = canvas.width || 800;
      var h = canvas.height || 270;
      ctx.clearRect(0, 0, w, h);
      var active = window.LOVE_CONFIG.theme.shape3DType || "all";
      fallback3DShapes.forEach(function(s) {
        if (active !== "all" && s.kind !== active) return;
        var y = s.y + Math.sin(time * 0.0025 + s.phase) * 12;
        ctx.save();
        ctx.translate(s.x, y);
        ctx.fillStyle = s.kind === "hearts" ? "#ff8aa1" : (s.kind === "rings" ? "#f0be72" : "#c8b6ff");
        ctx.beginPath();
        ctx.arc(0, 0, s.r, 0, Math.PI * 2);
        if (s.kind === "rings") {
          ctx.strokeStyle = "#f0be72";
          ctx.lineWidth = 4;
          ctx.stroke();
        } else {
          ctx.fill();
        }
        ctx.restore();
      });
    }
  }

  window.renderMemoryWallAndClothesline = function() {
    var wall = document.getElementById("editorial-memory-wall");
    var line = document.getElementById("polaroid-clothesline-row");
    var board = document.getElementById("fullscreen-board-grid");
    var photos = (window.LOVE_CONFIG && window.LOVE_CONFIG.photos) || [];

    function buildCardHTML(p, idx) {
      var imgSrc = window.getPhotoSrc(p);
      return (
        '<article class="memory-card" data-editable-media="photo-' + idx + '" tabindex="0" role="button" aria-label="' + p.title + '">' +
        '<div class="scrapbook-tape"></div>' +
        '<div class="memory-card-media">' +
        '<img src="' + imgSrc + '" alt="' + p.caption + '" loading="lazy" />' +
        '</div>' +
        '<div style="padding:1rem 1.1rem;">' +
        '<span class="eyebrow">' + p.date + ' · SCENE ' + (p.nextScene || 9) + ' →</span>' +
        '<h3 style="font-family:var(--font-serif);font-size:1.38rem;margin:0.2rem 0;">' + p.title + '</h3>' +
        '<p style="font-size:0.86rem;color:var(--text-secondary);">' + p.caption + '</p>' +
        '</div>' +
        '</article>'
      );
    }

    if (wall) {
      wall.innerHTML = photos.map(buildCardHTML).join("");
      Array.from(wall.querySelectorAll(".memory-card")).forEach(function(card, idx) {
        card.addEventListener("click", function() {
          if (window.APP_STATE.editMode) {
            window.triggerMediaUploadForTarget({ type: "photo", index: idx });
          } else {
            window.openMemoryLightboxByItem(photos[idx], idx);
          }
        });
        setupCardDragAndDrop(card, idx);
      });
    }

    if (board) {
      board.innerHTML = photos.map(buildCardHTML).join("");
      Array.from(board.querySelectorAll(".memory-card")).forEach(function(card, idx) {
        card.addEventListener("click", function() {
          window.closeFullscreenMemoriesBoard();
          window.openMemoryLightboxByItem(photos[idx], idx);
        });
      });
    }

    if (line) {
      line.innerHTML = photos.map(function(p, idx) {
        var imgSrc = window.getPhotoSrc(p);
        var tiltClass = p.tilt || (idx % 3 === 0 ? "tilt-left" : (idx % 3 === 1 ? "tilt-right" : "straight"));
        return (
          '<div class="polaroid-item ' + tiltClass + '" data-editable-media="polaroid-' + idx + '" role="button" tabindex="0" aria-label="Polaroid: ' + p.caption + '">' +
          '<div class="wooden-peg"></div>' +
          '<img src="' + imgSrc + '" alt="' + p.caption + '" loading="lazy" />' +
          '<div class="polaroid-caption">' + p.caption + '</div>' +
          '</div>'
        );
      }).join("");
      Array.from(line.querySelectorAll(".polaroid-item")).forEach(function(pol, idx) {
        pol.addEventListener("click", function() {
          if (window.APP_STATE.editMode) {
            window.triggerMediaUploadForTarget({ type: "photo", index: idx });
          } else {
            window.openMemoryLightboxByItem(photos[idx], idx);
          }
        });
        setupCardDragAndDrop(pol, idx);
      });
    }
  };

  window.openFullscreenMemoriesBoard = function() {
    window.renderMemoryWallAndClothesline();
    var m = document.getElementById("memories-board-modal");
    if (m) m.classList.add("open");
  };
  window.closeFullscreenMemoriesBoard = function() {
    var m = document.getElementById("memories-board-modal");
    if (m) m.classList.remove("open");
  };

  window.addNewMemoryCardPrompt = function() {
    var newIdx = window.LOVE_CONFIG.photos.length + 1;
    var newPhoto = {
      id: "photo-" + newIdx,
      src: "",
      svgPreset: "midnight-stargaze",
      title: "New Keepsake Memory #" + newIdx,
      caption: "A new keepsake memory",
      date: "Special Day",
      story: "A brand-new slot added to our scrapbook.",
      tilt: newIdx % 2 === 0 ? "tilt-left" : "tilt-right",
      size: "square",
      nextScene: 12
    };
    window.LOVE_CONFIG.photos.push(newPhoto);
    window.renderMemoryWallAndClothesline();
    window.showToast("✨ Added new memory card & polaroid! Click to customize.");
  };

  // -------------------------------------------------------------------------
  // LIGHTBOX & 3D FLIP-OPEN MODAL WITH GROWING VINES & NEXTSCENE ROUTING
  // -------------------------------------------------------------------------
  var reelAnimId = null;
  window.openMemoryLightboxByItem = function(item, photoIndex) {
    if (!item) return;
    window.playSoundEffect("click");
    window.APP_STATE.activeLightboxItem = { item: item, photoIndex: photoIndex };

    var modal = document.getElementById("memory-lightbox-modal");
    var img = document.getElementById("lightbox-img");
    var reelCanvas = document.getElementById("lightbox-reel-canvas");
    var dateBadge = document.getElementById("lightbox-date-badge");
    var titleEl = document.getElementById("lightbox-title");
    var capEl = document.getElementById("lightbox-caption");
    var storyEl = document.getElementById("lightbox-story");
    var contBtn = document.getElementById("lightbox-continue-btn");

    if (reelCanvas) reelCanvas.style.display = "none";
    if (img) {
      img.style.display = "block";
      img.src = window.getPhotoSrc(item);
      img.alt = item.caption || item.title || "Memory photo";
    }
    if (dateBadge) dateBadge.textContent = item.date || "OUR MOMENT";
    if (titleEl) titleEl.textContent = item.title || "Little Moment";
    if (capEl) capEl.textContent = item.caption || "";
    if (storyEl) storyEl.textContent = item.story || "";
    if (contBtn) {
      var target = item.nextScene || 9;
      contBtn.textContent = "Continue to Scene " + target + " →";
    }

    if (modal) modal.classList.add("open");

    // Animate growing vines around the opened photo
    var vLeft = document.getElementById("vine-path-left");
    var vRight = document.getElementById("vine-path-right");
    [vLeft, vRight].forEach(function(v) {
      if (!v) return;
      v.style.transition = "none";
      v.style.strokeDashoffset = "520";
      setTimeout(function() {
        v.style.transition = "stroke-dashoffset 1.35s cubic-bezier(0.22, 1, 0.36, 1)";
        v.style.strokeDashoffset = "0";
      }, 60);
    });
  };

  window.openVideoReelLightbox = function(videoObj) {
    if (!videoObj) return;
    window.playSoundEffect("unlock");
    window.APP_STATE.activeLightboxItem = { item: videoObj, isVideo: true };
    var modal = document.getElementById("memory-lightbox-modal");
    var img = document.getElementById("lightbox-img");
    var reelCanvas = document.getElementById("lightbox-reel-canvas");
    var dateBadge = document.getElementById("lightbox-date-badge");
    var titleEl = document.getElementById("lightbox-title");
    var capEl = document.getElementById("lightbox-caption");
    var storyEl = document.getElementById("lightbox-story");
    var contBtn = document.getElementById("lightbox-continue-btn");

    if (img) img.style.display = "none";
    if (reelCanvas) {
      reelCanvas.style.display = "block";
      startCinemaReelAnimation(reelCanvas, videoObj.title);
    }
    if (dateBadge) dateBadge.textContent = videoObj.date || "SUPER-8 FILM REEL";
    if (titleEl) titleEl.textContent = videoObj.title || "Cinema Memory";
    if (capEl) capEl.textContent = videoObj.caption || "";
    if (storyEl) storyEl.textContent = "Procedural Super-8 romantic motion reel.";
    if (contBtn) contBtn.textContent = "Continue to Scene " + (videoObj.nextScene || 8) + " →";
    if (modal) modal.classList.add("open");
  };

  function startCinemaReelAnimation(canvas, title) {
    if (reelAnimId) cancelAnimationFrame(reelAnimId);
    var ctx = canvas.getContext("2d");
    var start = performance.now();
    function loop(now) {
      var modal = document.getElementById("memory-lightbox-modal");
      if (!modal || !modal.classList.contains("open")) return;
      var t = (now - start) * 0.001;
      var w = canvas.width;
      var h = canvas.height;
      ctx.fillStyle = "#080c1a";
      ctx.fillRect(0, 0, w, h);

      // Film sprocket holes top & bottom
      ctx.fillStyle = "rgba(248, 237, 217, 0.22)";
      for (var i = 0; i < 12; i++) {
        var sx = ((i * 52 - (t * 45) % 52) + w) % w;
        ctx.fillRect(sx, 10, 26, 14);
        ctx.fillRect(sx, h - 24, 26, 14);
      }

      // Romantic sunset waves & floating hearts
      var grad = ctx.createRadialGradient(w / 2, h * 0.48, 10, w / 2, h * 0.48, 210);
      grad.addColorStop(0, "rgba(255, 138, 161, 0.45)");
      grad.addColorStop(0.6, "rgba(240, 190, 114, 0.18)");
      grad.addColorStop(1, "rgba(8, 12, 26, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 32, w, h - 64);

      ctx.fillStyle = "#f8edd9";
      ctx.font = "italic 22px 'Cormorant Garamond', Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(title || "Our Super-8 Memory Reel", w / 2, h / 2);
      ctx.font = "13px 'DM Mono', monospace";
      ctx.fillStyle = "#f0be72";
      ctx.fillText("▶ REC · 24 FPS · " + t.toFixed(1) + "s", w / 2, h / 2 + 34);

      reelAnimId = requestAnimationFrame(loop);
    }
    reelAnimId = requestAnimationFrame(loop);
  }

  window.closeMemoryLightbox = function() {
    var m = document.getElementById("memory-lightbox-modal");
    if (m) m.classList.remove("open");
    if (reelAnimId) {
      cancelAnimationFrame(reelAnimId);
      reelAnimId = null;
    }
  };

  window.followLightboxNextScene = function() {
    var active = window.APP_STATE.activeLightboxItem;
    var nextS = (active && active.item && active.item.nextScene) || 9;
    window.closeMemoryLightbox();
    window.goToScene(nextS);
  };

  window.handleMediaSlotClick = function(slotId, fallbackNextScene) {
    if (window.APP_STATE.editMode) {
      window.triggerMediaUploadForTarget({ type: "slot", slotId: slotId });
      return;
    }
    if (slotId === "quiz-cartoon") {
      window.openMemoryLightboxByItem({
        title: "Our Day One Cameo",
        caption: window.LOVE_CONFIG.quiz.cartoonCaption,
        date: "FEB 14, 2022",
        story: "Click Continue below to jump to Mystery Gift Boxes.",
        src: window.LOVE_CONFIG.quiz.customCartoonSrc || window.generateRomanticSVGDataURI("couple-cameo", "Day One Cameo"),
        nextScene: fallbackNextScene || 5
      });
    } else if (slotId === "letter-polaroid") {
      window.openMemoryLightboxByItem({
        title: "Sealed With Our Letter",
        caption: "Always & Forever ♥",
        date: "CHAPTER XII",
        story: "Taped inside your gingham love letter. Click Continue to visit the Music Player & Finale!",
        src: (document.getElementById("letter-polaroid-img") || {}).src,
        nextScene: fallbackNextScene || 13
      });
    }
  };

  // -------------------------------------------------------------------------
  // SCENE 9: MIDNIGHT ROOFTOP SKETCH (2-Phase Authentic Manga SVG + Whispers)
  // -------------------------------------------------------------------------
  var ROOFTOP_ART_DATA = {
    // Phase 1: Continuous Outer Silhouette Loop (~7.5s)
    phase1: "M 688 290 L 691 292 L 683 303 L 682 316 L 691 308 L 716 299 L 719 301 L 716 307 L 727 308 L 748 298 L 750 300 L 740 314 L 759 317 L 775 336 L 783 338 L 794 336 L 796 338 L 780 349 L 790 360 L 791 370 L 803 374 L 800 378 L 790 381 L 794 391 L 792 402 L 796 405 L 793 408 L 788 407 L 785 413 L 783 411 L 782 417 L 800 408 L 823 406 L 841 411 L 855 419 L 880 444 L 905 495 L 934 532 L 952 540 L 989 549 L 1008 565 L 1013 576 L 1013 588 L 1009 593 L 1007 577 L 998 565 L 980 555 L 952 549 L 968 566 L 980 570 L 993 582 L 1009 603 L 1016 620 L 1035 637 L 1050 658 L 1054 681 L 1047 692 L 1045 690 L 1048 682 L 1047 668 L 1039 654 L 1026 643 L 1035 679 L 1037 704 L 1035 720 L 1038 726 L 1044 734 L 1058 734 L 1075 740 L 1086 752 L 1099 784 L 1120 798 L 1130 808 L 1138 822 L 1145 824 L 407 824 L 414 817 L 424 816 L 433 809 L 450 808 L 469 800 L 481 771 L 466 737 L 457 726 L 448 708 L 446 669 L 450 657 L 463 642 L 477 636 L 492 637 L 510 648 L 510 632 L 526 596 L 540 535 L 549 512 L 559 501 L 578 494 L 590 477 L 602 476 L 606 468 L 615 460 L 640 467 L 655 468 L 657 461 L 650 459 L 652 455 L 650 443 L 637 433 L 631 418 L 627 422 L 623 420 L 627 413 L 617 403 L 618 390 L 624 380 L 615 378 L 611 374 L 622 370 L 625 360 L 636 347 L 627 342 L 637 340 L 651 327 L 663 326 L 664 316 L 670 305 L 687 291 Z",

    // Phase 2: Full Authentic Manga Linework Details (~4.2s, 201 paths)
    phase2: [
      "M 688 293 L 677 301 L 668 312 L 666 318 L 666 323 L 668 325 L 667 329 L 653 329 L 647 332", "M 655 338 L 644 342 L 630 357 L 625 365 L 625 371 L 622 374 L 615 374", "M 623 374 L 623 376 L 629 376",
      "M 631 376 L 633 378 L 630 381 L 632 380", "M 632 374 L 629 377 L 629 382 L 623 386 L 620 396 L 621 406", "M 626 410 L 630 408 L 633 402",
      "M 636 405 L 634 420 L 648 433 L 648 437 L 645 438 L 639 432 L 638 424", "M 638 422 L 636 413", "M 630 409 L 630 413 L 626 420",
      "M 629 405 L 628 391 L 624 387", "M 626 370 L 635 362", "M 631 365 L 635 354",
      "M 630 342 L 642 343", "M 652 349 L 656 344 L 663 340 L 671 341", "M 672 347 L 670 347 L 661 356 L 657 362 L 654 373",
      "M 687 344 L 695 350 L 697 356", "M 695 349 L 698 350 L 704 357 L 709 369", "M 746 399 L 743 414",
      "M 759 422 L 763 422 L 764 424 L 763 430 L 759 435 L 755 446 L 750 451 L 747 451 L 745 441 L 755 426 L 759 423", "M 762 432 L 770 426 L 772 427 L 770 425", "M 772 421 L 772 425 L 776 425 L 788 416 L 798 412 L 808 410 L 829 410 L 837 412 L 843 417 L 858 424 L 870 436 L 881 451 L 900 492 L 900 500 L 922 539 L 935 555 L 947 566 L 947 569 L 944 570 L 927 557 L 908 538 L 908 536 L 898 525",
      "M 899 512 L 888 485 L 882 477", "M 877 473 L 879 470 L 876 464 L 879 461", "M 879 463 L 885 475 L 881 477 L 878 487 L 872 492",
      "M 869 488 L 867 489 L 873 478 L 875 467", "M 875 458 L 875 463 L 878 459 L 874 456 L 868 442", "M 856 444 L 864 462",
      "M 868 477 L 866 491 L 854 505 L 851 515 L 847 517 L 848 530 L 846 544 L 843 550 L 829 540 L 829 536 L 840 516 L 839 513 L 817 515 L 790 510", "M 775 510 L 791 517 L 805 529 L 814 557 L 825 625", "M 859 642 L 859 668 L 855 669",
      "M 858 670 L 858 674 L 855 675", "M 858 675 L 858 682", "M 867 686 L 867 696",
      "M 859 694 L 859 699 L 863 708 L 866 711 L 875 714", "M 875 710 L 874 712 L 883 721 L 886 723 L 887 722 L 886 715 L 881 704", "M 899 698 L 905 707 L 907 704 L 901 685 L 891 668 L 889 656 L 886 654 L 887 624 L 882 591 L 875 570 L 871 565 L 867 552 L 868 548 L 859 530 L 859 526 L 856 519 L 851 516",
      "M 856 518 L 864 526", "M 859 525 L 862 525 L 874 536 L 880 520 L 877 516 L 869 512 L 857 510", "M 854 509 L 867 503 L 876 494 L 878 488",
      "M 890 489 L 891 486 L 888 484 L 889 481", "M 893 490 L 898 500", "M 901 495 L 921 523",
      "M 913 520 L 918 521 L 932 535 L 940 539 L 944 543 L 945 547 L 960 562 L 963 563 L 965 569 L 978 572 L 980 574 L 979 577 L 983 582 L 999 594 L 1011 612 L 1012 619 L 1035 641 L 1045 656 L 1051 672 L 1051 680 L 1048 689", "M 1030 697 L 1033 696 L 1031 678", "M 1028 681 L 1026 692",
      "M 1013 690 L 1014 681", "M 1012 671 L 1012 692 L 1006 701 L 1004 714 L 993 730 L 989 730", "M 976 738 L 980 738 L 988 732 L 995 704 L 988 674 L 967 629",
      "M 964 630 L 972 663 L 973 686 L 970 696 L 970 704 L 964 714 L 957 720", "M 971 702 L 973 701 L 977 688 L 979 658", "M 978 629 L 977 619 L 971 600 L 962 586 L 962 583 L 948 569",
      "M 947 564 L 958 566 L 959 562", "M 954 555 L 947 548", "M 942 540 L 944 542 L 970 548",
      "M 970 572 L 970 576 L 963 586 L 966 588 L 963 584", "M 966 586 L 976 591 L 994 606 L 997 604 L 993 590", "M 993 588 L 989 581 L 984 577",
      "M 978 577 L 971 575", "M 1000 561 L 999 562 L 1003 566 L 1004 565 L 1001 562", "M 1007 570 L 1005 565 L 993 554 L 980 548 L 971 548 L 991 557 L 1007 571 L 1010 577 L 1010 590",
      "M 1007 608 L 1007 613 L 1005 614 L 997 608 L 997 606", "M 992 612 L 997 618 L 1000 619 L 998 622 L 997 619 L 999 619", "M 1001 621 L 1004 626 L 1003 630 L 1005 631 L 1005 629",
      "M 1010 626 L 1014 629 L 1015 635 L 1017 637 L 1019 635 L 1017 633 L 1018 635 L 1016 635", "M 1019 637 L 1025 650 L 1029 665 L 1030 676 L 1027 681 L 1024 679 L 1019 660 L 1011 650 L 1008 641 L 1005 639", "M 1020 636 L 1025 637 L 1037 648",
      "M 1017 660 L 1013 658 L 1013 654", "M 999 623 L 1005 637 L 1004 643 L 1013 666 L 1013 670 L 1016 674 L 1016 679 L 1033 703 L 1032 724 L 1034 726 L 1031 729 L 1029 745", "M 1017 734 L 1008 753 L 998 765 L 997 763",
      "M 1018 783 L 1018 785 L 1010 792 L 986 809", "M 968 789 L 981 780 L 996 765 L 996 762 L 1009 744 L 1014 732", "M 1034 727 L 1045 739 L 1048 746 L 1048 751 L 1043 763 L 1020 782 L 1016 782 L 985 797 L 957 804 L 941 804 L 911 796",
      "M 905 762 L 894 758", "M 884 764 L 880 766 L 872 765", "M 889 747 L 887 746 L 886 725",
      "M 887 723 L 891 733 L 891 744 L 885 762 L 888 763 L 894 757 L 899 747 L 902 750 L 902 756 L 906 762 L 911 759 L 912 756", "M 916 756 L 924 759 L 930 759 L 934 756 L 934 754", "M 935 747 L 927 749",
      "M 949 745 L 950 750 L 953 753 L 961 753", "M 901 747 L 902 736 L 905 728 L 914 728 L 919 726 L 925 720 L 925 717 L 916 716 L 909 711", "M 907 707 L 908 711 L 906 726 L 902 727 L 902 722",
      "M 865 734 L 861 731 L 853 716 L 849 713 L 849 710 L 845 705 L 832 676", "M 855 658 L 854 675 L 857 682 L 858 691 L 867 703 L 874 710 L 875 709 L 865 681 L 865 666 L 869 647 L 871 623 L 868 609", "M 873 625 L 871 624 L 874 628 L 882 656 L 885 659 L 885 672 L 892 675 L 891 679",
      "M 892 682 L 892 686 L 890 688 L 885 687 L 885 674", "M 856 652 L 860 631 L 859 594 L 855 555 L 850 531", "M 841 514 L 844 513 L 845 510",
      "M 840 508 L 834 505 L 811 483", "M 810 488 L 796 472", "M 811 490 L 817 496 L 832 504",
      "M 825 496 L 816 487", "M 849 481 L 849 500", "M 836 514 L 838 517 L 828 522 L 805 528",
      "M 799 546 L 792 580", "M 791 597 L 770 653 L 766 687 L 763 693 L 760 688 L 754 655 L 751 613", "M 773 618 L 779 567",
      "M 750 529 L 737 542", "M 735 500 L 703 514 L 683 515", "M 699 515 L 681 523 L 664 527 L 647 525 L 638 520 L 636 517",
      "M 654 524 L 629 512 L 601 486 L 597 479 L 591 480 L 584 487 L 581 496 L 560 503 L 554 509 L 547 523 L 534 570 L 527 606 L 523 609 L 513 632 L 512 643 L 514 654 L 512 655 L 497 642 L 488 639 L 473 640 L 465 644 L 452 659 L 449 669 L 449 684 L 451 691 L 452 712 L 462 729 L 466 729 L 463 717 L 452 698", "M 458 708 L 461 706 L 457 683", "M 466 731 L 476 756 L 481 766 L 484 768 L 491 750 L 489 738 L 495 723 L 501 718 L 514 718 L 526 724",
      "M 532 727 L 546 742 L 546 747 L 535 764 L 529 763 L 521 755 L 510 749 L 498 745 L 491 745", "M 494 722 L 490 714 L 490 705 L 502 694 L 501 683 L 513 665", "M 514 663 L 514 678",
      "M 516 698 L 529 693 L 545 693 L 548 695", "M 529 713 L 542 721", "M 547 746 L 554 746 L 561 741 L 563 727 L 573 714",
      "M 576 665 L 579 706 L 578 710 L 574 712 L 577 716 L 576 723 L 570 739 L 559 760 L 561 780 L 567 791", "M 573 796 L 589 814 L 607 824 L 612 824", "M 566 824 L 560 818 L 554 806 L 554 797 L 559 780",
      "M 549 781 L 538 803 L 537 822 L 539 824 L 537 824", "M 526 824 L 523 824 L 507 801", "M 495 806 L 491 816",
      "M 493 824 L 496 821 L 497 814 L 502 804 L 506 800 L 514 784 L 528 763", "M 485 768 L 476 792 L 468 806 L 450 811 L 435 812 L 424 819", "M 420 820 L 421 823 L 416 824",
      "M 407 824 L 420 819 L 427 822 L 435 818 L 439 818", "M 498 651 L 512 662 L 515 661 L 514 656", "M 510 654 L 502 646",
      "M 526 622 L 527 607", "M 564 629 L 573 663 L 576 664 L 576 634 L 574 628", "M 616 675 L 632 705 L 648 727 L 679 759 L 695 771",
      "M 671 752 L 658 739", "M 668 810 L 691 804 L 717 791 L 745 772 L 768 750", "M 764 754 L 755 763",
      "M 766 769 L 773 732 L 776 730 L 776 716", "M 764 713 L 764 703", "M 764 693 L 764 702 L 775 715 L 777 714 L 777 702",
      "M 776 731 L 777 738", "M 773 739 L 777 739 L 779 747 L 801 777", "M 792 767 L 791 785 L 783 805 L 765 824 L 760 824",
      "M 786 824 L 789 823 L 794 811 L 795 793 L 792 787", "M 796 795 L 801 798 L 801 814", "M 802 800 L 808 800 L 810 802 L 822 824 L 851 824 L 852 821 L 862 814 L 862 812",
      "M 861 816 L 862 819 L 866 821 L 865 824 L 863 821", "M 867 805 L 866 806 L 864 804 L 863 799", "M 863 796 L 868 805 L 862 811 L 858 801 L 858 794",
      "M 858 788 L 858 793 L 860 794 L 862 792 L 862 788 L 860 787", "M 847 783 L 842 790", "M 813 793 L 834 798 L 860 786 L 863 776 L 863 767 L 850 745",
      "M 847 750 L 847 746 L 849 744 L 849 714", "M 833 707 L 831 687 L 832 673 L 829 663 L 826 635 L 826 626 L 829 621 L 830 611 L 829 558", "M 837 569 L 850 614 L 850 640 L 852 657 L 855 657 L 855 654 L 853 653",
      "M 902 629 L 904 630 L 901 627 L 901 625 L 903 625 L 901 624", "M 901 620 L 909 637 L 930 669 L 932 668 L 931 663 L 918 636", "M 899 615 L 899 619 L 896 618 L 898 612 L 892 598",
      "M 887 599 L 896 616", "M 917 587 L 907 569 L 900 550 L 898 549", "M 884 520 L 897 547 L 899 546 L 899 543 L 884 507",
      "M 847 470 L 849 480 L 847 481 L 845 473 L 846 467 L 839 453", "M 855 448 L 852 444 L 855 444 L 854 441", "M 833 425 L 834 427 L 836 426 L 851 442 L 853 439 L 844 430 L 823 420 L 805 419 L 796 422",
      "M 785 410 L 783 395", "M 775 394 L 777 414 L 770 422 L 768 420 L 769 416", "M 777 415 L 777 422",
      "M 777 412 L 779 411 L 782 403", "M 793 405 L 789 403 L 791 392 L 786 383", "M 785 378 L 785 393 L 783 394 L 781 392 L 781 387",
      "M 781 374 L 784 377 L 790 377 L 791 374 L 767 348", "M 766 343 L 775 346 L 786 343 L 793 338", "M 786 342 L 786 340 L 776 339 L 769 335",
      "M 776 346 L 775 348 L 778 352 L 787 360 L 789 372", "M 791 377 L 799 375", "M 779 361 L 779 354",
      "M 762 366 L 768 383", "M 760 385 L 762 402", "M 742 443 L 736 451 L 728 457",
      "M 727 460 L 726 457 L 720 460", "M 727 466 L 724 474 L 673 475 L 658 472 L 657 469 L 660 462", "M 658 456 L 654 457 L 655 451",
      "M 656 447 L 656 451 L 659 454 L 661 462 L 666 461 L 670 457 L 670 452", "M 667 461 L 671 458 L 675 464", "M 684 464 L 690 460 L 696 464 L 699 463",
      "M 702 469 L 699 465 L 704 470 L 706 469", "M 726 474 L 735 474 L 745 464 L 745 475 L 754 481 L 756 470", "M 762 468 L 761 472 L 765 486",
      "M 758 494 L 766 495 L 773 502 L 775 509 L 770 510 L 765 514 L 737 543 L 711 564 L 690 576 L 670 583 L 657 583 L 651 581 L 637 573 L 621 560 L 608 546 L 597 529 L 585 504 L 583 496", "M 602 483 L 608 470 L 613 464", "M 615 463 L 621 463 L 638 469 L 657 472",
      "M 656 441 L 656 446 L 654 447 L 650 438 L 648 438", "M 648 432 L 646 420", "M 736 474 L 744 476",
      "M 755 481 L 758 493 L 741 497", "M 746 464 L 751 451", "M 825 411 L 826 413 L 830 412 L 830 414 L 833 414 L 834 412",
      "M 748 318 L 747 319 L 750 322 L 768 335 L 769 331 L 758 319 L 734 316", "M 739 309 L 731 316 L 714 318", "M 714 314 L 715 312 L 704 318",
      "M 712 310 L 697 312 L 695 310", "M 681 300 L 678 309 L 678 320 L 681 322 L 694 309 L 700 306 L 709 305 L 713 310 L 726 311 L 741 307 L 747 300", "M 557 531 L 556 548 L 559 578 L 571 626 L 575 626 L 573 562",
      "M 932 669 L 937 682 L 943 711 L 943 730 L 940 742 L 936 746 L 936 755 L 938 755 L 949 743 L 956 723 L 957 697 L 955 678", "M 964 627 L 966 628 L 965 630 L 963 628 L 963 624 L 957 612 L 950 602", "M 1044 737 L 1056 737 L 1072 741 L 1081 750 L 1088 763 L 1093 779 L 1101 791 L 1102 796 L 1109 808",
      "M 1100 789 L 1118 800 L 1129 811 L 1134 823 L 1075 824", "M 1092 779 L 1076 767 L 1070 766 L 1059 753 L 1052 748 L 1049 748", "M 1069 766 L 1074 775 L 1079 796 L 1079 807 L 1074 824 L 884 824",
      "M 1276 173 C 1220 180, 1175 230, 1178 285 C 1180 305, 1210 325, 1247 325 C 1210 295, 1225 220, 1276 173 Z", "M -2000 825 L 3500 825", "M 0 750 L 193 750 L 193 825 M 127 750 L 127 825"
    ],

    // Pinpoint stars in deep OLED sky
    stars: [
      { x: 1349, y: 101, s: 1.8 }, { x: 680, y: 162, s: 1.8 }, { x: 966, y: 181, s: 1.8 }, { x: 1527, y: 238, s: 2.2 }, { x: 435, y: 263, s: 2.2 }, { x: 217, y: 348, s: 1.8 }, { x: 1392, y: 377, s: 1.8 }, { x: 292, y: 492, s: 2.2 }, { x: 1474, y: 506, s: 2.2 }, { x: 1281, y: 638, s: 2.2 }, { x: 172, y: 646, s: 2.2 }
    ]
  };

  var ROOFTOP_CONFIG = {
    phase1Duration: 7500,
    phase2Duration: 4200,
    transitionDelay: 120,
    baseWidth: 1672,
    baseHeight: 941
  };

  var ROOFTOP_WHISPERS = [
    {
      tag: "MIDNIGHT WHISPER · I / VI · THE SILHOUETTE",
      text: "“Look how quiet the city gets from up here…” — In a world of eight million lights, the calmest place was always right beside you."
    },
    {
      tag: "MIDNIGHT WHISPER · II / VI · WIND & INK",
      text: "Every line of that midnight breeze—your hair catching the wind, the warmth of your shoulder—is etched into my memory forever."
    },
    {
      tag: "MIDNIGHT WHISPER · III / VI · SILVER CRESCENT",
      text: "Even the crescent moon paused above the rooftop railing tonight just to listen to our whispered promises."
    },
    {
      tag: "MIDNIGHT WHISPER · IV / VI · ROOFTOP PROMISE",
      text: "“Promise me we’ll never outgrow midnight rooftops?” you asked. I squeezed your hand—some promises don’t even need words."
    },
    {
      tag: "MIDNIGHT WHISPER · V / VI · LUNAR HALO",
      text: "Under this paper-thin moon, every heartbeat feels like a secret only the two of us know how to read."
    },
    {
      tag: "MIDNIGHT WHISPER · VI / VI · STARLIGHT WISH",
      text: "Every star you tap in this pitch-black sky holds a quiet wish I made for our next hundred tomorrows."
    }
  ];

  var rtBuilt = false;
  var rtIsRunning = false;
  var rtIsPaused = false;
  var rtStartTime = 0;
  var rtPausedElapsed = 0;
  var rtPhase1El = null;
  var rtPhase1Len = 0;
  var rtPhase2Metrics = [];
  var rtStarEls = [];
  var rtParticles = [];
  var rtMaxParticles = 180;
  var rtDpr = 1;
  var rtToastTimer = null;
  var rtWhisperIndex = 0;
  var rtLastAutoPhaseWhisper = -1;

  function setRooftopWhisper(idx, toastMsg) {
    rtWhisperIndex = ((idx % ROOFTOP_WHISPERS.length) + ROOFTOP_WHISPERS.length) % ROOFTOP_WHISPERS.length;
    var w = ROOFTOP_WHISPERS[rtWhisperIndex];
    var tagEl = document.getElementById("rooftop-whisper-tag");
    var txtEl = document.getElementById("rooftop-whisper-text");
    var boxEl = document.getElementById("rooftop-whisper-box");
    if (boxEl) {
      boxEl.style.opacity = "0.35";
      setTimeout(function() {
        if (tagEl) tagEl.textContent = w.tag;
        if (txtEl) txtEl.textContent = w.text;
        boxEl.style.opacity = "1";
      }, 140);
    }
    if (toastMsg) showRooftopStatusToast(toastMsg);
  }

  window.cycleRooftopWhisper = function() {
    window.playSoundEffect("click");
    setRooftopWhisper(rtWhisperIndex + 1, "Whisper " + (rtWhisperIndex + 2 > 6 ? 1 : rtWhisperIndex + 2) + " / 6");
  };

  function showRooftopStatusToast(text) {
    var statusToast = document.getElementById("status-toast");
    if (!statusToast) return;
    statusToast.textContent = text;
    statusToast.classList.add("visible");
    if (rtToastTimer) clearTimeout(rtToastTimer);
    rtToastTimer = setTimeout(function() {
      statusToast.classList.remove("visible");
    }, 1400);
  }

  function setupRooftopResponsiveViewBox() {
    var svg = document.getElementById("rooftop-sketch-svg");
    var stage = document.getElementById("rooftop-stage-box");
    if (!svg || !stage) return;
    var rect = stage.getBoundingClientRect();
    var w = rect.width || window.innerWidth;
    var h = rect.height || window.innerHeight;
    var aspect = w / h;

    if (aspect < 1.0) {
      var targetWidth = 1120;
      var targetHeight = targetWidth / aspect;
      var minX = 775 - (targetWidth / 2);
      var minY = 825 - (targetHeight * 0.65);
      svg.setAttribute("viewBox", minX + " " + minY + " " + targetWidth + " " + targetHeight);
    } else {
      svg.setAttribute("viewBox", "0 0 " + ROOFTOP_CONFIG.baseWidth + " " + ROOFTOP_CONFIG.baseHeight);
    }
  }

  function setupRooftopCanvas() {
    var stage = document.getElementById("rooftop-stage-box");
    var particleCanvas = document.getElementById("rooftop-sparkle-canvas");
    if (!stage || !particleCanvas) return;
    var rect = stage.getBoundingClientRect();
    var w = Math.max(320, Math.floor(rect.width || 920));
    var h = Math.max(360, Math.floor(rect.height || 520));
    rtDpr = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = w * rtDpr;
    particleCanvas.height = h * rtDpr;
    var ctx = particleCanvas.getContext("2d");
    ctx.setTransform(rtDpr, 0, 0, rtDpr, 0, 0);
  }

  function buildRooftopSvgElements() {
    var layerPhase1 = document.getElementById("rooftop-silhouette-group");
    var layerPhase2 = document.getElementById("rooftop-details-group");
    var layerStars = document.getElementById("rooftop-stars-group");
    if (!layerPhase1 || !layerPhase2 || !layerStars) return;

    layerPhase1.innerHTML = "";
    layerPhase2.innerHTML = "";
    layerStars.innerHTML = "";

    // Phase 1 Continuous Silhouette
    var p1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p1.setAttribute("d", ROOFTOP_ART_DATA.phase1);
    p1.setAttribute("id", "path-silhouette");
    layerPhase1.appendChild(p1);
    rtPhase1El = p1;
    rtPhase1Len = p1.getTotalLength();
    p1.style.strokeDasharray = rtPhase1Len + " " + rtPhase1Len;
    p1.style.strokeDashoffset = String(rtPhase1Len);

    // Phase 2 Authentic Manga Details (201 paths)
    rtPhase2Metrics = [];
    var elements = [];
    var totalLen = 0;

    ROOFTOP_ART_DATA.phase2.forEach(function(dStr, idx) {
      var p2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p2.setAttribute("d", dStr);
      p2.setAttribute("id", "path-detail-" + idx);
      layerPhase2.appendChild(p2);

      var len = p2.getTotalLength();
      p2.style.strokeDasharray = len + " " + len;
      p2.style.strokeDashoffset = String(len);
      elements.push(p2);
      totalLen += len;
    });

    var currentCum = 0;
    elements.forEach(function(el) {
      var len = el.getTotalLength();
      var duration = (len / (totalLen || 1)) * ROOFTOP_CONFIG.phase2Duration;
      rtPhase2Metrics.push({
        el: el,
        len: len,
        start: currentCum,
        end: currentCum + duration,
        duration: duration
      });
      currentCum += duration;
    });

    // Pinpoint Stars
    rtStarEls = [];
    ROOFTOP_ART_DATA.stars.forEach(function(st, idx) {
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(st.x));
      c.setAttribute("cy", String(st.y));
      c.setAttribute("r", String(st.s));
      c.setAttribute("class", "star-point");
      c.setAttribute("id", "star-" + idx);
      c.style.opacity = "0";
      layerStars.appendChild(c);
      rtStarEls.push(c);
    });

    rtBuilt = true;
  }

  function getRooftopStageCoords(svgPoint) {
    var svg = document.getElementById("rooftop-sketch-svg");
    var stage = document.getElementById("rooftop-stage-box");
    if (!svg || !stage) return { x: 0, y: 0 };
    try {
      var pt = svg.createSVGPoint();
      pt.x = svgPoint.x;
      pt.y = svgPoint.y;
      var ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      var screenPt = pt.matrixTransform(ctm);
      var stageRect = stage.getBoundingClientRect();
      return {
        x: screenPt.x - stageRect.left,
        y: screenPt.y - stageRect.top
      };
    } catch (e) {
      return { x: 0, y: 0 };
    }
  }

  function emitRooftopMicroSparkle(svgPoint, burstCount, customColor) {
    if (rtParticles.length >= rtMaxParticles) return;
    var localPt = getRooftopStageCoords(svgPoint);
    var count = burstCount || (Math.random() < 0.6 ? 2 : 1);
    for (var i = 0; i < count; i++) {
      var spread = burstCount ? 2.2 : 0.7;
      rtParticles.push({
        x: localPt.x + (Math.random() - 0.5) * 4,
        y: localPt.y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 0.5) * spread - 0.25,
        life: 1.0,
        decay: 0.028 + Math.random() * 0.035,
        radius: 0.7 + Math.random() * 1.1,
        color: customColor || "#ffffff"
      });
    }
  }

  function setRooftopPenPosition(svgPoint) {
    var penCursor = document.getElementById("pen-cursor");
    if (!penCursor || !svgPoint) return;
    penCursor.setAttribute("transform", "translate(" + svgPoint.x + ", " + svgPoint.y + ")");
    penCursor.style.opacity = "1";
    emitRooftopMicroSparkle(svgPoint);
  }

  function hideRooftopPen() {
    var penCursor = document.getElementById("pen-cursor");
    if (penCursor) penCursor.style.opacity = "0";
  }

  window.startRooftopSketch = function(speedOverride) {
    setupRooftopResponsiveViewBox();
    setupRooftopCanvas();
    if (!rtBuilt) buildRooftopSvgElements();
    if (speedOverride) window.APP_STATE.rooftopSpeed = speedOverride;

    rtIsPaused = false;
    rtIsRunning = true;
    rtPausedElapsed = 0;
    rtParticles.length = 0;
    rtLastAutoPhaseWhisper = 0;
    setRooftopWhisper(0);

    var pauseBtn = document.getElementById("btn-rooftop-pause");
    if (pauseBtn) pauseBtn.textContent = "⏸ Pause (Space)";

    if (window.APP_STATE.reducedMotion) {
      if (rtPhase1El) rtPhase1El.style.strokeDashoffset = "0";
      rtPhase2Metrics.forEach(function(m) { m.el.style.strokeDashoffset = "0"; });
      rtStarEls.forEach(function(s) { s.style.opacity = "0.85"; });
      hideRooftopPen();
      rtIsRunning = false;
      return;
    }

    if (rtPhase1El) {
      rtPhase1El.style.strokeDashoffset = String(rtPhase1Len);
      var startPt = rtPhase1El.getPointAtLength(0);
      setRooftopPenPosition(startPt);
    }
    rtPhase2Metrics.forEach(function(m) { m.el.style.strokeDashoffset = String(m.len); });
    rtStarEls.forEach(function(s) { s.style.opacity = "0"; });

    rtStartTime = performance.now();
    showRooftopStatusToast("Drawing Rooftop Sketch");
  };

  window.toggleRooftopPause = function() {
    var pauseBtn = document.getElementById("btn-rooftop-pause");
    if (!rtIsRunning && rtPausedElapsed === 0) {
      window.startRooftopSketch();
      return;
    }
    if (rtIsPaused) {
      rtIsPaused = false;
      rtStartTime = performance.now();
      if (pauseBtn) pauseBtn.textContent = "⏸ Pause (Space)";
      showRooftopStatusToast("Resumed");
    } else {
      rtIsPaused = true;
      rtPausedElapsed += (performance.now() - rtStartTime) * (window.APP_STATE.rooftopSpeed || 1);
      if (pauseBtn) pauseBtn.textContent = "▶ Resume (Space)";
      showRooftopStatusToast("Paused");
    }
  };

  window.cycleRooftopSpeed = function() {
    var speeds = [1, 2, 4];
    var cur = window.APP_STATE.rooftopSpeed || 1;
    var nextIdx = (speeds.indexOf(cur) + 1) % speeds.length;
    if (rtIsRunning && !rtIsPaused) {
      rtPausedElapsed += (performance.now() - rtStartTime) * cur;
      rtStartTime = performance.now();
    }
    window.APP_STATE.rooftopSpeed = speeds[nextIdx];
    var btn = document.getElementById("btn-rooftop-speed");
    if (btn) btn.textContent = window.APP_STATE.rooftopSpeed + "x Speed";
    showRooftopStatusToast(window.APP_STATE.rooftopSpeed + "x Speed");
  };

  // Interactive Stage Click: Detect Couple, Crescent Moon, or Sky Wish
  window.handleRooftopStageClick = function(ev) {
    var svg = document.getElementById("rooftop-sketch-svg");
    var fxGroup = document.getElementById("rooftop-interactive-fx");
    var starsGroup = document.getElementById("rooftop-stars-group");
    if (!svg) return;

    window.playSoundEffect("wish");
    try {
      var pt = svg.createSVGPoint();
      pt.x = ev.clientX;
      pt.y = ev.clientY;
      var ctm = svg.getScreenCTM();
      var svgPt = ctm ? pt.matrixTransform(ctm.inverse()) : { x: 800, y: 400 };

      // Check if clicked near Crescent Moon (around x:1140..1330, y:130..360)
      if (svgPt.x >= 1140 && svgPt.x <= 1330 && svgPt.y >= 130 && svgPt.y <= 360) {
        setRooftopWhisper(4, "🌙 Crescent Moon Promise");
        emitRooftopMicroSparkle({ x: 1235, y: 250 }, 26, "#f0be72");
        if (fxGroup) {
          var halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          halo.setAttribute("cx", "1235");
          halo.setAttribute("cy", "250");
          halo.setAttribute("r", "68");
          halo.setAttribute("fill", "none");
          halo.setAttribute("stroke", "rgba(240,190,114,0.65)");
          halo.setAttribute("stroke-width", "1.5");
          fxGroup.appendChild(halo);
          setTimeout(function() { if (halo.parentNode) halo.parentNode.removeChild(halo); }, 1100);
        }
        return;
      }

      // Check if clicked on the Couple silhouette (x:440..1120, y:290..825)
      if (svgPt.x >= 440 && svgPt.x <= 1120 && svgPt.y >= 290 && svgPt.y <= 825) {
        setRooftopWhisper(3, "♥ Rooftop Embrace");
        emitRooftopMicroSparkle(svgPt, 28, "#ff8aa1");
        if (fxGroup) {
          var heart = document.createElementNS("http://www.w3.org/2000/svg", "path");
          var hx = svgPt.x;
          var hy = svgPt.y - 25;
          heart.setAttribute("d", "M " + hx + " " + (hy + 12) + " C " + hx + " " + (hy + 12) + " " + (hx - 16) + " " + hy + " " + (hx - 16) + " " + (hy - 10) + " C " + (hx - 16) + " " + (hy - 18) + " " + (hx - 8) + " " + (hy - 22) + " " + hx + " " + (hy - 14) + " C " + (hx + 8) + " " + (hy - 22) + " " + (hx + 16) + " " + (hy - 18) + " " + (hx + 16) + " " + (hy - 10) + " C " + (hx + 16) + " " + hy + " " + hx + " " + (hy + 12) + " Z");
          heart.setAttribute("fill", "rgba(255,138,161,0.35)");
          heart.setAttribute("stroke", "#ff8aa1");
          heart.setAttribute("stroke-width", "1.8");
          fxGroup.appendChild(heart);
          setTimeout(function() { if (heart.parentNode) heart.parentNode.removeChild(heart); }, 1200);
        }
        return;
      }

      // Otherwise clicked in the night sky: plant a new interactive wish star!
      if (starsGroup && svgPt.y < 810) {
        var newStar = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        newStar.setAttribute("cx", svgPt.x.toFixed(1));
        newStar.setAttribute("cy", svgPt.y.toFixed(1));
        newStar.setAttribute("r", "2.4");
        newStar.setAttribute("class", "star-point");
        newStar.style.opacity = "0.95";
        starsGroup.appendChild(newStar);
        rtStarEls.push(newStar);
        emitRooftopMicroSparkle(svgPt, 22, "#ffffff");
        setRooftopWhisper(5, "✦ Planted a Wish Star in the Sky");
      }
    } catch (e) {}
  };

  function renderRooftopSketchFrame() {
    if (window.APP_STATE.currentScene !== 9) return;
    if (!rtBuilt) window.startRooftopSketch();

    var particleCanvas = document.getElementById("rooftop-sparkle-canvas");
    if (!particleCanvas) return;
    var ctx = particleCanvas.getContext("2d");
    var stageW = particleCanvas.width / (rtDpr || 1);
    var stageH = particleCanvas.height / (rtDpr || 1);
    ctx.clearRect(0, 0, stageW, stageH);

    var label = document.getElementById("rooftop-phase-label");

    if (rtIsRunning && !rtIsPaused) {
      var speed = window.APP_STATE.rooftopSpeed || 1;
      var elapsed = (performance.now() - rtStartTime) * speed + rtPausedElapsed;
      var p1Dur = ROOFTOP_CONFIG.phase1Duration;
      var delay = ROOFTOP_CONFIG.transitionDelay;
      var p2Dur = ROOFTOP_CONFIG.phase2Duration;
      var total = p1Dur + delay + p2Dur;

      if (elapsed < p1Dur) {
        // Phase 1: Continuous Outer Silhouette (~7.5s)
        var progress = Math.min(1, Math.max(0, elapsed / p1Dur));
        var ease = progress < 0.05 ? Math.pow(progress / 0.05, 2) * 0.05 : progress;
        var currentDist = ease * rtPhase1Len;
        rtPhase1El.style.strokeDashoffset = String(rtPhase1Len - currentDist);
        setRooftopPenPosition(rtPhase1El.getPointAtLength(currentDist));
        if (label) label.textContent = "Phase 1 (" + (elapsed / 1000).toFixed(1) + "s / 7.5s): Tracing continuous rooftop silhouette…";

      } else if (elapsed < p1Dur + delay) {
        rtPhase1El.style.strokeDashoffset = "0";
        if (rtPhase2Metrics[0]) {
          setRooftopPenPosition(rtPhase2Metrics[0].el.getPointAtLength(0));
        }

      } else if (elapsed < total) {
        // Phase 2: 201 Manga Linework Details (~4.2s)
        if (rtLastAutoPhaseWhisper < 1) {
          rtLastAutoPhaseWhisper = 1;
          setRooftopWhisper(1);
        }
        rtPhase1El.style.strokeDashoffset = "0";
        var p2Elapsed = elapsed - (p1Dur + delay);
        var activePenPt = null;

        for (var i = 0; i < rtPhase2Metrics.length; i++) {
          var m = rtPhase2Metrics[i];
          if (p2Elapsed <= m.start) {
            m.el.style.strokeDashoffset = String(m.len);
          } else if (p2Elapsed >= m.end) {
            m.el.style.strokeDashoffset = "0";
          } else {
            var strokeProgress = (p2Elapsed - m.start) / (m.duration || 1);
            var curD = Math.min(m.len, Math.max(0, strokeProgress * m.len));
            m.el.style.strokeDashoffset = String(m.len - curD);
            activePenPt = m.el.getPointAtLength(curD);
          }
        }

        if (activePenPt) {
          setRooftopPenPosition(activePenPt);
        } else {
          for (var k = rtPhase2Metrics.length - 1; k >= 0; k--) {
            if (p2Elapsed >= rtPhase2Metrics[k].end) {
              setRooftopPenPosition(rtPhase2Metrics[k].el.getPointAtLength(rtPhase2Metrics[k].len));
              break;
            }
          }
        }

        var starProgress = Math.max(0, (p2Elapsed - (p2Dur * 0.65)) / (p2Dur * 0.35));
        if (starProgress > 0) {
          rtStarEls.forEach(function(st) {
            st.style.opacity = String(Math.min(0.85, starProgress * 0.85));
          });
        }
        if (label) label.textContent = "Phase 2 (" + (p2Elapsed / 1000).toFixed(1) + "s / 4.2s): Sketching 201 manga linework details…";

      } else {
        // Completed
        if (rtLastAutoPhaseWhisper < 2) {
          rtLastAutoPhaseWhisper = 2;
          setRooftopWhisper(2, "Sketch Complete · Tap Moon, Couple or Sky ✨");
        }
        rtPhase1El.style.strokeDashoffset = "0";
        rtPhase2Metrics.forEach(function(m) { m.el.style.strokeDashoffset = "0"; });
        rtStarEls.forEach(function(st) { st.style.opacity = "0.85"; });
        hideRooftopPen();
        rtIsRunning = false;
        if (label) label.textContent = "Complete · Tap the Moon, Couple, or Sky to interact ♥";
      }
    }

    // Update & Draw Micro-Sparkle Particles
    for (var pIdx = rtParticles.length - 1; pIdx >= 0; pIdx--) {
      var p = rtParticles[pIdx];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        rtParticles.splice(pIdx, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.life * 0.8;
      ctx.fillStyle = p.color || "#ffffff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // -------------------------------------------------------------------------
  // SCENE 10: REALISTIC ANALOG CLOCK & "TIME TOGETHER" COUNTER
  // -------------------------------------------------------------------------
  function updateClockAndCounter() {
    var now = new Date();
    var sec = now.getSeconds() + now.getMilliseconds() / 1000;
    var min = now.getMinutes() + sec / 60;
    var hr = (now.getHours() % 12) + min / 60;

    var hHand = document.getElementById("clock-hand-hour");
    var mHand = document.getElementById("clock-hand-minute");
    var sHand = document.getElementById("clock-hand-second");
    if (hHand) hHand.style.transform = "rotate(" + (hr * 30).toFixed(1) + "deg)";
    if (mHand) mHand.style.transform = "rotate(" + (min * 6).toFixed(1) + "deg)";
    if (sHand) sHand.style.transform = "rotate(" + (sec * 6).toFixed(1) + "deg)";

    var dig = document.getElementById("digital-clock-readout");
    if (dig) {
      dig.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }

    var startStr = (window.LOVE_CONFIG && window.LOVE_CONFIG.relationshipStartDate) || "2022-02-14T19:30:00";
    var startDate = new Date(startStr);
    if (isNaN(startDate.getTime())) startDate = new Date("2022-02-14T19:30:00");
    var diffMs = Math.max(0, now.getTime() - startDate.getTime());

    var totalSeconds = Math.floor(diffMs / 1000);
    var years = Math.floor(totalSeconds / (365.25 * 86400));
    var remAfterYears = totalSeconds - Math.floor(years * 365.25 * 86400);
    var months = Math.floor(remAfterYears / (30.4375 * 86400));
    var remAfterMonths = remAfterYears - Math.floor(months * 30.4375 * 86400);
    var days = Math.floor(remAfterMonths / 86400);
    var hours = Math.floor((remAfterMonths % 86400) / 3600);
    var minutes = Math.floor((remAfterMonths % 3600) / 60);
    var seconds = remAfterMonths % 60;

    var setNum = function(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };
    setNum("cnt-years", years);
    setNum("cnt-months", months);
    setNum("cnt-days", days);
    setNum("cnt-hours", hours);
    setNum("cnt-minutes", minutes);
    setNum("cnt-seconds", seconds);

    var sumLine = document.getElementById("together-summary-line");
    if (sumLine) {
      var totalDays = Math.floor(totalSeconds / 86400);
      sumLine.textContent = "Together for " + years + " years, " + months + " months, " + days + " days, " + hours + " hours, and " + minutes + " minutes (" + totalDays.toLocaleString() + " sunrises shared ♥)";
    }
  }

  // -------------------------------------------------------------------------
  // SCENE 11: INTERACTIVE BIRTHDAY CAKE, MICROPHONE BLOW-OUT & CONFETTI
  // -------------------------------------------------------------------------
  function renderCakeCandles() {
    var g = document.getElementById("cake-candles-group");
    if (!g) return;
    var xs = [138, 169, 200, 231, 262];
    g.innerHTML = xs.map(function(x, idx) {
      var lit = window.APP_STATE.candlesLit[idx];
      return (
        '<g style="cursor:pointer;" onclick="event.stopPropagation(); toggleSingleCandle(' + idx + ')">' +
        '<rect x="' + (x - 5) + '" y="76" width="10" height="44" rx="4" fill="#f8edd9" stroke="#ff8aa1" stroke-width="1.5"/>' +
        '<line x1="' + x + '" y1="76" x2="' + x + '" y2="68" stroke="#333" stroke-width="2"/>' +
        (lit
          ? '<path d="M ' + x + ' 44 C ' + (x - 9) + ' 58 ' + (x - 6) + ' 69 ' + x + ' 69 C ' + (x + 6) + ' 69 ' + (x + 9) + ' 58 ' + x + ' 44 Z" fill="#ffcf48" stroke="#ff6b6b" stroke-width="1.5"/>' +
            '<circle cx="' + x + '" cy="58" r="16" fill="rgba(240,190,114,0.28)"/>'
          : '<path d="M ' + x + ' 65 Q ' + (x - 6) + ' 52 ' + (x + 4) + ' 40" fill="none" stroke="rgba(248,237,217,0.45)" stroke-width="1.5" stroke-dasharray="2 2"/>') +
        '</g>'
      );
    }).join("");
  }

  window.toggleSingleCandle = function(idx) {
    window.APP_STATE.candlesLit[idx] = !window.APP_STATE.candlesLit[idx];
    window.playSoundEffect("click");
    renderCakeCandles();
    if (window.APP_STATE.candlesLit.every(function(c) { return !c; })) {
      celebrateCandlesBlownOut();
    }
  };

  window.lightAllCandles = function() {
    window.APP_STATE.candlesLit = [true, true, true, true, true];
    window.playSoundEffect("click");
    var banner = document.getElementById("cake-wish-banner");
    if (banner) banner.style.display = "none";
    renderCakeCandles();
    window.showToast("🔥 Candles lit! Make a wish and blow them out.");
  };

  window.blowOutCandles = function() {
    window.APP_STATE.candlesLit = [false, false, false, false, false];
    renderCakeCandles();
    celebrateCandlesBlownOut();
  };

  window.resetCakeScene = function() {
    window.lightAllCandles();
  };

  function celebrateCandlesBlownOut() {
    window.playSoundEffect("wish");
    triggerHaptic([40, 60, 100]);
    var banner = document.getElementById("cake-wish-banner");
    var wishTxt = document.getElementById("cake-wish-text");
    if (wishTxt) wishTxt.textContent = window.LOVE_CONFIG.texts.wishText;
    if (banner) banner.style.display = "block";
    window.spawnFireworkBurst(window.innerWidth * 0.35, window.innerHeight * 0.38, 40);
    window.spawnFireworkBurst(window.innerWidth * 0.65, window.innerHeight * 0.38, 40);
    window.showToast("🎉 Happy Birthday! Your wish has been sent to the stars!");
  }

  window.startMicrophoneBlowDetection = async function() {
    var wrap = document.getElementById("mic-meter-wrap");
    var bar = document.getElementById("mic-level-bar");
    if (wrap) wrap.style.display = "block";
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone unavailable");
      }
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      var ctx = getAudioContext() || new (window.AudioContext || window.webkitAudioContext)();
      var src = ctx.createMediaStreamSource(stream);
      var analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      var data = new Uint8Array(analyser.frequencyBinCount);
      window.showToast("🎙️ Microphone active — blow gently to extinguish candles!");

      function checkBreath() {
        if (window.APP_STATE.currentScene !== 11 || window.APP_STATE.candlesLit.every(function(c) { return !c; })) {
          stream.getTracks().forEach(function(t) { t.stop(); });
          return;
        }
        analyser.getByteFrequencyData(data);
        var sum = 0;
        for (var i = 0; i < 30; i++) sum += data[i];
        var avg = sum / 30;
        var pct = Math.min(100, Math.round((avg / 140) * 100));
        if (bar) bar.style.width = pct + "%";
        if (avg > 92) {
          window.blowOutCandles();
          stream.getTracks().forEach(function(t) { t.stop(); });
          return;
        }
        requestAnimationFrame(checkBreath);
      }
      requestAnimationFrame(checkBreath);
    } catch (e) {
      window.showToast("💨 Microphone blocked in sandbox — triggering gentle breeze fallback!");
      setTimeout(function() {
        window.blowOutCandles();
      }, 700);
    }
  };

  // -------------------------------------------------------------------------
  // SCENE 12: LOVE LETTER (Typewriter Reveal & Gingham Card)
  // -------------------------------------------------------------------------
  window.startLetterTypewriter = function(reset) {
    var container = document.getElementById("letter-typewriter-body");
    if (!container) return;
    var paragraphs = (window.LOVE_CONFIG.texts && window.LOVE_CONFIG.texts.letterParagraphs) || [];
    var fullText = paragraphs.join("\n\n");

    if (window.APP_STATE.reducedMotion) {
      window.completeLetterInstantly();
      return;
    }
    if (reset || window.APP_STATE.typewriterIndex === 0) {
      if (window.APP_STATE.typewriterTimer) clearInterval(window.APP_STATE.typewriterTimer);
      window.APP_STATE.typewriterIndex = 0;
      container.innerHTML = "";
    } else if (window.APP_STATE.typewriterIndex >= fullText.length) {
      return;
    }

    if (window.APP_STATE.typewriterTimer) clearInterval(window.APP_STATE.typewriterTimer);
    window.APP_STATE.typewriterTimer = setInterval(function() {
      window.APP_STATE.typewriterIndex += 3;
      var slice = fullText.slice(0, window.APP_STATE.typewriterIndex);
      container.innerHTML = slice
        .split("\n\n")
        .map(function(p) { return '<p style="margin-bottom:0.85rem;">' + p + '</p>'; })
        .join("");
      if (window.APP_STATE.typewriterIndex >= fullText.length) {
        clearInterval(window.APP_STATE.typewriterTimer);
        window.APP_STATE.typewriterTimer = null;
      }
    }, 28);
  };

  window.completeLetterInstantly = function() {
    if (window.APP_STATE.typewriterTimer) {
      clearInterval(window.APP_STATE.typewriterTimer);
      window.APP_STATE.typewriterTimer = null;
    }
    var container = document.getElementById("letter-typewriter-body");
    var paragraphs = (window.LOVE_CONFIG.texts && window.LOVE_CONFIG.texts.letterParagraphs) || [];
    if (container) {
      container.innerHTML = paragraphs
        .map(function(p) { return '<p style="margin-bottom:0.85rem;">' + p + '</p>'; })
        .join("");
    }
    window.APP_STATE.typewriterIndex = 99999;
  };

  // -------------------------------------------------------------------------
  // SCENE 13: MUSIC PLAYER & FINALE (Polyphonic Synth + Audio Element + Orbit)
  // -------------------------------------------------------------------------
  function updateMusicPlayerUI() {
    var tracks = (window.LOVE_CONFIG && window.LOVE_CONFIG.music) || [];
    var idx = window.APP_STATE.currentTrackIndex % Math.max(1, tracks.length);
    var tr = tracks[idx] || { title: "Midnight on the Rooftop", artist: "Julian & Elena", coverPreset: "vinyl-midnight" };

    var idxEl = document.getElementById("music-track-index");
    var titleEl = document.getElementById("music-track-title");
    var artEl = document.getElementById("music-track-artist");
    var covEl = document.getElementById("music-cover-img");
    var playBtn = document.getElementById("btn-music-play");

    if (idxEl) idxEl.textContent = "TRACK " + (idx + 1) + " OF " + tracks.length;
    if (titleEl) titleEl.textContent = tr.title;
    if (artEl) artEl.textContent = tr.artist;
    if (covEl) {
      covEl.src = tr.cover || window.generateRomanticSVGDataURI(tr.coverPreset || "vinyl-midnight", tr.title);
    }
    if (playBtn) {
      playBtn.textContent = window.APP_STATE.musicPlaying ? "⏸ Pause" : "▶ Play";
    }
  }

  window.toggleMusicPlayback = function() {
    window.APP_STATE.musicPlaying = !window.APP_STATE.musicPlaying;
    updateMusicPlayerUI();

    if (window.APP_STATE.musicPlaying) {
      startMusicPlaybackLoop();
      window.showToast("🎵 Playing: " + window.LOVE_CONFIG.music[window.APP_STATE.currentTrackIndex].title);
    } else {
      stopMusicPlaybackLoop();
      window.showToast("⏸ Music paused");
    }
  };

  function startMusicPlaybackLoop() {
    stopMusicPlaybackLoop();
    var tracks = window.LOVE_CONFIG.music || [];
    var tr = tracks[window.APP_STATE.currentTrackIndex] || tracks[0];
    if (!tr) return;

    // If user supplied an external audio URL, play HTMLAudioElement
    if (tr.src && tr.src.trim() !== "") {
      try {
        if (!window.APP_STATE.htmlAudioEl) {
          window.APP_STATE.htmlAudioEl = new Audio();
        }
        window.APP_STATE.htmlAudioEl.src = tr.src;
        window.APP_STATE.htmlAudioEl.volume = window.APP_STATE.musicVolume;
        window.APP_STATE.htmlAudioEl.play();
      } catch (e) {}
    }

    // Polyphonic Web Audio Music Box / Piano Synth Loop
    var intervalMs = Math.round((60 / (tr.tempo || 88)) * 500);
    window.APP_STATE.musicSynthTimer = setInterval(function() {
      if (!window.APP_STATE.musicPlaying) return;
      window.APP_STATE.musicProgress = (window.APP_STATE.musicProgress + 1.2) % 100;
      var progEl = document.getElementById("music-progress-range");
      var curTimeEl = document.getElementById("music-time-current");
      if (progEl) progEl.value = String(Math.floor(window.APP_STATE.musicProgress));
      if (curTimeEl) {
        var totalSec = Math.floor((window.APP_STATE.musicProgress / 100) * 144);
        var mm = Math.floor(totalSec / 60);
        var ss = totalSec % 60;
        curTimeEl.textContent = mm + ":" + (ss < 10 ? "0" : "") + ss;
      }

      if (!tr.src || tr.src.trim() === "") {
        var ctx = getAudioContext();
        if (!ctx) return;
        var notes = tr.notes || [261.63, 329.63, 392.0, 523.25];
        var freq = notes[window.APP_STATE.musicNoteStep % notes.length];
        window.APP_STATE.musicNoteStep++;
        try {
          var now = ctx.currentTime;
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now);
          var vol = 0.08 * window.APP_STATE.musicVolume;
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.65);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.68);
        } catch (e) {}
      }
    }, intervalMs);
  }

  function stopMusicPlaybackLoop() {
    if (window.APP_STATE.musicSynthTimer) {
      clearInterval(window.APP_STATE.musicSynthTimer);
      window.APP_STATE.musicSynthTimer = null;
    }
    if (window.APP_STATE.htmlAudioEl) {
      try { window.APP_STATE.htmlAudioEl.pause(); } catch (e) {}
    }
  }

  window.changeMusicTrack = function(delta) {
    var tracks = window.LOVE_CONFIG.music || [];
    window.APP_STATE.currentTrackIndex = (window.APP_STATE.currentTrackIndex + delta + tracks.length) % tracks.length;
    window.APP_STATE.musicProgress = 0;
    window.APP_STATE.musicNoteStep = 0;
    updateMusicPlayerUI();
    if (window.APP_STATE.musicPlaying) startMusicPlaybackLoop();
  };

  window.seekMusicTrack = function(val) {
    window.APP_STATE.musicProgress = parseFloat(val) || 0;
  };

  window.setMusicVolume = function(val) {
    window.APP_STATE.musicVolume = Math.max(0, Math.min(1, (parseFloat(val) || 75) / 100));
    if (window.APP_STATE.htmlAudioEl) {
      window.APP_STATE.htmlAudioEl.volume = window.APP_STATE.musicVolume;
    }
  };

  window.replayEntireExperience = function() {
    window.goToScene(1);
    window.showToast("↺ Replaying our Love Experience from Chapter I ♥");
  };

  function renderFinaleOrbitFrame(time) {
    if (window.APP_STATE.currentScene !== 13) return;
    var disc = document.getElementById("music-vinyl-disc");
    if (disc && window.APP_STATE.musicPlaying && !window.APP_STATE.reducedMotion) {
      disc.style.transform = "rotate(" + ((time * 0.04) % 360).toFixed(1) + "deg)";
    }
    var c = document.getElementById("finale-orbit-canvas");
    if (!c) return;
    var ctx = c.getContext("2d");
    var w = c.width;
    var h = c.height;
    ctx.clearRect(0, 0, w, h);

    var cx = w / 2;
    var cy = h / 2;
    ctx.strokeStyle = "rgba(240, 190, 114, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 56, 22, -0.2, 0, Math.PI * 2);
    ctx.stroke();

    // Central pulsing heart
    ctx.fillStyle = "#ff8aa1";
    ctx.font = "28px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♥", cx, cy);

    // Orbiting satellite star
    var ang = time * 0.003;
    var ox = cx + Math.cos(ang) * 56;
    var oy = cy + Math.sin(ang) * 22;
    ctx.fillStyle = "#f0be72";
    ctx.beginPath();
    ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // -------------------------------------------------------------------------
  // EDIT MODE, LIVE FILEREADER SWAP, DRAG-AND-DROP & JSON EXPORT/IMPORT
  // -------------------------------------------------------------------------
  window.triggerMediaUploadForTarget = function(targetSpec) {
    window.APP_STATE.activeEditTarget = targetSpec;
    var inp = document.getElementById("live-media-file-input");
    if (inp) {
      inp.value = "";
      inp.click();
    }
  };

  window.triggerReplaceCurrentLightboxMedia = function() {
    var active = window.APP_STATE.activeLightboxItem;
    if (active && typeof active.photoIndex === "number") {
      window.triggerMediaUploadForTarget({ type: "photo", index: active.photoIndex });
    } else {
      window.triggerMediaUploadForTarget({ type: "photo", index: 0 });
    }
  };

  window.triggerCharacterArtUpload = function() {
    window.triggerMediaUploadForTarget({ type: "character-art" });
  };

  window.handleLiveFileInput = function(event) {
    var file = event && event.target && event.target.files && event.target.files[0];
    if (!file) return;
    readMediaFileIntoTarget(file, window.APP_STATE.activeEditTarget);
  };

  function readMediaFileIntoTarget(file, target) {
    if (!file || !target) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var dataUrl = e.target.result;
      if (target.type === "photo" && typeof target.index === "number") {
        if (window.LOVE_CONFIG.photos[target.index]) {
          window.LOVE_CONFIG.photos[target.index].src = dataUrl;
          window.renderMemoryWallAndClothesline();
          var lbImg = document.getElementById("lightbox-img");
          if (lbImg) lbImg.src = dataUrl;
        }
      } else if (target.type === "slot" && target.slotId === "quiz-cartoon") {
        window.LOVE_CONFIG.quiz.customCartoonSrc = dataUrl;
        var qImg = document.getElementById("quiz-cartoon-img");
        if (qImg) qImg.src = dataUrl;
      } else if (target.type === "slot" && target.slotId === "letter-polaroid") {
        var lImg = document.getElementById("letter-polaroid-img");
        if (lImg) lImg.src = dataUrl;
      } else if (target.type === "character-art") {
        window.LOVE_CONFIG.characters.customArtworkSrc = dataUrl;
        var cImg = document.getElementById("custom-character-override-img");
        if (cImg) {
          cImg.src = dataUrl;
          cImg.style.display = "block";
        }
      }
      safeLocalSet("love_custom_config", JSON.stringify(window.LOVE_CONFIG));
      window.showToast("📷 Media updated locally on your device!");
    };
    reader.readAsDataURL(file);
  }

  function setupCardDragAndDrop(el, photoIdx) {
    return; // drag-and-drop replacing disabled
    el.addEventListener("dragover", function(ev) {
      ev.preventDefault();
      el.style.borderColor = "var(--accent-rose)";
    });
    el.addEventListener("dragleave", function() {
      el.style.borderColor = "";
    });
    el.addEventListener("drop", function(ev) {
      ev.preventDefault();
      el.style.borderColor = "";
      var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
      if (file) {
        readMediaFileIntoTarget(file, { type: "photo", index: photoIdx });
      }
    });
  }

  window.openEditStudioModal = function() {
    var m = document.getElementById("edit-studio-modal");
    if (!m) return;
    document.getElementById("edit-from-name").value = window.LOVE_CONFIG.names.from || "";
    document.getElementById("edit-to-name").value = window.LOVE_CONFIG.names.to || "";
    document.getElementById("edit-start-date").value = (window.LOVE_CONFIG.relationshipStartDate || "2022-02-14").slice(0, 10);
    document.getElementById("edit-transition-style").value = window.LOVE_CONFIG.theme.transitionStyle || "heart-wipe";
    document.getElementById("edit-wish-text").value = window.LOVE_CONFIG.texts.wishText || "";
    document.getElementById("edit-letter-paragraphs").value = (window.LOVE_CONFIG.texts.letterParagraphs || []).join("\n");
    m.classList.add("open");
  };

  window.closeEditStudioModal = function() {
    var m = document.getElementById("edit-studio-modal");
    if (m) m.classList.remove("open");
  };

  window.saveEditStudioChanges = async function() {
    var fromVal = document.getElementById("edit-from-name").value.trim();
    var toVal = document.getElementById("edit-to-name").value.trim();
    var startVal = document.getElementById("edit-start-date").value;
    var newPass = document.getElementById("edit-new-passcode").value.trim();
    var transVal = document.getElementById("edit-transition-style").value;
    var wishVal = document.getElementById("edit-wish-text").value.trim();
    var letterVal = document.getElementById("edit-letter-paragraphs").value.trim();

    if (fromVal) window.LOVE_CONFIG.names.from = fromVal;
    if (toVal) window.LOVE_CONFIG.names.to = toVal;
    if (startVal) {
      window.LOVE_CONFIG.relationshipStartDate = startVal + "T19:30:00";
      window.LOVE_CONFIG.quiz.acceptedDates.push(startVal);
    }
    if (newPass && newPass.length >= 4 && newPass.length <= 6) {
      window.LOVE_CONFIG.passcodeLength = newPass.length;
      window.LOVE_CONFIG.passcodeHash = await computeSHA256(newPass);
    }
    if (transVal) window.LOVE_CONFIG.theme.transitionStyle = transVal;
    if (wishVal) window.LOVE_CONFIG.texts.wishText = wishVal;
    if (letterVal) {
      window.LOVE_CONFIG.texts.letterParagraphs = letterVal.split(/\n+/).filter(Boolean);
    }

    safeLocalSet("love_custom_config", JSON.stringify(window.LOVE_CONFIG));
    applyConfigToDOM();
    window.closeEditStudioModal();
    window.showToast("💾 Saved all customisations to your device!");
  };

  window.exportConfigJSON = function() {
    try {
      var blob = new Blob([JSON.stringify(window.LOVE_CONFIG, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "love-experience-config.json";
      a.click();
      setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
      window.showToast("⬇ Exported love-experience-config.json");
    } catch (e) {}
  };

  window.importConfigJSON = function(ev) {
    var file = ev && ev.target && ev.target.files && ev.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var parsed = JSON.parse(e.target.result);
        window.LOVE_CONFIG = Object.assign(window.LOVE_CONFIG, parsed);
        safeLocalSet("love_custom_config", JSON.stringify(window.LOVE_CONFIG));
        applyConfigToDOM();
        window.closeEditStudioModal();
        window.showToast("⬆ Imported custom configuration JSON!");
      } catch (err) {
        window.showToast("Could not parse JSON file");
      }
    };
    reader.readAsText(file);
  };

  window.resetConfigToDefaults = function() {
    try { window.localStorage.removeItem("love_custom_config"); } catch (e) {}
    window.showToast("↺ Reset to default configuration — reload or continue");
    window.closeEditStudioModal();
  };

  // -------------------------------------------------------------------------
  // AMBIENT SKY, FLOATING LANTERNS, CURSOR TRAIL & FIREWORKS ENGINE
  // -------------------------------------------------------------------------
  window.spawnFireworkBurst = function(x, y, count) {
    if (window.APP_STATE.reducedMotion) return;
    var n = count || 30;
    var colors = ["#ff8aa1", "#f0be72", "#f8edd9", "#c8b6ff", "#7cc6fe"];
    for (var i = 0; i < n; i++) {
      var ang = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      var spd = 1.8 + Math.random() * 4.5;
      window.APP_STATE.fireworks.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1.2,
        color: colors[i % colors.length],
        alpha: 1,
        size: 2 + Math.random() * 2.5
      });
    }
  };

  function initAmbientLanterns() {
    window.APP_STATE.skyLanterns = [];
    for (var i = 0; i < 18; i++) {
      window.APP_STATE.skyLanterns.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vy: 0.22 + Math.random() * 0.35,
        size: 6 + Math.random() * 10,
        kind: i % 2 === 0 ? "heart" : "lantern",
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function renderGlobalAmbientAndFX(time) {
    if (document.hidden) return;

    // 1. Ambient Background Canvas (Floating Lanterns, Hearts & Constellation)
    var bgC = document.getElementById("ambient-bg-canvas");
    if (bgC) {
      if (bgC.width !== window.innerWidth || bgC.height !== window.innerHeight) {
        bgC.width = window.innerWidth;
        bgC.height = window.innerHeight;
      }
      var bgCtx = bgC.getContext("2d");
      bgCtx.clearRect(0, 0, bgC.width, bgC.height);

      if (!window.APP_STATE.reducedMotion) {
        window.APP_STATE.skyLanterns.forEach(function(lt) {
          lt.y -= lt.vy;
          lt.x += Math.sin(time * 0.0015 + lt.phase) * 0.3;
          if (lt.y < -30) {
            lt.y = bgC.height + 20;
            lt.x = Math.random() * bgC.width;
          }
          bgCtx.save();
          bgCtx.translate(lt.x, lt.y);
          bgCtx.fillStyle = lt.kind === "heart" ? "rgba(255, 138, 161, 0.22)" : "rgba(240, 190, 114, 0.22)";
          bgCtx.beginPath();
          bgCtx.arc(0, 0, lt.size * 0.6, 0, Math.PI * 2);
          bgCtx.fill();
          bgCtx.restore();
        });
      }
    }

    // 2. Cursor Trail & Fireworks Canvas
    var fwC = document.getElementById("fireworks-canvas");
    if (fwC) {
      if (fwC.width !== window.innerWidth || fwC.height !== window.innerHeight) {
        fwC.width = window.innerWidth;
        fwC.height = window.innerHeight;
      }
      var fwCtx = fwC.getContext("2d");
      fwCtx.clearRect(0, 0, fwC.width, fwC.height);

      // Trail particles
      for (var t = window.APP_STATE.trailParticles.length - 1; t >= 0; t--) {
        var tp = window.APP_STATE.trailParticles[t];
        tp.x += tp.vx;
        tp.y += tp.vy;
        tp.alpha -= 0.035;
        if (tp.alpha <= 0) {
          window.APP_STATE.trailParticles.splice(t, 1);
        } else {
          fwCtx.fillStyle = "rgba(255, 138, 161, " + tp.alpha.toFixed(2) + ")";
          fwCtx.font = "11px serif";
          fwCtx.fillText("♥", tp.x, tp.y);
        }
      }

      // Fireworks particles
      for (var f = window.APP_STATE.fireworks.length - 1; f >= 0; f--) {
        var fp = window.APP_STATE.fireworks[f];
        fp.x += fp.vx;
        fp.y += fp.vy;
        fp.vy += 0.06;
        fp.alpha -= 0.018;
        if (fp.alpha <= 0) {
          window.APP_STATE.fireworks.splice(f, 1);
        } else {
          fwCtx.save();
          fwCtx.globalAlpha = Math.max(0, fp.alpha);
          fwCtx.fillStyle = fp.color;
          fwCtx.beginPath();
          fwCtx.arc(fp.x, fp.y, fp.size, 0, Math.PI * 2);
          fwCtx.fill();
          fwCtx.restore();
        }
      }
    }

    // 3. Active Scene Frame Renderers
    renderHeartOfWordsFrame(time);
    renderOutlineStoryFrame(time);
    renderLivingGardenFrame(time);
    renderThreeHeroFrame(time);
    renderRooftopSketchFrame();
    if (window.APP_STATE.currentScene === 10) updateClockAndCounter();
    renderFinaleOrbitFrame(time);

    requestAnimationFrame(renderGlobalAmbientAndFX);
  }

  // -------------------------------------------------------------------------
  // APPLY CONFIG TO DOM & INITIALISE INTERACTIONS
  // -------------------------------------------------------------------------
  function applyConfigToDOM() {
    var cfg = window.LOVE_CONFIG;
    if (!cfg) return;
    var namesEl = document.getElementById("hud-couple-names");
    if (namesEl) namesEl.textContent = cfg.names.from + " & " + cfg.names.to;

    var qImg = document.getElementById("quiz-cartoon-img");
    if (qImg) {
      qImg.src = cfg.quiz.customCartoonSrc || window.generateRomanticSVGDataURI("couple-cameo", cfg.names.from + " & " + cfg.names.to);
    }
    var qCap = document.getElementById("quiz-cartoon-caption");
    if (qCap) qCap.textContent = cfg.quiz.cartoonCaption;

    var lImg = document.getElementById("letter-polaroid-img");
    if (lImg && cfg.photos[0]) {
      lImg.src = window.getPhotoSrc(cfg.photos[0]);
    }
    var lSal = document.getElementById("letter-salutation");
    if (lSal) lSal.textContent = "My Dearest " + cfg.names.to + ",";
    var lSig = document.getElementById("letter-signature-line");
    if (lSig) lSig.textContent = cfg.names.from + " ♥";

    window.renderMemoryWallAndClothesline();
    updateMusicPlayerUI();
  }

  function setupGlobalEvents() {
    // Pointer move for glow cursor, trail & garden wind
    window.addEventListener("pointermove", function(ev) {
      var dx = ev.clientX - window.APP_STATE.pointerX;
      window.APP_STATE.pointerX = ev.clientX;
      window.APP_STATE.pointerY = ev.clientY;

      var glow = document.getElementById("cursor-glow");
      if (glow) {
        glow.style.left = ev.clientX + "px";
        glow.style.top = ev.clientY + "px";
      }

      if (!window.APP_STATE.reducedMotion && Math.random() < 0.32) {
        window.APP_STATE.trailParticles.push({
          x: ev.clientX,
          y: ev.clientY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -0.6 - Math.random() * 0.8,
          alpha: 0.85
        });
      }

      if (window.APP_STATE.currentScene === 7) {
        window.APP_STATE.gardenTargetWind = Math.max(-1.5, Math.min(1.5, dx * 0.04));
      }
      if (window.APP_STATE.currentScene === 6 && ev.buttons === 1) {
        window.APP_STATE.outlineTiltX = Math.max(-24, Math.min(24, (ev.clientX / window.innerWidth - 0.5) * 36));
      }
    });

    // Living Garden tap to plant / long-press for bouquet / drag to brush
    var gardenCanvas = document.getElementById("living-garden-canvas");
    if (gardenCanvas) {
      var pressTimer = null;
      var longPressTriggered = false;
      gardenCanvas.addEventListener("pointerdown", function(ev) {
        var rect = gardenCanvas.getBoundingClientRect();
        var gx = ev.clientX - rect.left;
        var gy = ev.clientY - rect.top;
        longPressTriggered = false;
        pressTimer = setTimeout(function() {
          longPressTriggered = true;
          window.plantRandomBouquetBurst(gx, Math.max(gy, gardenCanvas.height * 0.68));
        }, 480);
      });
      gardenCanvas.addEventListener("pointerup", function(ev) {
        if (pressTimer) clearTimeout(pressTimer);
        if (!longPressTriggered) {
          var rect = gardenCanvas.getBoundingClientRect();
          var gx = ev.clientX - rect.left;
          var gy = Math.max(ev.clientY - rect.top, gardenCanvas.height * 0.68);
          window.APP_STATE.gardenFlowers.push(createGardenFlower(gx, gy, gardenCanvas.width, gardenCanvas.height));
          window.playSoundEffect("click");
          updateGardenCountLabel();
        }
      });
      gardenCanvas.addEventListener("pointermove", function(ev) {
        if (ev.buttons !== 1) return;
        var rect = gardenCanvas.getBoundingClientRect();
        var gx = ev.clientX - rect.left;
        window.APP_STATE.gardenFlowers.forEach(function(fl) {
          if (Math.abs(fl.x - gx) < 55) {
            fl.bendAngle = (gx < fl.x ? 18 : -18);
          }
        });
      });
    }

    // Keyboard shortcuts (Passcode digits, Arrow nav, S skip, R replay, Esc modal close)
    window.addEventListener("keydown", function(ev) {
      if (ev.target && (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA" || ev.target.tagName === "SELECT")) {
        return;
      }
      if (ev.key === "Escape") {
        window.closeMemoryLightbox();
        window.closeFullscreenMemoriesBoard();
        window.closeBouquetBuilderModal();
        window.closeEditStudioModal();
        window.closeReadmeModal();
        return;
      }
      if (window.APP_STATE.currentScene === 2) {
        if (ev.key >= "0" && ev.key <= "9") {
          window.pressPasscodeDigit(ev.key);
          return;
        } else if (ev.key === "Backspace") {
          window.deletePasscodeDigit();
          return;
        } else if (ev.key === "Enter") {
          window.submitPasscode();
          return;
        }
      }
      if (ev.key === "ArrowRight" || ev.key === "s" || ev.key === "S") {
        window.nextScene();
      } else if (ev.key === "ArrowLeft") {
        window.prevScene();
      } else if ((ev.code === "Space" || ev.key === " ") && window.APP_STATE.currentScene === 9) {
        ev.preventDefault();
        window.toggleRooftopPause();
      } else if ((ev.key === "r" || ev.key === "R") && window.APP_STATE.currentScene === 9) {
        window.startRooftopSketch();
      } else if ((ev.key === "1" || ev.key === "2" || ev.key === "3") && window.APP_STATE.currentScene === 9) {
        var spMap = { "1": 1, "2": 2, "3": 4 };
        window.APP_STATE.rooftopSpeed = spMap[ev.key] || 1;
        var btn = document.getElementById("btn-rooftop-speed");
        if (btn) btn.textContent = window.APP_STATE.rooftopSpeed + "x Speed";
      }
    });

    // Browser Back/Forward History
    window.addEventListener("popstate", function(ev) {
      if (ev.state && ev.state.scene) {
        window.goToScene(ev.state.scene, true);
      }
    });

    // Resize listener
    window.addEventListener("resize", function() {
      if (window.APP_STATE.currentScene === 3) window.restartHeartOfWords();
      if (window.APP_STATE.currentScene === 7) resizeAndInitGarden();
      if (window.APP_STATE.currentScene === 8) initOrResizeThreeHero();
    });
  }

  // Boot on DOMContentLoaded / load
  function bootExperience() {
    var savedCfg = safeLocalGet("love_custom_config");
    if (savedCfg) {
      try {
        var parsed = JSON.parse(savedCfg);
        window.LOVE_CONFIG = Object.assign(window.LOVE_CONFIG, parsed);
      } catch (e) {}
    }

    initAmbientLanterns();
    applyConfigToDOM();
    renderPasscodeDots();
    renderCakeCandles();
    renderMiniBouquetOnLetter();
    setupGlobalEvents();

    // Restore session unlock state if previously unlocked
    if (safeSessionGet("love_unlocked") === "true") {
      unlockSuccessFlow(false);
    }

    window.renderSceneDots();
    window.replayLoadingScene();
    requestAnimationFrame(renderGlobalAmbientAndFX);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootExperience);
  } else {
    bootExperience();
  }
})();
