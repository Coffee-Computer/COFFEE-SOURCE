/**
 * coffee.aiConfig — Shared BYOK key storage + optional form mount for AI demos.
 *
 * Storage matches KATI / BEE-DEMO / AI-DEMO / HELIX:
 *   Logical id: `ai-api-key-{github|openai|gemini}`
 *   With coffee-control: `coffee.save('ai-api-key-gemini', key)` → localStorage `coffee_ai-api-key-gemini`
 *   Without coffee-control: same `coffee_` + JSON.stringify(value) shape.
 *
 * Optional: mount labeled password fields into any host element (Tailwind or coffee-ui pages).
 *
 * Load after `coffee-request.js` is fine; if `coffee.save` / `coffee.load` exist (coffee-control), they are used.
 *
 * @example
 * coffee.aiConfig.get('gemini');
 * coffee.aiConfig.set('openai', sk);
 * coffee.aiConfig.mount(document.getElementById('keys'), { cardClass: 'settings-card', ... });
 * coffee.aiConfig.saveForm(document.getElementById('keys'));
 */

(function () {
  if (typeof window === 'undefined') return;
  var coffee = window.coffee || {};

  var LS_PREFIX = 'coffee_';

  var PROVIDERS = [
    {
      id: 'github',
      label: 'GitHub Models API',
      placeholder: 'ghp_… or PAT',
      hint: 'Inference API token (GitHub Models). Same key as BEE-DEMO / KATI when using provider github.'
    },
    {
      id: 'openai',
      label: 'OpenAI',
      placeholder: 'sk-…',
      hint: 'OpenAI API key — Bearer for api.openai.com via coffee.ai.'
    },
    {
      id: 'gemini',
      label: 'Google Gemini',
      placeholder: 'AIza…',
      hint: 'Google AI Studio key — OpenAI-compatible Gemini endpoint via coffee.ai (Bearer).'
    }
  ];

  function storageId(provider) {
    return 'ai-api-key-' + provider;
  }

  function readFromLocalRaw(id) {
    var raw = localStorage.getItem(LS_PREFIX + id);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return raw;
    }
  }

  /**
   * @param {string} provider - github | openai | gemini
   * @returns {string}
   */
  function get(provider) {
    var id = storageId(provider);
    var v = null;
    if (window.coffee && typeof coffee.load === 'function') {
      v = coffee.load(id);
    } else {
      v = readFromLocalRaw(id);
    }
    if (v != null && String(v).trim() !== '') {
      return String(v).trim();
    }
    if (provider === 'gemini') {
      var leg = localStorage.getItem('surf.katiApiKey');
      if (leg && String(leg).trim()) return String(leg).trim();
    }
    return '';
  }

  /**
   * @param {string} provider
   * @param {string} value
   */
  function set(provider, value) {
    var id = storageId(provider);
    var str = value == null ? '' : String(value);
    if (window.coffee && typeof coffee.save === 'function') {
      coffee.save(id, str);
    } else {
      if (str === '') {
        localStorage.removeItem(LS_PREFIX + id);
      } else {
        localStorage.setItem(LS_PREFIX + id, JSON.stringify(str));
      }
    }
    if (provider === 'gemini' && localStorage.getItem('surf.katiApiKey')) {
      localStorage.removeItem('surf.katiApiKey');
    }
  }

  var PREF_PROVIDER_KEY = 'ai-pref-provider';

  function modelPrefKey(provider) {
    return 'ai-pref-model-' + provider;
  }

  function rawPrefLoad(key) {
    if (window.coffee && typeof coffee.load === 'function') {
      var v = coffee.load(key);
      if (v == null) return '';
      return String(v);
    }
    var raw = localStorage.getItem(LS_PREFIX + key);
    if (raw === null) return '';
    try {
      return String(JSON.parse(raw));
    } catch (_) {
      return String(raw);
    }
  }

  function rawPrefSave(key, value) {
    var str = value == null ? '' : String(value);
    if (window.coffee && typeof coffee.save === 'function') {
      coffee.save(key, str);
      return;
    }
    if (str === '') localStorage.removeItem(LS_PREFIX + key);
    else localStorage.setItem(LS_PREFIX + key, JSON.stringify(str));
  }

  /** @returns {'github'|'openai'|'gemini'|'ollama'} */
  function getProvider() {
    var v = rawPrefLoad(PREF_PROVIDER_KEY).trim();
    if (v === 'github' || v === 'openai' || v === 'gemini' || v === 'ollama') return v;
    return 'gemini';
  }

  function setProvider(p) {
    rawPrefSave(PREF_PROVIDER_KEY, p);
  }

  /** @param {string} provider */
  function getModel(provider) {
    var m = rawPrefLoad(modelPrefKey(provider)).trim();
    if (m) return m;
    var prov = window.coffee && coffee.ai && coffee.ai.providers && coffee.ai.providers[provider];
    if (prov && prov.models && prov.models.length) return prov.models[0];
    return '';
  }

  function setModel(provider, model) {
    rawPrefSave(modelPrefKey(provider), model);
  }

  /**
   * Provider + model row (needs coffee.ai.providers). Appended after API key fields when using mount(..., { includeProviderModel: true }).
   */
  function mountProviderModel(el, opts) {
    opts = opts || {};
    if (!el || !window.coffee || !coffee.ai || !coffee.ai.providers) return;

    var card = document.createElement('div');
    card.className = opts.cardClass || 'coffee-ai-cfg-card';

    var labP = document.createElement('label');
    labP.className = opts.labelClass || 'coffee-ai-cfg-label';
    labP.setAttribute('for', 'ai-cfg-provider');
    labP.textContent = opts.providerLabel || 'AI provider';

    var selP = document.createElement('select');
    selP.id = 'ai-cfg-provider';
    selP.className = opts.inputClass || 'coffee-ai-cfg-input';

    var ids = ['github', 'openai', 'gemini', 'ollama'];
    ids.forEach(function (pid) {
      if (!coffee.ai.providers[pid]) return;
      var o = document.createElement('option');
      o.value = pid;
      o.textContent = pid.charAt(0).toUpperCase() + pid.slice(1);
      selP.appendChild(o);
    });

    var labM = document.createElement('label');
    labM.className = opts.labelClass || 'coffee-ai-cfg-label';
    labM.style.marginTop = '12px';
    labM.setAttribute('for', 'ai-cfg-model');
    labM.textContent = opts.modelLabel || 'Model';

    var selM = document.createElement('select');
    selM.id = 'ai-cfg-model';
    selM.className = opts.inputClass || 'coffee-ai-cfg-input';

    function refillModels() {
      var pid = selP.value;
      var prov = coffee.ai.providers[pid];
      selM.innerHTML = '';
      (prov && prov.models ? prov.models : []).forEach(function (m) {
        var o = document.createElement('option');
        o.value = m;
        o.textContent = m;
        selM.appendChild(o);
      });
      var saved = getModel(pid);
      if (saved && Array.prototype.some.call(selM.options, function (opt) { return opt.value === saved; })) {
        selM.value = saved;
      } else if (selM.options[0]) selM.value = selM.options[0].value;
    }

    selP.addEventListener('change', refillModels);
    selP.value = getProvider();
    if (!Array.prototype.some.call(selP.options, function (opt) { return opt.value === selP.value; })) {
      if (selP.options[0]) selP.value = selP.options[0].value;
    }
    refillModels();

    var hint = document.createElement('p');
    hint.className = opts.hintClass || 'coffee-ai-cfg-hint';
    hint.textContent =
      opts.prefHint ||
      'SURF AI uses this for new sends. Match the provider to an API key above. Ollama must be reachable from this browser (usually not from phone to home LAN unless proxied).';

    card.appendChild(labP);
    card.appendChild(selP);
    card.appendChild(labM);
    card.appendChild(selM);
    card.appendChild(hint);
    el.appendChild(card);
  }

  function writeProviderModel(root) {
    var selP = root.querySelector('#ai-cfg-provider');
    var selM = root.querySelector('#ai-cfg-model');
    if (!selP || !selM || !coffee.ai || !coffee.ai.providers) return;
    selP.value = getProvider();
    if (!Array.prototype.some.call(selP.options, function (opt) { return opt.value === selP.value; })) {
      if (selP.options[0]) selP.value = selP.options[0].value;
    }
    var pid = selP.value;
    var prov = coffee.ai.providers[pid];
    selM.innerHTML = '';
    (prov && prov.models ? prov.models : []).forEach(function (m) {
      var o = document.createElement('option');
      o.value = m;
      o.textContent = m;
      selM.appendChild(o);
    });
    var saved = getModel(pid);
    if (saved && Array.prototype.some.call(selM.options, function (opt) { return opt.value === saved; })) selM.value = saved;
    else if (selM.options[0]) selM.value = selM.options[0].value;
  }

  function saveProviderModel(root) {
    var selP = root.querySelector('#ai-cfg-provider');
    var selM = root.querySelector('#ai-cfg-model');
    if (selP) setProvider(selP.value);
    if (selP && selM) setModel(selP.value, selM.value);
  }

  /**
   * @param {HTMLElement} el
   * @param {{ cardClass?: string, labelClass?: string, inputClass?: string, hintClass?: string, includeProviderModel?: boolean }} [opts]
   */
  function mount(el, opts) {
    opts = opts || {};
    if (!el) return;
    el.innerHTML = '';
    PROVIDERS.forEach(function (p) {
      var card = document.createElement('div');
      card.className = opts.cardClass || 'coffee-ai-cfg-card';

      var lab = document.createElement('label');
      lab.className = opts.labelClass || 'coffee-ai-cfg-label';
      lab.setAttribute('for', 'ai-cfg-' + p.id);
      lab.textContent = p.label;

      var inp = document.createElement('input');
      inp.id = 'ai-cfg-' + p.id;
      inp.className = opts.inputClass || 'coffee-ai-cfg-input';
      inp.type = 'password';
      inp.setAttribute('autocomplete', 'off');
      inp.placeholder = p.placeholder || '';

      card.appendChild(lab);
      card.appendChild(inp);
      if (p.hint) {
        var hint = document.createElement('p');
        hint.className = opts.hintClass || 'coffee-ai-cfg-hint';
        hint.textContent = p.hint;
        card.appendChild(hint);
      }
      el.appendChild(card);
    });
    writeForm(el);
    if (opts.includeProviderModel) mountProviderModel(el, opts);
  }

  function writeForm(root) {
    if (!root) return;
    PROVIDERS.forEach(function (p) {
      var inp = root.querySelector('#ai-cfg-' + p.id);
      if (inp) inp.value = get(p.id);
    });
    if (root.querySelector('#ai-cfg-provider')) writeProviderModel(root);
  }

  function saveForm(root) {
    if (!root) return;
    PROVIDERS.forEach(function (p) {
      var inp = root.querySelector('#ai-cfg-' + p.id);
      if (inp) set(p.id, inp.value);
    });
    if (root.querySelector('#ai-cfg-provider')) saveProviderModel(root);
  }

  coffee.aiConfig = {
    PROVIDERS: PROVIDERS,
    storageId: storageId,
    get: get,
    set: set,
    getProvider: getProvider,
    setProvider: setProvider,
    getModel: getModel,
    setModel: setModel,
    mount: mount,
    writeForm: writeForm,
    saveForm: saveForm,
    mountProviderModel: mountProviderModel
  };

  window.coffee = coffee;
})();
