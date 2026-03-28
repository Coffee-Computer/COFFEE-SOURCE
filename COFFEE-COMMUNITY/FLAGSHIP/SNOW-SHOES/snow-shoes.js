/**
 * Snow Shoes — Host glue: master FX bus (coffee.fuzz) + init.
 * Load after: coffee-control, coffee-ui, coffee-synth, coffee-fuzz.
 *
 * coffee.snow.init({ fx: { reverbSeconds, reverbDecay, reverbMix } })
 * coffee.snow.installMasterFx(opts) — idempotent; inserts reverb after analyzer.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  let masterFxInstalled = false;

  /**
   * Route: masterGain → analyzer → [reverb] → destination
   * (Analyzer stays pre-FX so viz reflects dry+wet if you tap analyzer.)
   */
  function installMasterFx(opts = {}) {
    if (masterFxInstalled) return true;
    if (!coffee.synth || !coffee.synth.init) {
      console.warn('[snow-shoes] coffee.synth missing');
      return false;
    }
    if (!coffee.fuzz || !coffee.fuzz.reverb) {
      console.warn('[snow-shoes] coffee.fuzz missing');
      return false;
    }

    coffee.synth.init();
    const ctx = coffee.synth.audioContext;
    const analyzer = coffee.synth.analyzer;

    const rev = coffee.fuzz.reverb(
      opts.reverbSeconds != null ? opts.reverbSeconds : 2,
      opts.reverbDecay != null ? opts.reverbDecay : 3,
      opts.reverbMix != null ? opts.reverbMix : 0.28
    );
    if (!rev || !rev.input || !rev.output) return false;

    analyzer.disconnect();
    analyzer.connect(rev.input);
    rev.output.connect(ctx.destination);
    masterFxInstalled = true;
    return true;
  }

  coffee.snow = {
    installMasterFx,

    /**
     * @param {{ fx?: object }} [opts]
     */
    init(opts) {
      coffee.synth.init();
      installMasterFx((opts && opts.fx) || {});
      return this;
    },

    get masterFxInstalled() {
      return masterFxInstalled;
    }
  };

  window.coffee = coffee;
})();
