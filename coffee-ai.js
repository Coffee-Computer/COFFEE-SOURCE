/**
 * coffee.ai — Base AI module. Provider-agnostic chat completions.
 * Depends on coffee.request.
 *
 * coffee.ai.complete({ provider, apiKey, model, messages, temperature, maxTokens, system })
 *
 * Returns full API response (JSON). Use response.choices[0].message.content for text.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};
  if (!coffee.request) {
    coffee.ai = {
      complete: async function () {
        throw new Error('coffee.ai requires coffee.request. Load coffee-request.js first.');
      }
    };
    window.coffee = coffee;
    return;
  }

  coffee.ai = coffee.ai || {};

  coffee.ai.providers = {
    github: {
      baseUrl: 'https://models.inference.ai.azure.com',
      path: '/chat/completions',
      models: ['gpt-4o', 'meta-llama-3.1-405b-instruct', 'meta-llama-3.1-70b-instruct', 'phi-3-medium-128k-instruct']
    },
    openai: {
      baseUrl: 'https://api.openai.com/v1',
      path: '/chat/completions',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo']
    },
    gemini: {
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      path: '/chat/completions',
      models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-3-flash-preview']
    },
    ollama: {
      baseUrl: 'http://localhost:11434/v1',
      path: '/chat/completions',
      models: ['llama3.2', 'mistral', 'codellama']
    }
  };

  coffee.ai.complete = async function (opts = {}) {
    const {
      provider = 'github',
      apiKey = '',
      model,
      messages = [],
      system,
      temperature = 0.7,
      maxTokens = 1500,
      timeout = 60000
    } = opts;

    const p = coffee.ai.providers[provider];
    if (!p) throw new Error('coffee.ai: unknown provider "' + provider + '"');

    const url = p.baseUrl.replace(/\/$/, '') + p.path;
    const msgs = system ? [{ role: 'system', content: system }, ...messages] : messages;
    if (msgs.length === 0) throw new Error('coffee.ai: messages required');

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey && provider !== 'ollama') headers['Authorization'] = 'Bearer ' + apiKey;

    const body = {
      model: model || (p.models && p.models[0]) || 'gpt-4o',
      messages: msgs,
      temperature,
      max_tokens: maxTokens
    };

    return coffee.request(url, {
      method: 'POST',
      headers,
      body,
      timeout,
      json: true
    });
  };

  window.coffee = coffee;
})();
