/**
 * coffee.context — AI conversation context storage.
 * Built on coffee.drive. Stores threads (messages, provider, model, system).
 *
 * Depends on coffee.drive. Message format matches coffee.ai (OpenAI-style).
 *
 * const ctx = coffee.context('my-app');
 * ctx.create({ provider, model, system, title })
 * ctx.append(id, ...messages)
 * ctx.load(id)
 * ctx.list()
 * ctx.save(thread)
 * ctx.remove(id)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  if (!coffee.drive) {
    coffee.context = function () {
      throw new Error('coffee.context requires coffee.drive. Load coffee-drive.js first.');
    };
    window.coffee = coffee;
    return;
  }

  const PREFIX = 'ctx-';

  coffee.context = function (driveOrAppName) {
    const drive = typeof driveOrAppName === 'string'
      ? coffee.drive(driveOrAppName)
      : (driveOrAppName?.drive || coffee.drive('coffee-context'));

    function toId(id) {
      return id.startsWith(PREFIX) ? id : PREFIX + id;
    }

    function fromId(id) {
      return id.startsWith(PREFIX) ? id.slice(PREFIX.length) : id;
    }

    return {
      /**
       * Create a new thread.
       * @param {object} opts - { provider, model, system, title }
       * @returns {Promise<object>} thread
       */
      async create(opts = {}) {
        const { provider = 'github', model, system = '', title = '' } = opts;
        const id = toId('thread-' + Date.now());
        const now = Date.now();
        const thread = {
          id,
          provider,
          model: model || (coffee.ai?.providers?.[provider]?.models?.[0]) || 'gpt-4o',
          system,
          title,
          messages: [],
          createdAt: now,
          updatedAt: now
        };
        await drive.save(thread);
        return thread;
      },

      /**
       * Append messages to a thread and save.
       * @param {string} id - thread id
       * @param {...object} messages - { role, content }
       * @returns {Promise<object>} updated thread
       */
      async append(id, ...messages) {
        const thread = await this.load(id);
        if (!thread) return null;
        thread.messages.push(...messages);
        thread.updatedAt = Date.now();
        if (!thread.title && messages.length > 0) {
          const first = messages.find(m => m.role === 'user');
          if (first?.content) thread.title = String(first.content).slice(0, 50);
        }
        await drive.save(thread);
        return thread;
      },

      /**
       * Load a thread by id.
       * @param {string} id - thread id (with or without ctx- prefix)
       * @returns {Promise<object|null>} thread or null
       */
      async load(id) {
        const tid = toId(id);
        const item = await drive.load(tid);
        return item || null;
      },

      /**
       * List all threads, sorted by updatedAt desc.
       * @returns {Promise<object[]>} threads
       */
      async list() {
        const items = await drive.list();
        const threads = items.filter(i => i && i.id?.startsWith(PREFIX));
        return threads.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      },

      /**
       * Save a thread (persist to drive).
       * @param {object} thread
       * @returns {Promise<string>} id
       */
      async save(thread) {
        if (!thread.id) thread.id = toId('thread-' + Date.now());
        if (!thread.updatedAt) thread.updatedAt = Date.now();
        return drive.save(thread);
      },

      /**
       * Remove a thread.
       * @param {string} id
       * @returns {Promise<void>}
       */
      async remove(id) {
        await drive.remove(toId(id));
      },

      /**
       * Clear all threads in this drive.
       * @returns {Promise<void>}
       */
      async clear() {
        const threads = await this.list();
        for (const t of threads) await drive.remove(t.id);
      }
    };
  };

  window.coffee = coffee;
})();
