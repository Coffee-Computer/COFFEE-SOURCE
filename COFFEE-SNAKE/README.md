# coffee.snake

Python execution engine in the browser via Pyodide (WASM). Standalone. Uses Control for script persistence.

## Dependencies

- **Pyodide** — Load via script tag before coffee-snake.js:
  ```html
  <script src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"></script>
  ```
- **Control** (optional) — For `saveScript` / `loadScript` / `loadLastCode`. Load coffee-control.js first.

## API

```js
const s = coffee.snake({
  onOutput: (text) => console.log(text),
  onError: (text) => console.error(text),
  onStatus: (status) => {},  // 'loading' | 'ready' | 'running' | 'idle' | 'error'
  onReady: (version) => {}   // e.g. '3.11.0'
});

await s.init();
await s.execute('print("hello")');

// Persistence (uses coffee.save/load when Control is loaded)
s.saveScript('my-script', code);
s.loadScript('my-script');
s.listScripts();
s.saveLastCode(code);   // auto-saved on execute
s.loadLastCode();

// Examples
s.loadExample('hello');  // Python basics
s.loadExample('math');   // Fibonacci
s.loadExample('data');   // Dictionaries
s.loadExample('brew');   // Brew demo
```

## Demo

`SNAKE-DEMO.html` — Coffee UI + Control + snake. Run, save, load scripts.

## Use Cases

See `USE-CASES.md` for specific use cases: data pipelines, learning playground, calculators, AI-assisted code, visualization prep, automation, and que integration.
