/**
 * coffee.table() — Generic table component for tabular data.
 * Load after coffee-ui.
 *
 * coffee.table(data, { columns, onRowClick, emptyMessage })
 *
 * columns: [{ key, label }] or ['key1', 'key2']
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  coffee.table = function (data = [], opts = {}) {
    const { columns = [], onRowClick, emptyMessage = 'No data' } = opts;

    const table = document.createElement('table');
    table.setAttribute('data-coffee', 'table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:14px';

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const cols = columns.map((c) => (typeof c === 'string' ? { key: c, label: c } : c));

    if (cols.length > 0) {
      const tr = document.createElement('tr');
      cols.forEach((col) => {
        const th = document.createElement('th');
        th.textContent = col.label || col.key;
        th.style.cssText = 'text-align:left;padding:12px 16px;border-bottom:1px solid var(--coffee-panel,#333);color:var(--coffee-text-muted,#999);font-weight:600;font-size:12px';
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);
    } else if (data.length > 0) {
      const keys = Object.keys(data[0]);
      keys.forEach((k) => cols.push({ key: k, label: k }));
      const tr = document.createElement('tr');
      cols.forEach((col) => {
        const th = document.createElement('th');
        th.textContent = col.label || col.key;
        th.style.cssText = 'text-align:left;padding:12px 16px;border-bottom:1px solid var(--coffee-panel,#333);color:var(--coffee-text-muted,#999);font-weight:600;font-size:12px';
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);
    }

    if (!data || data.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = cols.length || 1;
      td.textContent = emptyMessage;
      td.style.cssText = 'padding:24px;color:var(--coffee-text-muted,#999);text-align:center';
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      const keys = cols.length ? cols.map((c) => c.key) : Object.keys(data[0]);
      data.forEach((row, i) => {
        const tr = document.createElement('tr');
        if (onRowClick) {
          tr.style.cursor = 'pointer';
          tr.onclick = () => onRowClick(row, i);
        }
        tr.style.cssText = 'border-bottom:1px solid var(--coffee-panel,#333)';
        keys.forEach((key) => {
          const td = document.createElement('td');
          td.style.cssText = 'padding:12px 16px;color:var(--coffee-text-primary,#eee)';
          const val = row[key];
          td.textContent = val != null ? String(val) : '';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);

    table.setData = function (newData) {
      tbody.innerHTML = '';
      if (!newData || newData.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = cols.length || 1;
        td.textContent = emptyMessage;
        td.style.cssText = 'padding:24px;color:var(--coffee-text-muted,#999);text-align:center';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }
      const keys = cols.length ? cols.map((c) => c.key) : Object.keys(newData[0]);
      newData.forEach((row, i) => {
        const tr = document.createElement('tr');
        if (onRowClick) { tr.style.cursor = 'pointer'; tr.onclick = () => onRowClick(row, i); }
        tr.style.cssText = 'border-bottom:1px solid var(--coffee-panel,#333)';
        keys.forEach((key) => {
          const td = document.createElement('td');
          td.style.cssText = 'padding:12px 16px;color:var(--coffee-text-primary,#eee)';
          const val = row[key];
          td.textContent = val != null ? String(val) : '';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    };

    return table;
  };

  window.coffee = coffee;
})();
