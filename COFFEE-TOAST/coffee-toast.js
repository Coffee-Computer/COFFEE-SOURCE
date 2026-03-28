/**
 * coffee.toast() — Inline toast notifications.
 * No permissions. Works in iframes. Auto-dismiss.
 *
 * coffee.toast(text, type?, duration?)
 *   type: 'success' | 'warning' | 'error' | 'info' (default: 'info')
 *   duration: ms (default: 3000), 0 = no auto-dismiss
 *
 * Load after coffee-control. Uses coffee.theme if available.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const COLORS = {
    success: { bg: '#065f46', border: '#059669', color: '#d1fae5' },
    warning: { bg: '#78350f', border: '#d97706', color: '#fef3c7' },
    error: { bg: '#7f1d1d', border: '#dc2626', color: '#fecaca' },
    info: { bg: '#1e3a5f', border: '#3b82f6', color: '#bfdbfe' }
  };

  const CONTAINER_ID = 'coffee-toast-container';

  function getContainer() {
    let el = document.getElementById(CONTAINER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = CONTAINER_ID;
      el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column-reverse;gap:8px;align-items:center;pointer-events:none;max-width:min(90vw,360px)';
      document.body.appendChild(el);
    }
    return el;
  }

  coffee.toast = function (text, type = 'info', duration = 3000) {
    const c = COLORS[type] || COLORS.info;
    const div = document.createElement('div');
    div.setAttribute('role', 'status');
    div.setAttribute('aria-live', 'polite');
    div.textContent = text;
    div.style.cssText = `
      padding:12px 20px;
      border-radius:8px;
      border:1px solid ${c.border};
      background:${c.bg};
      color:${c.color};
      font-size:14px;
      font-family:system-ui,sans-serif;
      box-shadow:0 4px 12px rgba(0,0,0,0.3);
      pointer-events:auto;
      animation:coffee-toast-in 0.25s ease-out;
    `;

    const styleEl = document.getElementById('coffee-toast-styles');
    if (!styleEl) {
      const s = document.createElement('style');
      s.id = 'coffee-toast-styles';
      s.textContent = '@keyframes coffee-toast-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(s);
    }

    const container = getContainer();
    container.appendChild(div);

    if (duration > 0) {
      setTimeout(() => {
        div.style.opacity = '0';
        div.style.transform = 'translateY(-8px)';
        div.style.transition = 'opacity 0.2s, transform 0.2s';
        setTimeout(() => div.remove(), 200);
      }, duration);
    }

    return div;
  };

  window.coffee = coffee;
})();
