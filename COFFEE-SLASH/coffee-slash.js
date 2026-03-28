/**
 * coffee.slash — "/" command menu for markdown (and more). Editor-agnostic via adapters.
 *
 * coffee.slash.markdownPresets — default block snippets
 * coffee.slash.attach(adapter, opts) → { destroy, notifyChange }
 * coffee.slash.adapters.textarea(textareaEl)
 * coffee.slash.adapters.monaco(monacoApi) — requires monacoApi.getSelectionOffsets, replaceRange, getCursorScreenPosition
 *
 * For Monaco: call notifyChange(payload) from onChange; payload should include { value, offset } when available.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || (window.coffee = {});

  function resolve(x) {
    return x != null && typeof x.then === 'function' ? x : Promise.resolve(x);
  }

  /** @type {{ id: string, label: string, insert: string }[]} */
  const markdownPresets = [
    { id: 'h1', label: 'H1 — Heading 1', insert: '# ' },
    { id: 'h2', label: 'H2 — Heading 2', insert: '## ' },
    { id: 'h3', label: 'H3 — Heading 3', insert: '### ' },
    { id: 'bullet', label: '• Bullet list', insert: '- ' },
    { id: 'quote', label: 'Quote block', insert: '> ' },
    { id: 'code', label: 'Code block', insert: '```\n\n```' }
  ];

  function getCursorXYInTextarea(textarea, selectionPoint) {
    const div = document.createElement('div');
    const cs = getComputedStyle(textarea);
    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i];
      div.style[prop] = cs[prop];
    }
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    const content = textarea.value.substring(0, selectionPoint);
    div.textContent = content;
    const span = document.createElement('span');
    span.textContent = textarea.value.substring(selectionPoint) || '.';
    div.appendChild(span);
    document.body.appendChild(div);
    const o = span.offsetLeft;
    const t = span.offsetTop;
    document.body.removeChild(div);
    return {
      top: Math.min(t, textarea.offsetHeight - 100),
      left: Math.min(o, textarea.offsetWidth - 230)
    };
  }

  function textareaAdapter(textarea) {
    return {
      element: textarea,
      getValue: function () {
        return textarea.value;
      },
      setValue: function (v) {
        textarea.value = v;
      },
      getSelection: function () {
        return { start: textarea.selectionStart, end: textarea.selectionEnd };
      },
      replaceRange: function (start, end, text) {
        const v = textarea.value;
        textarea.value = v.slice(0, start) + text + v.slice(end);
        const np = start + text.length;
        textarea.setSelectionRange(np, np);
      },
      focus: function () {
        textarea.focus();
      },
      getMenuAnchor: function () {
        const r = textarea.getBoundingClientRect();
        const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
        const rel = getCursorXYInTextarea(textarea, textarea.selectionEnd);
        return {
          top: r.top + rel.top + lineHeight,
          left: r.left + rel.left
        };
      }
    };
  }

  function monacoAdapter(api) {
    return {
      getValue: function () {
        return api.getValue();
      },
      setValue: function (v) {
        return api.setValue(v);
      },
      getSelection: function () {
        return api.getSelectionOffsets();
      },
      replaceRange: function (start, end, text) {
        return api.replaceRange(start, end, text);
      },
      focus: function () {
        return api.focus();
      },
      getMenuAnchor: function () {
        return api.getCursorScreenPosition();
      }
    };
  }

  /**
   * @param {object} adapter — getValue, setValue, getSelection, replaceRange, focus; optional getMenuAnchor; optional element (textarea)
   * @param {object} [opts]
   * @param {Array} [opts.commands]
   * @param {HTMLElement} [opts.mountParent]
   * @param {function} [opts.onAfterInsert]
   * @param {function} [opts.onEditorInput] — e.g. refresh preview (textarea path)
   */
  function attach(adapter, opts) {
    opts = opts || {};
    const commands = opts.commands || markdownPresets;
    const mountParent = opts.mountParent || document.body;

    const menu = document.createElement('div');
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', 'Slash commands');
    menu.style.cssText =
      'position:fixed;display:none;z-index:10000;width:220px;' +
      'background:var(--coffee-bg-elev,#252525);' +
      'border:1px solid var(--coffee-panel,#3f3f46);' +
      'border-radius:var(--coffee-radius-sm,8px);' +
      'box-shadow:var(--coffee-shadow-soft,0 8px 24px rgba(0,0,0,.4));' +
      'overflow:hidden;font-family:Inter,system-ui,sans-serif;';

    const label = document.createElement('div');
    label.textContent = 'Basic blocks';
    label.style.cssText =
      'padding:8px 12px;border-bottom:1px solid var(--coffee-panel,#3f3f46);' +
      'font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;' +
      'color:var(--coffee-text-muted,#9ca3af);';
    menu.appendChild(label);

    const items = [];
    commands.forEach(function (cmd) {
      const row = document.createElement('div');
      row.setAttribute('role', 'option');
      row.textContent = cmd.label;
      row.style.cssText =
        'padding:8px 12px;cursor:pointer;font-size:13px;' +
        'color:var(--coffee-text-primary,#eee);transition:background .15s;';
      row.dataset.insert = cmd.insert;
      row.onmouseenter = function () {
        items.forEach(function (x, i) {
          if (x === row) selectedIndex = i;
          updateSelected();
        });
      };
      row.onclick = function () {
        applyInsert(cmd.insert);
      };
      menu.appendChild(row);
      items.push(row);
    });
    mountParent.appendChild(menu);

    let selectedIndex = 0;
    let visible = false;
    let lastPayload = null;

    function updateSelected() {
      items.forEach(function (el, i) {
        if (i === selectedIndex) {
          el.style.background = 'var(--coffee-accent, #4c9aff)';
          el.style.color = '#111';
        } else {
          el.style.background = '';
          el.style.color = 'var(--coffee-text-primary,#eee)';
        }
      });
    }

    function hideMenu() {
      menu.style.display = 'none';
      visible = false;
    }

    function showMenu() {
      resolve(adapter.getMenuAnchor ? adapter.getMenuAnchor() : null).then(function (anchor) {
        if (anchor && typeof anchor.top === 'number') {
          menu.style.left = anchor.left + 'px';
          menu.style.top = anchor.top + 4 + 'px';
        } else {
          menu.style.left = '24px';
          menu.style.top = '120px';
        }
        menu.style.display = 'block';
        visible = true;
        selectedIndex = 0;
        updateSelected();
      });
    }

    function applyInsert(insertText) {
      resolve(adapter.getValue())
        .then(function (value) {
          return resolve(adapter.getSelection()).then(function (sel) {
            let pos = sel.end;
            if (lastPayload && lastPayload.offset != null) pos = lastPayload.offset;
            if (pos < 1 || value[pos - 1] !== '/') return null;
            const start = pos - 1;
            const end = pos;
            return resolve(adapter.replaceRange(start, end, insertText)).then(function () {
              hideMenu();
              if (adapter.focus) resolve(adapter.focus());
              if (typeof opts.onAfterInsert === 'function') opts.onAfterInsert();
            });
          });
        })
        .catch(function () {
          hideMenu();
        });
    }

    function checkSlash() {
      resolve(adapter.getValue())
        .then(function (value) {
          return resolve(adapter.getSelection()).then(function (sel) {
            if (sel.start !== sel.end) {
              hideMenu();
              return;
            }
            let pos = sel.end;
            if (lastPayload && lastPayload.offset != null) pos = lastPayload.offset;
            if (pos > 0 && value.charAt(pos - 1) === '/') {
              showMenu();
            } else {
              hideMenu();
            }
          });
        })
        .catch(function () {
          hideMenu();
        });
    }

    function notifyChange(payload) {
      lastPayload = payload || null;
      checkSlash();
    }

    function onKeydown(e) {
      if (!visible) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateSelected();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateSelected();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const cmd = commands[selectedIndex];
        if (cmd) applyInsert(cmd.insert);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        hideMenu();
      }
    }

    document.addEventListener('keydown', onKeydown, true);

    function onDocMouseDown(e) {
      if (!visible) return;
      if (menu.contains(e.target)) return;
      if (adapter.element && adapter.element.contains(e.target)) return;
      hideMenu();
    }
    document.addEventListener('mousedown', onDocMouseDown, true);

    let inputHandler = null;
    if (adapter.element) {
      inputHandler = function () {
        notifyChange(null);
        if (typeof opts.onEditorInput === 'function') opts.onEditorInput();
      };
      adapter.element.addEventListener('input', inputHandler);
    }

    function destroy() {
      document.removeEventListener('keydown', onKeydown, true);
      document.removeEventListener('mousedown', onDocMouseDown, true);
      if (adapter.element && inputHandler) {
        adapter.element.removeEventListener('input', inputHandler);
      }
      menu.remove();
    }

    return { destroy: destroy, notifyChange: notifyChange };
  }

  coffee.slash = {
    markdownPresets: markdownPresets,
    attach: attach,
    adapters: {
      textarea: textareaAdapter,
      monaco: monacoAdapter
    }
  };
})();
