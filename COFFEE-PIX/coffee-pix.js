/**
 * coffee.pix — Headless image manipulation engine.
 * Canvas 2D pixel ops. No UI. Brightness, contrast, saturation, presets.
 *
 * const pix = coffee.pix({ canvas });
 * pix.load(image);
 * pix.adjust({ brightness: 10, contrast: 5, saturation: -20 });
 * pix.preset('sepia');
 * pix.reset();
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const PRESETS = {
    grayscale: (r, g, b) => {
      const v = 0.3 * r + 0.59 * g + 0.11 * b;
      return [v, v, v];
    },
    sepia: (r, g, b) => [
      Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189)),
      Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168)),
      Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131))
    ],
    invert: (r, g, b) => [255 - r, 255 - g, 255 - b],
    vintage: (r, g, b) => [
      Math.min(255, r * 0.9),
      Math.min(255, g * 0.7),
      Math.min(255, b * 0.5)
    ]
  };

  function clamp(v) {
    return Math.min(255, Math.max(0, v));
  }

  coffee.pix = function (opts = {}) {
    const { canvas, maxDim = 1200 } = opts;
    if (!canvas || !canvas.getContext) {
      throw new Error('coffee.pix requires a canvas element');
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let originalImage = null;
    let adjustments = { brightness: 0, contrast: 0, saturation: 0 };

    function drawOriginal() {
      if (!originalImage) return;
      let w = originalImage.width;
      let h = originalImage.height;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w *= ratio;
        h *= ratio;
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(originalImage, 0, 0, w, h);
    }

    function processPixels() {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const b = adjustments.brightness;
      const c = (adjustments.contrast + 100) / 100;
      const s = (adjustments.saturation + 100) / 100;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let bVal = data[i + 2];

        r += b;
        g += b;
        bVal += b;

        r = (r - 128) * c + 128;
        g = (g - 128) * c + 128;
        bVal = (bVal - 128) * c + 128;

        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * bVal;
        r = gray + s * (r - gray);
        g = gray + s * (g - gray);
        bVal = gray + s * (bVal - gray);

        data[i] = clamp(r);
        data[i + 1] = clamp(g);
        data[i + 2] = clamp(bVal);
      }
      ctx.putImageData(imageData, 0, 0);
    }

    function applyPresetToPixels(name) {
      const fn = PRESETS[name];
      if (!fn) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, bVal] = fn(data[i], data[i + 1], data[i + 2]);
        data[i] = clamp(r);
        data[i + 1] = clamp(g);
        data[i + 2] = clamp(bVal);
      }
      ctx.putImageData(imageData, 0, 0);
    }

    return {
      load(image) {
        originalImage = image;
        adjustments = { brightness: 0, contrast: 0, saturation: 0 };
        drawOriginal();
      },

      adjust(opts = {}) {
        if (opts.brightness != null) adjustments.brightness = opts.brightness;
        if (opts.contrast != null) adjustments.contrast = opts.contrast;
        if (opts.saturation != null) adjustments.saturation = opts.saturation;
        if (originalImage) {
          drawOriginal();
          processPixels();
        }
      },

      preset(name) {
        if (!originalImage) return;
        drawOriginal();
        processPixels();
        applyPresetToPixels(name);
      },

      reset() {
        adjustments = { brightness: 0, contrast: 0, saturation: 0 };
        if (originalImage) drawOriginal();
      },

      render() {
        if (!originalImage) return;
        drawOriginal();
        processPixels();
      },

      get adjustments() {
        return { ...adjustments };
      },

      get hasImage() {
        return !!originalImage;
      }
    };
  };

  coffee.pix.presets = Object.keys(PRESETS);
  window.coffee = coffee;
})();
