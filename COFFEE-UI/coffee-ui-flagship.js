/**
 * coffee.flagship — DOM helpers + tokens for coffee-ui-flagship.css (chat flagship chrome).
 * Depends: coffee-ui.js (loads first). Does not replace coffee.button/card; compose with them for modals etc.
 *
 * coffee.flagship.applyTokens({ accent, bg, sidebar, panel })  // optional :root overrides
 * coffee.flagship.promptCard({ title, blurb, onClick })
 * coffee.flagship.messageRow({ role: 'user'|'assistant', avatarChar, text, html })
 * coffee.flagship.loadingRow({ id })
 */
(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Optional :root token overrides (hex strings).
   */
  coffee.flagship = coffee.flagship || {};

  coffee.flagship.applyTokens = function (opts = {}) {
    const root = document.documentElement;
    const map = {
      accent: '--flagship-accent',
      accentMuted: '--flagship-accent-muted',
      bg: '--flagship-bg',
      sidebar: '--flagship-sidebar',
      panel: '--flagship-panel',
      border: '--flagship-border',
      text: '--flagship-text',
      muted: '--flagship-muted'
    };
    Object.keys(map).forEach((key) => {
      if (opts[key] != null && opts[key] !== '') {
        root.style.setProperty(map[key], opts[key]);
      }
    });
  };

  /**
   * Mark html/body for flagship typography on modals (optional).
   */
  coffee.flagship.markRoot = function () {
    document.documentElement.classList.add('coffee-flagship-root');
  };

  /**
   * Suggested-starter tile (welcome grid).
   */
  coffee.flagship.promptCard = function (opts = {}) {
    const { title = '', blurb = '', onClick } = opts;
    const card = document.createElement('div');
    card.setAttribute('data-coffee', 'flagship-prompt-card');
    card.className = 'ff-prompt-card';
    card.innerHTML = '<h4>' + esc(title) + '</h4><p>' + esc(blurb) + '</p>';
    if (typeof onClick === 'function') {
      card.addEventListener('click', onClick);
    }
    return card;
  };

  /**
   * Chat row with avatar + body (text or innerHTML for assistant).
   */
  coffee.flagship.messageRow = function (opts = {}) {
    const { role = 'user', avatarChar, text = '', html } = opts;
    const isUser = role === 'user';
    const row = document.createElement('div');
    row.setAttribute('data-coffee', 'flagship-msg');
    row.className = 'ff-msg';

    const av = document.createElement('div');
    av.className = 'ff-msg-avatar ' + (isUser ? 'ff-user' : 'ff-assistant');
    av.textContent = avatarChar != null ? String(avatarChar) : (isUser ? 'U' : 'K');

    const body = document.createElement('div');
    body.className = 'ff-msg-body pre-wrap';
    if (html != null && !isUser) body.innerHTML = html;
    else body.textContent = text;

    row.appendChild(av);
    row.appendChild(body);
    return row;
  };

  /**
   * Assistant “typing” row; update or remove node when done.
   */
  coffee.flagship.loadingRow = function (opts = {}) {
    const { id, label = 'Manifesting…', avatarChar = 'K' } = opts;
    const row = document.createElement('div');
    row.setAttribute('data-coffee', 'flagship-msg');
    row.className = 'ff-msg';
    if (id) row.id = id;
    row.innerHTML =
      '<div class="ff-msg-avatar ff-assistant">' + esc(String(avatarChar)) + '</div>' +
      '<div class="ff-msg-body"><span class="ff-pending-text">' +
      esc(label) +
      '</span></div>';
    return row;
  };

  /**
   * Minimal ** / `code` formatting for assistant text (escape first).
   */
  coffee.flagship.formatChatText = function (text) {
    const e = esc(text);
    return e
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  };

  window.coffee = coffee;
})();
