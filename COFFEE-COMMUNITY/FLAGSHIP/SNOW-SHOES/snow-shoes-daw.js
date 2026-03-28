/**
 * Snow Shoes α — SHOES1–3 DAW shell built with coffee-ui + Coffee audio stack.
 * Load after: coffee-control, coffee-ui, coffee-synth, coffee-fuzz, coffee-transport, snow-shoes.js
 *
 *   SnowShoesDaw.boot(document.getElementById('app'), { pluginManifestUrl: 'snow-shoes-plugins.json' });
 */
(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee;
  if (!coffee) {
    console.warn('[snow-shoes-daw] window.coffee missing');
    return;
  }

  /** Plugin windows only; modal / shell use CSS layers above workspace (see ALPHA). */
  let pluginZCounter = 100;

  function bringPluginWindowToFront(el) {
    if (!el || el.style.display === 'none') return;
    el.style.zIndex = String(++pluginZCounter);
  }

  const tracks = [];

  /** Fallback if fetch(snow-shoes-plugins.json) fails */
  const DEFAULT_PLUGIN_MANIFEST = {
    version: 1,
    bootIds: ['builtin-synth', 'builtin-drums'],
    plugins: [
      {
        id: 'builtin-synth',
        name: 'Sub-Zero Keys',
        description: 'Built-in mini keyboard + filter sliders (host audio).',
        kind: 'builtin',
        builtinType: 'synth',
        color: '#60a5fa'
      },
      {
        id: 'builtin-drums',
        name: 'Tread Pads',
        description: 'Built-in 8-pad kit (host audio).',
        kind: 'builtin',
        builtinType: 'drums',
        color: '#fb923c'
      },
      {
        id: 'iframe-sequencer',
        name: 'Snow Sequencer',
        description: 'Piano roll + MIDI-style keyboard — Coffee α plugin (iframe).',
        kind: 'iframe',
        src: 'PLUGINS/COFFEE-SEQUENCER-ALPHA.html',
        color: '#38bdf8'
      },
      {
        id: 'iframe-subzero-mpc',
        name: 'Sub-Zero MPC',
        description: '16-pad MPC + step sequencer — Coffee α plugin (iframe).',
        kind: 'iframe',
        src: 'PLUGINS/COFFEE-SUBZERO-MPC-ALPHA.html',
        color: '#22c55e'
      }
    ]
  };

  function resolvePluginSrc(src) {
    if (!src) return '';
    try {
      return new URL(src, window.location.href).href;
    } catch {
      return src;
    }
  }

  async function loadPluginManifest(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  }

  function nextTrackLabel(entry) {
    const c = tracks.filter((t) => t.pluginId === entry.id).length;
    return entry.name + ' ' + (c + 1);
  }

  function renderPluginBrowserGrid(manifest, container, deps, modal) {
    container.replaceChildren();
    for (const p of manifest.plugins || []) {
      const color = p.color || 'var(--coffee-accent)';
      const card = coffee.card(
        [
          coffee.heading(p.name, 3, { style: { margin: '0 0 8px 0', color } }),
          coffee.para(p.description || '', {
            style: { fontSize: '13px', color: 'var(--coffee-text-muted)', margin: 0 }
          }),
          coffee.text(p.kind === 'iframe' ? 'OPEN IFRAME →' : 'ADD TRACK →', {
            style: { fontSize: '11px', fontWeight: '700', marginTop: '12px' }
          })
        ],
        { style: { cursor: 'pointer', borderColor: 'var(--coffee-panel)' } }
      );
      card.onclick = () => {
        instantiatePlugin(p, deps);
        modal.classList.remove('open');
      };
      container.appendChild(card);
    }
  }

  function instantiatePlugin(entry, deps) {
    if (!entry || !entry.kind) return;
    ensureAudio();
    if (entry.kind === 'builtin') {
      createBuiltinPlugin(entry, deps);
    } else if (entry.kind === 'iframe') {
      createIframePlugin(entry, deps);
    }
  }

  function ensureAudio() {
    coffee.snow.init({
      fx: { reverbSeconds: 2, reverbDecay: 3, reverbMix: 0.28 }
    });
    const ac = coffee.synth.audioContext;
    if (ac.state === 'suspended') ac.resume();
  }

  function ctx() {
    coffee.synth.init();
    return coffee.synth.audioContext;
  }

  function masterGain() {
    return coffee.synth.output;
  }

  function makeDraggable(el, header) {
    let pos3 = 0;
    let pos4 = 0;
    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      /* z-order: win’s capture-phase mousedown already calls bringPluginWindowToFront */
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      const pos1 = pos3 - e.clientX;
      const pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      el.style.top = el.offsetTop - pos2 + 'px';
      el.style.left = el.offsetLeft - pos1 + 'px';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function makeResizable(el, resizer) {
    resizer.onmousedown = (e) => {
      e.preventDefault();
      const startWidth = el.offsetWidth;
      const startHeight = el.offsetHeight;
      const startX = e.clientX;
      const startY = e.clientY;

      document.onmousemove = (ev) => {
        el.style.width = startWidth + (ev.clientX - startX) + 'px';
        el.style.height = startHeight + (ev.clientY - startY) + 'px';
      };
      document.onmouseup = () => {
        document.onmousemove = null;
      };
    };
  }

  function playTone(freq, outputGain) {
    const audioCtx = ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    env.gain.setValueAtTime(0.3, audioCtx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
    osc.connect(env);
    env.connect(outputGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 1);
  }

  function playDrum(freq, outputGain) {
    const audioCtx = ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = freq < 200 ? 'sine' : 'square';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + 0.1);
    env.gain.setValueAtTime(0.5, audioCtx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    osc.connect(env);
    env.connect(outputGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  }

  function bindVerticalFader(thumb, container, onValue) {
    let dragging = false;
    thumb.onmousedown = (e) => {
      dragging = true;
      e.stopPropagation();
    };
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const rect = container.getBoundingClientRect();
      let val = 1 - (e.clientY - rect.top) / rect.height;
      val = Math.max(0, Math.min(1, val));
      thumb.style.bottom = val * 100 + '%';
      onValue(val);
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
    });
  }

  class Track {
    constructor(name, type, mixerEl, trackListEl, windowContainer, onCreatePluginWindow, opts = {}) {
      this.name = name;
      this.type = type;
      this.pluginId = opts.pluginId != null ? opts.pluginId : null;
      this.pluginWindow = null;
      this.embedReady = false;
      this.embedMeta = null;
      coffee.synth.init();
      this.gainNode = ctx().createGain();
      this.gainNode.gain.value = 0.8;
      this.gainNode.connect(masterGain());
      this.analyzer = ctx().createAnalyser();
      this.analyzer.fftSize = 256;
      this.gainNode.connect(this.analyzer);

      this._buildMixerStrip(mixerEl);
      this._buildTrackRow(trackListEl, onCreatePluginWindow);
      this.startMetering();
    }

    _buildMixerStrip(mixerEl) {
      const strip = coffee.stack(
        [
          coffee.text(this.name.toUpperCase(), {
            style: {
              fontSize: '10px',
              fontWeight: '700',
              color: 'var(--coffee-text-muted)',
              textAlign: 'center',
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }),
          (() => {
            const row = document.createElement('div');
            row.className = 'ss-fader-meter-row';
            const fc = document.createElement('div');
            fc.className = 'fader-container';
            const thumb = document.createElement('div');
            thumb.className = 'fader-thumb';
            thumb.style.bottom = '80%';
            fc.appendChild(thumb);
            const mc = document.createElement('div');
            mc.className = 'meter-container';
            const meterFill = document.createElement('div');
            meterFill.className = 'meter-fill';
            mc.appendChild(meterFill);
            row.appendChild(fc);
            row.appendChild(mc);
            this.meterFill = meterFill;
            bindVerticalFader(thumb, fc, (v) => {
              this.gainNode.gain.value = v;
            });
            return row;
          })(),
          coffee.text('-6.0 dB', {
            style: { fontSize: '9px', fontFamily: 'ui-monospace, monospace', color: 'var(--coffee-text-muted)' }
          })
        ],
        { style: { alignItems: 'center', gap: '10px', width: '80px' } }
      );
      strip.className = 'mixer-strip';
      mixerEl.appendChild(strip);
    }

    _buildTrackRow(trackListEl, onCreatePluginWindow) {
      const item = coffee.stack(
        [
          coffee.row(
            [
              coffee.text(this.name, { style: { fontWeight: '700', fontSize: '14px' } }),
              (() => {
                const dots = document.createElement('div');
                dots.style.cssText = 'display:flex;gap:4px';
                dots.appendChild(Object.assign(document.createElement('div'), { className: 'ss-dot ss-dot-red' }));
                dots.appendChild(Object.assign(document.createElement('div'), { className: 'ss-dot ss-dot-amber' }));
                return dots;
              })()
            ],
            { style: { justifyContent: 'space-between', alignItems: 'center', width: '100%' } }
          ),
          coffee.text(this.type, {
            style: { fontSize: '10px', color: 'var(--coffee-text-muted)', textTransform: 'uppercase' }
          })
        ],
        {
          style: {
            padding: '12px',
            borderBottom: '1px solid var(--coffee-panel)',
            cursor: 'pointer',
            gap: '4px'
          }
        }
      );
      item.onmouseenter = () => {
        item.style.backgroundColor = 'var(--coffee-bg-elev)';
      };
      item.onmouseleave = () => {
        item.style.backgroundColor = 'transparent';
      };
      item.onclick = () => {
        if (this.pluginWindow) {
          this.pluginWindow.style.display = 'flex';
          bringPluginWindowToFront(this.pluginWindow);
        }
        onCreatePluginWindow && onCreatePluginWindow(this);
      };
      trackListEl.appendChild(item);
      this.trackRowEl = item;
    }

    startMetering() {
      const data = new Uint8Array(this.analyzer.frequencyBinCount);
      const update = () => {
        this.analyzer.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        this.meterFill.style.height = Math.min(100, avg * 1.5) + '%';
        requestAnimationFrame(update);
      };
      update();
    }
  }

  function transportIconPlay() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'currentColor');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute(
      'd',
      'm11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z'
    );
    svg.appendChild(p);
    return svg;
  }

  function transportIconStop() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'currentColor');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z');
    svg.appendChild(p);
    return svg;
  }

  function iconButton(child, title, variant) {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = title;
    b.setAttribute('aria-label', title);
    b.appendChild(child);
    Object.assign(b.style, {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
      backgroundColor: variant === 'play' ? 'var(--coffee-accent)' : 'var(--coffee-text-muted)',
      boxShadow: 'var(--coffee-shadow-soft)'
    });
    return b;
  }

  function wirePluginWindowChrome(win, header, content, deps, closeBtn) {
    win.appendChild(header);
    win.appendChild(content);
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    win.appendChild(resizer);
    deps.windowContainer.appendChild(win);
    makeDraggable(win, header);
    makeResizable(win, resizer);
    win.addEventListener(
      'mousedown',
      (e) => {
        if (closeBtn.contains(e.target)) return;
        bringPluginWindowToFront(win);
      },
      true
    );
  }

  function createBuiltinPlugin(entry, deps) {
    const type = entry.builtinType || 'synth';
    const name = nextTrackLabel(entry);
    const track = new Track(name, type, deps.mixerChannels, deps.trackList, deps.windowContainer, null, {
      pluginId: entry.id
    });

    const win = document.createElement('div');
    win.className = 'plugin-window';
    win.style.left = 150 + tracks.length * 30 + 'px';
    win.style.top = 150 + tracks.length * 30 + 'px';
    bringPluginWindowToFront(win);
    track.pluginWindow = win;
    tracks.push(track);

    const header = document.createElement('div');
    header.className = 'window-header';
    header.style.cursor = 'move';
    const ht = coffee.text(type.toUpperCase(), {
      style: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', color: 'var(--coffee-text-primary)' }
    });
    const closeBtn = coffee.button('✕', () => {
      win.style.display = 'none';
    }, {
      style: {
        padding: '4px 10px',
        minHeight: '32px',
        minWidth: '32px',
        backgroundColor: 'transparent',
        color: 'var(--coffee-text-muted)',
        boxShadow: 'none'
      }
    });
    closeBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    header.appendChild(coffee.row([ht, closeBtn], { style: { width: '100%', justifyContent: 'space-between' } }));

    const content = document.createElement('div');
    content.className = 'window-content';

    if (type === 'synth') {
      const ranges = coffee.row(
        [
          coffee.stack([coffee.label('Cutoff'), coffee.input({ type: 'range', style: { width: '100%' } })], {
            style: { flex: 1 }
          }),
          coffee.stack([coffee.label('Reso'), coffee.input({ type: 'range', style: { width: '100%' } })], {
            style: { flex: 1 }
          })
        ],
        { style: { gap: '16px', marginBottom: '16px' } }
      );
      content.appendChild(ranges);

      const keysWrap = document.createElement('div');
      keysWrap.className = 'keys-container';
      const keySpec = [
        ['261.63', 'C', ''],
        ['277.18', '', 'black'],
        ['293.66', 'D', ''],
        ['311.13', '', 'black'],
        ['329.63', 'E', ''],
        ['349.23', 'F', ''],
        ['369.99', '', 'black'],
        ['392.00', 'G', ''],
        ['415.30', '', 'black'],
        ['440.00', 'A', ''],
        ['466.16', '', 'black'],
        ['493.88', 'B', ''],
        ['523.25', 'C', '']
      ];
      keySpec.forEach(([freq, label, cls]) => {
        const k = document.createElement('div');
        k.className = 'key' + (cls ? ' ' + cls : '');
        k.textContent = label;
        k.dataset.note = freq;
        k.onmousedown = () => {
          k.classList.add('active');
          playTone(parseFloat(k.dataset.note), track.gainNode);
        };
        k.onmouseup = () => k.classList.remove('active');
        k.onmouseleave = () => k.classList.remove('active');
        keysWrap.appendChild(k);
      });
      content.appendChild(keysWrap);
    } else {
      const grid = document.createElement('div');
      grid.className = 'pad-grid';
      const pads = [
        ['100', 'KICK'],
        ['800', 'SNARE'],
        ['2500', 'HAT'],
        ['400', 'TOM'],
        ['150', 'KICK 2'],
        ['600', 'CLAP'],
        ['3000', 'CYM'],
        ['200', 'TOM 2']
      ];
      pads.forEach(([freq, lab]) => {
        const p = document.createElement('div');
        p.className = 'pad';
        p.textContent = lab;
        p.dataset.freq = freq;
        p.onmousedown = () => {
          p.classList.add('active');
          playDrum(parseFloat(p.dataset.freq), track.gainNode);
        };
        p.onmouseup = () => p.classList.remove('active');
        grid.appendChild(p);
      });
      content.appendChild(grid);
    }

    wirePluginWindowChrome(win, header, content, deps, closeBtn);
  }

  /** —— Snow Shoes iframe ↔ host postMessage (see SNOW-SHOES-EMBED.md) —— */
  const SNOW_SHOES_EMBED_CH = 'snow-shoes';
  const SNOW_SHOES_EMBED_V = 1;

  let snowShoesTransportBroadcastTimer = null;

  function snowShoesPostToIframe(iframe, type, payload) {
    try {
      if (!iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(
        { ch: SNOW_SHOES_EMBED_CH, v: SNOW_SHOES_EMBED_V, type, payload: payload || {} },
        '*'
      );
    } catch (e) {
      console.warn('[snow-shoes] iframe postMessage', e);
    }
  }

  function snowShoesFindIframeBridge(source) {
    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      if (!t.pluginWindow) continue;
      const ifr = t.pluginWindow.querySelector('iframe.ss-plugin-iframe');
      if (ifr && ifr.contentWindow === source) return { iframe: ifr, track: t };
    }
    return null;
  }

  function snowShoesBroadcastTransportToIframes() {
    const payload = {
      bpm: coffee.transport.bpm,
      playing: coffee.transport.isPlaying,
      currentStep: coffee.transport.currentStep,
      totalSteps: coffee.transport.totalSteps
    };
    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      if (!t.pluginWindow) continue;
      const ifr = t.pluginWindow.querySelector('iframe.ss-plugin-iframe');
      if (!ifr) continue;
      snowShoesPostToIframe(ifr, 'transport.state', payload);
    }
  }

  function snowShoesEnsureTransportBroadcast() {
    if (snowShoesTransportBroadcastTimer != null) return;
    snowShoesTransportBroadcastTimer = setInterval(snowShoesBroadcastTransportToIframes, 300);
  }

  function snowShoesHostEmbedMessage(ev) {
    const d = ev.data;
    if (!d || d.ch !== SNOW_SHOES_EMBED_CH || d.v !== SNOW_SHOES_EMBED_V) return;
    const hit = snowShoesFindIframeBridge(ev.source);
    if (!hit) return;
    if (d.type === 'plugin.ready') {
      hit.track.embedReady = true;
      hit.track.embedMeta = d.payload || {};
    }
    if (d.type === 'plugin.ping') {
      snowShoesPostToIframe(hit.iframe, 'host.pong', { t: Date.now() });
    }
  }

  window.addEventListener('message', snowShoesHostEmbedMessage);

  function createIframePlugin(entry, deps) {
    const name = nextTrackLabel(entry);
    const track = new Track(name, 'iframe', deps.mixerChannels, deps.trackList, deps.windowContainer, null, {
      pluginId: entry.id
    });

    const win = document.createElement('div');
    win.className = 'plugin-window ss-plugin-window--iframe';
    win.style.left = 60 + tracks.length * 36 + 'px';
    win.style.top = 48 + tracks.length * 36 + 'px';
    bringPluginWindowToFront(win);
    track.pluginWindow = win;
    tracks.push(track);

    const header = document.createElement('div');
    header.className = 'window-header';
    header.style.cursor = 'move';
    const ht = coffee.text(entry.name.toUpperCase(), {
      style: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', color: 'var(--coffee-text-primary)' }
    });
    const closeBtn = coffee.button('✕', () => {
      win.style.display = 'none';
    }, {
      style: {
        padding: '4px 10px',
        minHeight: '32px',
        minWidth: '32px',
        backgroundColor: 'transparent',
        color: 'var(--coffee-text-muted)',
        boxShadow: 'none'
      }
    });
    closeBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    header.appendChild(coffee.row([ht, closeBtn], { style: { width: '100%', justifyContent: 'space-between' } }));

    const content = document.createElement('div');
    content.className = 'window-content ss-iframe-plugin-content';
    const iframe = document.createElement('iframe');
    iframe.className = 'ss-plugin-iframe';
    iframe.title = entry.name;
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
    iframe.src = resolvePluginSrc(entry.src);
    content.appendChild(iframe);

    iframe.addEventListener('load', function () {
      snowShoesPostToIframe(iframe, 'host.hello', {
        protocol: SNOW_SHOES_EMBED_V,
        pluginId: entry.id,
        name: entry.name
      });
      snowShoesBroadcastTransportToIframes();
    });
    snowShoesEnsureTransportBroadcast();

    wirePluginWindowChrome(win, header, content, deps, closeBtn);
  }

  async function boot(parent, opts = {}) {
    const root = parent || document.body;
    root.innerHTML = '';

    coffee.injectTheme('dark');
    document.documentElement.style.setProperty('--coffee-accent', '#4ade80');

    ensureAudio();

    /** Serializable pattern slots for future built-in sequencer / clip UI */
    const PIANO_STEPS = 32;
    const hostPianoRoll =
      coffee.pattern && typeof coffee.pattern.emptyPianoRoll === 'function'
        ? coffee.pattern.emptyPianoRoll({ stepCount: PIANO_STEPS, notes: [] })
        : null;
    const hostDrumPattern =
      coffee.pattern && typeof coffee.pattern.emptyDrum === 'function'
        ? coffee.pattern.emptyDrum({
            stepCount: 16,
            padIds: ['k', 's', 'h', 't', 'k2', 'c', 'cy', 't2']
          })
        : null;
    if (hostPianoRoll) {
      coffee.transport.totalSteps = hostPianoRoll.stepCount;
    }

    const shell = document.createElement('div');
    shell.className = 'ss-daw-shell';

    const header = document.createElement('header');
    Object.assign(header.style, {
      flexShrink: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 'var(--coffee-space-sm)',
      padding: 'var(--coffee-space-md)',
      backgroundColor: 'var(--coffee-bg-elev)',
      borderBottom: '1px solid var(--coffee-panel)',
      boxShadow: 'var(--coffee-shadow-soft)',
      zIndex: '50'
    });

    const title = coffee.heading('SNOW SHOES', 2, {
      style: {
        margin: 0,
        fontStyle: 'italic',
        letterSpacing: '-0.04em',
        color: 'var(--coffee-accent)'
      }
    });

    const cadenceHost = document.createElement('div');
    cadenceHost.className = 'ss-cadence-host';
    Object.assign(cadenceHost.style, {
      flex: '1 1 auto',
      minWidth: 'min(100%, 260px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    let playBtn;
    let stopBtn;
    if (coffee.cadence && typeof coffee.cadence.transportStrip === 'function') {
      coffee.cadence.transportStrip(cadenceHost, coffee.transport);
    } else {
      console.warn('[snow-shoes-daw] coffee.cadence.transportStrip missing — fallback transport');
      playBtn = iconButton(transportIconPlay(), 'Play / Pause', 'play');
      stopBtn = iconButton(transportIconStop(), 'Stop', 'stop');
      cadenceHost.appendChild(
        coffee.row([playBtn, stopBtn], {
          style: {
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'var(--coffee-bg-surface)',
            borderRadius: 'var(--coffee-radius-sm)',
            border: '1px solid var(--coffee-panel)'
          }
        })
      );
    }

    const bpmLabel = coffee.text(coffee.transport.bpm + ' BPM | 4/4', {
      style: { fontSize: '12px', fontFamily: 'ui-monospace, monospace', color: 'var(--coffee-text-muted)' }
    });
    const tempoSlider = coffee.input({
      type: 'range',
      id: 'ss-tempo',
      style: { width: '120px' }
    });
    tempoSlider.min = '60';
    tempoSlider.max = '180';
    tempoSlider.value = String(coffee.transport.bpm);
    const tempoLab = coffee.label('Tempo', tempoSlider);
    tempoLab.style.display = 'inline-block';
    tempoLab.style.marginBottom = '0';
    tempoLab.style.marginRight = '4px';
    const tempoRow = coffee.row([tempoLab, tempoSlider, bpmLabel], {
      style: { alignItems: 'center', gap: '8px', flexWrap: 'wrap' }
    });
    tempoSlider.addEventListener('input', () => {
      coffee.transport.bpm = Number(tempoSlider.value);
      bpmLabel.textContent = coffee.transport.bpm + ' BPM | 4/4';
    });

    const btnSub = coffee.button('+ Keys', null, {
      style: { fontSize: '12px', padding: '8px 12px', minHeight: '40px' }
    });
    const btnTread = coffee.button('+ Pads', null, {
      style: { fontSize: '12px', padding: '8px 12px', minHeight: '40px', backgroundColor: '#ea580c' }
    });

    const openModalBtn = coffee.button(
      '+',
      () => {
        modal.classList.add('open');
      },
      {
        style: {
          width: '44px',
          height: '44px',
          minWidth: '44px',
          borderRadius: '50%',
          fontSize: '22px',
          lineHeight: 1,
          padding: 0,
          fontWeight: '800'
        }
      }
    );

    const rightHeader = coffee.row([btnSub, btnTread, openModalBtn], { style: { gap: '8px', flexWrap: 'wrap' } });
    const topRow = coffee.row([title, cadenceHost, rightHeader], {
      style: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--coffee-space-md)',
        flexWrap: 'wrap'
      }
    });
    header.appendChild(topRow);
    header.appendChild(tempoRow);

    const main = document.createElement('main');
    main.className = 'ss-daw-main';

    const trackList = document.createElement('div');
    trackList.className = 'ss-track-list';

    const workspace = document.createElement('div');
    workspace.className = 'ss-workspace';
    const gridBg = document.createElement('div');
    gridBg.className = 'ss-grid-overlay';
    const windowContainer = document.createElement('div');
    windowContainer.className = 'window-container';
    workspace.appendChild(gridBg);
    workspace.appendChild(windowContainer);

    const modal = document.createElement('div');
    modal.className = 'ss-plugins-modal';
    const pluginGridContainer = document.createElement('div');
    pluginGridContainer.className = 'ss-plugin-card-grid';
    const modalPanel = coffee.card(
      [
        coffee.row(
          [
            coffee.heading('PLUGIN BROWSER', 2, {
              style: { margin: 0, fontStyle: 'italic', letterSpacing: '-0.02em' }
            }),
            coffee.button('Close ✕', () => modal.classList.remove('open'), {
              style: { backgroundColor: 'transparent', color: 'var(--coffee-text-muted)', boxShadow: 'none' }
            })
          ],
          { style: { width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--coffee-space-lg)' } }
        ),
        pluginGridContainer
      ],
      {
        style: {
          width: '100%',
          maxHeight: '80%',
          overflowY: 'auto',
          borderRadius: 'var(--coffee-radius-md) var(--coffee-radius-md) 0 0',
          marginTop: 'auto'
        }
      }
    );
    modalPanel.classList.add('ss-modal-sheet');
    modal.appendChild(modalPanel);

    main.appendChild(trackList);
    main.appendChild(workspace);
    main.appendChild(modal);

    const footer = document.createElement('footer');
    footer.className = 'ss-mixer-footer';
    const mixerToggle = document.createElement('button');
    mixerToggle.type = 'button';
    mixerToggle.className = 'ss-mixer-toggle';
    mixerToggle.setAttribute('aria-expanded', 'true');
    mixerToggle.textContent = '▼ Hide mixer';
    const mixerBody = document.createElement('div');
    mixerBody.className = 'ss-mixer-body';
    const mixerChannels = document.createElement('div');
    mixerChannels.className = 'ss-mixer-channels';

    const masterStrip = coffee.stack(
      [
        coffee.text('MASTER', {
          style: { fontSize: '10px', fontWeight: '800', color: 'var(--coffee-accent)' }
        }),
        (() => {
          const row = document.createElement('div');
          row.className = 'ss-fader-meter-row';
          const fc = document.createElement('div');
          fc.className = 'fader-container';
          const thumb = document.createElement('div');
          thumb.className = 'fader-thumb';
          thumb.style.bottom = '100%';
          fc.appendChild(thumb);
          const mc = document.createElement('div');
          mc.className = 'meter-container';
          const masterMeterFill = document.createElement('div');
          masterMeterFill.className = 'meter-fill';
          mc.appendChild(masterMeterFill);
          row.appendChild(fc);
          row.appendChild(mc);
          bindVerticalFader(thumb, fc, (v) => {
            masterGain().gain.value = v;
          });
          masterGain().gain.value = 1;

          function updateMasterMeter() {
            const an = coffee.synth.analyzer;
            const data = new Uint8Array(an.frequencyBinCount);
            an.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            const avg = sum / data.length;
            masterMeterFill.style.height = Math.min(100, avg * 1.5) + '%';
            requestAnimationFrame(updateMasterMeter);
          }
          updateMasterMeter();
          return row;
        })(),
        coffee.text('0.0 dB', {
          style: { fontSize: '9px', fontFamily: 'ui-monospace, monospace', color: 'var(--coffee-text-muted)' }
        })
      ],
      { style: { alignItems: 'center', gap: '10px', width: '80px' } }
    );
    masterStrip.className = 'mixer-strip ss-master-strip';
    mixerChannels.appendChild(masterStrip);

    mixerBody.appendChild(mixerChannels);
    footer.appendChild(mixerToggle);
    footer.appendChild(mixerBody);

    mixerToggle.addEventListener('click', () => {
      const collapsed = footer.classList.toggle('ss-mixer-collapsed');
      mixerToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      mixerToggle.textContent = collapsed ? '▲ Show mixer' : '▼ Hide mixer';
    });

    shell.appendChild(header);
    shell.appendChild(main);
    shell.appendChild(footer);
    root.appendChild(shell);

    const deps = {
      mixerChannels,
      trackList,
      windowContainer,
      hostPianoRoll,
      hostDrumPattern
    };

    if (playBtn && stopBtn) {
      function syncTransport() {
        const playing = coffee.transport.isPlaying;
        playBtn.style.opacity = playing ? '1' : '0.9';
      }
      playBtn.onclick = () => {
        ensureAudio();
        if (coffee.transport.isPlaying) coffee.transport.stop();
        else coffee.transport.play();
        syncTransport();
      };
      stopBtn.onclick = () => {
        ensureAudio();
        coffee.transport.stop();
        syncTransport();
      };
      setInterval(syncTransport, 200);
    }

    let manifest = DEFAULT_PLUGIN_MANIFEST;
    const manifestUrl = opts.pluginManifestUrl || 'snow-shoes-plugins.json';
    try {
      const m = await loadPluginManifest(manifestUrl);
      if (m && Array.isArray(m.plugins)) manifest = m;
    } catch (err) {
      console.warn('[snow-shoes-daw] using default plugin manifest (' + manifestUrl + ')', err);
    }

    renderPluginBrowserGrid(manifest, pluginGridContainer, deps, modal);

    const plugSynth = manifest.plugins.find((p) => p.id === 'builtin-synth');
    const plugDrums = manifest.plugins.find((p) => p.id === 'builtin-drums');
    btnSub.textContent = '+ ' + (plugSynth ? plugSynth.name : 'Keys');
    btnTread.textContent = '+ ' + (plugDrums ? plugDrums.name : 'Pads');
    btnSub.onclick = () => plugSynth && instantiatePlugin(plugSynth, deps);
    btnTread.onclick = () => plugDrums && instantiatePlugin(plugDrums, deps);

    const bootIds = Array.isArray(manifest.bootIds) ? manifest.bootIds : DEFAULT_PLUGIN_MANIFEST.bootIds;
    for (let i = 0; i < bootIds.length; i++) {
      const ent = manifest.plugins.find((p) => p.id === bootIds[i]);
      if (ent) instantiatePlugin(ent, deps);
    }

    snowShoesEnsureTransportBroadcast();
  }

  window.SnowShoesDaw = { boot };
})();
