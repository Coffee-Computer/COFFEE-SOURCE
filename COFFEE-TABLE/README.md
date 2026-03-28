# coffee.table()

Generic table component for tabular data. Load after coffee-ui.

## Usage

```html
<script src="coffee-ui.js"></script>
<script src="coffee-table.js"></script>
```

```js
// Auto columns from first row
const table = coffee.table([
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' }
]);

// Explicit columns
const table = coffee.table(data, {
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' }
  ],
  onRowClick: (row) => console.log(row),
  emptyMessage: 'No rows'
});
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| columns | `[]` | `[{ key, label }]` or `['key1', 'key2']`. Auto from first row if empty |
| onRowClick | — | `(row, index) => void` |
| emptyMessage | `'No data'` | Shown when empty |

## Methods

- `table.setData(newData)` — Replace data and re-render
