# COFFEE-YAY

**`coffee.yay()`** — spatial 3D “website builder” core: Three.js scene, orbit camera, mesh primitives, and **HTML cards** projected with `vector.project(camera)`.

## Dependencies

1. **`window.THREE`** — e.g.  
   `https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js`
2. **`coffee-control`** (optional) — for `coffee.save` / `coffee.load` in demos
3. **`coffee-ui`** (optional) — for flagship inspector widgets

## Load order

`coffee-control` → `coffee-ui` → **Three** → **`coffee-yay.js`**

## API (summary)

```js
const y = coffee.yay({
  viewport: '#vp',           // HTMLElement or selector
  accent: 0xff3e00,
  background: 0x080808,
  addInitialBox: true,
  onSelectionChange(sel) {},
  onSceneChange() {}
});

y.addPrimitive('box' | 'sphere' | 'cylinder' | 'torus');
y.addHtmlNode('light' | 'dark');
y.select(mesh);
y.selectHtmlNodeById(id);
y.clearSelection();
y.removeSelected();
y.setMeshColor(mesh, '#ff3e00');
y.applyTransform(sel, 'px'|'py'|'pz'|'ry', value);
y.setNodeContent(id, 'title'|'body', text);
y.toJSON();
y.fromJSON(data);
y.dispose();
```

## Relation to `coffee.scene3d`

- **`scene3d`** — declarative viewport + shapes (demos).
- **`yay`** — **mutable** graph, **HTML overlays**, selection — keep separate; compose in apps if needed.

## See also

- **`FLAGSHIP/YAY-3D/YAY-ALPHA.html`** — product shell + `coffee.toast` / sliders.
