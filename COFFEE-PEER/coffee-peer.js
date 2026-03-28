/**
 * coffee.peer — Direct PeerJS data connections by explicit peer ID.
 * For DND-style dial-a-friend / multi-thread chat (not room-slot scan).
 *
 * Load order: peerjs.min.js → coffee-peer.js (after coffee-control.js optional)
 *
 * @example
 * const h = coffee.peer.open({
 *   generateId: () => 'dnd-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
 *   onOpen: (id) => console.log('my id', id),
 *   onError: (err) => console.error(err),
 *   onIncoming: (conn, handle) => {
 *     if (busy) { conn.close(); return; }
 *     handle.bind(conn, { onData: (d) => ..., onClose: () => ... });
 *   }
 * });
 * h.connect('REMOTE-ID', { onOpen: () => {}, onData: (d) => {}, onClose: () => {} });
 * h.destroy();
 */
(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || (window.coffee = {});

  function parseData(data) {
    if (typeof data !== 'string') return data;
    try {
      return JSON.parse(data);
    } catch (_) {
      return data;
    }
  }

  coffee.peer = {
    /**
     * @param {object} opts
     * @param {string} [opts.id] - Peer id (omit for server-assigned random)
     * @param {() => string} [opts.generateId] - Used if opts.id omitted; passed to Peer as first arg when provided
     * @param {number} [opts.debug] - PeerJS debug level (default 0)
     * @param {string} [opts.peerHost] - e.g. '0.peerjs.com'
     * @param {number} [opts.peerPort] - default 443
     * @param {string} [opts.peerPath] - default '/'
     * @param {boolean} [opts.peerSecure] - default true when host set
     * @param {(myId: string) => void} [opts.onOpen]
     * @param {(err: object) => void} [opts.onError]
     * @param {(conn: import('peerjs').DataConnection, handle: CoffeePeerHandle) => void} [opts.onIncoming]
     *        Incoming DataConnection; call handle.bind(conn, handlers) or conn.close().
     * @returns {CoffeePeerHandle|null}
     */
    open(opts) {
      if (opts == null) opts = {};
      const PeerClass = window.Peer;
      if (!PeerClass) {
        console.error('coffee.peer: PeerJS not found. Load peerjs.min.js before coffee-peer.js');
        return null;
      }

      const peerOpts = { debug: opts.debug ?? 0 };
      if (opts.peerHost) {
        peerOpts.host = opts.peerHost;
        peerOpts.port = opts.peerPort ?? 443;
        peerOpts.path = opts.peerPath || '/';
        peerOpts.secure = opts.peerSecure !== false;
      }

      let myId = null;
      let destroyed = false;
      /** @type {InstanceType<PeerClass>|null} */
      let peer = null;

      function bindConnection(conn, handlers) {
        handlers = handlers || {};
        const peerId = conn.peer;
        const outQueue = [];

        function flushQueue() {
          if (!conn.open) return;
          while (outQueue.length) {
            const d = outQueue.shift();
            try {
              conn.send(d);
            } catch (e) {
              handlers.onError?.(e, api);
            }
          }
        }

        const api = {
          peerId,
          raw: conn,
          send(data) {
            try {
              if (conn.open) conn.send(data);
              else outQueue.push(data);
            } catch (e) {
              handlers.onError?.(e, api);
            }
          },
          close() {
            try {
              conn.close();
            } catch (_) {}
          },
          get open() {
            return conn.open;
          }
        };

        function onConnOpen() {
          flushQueue();
          handlers.onOpen?.(api);
        }
        if (conn.open) onConnOpen();
        else conn.on('open', onConnOpen);

        conn.on('data', (data) => {
          handlers.onData?.(parseData(data), api);
        });
        conn.on('close', () => handlers.onClose?.(api));
        conn.on('error', (err) => handlers.onError?.(err, api));
        return api;
      }

      const firstArg =
        opts.id !== undefined && opts.id !== null && opts.id !== ''
          ? opts.id
          : opts.generateId
            ? opts.generateId()
            : undefined;

      peer =
        firstArg !== undefined
          ? new PeerClass(firstArg, peerOpts)
          : new PeerClass(peerOpts);

      peer.on('open', (openedId) => {
        myId = openedId;
        opts.onOpen?.(openedId);
      });

      peer.on('error', (err) => {
        opts.onError?.(err);
      });

      const handle = {
        get id() {
          return myId;
        },
        get raw() {
          return peer;
        },
        get destroyed() {
          return destroyed;
        },

        /**
         * @param {import('peerjs').DataConnection} conn
         * @param {object} handlers
         */
        bind(conn, handlers) {
          return bindConnection(conn, handlers);
        },

        /**
         * Outbound connection by remote peer id.
         * @param {string} remoteId
         * @param {object} handlers onOpen, onData, onClose, onError
         */
        connect(remoteId, handlers) {
          if (destroyed || !peer) return null;
          const c = peer.connect(remoteId.trim());
          if (!c) return null;
          return bindConnection(c, handlers);
        },

        destroy() {
          if (destroyed) return;
          destroyed = true;
          try {
            peer.destroy();
          } catch (_) {}
          peer = null;
        }
      };

      peer.on('connection', (conn) => {
        if (destroyed) {
          try {
            conn.close();
          } catch (_) {}
          return;
        }
        if (opts.onIncoming) opts.onIncoming(conn, handle);
      });

      return handle;
    }
  };

  /**
   * @typedef {object} CoffeePeerHandle
   * @property {string|null} id
   * @property {object|null} raw
   * @property {boolean} destroyed
   * @property {(conn: object, handlers: object) => object} bind
   * @property {(remoteId: string, handlers: object) => object|null} connect
   * @property {() => void} destroy
   */
})();
