/**
 * coffee.skater — Object-based CSS shader engine.
 * Keyframe JSON → CSS filter + transform. Uses hue, scale, skew, blur, invert.
 *
 * coffee.skater(opts) — opts: { target, onState, frameInterval }
 * Returns: { compile, start, stop, loadPreset, getState, presets }
 *
 * const s = coffee.skater({ target: '#stage' });
 * s.compile([{ hue: 0, scale: 1 }, { hue: 360, scale: 2 }]);
 * s.start();
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const DEFAULT_FRAME_INTERVAL = 40;

  const PRESETS = {
    psycho: [
      { hue: 0, scale: 1, skew: 0, blur: 0, invert: 0 },
      { hue: 360, scale: 2, skew: 0, blur: 0, invert: 0 }
    ],
    ghost: [
      { hue: 220, scale: 1, skew: 5, blur: 0, invert: 0 },
      { hue: 220, scale: 1.1, skew: -5, blur: 20, invert: 0.8 },
      { hue: 220, scale: 1, skew: 5, blur: 0, invert: 0 }
    ],
    default: [
      { hue: 0, scale: 1, skew: 0, blur: 0, invert: 0 },
      { hue: 180, scale: 1.5, skew: 15, blur: 10, invert: 0.5 },
      { hue: 360, scale: 1, skew: -15, blur: 0, invert: 0 }
    ]
  };

  coffee.skater = function (opts = {}) {
    const { target, onState = () => {}, frameInterval = DEFAULT_FRAME_INTERVAL } = opts;
    let el = null;
    let timeline = [];
    let isRunning = false;
    let currentStep = 0;
    let frameCount = 0;

    function resolveTarget() {
      if (!target) return null;
      el = typeof target === 'string' ? document.querySelector(target) : target;
      return el;
    }

    function applyState(state) {
      if (!el) return;
      const h = state.hue ?? 0;
      const s = state.scale ?? 1;
      const k = state.skew ?? 0;
      const b = state.blur ?? 0;
      const i = state.invert ?? 0;
      el.style.filter = `hue-rotate(${h}deg) blur(${b}px) invert(${i * 100}%)`;
      el.style.transform = `scale(${s}) skewX(${k}deg)`;
      onState(state);
    }

    function animate() {
      if (!isRunning || timeline.length === 0) return;
      frameCount++;
      const state = timeline[currentStep];
      applyState(state);
      if (frameCount % frameInterval === 0) {
        currentStep = (currentStep + 1) % timeline.length;
      }
      requestAnimationFrame(animate);
    }

    return {
      compile(input) {
        if (!resolveTarget()) return false;
        try {
          const raw = typeof input === 'string' ? input : JSON.stringify(input);
          const clean = raw.replace(/\/\/.*$/gm, '');
          timeline = JSON.parse(clean);
          if (!Array.isArray(timeline) || timeline.length === 0) {
            timeline = PRESETS.default;
          }
          frameCount = 0;
          currentStep = 0;
          if (!isRunning) {
            isRunning = true;
            animate();
          }
          return true;
        } catch (e) {
          console.warn('coffee.skater: compile failed', e);
          return false;
        }
      },

      start() {
        if (!resolveTarget() || timeline.length === 0) return;
        isRunning = true;
        animate();
      },

      stop() {
        isRunning = false;
        if (el) {
          el.style.filter = '';
          el.style.transform = '';
        }
        onState(null);
      },

      loadPreset(key) {
        const preset = PRESETS[key] || PRESETS.default;
        return JSON.stringify(preset, null, 2);
      },

      getState() {
        return timeline[currentStep] || null;
      },

      get isRunning() {
        return isRunning;
      },

      presets: PRESETS,
      version: '1.0'
    };
  };

  window.coffee = coffee;
})();
