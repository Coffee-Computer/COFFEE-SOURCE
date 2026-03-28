/**
 * coffee.animate() — Standalone tween engine. No deps.
 *
 * coffee.animate(target, props, { duration, delay, ease, onUpdate, onComplete })
 *
 * Animates target's properties from current values to props.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const easeFns = {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  };

  coffee.animate = function (target, props, opts = {}) {
    const { duration = 500, delay = 0, ease = 'easeOut', onUpdate, onComplete } = opts;
    const easeFn = typeof ease === 'function' ? ease : (easeFns[ease] || easeFns.easeOut);

    const from = {};
    for (const k of Object.keys(props)) {
      from[k] = target[k] != null ? target[k] : 0;
    }

    const startTime = performance.now() + delay;
    let rafId = null;

    function tick(now) {
      if (now < startTime) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeFn(t);

      for (const k of Object.keys(props)) {
        const a = from[k];
        const b = props[k];
        if (typeof a === 'number' && typeof b === 'number') {
          target[k] = a + (b - a) * eased;
        } else if (t >= 1) {
          target[k] = b;
        }
      }

      if (typeof onUpdate === 'function') onUpdate(target, eased);

      if (t >= 1) {
        if (typeof onComplete === 'function') onComplete(target);
        return;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return {
      cancel: () => { if (rafId) cancelAnimationFrame(rafId); rafId = null; }
    };
  };

  window.coffee = coffee;
})();
