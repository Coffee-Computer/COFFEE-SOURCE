# coffee.scene3d()

Declarative 3D scene. Load after coffee-ui. Requires Three.js + OrbitControls (optional).

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="coffee-ui.js"></script>
<script src="coffee-scene3d.js"></script>
```

```js
const view = coffee.scene3d({
  shapes: [
    { type: 'box', scale: 2, position: [0, 1, 0] },
    { type: 'sphere', radius: 1, position: [2, 0, 0], color: '#ff0000' },
    { type: 'cylinder', radiusTop: 0.5, radiusBottom: 1, height: 2, position: [-2, 1, 0] },
    { type: 'torus', radius: 1, tube: 0.3, position: [0, 1.5, 0] },
    { type: 'cone', radius: 1, height: 2, position: [2, 1, -1] },
    { type: 'plane', width: 10, height: 10, position: [0, 0, 0] }
  ],
  camera: { position: [0, 5, 10], lookAt: [0, 0, 0] },
  background: 'skyblue',
  controls: 'orbit',
  custom: (ctx) => {
    ctx.scene.add(new ctx.THREE.GridHelper(10, 10));
  },
  width: 400,
  height: 300
});
document.getElementById('app').appendChild(view);
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| shapes | `[]` | `[{ type, position, scale, rotation, color }]` |
| camera | — | `{ position, lookAt }` |
| background | `'#0a0a0a'` | Scene background (hex or CSS color name) |
| controls | `'orbit'` | `'orbit'` for drag-to-rotate, or `false` |
| custom | — | `(ctx) => {}` — escape hatch; ctx = `{ scene, camera, renderer, THREE, controls }` |
| lights | auto | `[{ type: 'ambient'|'directional', ... }]` |
| container | — | Selector or element to mount into |
| width | 400 | Scene width |
| height | 300 | Scene height |

## Shape types

- **box** — `scale` (number or [x,y,z]), `position`, `rotation`, `color`
- **sphere** — `radius`, `position`, `scale`, `rotation`, `color`
- **plane** — `width`, `height`, `position`, `rotation`, `color`
- **cylinder** — `radiusTop`, `radiusBottom`, `height`, `radialSegments`, `position`, `rotation`, `color`
- **torus** — `radius`, `tube`, `radialSegments`, `tubularSegments`, `position`, `rotation`, `color`
- **cone** — `radius`, `height`, `position`, `rotation`, `color`

## Escape hatch

`custom: (ctx) => {}` runs after the scene is built. Use raw Three.js:

```js
custom: (ctx) => {
  const mesh = new ctx.THREE.Mesh(
    new ctx.THREE.TorusKnotGeometry(1, 0.3, 100, 16),
    new ctx.THREE.MeshStandardMaterial({ color: 'hotpink' })
  );
  ctx.scene.add(mesh);
}
```

Or mutate later via `view.scene3d`:

```js
const view = coffee.scene3d({ shapes: [...] });
view.scene3d.scene.add(someMesh);
```
