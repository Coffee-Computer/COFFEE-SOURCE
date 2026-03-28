# coffee.que

In-memory document store. Collections, add, remove, filter. No persistence without an adapter.

## API

```js
const q = coffee.que({ adapter: coffee.wire.control() });

q.collection('default');      // load collection
q.add({ item: 'Latte', price: 4.5 });
q.remove(index);              // by index in full data
q.removeDoc(doc);             // by doc reference
q.filter('latte');            // string search
q.list();                     // filtered results
q.listAll();                  // all docs
q.clear();
q.collections();              // list collection names
q.newCollection('orders');
q.init();                     // Promise — call when using wire.drive() adapter
```

## Adapter

Use `coffee.wire` to persist. Without an adapter, data is session-only (refresh = lost).

- **wire.control()** — uses `coffee.save`/`coffee.load` (Control). Sync.
- **wire.drive(appName)** — uses `coffee.drive` (IndexedDB). Call `await q.init()` before first use.
- **wire.localStorage()** — raw localStorage (legacy).
- **wire.memory()** — in-memory only (testing).

## Demo

`QUE-DEMO.html` — Coffee UI + que + wire.control.
