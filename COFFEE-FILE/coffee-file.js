/**
 * coffee.file — File System Access API wrapper.
 * Standalone. Extends window.coffee. Load after coffee-control or coffee-ui.
 *
 * coffee.file.open(opts)   → Promise<File|File[]>
 * coffee.file.save(blob, opts) → Promise<FileSystemFileHandle|null>
 * coffee.file.directory(opts)  → Promise<FileSystemDirectoryHandle|null>
 * coffee.file.supported()  → boolean
 *
 * Chrome/Edge: native picker. Firefox/Safari: fallback (input + download).
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const supported = () => 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;

  function typesToAccept(types) {
    if (!types || !Array.isArray(types)) return undefined;
    return types.map((t) => {
      if (typeof t === 'string') return { description: t, accept: { [t]: [] } };
      if (t.accept) return { description: t.description || '', accept: t.accept };
      const mime = t.mime || t.mimeType || '*/*';
      const ext = t.extensions || t.ext || [];
      return { description: t.description || '', accept: { [mime]: ext } };
    });
  }

  function typesToAcceptString(types) {
    if (!types || !Array.isArray(types)) return '';
    return types
      .map((t) => {
        if (typeof t === 'string') return t;
        if (t.extensions?.length) return t.extensions.map((e) => (e.startsWith('.') ? e : '.' + e)).join(',');
        if (t.mime) return t.mime;
        return '';
      })
      .filter(Boolean)
      .join(',');
  }

  async function openNative(opts = {}) {
    const { multiple = false, types, excludeAcceptAllOption = false } = opts;
    const acceptTypes = typesToAccept(types);
    const pickerOpts = { multiple, excludeAcceptAllOption };
    if (acceptTypes?.length) pickerOpts.types = acceptTypes;

    try {
      const handles = await window.showOpenFilePicker(pickerOpts);
      const files = await Promise.all(handles.map((h) => h.getFile()));
      return multiple ? files : files[0];
    } catch (e) {
      if (e.name === 'AbortError') return multiple ? [] : null;
      throw e;
    }
  }

  function openFallback(opts = {}) {
    const { multiple = false, types } = opts;
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = multiple;
      const accept = typesToAcceptString(types);
      if (accept) input.accept = accept;
      input.onchange = () => {
        const files = multiple ? Array.from(input.files) : input.files?.[0];
        resolve(files);
      };
      input.oncancel = () => resolve(multiple ? [] : null);
      input.click();
    });
  }

  async function saveNative(blob, opts = {}) {
    const { suggestedName = 'download', types, excludeAcceptAllOption = false } = opts;
    const acceptTypes = typesToAccept(types);
    const pickerOpts = { suggestedName, excludeAcceptAllOption };
    if (acceptTypes?.length) pickerOpts.types = acceptTypes;

    try {
      const handle = await window.showSaveFilePicker(pickerOpts);
      const w = await handle.createWritable();
      await w.write(blob);
      await w.close();
      return handle;
    } catch (e) {
      if (e.name === 'AbortError') return null;
      throw e;
    }
  }

  function saveFallback(blob, opts = {}) {
    const { suggestedName = 'download' } = opts;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    a.click();
    URL.revokeObjectURL(url);
    return Promise.resolve(null);
  }

  async function directoryNative(opts = {}) {
    const { id, mode = 'read' } = opts;
    const pickerOpts = { mode };
    if (id) pickerOpts.id = id;
    try {
      return await window.showDirectoryPicker(pickerOpts);
    } catch (e) {
      if (e.name === 'AbortError') return null;
      throw e;
    }
  }

  function directoryFallback() {
    return Promise.resolve(null);
  }

  coffee.file = {
    supported,

    /**
     * Open file(s). Returns File or File[].
     * @param {object} opts - { multiple, types: [{ description, accept }], excludeAcceptAllOption }
     */
    async open(opts = {}) {
      if (supported()) return openNative(opts);
      return openFallback(opts);
    },

    /**
     * Save blob to file. Returns FileSystemFileHandle (Chrome) or null (fallback).
     * @param {Blob} blob
     * @param {object} opts - { suggestedName, types }
     */
    async save(blob, opts = {}) {
      if (!(blob instanceof Blob)) {
        const str = typeof blob === 'string' ? blob : JSON.stringify(blob);
        const mime = opts.types?.[0]?.accept ? Object.keys(opts.types[0].accept)[0] : 'text/plain';
        blob = new Blob([str], { type: mime || 'text/plain' });
      }
      if (supported()) return saveNative(blob, opts);
      return saveFallback(blob, opts);
    },

    /**
     * Pick directory. Returns FileSystemDirectoryHandle (Chrome) or null.
     * @param {object} opts - { id, mode: 'read'|'readwrite' }
     */
    async directory(opts = {}) {
      if (supported()) return directoryNative(opts);
      return directoryFallback(opts);
    },

    /**
     * Read file as text.
     */
    async readText(file) {
      if (!(file instanceof File)) throw new Error('coffee.file.readText: File required');
      return file.text();
    },

    /**
     * Read file as ArrayBuffer.
     */
    async readArrayBuffer(file) {
      if (!(file instanceof File)) throw new Error('coffee.file.readArrayBuffer: File required');
      return file.arrayBuffer();
    },

    /**
     * Read file as JSON.
     */
    async readJSON(file) {
      const text = await this.readText(file);
      return JSON.parse(text);
    }
  };

  window.coffee = coffee;
})();
