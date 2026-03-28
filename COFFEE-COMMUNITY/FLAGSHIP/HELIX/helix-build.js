/**
 * Helix build — coffee.bee for persisted build threads (helix-build drive).
 * Depends: coffee (ai, context, bee), window.HELIX from helix-instructions.js
 */
(function () {
  if (typeof window === 'undefined') return;

  const HELIX = window.HELIX || {};
  const SYSTEM_DEFAULT = HELIX.SYSTEM_BUILD || 'You are Helix, a helpful build assistant.';

  function getSystem(mode) {
    if (mode === 'chat' && HELIX.SYSTEM_CHAT) return HELIX.SYSTEM_CHAT;
    return HELIX.SYSTEM_BUILD || SYSTEM_DEFAULT;
  }

  function getSuggestedPrompts(mode) {
    if (mode === 'chat' && Array.isArray(HELIX.SUGGESTED_CHAT_PROMPTS)) {
      return HELIX.SUGGESTED_CHAT_PROMPTS;
    }
    return Array.isArray(HELIX.SUGGESTED_PROMPTS) ? HELIX.SUGGESTED_PROMPTS : [];
  }

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
      throw new Error('helix-build: load coffee-ai, coffee-context, coffee-bee first.');
    }
    if (!beeInstance) {
      beeInstance = c.bee({
        driveName: 'helix-build',
        getApiKey,
        defaultSystem: SYSTEM_DEFAULT,
        defaultProvider: 'github',
        defaultModel: 'gpt-4o'
      });
    }
    return beeInstance;
  }

  window.helixBuild = {
    STORAGE_KEYS,
    getApiKey,
    getBee,
    getDefaultSystem() {
      return SYSTEM_DEFAULT;
    },
    getSystem,
    getSuggestedPrompts(mode) {
      return getSuggestedPrompts(mode || 'build');
    },
    async listThreads() {
      return getBee().listThreads();
    },
    async loadThread(id) {
      return getBee().loadThread(id);
    },
    async createThread(opts) {
      return getBee().createThread({
        system: opts?.system ?? SYSTEM_DEFAULT,
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
