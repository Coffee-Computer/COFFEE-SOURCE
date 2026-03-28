# Snow Shoes embed protocol (v1)

Host: **`snow-shoes-daw.js`** (iframe plugin windows).  
Child: **`snow-shoes-embed.js`** (optional but recommended).

## Envelope

Every message is a plain object:

| Field | Value |
|--------|--------|
| `ch` | `'snow-shoes'` |
| `v` | `1` |
| `type` | string (see below) |
| `payload` | object (optional) |

`postMessage` target is `'*'` for local dev (`file://`); in production prefer a fixed origin.

---

## Host → plugin

| `type` | `payload` | When |
|--------|-----------|------|
| `host.hello` | `{ protocol, pluginId, name }` | After iframe `load` |
| `transport.state` | `{ bpm, playing, currentStep, totalSteps }` | ~300ms while α is open |
| `host.pong` | `{ t }` | Reply to `plugin.ping` |

---

## Plugin → host

| `type` | `payload` | Notes |
|--------|-----------|--------|
| `plugin.ready` | `{ title, href }` | Send once from `SnowShoesEmbed.init()` |
| `plugin.ping` | arbitrary | Debug / handshake |

---

## Child integration

```html
<script src="../snow-shoes-embed.js"></script>
<script>
  SnowShoesEmbed.init({ debug: false });
  SnowShoesEmbed.onTransport(function (s) {
    // mirror host BPM, lights, etc.
  });
</script>
```

---

## Related

- **Coffee Sound** Black Box: `COFFEE_SOUND/PLUGIN_SYSTEM.md`, `blackbox-adapter.js` (audio capture path; different product, similar idea).
