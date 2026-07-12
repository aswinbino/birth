// --- App Configurations & State ---
let config = {
  bestieName: "Bestie",
  password: "krishhh",
  hint: "What animal has a very long neck? 🦒",
  message: `You're the sunshine on my rainy days, the giggle in every long call, and the friend I never knew I needed until you showed up in my life.

Thank you for laughing at my worst jokes, holding space for the messy days, and celebrating every tiny win like it's the world cup.

This year, may all the good things you've been waiting for finally find you. More little wins. Softer mornings. Louder laughter.`,
  // Comma-separated media file lists for each album
  albumPerfect: "assets/perfect_adventure/pic1.jpg, assets/perfect_adventure/pic2.png, assets/perfect_adventure/pic3.png, assets/perfect_adventure/pic4.png, assets/perfect_adventure/pic5.jpg",
  albumLaughter: "assets/endless_laughter/video1.mp4, assets/endless_laughter/video2.mp4, assets/endless_laughter/video3.mp4, assets/endless_laughter/video4.mp4, assets/endless_laughter/video5.mp4",
  albumCelebrations: "assets/celebrations/video1.mp4, assets/celebrations/pic1.jpeg, assets/celebrations/video3.mp4, assets/celebrations/video4.mp4, assets/celebrations/video5.mp4",
  albumBesties: "assets/besties_forever/pic1.jpg, assets/besties_forever/pic2.jpg, assets/besties_forever/pic3.jpg, assets/besties_forever/video1.mp4, assets/besties_forever/video2.mp4, assets/besties_forever/video3.mp4, assets/besties_forever/video4.mp4"
};

// State variables
let openedSurprises = {
  memories: false,
  letter: false,
  song: false
};

// Audio states
let audioCtx = null;
let musicPlaying = false;
let melodyInterval = null;

// Load custom settings from localStorage if available
if (localStorage.getItem("bestie_birthday_config")) {
  try {
    const loadedConfig = JSON.parse(localStorage.getItem("bestie_birthday_config"));
    if (loadedConfig && typeof loadedConfig === "object") {
      config = { ...config, ...loadedConfig };
    }
  } catch (e) {
    console.error("Error parsing config", e);
  }
}

// Force migrate/overwrite perfect adventure, endless laughter, celebrations, and besties to local paths on startup
config.albumPerfect = "assets/perfect_adventure/pic1.jpg, assets/perfect_adventure/pic2.png, assets/perfect_adventure/pic3.png, assets/perfect_adventure/pic4.png, assets/perfect_adventure/pic5.jpg";
config.albumLaughter = "assets/endless_laughter/video1.mp4, assets/endless_laughter/video2.mp4, assets/endless_laughter/video3.mp4, assets/endless_laughter/video4.mp4, assets/endless_laughter/video5.mp4";
config.albumCelebrations = "assets/celebrations/video1.mp4, assets/celebrations/pic1.jpeg, assets/celebrations/video3.mp4, assets/celebrations/video4.mp4, assets/celebrations/video5.mp4";
config.albumBesties = "assets/besties_forever/pic1.jpg, assets/besties_forever/pic2.jpg, assets/besties_forever/pic3.jpg, assets/besties_forever/video1.mp4, assets/besties_forever/video2.mp4, assets/besties_forever/video3.mp4, assets/besties_forever/video4.mp4";
if (config.password === "giraffe") {
  config.password = "krishhh";
}
localStorage.setItem("bestie_birthday_config", JSON.stringify(config));

document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initConfetti();
  setupEventListeners();
});

// Helper to parse comma-separated album media paths
function getAlbumMediaList(albumKey) {
  let fileString = "";
  if (albumKey === "perfect_adventure") fileString = config.albumPerfect;
  else if (albumKey === "endless_laughter") fileString = config.albumLaughter;
  else if (albumKey === "celebrations") fileString = config.albumCelebrations;
  else if (albumKey === "besties_forever") fileString = config.albumBesties;

  if (!fileString) return [];
  return fileString.split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => {
      const isVideo = /\.(mp4|webm|ogg|mov|m4v)$/i.test(s);
      return {
        type: isVideo ? "video" : "image",
        src: s,
        caption: s.substring(s.lastIndexOf('/') + 1)
      };
    });
}

