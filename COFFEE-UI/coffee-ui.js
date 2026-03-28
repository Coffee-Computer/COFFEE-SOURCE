/**
 * Coffee UI — Opinionated UI bricks (vanilla JS, no framework)
 * Fuses design_principals.md + design-standards-apps.md (no Tailwind/externals)
 * button, input, textarea, select, label, link, text, para, spinner, msg, card, heading, row, col, stack, appShell, container, chatBubble, chatInput
 * glass, progressBar, announce, scoreRow, hud — overlay/game HUD components
 * floatGroup, floatStack, iconButton, toolDock, pillStrip — floating panels + bottom docks (Kite-style)
 *
 * Optional flagship chat chrome (sidebar + neural bar + prompt grid + composer): load
 *   coffee-ui-flagship.css + coffee-ui-flagship.js after this file → window.coffee.flagship
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  // Design tokens from design-standards-apps.md + design_principals.md
  coffee.theme = {
    light: {
      accent: '#4c9aff',
      bgSurface: '#ffffff',
      bgElev: '#f7fafc',
      panel: '#2d2d2d',
      textPrimary: '#111827',
      textMuted: '#6b7280',
      spaceXs: '4px', spaceSm: '8px', spaceMd: '16px', spaceLg: '24px', spaceXl: '40px',
      radiusSm: '8px', radiusMd: '12px',
      shadowSoft: '0 6px 18px rgba(2,6,23,0.08)',
      fontBase: '16px', fontSm: '13px',
      touchMin: '44px'
    },
    dark: {
      accent: '#4c9aff',
      bgSurface: '#1a1a1a',
      bgElev: '#252525',
      panel: '#2d2d2d',
      textPrimary: '#eee',
      textMuted: '#9ca3af',
      spaceXs: '4px', spaceSm: '8px', spaceMd: '16px', spaceLg: '24px', spaceXl: '40px',
      radiusSm: '8px', radiusMd: '12px',
      shadowSoft: '0 6px 18px rgba(0,0,0,0.3)',
      fontBase: '16px', fontSm: '13px',
      touchMin: '44px'
    }
  };

  let _themeMode = 'dark';

  /**
   * Inject design tokens as CSS variables + interaction rules (active, focus).
   * Call once after loading. mode = 'light' | 'dark'.
   */
  coffee.injectTheme = function (mode = 'dark') {
    _themeMode = mode === 'light' ? 'light' : 'dark';
    const t = coffee.theme[_themeMode];
    const id = 'coffee-ui-theme';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = `
:root {
  --coffee-accent: ${t.accent};
  --coffee-bg-surface: ${t.bgSurface};
  --coffee-bg-elev: ${t.bgElev};
  --coffee-panel: ${t.panel};
  --coffee-text-primary: ${t.textPrimary};
  --coffee-text-muted: ${t.textMuted};
  --coffee-space-xs: ${t.spaceXs}; --coffee-space-sm: ${t.spaceSm}; --coffee-space-md: ${t.spaceMd}; --coffee-space-lg: ${t.spaceLg}; --coffee-space-xl: ${t.spaceXl};
  --coffee-radius-sm: ${t.radiusSm}; --coffee-radius-md: ${t.radiusMd};
  --coffee-shadow-soft: ${t.shadowSoft};
  --coffee-font-base: ${t.fontBase}; --coffee-font-sm: ${t.fontSm};
  --coffee-touch-min: ${t.touchMin};
}
[data-coffee="button"]:active { transform: scale(0.97); }
[data-coffee="button"]:focus-visible { outline: 2px solid var(--coffee-accent); outline-offset: 2px; }
[data-coffee="input"]:focus, textarea[data-coffee="input"]:focus, select[data-coffee="input"]:focus, [data-coffee="slider"]:focus-visible { outline: 2px solid var(--coffee-accent); outline-offset: 0; }
[data-coffee="link"]:focus-visible { outline: 2px solid var(--coffee-accent); outline-offset: 2px; }
[data-coffee="icon-button"]:focus-visible { outline: 2px solid var(--coffee-accent); outline-offset: 2px; }
[data-coffee="icon-button"]:hover { background: rgba(255,255,255,0.12) !important; }
[data-coffee="icon-button"].coffee-icon-danger:hover { background: rgba(239,68,68,0.22) !important; color: #fecaca !important; }
[data-coffee="pill-scroll"]::-webkit-scrollbar { display: none; }
[data-coffee="pill"][data-coffee-pill-active="1"] { border-color: var(--coffee-accent) !important; background: #444 !important; transform: translateY(-3px); }
[data-coffee="pill"][data-coffee-pill-active="0"]:hover { background: #3f3f46 !important; }
`;
  };

  function theme() { return coffee.theme[_themeMode]; }
  const baseStyle = { fontFamily: 'Inter, system-ui', fontSize: 'var(--coffee-font-base, 16px)' };

  function appendChildren(el, children) {
    const arr = Array.isArray(children) ? children : [children];
    arr.forEach((c) => {
      if (c instanceof Node) el.appendChild(c);
      else if (c != null) el.appendChild(document.createTextNode(String(c)));
    });
  }

  function extractStyle(opts) {
    const {
      type, placeholder, value, id, for: forAttr, href, level, gap, rows, cols, options, min, max, step, onInput,
      label, lowThreshold, color, valueColor, duration, top, center, bottom, pointerEvents,
      items, onSelect, pillSize, anchor, offsetTop, offsetEnd, zIndex, variant, html, title, onClick,
      ...style
    } = opts || {};
    return {
      type, placeholder, value, id, for: forAttr, href, level, gap, rows, cols, options, min, max, step, onInput,
      label, lowThreshold, color, valueColor, duration, top, center, bottom, pointerEvents,
      items, onSelect, pillSize, anchor, offsetTop, offsetEnd, zIndex, variant, html, title, onClick,
      style
    };
  }

  /**
   * Styled button. Min 44px touch target (design-standards). Use injectTheme() first.
   */
  coffee.button = function (text, onClick, opts = {}) {
    const { style } = extractStyle(opts);
    const b = document.createElement('button');
    b.setAttribute('data-coffee', 'button');
    b.textContent = text;
    if (typeof onClick === 'function') b.onclick = onClick;
    Object.assign(b.style, baseStyle, {
      backgroundColor: 'var(--coffee-accent, #4c9aff)',
      color: '#fff',
      padding: 'var(--coffee-space-sm) var(--coffee-space-md)',
      minHeight: 'var(--coffee-touch-min, 44px)',
      minWidth: 'var(--coffee-touch-min, 44px)',
      border: 'none',
      borderRadius: 'var(--coffee-radius-sm, 8px)',
      cursor: 'pointer',
      fontWeight: '600',
      boxShadow: 'var(--coffee-shadow-soft)',
      ...style
    });
    return b;
  };

  /**
   * Text input. opts: type, placeholder, value, id + style overrides.
   */
  coffee.input = function (opts = {}) {
    const { type = 'text', placeholder, value, id, style } = extractStyle(opts);
    const inp = document.createElement('input');
    inp.setAttribute('data-coffee', 'input');
    inp.type = type;
    if (placeholder != null) inp.placeholder = placeholder;
    if (value != null) inp.value = value;
    if (id) inp.id = id;
    Object.assign(inp.style, baseStyle, {
      padding: 'var(--coffee-space-sm) var(--coffee-space-md)',
      minHeight: 'var(--coffee-touch-min, 44px)',
      border: '1px solid var(--coffee-text-muted)',
      borderRadius: 'var(--coffee-radius-sm)',
      backgroundColor: 'var(--coffee-bg-elev)',
      color: 'var(--coffee-text-primary)',
      width: '200px',
      ...style
    });
    return inp;
  };

  /**
   * Range slider. opts: min, max, step, value, onInput, id + style overrides.
   */
  coffee.slider = function (opts = {}) {
    const { min = 0, max = 1, step = 0.1, value, onInput, id, style } = extractStyle(opts);
    const inp = document.createElement('input');
    inp.setAttribute('data-coffee', 'slider');
    inp.type = 'range';
    inp.min = String(min);
    inp.max = String(max);
    inp.step = String(step);
    if (value != null) inp.value = String(value);
    if (id) inp.id = id;
    if (typeof onInput === 'function') inp.oninput = () => onInput(parseFloat(inp.value));
    Object.assign(inp.style, baseStyle, {
      width: '100%',
      minWidth: '120px',
      accentColor: 'var(--coffee-accent)',
      cursor: 'pointer',
      ...style
    });
    return inp;
  };

  /**
   * Form label. forEl = id string or element to associate.
   */
  coffee.label = function (text, forEl, opts = {}) {
    const { style } = extractStyle(opts);
    const lab = document.createElement('label');
    lab.textContent = text;
    if (forEl) lab.htmlFor = typeof forEl === 'string' ? forEl : forEl.id;
    Object.assign(lab.style, baseStyle, {
      display: 'block',
      marginBottom: 'var(--coffee-space-xs)',
      color: 'var(--coffee-text-muted)',
      fontSize: 'var(--coffee-font-sm)',
      ...style
    });
    return lab;
  };

  /**
   * Styled link.
   */
  coffee.link = function (text, href, opts = {}) {
    const { style } = extractStyle(opts);
    const a = document.createElement('a');
    a.setAttribute('data-coffee', 'link');
    a.textContent = text;
    a.href = href;
    Object.assign(a.style, baseStyle, {
      color: 'var(--coffee-accent)',
      textDecoration: 'none',
      cursor: 'pointer',
      minHeight: 'var(--coffee-touch-min)',
      display: 'inline-flex',
      alignItems: 'center',
      ...style
    });
    return a;
  };

  /**
   * Card container. children = element, array of elements, or text.
   */
  coffee.card = function (children, opts = {}) {
    const { style } = extractStyle(opts);
    const div = document.createElement('div');
    appendChildren(div, children);
    Object.assign(div.style, baseStyle, {
      padding: 'var(--coffee-space-md)',
      backgroundColor: 'var(--coffee-bg-elev)',
      borderRadius: 'var(--coffee-radius-md)',
      border: '1px solid var(--coffee-panel)',
      boxShadow: 'var(--coffee-shadow-soft)',
      ...style
    });
    return div;
  };

  /**
   * Glass panel — backdrop blur, semi-transparent. For overlays, HUDs.
   */
  coffee.glass = function (children, opts = {}) {
    const { style } = extractStyle(opts);
    const div = document.createElement('div');
    appendChildren(div, children);
    Object.assign(div.style, baseStyle, {
      padding: 'var(--coffee-space-md)',
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 'var(--coffee-radius-md)',
      border: '1px solid rgba(255,255,255,0.1)',
      ...style
    });
    return div;
  };

  /**
   * Progress bar. opts: value, max, label, lowThreshold (0–1, red below this), color, valueColor.
   * Returns { el, barEl, valueEl } for updating.
   */
  coffee.progressBar = function (value = 100, max = 100, opts = {}) {
    const { label, lowThreshold = 0.3, color, valueColor, style } = extractStyle(opts);
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    const isLow = pct / 100 <= lowThreshold;
    const barColor = color || (isLow ? '#ef4444' : '#10b981');
    const valColor = valueColor || (isLow ? '#ef4444' : '#10b981');

    const wrap = document.createElement('div');
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:var(--coffee-space-sm)';
    const labelEl = document.createElement('span');
    labelEl.textContent = label || '';
    labelEl.style.cssText = 'font-size:10px;text-transform:uppercase;font-weight:600;color:var(--coffee-text-muted);letter-spacing:0.1em';
    const valueEl = document.createElement('span');
    valueEl.textContent = Math.ceil(value);
    valueEl.style.cssText = 'font-size:1.25rem;font-weight:800;font-style:italic';
    valueEl.style.color = valColor;
    header.appendChild(labelEl);
    header.appendChild(valueEl);

    const track = document.createElement('div');
    track.style.cssText = 'width:100%;height:8px;background:rgba(255,255,255,0.05);border-radius:9999px;overflow:hidden';
    const barEl = document.createElement('div');
    barEl.style.cssText = `height:100%;width:${pct}%;background:${barColor};transition:width 0.3s, background 0.3s`;
    track.appendChild(barEl);

    wrap.appendChild(header);
    wrap.appendChild(track);
    Object.assign(wrap.style, baseStyle, { minWidth: '200px', ...style });

    return {
      el: wrap,
      barEl,
      valueEl,
      update(v, m = max) {
        const p = Math.min(100, Math.max(0, (v / m) * 100));
        barEl.style.width = p + '%';
        valueEl.textContent = Math.ceil(v);
        valueEl.style.color = (p / 100 <= lowThreshold ? '#ef4444' : '#10b981');
        barEl.style.background = (p / 100 <= lowThreshold ? '#ef4444' : '#10b981');
      }
    };
  };

  /**
   * Announcer — large centered text, show/hide. opts: duration (ms).
   * Returns { el, show(msg), hide() }.
   */
  coffee.announce = function (opts = {}) {
    const { duration = 2000, style } = extractStyle(opts);
    const div = document.createElement('div');
    div.setAttribute('aria-live', 'polite');
    Object.assign(div.style, baseStyle, {
      fontSize: '3rem',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '-0.02em',
      opacity: 0,
      transform: 'scale(0.9)',
      transition: 'opacity 0.5s, transform 0.5s',
      pointerEvents: 'none',
      ...style
    });

    let hideTimer = null;
    return {
      el: div,
      show(msg) {
        if (hideTimer) clearTimeout(hideTimer);
        div.textContent = msg;
        div.style.opacity = '1';
        div.style.transform = 'scale(1)';
        hideTimer = setTimeout(() => {
          div.style.opacity = '0';
          div.style.transform = 'scale(0.9)';
          hideTimer = null;
        }, duration);
      },
      hide() {
        if (hideTimer) clearTimeout(hideTimer);
        div.style.opacity = '0';
        div.style.transform = 'scale(0.9)';
      }
    };
  };

  /**
   * Score row — dot + label + value. opts: color, label, value.
   */
  coffee.scoreRow = function (opts = {}) {
    const { color = '#4c9aff', label, value, style } = extractStyle(opts);
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:12px';
    const dot = document.createElement('span');
    dot.style.cssText = `width:8px;height:8px;border-radius:50%;background:${color}`;
    const lbl = document.createElement('span');
    lbl.textContent = label || '';
    lbl.style.cssText = 'font-size:10px;font-weight:bold;text-transform:uppercase;flex-grow:1';
    const val = document.createElement('span');
    val.textContent = value ?? '';
    val.style.cssText = 'font-size:10px;color:#34d399';
    div.appendChild(dot);
    div.appendChild(lbl);
    div.appendChild(val);
    Object.assign(div.style, style);
    return { el: div, dot, labelEl: lbl, valueEl: val };
  };

  /**
   * HUD overlay — full-screen fixed, slots: top, center, bottom.
   * opts: top, center, bottom = element(s) or array. pointerEvents: 'none' by default.
   */
  coffee.hud = function (opts = {}) {
    const { top, center, bottom, pointerEvents = 'none', style } = extractStyle(opts);
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:10;padding:2rem;display:flex;flex-direction:column;justify-content:space-between;pointer-events:' + pointerEvents;

    const topEl = document.createElement('div');
    topEl.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start';
    if (top) appendChildren(topEl, Array.isArray(top) ? top : [top]);

    const centerEl = document.createElement('div');
    centerEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center';
    if (center) appendChildren(centerEl, Array.isArray(center) ? center : [center]);

    const bottomEl = document.createElement('div');
    bottomEl.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-end';
    if (bottom) appendChildren(bottomEl, Array.isArray(bottom) ? bottom : [bottom]);

    wrap.appendChild(topEl);
    wrap.appendChild(centerEl);
    wrap.appendChild(bottomEl);
    Object.assign(wrap.style, style);

    return { el: wrap, top: topEl, center: centerEl, bottom: bottomEl };
  };

  /**
   * Body text (span). For short inline text.
   */
  coffee.text = function (content, opts = {}) {
    const { style } = extractStyle(opts);
    const span = document.createElement('span');
    span.textContent = content;
    Object.assign(span.style, baseStyle, {
      color: 'var(--coffee-text-primary)',
      ...style
    });
    return span;
  };

  /**
   * Paragraph. For body copy.
   */
  coffee.para = function (content, opts = {}) {
    const { style } = extractStyle(opts);
    const p = document.createElement('p');
    p.textContent = content;
    Object.assign(p.style, baseStyle, {
      margin: '0 0 var(--coffee-space-sm) 0',
      color: 'var(--coffee-text-primary)',
      lineHeight: '1.5',
      ...style
    });
    return p;
  };

  /**
   * Loading spinner (design_principals: "spinner before fetch").
   */
  coffee.spinner = function (opts = {}) {
    const { style } = extractStyle(opts);
    const div = document.createElement('div');
    div.setAttribute('aria-label', 'Loading');
    div.style.cssText = `
      width: 32px; height: 32px;
      border: 3px solid var(--coffee-text-muted);
      border-top-color: var(--coffee-accent);
      border-radius: 50%;
      animation: coffee-spin 0.8s linear infinite;
    `;
    Object.assign(div.style, style);
    const id = 'coffee-spinner-keyframes';
    if (!document.getElementById(id)) {
      const styleEl = document.createElement('style');
      styleEl.id = id;
      styleEl.textContent = '@keyframes coffee-spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(styleEl);
    }
    return div;
  };

  /**
   * Message box (design-standards: no alert()). type = 'success' | 'warning' | 'error'.
   */
  coffee.msg = function (text, type = 'info', opts = {}) {
    const { style } = extractStyle(opts);
    const colors = {
      success: { bg: '#065f46', border: '#059669', color: '#d1fae5' },
      warning: { bg: '#78350f', border: '#d97706', color: '#fef3c7' },
      error: { bg: '#7f1d1d', border: '#dc2626', color: '#fecaca' },
      info: { bg: 'var(--coffee-bg-elev)', border: 'var(--coffee-accent)', color: 'var(--coffee-text-primary)' }
    };
    const c = colors[type] || colors.info;
    const div = document.createElement('div');
    div.textContent = text;
    div.setAttribute('role', 'alert');
    Object.assign(div.style, baseStyle, {
      padding: 'var(--coffee-space-md)',
      borderRadius: 'var(--coffee-radius-sm)',
      border: '1px solid ' + c.border,
      backgroundColor: c.bg,
      color: c.color,
      ...style
    });
    return div;
  };

  /**
   * Textarea. opts: placeholder, value, id, rows, cols + style.
   */
  coffee.textarea = function (opts = {}) {
    const { placeholder, value, id, rows = 4, cols, style } = extractStyle(opts);
    const ta = document.createElement('textarea');
    ta.setAttribute('data-coffee', 'input');
    if (placeholder != null) ta.placeholder = placeholder;
    if (value != null) ta.value = value;
    if (id) ta.id = id;
    if (rows) ta.rows = rows;
    if (cols) ta.cols = cols;
    Object.assign(ta.style, baseStyle, {
      padding: 'var(--coffee-space-sm) var(--coffee-space-md)',
      border: '1px solid var(--coffee-text-muted)',
      borderRadius: 'var(--coffee-radius-sm)',
      backgroundColor: 'var(--coffee-bg-elev)',
      color: 'var(--coffee-text-primary)',
      width: '100%',
      minWidth: '200px',
      resize: 'vertical',
      ...style
    });
    return ta;
  };

  /**
   * Select dropdown. opts: options = [{ value, label }], value, id + style.
   */
  coffee.select = function (opts = {}) {
    const { options = [], value, id, style } = extractStyle(opts);
    const sel = document.createElement('select');
    sel.setAttribute('data-coffee', 'input');
    if (id) sel.id = id;
    options.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = typeof o === 'object' ? o.value : o;
      opt.textContent = typeof o === 'object' ? (o.label ?? o.value) : o;
      sel.appendChild(opt);
    });
    if (value != null) sel.value = value;
    Object.assign(sel.style, baseStyle, {
      padding: 'var(--coffee-space-sm) var(--coffee-space-md)',
      minHeight: 'var(--coffee-touch-min, 44px)',
      border: '1px solid var(--coffee-text-muted)',
      borderRadius: 'var(--coffee-radius-sm)',
      backgroundColor: 'var(--coffee-bg-elev)',
      color: 'var(--coffee-text-primary)',
      minWidth: '120px',
      cursor: 'pointer',
      ...style
    });
    return sel;
  };

  /**
   * Heading. level = 1–6.
   */
  coffee.heading = function (text, level = 1, opts = {}) {
    const { style } = extractStyle(opts);
    const h = document.createElement('h' + Math.min(6, Math.max(1, level)));
    h.textContent = text;
    Object.assign(h.style, baseStyle, {
      margin: '0 0 var(--coffee-space-sm) 0',
      color: 'var(--coffee-text-primary)',
      fontWeight: '600',
      ...style
    });
    return h;
  };

  /**
   * Flex row. children = element(s) or array. gap from --coffee-space-md.
   */
  coffee.row = function (children, opts = {}) {
    const { style } = extractStyle(opts);
    const div = document.createElement('div');
    appendChildren(div, children);
    Object.assign(div.style, baseStyle, {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 'var(--coffee-space-md)',
      flexWrap: 'wrap',
      ...style
    });
    return div;
  };

  /**
   * Flex column. children = element(s) or array.
   */
  coffee.col = function (children, opts = {}) {
    const { style } = extractStyle(opts);
    const div = document.createElement('div');
    appendChildren(div, children);
    Object.assign(div.style, baseStyle, {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--coffee-space-md)',
      ...style
    });
    return div;
  };

  /**
   * Vertical stack. opts.gap defaults to --coffee-space-md.
   */
  coffee.stack = function (children, opts = {}) {
    const { gap = 'var(--coffee-space-md)', style } = extractStyle(opts);
    const div = document.createElement('div');
    appendChildren(div, children);
    Object.assign(div.style, baseStyle, {
      display: 'flex',
      flexDirection: 'column',
      gap,
      ...style
    });
    return div;
  };

  /**
   * Fixed shell, flexible content (design_principals). Returns { el, header, main, footer }.
   * Append el to body. Put content in main. Header/footer fixed height.
   */
  coffee.appShell = function (opts = {}) {
    const header = document.createElement('header');
    const main = document.createElement('main');
    const footer = document.createElement('footer');
    Object.assign(header.style, baseStyle, {
      flexShrink: 0, height: '56px', padding: 'var(--coffee-space-md)',
      backgroundColor: 'var(--coffee-bg-elev)', borderBottom: '1px solid var(--coffee-panel)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: 'var(--coffee-shadow-soft)'
    });
    Object.assign(main.style, baseStyle, {
      flex: '1 1 auto', overflowY: 'auto', padding: 'var(--coffee-space-lg)',
      backgroundColor: 'var(--coffee-bg-surface)', color: 'var(--coffee-text-primary)'
    });
    Object.assign(footer.style, baseStyle, {
      flexShrink: 0, height: '48px', padding: 'var(--coffee-space-sm)',
      borderTop: '1px solid var(--coffee-panel)',
      display: 'flex', alignItems: 'center',
      backgroundColor: 'var(--coffee-bg-elev)'
    });
    const el = document.createElement('div');
    el.style.cssText = 'display:flex;flex-direction:column;width:100%;height:100%;max-width:600px;margin:0 auto;';
    el.appendChild(header);
    el.appendChild(main);
    el.appendChild(footer);
    return { el, header, main, footer };
  };

  /**
   * Chat message bubble. outgoing = true for sent, false for received.
   */
  coffee.chatBubble = function (text, outgoing = false, opts = {}) {
    const { style } = extractStyle(opts);
    const div = document.createElement('div');
    div.textContent = text;
    Object.assign(div.style, baseStyle, {
      maxWidth: '80%',
      padding: 'var(--coffee-space-sm) var(--coffee-space-md)',
      borderRadius: 'var(--coffee-radius-sm)',
      alignSelf: outgoing ? 'flex-end' : 'flex-start',
      backgroundColor: outgoing ? 'var(--coffee-accent)' : 'var(--coffee-bg-elev)',
      color: outgoing ? '#fff' : 'var(--coffee-text-primary)',
      border: '1px solid ' + (outgoing ? 'var(--coffee-accent)' : 'var(--coffee-panel)'),
      ...style
    });
    return div;
  };

  /**
   * Chat input row: input + send button. Returns { el, input, sendBtn }.
   */
  coffee.chatInput = function (opts = {}) {
    const onSend = opts.onSend; // extractStyle puts this in style, so get directly
    const { placeholder = 'Type a message...', style } = extractStyle(opts);
    const inp = coffee.input({ placeholder, style: { flex: 1, minWidth: 0 } });
    const btn = coffee.button('Send', null, { style: { flexShrink: 0 } });
    btn.type = 'button'; // prevent accidental form submit
    const row = coffee.row([inp, btn], { style: { width: '100%', ...style } });
    if (typeof onSend === 'function') {
      const doSend = () => {
        const text = inp.value.trim();
        if (text) {
          onSend(text);
          inp.value = '';
        }
      };
      btn.onclick = doSend;
      inp.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          doSend();
        }
      };
    }
    return { el: row, input: inp, sendBtn: btn };
  };

  /**
   * Frosted control cluster over canvas/stages (tool palettes). pointer-events: auto.
   */
  coffee.floatGroup = function (children, opts = {}) {
    const { style } = extractStyle(opts);
    const div = document.createElement('div');
    div.setAttribute('data-coffee', 'float-group');
    appendChildren(div, children);
    Object.assign(div.style, baseStyle, {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '10px',
      padding: '12px',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(43, 43, 43, 0.92)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
      pointerEvents: 'auto',
      ...style
    });
    return div;
  };

  /**
   * Absolutely positioned column (or row via style) for floatGroup stacks.
   * opts: anchor 'top-end'|'top-start'|'bottom-end'|'bottom-start', gap, offsetTop, offsetEnd, zIndex
   * Wrapper is pointer-events: none; floatGroup children are interactive.
   */
  coffee.floatStack = function (opts = {}) {
    const {
      anchor = 'top-end',
      gap = 12,
      offsetTop = 16,
      offsetEnd = 16,
      zIndex = 40,
      style
    } = extractStyle(opts);
    const isEnd = anchor === 'top-end' || anchor === 'bottom-end';
    const isTop = anchor === 'top-end' || anchor === 'top-start';
    const wrap = document.createElement('div');
    wrap.setAttribute('data-coffee', 'float-stack');
    Object.assign(wrap.style, baseStyle, {
      position: 'absolute',
      top: isTop ? offsetTop + 'px' : 'auto',
      bottom: !isTop ? offsetTop + 'px' : 'auto',
      left: anchor === 'top-start' || anchor === 'bottom-start' ? offsetEnd + 'px' : 'auto',
      right: isEnd ? offsetEnd + 'px' : 'auto',
      zIndex: String(zIndex),
      display: 'flex',
      flexDirection: 'column',
      alignItems: isEnd ? 'flex-end' : 'flex-start',
      gap: gap + 'px',
      pointerEvents: 'none',
      ...style
    });
    return wrap;
  };

  /**
   * Square icon control (pass SVG/HTML). opts: html, title, onClick, variant 'ghost'|'danger', style
   */
  coffee.iconButton = function (opts = {}) {
    const { html = '', title = '', onClick, variant = 'ghost', style } = extractStyle(opts);
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-coffee', 'icon-button');
    if (title) {
      b.title = title;
      b.setAttribute('aria-label', title);
    }
    b.innerHTML = html;
    if (variant === 'danger') b.classList.add('coffee-icon-danger');
    if (typeof onClick === 'function') b.addEventListener('click', onClick);
    Object.assign(b.style, baseStyle, {
      minWidth: 'var(--coffee-touch-min, 44px)',
      minHeight: 'var(--coffee-touch-min, 44px)',
      padding: '0',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '10px',
      border: '1px solid transparent',
      background: 'rgba(255,255,255,0.06)',
      color: 'var(--coffee-text-primary)',
      cursor: 'pointer',
      ...style
    });
    return b;
  };

  /**
   * Fixed bottom bar (brush dock, transport). children = rows (e.g. pillStrip.el + extras).
   */
  coffee.toolDock = function (children, opts = {}) {
    const { style } = extractStyle(opts);
    const bar = document.createElement('div');
    bar.setAttribute('data-coffee', 'tool-dock');
    appendChildren(bar, children);
    Object.assign(bar.style, baseStyle, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      zIndex: '50',
      minHeight: '88px',
      padding: '12px 0 14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '8px',
      background: 'var(--coffee-bg-elev, #2b2b2b)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      ...style
    });
    return bar;
  };

  /**
   * Horizontal scrolling pill toggles. opts: items [{ id, title?, content: Node|string }], value, onSelect(id), pillSize, gap
   * Returns { el, strip, setValue(id), getValue() }.
   */
  coffee.pillStrip = function (opts = {}) {
    const { items = [], value, onSelect, pillSize = 50, gap = 12, style } = extractStyle(opts);
    let current = value != null ? value : (items[0] && items[0].id);
    const wrap = document.createElement('div');
    wrap.setAttribute('data-coffee', 'pill-strip');
    const strip = document.createElement('div');
    strip.setAttribute('data-coffee', 'pill-scroll');
    strip.style.cssText =
      'display:flex;gap:' +
      gap +
      'px;padding:0 20px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none';
    const buttons = new Map();

    function setActive(id) {
      if (!buttons.has(id)) return;
      current = id;
      buttons.forEach((btn, bid) => {
        btn.setAttribute('data-coffee-pill-active', bid === id ? '1' : '0');
      });
    }

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-coffee', 'pill');
      if (item.title) {
        btn.title = item.title;
        btn.setAttribute('aria-label', item.title);
      }
      const content = item.content;
      if (content instanceof Node) btn.appendChild(content);
      else btn.innerHTML = content == null ? '' : String(content);
      Object.assign(btn.style, {
        flexShrink: '0',
        width: pillSize + 'px',
        height: pillSize + 'px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid transparent',
        background: '#333',
        color: 'var(--coffee-text-primary)',
        cursor: 'pointer',
        padding: '0',
        transition: 'border-color 0.15s, background 0.15s, transform 0.15s'
      });
      btn.addEventListener('click', () => {
        setActive(item.id);
        if (typeof onSelect === 'function') onSelect(item.id);
      });
      buttons.set(item.id, btn);
      strip.appendChild(btn);
    });

    if (current != null) setActive(current);

    wrap.appendChild(strip);
    Object.assign(wrap.style, { width: '100%', ...style });

    return {
      el: wrap,
      strip,
      setValue(id) {
        setActive(id);
      },
      getValue() {
        return current;
      }
    };
  };

  /**
   * App container: flex column, max-width 600px (design_principals).
   */
  coffee.container = function (children, opts = {}) {
    const { style } = extractStyle(opts);
    const div = document.createElement('div');
    appendChildren(div, children);
    Object.assign(div.style, baseStyle, {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      gap: 'var(--coffee-space-md)',
      ...style
    });
    return div;
  };

  // Auto-inject theme on load (dark default)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => coffee.injectTheme('dark'));
  } else {
    coffee.injectTheme('dark');
  }

  window.coffee = coffee;
})();
