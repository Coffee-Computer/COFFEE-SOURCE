/**
 * Snow Shoes iframe embed — child side of the host ↔ plugin postMessage bridge.
 * Include after your page loads (before or after DOMContentLoaded).
 *
 *   <script src="../snow-shoes-embed.js"></script>
 *   <script>
 *     SnowShoesEmbed.init({ debug: true });
 *     SnowShoesEmbed.onTransport(function (s) { ... s.bpm, s.playing, s.currentStep ... });
 *   </script>
 *
 * See SNOW-SHOES-EMBED.md for message types.
 */
(function () {
  if (typeof window === 'undefined') return;

  var CH = 'snow-shoes';
  var V = 1;

  var transportCb = null;
  var helloCb = null;
  var lastHello = null;
  var debug = false;

  function log() {
    if (debug && console.log) console.log.apply(console, ['[SnowShoesEmbed]'].concat([].slice.call(arguments)));
  }

  function send(type, payload) {
    if (window.parent === window) {
      log('no parent; skip', type);
      return;
    }
    try {
      window.parent.postMessage({ ch: CH, v: V, type: type, payload: payload || {} }, '*');
    } catch (e) {
      console.warn('[SnowShoesEmbed] postMessage failed', e);
    }
  }

  function onMessage(ev) {
    var d = ev.data;
    if (!d || d.ch !== CH || d.v !== V) return;

    if (d.type === 'host.hello') {
      lastHello = d.payload || {};
      log('host.hello', lastHello);
      if (typeof helloCb === 'function') helloCb(lastHello);
      return;
    }
    if (d.type === 'transport.state') {
      log('transport.state', d.payload);
      if (typeof transportCb === 'function') transportCb(d.payload || {});
      return;
    }
    if (d.type === 'host.pong') {
      log('host.pong', d.payload);
    }
  }

  window.SnowShoesEmbed = {
    CHANNEL: CH,
    PROTOCOL_VERSION: V,

    /**
     * @param {{ debug?: boolean }} [opts]
     */
    init: function (opts) {
      opts = opts || {};
      debug = !!opts.debug;
      if (window.parent === window) {
        log('top window; embed inactive');
        return;
      }
      window.addEventListener('message', onMessage);
      send('plugin.ready', {
        title: document.title,
        href: typeof location !== 'undefined' ? location.href : ''
      });
      log('plugin.ready sent');
    },

    onTransport: function (fn) {
      transportCb = typeof fn === 'function' ? fn : null;
    },

    onHello: function (fn) {
      helloCb = typeof fn === 'function' ? fn : null;
      if (lastHello && helloCb) helloCb(lastHello);
    },

    /** Last host.hello payload (after init). */
    getHostHello: function () {
      return lastHello;
    },

    sendToHost: function (type, payload) {
      send(type, payload);
    },

    /** Optional keepalive / debug. */
    ping: function () {
      send('plugin.ping', { t: Date.now() });
    }
  };
})();
