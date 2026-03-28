# coffee.task

Planner / calendar **engine** (dates + task CRUD + persistence). **No DOM.**

Load **after** `coffee-control.js` so `coffee.save` / `coffee.load` work.

```html
<script src="coffee-control.js"></script>
<script src="coffee-task.js"></script>
```

## `coffee.task.date`

| Method | Description |
|--------|-------------|
| `toKey(date)` | `Date` → `YYYY-MM-DD` (local) |
| `fromKey(key)` | `YYYY-MM-DD` → `Date` midnight local, or `null` |
| `todayKey()` | Today’s key |
| `monthMatrix(year, month0to11)` | 42-cell grid for calendar UI `{ cells: [{ day, inMonth, date, dateKey, isToday }] }` |
| `legacyPocKeyToIso(key)` | POC used month **0–11** in keys; converts to `YYYY-MM-DD` |

## `coffee.task.createStore(opts)`

- `storageKey` — default `late_tasks_v1` (stored as `coffee_<key>` via Control)
- `useCoffeeStorage` — default `true`; if `false`, uses `localStorage` for that key only
- `onChange(tasks)` — called after mutations

Returns:

| Method | Description |
|--------|-------------|
| `tasks` | Copy of all tasks |
| `listForKey(dateKey, filter?)` | `filter`: `'active'` or omit for all |
| `listForDate(date, filter?)` | Same, from a `Date` |
| `tasksForKeyWithDots(dateKey)` | All tasks on that day (for calendar dots) |
| `add({ text, date?, dateKey? })` | New task; defaults to today |
| `toggle(id)` | Complete / uncomplete |
| `remove(id)` | Delete |
| `subscribe(fn)` | `fn(tasksSnapshot)` on change; returns `unsub` |
| `reload()` | Re-read storage |
| `persist()` | Save current tasks |

## Task shape

```js
{ id, text, completed, date: 'YYYY-MM-DD', createdAt: ISO string }
```

## Migration

If **`coffee_late_tasks_v1`** (via `coffee.save('late_tasks_v1', …)`) is **missing** and **`localStorage['coffee_tasks']`** exists (raw key from TASK-POC1), tasks are imported **once** and `date` values are converted from legacy **month indices 0–11** to **`YYYY-MM-DD`**.

## Consumer

`../COFFEE-COMMUNITY/FLAGSHIP/LATE/LATE-ALPHA.html`
