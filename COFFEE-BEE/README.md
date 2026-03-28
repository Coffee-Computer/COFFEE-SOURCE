# coffee.bee

Chat framework for AI apps with context. Built on coffee.ai + coffee.context. Orchestrates the send flow (user msg → ai.complete → append → save).

## Dependencies

- coffee.ai
- coffee.context (uses coffee.drive)

## Usage

```html
<script src="coffee-drive.js"></script>
<script src="coffee-ai.js"></script>
<script src="coffee-context.js"></script>
<script src="coffee-bee.js"></script>
```

```js
const bee = coffee.bee({
  driveName: 'my-chat',
  getApiKey: (provider) => coffee.load('ai-api-key-' + provider) || '',
  defaultSystem: 'You are a helpful assistant.',
  defaultProvider: 'github',
  defaultModel: 'gpt-4o'
});

// Create thread
const thread = await bee.createThread({ title: 'Chat 1' });

// Send message
const { thread: updated, response } = await bee.send(thread.id, 'Hello!');

// List / load / remove
const threads = await bee.listThreads();
const t = await bee.loadThread(thread.id);
await bee.removeThread(thread.id);
```

## Config

| Option | Default | Description |
|--------|---------|-------------|
| driveName | `'bee-chat'` | Drive for context storage |
| getApiKey | `() => ''` | `(provider) => apiKey` |
| defaultSystem | `'You are a helpful...'` | System prompt |
| defaultProvider | `'github'` | Provider |
| defaultModel | — | Model (uses provider default) |

## Send flow

1. Append user message to thread
2. Call `coffee.ai.complete` with full message history
3. Append assistant response
4. Save thread via context

## Bumblebee / Patty

Bumblebee and Patty are apps built with bee. Bee is the generic framework; they add branding and opinions.
