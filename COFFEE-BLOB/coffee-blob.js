/**
 * coffee-blob — Image-to-Blob converter for Coffee apps.
 * Standalone util. Use with coffee.drive, CoffeeStorage, uploads, etc.
 *
 * coffee.imageToBlob(file, { maxWidth, maxHeight, quality, format })
 *   → Promise<Blob>
 *
 * Load: <script src="coffee-blob.js"></script>
 * No dependencies.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];

  /**
   * Convert an image File to a compressed Blob.
   * @param {File|Blob} file - Image file (JPEG, PNG, WebP, etc.)
   * @param {object} opts - { maxWidth, maxHeight, quality, format, preserve }
   *   - preserve: true = keep original format (PNG→PNG, JPEG→JPEG, WebP→WebP). Preserves transparency.
   * @returns {Promise<Blob>}
   */
  coffee.imageToBlob = function (file, opts = {}) {
    let { maxWidth = 1920, maxHeight = 1920, quality = 0.85, format, preserve = false } = opts;
    if (preserve && file.type) {
      format = SUPPORTED_FORMATS.includes(file.type) ? file.type : (file.type === 'image/gif' ? 'image/png' : 'image/jpeg');
    }
    format = format || 'image/jpeg';

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          const scale = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
          format,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  window.coffee = coffee;
})();
