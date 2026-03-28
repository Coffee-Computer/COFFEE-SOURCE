/**
 * Coffee Community Profile — load profile.json and hydrate the page.
 * Optional: ?profile=other.json (same-origin relative URL).
 */
(function () {
  var ACHIEVEMENT_ICONS = {
    'git-pull':
      '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M6 9v12"/>',
    flame:
      '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    bug:
      '<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>',
    coffee:
      '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>'
  };

  var COLOR_CLASS = {
    emerald: 'is-emerald',
    orange: 'is-orange',
    blue: 'is-blue',
    gold: 'is-gold'
  };

  var RANDOM_SEEDS = ['Oliver', 'Sasha', 'Bear', 'Coco', 'Pepper', 'Milo', 'Midnight', 'Zoe', 'Caffeine', 'Script'];

  /** @type {object | null} */
  var loadedProfile = null;

  function getProfileJsonUrl() {
    var q = new URLSearchParams(window.location.search).get('profile');
    if (q) return new URL(q, window.location.href).href;
    return new URL('profile.json', window.location.href).href;
  }

  function dicebearUrl(avatar, seed) {
    var a = avatar || {};
    if (a.imageUrl && String(a.imageUrl).trim()) return String(a.imageUrl).trim();
    var style = a.style || 'adventurer';
    var s = seed != null ? seed : a.seed || 'Coffee';
    var bg = a.backgroundColor || 'b6e3f4,c0aede,d1d4f9';
    return (
      'https://api.dicebear.com/7.x/' +
      encodeURIComponent(style) +
      '/svg?seed=' +
      encodeURIComponent(s) +
      '&backgroundColor=' +
      encodeURIComponent(bg)
    );
  }

  function pingAvatarUrl(avatar, seed) {
    return dicebearUrl(avatar, seed || 'User');
  }

  function el(id) {
    return document.getElementById(id);
  }

  var qrcodeLibPromise = null;

  /** Load qrcode npm browser build (once). */
  function loadQrcodeLib() {
    if (typeof window.QRCode !== 'undefined') return Promise.resolve(window.QRCode);
    if (qrcodeLibPromise) return qrcodeLibPromise;
    qrcodeLibPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js';
      s.async = true;
      s.onload = function () {
        if (typeof window.QRCode !== 'undefined') resolve(window.QRCode);
        else reject(new Error('QRCode not available'));
      };
      s.onerror = function () {
        reject(new Error('Failed to load QR library'));
      };
      document.head.appendChild(s);
    });
    return qrcodeLibPromise;
  }

  /**
   * qrImageUrl — static image wins.
   * Else qrUseCurrentPage → encode this page URL (good on GitHub Pages).
   * Else qrTargetUrl — encode that string (your canonical profile URL, vCard text, etc.).
   */
  function applyQr(p) {
    var qr = el('cp-qr');
    var qrWrap = el('cp-qr-wrap');
    if (!qr || !qrWrap) return;
    qr.classList.remove('cp-qr--generated');

    if (p.qrImageUrl && String(p.qrImageUrl).trim()) {
      qr.src = p.qrImageUrl.trim();
      qr.alt = '';
      qrWrap.hidden = false;
      return;
    }

    var payload = '';
    if (p.qrUseCurrentPage === true) {
      payload = window.location.href.split('#')[0];
    } else if (p.qrTargetUrl && String(p.qrTargetUrl).trim()) {
      payload = String(p.qrTargetUrl).trim();
    }

    if (!payload) {
      qr.removeAttribute('src');
      qr.alt = '';
      qrWrap.hidden = true;
      return;
    }

    loadQrcodeLib()
      .then(function (QRCode) {
        return new Promise(function (resolve, reject) {
          QRCode.toDataURL(
            payload,
            {
              width: 200,
              margin: 2,
              color: { dark: '#d4a373', light: '#16161a' },
              errorCorrectionLevel: 'M'
            },
            function (err, dataUrl) {
              if (err) reject(err);
              else resolve(dataUrl);
            }
          );
        });
      })
      .then(function (dataUrl) {
        qr.src = dataUrl;
        qr.alt = 'QR link';
        qr.classList.add('cp-qr--generated');
        qrWrap.hidden = false;
      })
      .catch(function (e) {
        console.warn('[community-profile]', e);
        qr.removeAttribute('src');
        qr.alt = '';
        qrWrap.hidden = true;
      });
  }

  function achievementSvg(iconKey) {
    var paths = ACHIEVEMENT_ICONS[iconKey] || ACHIEVEMENT_ICONS.coffee;
    var tpl =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      paths +
      '</svg>';
    var doc = new DOMParser().parseFromString(tpl, 'image/svg+xml');
    var svg = doc.documentElement;
    if (doc.getElementsByTagName('parsererror').length) {
      return achievementSvg('coffee');
    }
    return svg;
  }

  function wireAchievementHover(container) {
    container.querySelectorAll('.cp-achievement').forEach(function (badge) {
      badge.addEventListener('mouseenter', function () {
        var s = badge.querySelector('svg');
        if (s) {
          s.style.transform = 'scale(1.2) rotate(10deg)';
          s.style.transition = 'transform 0.2s ease';
        }
      });
      badge.addEventListener('mouseleave', function () {
        var s = badge.querySelector('svg');
        if (s) s.style.transform = 'scale(1) rotate(0deg)';
      });
    });
  }

  function renderMeta(container, rows) {
    container.innerHTML = '';
    (rows || []).forEach(function (row) {
      var wrap = document.createElement('div');
      wrap.className = 'cp-meta-row';
      var lab = document.createElement('span');
      lab.className = 'cp-mono cp-meta-label';
      lab.textContent = row.label || '';
      wrap.appendChild(lab);
      if (row.type === 'bars') {
        var filled = Math.max(0, Math.min(Number(row.total) || 5, Number(row.filled) || 0));
        var total = Math.max(1, Number(row.total) || 5);
        var bars = document.createElement('div');
        bars.className = 'cp-os-bars';
        bars.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < total; i++) {
          var b = document.createElement('span');
          b.className = 'cp-os-bar' + (i < filled ? ' is-on' : '');
          bars.appendChild(b);
        }
        wrap.appendChild(bars);
      } else {
        var val = document.createElement('span');
        val.className = 'cp-meta-value';
        val.textContent = row.value != null ? String(row.value) : '';
        wrap.appendChild(val);
      }
      container.appendChild(wrap);
    });
  }

  function renderAchievements(container, titleEl, list) {
    titleEl.textContent = list && list.sectionTitle != null ? list.sectionTitle : 'Achievements';
    container.innerHTML = '';
    (list && list.items ? list.items : []).forEach(function (item) {
      var div = document.createElement('div');
      var color = COLOR_CLASS[item.color] || 'is-gold';
      div.className = 'cp-achievement ' + color;
      if (item.title) div.title = item.title;
      div.appendChild(achievementSvg(item.icon || 'coffee'));
      container.appendChild(div);
    });
    wireAchievementHover(document.getElementById('cp-achievements-block') || container);
  }

  function renderGoals(ul, items) {
    ul.innerHTML = '';
    (items || []).forEach(function (g) {
      var li = document.createElement('li');
      if (g.dim) li.className = 'is-dim';
      var dot = document.createElement('span');
      dot.className = 'cp-goal-dot';
      li.appendChild(dot);
      li.appendChild(document.createTextNode(g.text || ''));
      ul.appendChild(li);
    });
  }

  function renderPings(container, items, avatarCfg) {
    container.innerHTML = '';
    (items || []).forEach(function (p) {
      var art = document.createElement('article');
      art.className = 'cp-ping';
      art.innerHTML =
        '<div class="cp-ping-head">' +
        '<div class="cp-ping-avatar"><img alt="" /></div>' +
        '<div><h4 class="cp-ping-name"></h4><p class="cp-ping-time"></p></div></div>' +
        '<p class="cp-ping-text"></p>';
      art.querySelector('img').src = pingAvatarUrl(avatarCfg, p.avatarSeed);
      art.querySelector('.cp-ping-name').textContent = p.handle || '';
      art.querySelector('.cp-ping-time').textContent = p.time || '';
      art.querySelector('.cp-ping-text').textContent = p.text || '';
      container.appendChild(art);
    });
  }

  function applyProfile(p) {
    loadedProfile = p;
    if (p.pageTitle) document.title = p.pageTitle;

    var badge = el('cp-badge-label');
    if (badge) badge.textContent = p.badgeLabel != null ? p.badgeLabel : 'Community Edition';

    var st = p.status || {};
    var statusLabel = el('cp-status-label');
    if (statusLabel) statusLabel.textContent = st.label != null ? st.label : 'ONLINE';
    var dot = el('cp-status-dot');
    if (dot) dot.style.display = st.showDot === false ? 'none' : '';

    var img = el('cp-avatar');
    if (img) {
      img.src = dicebearUrl(p.avatar);
      img.alt = p.name ? 'Avatar — ' + p.name : 'Avatar';
    }

    var nameEl = el('cp-name');
    if (nameEl) nameEl.textContent = p.name || '';
    var handleEl = el('cp-handle');
    if (handleEl) handleEl.textContent = p.handle || '';

    renderMeta(el('cp-meta-rows'), p.meta);

    applyQr(p);

    var achBlock = el('cp-achievements-block');
    var showAchievements = p.showAchievements !== false;
    if (achBlock) {
      achBlock.hidden = !showAchievements;
    }
    if (showAchievements) {
      renderAchievements(el('cp-badge-grid'), el('cp-achievements-title'), {
        sectionTitle: p.achievementsSectionTitle,
        items: p.achievements
      });
    } else if (el('cp-badge-grid')) {
      el('cp-badge-grid').innerHTML = '';
    }

    el('cp-about-title-text').textContent = (p.about && p.about.title) || 'About Me';
    el('cp-about-body').textContent = (p.about && p.about.body) || '';

    el('cp-goals-title-text').textContent = (p.goals && p.goals.title) || 'Goals';
    renderGoals(el('cp-goals-list'), (p.goals && p.goals.items) || []);

    var sn = p.snippet || {};
    el('cp-snippet-title-text').textContent = sn.title || 'Snippet Bin';
    el('cp-snippet-filename').textContent = sn.filename || '';
    var pre = el('cp-snippet-code');
    if (pre) {
      pre.textContent = sn.code != null ? sn.code : '';
    }

    var pings = p.pings || {};
    el('cp-pings-title-text').textContent = pings.title || 'Recent Pings';
    renderPings(el('cp-pings-list'), pings.items, p.avatar);
    var btn = el('cp-activity-btn');
    if (btn) {
      if (pings.moreButtonLabel) {
        btn.textContent = pings.moreButtonLabel;
        btn.hidden = false;
      } else {
        btn.hidden = true;
      }
    }

    el('cp-load-error').hidden = true;
  }

  function showError(msg) {
    var e = el('cp-load-error');
    if (e) {
      e.hidden = false;
      e.textContent = msg;
    }
  }

  function cpRandomizeAvatar() {
    var img = el('cp-avatar');
    if (!img || !loadedProfile || !loadedProfile.avatar) return;
    var a = loadedProfile.avatar;
    if (a.imageUrl && String(a.imageUrl).trim()) return;
    var randomSeed = RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)] + Math.floor(Math.random() * 1000);
    img.style.opacity = '0.5';
    setTimeout(function () {
      img.src = dicebearUrl(a, randomSeed);
      img.style.opacity = '1';
    }, 100);
  }

  window.cpRandomizeAvatar = cpRandomizeAvatar;

  function init() {
    var url = getProfileJsonUrl();
    fetch(url, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(applyProfile)
      .catch(function (err) {
        console.warn('[community-profile]', err);
        showError(
          'Could not load profile JSON (' +
            url +
            '). Serve this folder over HTTP and keep profile.json next to the page, or use ?profile=your.json'
        );
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
