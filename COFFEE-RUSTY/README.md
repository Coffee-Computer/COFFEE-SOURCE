# coffee.rusty

Rust execution via the Rust Playground API. Sends code to play.rust-lang.org, returns stdout/stderr. Uses Control for script persistence.

**Note:** Requires network. Unlike coffee.snake (Python/WASM), Rust runs remotely.

## Dependencies

- **Control** (optional) — For `saveScript` / `loadScript` / `loadLastCode`. Load coffee-control.js first.

## API

```js
const r = coffee.rusty({
  onOutput: (text) => console.log(text),
  onError: (text) => console.error(text),
  onStatus: (status) => {}  // 'compiling' | 'success' | 'failed' | 'error'
});

await r.execute('fn main() { println!("hello"); }');

// Persistence (uses coffee.save/load when Control is loaded)
r.saveScript('my-script', code);
r.loadScript('my-script');
r.listScripts();
r.saveLastCode(code);   // auto-saved on execute
r.loadLastCode();

// Examples
r.loadExample('hello');   // Hello, World
r.loadExample('structs'); // Structs & impls
r.loadExample('generics');// Generics
r.loadExample('brew');   // Brew demo
```

## Demo

`RUSTY-DEMO.html` — Coffee UI + Control + rusty. Compile, run, save, load scripts.

## Use Cases

See `USE-CASES.md` for specific use cases: learning Rust, algorithms, AI-assisted code, and more.
