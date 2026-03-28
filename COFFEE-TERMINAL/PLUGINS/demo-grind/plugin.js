/**
 * Terminal plugin script — loaded via terminal-extensions.json → plugins[].script
 * Registers handlers referenced by plugin.json (handler string ids).
 */
(function () {
  if (typeof window === 'undefined' || !window.coffee || !window.coffee.terminalExtensions) return;

  window.coffee.terminalExtensions.registerHandler('ext:grind', function (ctx, line, log) {
    log(
      'grind: handler from <code>PLUGINS/demo-grind/plugin.js</code> (replace with real work).',
      'success'
    );
  });
})();