// Apply configurations to DOM
function applyConfig() {
  document.querySelectorAll(".bestie-name-placeholder").forEach(el => el.textContent = config.bestieName);
  
  const hintTextEl = document.getElementById("pwd-hint-text");
  if (hintTextEl) hintTextEl.textContent = config.hint;

  // Format Letter contents by breaking paragraphs
  const letterBody = document.querySelector(".letter-content-body");
  if (letterBody) {
    const paragraphs = config.message.split("\n\n");
    let html = "";
    paragraphs.forEach((p, idx) => {
      if (idx === paragraphs.length - 1) {
        html += `<p class="letter-closing">${p.replace(/\n/g, "<br>")}</p>`;
      } else {
        html += `<p>${p.replace(/\n/g, "<br>")}</p>`;
      }
    });
    // Add signature tag at the end if not there
    if (!html.includes("I love you. Forever your tall friend.")) {
      html += `<p class="letter-closing">I love you. Forever your tall friend. 🦒</p>`;
    }
    letterBody.innerHTML = html;
  }

  // Set cover images for search results
  const albumCards = document.querySelectorAll(".result-img-card");
  albumCards.forEach(card => {
    const albumKey = card.getAttribute("data-album");
    const mediaList = getAlbumMediaList(albumKey);
    const imgEl = card.querySelector("img");
    const capEl = card.querySelector(".result-cap");

    // Programmatically override the caption and alt text for perfect_adventure to "best pic of meesa"
    if (albumKey === "perfect_adventure") {
      if (capEl) capEl.textContent = "best pic of meesa";
      if (imgEl) imgEl.alt = "best pic of meesa";
    }

    if (imgEl && mediaList.length > 0) {
      if (mediaList[0].type === "video") {
        if (albumKey === "endless_laughter") {
          imgEl.src = "assets/endless_laughter/cover.jpg";
        } else if (albumKey === "celebrations") {
          imgEl.src = "assets/celebrations/cover.jpg";
        } else {
          imgEl.src = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&auto=format&fit=crop&q=80"; // Video icon camera placeholder
        }
      } else {
        imgEl.src = mediaList[0].src;
      }
    }
  });

  // Set values in settings drawer inputs safely
  const elBestieName = document.getElementById("set-bestie-name");
  if (elBestieName) elBestieName.value = config.bestieName;

  const elPassword = document.getElementById("set-password");
  if (elPassword) elPassword.value = config.password;

  const elHint = document.getElementById("set-hint");
  if (elHint) elHint.value = config.hint;

  const elMessage = document.getElementById("set-message");
  if (elMessage) elMessage.value = config.message;
  
  const elAlbumPerfect = document.getElementById("set-album-perfect");
  if (elAlbumPerfect) elAlbumPerfect.value = config.albumPerfect || "";

  const elAlbumLaughter = document.getElementById("set-album-laughter");
  if (elAlbumLaughter) elAlbumLaughter.value = config.albumLaughter || "";

  const elAlbumCelebrations = document.getElementById("set-album-celebrations");
  if (elAlbumCelebrations) elAlbumCelebrations.value = config.albumCelebrations || "";

  const elAlbumBesties = document.getElementById("set-album-besties");
  if (elAlbumBesties) elAlbumBesties.value = config.albumBesties || "";
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  const passwordInput = document.getElementById("password-input");
  const captchaCheckbox = document.getElementById("captcha-checkbox");
  const btnSubmit = document.getElementById("btn-submit-password");
  const errorMsg = document.getElementById("password-error");

  const validateForm = () => {
    if (passwordInput.value.length > 0 && captchaCheckbox.checked) {
      btnSubmit.removeAttribute("disabled");
    } else {
      btnSubmit.setAttribute("disabled", "true");
    }
  };

  passwordInput.addEventListener("input", validateForm);
  captchaCheckbox.addEventListener("change", validateForm);

  // Toggle Password text visibility
  const togglePwdBtn = document.getElementById("toggle-password-visibility");
  togglePwdBtn.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePwdBtn.textContent = "🙈";
    } else {
      passwordInput.type = "password";
      togglePwdBtn.textContent = "👁️";
    }
  });

  // Password submission (Any non-empty password is accepted for safety/cache proof)
  btnSubmit.addEventListener("click", () => {
    errorMsg.style.display = "none";
    transitionStage("stage-password", "stage-welcome");
  });

  // Password Hint Toggler
  const btnHint = document.getElementById("btn-hint");
  const hintTooltip = document.getElementById("hint-tooltip");
  btnHint.addEventListener("click", (e) => {
    e.stopPropagation();
    hintTooltip.classList.toggle("hidden");
  });

  document.addEventListener("click", () => {
    hintTooltip.classList.add("hidden");
  });

  // Welcome page button redirects
  const btnAccept = document.getElementById("btn-accept");
  const btnDecline = document.getElementById("btn-decline");
  const btnAngryBack = document.getElementById("btn-angry-back");

  btnAccept.addEventListener("click", () => {
    transitionStage("stage-welcome", "stage-selection");
  });

  btnDecline.addEventListener("click", () => {
    transitionStage("stage-welcome", "stage-angry");
  });

  btnAngryBack.addEventListener("click", () => {
    transitionStage("stage-angry", "stage-welcome");
  });

  const btnWelcomeBack = document.getElementById("btn-welcome-back");
  btnWelcomeBack.addEventListener("click", () => {
    transitionStage("stage-welcome", "stage-password");
  });

  // Surprise Cards clicks
  const cards = document.querySelectorAll(".surprise-card");
  const btnNext = document.getElementById("btn-selection-next");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const surprise = card.getAttribute("data-surprise");
      
      // Mark as opened
      openedSurprises[surprise] = true;
      card.classList.add("opened");

      // Check if all are opened
      if (openedSurprises.memories && openedSurprises.letter && openedSurprises.song) {
        btnNext.removeAttribute("disabled");
      }

      // Transition to details sub-stage
      transitionStage("stage-selection", `stage-${surprise}-details`);

      // Special action: if song, auto-trigger play state
      if (surprise === "song") {
        toggleSong(true);
      }
    });
  });

  // Details subpages "go back" triggers
  const btnBacks = document.querySelectorAll(".btn-back-selection");
  btnBacks.forEach(btn => {
    btn.addEventListener("click", () => {
      // If we go back from song details, stop the music
      toggleSong(false);
      
      // Transition back
      const activeStage = document.querySelector(".card-stage.active");
      if (activeStage) {
        transitionStage(activeStage.id, "stage-selection");
      }
    });
  });

  // Song details controls
  const btnPlayPauseSong = document.getElementById("btn-play-pause-song");
  btnPlayPauseSong.addEventListener("click", () => {
    toggleSong(!musicPlaying);
  });

  // Selection "next" click -> Birthday Polaroid Card
  btnNext.addEventListener("click", () => {
    transitionStage("stage-selection", "stage-birthday-card");
    // Trigger confetti immediately when entering birthday greeting card!
    setTimeout(() => {
      triggerConfetti();
      playVictoryChord();
    }, 450);
  });

  const btnSelectionBack = document.getElementById("btn-selection-back");
  btnSelectionBack.addEventListener("click", () => {
    transitionStage("stage-selection", "stage-welcome");
  });

  // "one more thing" click -> Cake Finale
  const btnOneMoreThing = document.getElementById("btn-one-more-thing");
  btnOneMoreThing.addEventListener("click", () => {
    // Pause voice note on navigation
    const voiceAudio = document.getElementById("voice-message-audio");
    if (voiceAudio) {
      voiceAudio.pause();
      const voicePlayIcon = document.querySelector(".voice-play-icon");
      const voicePauseIcon = document.querySelector(".voice-pause-icon");
      const voiceStatus = document.querySelector(".voice-status");
      if (voiceStatus) voiceStatus.textContent = "click to listen";
      if (voicePlayIcon) voicePlayIcon.classList.remove("hidden");
      if (voicePauseIcon) voicePauseIcon.classList.add("hidden");
    }
    transitionStage("stage-birthday-card", "stage-cake-finale");
  });

  const btnBirthdayCardBack = document.getElementById("btn-birthday-card-back");
  btnBirthdayCardBack.addEventListener("click", () => {
    // Pause voice note on navigation
    const voiceAudio = document.getElementById("voice-message-audio");
    if (voiceAudio) {
      voiceAudio.pause();
      const voicePlayIcon = document.querySelector(".voice-play-icon");
      const voicePauseIcon = document.querySelector(".voice-pause-icon");
      const voiceStatus = document.querySelector(".voice-status");
      if (voiceStatus) voiceStatus.textContent = "click to listen";
      if (voicePlayIcon) voicePlayIcon.classList.remove("hidden");
      if (voicePauseIcon) voicePauseIcon.classList.add("hidden");
    }
    transitionStage("stage-birthday-card", "stage-selection");
  });

  const btnCakeBack = document.getElementById("btn-cake-back");
  btnCakeBack.addEventListener("click", () => {
    // Pause wish video on navigation
    const wishVideo = document.getElementById("wish-video-player");
    if (wishVideo) wishVideo.pause();
    transitionStage("stage-cake-finale", "stage-birthday-card");
  });

  // Voice Note Details controls
  const btnPlayPauseVoice = document.getElementById("btn-play-pause-voice");
  if (btnPlayPauseVoice) {
    btnPlayPauseVoice.addEventListener("click", () => {
      const voiceAudio = document.getElementById("voice-message-audio");
      const voicePlayIcon = btnPlayPauseVoice.querySelector(".voice-play-icon");
      const voicePauseIcon = btnPlayPauseVoice.querySelector(".voice-pause-icon");
      const voiceStatus = btnPlayPauseVoice.querySelector(".voice-status");

      if (voiceAudio) {
        if (voiceAudio.paused) {
          voiceAudio.play().catch(e => console.warn(e));
          voiceStatus.textContent = "playing message... 🔊";
          if (voicePlayIcon) voicePlayIcon.classList.add("hidden");
          if (voicePauseIcon) voicePauseIcon.classList.remove("hidden");
        } else {
          voiceAudio.pause();
          voiceStatus.textContent = "click to listen";
          if (voicePlayIcon) voicePlayIcon.classList.remove("hidden");
          if (voicePauseIcon) voicePauseIcon.classList.add("hidden");
        }
      }
    });
  }

  // Candle Extinguishing Click
  const candles = document.querySelectorAll(".candle");
  candles.forEach(candle => {
    candle.addEventListener("click", () => {
      if (candle.classList.contains("active-candle")) {
        candle.classList.remove("active-candle");
        playBlowSound();
        checkCandles();
      }
    });
  });

  // Relight candles
  const btnRelight = document.getElementById("btn-relight");
  btnRelight.addEventListener("click", () => {
    candles.forEach(c => c.classList.add("active-candle"));
    btnRelight.classList.add("hidden");
    document.getElementById("btn-restart-app").classList.add("hidden");
  });

  // Wish Notepad Event Listener
  const wishNotepad = document.getElementById("wish-notepad-text");
  const saveStatus = document.getElementById("notepad-save-status");
  
  if (wishNotepad) {
    // Load existing wish note
    const savedNote = localStorage.getItem("bestie_wish_note");
    if (savedNote) {
      wishNotepad.value = savedNote;
    }

    let saveTimeout = null;
    wishNotepad.addEventListener("input", () => {
      if (saveStatus) saveStatus.textContent = "Saving... 🔄";
      
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        localStorage.setItem("bestie_wish_note", wishNotepad.value);
        if (saveStatus) saveStatus.textContent = "Saved automatically! 💾";
      }, 600);
    });
  }

  // Restart application button (Start Over)
  const btnRestartApp = document.getElementById("btn-restart-app");
  btnRestartApp.addEventListener("click", () => {
    // Pause wish video on restart
    const wishVideo = document.getElementById("wish-video-player");
    if (wishVideo) wishVideo.pause();

    // Reset surprises state
    openedSurprises = { memories: false, letter: false, song: false };
    cards.forEach(c => c.classList.remove("opened"));
    btnNext.setAttribute("disabled", "true");

    // Relight candles
    candles.forEach(c => c.classList.add("active-candle"));
    btnRelight.classList.add("hidden");
    btnRestartApp.classList.add("hidden");

    // Reset password inputs
    passwordInput.value = "";
    passwordInput.type = "text";
    togglePwdBtn.textContent = "🙈";
    captchaCheckbox.checked = false;
    validateForm();

    // Stop music
    toggleSong(false);

    // Transition back to Stage 1
    transitionStage("stage-cake-finale", "stage-password");
  });

  // Settings Drawer control
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const settingsClose = document.getElementById("settings-close");
  const btnSave = document.getElementById("btn-save-settings");

  settingsToggle.addEventListener("click", () => {
    settingsPanel.classList.remove("hidden");
  });

  settingsClose.addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
  });

  btnSave.addEventListener("click", () => {
    const elBestieName = document.getElementById("set-bestie-name");
    if (elBestieName) config.bestieName = elBestieName.value.trim();

    const elPassword = document.getElementById("set-password");
    if (elPassword) config.password = elPassword.value.trim();

    const elHint = document.getElementById("set-hint");
    if (elHint) config.hint = elHint.value.trim();

    const elMessage = document.getElementById("set-message");
    if (elMessage) config.message = elMessage.value.trim();

    const elAlbumPerfect = document.getElementById("set-album-perfect");
    if (elAlbumPerfect) config.albumPerfect = elAlbumPerfect.value.trim();

    const elAlbumLaughter = document.getElementById("set-album-laughter");
    if (elAlbumLaughter) config.albumLaughter = elAlbumLaughter.value.trim();

    const elAlbumCelebrations = document.getElementById("set-album-celebrations");
    if (elAlbumCelebrations) config.albumCelebrations = elAlbumCelebrations.value.trim();

    const elAlbumBesties = document.getElementById("set-album-besties");
    if (elAlbumBesties) config.albumBesties = elAlbumBesties.value.trim();

    localStorage.setItem("bestie_birthday_config", JSON.stringify(config));
    applyConfig();

    settingsPanel.classList.add("hidden");

    // Full Reset and start over
    openedSurprises = { memories: false, letter: false, song: false };
    cards.forEach(c => c.classList.remove("opened"));
    btnNext.setAttribute("disabled", "true");
    candles.forEach(c => c.classList.add("active-candle"));
    btnRelight.classList.add("hidden");
    btnRestartApp.classList.add("hidden");
    toggleSong(false);

    passwordInput.value = "";
    passwordInput.type = "text";
    togglePwdBtn.textContent = "🙈";
    captchaCheckbox.checked = false;
    validateForm();

    const activeStage = document.querySelector(".card-stage.active");
    if (activeStage) {
      transitionStage(activeStage.id, "stage-password");
    }
  });

  // --- Gallery Lightbox Event Listeners ---
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxMedia = document.getElementById("lightbox-media-container");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  let currentAlbumKey = "";
  let currentAlbumMedia = [];
  let currentMediaIndex = 0;

  const showMediaItem = (idx) => {
    if (idx < 0 || idx >= currentAlbumMedia.length) return;
    currentMediaIndex = idx;
    const item = currentAlbumMedia[idx];

    // Clear previous media
    lightboxMedia.innerHTML = "";

    if (item.type === "video") {
      const videoEl = document.createElement("video");
      videoEl.src = item.src;
      videoEl.controls = true;
      videoEl.autoplay = true;
      lightboxMedia.appendChild(videoEl);
    } else {
      const imgEl = document.createElement("img");
      imgEl.src = item.src;
      lightboxMedia.appendChild(imgEl);
    }

    lightboxCaption.textContent = `${idx + 1} / ${currentAlbumMedia.length}`;

    // Toggle navigation button visibility
    if (currentAlbumMedia.length <= 1) {
      lightboxPrev.classList.add("hidden");
      lightboxNext.classList.add("hidden");
    } else {
      lightboxPrev.classList.remove("hidden");
      lightboxNext.classList.remove("hidden");
    }
  };

  // Click on memory card slots to open lightbox
  const resultCards = document.querySelectorAll(".result-img-card");
  resultCards.forEach(card => {
    card.addEventListener("click", () => {
      currentAlbumKey = card.getAttribute("data-album");
      currentAlbumMedia = getAlbumMediaList(currentAlbumKey);
      if (currentAlbumMedia.length === 0) return;

      lightbox.classList.remove("hidden");
      lightbox.classList.add("active");
      showMediaItem(0);
    });
  });

  // Navigation and Close
  lightboxClose.addEventListener("click", () => {
    const video = lightboxMedia.querySelector("video");
    if (video) video.pause();
    lightbox.classList.remove("active");
    lightbox.classList.add("hidden");
  });

  lightboxPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    let prevIdx = currentMediaIndex - 1;
    if (prevIdx < 0) prevIdx = currentAlbumMedia.length - 1;
    showMediaItem(prevIdx);
  });

  lightboxNext.addEventListener("click", (e) => {
    e.stopPropagation();
    let nextIdx = currentMediaIndex + 1;
    if (nextIdx >= currentAlbumMedia.length) nextIdx = 0;
    showMediaItem(nextIdx);
  });
}

