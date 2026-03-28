/**
 * coffee.nostr — Nostr helpers on top of coffee.connect (nostr transport).
 * Kind 0 metadata (display name), local cache, optional profile fetch via subscribe.
 *
 * Load after: coffee-control, nostr-tools (optional for publish signing — connect already signs),
 *             coffee-connect.
 *
 * Ghost / apps must call coffee.nostr.handleEvent(ev) from onMessage for kind 0 events
 * (before filtering to kind 1 only), so profile replies resolve lookupProfile.
 */
(function () {
  if (typeof window === 'undefined') return;
  var coffee = window.coffee || {};

  var CACHE_KEY = 'coffee_nostr_profile_cache_v1';
  var MAX_NAME = 48;

  function loadDisk() {
    try {
      var j = localStorage.getItem(CACHE_KEY);
      return j ? JSON.parse(j) : {};
    } catch (_) {
      return {};
    }
  }

  function saveDisk(obj) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch (_) {}
  }

  var disk = loadDisk();
  /** @type {Record<string, Array<Function>>} */
  var pending = {};
  /** @type {Record<string, boolean>} */
  var activeProfileSubs = {};

  function parseMeta(content) {
    if (content == null || typeof content !== 'string') return null;
    try {
      var o = JSON.parse(content);
      if (!o || typeof o !== 'object') return null;
      var name = typeof o.name === 'string' ? o.name.trim().slice(0, MAX_NAME) : '';
      return {
        name: name || null,
        about: typeof o.about === 'string' ? o.about : o.about != null ? String(o.about) : '',
        picture: typeof o.picture === 'string' ? o.picture : o.picture != null ? String(o.picture) : ''
      };
    } catch (_) {
      return null;
    }
  }

  function cacheSet(pubkey, rec) {
    if (!pubkey) return;
    disk[pubkey] = {
      name: rec.name != null ? rec.name : null,
      about: rec.about,
      picture: rec.picture,
      t: Date.now()
    };
    saveDisk(disk);
  }

  function cacheGet(pubkey) {
    return disk[pubkey] || null;
  }

  function flushPending(pubkey, err, profile) {
    var q = pending[pubkey];
    delete pending[pubkey];
    if (!q || !q.length) return;
    for (var i = 0; i < q.length; i++) {
      try {
        q[i](err, profile);
      } catch (e) {}
    }
  }

  var listeners = new Set();

  coffee.nostr = {
    /**
     * Call from connect onMessage for every event; returns true if handled (kind 0).
     */
    handleEvent: function (ev) {
      if (!ev || ev.kind !== 0 || !ev.pubkey) return false;
      var meta = parseMeta(ev.content);
      if (!meta) {
        cacheSet(ev.pubkey, { name: null, about: '', picture: '' });
        flushPending(ev.pubkey, null, { name: null, pubkey: ev.pubkey });
        this._notify(ev.pubkey);
        return true;
      }
      cacheSet(ev.pubkey, {
        name: meta.name,
        about: meta.about,
        picture: meta.picture
      });
      flushPending(ev.pubkey, null, {
        name: meta.name,
        about: meta.about,
        picture: meta.picture,
        pubkey: ev.pubkey
      });
      this._notify(ev.pubkey);
      return true;
    },

    _notify: function (pubkey) {
      listeners.forEach(function (fn) {
        try {
          fn(pubkey);
        } catch (_) {}
      });
    },

    /** Subscribe: fn(pubkey) when any profile is updated (cache or network). */
    onProfileUpdate: function (fn) {
      listeners.add(fn);
      return function () {
        listeners.delete(fn);
      };
    },

    /**
     * Fetch kind 0 for pubkey (uses conn.subscribe). Requires handleEvent wired on same conn.
     * Callback (err, { name, about, picture, pubkey } | null).
     */
    lookupProfile: function (conn, pubkey, cb) {
      if (!pubkey || typeof cb !== 'function') return;
      var cached = cacheGet(pubkey);
      if (cached && Object.prototype.hasOwnProperty.call(cached, 'name')) {
        return cb(null, {
          name: cached.name,
          about: cached.about,
          picture: cached.picture,
          pubkey: pubkey
        });
      }
      if (!conn || conn.status !== 'connected') {
        return cb(new Error('not_connected'), null);
      }
      if (!pending[pubkey]) pending[pubkey] = [];
      pending[pubkey].push(cb);

      if (activeProfileSubs[pubkey]) return;
      activeProfileSubs[pubkey] = true;
      var sub = conn.subscribe({
        kinds: [0],
        authors: [pubkey],
        limit: 5
      });
      var cleared = false;
      function done() {
        if (cleared) return;
        cleared = true;
        delete activeProfileSubs[pubkey];
        try {
          if (sub && typeof sub.close === 'function') sub.close();
        } catch (_) {}
      }
      setTimeout(function () {
        if (pending[pubkey] && pending[pubkey].length) {
          if (!cacheGet(pubkey)) {
            cacheSet(pubkey, { name: null, about: '', picture: '' });
          }
          var c = cacheGet(pubkey);
          flushPending(pubkey, null, c ? { name: c.name, about: c.about, picture: c.picture, pubkey: pubkey } : { name: null, pubkey: pubkey });
        }
        done();
      }, 6500);
    },

    /** Publish kind 0 metadata (signed via conn’s privateKey). */
    publishProfile: function (conn, profile) {
      if (!conn || conn.status !== 'connected') return false;
      var body = {
        name: String(profile && profile.name != null ? profile.name : '').trim().slice(0, MAX_NAME),
        about: profile && profile.about != null ? String(profile.about) : '',
        picture: profile && profile.picture != null ? String(profile.picture) : ''
      };
      return conn.publish({
        kind: 0,
        content: JSON.stringify(body),
        tags: [],
        created_at: Math.floor(Date.now() / 1000)
      });
    },

    /** Label for UI: cached name, else "You" for self, else pubkey prefix. */
    displayLabel: function (pubkey, myPubkeyHex) {
      if (!pubkey) return '?';
      var c = cacheGet(pubkey);
      if (c && c.name) return c.name;
      if (myPubkeyHex && pubkey === myPubkeyHex) return 'You';
      return pubkey.slice(0, 8);
    },

    getCached: function (pubkey) {
      return cacheGet(pubkey);
    },

    /** Update cache + notify UI without an event (e.g. right after publishProfile). */
    applyLocalProfile: function (pubkey, profile) {
      if (!pubkey) return;
      var raw = profile && profile.name != null ? String(profile.name).trim().slice(0, MAX_NAME) : '';
      cacheSet(pubkey, {
        name: raw || null,
        about: profile && profile.about != null ? String(profile.about) : '',
        picture: profile && profile.picture != null ? String(profile.picture) : ''
      });
      this._notify(pubkey);
    },

    /** Avatar initials from label (2 chars). */
    initials: function (label) {
      var s = String(label || '?').trim();
      if (!s) return '?';
      if (s === 'You') return 'Me';
      var parts = s.split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
      return s.slice(0, 2).toUpperCase();
    }
  };

  window.coffee = coffee;
})();
