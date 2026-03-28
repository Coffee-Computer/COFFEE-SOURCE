# Coffee Control — Architecture

## Pattern: Singleton Object vs Constructor

### What Coffee Control Uses

`coffee` is a **variable** holding an **object** with methods:

```js
const coffee = {
  async camera(opts = {}) { ... }
};
coffee.camera();  // Call directly
```

- **`coffee`** — variable (const)
- **`coffee`** — object (the value)
- **`coffee.camera`** — function (a property of the object)
- **`coffee.camera()`** — calling that function

### Why Not a Constructor?

**Constructors** — Used when you need many distinct instances:

```js
function Coffee() { this.camera = function() { ... }; }
const myCoffee = new Coffee();
myCoffee.camera();
```

**Singleton object** — One shared API surface used everywhere:

```js
coffee.camera();  // No `new`, one object
```

| | Singleton | Constructor |
|---|---|---|
| **Purpose** | One shared API | Blueprint for many instances |
| **Usage** | `coffee.camera()` | `new Coffee()` then `myCoffee.camera()` |
| **When** | Single API/module | Many distinct objects with own state |

### 3D / Three.js Comparison

Libraries like Three.js use **constructors** because they build a scene graph:

- `new THREE.Scene()` — each scene is a tree
- `new THREE.Mesh()` — each mesh has position, rotation, geometry
- `new THREE.PerspectiveCamera()` — each camera has its own view

You need many distinct objects. Each instance has its own state.

**Coffee Control** uses a **singleton** because it wraps browser APIs:

- The camera is the *device's* camera — `getUserMedia` returns a stream
- You're not creating "new camera objects"; you're asking the browser for access
- One entry point: `coffee.camera()`, `coffee.microphone()`, etc.

**Rule of thumb:** Constructors = building many objects. Singleton = exposing one API.

---

## API Reference

### Media
| Method | Returns | Notes |
|--------|---------|-------|
| `coffee.camera(opts)` | `{ stream, videoEl }` | getUserMedia video |
| `coffee.capture(videoEl, format)` | data URL | Snapshot from video |
| `coffee.microphone()` | `{ stream }` | getUserMedia audio |
| `coffee.record(stream)` | `{ start(), stop() }` | MediaRecorder wrapper |
| `coffee.streamSpectrum(canvas, stream, opts?)` | `{ audioContext, analyser, resize, start, stop, close }` | Web Audio frequency bars for a stream (e.g. mic viz) |
| `coffee.screen(opts)` | `{ stream, videoEl }` | getDisplayMedia |

### Location
| Method | Returns | Notes |
|--------|---------|-------|
| `coffee.geolocation()` | `{ lat, lng, accuracy }` | Browser Geolocation API |
| `coffee.geocode(lat, lng)` | `{ display_name, address }` | Nominatim reverse geocode |

### Share & Notify
| Method | Returns | Notes |
|--------|---------|-------|
| `coffee.notify(title, opts)` | Notification | Requests permission on first use |
| `coffee.clipboard.write(text)` | — | Copy to clipboard |
| `coffee.clipboard.read()` | string | Paste from clipboard |
| `coffee.share({ title, text, url })` | — | Native share sheet |

### UX
| Method | Returns | Notes |
|--------|---------|-------|
| `coffee.fullscreen(el)` | — | Toggle fullscreen |
| `coffee.wakeLock()` | `{ release() }` | Keep screen on |
| `coffee.vibrate(pattern)` | boolean | Mobile haptic |
| `coffee.serviceWorker.register(path, opts)` | ServiceWorkerRegistration | Registers SW; use `./coffee-worker.js` for progressive caching |

### Storage
| Method | Returns | Notes |
|--------|---------|-------|
| `coffee.storageQuota()` | `{ usage, quota, percent }` | IndexedDB/storage estimate |
| `coffee.save(key, value)` | — | localStorage (coffee_ prefix) |
| `coffee.load(key)` | any | localStorage |
| `coffee.remove(key)` | — | localStorage |
| `coffee.clear()` | — | Clears all coffee_ keys |
| `coffee.list()` | `{ local, session }` | All localStorage + sessionStorage (no IndexedDB) |

