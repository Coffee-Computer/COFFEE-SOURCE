# coffee.ai

Base AI module. Provider-agnostic chat completions. Depends on coffee.request.

## Usage

```html
<script src="coffee-request.js"></script>
<script src="coffee-ai.js"></script>
```

```js
const response = await coffee.ai.complete({
  provider: 'github',
  apiKey: 'ghp_xxx',
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
  system: 'You are a helpful assistant.',
  temperature: 0.7,
  maxTokens: 1500
});

const text = response.choices[0].message.content;
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| provider | `'github'` | `'github'`, `'openai'`, `'gemini'`, `'ollama'` |
| apiKey | `''` | Bearer token (BYOK) |
| model | provider default | Model ID |
| messages | `[]` | `[{ role, content }]` |
| system | — | System message (prepended) |
| temperature | 0.7 | 0–1 |
| maxTokens | 1500 | Max output tokens |
| timeout | 60000 | ms |

## Providers

- **github** — `models.inference.ai.azure.com` (GitHub Models API)
- **openai** — `api.openai.com/v1`
- **gemini** — `generativelanguage.googleapis.com` (Google AI Studio)
- **ollama** — `localhost:11434` (no auth)

## Returns

Full API response (JSON). `response.choices[0].message.content` for text.

---

## coffee.aiConfig (BYOK + optional UI)

**File:** `coffee-ai-config.js` (load after `coffee-ai.js`; no extra deps).

Shared storage for demo keys — **same logical ids as KATI / BEE-DEMO / AI-DEMO:**

| Provider | `coffee.aiConfig.storageId(id)` |
|----------|----------------------------------|
| GitHub Models | `ai-api-key-github` |
| OpenAI | `ai-api-key-openai` |
| Gemini | `ai-api-key-gemini` |

Uses `coffee.save` / `coffee.load` when **coffee-control** is present; otherwise `localStorage` key `coffee_<id>` with JSON-encoded string (same shape).

```html
<script src="coffee-ai.js"></script>
<script src="coffee-ai-config.js"></script>
```

```js
coffee.aiConfig.get('gemini');
coffee.aiConfig.set('openai', sk);
coffee.aiConfig.mount(document.getElementById('host'), {
  cardClass: 'settings-card',
  labelClass: 'settings-label',
  inputClass: 'settings-input',
  hintClass: 'settings-hint'
});
coffee.aiConfig.saveForm(document.getElementById('host'));
```

**SURF** (`FLAGSHIP/SURF/SURF-ALPHA.html`) mounts this block in Settings. Legacy `surf.katiApiKey` is still read for Gemini until the user saves once (then canonical storage wins).

### Provider + model (SURF / Bee-style)

- **`coffee.aiConfig.getProvider()`** / **`setProvider('gemini'|'openai'|'github'|'ollama')`** — stored as `ai-pref-provider`.
- **`coffee.aiConfig.getModel(provider)`** / **`setModel(provider, modelId)`** — per provider, `ai-pref-model-<provider>`.
- Pass **`includeProviderModel: true`** to **`mount(...)`** to append the two `<select>`s (same card styling as key fields via `opts`). **`saveForm`** / **`writeForm`** include provider + model when those selects exist.

Server stats for dashboards: **`COFFEE-SERVER/lib/browser/coffee-server-stats.js`** → **`coffee.serverStats.snapshot({ customBase })`** (used by SERVER-DEMO and SURF Relay).
