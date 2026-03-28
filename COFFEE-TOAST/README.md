# coffee.toast()

Inline toast notifications. No permissions. Works in iframes. Auto-dismiss.

## Usage

```html
<script src="path/to/coffee-toast.js"></script>
```

```js
coffee.toast('Saved!', 'success');
coffee.toast('Check your input', 'warning');
coffee.toast('Something went wrong', 'error');
coffee.toast('Info message', 'info');  // default

// Custom duration (ms). 0 = no auto-dismiss
coffee.toast('Stays until dismissed', 'info', 0);
coffee.toast('Quick flash', 'success', 1500);
```

## Options

| Arg | Default | Description |
|-----|---------|-------------|
| text | — | Message to show |
| type | `'info'` | `success`, `warning`, `error`, `info` |
| duration | 3000 | ms before auto-dismiss. 0 = persistent |

No dependencies. Extends `window.coffee`.
