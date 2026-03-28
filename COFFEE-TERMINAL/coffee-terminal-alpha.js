/**
 * Coffee.Terminal α — UI + line dispatch: JSON step, cash-cli, COFFEE-POSIX → CASH, extensions, builtins.
 * Load after coffee-terminal-runtime.mjs (use defer so module finishes first).
 */
(function () {
  var outputStream;
  var mainInput;
  var palette;
  var clockDisplay;
  var uptimeDisplay;
  var promptCwdEl;
  var startTime = Date.now();
  var selectedIdx = 0;

  function escHtml(t) {
    var d = document.createElement('div');
    d.textContent = t == null ? '' : String(t);
    return d.innerHTML;
  }

  function getCommands() {
    return (typeof coffee !== 'undefined' && coffee.terminalSlash && coffee.terminalSlash.commands) || [];
  }

  function log(msg, type) {
    type = type || 'sys';
    var entry = document.createElement('div');
    entry.className = 'ct-log';
    entry.innerHTML =
      '<span class="ct-tag-' + type + '">[' + String(type).toUpperCase() + ']</span> ' + msg;
    outputStream.appendChild(entry);
    outputStream.scrollTop = outputStream.scrollHeight;
  }

  function refreshPromptCwd() {
    var rt = window.__coffeeTerminal;
    if (promptCwdEl && rt && rt.pathSession) {
      promptCwdEl.textContent = rt.pathSession.pwdDisplay();
    }
  }

  function findCommand(firstToken) {
    var list = getCommands();
    var t = (firstToken || '').toLowerCase();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === t) return list[i];
    }
    return null;
  }

  function filterPalette(query) {
    var needle = query.replace(/^\//, '');
    var filtered = getCommands().filter(function (c) {
      return c.id.indexOf(needle) === 0;
    });
    if (filtered.length > 0 && query.indexOf('/') === 0) {
      palette.style.display = 'block';
      palette.innerHTML = filtered
        .map(function (c, i) {
          var active = i === selectedIdx ? ' ct-active' : '';
          return (
            '<div class="ct-palette-item' +
            active +
            '" data-cmd="' +
            c.id.replace(/"/g, '&quot;') +
            '">' +
            '<span>' +
            escHtml(c.id) +
            '</span>' +
            '<span class="ct-palette-hint">' +
            escHtml(c.label || '') +
            '</span></div>'
          );
        })
        .join('');
      Array.prototype.forEach.call(palette.querySelectorAll('.ct-palette-item'), function (el) {
        el.onclick = function () {
          execute(el.getAttribute('data-cmd') || '');
        };
      });
    } else {
      palette.style.display = 'none';
      selectedIdx = 0;
    }
    return filtered;
  }

  function runBuiltinSwitch(firstLower, rawOriginal) {
    switch (firstLower) {
      case 'ls':
        log('README.md  src/  package.json <span class="ct-palette-hint">(no CASH — stub)</span>', 'sys');
        break;
      case 'pwd':
        log('<span style="color:#78716c">/</span> (stub — load runtime module for POSIX)', 'info');
        break;
      case 'cd':
      case 'cat':
        log(firstLower + ': stub — load runtime module', 'info');
        break;
      case 'server':
        log('Brew-Server status: <span class="ct-tag-success">OPTIMAL</span>', 'sys');
        log('Temperature: 92°C | Pressure: 9.2 Bar', 'sys');
        break;
      case 'deploy':
        log('Initiating deployment to bean-chain...', 'info');
        setTimeout(function () {
          log('Syncing blocks... 45%', 'sys');
        }, 500);
        setTimeout(function () {
          log('Deployment SUCCESS: Hash 0xBE4...420', 'success');
        }, 1200);
        break;
      case 'clear':
        outputStream.innerHTML = '';
        break;
      case 'status':
        log('All systems roasted to perfection.', 'success');
        break;
      case 'logs':
        log('[stream] bean-pump · idle · no drops', 'sys');
        break;
      case 'help':
        log(
          '<span class="ct-tag-info">help</span> POSIX: <code>ls cd pwd cat</code> · CASH CLI: <code>cash</code> <code>flow</code> <code>io</code> · JSON line · <code>/</code> palette',
          'info'
        );
        break;
      default:
        log("Command '" + escHtml(firstLower) + "' not recognized.", 'error');
    }
  }

  function printCashResult(r) {
    var ok = r && r.ok;
    var body =
      '<pre style="margin:0;white-space:pre-wrap;font-size:0.8rem;color:inherit">' +
      escHtml(JSON.stringify(r, null, 2)) +
      '</pre>';
    log(body, ok ? 'success' : 'error');
  }

  function execute(line) {
    var rawOriginal = String(line || '').trim();
    palette.style.display = 'none';
    mainInput.value = '';
    if (!rawOriginal) return;

    log('<span style="opacity:0.75">&gt;</span> ' + escHtml(rawOriginal), 'info');

    var rt = window.__coffeeTerminal;
    var firstLower = (rawOriginal.split(/\s+/)[0] || '').toLowerCase();

    if (rt && rawOriginal.charAt(0) === '{') {
      (async function () {
        try {
          var step = JSON.parse(rawOriginal);
          var r = await rt.cashExecute(step, rt.cashCtx);
          printCashResult(r);
        } catch (err) {
          log(escHtml(err && err.message ? err.message : String(err)), 'error');
        }
        refreshPromptCwd();
      })();
      return;
    }

    if (rt && typeof rt.isCashCliLine === 'function' && rt.isCashCliLine(rawOriginal)) {
      (async function () {
        try {
          var pr = rt.parseCashCliLine(rawOriginal);
          if (pr && pr.showCliHelp) {
            var ht = rt.cliHelpText || '';
            log(
              '<span class="ct-tag-info">cash-cli</span><pre style="margin:0.35rem 0 0 0;white-space:pre-wrap;font-size:0.75rem">' +
                escHtml(ht) +
                '</pre>',
              'info'
            );
            refreshPromptCwd();
            return;
          }
          if (!pr || !pr.ok) {
            log(escHtml((pr && pr.error) || 'parse error'), 'error');
            if (pr && pr.hint) log(escHtml(pr.hint), 'info');
            refreshPromptCwd();
            return;
          }
          var r = await rt.cashExecute(pr.step, rt.cashCtx);
          printCashResult(r);
        } catch (err) {
          log(escHtml(err && err.message ? err.message : String(err)), 'error');
        }
        refreshPromptCwd();
      })();
      return;
    }

    if (rt && rt.pathSession && typeof rt.pathSession.applyLine === 'function') {
      var intent = rt.pathSession.applyLine(rawOriginal);
      if (intent && intent.ok) {
        if (intent.op === 'pwd') {
          log(escHtml(rt.pathSession.pwdDisplay()), 'info');
          refreshPromptCwd();
          return;
        }
        if (intent.op === 'cd') {
          log('cwd ' + escHtml(rt.pathSession.pwdDisplay()), 'success');
          refreshPromptCwd();
          return;
        }
        var step = rt.intentToCashStep(intent);
        if (step) {
          (async function () {
            try {
              var r = await rt.cashExecute(step, rt.cashCtx);
              printCashResult(r);
            } catch (err) {
              log(escHtml(err && err.message ? err.message : String(err)), 'error');
            }
            refreshPromptCwd();
          })();
          return;
        }
        log('No IO step for intent: ' + escHtml(JSON.stringify(intent)), 'info');
        refreshPromptCwd();
        return;
      }

      if (intent && !intent.ok) {
        var err = intent.error || '';
        if (err.indexOf('unknown command') === -1) {
          log(escHtml(err), 'error');
          refreshPromptCwd();
          return;
        }
        var meta = findCommand(firstLower);
        if (
          meta &&
          meta.handler &&
          coffee.terminalExtensions &&
          coffee.terminalExtensions.handlers[meta.handler]
        ) {
          var ctx = { mainInput: mainInput, outputStream: outputStream };
          coffee.terminalExtensions.handlers[meta.handler](ctx, rawOriginal, log);
          refreshPromptCwd();
          return;
        }
        runBuiltinSwitch(firstLower, rawOriginal);
        refreshPromptCwd();
        return;
      }
    }

    var meta2 = findCommand(firstLower);
    if (
      meta2 &&
      meta2.handler &&
      coffee.terminalExtensions &&
      coffee.terminalExtensions.handlers[meta2.handler]
    ) {
      var ctx2 = { mainInput: mainInput, outputStream: outputStream };
      coffee.terminalExtensions.handlers[meta2.handler](ctx2, rawOriginal, log);
      refreshPromptCwd();
      return;
    }

    runBuiltinSwitch(firstLower, rawOriginal);
    refreshPromptCwd();
  }

  function tickClock() {
    var now = new Date();
    clockDisplay.textContent = now.toLocaleTimeString();
    var diff = Math.floor((Date.now() - startTime) / 1000);
    var h = Math.floor(diff / 3600)
      .toString()
      .padStart(2, '0');
    var m = Math.floor((diff % 3600) / 60)
      .toString()
      .padStart(2, '0');
    var s = (diff % 60).toString().padStart(2, '0');
    uptimeDisplay.textContent = 'UPTIME: ' + h + ':' + m + ':' + s;
  }

  function initUI() {
    outputStream = document.getElementById('output-stream');
    mainInput = document.getElementById('main-input');
    palette = document.getElementById('palette');
    clockDisplay = document.getElementById('clock');
    uptimeDisplay = document.getElementById('uptime-display');
    promptCwdEl = document.getElementById('prompt-cwd');

    setInterval(tickClock, 1000);
    tickClock();
    refreshPromptCwd();

    mainInput.addEventListener('input', function (e) {
      selectedIdx = 0;
      filterPalette(e.target.value);
    });

    mainInput.addEventListener('keydown', function (e) {
      var needle = mainInput.value.replace(/^\//, '');
      var filtered = getCommands().filter(function (c) {
        return c.id.indexOf(needle) === 0;
      });

      if (palette.style.display === 'block') {
        if (e.key === 'ArrowDown') {
          selectedIdx = (selectedIdx + 1) % filtered.length;
          filterPalette(mainInput.value);
          e.preventDefault();
        } else if (e.key === 'ArrowUp') {
          selectedIdx = (selectedIdx - 1 + filtered.length) % filtered.length;
          filterPalette(mainInput.value);
          e.preventDefault();
        } else if (e.key === 'Enter' && filtered[selectedIdx]) {
          execute(filtered[selectedIdx].id);
          e.preventDefault();
        }
      } else if (e.key === 'Enter') {
        var v = mainInput.value;
        var line = v.replace(/^\//, '').trim() || v.trim();
        execute(line);
      }
    });

    document.addEventListener('click', function () {
      mainInput.focus();
    });
  }

  function boot() {
    initUI();
    var extUrl = 'terminal-extensions.json';
    if (coffee.terminalExtensions && coffee.terminalExtensions.fetchAndApply) {
      coffee.terminalExtensions
        .fetchAndApply(extUrl)
        .then(function () {
          log('Extensions + plugins merged (<code>' + escHtml(extUrl) + '</code>).', 'sys');
        })
        .catch(function (err) {
          log(
            'Extensions: using base commands only (serve over HTTP). ' +
              escHtml(err && err.message ? err.message : String(err)),
            'info'
          );
        });
    }

    log(
      'Coffee.Terminal α — <span style="color:#eab308">/</span> palette · <code>help</code> · POSIX + CASH via runtime module.',
      'sys'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
