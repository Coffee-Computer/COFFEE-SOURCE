/**
 * coffee.markdown — Markdown → HTML + iframe preview helpers for Coffee apps (e.g. Scribe).
 * Requires global `marked` (v4+). Load marked before this script.
 *
 * coffee.markdown.toHtml(md)
 * coffee.markdown.buildPreviewDocument(md, opts)
 * coffee.markdown.assignIframePreview(iframe, md, opts)  // singleton; revokes previous blob
 * coffee.markdown.createPreviewSession() → { update(iframe, md, opts), revoke() }
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || (window.coffee = {});

  const DEFAULT_MARKDOWN_CSS =
    'https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.css';

  function ensureMarked() {
    if (typeof marked === 'undefined' || typeof marked.parse !== 'function') {
      throw new Error(
        'coffee.markdown: load marked before coffee-markdown.js (e.g. marked 4.x from CDN)'
      );
    }
    return marked;
  }

  /**
   * @param {string} markdown
   * @returns {string} HTML fragment (unsafe; sanitize if user content is hostile)
   */
  function toHtml(markdown) {
    return ensureMarked().parse(String(markdown || ''));
  }

  /**
   * Full HTML document for iframe preview.
   * @param {string} markdown
   * @param {object} [opts]
   * @param {string} [opts.markdownCssUrl]
   * @param {string} [opts.bodyClass]
   * @param {string} [opts.padding]
   * @param {string} [opts.maxWidth]
   * @param {string} [opts.extraHead] - raw HTML for <head>
   * @param {string} [opts.extraBodyStyle] - CSS rules
   */
  function buildPreviewDocument(markdown, opts) {
    opts = opts || {};
    const markdownCssUrl = opts.markdownCssUrl || DEFAULT_MARKDOWN_CSS;
    const bodyClass = opts.bodyClass || 'markdown-body';
    const padding = opts.padding != null ? opts.padding : '50px';
    const maxWidth = opts.maxWidth != null ? opts.maxWidth : '800px';
    const extraHead = opts.extraHead || '';
    const extraBodyStyle = opts.extraBodyStyle || '';
    const htmlContent = toHtml(markdown);
    return (
      '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '  <link rel="stylesheet" href="' +
      markdownCssUrl +
      '">\n' +
      '  <style>\n' +
      '    body { padding: ' +
      padding +
      '; max-width: ' +
      maxWidth +
      '; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }\n' +
      '    .markdown-body { font-size: 16px; line-height: 1.6; }\n' +
      (extraBodyStyle ? '    ' + extraBodyStyle + '\n' : '') +
      '  </style>\n' +
      extraHead +
      '\n</head>\n' +
      '<body class="' +
      bodyClass +
      '">\n' +
      htmlContent +
      '\n</body>\n' +
      '</html>'
    );
  }

  let _singletonUrl = null;

  /**
   * Updates iframe src with a blob URL; revokes the previous blob from this helper.
   * @param {HTMLIFrameElement} iframe
   * @param {string} markdown
   * @param {object} [opts] - passed to buildPreviewDocument
   */
  function assignIframePreview(iframe, markdown, opts) {
    if (!iframe) return null;
    if (_singletonUrl) {
      URL.revokeObjectURL(_singletonUrl);
      _singletonUrl = null;
    }
    const doc = buildPreviewDocument(markdown, opts);
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    _singletonUrl = URL.createObjectURL(blob);
    iframe.src = _singletonUrl;
    return _singletonUrl;
  }

  /**
   * Independent preview lifecycle (multiple iframes or strict ownership).
   * @returns {{ update: function, revoke: function }}
   */
  function createPreviewSession() {
    let lastUrl = null;
    return {
      update(iframe, markdown, opts) {
        if (lastUrl) {
          URL.revokeObjectURL(lastUrl);
          lastUrl = null;
        }
        const doc = buildPreviewDocument(markdown, opts);
        const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
        lastUrl = URL.createObjectURL(blob);
        if (iframe) iframe.src = lastUrl;
        return lastUrl;
      },
      revoke() {
        if (lastUrl) {
          URL.revokeObjectURL(lastUrl);
          lastUrl = null;
        }
      }
    };
  }

  function supported() {
    return typeof marked !== 'undefined' && typeof marked.parse === 'function';
  }

  coffee.markdown = {
    toHtml,
    parse: toHtml,
    buildPreviewDocument,
    assignIframePreview,
    createPreviewSession,
    supported
  };
})();