### Speech
| Method | Returns | Notes |
|--------|---------|-------|
| `coffee.speak(text, opts)` | Promise | TTS via SpeechSynthesis |
| `coffee.voices()` | `Voice[]` | Available voices |
| `coffee.stopSpeaking()` | — | Cancel TTS |
| `coffee.listen()` | `{ start(), stop(), onresult(fn) }` | STT via SpeechRecognition |

### Encryption
| Method | Returns | Notes |
|--------|---------|-------|
| `coffee.hash(text)` | Promise\<string\> | SHA-256 hex |
| `coffee.encrypt(text, password)` | Promise\<string\> | AES-GCM base64 (PBKDF2 key derivation) |
| `coffee.decrypt(encrypted, password)` | Promise\<string\> | Decrypt coffee.encrypt output |

---

## Storage: localStorage vs sessionStorage vs IndexedDB

Coffee Control uses **localStorage** and **sessionStorage** only. **IndexedDB is not used.**

| | localStorage | sessionStorage | IndexedDB |
|---|---|---|---|
| **API** | Web Storage | Web Storage | IndexedDB |
| **Lifetime** | Until cleared | Until tab closed | Until cleared |
| **Scope** | Per origin | Per tab | Per origin |
| **Size** | ~5MB | ~5MB | Much larger |
| **Coffee Control** | `save`, `load`, `remove`, `clear` | `list()` reads it | Not used |

- **`coffee.save` / `load`** — Uses localStorage with `coffee_` prefix. Used by `coffee.wire.control()` for que persistence.
- **`coffee.list()`** — Returns all keys/values from localStorage and sessionStorage. Does **not** touch IndexedDB.

---

## What Coffee Control Covers

Coffee Control wraps **browser / device APIs** — the stuff that needs permissions, hardware access, or platform features:

- **Media** — camera, mic, screen capture, record, snapshot, stream spectrum visualizer (AnalyserNode + canvas)
- **Location** — coords + reverse geocode
- **Share** — clipboard, native share, notifications
- **Storage** — simple key-value (localStorage)
- **Speech** — TTS (speak), STT (listen)
- **Encryption** — hash, encrypt/decrypt (Web Crypto)
- **UX** — fullscreen, wake lock, vibration

---

## What a New Dev Needs (Beyond Coffee Control)

### Already in the Browser

| Need | Built-in | Notes |
|------|----------|-------|
| **HTTP / APIs** | `fetch(url)` | Get/post data from the internet |
| **DOM** | `document.querySelector`, `createElement`, events | Build and update UI |
| **Layout** | HTML + CSS | Structure and styling |

### Optional

| Need | Options | When |
|------|---------|------|
| **Framework** | React, Vue, Svelte, etc. | Want structure, components, reactivity |
| **Bundler** | Vite, Parcel, esbuild | Want modules, npm packages, dev server |

### Power User Territory

Beyond Coffee Control + fetch + DOM, you're into:

- **Routing** — SPA navigation, history
- **Auth** — OAuth, login, sessions (usually needs backend)
- **Offline** — Service workers, PWA
- **Real-time** — WebSockets
- **Build pipelines** — TypeScript, minification, deployment

**TL;DR:** Coffee Control = device/browser primitives. Add fetch + DOM + HTML/CSS and you can build. Frameworks and tooling are optional. Power user stuff comes later.

---

## Service Worker: coffee-worker.js

Separate file, register via `coffee.serviceWorker.register('./coffee-worker.js')`.

**Progressive caching (out of the box):**
- **Network-first** — HTML, JS, JSON, CSS (fresh content, cache fallback when offline)
- **Cache-first** — Images, fonts, other assets
- **Same-origin only**

---

## Ship Checklist (Open Source)

- [ ] **README.md** — Quick start, install, basic usage, link to ARCH
- [ ] **LICENSE** — MIT or similar
- [ ] **Module export** — `export { coffee }` or `export default coffee` for ES modules
- [ ] **Global** — `window.coffee = coffee` when loaded via plain `<script>`
- [ ] **Browser support note** — HTTPS required for many APIs, mobile support
