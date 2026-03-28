/**
 * coffee.rusty — Rust execution via Rust Playground API.
 * Sends code to play.rust-lang.org, returns stdout/stderr.
 * Uses Control (coffee.save/load) for script persistence.
 *
 * coffee.rusty(opts) — opts: { onOutput, onError, onStatus }
 * Returns: { execute, loadExample, saveScript, loadScript, listScripts, saveLastCode, loadLastCode, clearOutput, examples }
 *
 * const r = coffee.rusty({ onOutput: (t) => console.log(t), onError: (t) => ... });
 * await r.execute('fn main() { println!("hi"); }');
 * r.saveScript('my-script', code);  // uses coffee.save if available
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const PREFIX = 'rusty_';
  const KEY_LAST = PREFIX + 'last_code';
  const KEY_SCRIPTS = PREFIX + 'scripts';
  const PLAYGROUND_URL = 'https://play.rust-lang.org/execute';

  const EXAMPLES = {
    hello: `fn main() {
    let name = "Coffee Enthusiast";
    println!("Hello, {}!", name);
    println!("The current sum is: {}", 5 + 10);
}`,
    structs: `struct Coffee {
    roast: String,
    ounces: u8,
}

impl Coffee {
    fn brew(&self) {
        println!("Brewing a {}oz {} roast.", self.ounces, self.roast);
    }
}

fn main() {
    let my_cup = Coffee {
        roast: String::from("Dark"),
        ounces: 12,
    };
    my_cup.brew();
}`,
    generics: `fn print_bean<T: std::fmt::Display>(bean: T) {
    println!("Processing bean: {}", bean);
}

fn main() {
    print_bean("Arabica");
    print_bean(42);
}`,
    brew: `fn main() {
    println!("♨️ Brewing some Rust code...");
    
    let items = vec!["Memory Safety", "Zero-cost Abstractions", "Fearless Concurrency"];
    
    for (i, item) in items.iter().enumerate() {
        println!("[{}/3] Roasting {}...", i + 1, item);
    }
    
    println!("\\n✅ Your Rust Espresso is ready!");
}`
  };

  coffee.rusty = function (opts = {}) {
    const { onOutput = () => {}, onError = () => {}, onStatus = () => {} } = opts;
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
      async execute(code) {
        if (!code || !String(code).trim()) {
          emitOutput('No code to run.', true);
          return;
        }
        setStatus('compiling');
        outputBuffer = [];
        try {
          const response = await fetch(PLAYGROUND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: 'stable',
              mode: 'debug',
              edition: '2021',
              crateType: 'bin',
              tests: false,
              code: code
            })
          });
          const result = await response.json();

          if (result.success) {
            if (result.stdout) emitOutput(result.stdout);
            if (result.stderr) emitOutput('--- Compiler ---\n' + result.stderr, false);
            setStatus('success');
            if (hasControl()) coffee.save(KEY_LAST, code);
          } else {
            emitOutput('❌ Compilation failed', true);
            if (result.stderr) emitOutput(result.stderr, true);
            setStatus('failed');
          }
        } catch (err) {
          emitOutput('❌ Network error: ' + err.message, true);
          setStatus('error');
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

      examples: EXAMPLES,
      version: '1.0'
    };
  };

  window.coffee = coffee;
})();
