# coffee.animate()

Standalone tween engine. No deps. Works with any object — scene2d shapes, scene3d, DOM, etc.

## Usage

```html
<script src="coffee-animate.js"></script>
```

```js
// Animate a shape
coffee.animate(shape, { x: 100, y: 50 }, {
  duration: 1000,
  ease: 'easeOut',
  onUpdate: () => view.scene2d.render()
});

// Animate DOM
coffee.animate(el.style, { opacity: 0 }, { duration: 300, onComplete: () => el.remove() });

// Cancel
const tween = coffee.animate(obj, { x: 100 }, { duration: 2000 });
tween.cancel();
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| duration | 500 | ms |
| delay | 0 | ms before start |
| ease | 'easeOut' | 'linear', 'easeIn', 'easeOut', 'easeInOut', or function(t) |
| onUpdate | — | (target, progress) => {} |
| onComplete | — | (target) => {} |

## Returns

`{ cancel: () => void }`
