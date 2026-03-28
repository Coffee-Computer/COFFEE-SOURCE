/**
 * coffee.desktop — Community Desktop window shell (vanilla JS)
 * Depends: window.coffee from coffee-control (optional: save/load for CRT prefs)
 */
(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};
  let zIndexCounter = 100;

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function focusWindow(win) {
    document.querySelectorAll('.dos-window').forEach((w) => w.classList.remove('active-window'));
    win.classList.add('active-window');
    win.style.zIndex = String(++zIndexCounter);
  }

  function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) win.remove();
  }

  function closeAllWindows() {
    document.querySelectorAll('.dos-window').forEach((win) => win.remove());
  }

  function makeDraggable(elmnt) {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
    const header = elmnt.querySelector('.window-header');
    const shield = elmnt.querySelector('.iframe-shield');

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      focusWindow(elmnt);
      shield.style.pointerEvents = 'all';
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
      elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
    }

    function closeDragElement() {
      shield.style.pointerEvents = 'none';
      document.onmouseup = null;
      document.onmousemove = null;
    }

    header.onmousedown = dragMouseDown;
  }

  function makeResizable(elmnt) {
    const resizer = elmnt.querySelector('.resizer');
    const shield = elmnt.querySelector('.iframe-shield');

    function initResize(e) {
      e.preventDefault();
      focusWindow(elmnt);
      shield.style.pointerEvents = 'all';
      window.addEventListener('mousemove', Resize, false);
      window.addEventListener('mouseup', stopResize, false);
    }

    function Resize(e) {
      elmnt.style.width = e.clientX - elmnt.offsetLeft + 'px';
      elmnt.style.height = e.clientY - elmnt.offsetTop + 'px';
    }

    function stopResize() {
      shield.style.pointerEvents = 'none';
      window.removeEventListener('mousemove', Resize, false);
      window.removeEventListener('mouseup', stopResize, false);
    }

    resizer.addEventListener('mousedown', initResize, false);
  }

  /**
   * @param {string} title - Window title bar
   * @param {string} src - iframe URL (relative to this page or absolute)
   * @param {{ width?: string, height?: string }} [opts]
   */
  function openWindow(title, src, opts) {
    const desktop = document.getElementById('desktop');
    if (!desktop) return;

    const id = 'win-' + Math.random().toString(36).slice(2, 11);
    const win = document.createElement('div');
    win.className = 'dos-window active-window';
    win.id = id;
    const offset = (zIndexCounter - 100) * 10;
    win.style.left = 50 + offset + 'px';
    win.style.top = 50 + offset + 'px';
    win.style.width = (opts && opts.width) || '720px';
    win.style.height = (opts && opts.height) || '520px';
    win.style.zIndex = String(++zIndexCounter);

    const safeTitle = escapeHtml(title);

    win.innerHTML =
      '<div class="window-header">' +
      '<div class="window-btn" data-close="' +
      id +
      '">■</div>' +
      '<div class="window-title">' +
      safeTitle +
      '</div>' +
      '<div class="window-btn">▲</div>' +
      '</div>' +
      '<div class="window-content">' +
      '<div class="iframe-shield" style="position:absolute;top:0;left:0;width:100%;height:100%;background:transparent;pointer-events:none;"></div>' +
      '</div>' +
      '<div class="resizer"></div>';

    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title || 'App';
    win.querySelector('.window-content').appendChild(iframe);

    win.querySelector('[data-close]').addEventListener('click', function () {
      closeWindow(id);
    });

    desktop.appendChild(win);
    makeDraggable(win);
    makeResizable(win);
    win.addEventListener('mousedown', () => focusWindow(win));
  }

  coffee.desktop = {
    openWindow,
    closeWindow,
    closeAllWindows,
    focusWindow,
    escapeHtml
  };

  window.coffee = coffee;
})();
