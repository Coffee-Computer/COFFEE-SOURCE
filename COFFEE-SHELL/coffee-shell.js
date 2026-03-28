/**
 * coffee.shell — reusable virtual terminal + VFS for Coffee demos (SHELL1-POC, CE apps).
 *
 * Persistence:
 * - **drive** (recommended for CE) — `coffee.drive('coffee-shell')`, IndexedDB, same pattern as Anti-Social / Friendz.
 * - **localStorage** — raw key (legacy default for sync boot).
 * - **control** — `coffee.save` / `coffee.load` (localStorage under `coffee_*` prefix); fine for small trees, same ~5MB cap.
 *
 * ASCII banner: COFFEE_VM/COFFEE_VM2.html — canonical string in COFFEE-BRAND/coffee-os-ascii.js
 */
(function () {
  if (typeof window === 'undefined') return;
  var coffee = window.coffee || {};

  var BANNER_COFFEE_OS =
    window.COFFEE_OS_ASCII_BANNER ||
    (' ██████╗  ██████╗ ███████╗███████╗███████╗███████╗     ██████╗ ███████╗\n' +
      '██╔════╝ ██╔═══██╗██╔════╝██╔════╝██╔════╝██╔════╝    ██╔═══██╗██╔════╝\n' +
      '██║      ██║   ██║█████╗  █████╗  █████╗  █████╗      ██║   ██║███████╗\n' +
      '██║      ██║   ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══╝      ██║   ██║╚════██║\n' +
      '╚██████╗ ╚██████╗██║     ██║     ███████╗███████╗    ╚██████╗███████║\n' +
      ' ╚═════╝  ╚═════╝╚═╝     ╚═╝     ╚══════╝╚══════╝     ╚═════╝╚══════╝');

  var DEFAULT_INITIAL_FS = {
    root: {
      type: 'dir',
      children: {
        projects: { type: 'dir', children: {} },
        'readme.txt': {
          type: 'file',
          content: 'Welcome to the Coffee.Friendz Network.\nThis is a persistent shell environment.'
        },
        'config.json': { type: 'file', content: '{"theme": "coffee-dark", "mode": "creator"}' }
      }
    }
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function isValidFsRoot(obj) {
    return obj && typeof obj === 'object' && obj.root && obj.root.type === 'dir';
  }

  function getDir(fs, pathArray) {
    var current = fs;
    for (var i = 0; i < pathArray.length; i++) {
      var segment = pathArray[i];
      current = current[segment];
      if (!current) return null;
      if (current.type === 'dir') current = current.children;
    }
    return current;
  }

  function getPathString(pathArray) {
    if (pathArray.length === 1) return '~';
    return '~/' + pathArray.slice(1).join('/');
  }

  /**
   * @param {object|null} persistApi - { save(fs), clear() } optional Promise returns
   */
  function buildShellSession(opts, fs, persistApi) {
    var outputEl = opts.outputEl;
    var inputEl = opts.inputEl;
    var pathDisplayEl = opts.pathDisplayEl || null;
    var scrollEl = opts.scrollEl || outputEl.parentElement || outputEl;
    var userHost = opts.userHost || 'guest@coffee';

    var currentPath = ['root'];
    var history = [];
    var historyIndex = -1;

    /** Same key as TERMINAL/COFFEE_TERMINAL/coffee-terminal.js — shared "don't ask again". */
    var JS_CONFIRM_STORAGE_KEY = 'terminal_js_confirm';
    var shellJsConfirmActive = false;
    var shellJsConfirmResolve = null;

    function saveFS() {
      if (!persistApi) return;
      try {
        var p = persistApi.save(fs);
        if (p && typeof p.then === 'function') p.catch(function () {});
      } catch (e) {}
    }

    function scrollToBottom() {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }

    function print(text, className) {
      var div = document.createElement('div');
      div.className = 'output-line' + (className ? ' ' + className : '');
      div.innerHTML = text;
      outputEl.appendChild(div);
      scrollToBottom();
    }

    function printPromptEcho(raw) {
      var pathStr = getPathString(currentPath);
      print(
        '<span class="prompt-user">' +
          escapeHtml(userHost) +
          '</span><span class="prompt-symbol">:</span><span class="prompt-dir">' +
          escapeHtml(pathStr) +
          '</span><span class="prompt-symbol">$</span> <span class="cmd-history">' +
          escapeHtml(raw) +
          '</span>'
      );
    }

    function escapeHtml(t) {
      var d = document.createElement('div');
      d.textContent = t;
      return d.innerHTML;
    }

    function safeStringify(value) {
      try {
        if (typeof value === 'string') return value;
        if (typeof value === 'undefined') return 'undefined';
        if (value === null) return 'null';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value);
      } catch (err) {
        return String(value);
      }
    }

    function awaitShellJsConfirm() {
      return new Promise(function (resolve) {
        try {
          if (localStorage.getItem(JS_CONFIRM_STORAGE_KEY) === 'dismissed') {
            resolve(true);
            return;
          }
          print(
            'About to execute JavaScript in page context. Reply with y to run, y! to run and don\'t show again, or n to cancel.',
            'warn-text'
          );
          print('Type your choice below and press Enter:', 'warn-text');
          shellJsConfirmActive = true;
          shellJsConfirmResolve = function (answer) {
            shellJsConfirmActive = false;
            shellJsConfirmResolve = null;
            var a = (answer || '').trim().toLowerCase();
            if (a === 'y' || a === 'yes') {
              resolve(true);
              return;
            }
            if (a === 'y!' || a === 'yes!') {
              try {
                localStorage.setItem(JS_CONFIRM_STORAGE_KEY, 'dismissed');
              } catch (e) {}
              resolve(true);
              return;
            }
            resolve(false);
          };
        } catch (err) {
          resolve(true);
        }
      });
    }

    function executeJsInPage(jsCode) {
      var captured = [];
      var nativeConsole = window.console;
      var proxyConsole = {};
      ['log', 'info', 'warn', 'error'].forEach(function (m) {
        proxyConsole[m] = function () {
          var cargs = Array.prototype.slice.call(arguments);
          try {
            captured.push({ type: m, text: cargs.map(safeStringify).join(' ') });
          } catch (e) {
            captured.push({ type: m, text: String(cargs) });
          }
          try {
            nativeConsole[m].apply(nativeConsole, cargs);
          } catch (e) {}
        };
      });

      function flushCaptured() {
        captured.forEach(function (entry) {
          if (entry.type === 'error') {
            print(escapeHtml(entry.text), 'error-text');
          } else if (entry.type === 'warn') {
            print(escapeHtml(entry.text), 'warn-text');
          } else if (entry.type === 'info') {
            print(escapeHtml(entry.text), 'info-text');
          } else if (entry.type === 'result') {
            print('<span class="muted-text">=&gt;</span> ' + escapeHtml(entry.text), 'file-text');
          } else {
            print(escapeHtml(entry.text), 'success-text');
          }
        });
      }

      return Promise.resolve()
        .then(function () {
          window.console = Object.assign({}, nativeConsole, proxyConsole);
          var exprRunner = new Function('return (async () => (' + jsCode + '))()');
          return exprRunner();
        })
        .then(function (result) {
          if (typeof result !== 'undefined') {
            captured.push({ type: 'result', text: safeStringify(result) });
          }
        })
        .catch(function () {
          var blockRunner = new Function('return (async () => { ' + jsCode + ' })()');
          return blockRunner().then(function (result) {
            if (typeof result !== 'undefined') {
              captured.push({ type: 'result', text: safeStringify(result) });
            }
          });
        })
        .catch(function (err) {
          captured.push({
            type: 'error',
            text: err && err.stack ? err.stack : String(err)
          });
        })
        .then(function () {
          try {
            window.console = nativeConsole;
          } catch (e) {}
          flushCaptured();
        });
    }

    function runJsCommand(args) {
      var jsCode = args.join(' ');
      if (!jsCode) {
        print('Usage: js &lt;javascript expression or statements&gt;', 'warn-text');
        return;
      }
      awaitShellJsConfirm()
        .then(function (allowed) {
          if (!allowed) {
            print('JS execution cancelled by user.', 'warn-text');
            return null;
          }
          return executeJsInPage(jsCode);
        })
        .catch(function (e) {
          print(escapeHtml(e && e.message ? e.message : String(e)), 'error-text');
        });
    }

    function updatePathDisplay() {
      if (pathDisplayEl) pathDisplayEl.textContent = getPathString(currentPath);
    }

    function clearOutput() {
      outputEl.innerHTML = '';
    }

    var ctx = {
      print: print,
      printPromptEcho: printPromptEcho,
      getPathString: function () {
        return getPathString(currentPath);
      },
      getCurrentPath: function () {
        return currentPath.slice();
      },
      setCurrentPath: function (arr) {
        currentPath = arr.slice();
        updatePathDisplay();
      },
      getFs: function () {
        return fs;
      },
      saveFS: saveFS,
      getDir: function () {
        return getDir(fs, currentPath);
      },
      clearOutput: clearOutput,
      scrollToBottom: scrollToBottom,
      userHost: userHost
    };

    function runReset() {
      if (!persistApi) {
        location.reload();
        return;
      }
      try {
        var c = persistApi.clear();
        if (c && typeof c.then === 'function') {
          c.then(
            function () {
              location.reload();
            },
            function () {
              location.reload();
            }
          );
        } else {
          location.reload();
        }
      } catch (e) {
        location.reload();
      }
    }

    function runBuiltin(cmd, args) {
      var dir;
      var items;
      var target;
      var file;
      var parent;

      switch (cmd) {
        case 'help':
          print(
            'Available commands:\n' +
              '  ls      - List directory contents\n' +
              '  cd      - Change directory\n' +
              '  mkdir   - Create directory\n' +
              '  touch   - Create empty file\n' +
              '  cat     - Read file content\n' +
              '  rm      - Remove file or directory\n' +
              '  echo    - Print text to terminal\n' +
              '  clear   - Clear terminal screen\n' +
              '  whoami  - Show current user\n' +
              '  banner  - Show Coffee OS ASCII banner\n' +
              '  js      - Run JavaScript in page context (confirm first; same as Coffee Terminal)\n' +
              '  reset   - Wipe VFS storage and reload'
          );
          return true;
        case 'ls':
          dir = ctx.getDir();
          if (!dir) {
            print('ls: invalid cwd', 'error-text');
            return true;
          }
          items = Object.keys(dir).map(function (n) {
            var isDir = dir[n].type === 'dir';
            return (
              '<span class="' + (isDir ? 'dir-text' : 'file-text') + '">' +
              escapeHtml(n) +
              (isDir ? '/' : '') +
              '</span>'
            );
          });
          print(items.join('    ') || '(empty)');
          return true;
        case 'cd':
          if (!args[0] || args[0] === '~') {
            currentPath = ['root'];
          } else if (args[0] === '..') {
            if (currentPath.length > 1) currentPath.pop();
          } else {
            dir = ctx.getDir();
            target = dir && dir[args[0]];
            if (target && target.type === 'dir') {
              currentPath.push(args[0]);
            } else {
              print('cd: no such directory: ' + escapeHtml(args[0]), 'error-text');
            }
          }
          updatePathDisplay();
          return true;
        case 'mkdir':
          if (!args[0]) {
            print('mkdir: missing operand', 'error-text');
            return true;
          }
          dir = ctx.getDir();
          if (dir[args[0]]) {
            print("mkdir: cannot create directory '" + escapeHtml(args[0]) + "': File exists", 'error-text');
            return true;
          }
          dir[args[0]] = { type: 'dir', children: {} };
          saveFS();
          return true;
        case 'touch':
          if (!args[0]) {
            print('touch: missing file operand', 'error-text');
            return true;
          }
          dir = ctx.getDir();
          dir[args[0]] = { type: 'file', content: '' };
          saveFS();
          return true;
        case 'cat':
          if (!args[0]) {
            print('cat: missing file operand', 'error-text');
            return true;
          }
          file = ctx.getDir()[args[0]];
          if (file && file.type === 'file') {
            print(escapeHtml(file.content || '(empty file)'));
          } else {
            print('cat: ' + escapeHtml(args[0]) + ': No such file', 'error-text');
          }
          return true;
        case 'rm':
          if (!args[0]) {
            print('rm: missing operand', 'error-text');
            return true;
          }
          parent = ctx.getDir();
          if (parent[args[0]]) {
            delete parent[args[0]];
            saveFS();
          } else {
            print("rm: cannot remove '" + escapeHtml(args[0]) + "': No such file or directory", 'error-text');
          }
          return true;
        case 'echo':
          print(escapeHtml(args.join(' ')));
          return true;
        case 'clear':
          clearOutput();
          return true;
        case 'whoami':
          print('coffee_guest_user');
          return true;
        case 'banner':
          print('<pre class="coffee-shell-banner-pre">' + escapeHtml(BANNER_COFFEE_OS) + '</pre>', 'coffee-shell-banner-wrap');
          return true;
        case 'reset':
          runReset();
          return true;
        default:
          return false;
      }
    }

    function handleCommand(raw) {
      var parts = raw.trim().split(/\s+/);
      var cmd = parts[0].toLowerCase();
      var args = parts.slice(1);
      printPromptEcho(raw);
      if (opts.customCommands && typeof opts.customCommands[cmd] === 'function') {
        opts.customCommands[cmd](ctx, args, raw);
        return;
      }
      if (cmd === 'js') {
        runJsCommand(args);
        return;
      }
      if (!runBuiltin(cmd, args)) {
        print('command not found: ' + escapeHtml(cmd), 'error-text');
      }
    }

    function onKeydown(e) {
      if (e.key === 'Enter') {
        var cmd = inputEl.value.trim();
        if (shellJsConfirmActive && typeof shellJsConfirmResolve === 'function') {
          try {
            shellJsConfirmResolve(cmd);
          } catch (err) {}
          inputEl.value = '';
          e.preventDefault();
          return;
        }
        if (cmd) {
          handleCommand(cmd);
          history.push(cmd);
          historyIndex = history.length;
        }
        inputEl.value = '';
      } else if (e.key === 'ArrowUp') {
        if (historyIndex > 0) {
          historyIndex--;
          inputEl.value = history[historyIndex];
        }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (historyIndex < history.length - 1) {
          historyIndex++;
          inputEl.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          inputEl.value = '';
        }
        e.preventDefault();
      }
    }

    function mount() {
      inputEl.addEventListener('keydown', onKeydown);
      updatePathDisplay();
    }

    function unmount() {
      inputEl.removeEventListener('keydown', onKeydown);
    }

    return {
      mount: mount,
      unmount: unmount,
      handleCommand: handleCommand,
      print: print,
      clearOutput: clearOutput,
      ctx: ctx,
      getBanner: function () {
        return BANNER_COFFEE_OS;
      }
    };
  }

  /**
   * @param {object} opts
   * @param {string} [opts.persistence='localStorage'] - 'localStorage' | 'control'
   * @param {string} [opts.storageKey='coffee_vfs'] - for localStorage raw key
   * @param {string} [opts.controlKey='shell_vfs'] - for coffee.save/load (stores whole fs tree)
   */
  function createSession(opts) {
    var persist = opts.persist !== false;
    var initialFS = opts.initialFS ? deepClone(opts.initialFS) : deepClone(DEFAULT_INITIAL_FS);
    var persistence = opts.persistence || 'localStorage';
    var fs;
    var persistApi;

    if (!persist) {
      fs = deepClone(initialFS);
      persistApi = null;
    } else if (persistence === 'drive') {
      throw new Error(
        'coffee.shell: persistence "drive" is async — use coffee.shell.createSessionAsync({ persistence: "drive", ... })'
      );
    } else if (persistence === 'control') {
      if (!coffee.save || !coffee.load) {
        throw new Error('coffee.shell: persistence "control" requires coffee-control (coffee.save / coffee.load)');
      }
      var controlKey = opts.controlKey || 'shell_vfs';
      var loaded = coffee.load(controlKey);
      fs = isValidFsRoot(loaded) ? deepClone(loaded) : deepClone(initialFS);
      persistApi = {
        save: function (tree) {
          coffee.save(controlKey, tree);
        },
        clear: function () {
          coffee.remove(controlKey);
        }
      };
    } else {
      var storageKey = opts.storageKey || 'coffee_vfs';
      try {
        var raw = localStorage.getItem(storageKey);
        fs = raw ? JSON.parse(raw) : deepClone(initialFS);
        if (!isValidFsRoot(fs)) fs = deepClone(initialFS);
      } catch (e) {
        fs = deepClone(initialFS);
      }
      persistApi = {
        save: function (tree) {
          localStorage.setItem(storageKey, JSON.stringify(tree));
        },
        clear: function () {
          localStorage.removeItem(storageKey);
        }
      };
    }

    return buildShellSession(opts, fs, persistApi);
  }

  /**
   * IndexedDB via coffee.drive — matches CE flagship storage pattern.
   * @param {object} opts
   * @param {string} [opts.driveId='coffee-shell']
   * @param {string} [opts.vfsRecordId='vfs'] - drive document id
   */
  function createSessionAsync(opts) {
    if (!coffee.drive) {
      return Promise.reject(new Error('coffee.shell.createSessionAsync requires coffee-drive (coffee.drive)'));
    }
    var persist = opts.persist !== false;
    var initialFS = opts.initialFS ? deepClone(opts.initialFS) : deepClone(DEFAULT_INITIAL_FS);
    var driveId = opts.driveId || 'coffee-shell';
    var vfsId = opts.vfsRecordId || 'vfs';

    if (!persist) {
      return Promise.resolve(buildShellSession(opts, deepClone(initialFS), null));
    }

    var drive = coffee.drive(driveId);
    if (!drive) {
      return Promise.reject(new Error('coffee.drive("' + driveId + '") returned null'));
    }

    return drive.load(vfsId).then(function (row) {
      var fs =
        row && row.fs && isValidFsRoot(row.fs) ? deepClone(row.fs) : deepClone(initialFS);
      var persistApi = {
        save: function (tree) {
          return drive.save({ id: vfsId, fs: tree });
        },
        clear: function () {
          return drive.remove(vfsId);
        }
      };
      return buildShellSession(opts, fs, persistApi);
    });
  }

  coffee.shell = {
    BANNER_COFFEE_OS: BANNER_COFFEE_OS,
    DEFAULT_INITIAL_FS: DEFAULT_INITIAL_FS,
    createSession: createSession,
    createSessionAsync: createSessionAsync,
    getDir: getDir,
    getPathString: getPathString
  };

  window.coffee = coffee;
})();