// Stage transition helper
function transitionStage(fromId, toId) {
  const fromEl = document.getElementById(fromId);
  const toEl = document.getElementById(toId);

  fromEl.style.opacity = "0";
  fromEl.style.transform = "translateY(-15px)";
  
  setTimeout(() => {
    fromEl.classList.remove("active");
    toEl.classList.add("active");
    toEl.offsetHeight; // force repaint
    toEl.style.opacity = "1";
    toEl.style.transform = "translateY(0)";
  }, 350);
}

// Check candles blowing complete
function checkCandles() {
  const activeCandles = document.querySelectorAll(".active-candle");
  if (activeCandles.length === 0) {
    triggerConfetti();
    playVictoryChord();
    document.getElementById("btn-relight").classList.remove("hidden");
    document.getElementById("btn-restart-app").classList.remove("hidden");
  }
}

// --- Synthesized Sound Generator (Web Audio API) ---
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playBlowSound() {
  initAudio();
  if (!audioCtx) return;

  const bufferSize = audioCtx.sampleRate * 0.15;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start();
}

function playVictoryChord() {
  initAudio();
  if (!audioCtx) return;
  
  const chordNotes = [261.63, 329.63, 392.00, 523.25];
  const now = audioCtx.currentTime;

  chordNotes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.05);
    
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05 + index * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  });
}

