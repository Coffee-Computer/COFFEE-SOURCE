/**
 * CCE validation — shared logic for packager, cce-check, and browser.
 * Returns { valid, errors }.
 *
 * ⚠️ CRITICAL: Validation is STRICT. Only a curated list of Coffee APIs passes.
 * Do NOT change the coffee.* check to a generic pattern (e.g. coffee\.[a-zA-Z]+).
 * Lax validation would allow dangerous/custom code. Add new APIs explicitly.
 * See CCE-SPEC.md "CRITICAL: Strict Validation" section.
 */

(function (global) {
  const FORBIDDEN = [
    { pattern: /react/i, msg: 'React is not allowed' },
    { pattern: /vue/i, msg: 'Vue is not allowed' },
    { pattern: /angular/i, msg: 'Angular is not allowed' },
    { pattern: /svelte/i, msg: 'Svelte is not allowed' },
    { pattern: /tailwind|tw-|tailwindcss/i, msg: 'Tailwind is not allowed' },
    { pattern: /bootstrap|btn-primary|btn-secondary/i, msg: 'Bootstrap is not allowed' },
    { pattern: /jquery|jQuery|\$\(/i, msg: 'jQuery is not allowed' },
    { pattern: /google-analytics|gtag|ga\(/i, msg: 'Analytics/tracking is not allowed' },
    { pattern: /cdn\.jsdelivr\.net.*react|unpkg\.com.*react/i, msg: 'React CDN is not allowed' },
    { pattern: /cdn\.jsdelivr\.net.*vue|unpkg\.com.*vue/i, msg: 'Vue CDN is not allowed' },
  ];

  function validateContent(content) {
    const errors = [];

    for (const { pattern, msg } of FORBIDDEN) {
      if (pattern.test(content)) {
        errors.push(msg);
      }
    }

    if (!/coffee-control|coffee\.control/i.test(content)) {
      errors.push('Must load Coffee Control (coffee-control.js)');
    }
    if (!/coffee-ui|coffee\.ui/i.test(content)) {
      errors.push('Must load Coffee UI (coffee-ui.js)');
    }
    if (!/coffee\.(button|textarea|input|slider|select|label|link|text|para|spinner|msg|card|glass|progressBar|announce|scoreRow|hud|heading|row|col|stack|appShell|container|injectTheme|inspector|camera|switchCamera|microphone|record|streamSpectrum|save|load|list|storageQuota|theme|graph|chatInput|chatBubble|connect|chat|drive|imageToBlob|toast|request|modal|dialog|form|table|scene3d|scene2d|animate|draw|synth|fuzz|nebula|brick|ai|context|bee|pix|plex|filterCss|shot|svg|que|wire|snake|rusty|skater|shade|shadow|dot|cup|play|coil|forge|art|gpu|file|floatGroup|floatStack|iconButton|pillStrip|toolDock|omni|frame|yay|nostr|git|install|base)/.test(content)) {
      errors.push('Must use Coffee UI/Control APIs (e.g. coffee.button, coffee.drive)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  function validateManifest(raw) {
    const errors = [];
    let m;
    try {
      m = JSON.parse(raw);
    } catch {
      return { valid: false, errors: ['Invalid manifest.json'], manifest: null };
    }
    if (!m.name || !m.id || !m.version) {
      errors.push('manifest.json must have name, id, version');
    }
    if (m.id && !/^[a-z0-9-]+$/.test(m.id)) {
      errors.push('manifest.id must be slug (a-z, 0-9, -)');
    }
    if (m.color && !/^#[0-9a-fA-F]{6}$/.test(m.color)) {
      errors.push('manifest.color must be hex (e.g. #eab308)');
    }
    return {
      valid: errors.length === 0,
      errors,
      manifest: m
    };
  }

  function parseHtmlMetadata(htmlContent) {
    const meta = {};
    const metaRe = /<meta\s+name="cce:(\w+)"\s+content="([^"]*)"/gi;
    let m;
    while ((m = metaRe.exec(htmlContent)) !== null) {
      meta[m[1]] = m[2].trim();
    }
    if (Object.keys(meta).length > 0) {
      return {
        name: meta.name,
        id: meta.id,
        icon: meta.icon || '📱',
        color: meta.color || '#4c9aff',
        description: meta.description || ''
      };
    }
    const jsonRe = /<script[^>]*data-cce-config[^>]*>([\s\S]*?)<\/script>/i;
    const jsonMatch = htmlContent.match(jsonRe);
    if (jsonMatch) {
      try {
        const j = JSON.parse(jsonMatch[1].trim());
        return {
          name: j.name,
          id: j.id,
          icon: j.icon || '📱',
          color: j.color || '#4c9aff',
          description: j.description || ''
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  function validateMetadata(metadata) {
    const errors = [];
    if (!metadata) return ['No metadata found'];
    if (!metadata.name || String(metadata.name).trim() === '') {
      errors.push('name is required');
    }
    if (!metadata.id || String(metadata.id).trim() === '') {
      errors.push('id is required');
    } else if (!/^[a-z0-9-]+$/.test(metadata.id)) {
      errors.push('id must be slug (a-z, 0-9, -)');
    }
    if (metadata.color && !/^#[0-9a-fA-F]{6}$/.test(metadata.color)) {
      errors.push('color must be hex (e.g. #eab308)');
    }
    return errors;
  }

  function validateHtml(htmlContent) {
    const contentResult = validateContent(htmlContent);
    const metadata = parseHtmlMetadata(htmlContent);
    const metadataErrors = validateMetadata(metadata);
    const allErrors = [...contentResult.errors, ...metadataErrors];
    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      metadata: metadata
    };
  }

  const api = {
    validateContent,
    validateManifest,
    parseHtmlMetadata,
    validateMetadata,
    validateHtml
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.cceValidate = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
