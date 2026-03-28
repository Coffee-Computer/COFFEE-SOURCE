/**
 * coffee.list() — Generic list component for data display.
 * Load after coffee-ui.
 *
 * coffee.list(items, { renderItem, onItemClick, emptyMessage, gap })
 *
 * renderItem: (item, index) => HTMLElement
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  coffee.list = function (items = [], opts = {}) {
    const { renderItem, onItemClick, emptyMessage = 'No items', gap = 'var(--coffee-space-sm, 8px)' } = opts;

    const container = document.createElement('div');
    container.setAttribute('data-coffee', 'list');
    container.style.cssText = 'display:flex;flex-direction:column;gap:' + gap + ';list-style:none;margin:0;padding:0';

    if (!items || items.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:var(--coffee-text-muted,#999);padding:var(--coffee-space-md,16px);font-size:14px';
      empty.textContent = emptyMessage;
      container.appendChild(empty);
      return container;
    }

    items.forEach((item, i) => {
      let el;
      if (renderItem) {
        el = renderItem(item, i);
        if (!(el instanceof Node)) el = document.createElement('div');
      } else {
        el = document.createElement('div');
        el.style.cssText = 'padding:var(--coffee-space-sm,8px) var(--coffee-space-md,16px);background:var(--coffee-bg-elev,#252525);border-radius:var(--coffee-radius-sm,8px);color:var(--coffee-text-primary,#eee);font-size:14px';
        el.textContent = typeof item === 'object' ? JSON.stringify(item) : String(item);
      }

      if (onItemClick) {
        el.style.cursor = 'pointer';
        el.onclick = () => onItemClick(item, i);
      }

      container.appendChild(el);
    });

    container.setItems = function (newItems) {
      container.innerHTML = '';
      if (!newItems || newItems.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'color:var(--coffee-text-muted,#999);padding:var(--coffee-space-md,16px);font-size:14px';
        empty.textContent = emptyMessage;
        container.appendChild(empty);
        return;
      }
      newItems.forEach((item, i) => {
        let el = renderItem ? renderItem(item, i) : (() => {
          const d = document.createElement('div');
          d.style.cssText = 'padding:var(--coffee-space-sm,8px) var(--coffee-space-md,16px);background:var(--coffee-bg-elev,#252525);border-radius:var(--coffee-radius-sm,8px);color:var(--coffee-text-primary,#eee);font-size:14px';
          d.textContent = typeof item === 'object' ? JSON.stringify(item) : String(item);
          return d;
        })();
        if (!(el instanceof Node)) el = document.createElement('div');
        if (onItemClick) { el.style.cursor = 'pointer'; el.onclick = () => onItemClick(item, i); }
        container.appendChild(el);
      });
    };

    return container;
  };

  window.coffee = coffee;
})();
