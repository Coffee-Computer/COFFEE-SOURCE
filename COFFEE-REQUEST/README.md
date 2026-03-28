# coffee.request()

Thin fetch wrapper for HTTP APIs. JSON by default. Throws on 4xx/5xx.

## Usage

```html
<script src="coffee-request.js"></script>
```

```js
// GET (returns parsed JSON)
const data = await coffee.request('https://api.example.com/users');

// POST
await coffee.request('https://api.example.com/notes', {
  method: 'POST',
  body: { title: 'Hi', content: '...' }
});

// With baseUrl
coffee.request.baseUrl = 'https://api.example.com';
const posts = await coffee.request('/posts');

// Auth
coffee.request.defaultHeaders = { 'Authorization': 'Bearer ' + token };

// Timeout (ms)
const data = await coffee.request('/slow', { timeout: 5000 });

// Raw text (no JSON parse)
const html = await coffee.request('/page', { json: false });

// Error handling (throws on 4xx/5xx)
try {
  await coffee.request('/api/delete/123', { method: 'DELETE' });
  coffee.toast('Deleted', 'success');
} catch (e) {
  console.error(e.status, e.body);
  coffee.toast(e.message, 'error');
}
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| method | `'GET'` | HTTP method |
| headers | `{}` | Request headers |
| body | — | Request body (object → JSON, or FormData) |
| timeout | 0 | Abort after ms (0 = no timeout) |
| json | true | Parse response as JSON; stringify body |

## Config

| Property | Description |
|----------|-------------|
| `coffee.request.baseUrl` | Prefix for relative URLs |
| `coffee.request.defaultHeaders` | Headers sent with every request |

No dependencies. Extends `window.coffee`.
