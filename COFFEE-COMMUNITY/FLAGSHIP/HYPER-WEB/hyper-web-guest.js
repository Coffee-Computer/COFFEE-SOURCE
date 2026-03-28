/**
 * Hyper-Web guest bridge — standard postMessage handling for CCE clips in Hyper-Web α.
 * No deps. Host sends:
 *   { type: 'hyper-tick', time, playing }
 *   { type: 'hyper-prop', key, value }
 *   { type: 'hyper-viewport', width, height } — composition CSS pixels (stretch ≠ COMP_W×COMP_H); triggers resize.
 * Guest notifies: { type: 'hyper-ready' } when embedded.
 *
 * Usage:
 *   hyperWebGuest.start({
 *     onTick: function (timeSeconds, playing) { ... },
 *     onProp: function (key, value) { ... }  // optional
 *   });
 */
(function (global) {
  var TICK = 'hyper-tick';
  var PROP = 'hyper-prop';
  var READY = 'hyper-ready';
  var VIEWPORT = 'hyper-viewport';

  var started = false;
  var onTick = function () {};
  var onProp = null;

  global.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === VIEWPORT) {
      try {
        global.dispatchEvent(new Event('resize'));
      } catch (err) {}
      return;
    }
    if (!started) return;
    if (d.type === TICK) {
      onTick(Number(d.time) || 0, Boolean(d.playing));
      return;
    }
    if (d.type === PROP && onProp) {
      onProp(d.key, d.value);
    }
  });

  function start(opts) {
    if (started) return;
    started = true;
    opts = opts || {};
    onTick = typeof opts.onTick === 'function' ? opts.onTick : function () {};
    onProp = typeof opts.onProp === 'function' ? opts.onProp : null;

    if (global !== global.parent) {
      try {
        global.parent.postMessage({ type: READY }, '*');
      } catch (err) {}
    }
  }

  global.hyperWebGuest = {
    start: start,
    /** Protocol constants (for docs / tests) */
    TYPE_TICK: TICK,
    TYPE_PROP: PROP,
    TYPE_READY: READY,
    TYPE_VIEWPORT: VIEWPORT
  };
})(typeof window !== 'undefined' ? window : globalThis);
