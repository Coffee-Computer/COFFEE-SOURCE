/**
 * coffee.task — Date helpers + task store (planner/calendar engine).
 * No DOM. Load after coffee-control.js for coffee.save/load persistence.
 *
 * Date keys: YYYY-MM-DD (local calendar, padded month/day).
 * Migrates legacy TASK-POC1 keys (month 0–11) when importing coffee_tasks once.
 */
(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || (window.coffee = {});

  const LEGACY_LS = 'coffee_tasks';
  const DEFAULT_KEY = 'late_tasks_v1';

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  /** Local calendar → YYYY-MM-DD */
  function toKey(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return null;
    return (
      d.getFullYear() +
      '-' +
      pad2(d.getMonth() + 1) +
      '-' +
      pad2(d.getDate())
    );
  }

  /** YYYY-MM-DD → Date local midnight */
  function fromKey(key) {
    if (!key || typeof key !== 'string') return null;
    const m = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const d = parseInt(m[3], 10);
    const dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }

  /**
   * TASK-POC1 used getMonth() (0–11) in the key. Convert to YYYY-MM-DD.
   * Import path only — ambiguous 10/11 vs Oct/Nov new format: documented as legacy.
   */
  function legacyPocKeyToIso(key) {
    const p = String(key).split('-');
    if (p.length !== 3) return key;
    const y = parseInt(p[0], 10);
    const m0 = parseInt(p[1], 10);
    const d = parseInt(p[2], 10);
    if (!y || m0 < 0 || m0 > 11 || d < 1 || d > 31) return key;
    return y + '-' + pad2(m0 + 1) + '-' + pad2(d);
  }

  function todayKey() {
    return toKey(new Date());
  }

  /**
   * Calendar grid cells for a month (0–11).
   * @returns {{ year: number, month: number, cells: Array<{ day: number, inMonth: boolean, date: Date, dateKey: string, isToday: boolean }> }}
   */
  function monthMatrix(year, month0to11) {
    const first = new Date(year, month0to11, 1);
    const last = new Date(year, month0to11 + 1, 0);
    const pad = first.getDay();
    const daysInMonth = last.getDate();
    const prevLast = new Date(year, month0to11, 0).getDate();
    const now = new Date();
    const todayK = todayKey();
    const cells = [];

    for (let i = pad - 1; i >= 0; i--) {
      const day = prevLast - i;
      const d = new Date(year, month0to11 - 1, day);
      cells.push({
        day,
        inMonth: false,
        date: d,
        dateKey: toKey(d),
        isToday: toKey(d) === todayK
      });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month0to11, day);
      const dk = toKey(d);
      cells.push({
        day,
        inMonth: true,
        date: d,
        dateKey: dk,
        isToday: dk === todayK
      });
    }
    const tail = 42 - cells.length;
    for (let i = 1; i <= tail; i++) {
      const d = new Date(year, month0to11 + 1, i);
      cells.push({
        day: i,
        inMonth: false,
        date: d,
        dateKey: toKey(d),
        isToday: toKey(d) === todayK
      });
    }
    return { year, month: month0to11, cells };
  }

  function loadRaw(storageKey, useCoffee) {
    if (useCoffee && typeof coffee.load === 'function') {
      const v = coffee.load(storageKey);
      if (v && typeof v === 'object' && Array.isArray(v.tasks)) return v;
      if (Array.isArray(v)) return { version: 0, tasks: v };
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const v = JSON.parse(raw);
      if (v && typeof v === 'object' && Array.isArray(v.tasks)) return v;
      if (Array.isArray(v)) return { version: 0, tasks: v };
    } catch (_) {}
    return null;
  }

  function saveRaw(storageKey, payload, useCoffee) {
    if (useCoffee && typeof coffee.save === 'function') {
      coffee.save(storageKey, payload);
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (_) {}
  }

  function migrateLegacyTasksOnce(storageKey, useCoffee) {
    const existing = loadRaw(storageKey, useCoffee);
    if (existing && Array.isArray(existing.tasks)) return null;

    let legacy = null;
    try {
      const raw = localStorage.getItem(LEGACY_LS);
      if (raw) legacy = JSON.parse(raw);
    } catch (_) {}
    if (!Array.isArray(legacy) || !legacy.length) return null;

    const tasks = legacy.map(function (t) {
      const copy = Object.assign({}, t);
      if (copy.date) copy.date = legacyPocKeyToIso(copy.date);
      return copy;
    });
    return { version: 1, tasks: tasks };
  }

  /**
   * @param {object} [opts]
   * @param {string} [opts.storageKey='late_tasks_v1']
   * @param {boolean} [opts.useCoffeeStorage=true] use coffee.save/load when available
   * @param {(tasks: object[]) => void} [opts.onChange]
   */
  function createStore(opts) {
    opts = opts || {};
    const storageKey = opts.storageKey || DEFAULT_KEY;
    const useCoffee = opts.useCoffeeStorage !== false;

    let tasks = [];
    const listeners = [];

    function notify() {
      const snap = tasks.slice();
      listeners.forEach(function (fn) {
        try {
          fn(snap);
        } catch (e) {
          console.error('coffee.task onChange', e);
        }
      });
      if (opts.onChange) opts.onChange(snap);
    }

    function persist() {
      saveRaw(storageKey, { version: 1, tasks: tasks }, useCoffee);
    }

    function load() {
      let data = loadRaw(storageKey, useCoffee);
      if (!data || !Array.isArray(data.tasks)) {
        const migrated = migrateLegacyTasksOnce(storageKey, useCoffee);
        if (migrated) {
          data = migrated;
          saveRaw(storageKey, data, useCoffee);
        }
      }
      tasks = (data && data.tasks) || [];
      if (!Array.isArray(tasks)) tasks = [];
      notify();
    }

    load();

    return {
      get tasks() {
        return tasks.slice();
      },

      subscribe(fn) {
        if (typeof fn !== 'function') return function () {};
        listeners.push(fn);
        return function unsub() {
          const i = listeners.indexOf(fn);
          if (i !== -1) listeners.splice(i, 1);
        };
      },

      listForKey(dateKey, filter) {
        let list = tasks.filter(function (t) {
          return t.date === dateKey;
        });
        if (filter === 'active') list = list.filter(function (t) {
          return !t.completed;
        });
        return list.sort(function (a, b) {
          return (b.id || 0) - (a.id || 0);
        });
      },

      listForDate(date, filter) {
        const k = toKey(date);
        return k ? this.listForKey(k, filter) : [];
      },

      tasksForKeyWithDots(dateKey) {
        return tasks.filter(function (t) {
          return t.date === dateKey;
        });
      },

      add(payload) {
        const text = (payload && payload.text && String(payload.text).trim()) || '';
        if (!text) return null;
        const dk =
          payload.dateKey ||
          (payload.date ? toKey(payload.date) : null) ||
          todayKey();
        const task = {
          id: payload.id != null ? payload.id : Date.now(),
          text: text,
          completed: !!(payload && payload.completed),
          date: dk,
          createdAt:
            (payload && payload.createdAt) || new Date().toISOString()
        };
        tasks.push(task);
        persist();
        notify();
        return task;
      },

      toggle(id) {
        tasks = tasks.map(function (t) {
          return t.id === id ? Object.assign({}, t, { completed: !t.completed }) : t;
        });
        persist();
        notify();
      },

      remove(id) {
        tasks = tasks.filter(function (t) {
          return t.id !== id;
        });
        persist();
        notify();
      },

      reload() {
        load();
      },

      persist: persist
    };
  }

  coffee.task = {
    date: {
      toKey: toKey,
      fromKey: fromKey,
      todayKey: todayKey,
      monthMatrix: monthMatrix,
      legacyPocKeyToIso: legacyPocKeyToIso
    },
    createStore: createStore,
    /** @internal */
    _DEFAULT_STORAGE_KEY: DEFAULT_KEY,
    _LEGACY_STORAGE_KEY: LEGACY_LS
  };
})();
