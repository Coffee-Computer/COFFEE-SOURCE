/**
 * coffee.drive() — Simple IndexedDB storage for Community apps.
 * Extends window.coffee. Load after coffee-control.js.
 *
 * Differs from full CoffeeStorage (coffee-storage.js):
 * - No schema: single "data" store per app
 * - No export/import, query, full-text search
 * - Function API: coffee.drive(appName) returns { save, load, list, remove, clear, count, getInfo }
 * - Items need an id (or we auto-generate). Save as { id, ... } or we add id.
 *
 * coffee.drive('my-app')
 *   .save({ id: 'x', name: 'foo' })
 *   .load('x')
 *   .list()
 *   .remove('x')
 *   .clear()
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const STORE_NAME = 'data';
  const DB_PREFIX = 'coffee-drive-';

  function openDB(appName) {
    const dbName = DB_PREFIX + appName;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  const dbCache = new Map();

  async function getDB(appName) {
    if (!dbCache.has(appName)) {
      dbCache.set(appName, openDB(appName));
    }
    return dbCache.get(appName);
  }

  coffee.drive = function (appName) {
    if (!appName || typeof appName !== 'string') {
      console.error('CoffeeDrive: appName required');
      return null;
    }

    return {
      async save(item) {
        const db = await getDB(appName);
        const obj = { ...item };
        if (obj.id === undefined) obj.id = 'item-' + Date.now();
        return new Promise((resolve, reject) => {
          const tx = db.transaction([STORE_NAME], 'readwrite');
          const req = tx.objectStore(STORE_NAME).put(obj);
          req.onsuccess = () => resolve(obj.id);
          req.onerror = () => reject(req.error);
        });
      },

      async load(id) {
        const db = await getDB(appName);
        return new Promise((resolve, reject) => {
          const tx = db.transaction([STORE_NAME], 'readonly');
          const req = tx.objectStore(STORE_NAME).get(id);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      },

      async list() {
        const db = await getDB(appName);
        return new Promise((resolve, reject) => {
          const tx = db.transaction([STORE_NAME], 'readonly');
          const req = tx.objectStore(STORE_NAME).getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      },

      async remove(id) {
        const db = await getDB(appName);
        return new Promise((resolve, reject) => {
          const tx = db.transaction([STORE_NAME], 'readwrite');
          const req = tx.objectStore(STORE_NAME).delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      },

      async clear() {
        const db = await getDB(appName);
        return new Promise((resolve, reject) => {
          const tx = db.transaction([STORE_NAME], 'readwrite');
          const req = tx.objectStore(STORE_NAME).clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      },

      async count() {
        const db = await getDB(appName);
        return new Promise((resolve, reject) => {
          const tx = db.transaction([STORE_NAME], 'readonly');
          const req = tx.objectStore(STORE_NAME).count();
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      },

      async getInfo() {
        if (!navigator.storage?.estimate) {
          return { usage: 0, quota: 0, percent: 0, supported: false };
        }
        const { usage = 0, quota = 0 } = await navigator.storage.estimate();
        return {
          usage,
          quota,
          percent: quota > 0 ? Math.round((usage / quota) * 100) : 0,
          supported: true
        };
      }
    };
  };

  window.coffee = coffee;
})();
