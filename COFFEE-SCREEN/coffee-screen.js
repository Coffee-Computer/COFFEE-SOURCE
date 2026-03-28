/**
 * coffee.screen — headless viewport / PWA checks (same rules as COFFEE_HUB_SPLASH.html).
 * Use snapshot(), isSmall(), isStandalone(), then run your own routing or listen with onChange().
 *
 * Load after coffee-control.js if you use both (otherwise coffee-control replaces window.coffee).
 *
 * @example
 *   const { snapshot, isSmall, onChange } = coffee.screen;
 *   if (isSmall()) { ... } else { ... }
 *   const off = onChange((next, prev) => { if (next.innerWidth !== prev.innerWidth) layout(); });
 */
(function (global) {
  'use strict';

  /** Same breakpoint as COFFEE_HUB_SPLASH: &lt; 1024 → Twin, ≥ → workstation home. */
  var DEFAULT_BREAKPOINT = 1024;

  var listeners = [];
  var lastSnapshot = null;
  var debounceMs = 80;
  var debounceTimer = null;
  var attached = false;

  function win() {
    return global;
  }

  function isStandalone() {
    var w = win();
    try {
      if (w.matchMedia && w.matchMedia('(display-mode: standalone)').matches) return true;
    } catch (e) { /* ignore */ }
    return !!(w.navigator && w.navigator.standalone);
  }

  /**
   * @param {number} [breakpoint] - default DEFAULT_BREAKPOINT
   * @param {number} [width] - override width (e.g. element.clientWidth)
   */
  function isSmall(breakpoint, width) {
    var bp = breakpoint != null ? breakpoint : DEFAULT_BREAKPOINT;
    var w = width != null ? width : win().innerWidth;
    return w < bp;
  }

  /**
   * @param {number} [breakpoint]
   * @returns {'small'|'large'}
   */
  function profile(breakpoint) {
    return isSmall(breakpoint) ? 'small' : 'large';
  }

  /**
   * Labels used by Coffee Hub splash (Twin vs workstation).
   * @param {number} [breakpoint]
   * @returns {'twin'|'workstation'}
   */
  function hubProfile(breakpoint) {
    return isSmall(breakpoint) ? 'twin' : 'workstation';
  }

  /**
   * Default splash copy (COFFEE_HUB_SPLASH).
   */
  function splashMessage(breakpoint) {
    return isSmall(breakpoint)
      ? 'Small screen detected 📱 Coffee Twin Initialized ✅'
      : 'Workstation detected 💻 Coffee OS Initialized ✅';
  }

  /**
   * Pick hub iframe URL (caller supplies paths — no baked-in roots).
   * @param {{ twinSrc: string, workstationSrc: string, breakpoint?: number }} opts
   */
  function hubIframeSrc(opts) {
    opts = opts || {};
    var bp = opts.breakpoint != null ? opts.breakpoint : DEFAULT_BREAKPOINT;
    return isSmall(bp) ? opts.twinSrc : opts.workstationSrc;
  }

  function readVisualViewport() {
    var w = win();
    var vv = w.visualViewport;
    if (!vv) return null;
    return {
      width: vv.width,
      height: vv.height,
      offsetTop: vv.offsetTop,
      offsetLeft: vv.offsetLeft,
      scale: vv.scale
    };
  }

  /**
   * @returns {object} Frozen-ish snapshot for logging / comparisons
   */
  function snapshot() {
    var w = win();
    var sc = w.screen;
    var orient = sc && sc.orientation && sc.orientation.type;
    return {
      innerWidth: w.innerWidth,
      innerHeight: w.innerHeight,
      outerWidth: w.outerWidth,
      outerHeight: w.outerHeight,
      screenWidth: sc ? sc.width : null,
      screenHeight: sc ? sc.height : null,
      devicePixelRatio: w.devicePixelRatio || 1,
      orientation: orient || null,
      standalone: isStandalone(),
      visualViewport: readVisualViewport(),
      breakpoint: DEFAULT_BREAKPOINT,
      isSmall: isSmall(),
      profile: profile(),
      hubProfile: hubProfile(),
      splashMessage: splashMessage()
    };
  }

  function flushNotify() {
    debounceTimer = null;
    var next = snapshot();
    var prev = lastSnapshot;
    lastSnapshot = next;
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](next, prev);
      } catch (e) {
        console.warn('[coffee.screen] listener error', e);
      }
    }
  }

  function scheduleNotify() {
    if (debounceMs <= 0) {
      flushNotify();
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flushNotify, debounceMs);
  }

  function onGlobalResize() {
    scheduleNotify();
  }

  function attach() {
    if (attached) return;
    var w = win();
    w.addEventListener('resize', onGlobalResize);
    w.addEventListener('orientationchange', onGlobalResize);
    var vv = w.visualViewport;
    if (vv) {
      vv.addEventListener('resize', onGlobalResize);
      vv.addEventListener('scroll', onGlobalResize);
    }
    attached = true;
  }

  function detach() {
    if (!attached) return;
    var w = win();
    w.removeEventListener('resize', onGlobalResize);
    w.removeEventListener('orientationchange', onGlobalResize);
    var vv = w.visualViewport;
    if (vv) {
      vv.removeEventListener('resize', onGlobalResize);
      vv.removeEventListener('scroll', onGlobalResize);
    }
    attached = false;
  }

  /**
   * @param {function(object, object|null): void} cb - (nextSnapshot, previousSnapshot)
   * @param {{ immediate?: boolean, debounceMs?: number }} [opts] - immediate default true
   * @returns {function(): void} unsubscribe
   */
  function onChange(cb, opts) {
    opts = opts || {};
    if (typeof cb !== 'function') return function () {};

    if (opts.debounceMs != null) debounceMs = opts.debounceMs;

    listeners.push(cb);
    if (listeners.length === 1) attach();

    if (opts.immediate !== false) {
      var next = snapshot();
      try {
        cb(next, lastSnapshot);
      } catch (e) {
        console.warn('[coffee.screen] immediate callback error', e);
      }
      lastSnapshot = next;
    }

    return function unsubscribe() {
      var idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
      if (listeners.length === 0) {
        detach();
        lastSnapshot = null;
      }
    };
  }

  var api = {
    DEFAULT_BREAKPOINT: DEFAULT_BREAKPOINT,
    snapshot: snapshot,
    isStandalone: isStandalone,
    isSmall: isSmall,
    profile: profile,
    hubProfile: hubProfile,
    splashMessage: splashMessage,
    hubIframeSrc: hubIframeSrc,
    onChange: onChange
  };

  global.coffee = global.coffee || {};
  global.coffee.screen = api;
})(typeof window !== 'undefined' ? window : globalThis);
