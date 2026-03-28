# coffee.list()

Generic list component for data display. Load after coffee-ui.

## Usage

```html
<script src="coffee-ui.js"></script>
<script src="coffee-list.js"></script>
```

```js
// Simple
const list = coffee.list(['a', 'b', 'c']);

// With objects
const list = coffee.list(
  [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
  { renderItem: (item) => { const d = document.createElement('div'); d.textContent = item.name; return d; } }
);

// With click
const list = coffee.list(items, {
  renderItem: (item) => coffee.card([coffee.para(item.name)]),
  onItemClick: (item) => console.log(item),
  emptyMessage: 'No results'
});
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| renderItem | — | `(item, index) => HTMLElement` |
| onItemClick | — | `(item, index) => void` |
| emptyMessage | `'No items'` | Shown when empty |
| gap | `'8px'` | Gap between items |

## Methods

- `list.setItems(newItems)` — Replace items and re-render
