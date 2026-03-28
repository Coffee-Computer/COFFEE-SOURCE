/**
 * COFFEE-OMNI — Parse/normalize Hyper + CCE contracts for hosts (Hyper-Web, Viz, Crunch).
 * Depends on: nothing (optional window.cceValidate for validateHtml).
 * Load after coffee-control if you attach to window.coffee.
 */
(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  /** @deprecated Legacy Coffee Viz / canvas clips — use hyperTick for Hyper-Web */
  var VIZ = 'coffee-viz';
  var HYPER_TICK = 'hyper-tick';
  var HYPER_READY = 'hyper-ready';

  function normalizeControl(c) {
    if (!c || typeof c !== 'object') return null;
    return {
      key: String(c.key || ''),
      type: c.type || 'text',
      label: c.label,
      min: c.min,
      max: c.max,
      step: c.step,
      default: c.default,
      section: c.section,
      placeholder: c.placeholder
    };
  }

  function mapInspectorType(t) {
    var x = String(t || 'text').toLowerCase();
    if (x === 'float' || x === 'double') return 'number';
    if (x === 'string') return 'text';
    if (x === 'color' || x === 'range' || x === 'number' || x === 'text') return x;
    return 'text';
  }

  coffee.omni = {
    VERSION: 1,

    /**
     * @param {string} html
     * @returns {{ valid: boolean, errors: string[], metadata: object|null }}
     */
    validateHtml: function (html) {
      if (typeof window.cceValidate !== 'undefined' && window.cceValidate.validateHtml) {
        return window.cceValidate.validateHtml(String(html || ''));
      }
      return {
        valid: false,
        errors: ['cceValidate not loaded — include cce-validate.js before coffee-omni for validateHtml'],
        metadata: null
      };
    },

    validateContent: function (content) {
      if (typeof window.cceValidate !== 'undefined' && window.cceValidate.validateContent) {
        return window.cceValidate.validateContent(String(content || ''));
      }
      return { valid: false, errors: ['cceValidate not loaded'] };
    },

    /**
     * Read manifest.hyper, manifest.omni, or a bare { hyper } / { omni } object.
     * @returns {{ controls: object[] }}
     */
    parseSchemaFromManifest: function (manifest) {
      var m = manifest || {};
      var hyper = m.hyper || m.omni;
      if (!hyper || typeof hyper !== 'object') return { controls: [] };
      var raw = hyper.controls;
      if (!Array.isArray(raw)) return { controls: [] };
      var controls = [];
      for (var i = 0; i < raw.length; i++) {
        var n = normalizeControl(raw[i]);
        if (n && n.key) controls.push(n);
      }
      return { controls: controls };
    },

    /**
     * Merge registry entry fields into a layer descriptor (id, name, src, schema, …).
     */
    mergeRegistryEntry: function (layer, registryEntry) {
      var L = Object.assign({}, layer || {});
      var R = registryEntry || {};
      if (R.name != null) L.name = R.name;
      if (R.src != null) L.src = R.src;
      if (R.hyper != null || R.omni != null) {
        L.schema = coffee.omni.parseSchemaFromManifest({ hyper: R.hyper || R.omni });
      }
      return L;
    },

    /**
     * @param {object[]} controls — from parseSchemaFromManifest().controls
     * @param {string} [defaultSection='Layer']
     */
    inspectorSectionsFromControls: function (controls, defaultSection) {
      var titleDefault = defaultSection || 'Layer';
      var bySection = {};
      for (var i = 0; i < (controls || []).length; i++) {
        var c = controls[i];
        if (!c || !c.key) continue;
        var sec = c.section || titleDefault;
        if (!bySection[sec]) bySection[sec] = [];
        var field = {
          key: c.key,
          type: mapInspectorType(c.type),
          label: c.label || c.key
        };
        if (c.min != null) field.min = c.min;
        if (c.max != null) field.max = c.max;
        if (c.step != null) field.step = c.step;
        if (c.placeholder) field.placeholder = c.placeholder;
        bySection[sec].push(field);
      }
      var out = [];
      for (var t in bySection) {
        if (Object.prototype.hasOwnProperty.call(bySection, t)) {
          out.push({ title: t, fields: bySection[t] });
        }
      }
      return out;
    },

    defaultPropsFromControls: function (controls) {
      var o = {};
      for (var i = 0; i < (controls || []).length; i++) {
        var c = controls[i];
        if (!c || !c.key) continue;
        if (c.default !== undefined) o[c.key] = c.default;
        else {
          var ty = String(c.type || '').toLowerCase();
          if (ty === 'number' || ty === 'range' || ty === 'float' || ty === 'double') o[c.key] = 0;
          else if (ty === 'color') o[c.key] = '#ffffff';
          else o[c.key] = '';
        }
      }
      return o;
    },

    /**
     * Hyper-Web host → guest: timeline position + play state.
     * @returns {{ type: 'hyper-tick', time: number, playing: boolean }}
     */
    hyperTick: function (time, playing) {
      return {
        type: HYPER_TICK,
        time: Number(time) || 0,
        playing: Boolean(playing)
      };
    },

    isHyperTickMessage: function (data) {
      return data && data.type === HYPER_TICK;
    },

    /** @returns {{ type: 'hyper-ready' }} */
    hyperReadyMessage: function () {
      return { type: HYPER_READY };
    },

    isHyperReadyMessage: function (data) {
      return data && data.type === HYPER_READY;
    },

    /** @deprecated Use hyperTick for Hyper-Web; kept for Coffee Viz / html-clip-protocol */
    vizTick: function (time, playing) {
      return {
        type: VIZ,
        time: Number(time) || 0,
        playing: Boolean(playing)
      };
    },

    isVizReadyMessage: function (data) {
      return data && data.type === 'coffee-viz-ready';
    },

    isVizTickMessage: function (data) {
      return data && data.type === VIZ;
    },

    /**
     * Guest iframe: apply a property from the host inspector.
     * @returns {{ type: 'hyper-prop', key: string, value: unknown }}
     */
    hyperPropMessage: function (key, value) {
      return { type: 'hyper-prop', key: String(key), value: value };
    }
  };

  window.coffee = coffee;
})();
