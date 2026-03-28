/**
 * coffee.snake — Python execution engine in the browser (Pyodide WASM).
 * Standalone. Uses Control (coffee.save/load) for script persistence.
 *
 * Load Pyodide via script tag before this module:
 *   <script src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"></script>
 *
 * coffee.snake(opts) — opts: { onOutput, onError, onStatus, onReady }
 * Returns: { init, execute, loadExample, saveScript, loadScript, listScripts, saveLastCode, loadLastCode, clearOutput, examples, version }
 *
 * const s = coffee.snake({ onOutput: (t) => console.log(t), onStatus: (st) => ... });
 * await s.init();
 * await s.execute('print("hello")');
 * s.saveScript('my-script', code);  // uses coffee.save if available
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const PREFIX = 'snake_';
  const KEY_LAST = PREFIX + 'last_code';
  const KEY_SCRIPTS = PREFIX + 'scripts';

  const EXAMPLES = {
    hello: `# Formatting Example
name = "World"
count = 5

for i in range(count):
    print(f"Hello {name}, index: {i}")`,
    math: `# Fibonacci Sequence
def fibonacci(n):
    a, b = 0, 1
    result = []
    while a < n:
        result.append(a)
        a, b = b, a + b
    return result

print("Calculating Fibonacci up to 1000:")
print(fibonacci(1000))`,
    data: `# Dictionary Work
coffee_data = {
    "name": "Espresso",
    "bitterness": 8,
    "caffeine_level": "High"
}

print("Current Menu Item:")
for key, value in coffee_data.items():
    print(f" {key.capitalize()}: {value}")`,
    brew: `# coffee.snake()
# A pure Python environment in your browser.

def brew_python():
    print("♨️ Heating the engine...")
    beans = ["Logic", "Loops", "Functions", "Syntax"]
    
    for i, bean in enumerate(beans):
        print(f"[{i+1}/4] Grinding {bean}...")
    
    return "✅ Your Python Espresso is ready!"

output = brew_python()
print("\\n" + output)`
  };

  coffee.snake = function (opts = {}) {
    const { onOutput = () => {}, onError = () => {}, onStatus = () => {}, onReady = () => {} } = opts;
    let pyodide = null;
    let outputBuffer = [];

    function emitOutput(text, isError = false) {
      outputBuffer.push({ text, isError });
      if (isError) onError(text);
      else onOutput(text);
    }

    function setStatus(status) {
      onStatus(status);
    }

    function hasControl() {
      return typeof coffee.save === 'function' && typeof coffee.load === 'function';
    }

    return {
      async init() {
        if (typeof loadPyodide !== 'function') {
          emitOutput('Pyodide not loaded. Add: <script src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"></script>', true);
          setStatus('error');
          return;
        }
        setStatus('loading');
        try {
          pyodide = await loadPyodide();
          const version = await pyodide.runPythonAsync(`import sys; sys.version`);
          setStatus('ready');
          onReady(version.split(' ')[0]);
        } catch (e) {
          console.error('coffee.snake init error:', e);
          emitOutput('Failed to load Python runtime: ' + e.message, true);
          setStatus('error');
        }
      },

      async execute(code) {
        if (!pyodide) {
          emitOutput('Python runtime not ready. Call init() first.', true);
          return;
        }
        setStatus('running');
        outputBuffer = [];
        pyodide.setStdout({ batched: (str) => emitOutput(str) });
        pyodide.setStderr({ batched: (str) => emitOutput(str, true) });
        try {
          await pyodide.runPythonAsync(code || '');
          if (hasControl()) coffee.save(KEY_LAST, code);
        } catch (err) {
          emitOutput('❌ ' + err.message, true);
        } finally {
          setStatus('idle');
        }
      },

      loadExample(key) {
        return EXAMPLES[key] || EXAMPLES.brew;
      },

      saveScript(name, code) {
        if (!hasControl()) return;
        const scripts = coffee.load(KEY_SCRIPTS) || {};
        scripts[name] = code;
        coffee.save(KEY_SCRIPTS, scripts);
      },

      loadScript(name) {
        if (!hasControl()) return '';
        const scripts = coffee.load(KEY_SCRIPTS) || {};
        return scripts[name] || '';
      },

      listScripts() {
        if (!hasControl()) return [];
        const scripts = coffee.load(KEY_SCRIPTS) || {};
        return Object.keys(scripts).sort();
      },

      saveLastCode(code) {
        if (hasControl()) coffee.save(KEY_LAST, code);
      },

      loadLastCode() {
        if (!hasControl()) return '';
        return coffee.load(KEY_LAST) || '';
      },

      clearOutput() {
        outputBuffer = [];
      },

      get outputBuffer() {
        return [...outputBuffer];
      },

      get isReady() {
        return !!pyodide;
      },

      examples: EXAMPLES,
      version: '1.0'
    };
  };

  window.coffee = coffee;
})();
