# coffee.modal() / coffee.dialog()

Overlay modals and confirm dialogs. Esc to close.

## Usage

```html
<script src="coffee-control.js"></script>
<script src="coffee-ui.js"></script>
<script src="coffee-modal.js"></script>
```

```js
// Modal with custom content
coffee.modal(coffee.card([coffee.para('Hello')]), { title: 'Info', onClose: () => console.log('closed') });

// Confirm dialog
coffee.dialog('Delete this item?', {
  title: 'Confirm',
  confirm: 'Delete',
  cancel: 'Cancel',
  onConfirm: () => { /* do it */ },
  onCancel: () => { /* cancelled */ }
});
```

## Options

**coffee.modal(content, opts)**
| Option | Default | Description |
|--------|---------|-------------|
| title | `''` | Header text |
| onClose | — | Callback when closed |
| closeOnOverlay | true | Click backdrop to close |

**coffee.dialog(message, opts)**
| Option | Default | Description |
|--------|---------|-------------|
| title | `'Confirm'` | Header text |
| confirm | `'OK'` | Confirm button label |
| cancel | `'Cancel'` | Cancel button label |
| onConfirm | — | Called when confirm clicked |
| onCancel | — | Called when cancel or closed |