let customAudioEl = null;
let useSynthesizerFallback = false;

function toggleSong(play) {
  const waveEl = document.getElementById("music-bars");
  const playIcon = document.querySelector(".play-icon");
  const pauseIcon = document.querySelector(".pause-icon");

  if (!customAudioEl) {
    customAudioEl = document.createElement("audio");
    customAudioEl.id = "custom-song-audio";
    customAudioEl.src = "assets/song.ogg";
    customAudioEl.loop = true;
    
    customAudioEl.onerror = () => {
      console.warn("Could not load assets/song.ogg, falling back to synthesiser tune.");
      useSynthesizerFallback = true;
      if (musicPlaying) {
        initAudio();
        playHappyBirthdayTune();
      }
    };
    
    document.body.appendChild(customAudioEl);
  }

  if (play) {
    if (musicPlaying) return;
    musicPlaying = true;
    if (waveEl) waveEl.classList.remove("hidden");
    if (waveEl) waveEl.classList.add("playing");
    if (playIcon) playIcon.classList.add("hidden");
    if (pauseIcon) pauseIcon.classList.remove("hidden");

    if (useSynthesizerFallback) {
      initAudio();
      playHappyBirthdayTune();
    } else {
      customAudioEl.play().catch(err => {
        console.warn("Autoplay block or error, trying synthesiser:", err);
        useSynthesizerFallback = true;
        initAudio();
        playHappyBirthdayTune();
      });
    }
  } else {
    musicPlaying = false;
    if (waveEl) waveEl.classList.add("hidden");
    if (waveEl) waveEl.classList.remove("playing");
    if (playIcon) playIcon.classList.remove("hidden");
    if (pauseIcon) pauseIcon.classList.add("hidden");

    if (melodyInterval) {
      clearInterval(melodyInterval);
      melodyInterval = null;
    }
    if (customAudioEl) {
      customAudioEl.pause();
    }
  }
}

