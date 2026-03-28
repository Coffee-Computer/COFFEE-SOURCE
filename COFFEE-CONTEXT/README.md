# coffee.context

AI conversation context storage. Built on coffee.drive. Stores threads (messages, provider, model, system). Message format matches coffee.ai (OpenAI-style).

## Dependencies

- coffee.drive

## Usage

```html
<script src="coffee-drive.js"></script>
<script src="coffee-context.js"></script>
```

```js
const ctx = coffee.context('my-app');

// Create thread
const thread = await ctx.create({ provider: 'github', model: 'gpt-4o', system: 'You are helpful.' });

// Append messages
await ctx.append(thread.id, { role: 'user', content: 'Hello' });
await ctx.append(thread.id, { role: 'assistant', content: 'Hi there!' });

// Load
const t = await ctx.load(thread.id);

// List all
const threads = await ctx.list();

// Save (after manual edits)
await ctx.save(thread);

// Remove
await ctx.remove(thread.id);
```

## Thread schema

```js
{
  id: 'ctx-thread-123',
  provider: 'github',
  model: 'gpt-4o',
  system: 'You are helpful.',
  title: 'First message...',
  messages: [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }],
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

## With coffee.ai

```js
const ctx = coffee.context('patty');
const thread = await ctx.load(id) || await ctx.create({ provider, model, system });

await ctx.append(thread.id, { role: 'user', content: userInput });
const response = await coffee.ai.complete({ provider, apiKey, model, messages: [...thread.messages, { role: 'user', content: userInput }], system });
await ctx.append(thread.id, { role: 'assistant', content: response.choices[0].message.content });
```
