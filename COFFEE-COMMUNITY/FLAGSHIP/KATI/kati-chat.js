/**
 * KATI Chat — thin wrapper around coffee.bee for the flagship chat app.
 * Depends: coffee (ai, context, bee), window.KATI from kati-instructions.js
 */
(function () {
  if (typeof window === 'undefined') return;

  const KATI = window.KATI || {};
  const SYSTEM = KATI.SYSTEM_CHAT || 'You are a helpful assistant.';

  const STORAGE_KEYS = {
    github: 'ai-api-key-github',
    openai: 'ai-api-key-openai',
    gemini: 'ai-api-key-gemini'
  };

  function getApiKey(provider) {
    const c = window.coffee;
    if (!c || typeof c.load !== 'function') return '';
    return STORAGE_KEYS[provider] ? (c.load(STORAGE_KEYS[provider]) || '') : '';
  }

  /** @type {ReturnType<typeof window.coffee.bee> | null} */
  let beeInstance = null;

  function getBee() {
    const c = window.coffee;
    if (!c || typeof c.bee !== 'function') {
      throw new Error('kati-chat: load coffee-ai, coffee-context, coffee-bee first.');
    }
    if (!beeInstance) {
      beeInstance = c.bee({
        driveName: 'kati-chat',
        getApiKey,
        defaultSystem: SYSTEM,
        defaultProvider: 'github',
        defaultModel: 'gpt-4o'
      });
    }
    return beeInstance;
  }

  window.katiChat = {
    STORAGE_KEYS,

    getApiKey,

    getBee,

    getDefaultSystem() {
      return SYSTEM;
    },

    getSuggestedPrompts() {
      return Array.isArray(KATI.SUGGESTED_PROMPTS) ? KATI.SUGGESTED_PROMPTS : [];
    },

    async listThreads() {
      return getBee().listThreads();
    },

    async loadThread(id) {
      return getBee().loadThread(id);
    },

    async createThread(opts) {
      return getBee().createThread({
        system: opts?.system ?? SYSTEM,
        provider: opts?.provider,
        model: opts?.model,
        title: opts?.title || ''
      });
    },

    async send(threadId, content, opts) {
      return getBee().send(threadId, content, opts || {});
    },

    async removeThread(id) {
      return getBee().removeThread(id);
    }
  };
})();
