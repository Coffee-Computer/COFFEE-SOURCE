/**
 * surf-ai — SURF assistant on coffee.bee + coffee.ai (BYOK).
 * Not KATI: scoped system prompt for Coffee Server / relay / vault context.
 *
 * Depends (load order):
 *   coffee-request.js → coffee-drive.js → coffee-ai.js → coffee-ai-config.js → coffee-context.js → coffee-bee.js → surf-ai.js
 *
 * Keys: use `coffee.aiConfig` when loaded (`ai-api-key-*` / `coffee_` localStorage, same as KATI/BEE-DEMO).
 * Legacy `surf.katiApiKey` is read for gemini until migrated on save.
 *
 * Usage:
 *   await coffee.surfAi.ready();
 *   await coffee.surfAi.sendMessage('Is my server ok?');
 *   await coffee.surfAi.refreshChatElement(document.getElementById('chat-list'), { welcomeText: '...' });
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  var DEFAULT_SYSTEM =
    'You are SURF AI, the assistant inside the SURF mobile shell for Coffee Server. ' +
    'You help users understand their home server, vault folders (documents, media, projects, apps), ' +
    'and relay status. Be concise and friendly; mobile-first. ' +
    'If you lack live server data, say so and suggest checking the Relay tab or Settings (API base / keys). ' +
    'Do not claim you executed API calls unless the app actually provided tool results.';

  var DRIVE_NAME = 'surf-ai';
  var DEFAULT_PROVIDER = 'gemini';
  var DEFAULT_MODEL = 'gemini-2.5-flash';

  var beeInstance = null;
  var cachedThreadId = null;

  function currentProvider() {
    if (coffee.aiConfig && typeof coffee.aiConfig.getProvider === 'function') {
      return coffee.aiConfig.getProvider() || DEFAULT_PROVIDER;
    }
    return DEFAULT_PROVIDER;
  }

  function currentModel() {
    var p = currentProvider();
    if (coffee.aiConfig && typeof coffee.aiConfig.getModel === 'function') {
      var m = coffee.aiConfig.getModel(p);
      if (m) return m;
    }
    var prov = coffee.ai && coffee.ai.providers && coffee.ai.providers[p];
    return (prov && prov.models && prov.models[0]) || DEFAULT_MODEL;
  }

  function getApiKey(provider) {
    if (coffee.aiConfig && typeof coffee.aiConfig.get === 'function') {
      return coffee.aiConfig.get(provider);
    }
    if (provider === 'gemini') return (localStorage.getItem('surf.katiApiKey') || '').trim();
    return '';
  }

  function getBee() {
    if (!coffee.bee) {
      throw new Error('surf-ai: load coffee-bee.js after coffee-ai + coffee-context');
    }
    if (!beeInstance) {
      beeInstance = coffee.bee({
        driveName: DRIVE_NAME,
        getApiKey: getApiKey,
        defaultProvider: currentProvider(),
        defaultModel: currentModel(),
        defaultSystem: DEFAULT_SYSTEM
      });
    }
    return beeInstance;
  }

  /**
   * Resolve thread id for send: reuse latest thread, or create on first message only.
   */
  async function resolveThreadIdForSend() {
    var bee = getBee();
    if (cachedThreadId) {
      var existing = await bee.loadThread(cachedThreadId);
      if (existing) return cachedThreadId;
      cachedThreadId = null;
    }
    var threads = await bee.listThreads();
    if (threads.length) {
      cachedThreadId = threads[0].id;
      return cachedThreadId;
    }
    var t = await bee.createThread({
      title: 'SURF relay',
      system: DEFAULT_SYSTEM,
      provider: currentProvider(),
      model: currentModel()
    });
    cachedThreadId = t.id;
    return cachedThreadId;
  }

  coffee.surfAi = {
    DEFAULT_SYSTEM: DEFAULT_SYSTEM,
    DRIVE_NAME: DRIVE_NAME,

    /** @returns {boolean} */
    ready: function () {
      return !!(coffee.request && coffee.drive && coffee.ai && coffee.context && coffee.bee);
    },

    getBee: getBee,

    /** Clear in-memory thread cache (e.g. after wiping drive). */
    resetCache: function () {
      cachedThreadId = null;
      beeInstance = null;
    },

    /**
     * Send user text; persists via bee (IndexedDB).
     * @param {string} text
     * @returns {Promise<{ thread: object, response: object }>}
     */
    sendMessage: async function (text) {
      var bee = getBee();
      var id = await resolveThreadIdForSend();
      return bee.send(id, text, { provider: currentProvider(), model: currentModel() });
    },

    /**
     * Fill a DOM element with the latest thread or a single welcome bubble (no thread created).
     * @param {HTMLElement} el
     * @param {{ welcomeText?: string, assistantClass?: string }} [opts]
     */
    refreshChatElement: async function (el, opts) {
      if (!el) return;
      opts = opts || {};
      var welcomeText =
        opts.welcomeText ||
        "Hi — I'm SURF AI, your Coffee server assistant. Ask about your relay, vault, or setup. Add an API key for your chosen provider in Settings if you haven't.";

      var assistantClass = opts.assistantClass || 'bubble-surf';

      try {
        var bee = getBee();
        var threads = await bee.listThreads();
        if (!threads.length) {
          cachedThreadId = null;
          el.innerHTML = '';
          var w = document.createElement('div');
          w.className = 'chat-bubble ' + assistantClass;
          w.textContent = welcomeText;
          el.appendChild(w);
          return;
        }

        cachedThreadId = threads[0].id;
        var thread = await bee.loadThread(cachedThreadId);
        el.innerHTML = '';
        var msgs = (thread && thread.messages) || [];
        for (var i = 0; i < msgs.length; i++) {
          var m = msgs[i];
          var div = document.createElement('div');
          div.className =
            m.role === 'user' ? 'chat-bubble bubble-user' : 'chat-bubble ' + assistantClass;
          div.textContent = m.content || '';
          el.appendChild(div);
        }
        el.scrollTop = el.scrollHeight;
      } catch (e) {
        console.warn('[surf-ai] refreshChatElement', e);
        el.innerHTML = '';
        var err = document.createElement('div');
        err.className = 'chat-bubble ' + assistantClass;
        err.textContent = "Couldn't load chat history. Try again.";
        el.appendChild(err);
      }
    }
  };

  window.coffee = coffee;
})();
