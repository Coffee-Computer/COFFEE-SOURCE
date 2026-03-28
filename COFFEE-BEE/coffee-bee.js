/**
 * coffee.bee — Chat framework for AI apps with context.
 * Built on coffee.ai + coffee.context. Orchestrates send flow (user msg → ai.complete → append → save).
 *
 * Depends on coffee.ai, coffee.context (which uses coffee.drive).
 *
 * const bee = coffee.bee({ driveName, getApiKey, defaultSystem });
 * bee.send(threadId, content)
 * bee.createThread(opts)
 * bee.listThreads()
 * bee.loadThread(id)
 * bee.removeThread(id)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  if (!coffee.ai || !coffee.context) {
    coffee.bee = function () {
      throw new Error('coffee.bee requires coffee.ai and coffee.context. Load coffee-ai.js and coffee-context.js first.');
    };
    window.coffee = coffee;
    return;
  }

  coffee.bee = function (config = {}) {
    const {
      driveName = 'bee-chat',
      getApiKey = () => '',
      defaultSystem = 'You are a helpful assistant. Reply briefly.',
      defaultProvider = 'github',
      defaultModel
    } = config;

    const ctx = coffee.context(driveName);

    return {
      ctx,

      /**
       * Create a new thread.
       * @param {object} opts - { provider, model, system, title }
       * @returns {Promise<object>} thread
       */
      async createThread(opts = {}) {
        return ctx.create({
          provider: opts.provider || defaultProvider,
          model: opts.model || defaultModel,
          system: opts.system ?? defaultSystem,
          title: opts.title || ''
        });
      },

      /**
       * List threads, sorted by updatedAt desc.
       */
      async listThreads() {
        return ctx.list();
      },

      /**
       * Load a thread by id.
       */
      async loadThread(id) {
        return ctx.load(id);
      },

      /**
       * Remove a thread.
       */
      async removeThread(id) {
        return ctx.remove(id);
      },

      /**
       * Send a message: append user, call ai.complete, append assistant, save.
       * @param {string} threadId
       * @param {string} content - user message
       * @param {object} opts - { provider, model, system, temperature, maxTokens } (override thread defaults)
       * @returns {Promise<{ thread, response }>}
       */
      async send(threadId, content, opts = {}) {
        const thread = await ctx.load(threadId);
        if (!thread) throw new Error('Thread not found: ' + threadId);

        const provider = opts.provider || thread.provider || defaultProvider;
        const model = opts.model || thread.model || defaultModel;
        const system = opts.system ?? thread.system ?? defaultSystem;
        const apiKey = getApiKey(provider);

        if (provider !== 'ollama' && !apiKey) {
          throw new Error('API key required for ' + provider + '. Set API key first.');
        }

        const userMsg = { role: 'user', content };
        await ctx.append(threadId, userMsg);

        const response = await coffee.ai.complete({
          provider,
          apiKey,
          model,
          messages: [...(thread.messages || []), userMsg],
          system,
          temperature: opts.temperature ?? 0.7,
          maxTokens: opts.maxTokens ?? 1500
        });

        const assistantContent = response.choices?.[0]?.message?.content || '';
        const assistantMsg = { role: 'assistant', content: assistantContent };
        const updated = await ctx.append(threadId, assistantMsg);

        return { thread: updated, response };
      }
    };
  };

  window.coffee = coffee;
})();
