/**
 * coffee.terminalSlash — slash-menu entries for Coffee.Terminal (coffee.slash compatible).
 *
 * Shape: { id, label, insert, cat? } — `id` is used for palette filter + execute routing;
 * `insert` is what coffee.slash replaces `/` with (see COFFEE-SLASH).
 *
 * Load after coffee-slash.js:
 *   coffee.slash.attach(adapter, { commands: coffee.terminalSlash.commands, ... });
 */
(function () {
  if (typeof window === 'undefined') return;
  var coffee = window.coffee || (window.coffee = {});

  /** @type {{ id: string, label: string, insert: string, cat?: string }[]} */
  var commands = [
    { id: 'ls', label: 'List directory', insert: 'ls', cat: 'Files' },
    { id: 'cd', label: 'Change bean-path', insert: 'cd ', cat: 'Navigation' },
    { id: 'pwd', label: 'Print working directory', insert: 'pwd', cat: 'Navigation' },
    { id: 'cat', label: 'Read file content', insert: 'cat ', cat: 'Files' },
    { id: 'server', label: 'Status of brew-server', insert: 'server', cat: 'Control' },
    { id: 'deploy', label: 'Push to mainnet', insert: 'deploy', cat: 'Action' },
    { id: 'clear', label: 'Flush interface', insert: 'clear', cat: 'System' },
    { id: 'status', label: 'System health check', insert: 'status', cat: 'System' },
    { id: 'logs', label: 'View stream logs', insert: 'logs', cat: 'System' }
  ];

  coffee.terminalSlash = {
    commands: commands
  };
})();