// Retro melody looping
function playHappyBirthdayTune() {
  const tempo = 130;
  const beatDuration = 60 / tempo;

  const melody = [
    { freq: 261.63, dur: 0.75 },
    { freq: 261.63, dur: 0.25 },
    { freq: 293.66, dur: 1.0 },
    { freq: 261.63, dur: 1.0 },
    { freq: 349.23, dur: 1.0 },
    { freq: 329.63, dur: 2.0 },
    
    { freq: 261.63, dur: 0.75 },
    { freq: 261.63, dur: 0.25 },
    { freq: 293.66, dur: 1.0 },
    { freq: 261.63, dur: 1.0 },
    { freq: 392.00, dur: 1.0 },
    { freq: 349.23, dur: 2.0 },
    
    { freq: 261.63, dur: 0.75 },
    { freq: 261.63, dur: 0.25 },
    { freq: 523.25, dur: 1.0 },
    { freq: 440.00, dur: 1.0 },
    { freq: 349.23, dur: 1.0 },
    { freq: 329.63, dur: 1.0 },
    { freq: 293.66, dur: 1.0 },
    
    { freq: 466.16, dur: 0.75 },
    { freq: 466.16, dur: 0.25 },
    { freq: 440.00, dur: 1.0 },
    { freq: 349.23, dur: 1.0 },
    { freq: 392.00, dur: 1.0 },
    { freq: 349.23, dur: 2.0 }
  ];

  let currentNoteIndex = 0;

  const playNextNote = () => {
    if (!musicPlaying) return;
    
    const note = melody[currentNoteIndex];
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, now);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (note.dur * beatDuration) - 0.02);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + (note.dur * beatDuration));
    
    melodyInterval = setTimeout(() => {
      currentNoteIndex = (currentNoteIndex + 1) % melody.length;
      playNextNote();
    }, note.dur * beatDuration * 1000);
  };

  playNextNote();
}

// --- Confetti Particle System ---
let canvas = null;
let ctx = null;
let particles = [];
const particleCount = 120;
let isCelebrating = false;

function initConfetti() {
  canvas = document.getElementById("confetti-canvas");
  ctx = canvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

function triggerConfetti() {
  isCelebrating = true;
  particles = [];
  const colors = ["#FF8CBF", "#5F44C1", "#FFE2A0", "#09B83E", "#4285F4", "#FF5C5C"];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * particleCount,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }

  requestAnimationFrame(updateConfetti);
}

function updateConfetti() {
  if (!isCelebrating) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let activeParticles = 0;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.tiltAngle += p.tiltAngleIncremental;
    p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
    p.x += Math.sin(p.tiltAngle);
    p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

    if (p.y <= canvas.height) {
      activeParticles++;
    }

    ctx.beginPath();
    ctx.lineWidth = p.r;
    ctx.strokeStyle = p.color;
    ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
    ctx.stroke();
  }

  if (activeParticles > 0) {
    requestAnimationFrame(updateConfetti);
  } else {
    isCelebrating = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
