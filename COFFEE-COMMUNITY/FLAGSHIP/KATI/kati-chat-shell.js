/**
 * KATI Chat — shared UI controller for ALPHA + MOBILE shells.
 * Depends: coffee (ui, modal, toast), coffee.flagship, window.katiChat
 * Load after kati-chat.js and coffee-ui-flagship.js
 */
(function () {
  if (typeof window === 'undefined') return;

  var DEFAULT_TOKENS = {
    accent: '#c084fc',
    accentMuted: 'rgba(192, 132, 252, 0.12)'
  };

  /**
   * @param {object} [opts]
   * @param {object|null} [opts.applyTokens] — passed to coffee.flagship.applyTokens; omit to skip
   * @param {boolean} [opts.safeInitBee=true] — try/catch katiChat.getBee()
   * @param {object|false} [opts.threadsSheet] — mobile bottom sheet; omit for desktop α
   * @param {string} opts.threadsSheet.rootId
   * @param {string} [opts.threadsSheet.openClass='kati-threads-panel-open']
   * @param {string} opts.threadsSheet.toggleBtnId
   * @param {string} opts.threadsSheet.backdropId
   * @param {string} opts.threadsSheet.closeBtnId
   * @param {string} opts.threadsSheet.sheetId
   * @param {string} [opts.logLabel='KATI']
   */
  function boot(opts) {
    opts = opts || {};
    var logLabel = opts.logLabel || 'KATI';
    var safeInitBee = opts.safeInitBee !== false;

    if (safeInitBee) {
      try {
        window.katiChat.getBee();
      } catch (err) {
        console.warn('[' + logLabel + ']', err && err.message ? err.message : err);
      }
    } else {
      window.katiChat.getBee();
    }

    if (!window.coffee || !window.coffee.flagship) {
      console.error(logLabel + ': load coffee-ui-flagship.js after coffee-ui.js');
    }
    var ff = window.coffee && window.coffee.flagship;

    if (opts.applyTokens && ff && typeof ff.applyTokens === 'function') {
      var t = opts.applyTokens === true ? DEFAULT_TOKENS : opts.applyTokens;
      ff.applyTokens(t);
    }

    var closeThreadsPanel = function () {};

    if (opts.threadsSheet) {
      var ts = opts.threadsSheet;
      var openClass = ts.openClass || 'kati-threads-panel-open';
      var mobileRoot = document.getElementById(ts.rootId);
      var threadsBtn = document.getElementById(ts.toggleBtnId);
      var threadsBackdrop = document.getElementById(ts.backdropId);
      var threadsClose = document.getElementById(ts.closeBtnId);
      var threadsSheet = document.getElementById(ts.sheetId);

      function threadsPanelIsOpen() {
        return mobileRoot && mobileRoot.classList.contains(openClass);
      }

      function setThreadsPanel(open) {
        if (!mobileRoot) return;
        mobileRoot.classList.toggle(openClass, open);
        if (threadsBtn) threadsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (threadsBackdrop) threadsBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (threadsSheet) {
          threadsSheet.setAttribute('aria-hidden', open ? 'false' : 'true');
          threadsSheet.setAttribute('aria-modal', open ? 'true' : 'false');
        }
      }

      closeThreadsPanel = function () {
        setThreadsPanel(false);
      };

      function toggleThreadsPanel() {
        setThreadsPanel(!threadsPanelIsOpen());
      }

      if (threadsBtn) threadsBtn.addEventListener('click', toggleThreadsPanel);
      if (threadsClose) threadsClose.addEventListener('click', closeThreadsPanel);
      if (threadsBackdrop) threadsBackdrop.addEventListener('click', closeThreadsPanel);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && threadsPanelIsOpen()) setThreadsPanel(false);
      });
    }

    var welcomeScreen = document.getElementById('kati-welcome');
    var messageContainer = document.getElementById('kati-messages');
    var chatViewport = document.getElementById('kati-chat-viewport');
    var userInput = document.getElementById('kati-user-input');
    var sendBtn = document.getElementById('kati-send-btn');
    var threadListMount = document.getElementById('kati-thread-list');
    var providerSelect = document.getElementById('kati-provider');
    var modelSelect = document.getElementById('kati-model');
    var promptGrid = document.getElementById('kati-prompt-grid');

    if (
      !welcomeScreen ||
      !messageContainer ||
      !chatViewport ||
      !userInput ||
      !sendBtn ||
      !threadListMount ||
      !providerSelect ||
      !modelSelect ||
      !promptGrid
    ) {
      console.error(logLabel + ': missing required #kati-* elements');
      return;
    }

    var currentThreadId = null;
    var kc = window.katiChat;

    function autoGrow(el) {
      el.style.height = '24px';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }

    function showWelcome() {
      welcomeScreen.classList.remove('ff-hidden');
      messageContainer.classList.add('ff-hidden');
    }

    function hideWelcome() {
      welcomeScreen.classList.add('ff-hidden');
      messageContainer.classList.remove('ff-hidden');
    }

    function fillProviderModel() {
      var providers = (window.coffee && window.coffee.ai && window.coffee.ai.providers) || {};
      providerSelect.innerHTML = '';
      ['github', 'openai', 'gemini', 'ollama'].forEach(function (key) {
        if (!providers[key]) return;
        var opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        providerSelect.appendChild(opt);
      });
      providerSelect.value = 'github';
      providerSelect.onchange = function () {
        var p = providers[providerSelect.value];
        modelSelect.innerHTML = '';
        (p && p.models ? p.models : []).forEach(function (m) {
          var o = document.createElement('option');
          o.value = m;
          o.textContent = m;
          modelSelect.appendChild(o);
        });
        if (modelSelect.options.length) modelSelect.value = modelSelect.options[0].value;
      };
      providerSelect.onchange();
    }

    function fillPromptCards() {
      promptGrid.innerHTML = '';
      if (!ff || !ff.promptCard) return;
      kc.getSuggestedPrompts().forEach(function (p) {
        promptGrid.appendChild(
          ff.promptCard({
            title: p.title,
            blurb: p.blurb || '',
            onClick: function () {
              userInput.value = p.prompt;
              autoGrow(userInput);
              handleSend();
            }
          })
        );
      });
    }

    function renderMessages(messages) {
      messageContainer.innerHTML = '';
      if (!ff || !ff.messageRow) return;
      (messages || []).forEach(function (m) {
        var isUser = m.role === 'user';
        messageContainer.appendChild(
          ff.messageRow({
            role: isUser ? 'user' : 'assistant',
            text: isUser ? (m.content || '') : '',
            html: isUser ? null : ff.formatChatText(m.content || '')
          })
        );
      });
      chatViewport.scrollTop = chatViewport.scrollHeight;
    }

    function syncThreadHighlight() {
      threadListMount.querySelectorAll('.ff-history-item').forEach(function (el) {
        el.classList.toggle('ff-history-active', el.dataset.threadId === currentThreadId);
      });
    }

    async function refreshThreads() {
      threadListMount.innerHTML = '';
      var threads = [];
      try {
        threads = await kc.listThreads();
      } catch (e) {
        console.warn('[' + logLabel + '] listThreads', e);
      }
      threads.forEach(function (t) {
        var div = document.createElement('div');
        div.className = 'ff-history-item';
        div.dataset.threadId = t.id;
        div.textContent = (t.title || t.id || 'Context').slice(0, 48);
        div.addEventListener('click', async function () {
          currentThreadId = t.id;
          var th = await kc.loadThread(t.id);
          hideWelcome();
          renderMessages(th && th.messages ? th.messages : []);
          syncThreadHighlight();
          closeThreadsPanel();
        });
        threadListMount.appendChild(div);
      });
      syncThreadHighlight();
    }

    async function newExpression() {
      currentThreadId = null;
      messageContainer.innerHTML = '';
      showWelcome();
      userInput.value = '';
      userInput.style.height = '24px';
      await refreshThreads();
      closeThreadsPanel();
    }

    async function handleSend() {
      var text = userInput.value.trim();
      if (!text) return;

      var prov = providerSelect.value;
      var mod = modelSelect.value;

      if (!welcomeScreen.classList.contains('ff-hidden')) {
        hideWelcome();
      }

      try {
        if (!currentThreadId) {
          var thread = await kc.createThread({ provider: prov, model: mod });
          currentThreadId = thread.id;
          await refreshThreads();
          syncThreadHighlight();
        }

        sendBtn.disabled = true;

        var before = await kc.loadThread(currentThreadId);
        renderMessages(before && before.messages ? before.messages : []);

        if (ff && ff.messageRow) messageContainer.appendChild(ff.messageRow({ role: 'user', text: text }));

        if (ff && ff.loadingRow) messageContainer.appendChild(ff.loadingRow({ id: 'kati-loading-row' }));
        chatViewport.scrollTop = chatViewport.scrollHeight;

        userInput.value = '';
        userInput.style.height = '24px';

        var result = await kc.send(currentThreadId, text, { provider: prov, model: mod });
        var threadOut = result.thread;
        var lr = document.getElementById('kati-loading-row');
        if (lr) lr.remove();
        renderMessages(threadOut.messages || []);
        await refreshThreads();
        syncThreadHighlight();
        if (window.coffee && window.coffee.toast) window.coffee.toast('Sent', 'success');
      } catch (e) {
        var err = e && e.message ? e.message : String(e);
        if (window.coffee && window.coffee.toast) window.coffee.toast(err, 'error');
        try {
          if (currentThreadId) {
            var th2 = await kc.loadThread(currentThreadId);
            hideWelcome();
            renderMessages(th2 && th2.messages ? th2.messages : []);
          }
        } catch (_) {}
        if (ff && ff.messageRow) {
          var errRow = ff.messageRow({
            role: 'assistant',
            text: 'My telemetry sensors are encountering interference. Please re-engage. (' + err + ')'
          });
          errRow.querySelector('.ff-msg-body').style.color = '#f87171';
          messageContainer.appendChild(errRow);
        }
        chatViewport.scrollTop = chatViewport.scrollHeight;
      } finally {
        sendBtn.disabled = false;
        chatViewport.scrollTop = chatViewport.scrollHeight;
      }
    }

    function openApiKeysModal() {
      var keys = kc.STORAGE_KEYS;
      var githubInput = window.coffee.input({
        type: 'password',
        placeholder: 'GitHub (ghp_xxx)',
        value: kc.getApiKey('github'),
        style: { width: '100%', marginBottom: '8px' }
      });
      var openaiInput = window.coffee.input({
        type: 'password',
        placeholder: 'OpenAI (sk-xxx)',
        value: kc.getApiKey('openai'),
        style: { width: '100%', marginBottom: '8px' }
      });
      var geminiInput = window.coffee.input({
        type: 'password',
        placeholder: 'Gemini key',
        value: kc.getApiKey('gemini'),
        style: { width: '100%', marginBottom: '12px' }
      });
      var content = window.coffee.card(
        [
          window.coffee.para('Stored with coffee.save (local).', {
            style: { color: '#71717a', marginBottom: '12px' }
          }),
          githubInput,
          openaiInput,
          geminiInput,
          window.coffee.row(
            [
              window.coffee.button('Save', function () {
                window.coffee.save(keys.github, githubInput.value);
                window.coffee.save(keys.openai, openaiInput.value);
                window.coffee.save(keys.gemini, geminiInput.value);
                if (window.coffee.toast) window.coffee.toast('Keys saved', 'success');
                modalRef.close();
              }),
              window.coffee.button(
                'Clear',
                function () {
                  window.coffee.remove(keys.github);
                  window.coffee.remove(keys.openai);
                  window.coffee.remove(keys.gemini);
                  githubInput.value = '';
                  openaiInput.value = '';
                  geminiInput.value = '';
                  if (window.coffee.toast) window.coffee.toast('Cleared', 'info');
                },
                { backgroundColor: '#27272a' }
              )
            ],
            { style: { gap: '8px' } }
          )
        ],
        { style: { width: '100%' } }
      );
      var modalRef = window.coffee.modal(content, { title: 'API keys', closeOnOverlay: true });
    }

    var newChatBtn = document.getElementById('kati-new-chat');
    var keysBtn = document.getElementById('kati-btn-keys');
    var exportBtn = document.getElementById('kati-btn-export');
    if (newChatBtn) newChatBtn.addEventListener('click', newExpression);
    if (keysBtn) keysBtn.addEventListener('click', openApiKeysModal);
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        if (window.coffee && window.coffee.toast) window.coffee.toast('Export coming soon', 'info');
      });
    }

    sendBtn.addEventListener('click', function () {
      handleSend();
    });
    userInput.addEventListener('input', function () {
      autoGrow(userInput);
    });
    userInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    fillProviderModel();
    fillPromptCards();
    showWelcome();
    refreshThreads().catch(function () {});
  }

  window.katiChatShell = {
    boot: boot,
    DEFAULT_TOKENS: DEFAULT_TOKENS
  };
})();
