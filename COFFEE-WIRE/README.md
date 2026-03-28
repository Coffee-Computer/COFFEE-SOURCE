# coffee.wire

Persistence adapters for coffee.que. Unified with Control and Drive.

## Adapters

```js
// Control — uses coffee.save/load (localStorage). Load coffee-control.js first.
coffee.wire.control({ prefix: 'que_' })

// Drive — uses coffee.drive (IndexedDB). Load coffee-drive.js first. Call init() before use.
coffee.wire.drive('my-app')

// localStorage — raw localStorage (legacy)
coffee.wire.localStorage({ prefix: 'coffee_wire_' })

// memory — in-memory, no persist (testing)
coffee.wire.memory()
```

## Interface

Adapters implement: `load(name)`, `save(name, data)`, `listCollections()`.

Drive adapter adds: `init()` → Promise (call before first use).

## Usage

**Control (sync):**
```js
const q = coffee.que({ adapter: coffee.wire.control() });
q.collection('default');
q.add({ x: 1 });  // adapter saves automatically
```

**Drive (async init):**
```js
const q = coffee.que({ adapter: coffee.wire.drive('my-app') });
await q.init();   // load from IndexedDB
q.collection('default');
q.add({ x: 1 });
```
