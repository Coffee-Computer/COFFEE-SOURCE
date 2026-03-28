/**
 * coffee.inspector — Schema-driven property panel (domain-agnostic).
 *
 * syncFrom() → null (empty) or a flat object { key: value }.
 * syncTo(key, value) — apply an edit from the panel.
 *
 * Load after coffee-ui when you want themed controls (optional).
 * @see README.md
 */
(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  /**
   * @param {Object} opts
   * @param {string|HTMLElement} opts.mount — container
   * @param {string} [opts.title='Properties']
   * @param {string} [opts.emptyText]
   * @param {{ title?: string, fields: Array<{ key: string, type: 'color'|'range'|'text'|'number', label: string, min?: number, max?: number, step?: number, placeholder?: string }> }[]} opts.sections
   * @param {() => object|null|undefined} opts.syncFrom
   * @param {(key: string, value: unknown) => void} [opts.syncTo]
   * @param {() => void} [opts.onDelete]
   * @param {boolean} [opts.showDelete]
   */
  coffee.inspector = function (opts) {
    if (!opts || !opts.mount) throw new Error('coffee.inspector: mount required');

    const {
      title = 'Properties',
      emptyText = 'Nothing selected',
      sections = [],
      syncFrom,
      syncTo,
      onDelete,
      showDelete = Boolean(onDelete)
    } = opts;

    const c = window.coffee;
    const hasUi = c && typeof c.input === 'function';

    const root =
      typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount;
    if (!root) throw new Error('coffee.inspector: mount element not found');

    const emptyEl = document.createElement('div');
    emptyEl.className = 'coffee-inspector-empty';
    emptyEl.setAttribute('data-coffee-inspector', 'empty');
    emptyEl.textContent = emptyText;
    Object.assign(emptyEl.style, {
      textAlign: 'center',
      padding: '24px',
      color: 'var(--coffee-text-muted, #999)',
      fontSize: '13px'
    });

    const formEl = document.createElement('div');
    formEl.className = 'coffee-inspector-form';
    formEl.setAttribute('data-coffee-inspector', 'form');
    formEl.style.display = 'none';

    const headRow = document.createElement('div');
    Object.assign(headRow.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      gap: '8px'
    });
    const h = document.createElement('h3');
    h.textContent = title;
    Object.assign(h.style, {
      margin: '0',
      fontSize: '14px',
      fontWeight: '700',
      color: 'var(--coffee-text-primary, #111)'
    });
    headRow.appendChild(h);

    if (showDelete && typeof onDelete === 'function') {
      const delBtn = hasUi
        ? c.button('Delete', onDelete, {
            style: { minHeight: '36px', padding: '6px 12px', fontSize: '12px' }
          })
        : (() => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = 'Delete';
            b.onclick = onDelete;
            Object.assign(b.style, {
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: '1px solid var(--coffee-text-muted, #ccc)',
              background: 'var(--coffee-bg-elev, #fff)'
            });
            return b;
          })();
      headRow.appendChild(delBtn);
    }
    formEl.appendChild(headRow);

    /** @type {Record<string, HTMLInputElement>} */
    const fieldEls = {};

    function applySyncTo(key, raw) {
      if (typeof syncTo !== 'function') return;
      syncTo(key, raw);
    }

    sections.forEach((sec) => {
      if (sec.title) {
        const st = document.createElement('div');
        st.textContent = sec.title;
        Object.assign(st.style, {
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          color: 'var(--coffee-text-muted, #666)',
          margin: '16px 0 8px'
        });
        formEl.appendChild(st);
      }
      (sec.fields || []).forEach((f) => {
        const id = 'coffee-inspector-' + f.key.replace(/[^a-zA-Z0-9_-]/g, '_');
        const wrap = document.createElement('div');
        Object.assign(wrap.style, { marginBottom: '12px' });

        let inputEl;

        if (f.type === 'color') {
          inputEl = document.createElement('input');
          inputEl.type = 'color';
          inputEl.id = id;
          Object.assign(inputEl.style, {
            width: '100%',
            height: '40px',
            border: '1px solid var(--coffee-text-muted, #ccc)',
            borderRadius: '6px',
            cursor: 'pointer',
            boxSizing: 'border-box'
          });
          inputEl.oninput = () => applySyncTo(f.key, inputEl.value);
        } else if (f.type === 'range') {
          const min = f.min ?? 0;
          const max = f.max ?? 100;
          const step = f.step ?? 1;
          let initVal = null;
          try {
            if (typeof syncFrom === 'function') {
              const data = syncFrom();
              if (data != null && data[f.key] != null) {
                const n = Number(data[f.key]);
                if (Number.isFinite(n)) initVal = n;
              }
            }
          } catch (e) {
            /* ignore */
          }
          if (initVal == null && f.default != null) {
            const n = Number(f.default);
            if (Number.isFinite(n)) initVal = n;
          }
          if (initVal == null) {
            if (max === 360 && min === 0) initVal = 0;
            else if (max === 100 && min === 0) initVal = 100;
            else if (min < 1 && max > 1) initVal = 1;
            else initVal = min;
          }
          if (hasUi) {
            inputEl = c.slider({
              id,
              min,
              max,
              step,
              value: initVal,
              onInput: (v) => applySyncTo(f.key, v),
              style: { width: '100%', minWidth: '0' }
            });
          } else {
            inputEl = document.createElement('input');
            inputEl.type = 'range';
            inputEl.id = id;
            inputEl.min = String(min);
            inputEl.max = String(max);
            inputEl.step = String(step);
            inputEl.value = String(initVal);
            inputEl.style.width = '100%';
            inputEl.oninput = () => applySyncTo(f.key, parseFloat(inputEl.value));
          }
        } else if (f.type === 'number') {
          let numInit = null;
          try {
            if (typeof syncFrom === 'function') {
              const d0 = syncFrom();
              if (d0 != null && d0[f.key] != null) {
                const n0 = Number(d0[f.key]);
                if (Number.isFinite(n0)) numInit = n0;
              }
            }
          } catch (e) {
            /* ignore */
          }
          if (numInit == null && f.default != null) {
            const n1 = Number(f.default);
            if (Number.isFinite(n1)) numInit = n1;
          }
          if (numInit == null) numInit = 0;
          if (hasUi) {
            inputEl = c.input({
              type: 'number',
              id,
              value: String(numInit),
              style: { width: '100%', minWidth: '0', boxSizing: 'border-box' }
            });
          } else {
            inputEl = document.createElement('input');
            inputEl.type = 'number';
            inputEl.id = id;
            inputEl.value = String(numInit);
            inputEl.style.width = '100%';
            inputEl.style.boxSizing = 'border-box';
            inputEl.style.padding = '8px';
          }
          inputEl.oninput = () => {
            const n = parseFloat(inputEl.value);
            applySyncTo(f.key, Number.isFinite(n) ? n : inputEl.value);
          };
        } else {
          if (hasUi) {
            inputEl = c.input({
              type: 'text',
              id,
              placeholder: f.placeholder || '',
              style: { width: '100%', minWidth: '0', boxSizing: 'border-box' }
            });
          } else {
            inputEl = document.createElement('input');
            inputEl.type = 'text';
            inputEl.id = id;
            inputEl.placeholder = f.placeholder || '';
            inputEl.style.width = '100%';
            inputEl.style.boxSizing = 'border-box';
            inputEl.style.padding = '8px';
          }
          inputEl.oninput = () => applySyncTo(f.key, inputEl.value);
        }

        const lab = hasUi
          ? c.label(f.label, inputEl)
          : (() => {
              const l = document.createElement('label');
              l.htmlFor = id;
              l.textContent = f.label;
              Object.assign(l.style, {
                display: 'block',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--coffee-text-muted, #666)',
                marginBottom: '4px'
              });
              return l;
            })();

        wrap.appendChild(lab);
        wrap.appendChild(inputEl);
        formEl.appendChild(wrap);
        fieldEls[f.key] = inputEl;
      });
    });

    root.appendChild(emptyEl);
    root.appendChild(formEl);

    function update() {
      const data = typeof syncFrom === 'function' ? syncFrom() : null;
      if (data == null) {
        emptyEl.style.display = 'block';
        formEl.style.display = 'none';
        return;
      }
      emptyEl.style.display = 'none';
      formEl.style.display = 'block';
      Object.keys(fieldEls).forEach((key) => {
        const el = fieldEls[key];
        const v = data[key];
        if (v === undefined || v === null) {
          if (el.type === 'color') return;
          if (el.type === 'range' || el.getAttribute('data-coffee') === 'slider') {
            /*
             * Do not snap missing values to el.min — that makes opacity=0, scale=0.2, etc. and “invisible” layers.
             * Sensible defaults for common Hyper-Web transform keys; else use midpoint or min.
             */
            const lo = parseFloat(el.min);
            const hi = parseFloat(el.max);
            let def = Number.isFinite(lo) ? lo : 0;
            if (key === 'opacity' && hi === 100 && lo === 0) def = 100;
            else if (key === 'scale' && Number.isFinite(lo) && Number.isFinite(hi) && hi > 1 && lo < 1) def = 1;
            else if (key === 'rotate' && hi === 360 && lo === 0) def = 0;
            else if (Number.isFinite(lo) && Number.isFinite(hi) && hi > lo) def = lo + (hi - lo) * 0.5;
            el.value = String(def);
            return;
          }
          if (el.type === 'number') {
            /* Hyper-Web X/Y: missing props must become 0 or transform + inspector drift. */
            if (key === 'x' || key === 'y') {
              el.value = '0';
              applySyncTo(key, 0);
              return;
            }
          }
          el.value = '';
          return;
        }
        if (el.type === 'range' || el.getAttribute('data-coffee') === 'slider') {
          el.value = String(v);
        } else if (el.type === 'color') {
          el.value = String(v);
        } else {
          el.value = String(v);
        }
      });
    }

    return {
      update,
      destroy() {
        root.innerHTML = '';
      }
    };
  };

  window.coffee = coffee;
})();
