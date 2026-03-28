/**
 * coffee.connect() — Unified connection API for Nostr and PeerJS.
 * Extends window.coffee. Load after coffee-control.js.
 * Dependencies: nostr-tools (for nostr), peerjs (for peer).
 *
 * coffee.connect({ method: 'nostr', relay: 'wss://...' })
 * coffee.connect({ method: 'peer', room: 'my-room' })
 * coffee.connect({ method: 'peer', room: 'local-drop' })
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  function createNostrTransport(config) {
    const relay = config.relay || config.relays?.[0] || 'wss://relay.damus.io';
    const privateKey = config.privateKey || null;
    const subs = new Map();
    let socket = null;
    let status = 'connecting';
    let reconnectTimer = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = config.maxReconnectAttempts ?? 10;

    function setStatus(s) {
      status = s;
      if (config.onStatus) config.onStatus(s);
    }

    function connect() {
      if (socket) socket.close();
      socket = new WebSocket(relay);
      setStatus('connecting');

      socket.onopen = () => {
        reconnectAttempts = 0;
        setStatus('connected');
        config.onOpen?.();
      };

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data[0] === 'EVENT') {
            config.onMessage?.(data[2]);
          } else if (data[0] === 'EOSE') {
            const subId = data[1];
            if (subs.has(subId)) subs.get(subId).onEose?.();
          }
        } catch (err) {
          console.error('CoffeeConnect Nostr parse error:', err);
        }
      };

      socket.onclose = () => {
        setStatus('disconnected');
        config.onClose?.();
        if (config.autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectAttempts++;
          reconnectTimer = setTimeout(connect, delay);
        }
      };

      socket.onerror = () => {};
    }

    const api = {
      get status() { return status; },
      close() {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = null;
        if (socket) {
          socket.close();
          socket = null;
        }
        setStatus('disconnected');
      },
      subscribe(filter) {
        if (!socket || socket.readyState !== WebSocket.OPEN) return null;
        const subId = 'cc-' + Math.random().toString(36).slice(2, 10);
        socket.send(JSON.stringify(['REQ', subId, filter]));
        const sub = { id: subId, filter };
        subs.set(subId, sub);
        return {
          close: () => {
            socket?.send(JSON.stringify(['CLOSE', subId]));
            subs.delete(subId);
          }
        };
      },
      publish(event) {
        if (!socket || socket.readyState !== WebSocket.OPEN) return false;
        const nt = window.NostrTools;
        if (privateKey && nt) {
          try {
            event.pubkey = event.pubkey || (nt.getPublicKey ? nt.getPublicKey(privateKey) : null);
            event.created_at = event.created_at || Math.floor(Date.now() / 1000);
            event.tags = event.tags || [];
            const getHash = nt.getEventHash || window.getEventHash;
            const signEv = nt.signEvent || window.signEvent;
            event.id = getHash(event);
            event.sig = signEv(event, privateKey);
          } catch (e) {
            console.error('CoffeeConnect publish sign error:', e);
            return false;
          }
        }
        socket.send(JSON.stringify(['EVENT', event]));
        return true;
      },
      send(data) {
        return this.publish(typeof data === 'object' && data.kind !== undefined ? data : { kind: 1, content: JSON.stringify(data), created_at: Math.floor(Date.now() / 1000), tags: [] });
      }
    };

    connect();
    return api;
  }

  function createPeerTransport(config) {
    const room = config.room || 'coffee-room';
    const scanRange = config.scanRange ?? 20;
    const isLocalDrop = room === 'local-drop';
    const peers = new Set();
    const connections = new Map();
    const pendingConnect = new Map(); // peerId -> { callbacks }
    let peer = null;
    let status = 'connecting';
    let myId = null;
    let userClosed = false;

    function setStatus(s) {
      status = s;
      if (config.onStatus) config.onStatus(s);
    }

    function addPeer(peerId, conn) {
      if (peerId === myId || peers.has(peerId)) return;
      peers.add(peerId);
      if (conn) connections.set(peerId, conn);
      config.onPeerJoin?.(peerId);
    }

    function removePeer(peerId) {
      if (!peers.has(peerId)) return;
      peers.delete(peerId);
      connections.delete(peerId);
      config.onPeerLeave?.(peerId);
    }

    function setupConnection(conn) {
      const pid = conn.peer;
      conn.on('data', (data) => {
        const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch (_) { return data; } })() : data;
        config.onMessage?.(pid, parsed);
      });
      conn.on('close', () => removePeer(pid));
      conn.on('error', () => removePeer(pid));
      addPeer(pid, conn);
    }

    function attemptInit(slotIndex) {
      if (slotIndex >= scanRange) {
        setStatus('disconnected');
        config.onClose?.();
        return;
      }
      if (isLocalDrop) {
        fetch('https://api.ipify.org?format=json')
          .then((r) => r.json())
          .then((d) => {
            const ipHash = btoa(d.ip).substring(0, 8);
            createPeer(`local-drop-${ipHash}-${slotIndex}`, slotIndex);
          })
          .catch(() => createPeer(`local-drop-fallback-${slotIndex}`, slotIndex));
      } else {
        createPeer(`${room}-${slotIndex}`, slotIndex);
      }
    }

    function createPeer(fullId, slotIndex) {
      const PeerClass = window.Peer;
      if (!PeerClass) {
        console.error('CoffeeConnect: PeerJS not loaded.');
        setStatus('disconnected');
        return;
      }
      const peerOpts = {
        host: config.peerHost || '0.peerjs.com',
        port: config.peerPort ?? 443,
        path: config.peerPath || '/',
        secure: config.peerSecure !== false
      };
      peer = new PeerClass(fullId, peerOpts);

      peer.on('open', (id) => {
        myId = id;
        setStatus('connected');
        config.onOpen?.(id);
        runScan();
      });

      peer.on('connection', (conn) => {
        conn.on('open', () => setupConnection(conn));
      });

      peer.on('call', (call) => {
        config.onIncomingCall?.(call);
      });

      peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          if (peer) peer.destroy();
          peer = null;
          attemptInit(slotIndex + 1);
        } else if (err.type === 'peer-unavailable') {
          // Expected during scan when probing for peers that don't exist yet
          // Our Peer is still connected; ignore
        } else {
          console.error('CoffeeConnect Peer error:', err.type, err);
          setStatus('disconnected');
          config.onClose?.();
        }
      });
    }

    function init() {
      userClosed = false;
      if (isLocalDrop) {
        attemptInit(0);
      } else {
        attemptInit(0);
      }
    }

    function ensureConnection(peerId, onReady) {
      let c = connections.get(peerId);
      if (c && c.open) {
        onReady?.(c);
        return;
      }
      if (!peer) {
        onReady?.(null);
        return;
      }
      const runCallbacks = (conn) => {
        const list = pendingConnect.get(peerId);
        pendingConnect.delete(peerId);
        if (list) list.forEach((cb) => cb(conn));
      };
      const p = pendingConnect.get(peerId);
      if (p) {
        if (onReady) p.push(onReady);
        return;
      }
      pendingConnect.set(peerId, onReady ? [onReady] : []);
      let done = false;
      const finish = (conn) => {
        if (done) return;
        done = true;
        runCallbacks(conn);
      };
      const newConn = peer.connect(peerId);
      newConn.on('open', () => {
        setupConnection(newConn);
        finish(newConn);
      });
      newConn.on('error', () => finish(null));
      setTimeout(() => finish(null), 5000);
    }

    function runScan() {
      const getPrefix = () => {
        if (isLocalDrop && myId) {
          const parts = myId.split('-');
          if (parts.length >= 3) return parts.slice(0, -1).join('-');
          return 'local-drop';
        }
        return room;
      };
      const p = getPrefix();
      for (let i = 0; i < scanRange; i++) {
        const targetId = `${p}-${i}`;
        if (targetId === myId) continue;
        if (peers.has(targetId)) continue;
        const conn = peer.connect(targetId);
        conn.on('open', () => setupConnection(conn)); // WHISPER: keep connection for chat
        setTimeout(() => {
          if (!peers.has(targetId)) conn.close();
        }, 2000);
      }
    }

    const api = {
      get status() { return status; },
      get peers() { return new Set(peers); },
      get myId() { return myId; },
      close() {
        userClosed = true;
        connections.forEach((c) => c.close());
        connections.clear();
        peers.clear();
        pendingConnect.clear();
        if (peer) {
          peer.destroy();
          peer = null;
        }
        setStatus('disconnected');
        config.onClose?.();
      },
      sendTo(peerId, data) {
        let c = connections.get(peerId);
        if (c && c.open) {
          c.send(typeof data === 'string' ? data : JSON.stringify(data));
          return true;
        }
        ensureConnection(peerId, (c) => {
          if (c && c.open) c.send(typeof data === 'string' ? data : JSON.stringify(data));
        });
        return false;
      },
      connectTo(peerId, onReady) {
        ensureConnection(peerId, onReady);
      },
      send(data) {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        connections.forEach((conn) => {
          if (conn.open) conn.send(payload);
        });
      },
      scan() {
        runScan();
      },
      call(peerId, stream) {
        if (!peer) return null;
        return peer.call(peerId, stream);
      }
    };

    init();
    return api;
  }

  coffee.connect = function (config) {
    const method = (config.method || 'nostr').toLowerCase();
    if (method === 'nostr') {
      return createNostrTransport(config);
    }
    if (method === 'peer') {
      return createPeerTransport(config);
    }
    console.error('CoffeeConnect: Unknown method', config.method);
    return null;
  };

  window.coffee = coffee;
})();
