# coffee.svg

Vector graphics engine. Draw rect, circle, text. Select, edit, export. UI-agnostic API.

## API

```js
const svg = coffee.svg({ svg: artboardEl, onSelect: (el) => updateInspector(el) });
// Or create from scratch:
const svg = coffee.svg({ width: 800, height: 600, onSelect });

svg.setTool('rect' | 'circle' | 'text' | 'select');
svg.setFillColor('#10b981');
svg.getSelected();
svg.updateSelected('text' | 'fontSize' | 'opacity' | 'fill', value);
svg.deleteSelected();
svg.clear();
svg.export();  // Opens SVG in new tab
svg.getSVG();  // Returns the SVG element
```

## Tools

- **rect** — Click-drag to draw rectangle
- **circle** — Click-drag from center
- **text** — Click to place "Type..."
- **select** — Click to select, edit in inspector

## Demo

`SVG-DEMO.html` — Coffee UI toolbar, artboard, inspector panel.
