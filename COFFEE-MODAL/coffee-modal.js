/**
 * coffee.modal() / coffee.dialog() — Overlay modals and confirm dialogs.
 * Load after coffee-control. Optional: coffee-ui for styled content.
 *
 * coffee.modal(content, { title, onClose, closeOnOverlay })
 * coffee.dialog(message, { title, confirm, cancel, onConfirm, onCancel })
 *
 * Esc to close. Click overlay to close (if closeOnOverlay).
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const CONTAINER_ID = 'coffee-modal-container';

  function getContainer() {
    let el = document.getElementById(CONTAINER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = CONTAINER_ID;
      el.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box';
      document.body.appendChild(el);
    }
    return el;
  }

  function injectStyles() {
    if (document.getElementById('coffee-modal-styles')) return;
    const s = document.createElement('style');
    s.id = 'coffee-modal-styles';
    s.textContent = `
      .coffee-modal-backdrop { position:fixed;inset:0;background:rgba(0,0,0,0.7) }
      .coffee-modal-box { position:relative;z-index:1;background:var(--coffee-bg-surface,#1a1a1a);border-radius:12px;max-width:min(90vw,480px);max-height:85vh;overflow:auto;box-shadow:0 24px 48px rgba(0,0,0,0.4) }
      .coffee-modal-header { display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--coffee-panel,#333) }
      .coffee-modal-title { font-size:18px;font-weight:600;color:var(--coffee-text-primary,#eee) }
      .coffee-modal-close { width:32px;height:32px;border:none;background:transparent;color:var(--coffee-text-muted,#999);cursor:pointer;font-size:20px;line-height:1;border-radius:6px }
      .coffee-modal-close:hover { background:rgba(255,255,255,0.1);color:#fff }
      .coffee-modal-body { padding:20px }
      .coffee-dialog-actions { display:flex;gap:12px;justify-content:flex-end;margin-top:20px }
      .coffee-dialog-btn { padding:10px 20px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;border:none }
      .coffee-dialog-btn-primary { background:var(--coffee-accent,#4c9aff);color:#fff }
      .coffee-dialog-btn-secondary { background:var(--coffee-bg-elev,#333);color:var(--coffee-text-primary,#eee) }
    `;
    document.head.appendChild(s);
  }

  coffee.modal = function (content, opts = {}) {
    const { title = '', onClose, closeOnOverlay = true } = opts;
    injectStyles();

    const backdrop = document.createElement('div');
    backdrop.className = 'coffee-modal-backdrop';

    const box = document.createElement('div');
    box.className = 'coffee-modal-box';

    const header = document.createElement('div');
    header.className = 'coffee-modal-header';
    header.innerHTML = '<span class="coffee-modal-title">' + (title || '') + '</span><button type="button" class="coffee-modal-close" aria-label="Close">&times;</button>';

    const body = document.createElement('div');
    body.className = 'coffee-modal-body';
    if (typeof content === 'string') body.innerHTML = content;
    else if (content instanceof Node) body.appendChild(content);

    box.appendChild(header);
    box.appendChild(body);

    const close = () => {
      container.removeChild(wrap);
      if (container.children.length === 0) container.remove();
      onClose && onClose();
    };

    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px';
    wrap.appendChild(backdrop);
    wrap.appendChild(box);

    backdrop.onclick = closeOnOverlay ? close : null;
    box.onclick = (e) => e.stopPropagation();
    header.querySelector('.coffee-modal-close').onclick = close;

    const onEsc = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); } };
    document.addEventListener('keydown', onEsc);

    const container = getContainer();
    container.appendChild(wrap);

    return { close, element: wrap };
  };

  coffee.dialog = function (message, opts = {}) {
    const { title = 'Confirm', confirm = 'OK', cancel = 'Cancel', onConfirm, onCancel } = opts;
    injectStyles();

    const div = document.createElement('div');
    div.style.cssText = 'color:var(--coffee-text-primary,#eee);font-size:15px;line-height:1.5';
    div.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'coffee-dialog-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'coffee-dialog-btn coffee-dialog-btn-secondary';
    cancelBtn.textContent = cancel;
    cancelBtn.onclick = () => { d.close(); onCancel && onCancel(); };

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'coffee-dialog-btn coffee-dialog-btn-primary';
    confirmBtn.textContent = confirm;
    confirmBtn.onclick = () => { d.close(); onConfirm && onConfirm(); };

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);

    const body = document.createElement('div');
    body.appendChild(div);
    body.appendChild(actions);

    const d = coffee.modal(body, { title, closeOnOverlay: false, onClose: onCancel });
    return d;
  };

  window.coffee = coffee;
})();
