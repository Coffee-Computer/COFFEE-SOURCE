/**
 * coffee.chat() — Chat + media layer over coffee.connect().
 * Extends window.coffee. Load after coffee-connect.js.
 *
 * coffee.chat({ conn, myId?, onMessage? })
 * Returns: { send, sendBroadcast, call, conn, peers }
 *
 * Uses standard message format: { type: 'chat', text, from, ts }
 * Exposes conn.call() for media when using Peer transport.
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  coffee.chat = function (config) {
    const conn = config.conn;
    if (!conn) {
      console.error('CoffeeChat: Missing conn (from coffee.connect)');
      return null;
    }

    const myId = config.myId ?? conn.myId ?? null;

    function formatMessage(text) {
      return {
        type: 'chat',
        text: String(text),
        from: myId,
        ts: Date.now()
      };
    }

    const api = {
      conn,

      get peers() {
        return conn.peers ? conn.peers : new Set();
      },

      send(peerId, text) {
        const msg = formatMessage(text);
        if (conn.sendTo) {
          conn.sendTo(peerId, msg);
        }
      },

      sendBroadcast(text) {
        const msg = formatMessage(text);
        if (conn.send) {
          conn.send(msg);
        } else if (conn.publish) {
          conn.publish({
            kind: 1,
            content: JSON.stringify(msg),
            created_at: Math.floor(Date.now() / 1000),
            tags: []
          });
        }
      },

      sendRaw(peerId, data) {
        if (conn.sendTo) conn.sendTo(peerId, data);
      },

      call(peerId, stream) {
        if (typeof conn.call === 'function') {
          return conn.call(peerId, stream);
        }
        return null;
      }
    };

    return api;
  };

  window.coffee = coffee;
})();
