/**
 * Coffee Control API — POC wrapper over PWA / browser media APIs
 * coffee.camera() → getUserMedia → opens camera stream
 * coffee.switchCamera() → stop current stream, reopen with new facingMode (selfie ↔ rear)
 * coffee.streamSpectrum(canvas, stream) → mic / stream frequency visualizer (Web Audio)
 */

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

const coffee = {
  /**
   * Opens the camera via getUserMedia and returns a promise that resolves
   * with { stream, videoEl } — stream for raw access, videoEl for display.
   * If no target selector provided, creates and appends a video to body.
   * @param {object} opts - { target: '#my-video', facingMode: 'user'|'environment', audio: false }
   * @returns {Promise<{ stream: MediaStream, videoEl: HTMLVideoElement }>}
   */
  async camera(opts = {}) {
    const { target, facingMode = 'user', audio = false } = opts;
    const constraints = {
      video: { facingMode },
      audio
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    let videoEl = target ? document.querySelector(target) : null;
    if (!videoEl) {
      videoEl = document.createElement('video');
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.style.cssText = 'max-width:100%; height:auto; border:2px solid #c6712b; border-radius:8px;';
      document.body.appendChild(videoEl);
    }
    videoEl.srcObject = stream;
    return { stream, videoEl };
  },

  /**
   * Stops the current camera stream (if any) and opens a new one — e.g. flip selfie ↔ rear.
   * @param {object} opts - { target: '#my-video', currentStream, facingMode: 'user'|'environment', audio }
   * @returns {Promise<{ stream: MediaStream, videoEl: HTMLVideoElement }>}
   */
  async switchCamera(opts = {}) {
    const { target, currentStream, facingMode = 'user', audio = false } = opts;
    if (currentStream && typeof currentStream.getTracks === 'function') {
      currentStream.getTracks().forEach((t) => t.stop());
    }
    return coffee.camera({ target, facingMode, audio });
  },

  /**
   * Captures a still frame from a video element (e.g. from coffee.camera()).
   * @param {HTMLVideoElement} videoEl - Video element with srcObject = stream
   * @param {string} format - 'png' | 'jpeg' (default 'png')
   * @returns {string} Data URL (e.g. "data:image/png;base64,...")
   */
  capture(videoEl, format = 'png') {
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0);
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    return canvas.toDataURL(mime);
  },

  /**
   * Gets the microphone stream via getUserMedia.
   * @returns {Promise<{ stream: MediaStream }>}
   */
  async microphone() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return { stream };
  },

  /**
   * Creates a recorder for a media stream. Does not start until .start() is called.
   * @param {MediaStream} stream - From coffee.microphone() or coffee.camera()
   * @returns {{ start: function, stop: function }} Object with start() and stop()
   */
  record(stream) {
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    return {
      start() { recorder.start(); },
      async stop() {
        return new Promise((resolve) => {
          recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
          recorder.stop();
        });
      }
    };
  },

  /**
   * Live frequency-bar visualizer for a MediaStream (mic, etc.) using Web Audio AnalyserNode.
   * Parallel to MediaRecorder — does not replace coffee.record(stream).
   * Call start() after a user gesture; resume audioContext if the browser suspended it.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {MediaStream} stream - e.g. from coffee.microphone()
   * @param {object} [opts]
   * @param {number} [opts.fftSize=256] - AnalyserNode.fftSize (power of two)
   * @param {number} [opts.barWidthMult=2.5] - Bar width vs bin count
   * @param {number} [opts.gap=1] - Gap between bars (CSS pixels, scaled by DPR)
   * @param {number} [opts.cornerRadius=5] - Bar corner radius when roundRect exists
   * @param {function(number, number, number): string} [opts.barColor] - (byteValue, index, alpha 0–1) => CSS color
   * @param {string} [opts.barColor] - Static CSS color for all bars
   * @returns {{ audioContext: AudioContext, analyser: AnalyserNode, resize: function, start: function, stop: function, close: function }}
   */
  streamSpectrum(canvas, stream, opts = {}) {
    if (!canvas || typeof canvas.getContext !== 'function') {
      throw new Error('coffee.streamSpectrum: canvas element required');
    }
    if (!stream || typeof stream.getTracks !== 'function') {
      throw new Error('coffee.streamSpectrum: MediaStream required');
    }
    const fftSize = opts.fftSize || 256;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const audioContext = new Ctx();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    source.connect(analyser);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('coffee.streamSpectrum: 2d context unavailable');

    let animationId = null;
    const barWidthMult = opts.barWidthMult ?? 2.5;
    const gap = opts.gap ?? 1;
    const cornerRadius = opts.cornerRadius ?? 5;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth || (canvas.parentElement && canvas.parentElement.offsetWidth) || 300;
      const h = canvas.offsetHeight || 120;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
    }

    function drawFrame() {
      animationId = requestAnimationFrame(drawFrame);
      analyser.getByteFrequencyData(dataArray);
      const w = canvas.width;
      const h = canvas.height;
      const barWidth = (w / bufferLength) * barWidthMult;
      ctx.clearRect(0, 0, w, h);
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i];
        const barHeight = (v / 255) * h * 0.8;
        const alpha = v / 255;
        if (typeof opts.barColor === 'function') {
          ctx.fillStyle = opts.barColor(v, i, alpha);
        } else if (typeof opts.barColor === 'string') {
          ctx.fillStyle = opts.barColor;
        } else {
          ctx.fillStyle = `rgba(79, 70, 229, ${alpha})`;
        }
        const y = (h - barHeight) / 2;
        const bw = Math.max(1, barWidth - gap);
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, bw, barHeight, cornerRadius);
        } else {
          ctx.rect(x, y, bw, barHeight);
        }
        ctx.fill();
        x += barWidth + gap;
      }
    }

    return {
      audioContext,
      analyser,
      resize: resizeCanvas,
      start() {
        resizeCanvas();
        if (animationId != null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        drawFrame();
      },
      stop() {
        if (animationId != null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
      close() {
        this.stop();
        try {
          source.disconnect();
          analyser.disconnect();
        } catch (e) { /* ignore */ }
        return audioContext.close().catch(() => {});
      }
    };
  },

  /**
   * Gets current position via Geolocation API.
   * @returns {Promise<{ lat: number, lng: number, accuracy: number }>}
   */
  geolocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }),
        (err) => reject(err),
        { enableHighAccuracy: true }
      );
    });
  },

  /**
   * Reverse geocode: lat/lng → address (OpenStreetMap Nominatim, free, no key).
   * Usage limit: 1 req/sec. Requires User-Agent.
   * @param {number} lat
   * @param {number} lng
   * @returns {Promise<{ display_name: string, address: object }>}
   */
  async geocode(lat, lng) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'CoffeeControl/1.0' } }
    );
    if (!res.ok) throw new Error('Geocode failed');
    return res.json();
  },

  // ─── High value ─────────────────────────────────────────────────────────

  /**
   * Shows a browser notification. Call once to request permission.
   * @param {string} title
   * @param {object} opts - { body, icon }
   */
  async notify(title, opts = {}) {
    if (!('Notification' in window)) throw new Error('Notifications not supported');
    if (Notification.permission === 'default') await Notification.requestPermission();
    if (Notification.permission !== 'granted') throw new Error('Notification permission denied');
    return new Notification(title, opts);
  },

  clipboard: {
    async write(text) {
      await navigator.clipboard.writeText(text);
    },
    async read() {
      return navigator.clipboard.readText();
    }
  },

  /**
   * Native share sheet (mobile/desktop). Requires user gesture.
   * @param {object} data - { title, text, url }
   */
  async share(data) {
    if (!navigator.share) throw new Error('Web Share not supported');
    return navigator.share(data);
  },

  /**
   * Screen/tab capture via getDisplayMedia.
   * @returns {Promise<{ stream: MediaStream, videoEl?: HTMLVideoElement }>}
   */
  async screen(opts = {}) {
    const { video = true, audio = false } = opts;
    const stream = await navigator.mediaDevices.getDisplayMedia({ video, audio });
    let videoEl = opts.target ? document.querySelector(opts.target) : null;
    if (!videoEl) {
      videoEl = document.createElement('video');
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.style.cssText = 'max-width:100%; height:auto; border:2px solid #c6712b; border-radius:8px;';
      document.body.appendChild(videoEl);
    }
    videoEl.srcObject = stream;
    return { stream, videoEl };
  },

  // ─── Useful ─────────────────────────────────────────────────────────────

  /**
   * Toggle fullscreen on element (or document.body).
   * @param {HTMLElement} el
   */
  async fullscreen(el = document.body) {
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  },

  /**
   * Keep screen on. Returns { release() } to unlock.
   * @returns {Promise<{ release: function }>}
   */
  async wakeLock() {
    if (!navigator.wakeLock) throw new Error('Wake Lock not supported');
    const lock = await navigator.wakeLock.request('screen');
    return {
      release() { lock.release(); }
    };
  },

  /**
   * Haptic vibration (mobile). Pattern: [vibrate, pause, vibrate, ...] ms.
   * @param {number|number[]} pattern - e.g. 100 or [100, 50, 100]
   */
  vibrate(pattern = 100) {
    if (!navigator.vibrate) return false;
    return navigator.vibrate(pattern);
  },

  /**
   * Storage quota estimate.
   * @returns {Promise<{ usage: number, quota: number, percent: number }>}
   */
  async storageQuota() {
    if (!navigator.storage?.estimate) throw new Error('Storage estimate not supported');
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return {
      usage,
      quota,
      percent: quota ? Math.round((usage / quota) * 100) : 0
    };
  },

  serviceWorker: {
    /**
     * Register a service worker. The worker script is a separate file (runs in its own context).
     * Requires HTTPS or localhost.
     * @param {string} path - Path to SW file (e.g. './coffee-worker.js')
     * @param {object} opts - { scope } optional
     * @returns {Promise<ServiceWorkerRegistration>}
     */
    async register(path, opts = {}) {
      if (!('serviceWorker' in navigator)) throw new Error('Service Worker not supported');
      return navigator.serviceWorker.register(path, opts);
    }
  },

  /**
   * Simple key-value storage (localStorage). Persists across sessions.
   * Values are JSON-serialized. ~5MB limit per origin.
   * @param {string} key
   * @param {any} value - string, number, object, array
   */
  save(key, value) {
    localStorage.setItem('coffee_' + key, JSON.stringify(value));
  },

  /**
   * Load a value from storage.
   * @param {string} key
   * @returns {any} Parsed value, or null if not found
   */
  load(key) {
    const raw = localStorage.getItem('coffee_' + key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  },

  /**
   * Remove a key from storage.
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem('coffee_' + key);
  },

  /**
   * Clear all keys saved via coffee.save().
   */
  clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('coffee_'));
    keys.forEach(k => localStorage.removeItem(k));
  },

  // ─── Speech (TTS / STT) ──────────────────────────────────────────────────

  /**
   * Text-to-speech. Uses Speech Synthesis API.
   * @param {string} text - Text to speak
   * @param {object} opts - { rate: 1, pitch: 1, voice: SpeechSynthesisVoice }
   * @returns {Promise<void>} Resolves when done speaking
   */
  speak(text, opts = {}) {
    if (!('speechSynthesis' in window)) return Promise.reject(new Error('Speech Synthesis not supported'));
    return new Promise((resolve, reject) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 1;
      u.pitch = opts.pitch ?? 1;
      u.volume = opts.volume ?? 1;
      if (opts.voice) u.voice = opts.voice;
      u.onend = () => resolve();
      u.onerror = (e) => reject(e);
      speechSynthesis.speak(u);
    });
  },

  /**
   * Get available TTS voices.
   * @returns {Promise<SpeechSynthesisVoice[]>}
   */
  async voices() {
    if (!('speechSynthesis' in window)) return [];
    let v = speechSynthesis.getVoices();
    if (v.length === 0) {
      await new Promise((r) => {
        speechSynthesis.onvoiceschanged = r;
        setTimeout(r, 100);
      });
      v = speechSynthesis.getVoices();
    }
    return v;
  },

  /**
   * Stop/cancel current speech.
   */
  stopSpeaking() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  },

  /**
   * Speech-to-text. Returns controller with start(), stop(), onresult callback.
   * @returns {{ start: function, stop: function, onresult: function }}
   */
  listen() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) throw new Error('Speech Recognition not supported');
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    let onResultCb = () => {};
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      const text = last[0].transcript;
      const isFinal = last.isFinal;
      onResultCb({ text, isFinal });
    };
    return {
      onresult(fn) { onResultCb = fn; },
      start() { rec.start(); },
      stop() { rec.stop(); }
    };
  },

  // ─── Encryption (Web Crypto) ─────────────────────────────────────────────

  /**
   * SHA-256 hash. Returns hex string.
   * @param {string} text
   * @returns {Promise<string>}
   */
  async hash(text) {
    const buf = new TextEncoder().encode(text);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Encrypt text with password (AES-GCM). Returns base64 string.
   * @param {string} text
   * @param {string} password
   * @returns {Promise<string>}
   */
  async encrypt(text, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const enc = new TextEncoder();
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(text)
    );
    const combined = new Uint8Array(salt.length + iv.length + cipher.byteLength);
    combined.set(salt, 0);
    combined.set(iv, 16);
    combined.set(new Uint8Array(cipher), 28);
    return btoa(String.fromCharCode(...combined));
  },

  /**
   * Decrypt text encrypted with coffee.encrypt().
   * @param {string} encrypted - Base64 from coffee.encrypt()
   * @param {string} password
   * @returns {Promise<string>}
   */
  async decrypt(encrypted, password) {
    const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const cipher = combined.slice(28);
    const key = await deriveKey(password, salt);
    const dec = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipher
    );
    return new TextDecoder().decode(dec);
  },

  /**
   * List all contents of localStorage and sessionStorage (not IndexedDB).
   * Values are JSON-parsed when possible.
   * @returns {{ local: object, session: object }}
   */
  list() {
    const parse = (raw) => {
      if (raw === null) return null;
      try { return JSON.parse(raw); } catch { return raw; }
    };
    const local = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      local[k] = parse(localStorage.getItem(k));
    }
    const session = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      session[k] = parse(sessionStorage.getItem(k));
    }
    return { local, session };
  }
};

if (typeof window !== 'undefined') window.coffee = coffee;
