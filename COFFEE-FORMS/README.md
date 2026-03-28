# coffee.form()

Form wrapper with validation and submit handling. Load after coffee-ui.

## Usage

```html
<script src="coffee-control.js"></script>
<script src="coffee-ui.js"></script>
<script src="coffee-forms.js"></script>
```

```js
const f = coffee.form({
  fields: [
    { name: 'email', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com' },
    { name: 'password', type: 'password', label: 'Password', required: true },
    { name: 'age', type: 'number', label: 'Age', placeholder: '25' }
  ],
  submitLabel: 'Sign up',
  validate: (data) => {
    const err = {};
    if (data.email && !data.email.includes('@')) err.email = 'Invalid email';
    if (data.age && (data.age < 0 || data.age > 120)) err.age = 'Invalid age';
    return Object.keys(err).length ? err : null;
  },
  onSubmit: (data) => {
    console.log('Submitted:', data);
    coffee.toast('Saved', 'success');
  }
});

document.getElementById('app').appendChild(f);
```

## Options

| Option | Description |
|--------|-------------|
| fields | `[{ name, type, label, required, placeholder, value }]` |
| onSubmit | `(data) => {}` — called with `{ fieldName: value }` |
| validate | `(data) => errors` — return `{ fieldName: 'error' }` or null |
| submitLabel | Button text (default: 'Submit') |

## Methods

- `form.getData()` — Get current field values
- `form.setErrors(errors)` — Set validation errors `{ name: 'message' }`
