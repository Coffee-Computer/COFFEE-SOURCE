/**
 * coffee.shot — Live CSS filter on <video> + matching still capture (canvas ctx.filter).
 * Pairs with coffee.camera (Control) and coffee.filterCss (optional: object presets → string).
 *
 * Load order: coffee-control.js, coffee-filter.js (recommended), coffee-shot.js
 *
 * coffee.shot.applyLive(videoEl, filter);  // string | filterCss opts object | 'none'
 * coffee.shot.capture(videoEl, { filter, maxWidth, maxHeight, format, quality });
 * coffee.shot.stopStream(stream);
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  /**
   * @param {string|object|null|undefined} input - CSS filter string, or opts for coffee.filterCss, or null/'none'
   * @returns {string}
   */
  function resolveFilter(input) {
    if (input == null || input === '' || input === 'none') return 'none';
    if (typeof input === 'string') return input;
    if (typeof input === 'object' && typeof coffee.filterCss === 'function') {
      return coffee.filterCss(input);
    }
    return 'none';
  }

  const shot = {
    resolveFilter: resolveFilter,

    /**
     * Apply the same filter the capture pipeline will use (video preview).
     * @param {HTMLVideoElement} videoEl
     * @param {string|object} filterInput
     */
    applyLive: function (videoEl, filterInput) {
      if (!videoEl || !videoEl.style) return;
      videoEl.style.filter = resolveFilter(filterInput);
    },

    /**
     * Draw current video frame to canvas with ctx.filter, return data URL.
     * @param {HTMLVideoElement} videoEl
     * @param {object} [opts]
     * @param {string|object} [opts.filter] - CSS string or filterCss opts (default 'none')
     * @param {number} [opts.maxWidth] [opts.maxHeight] [opts.maxDim] - scale down (keeps aspect)
     * @param {'png'|'jpeg'} [opts.format]
     * @param {number} [opts.quality] - jpeg only, 0–1
     * @returns {string} data URL
     */
    capture: function (videoEl, opts) {
      opts = opts || {};
      const filterStr = resolveFilter(opts.filter !== undefined ? opts.filter : {});
      const format = opts.format === 'jpeg' ? 'jpeg' : 'png';
      const quality = opts.quality != null ? opts.quality : 0.92;
      const maxW = opts.maxWidth || opts.maxDim;
      const maxH = opts.maxHeight || opts.maxDim;

      const vw = videoEl.videoWidth || 640;
      const vh = videoEl.videoHeight || 480;
      let w = vw;
      let h = vh;
      if (maxW && w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }
      if (maxH && h > maxH) {
        w = Math.round((w * maxH) / h);
        h = maxH;
      }
      if (w < 1) w = 1;
      if (h < 1) h = 1;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.filter = filterStr;
      ctx.drawImage(videoEl, 0, 0, w, h);

      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      return format === 'jpeg' ? canvas.toDataURL(mime, quality) : canvas.toDataURL(mime);
    },

    /**
     * Stop all tracks (cleanup when leaving page or switching camera).
     * @param {MediaStream} stream
     */
    stopStream: function (stream) {
      if (!stream || typeof stream.getTracks !== 'function') return;
      stream.getTracks().forEach(function (t) {
        t.stop();
      });
    }
  };

  coffee.shot = shot;
  window.coffee = coffee;
})();
