# COFFEE Shader Architecture

## Tri-Arc: Shadow → Shade → Shader

```
COFFEE-SHADOW (preset holder)  →  shade (engine)  →  shader (WGSL renders)
         ↓                            ↓                     ↓
   presets + config              receives, runs           pixel math
   in-house curated              pipeline
```

| Layer | Role |
|-------|------|
| **COFFEE-SHADOW** | In-house preset holder. Curated presets, passes config to shade. |
| **coffee-shade** | Headless engine. Receives config, runs pipeline, drives shader. No UI. |
| **shader** (WGSL) | Renders. Pure GPU math, outputs pixels. |

- **shadow** = preset layer (curated config)
- **shade** = engine (orchestrator)
- **shader** = renderer (GPU code)

Presets can be decoupled: `presets → shade → shader`. Shade receives preset + shader source from anywhere.

**Build order:** shader (POC) → shade → shadow → SHADE-DEMO

**COFFEE-SHADOW structure:**
```
COFFEE-SHADOW/
├── presets/liquid/
│   ├── default.json
│   ├── ocean.json
│   ├── plasma.json
│   └── intense.json
├── coffee-shadow.js
└── SHADOW-DEMO.html
```

**Folder layout:**
```
COFFEE-SHADE/   — coffee-shade.js, SHADE-DEMO.html
COFFEE-SHADER/  — WGSL, SHADER-DEMO, POC
COFFEE-SHADOW/  — presets, coffee-shadow.js, SHADOW-DEMO.html
```

**SHADER-DEMO:** Full demo in COFFEE-SHADER — shadow + shade + Coffee UI (nav, presets, JSON editor, live state).

**Layering (v2):** Presets use `layers` array. Modes: background, liquid, waves, lines. Blend: normal, add. Max 4 layers.

---

## Library / Modular Pipeline

Exactly. You've hit on the core architecture of a modern **Shader Engine**. 

To build out that library, you move away from hard-coded math and toward a **Modular Pipeline**. Here is how that "Library of Maps" works conceptually:

### 1. The "Logic Gate" Library
In the GPU code (`WGSL`), instead of one big math formula, we create a library of functions (like `getBackground()`, `getWave()`, `getRainbow()`). Your JSON then acts as a "Switchboard."

**The JSON Evolution:**
```json
{
  "layer_1": "liquid_plasma",
  "layer_2": "caustic_overlay",
  "color_palette": "sunset_vibe",
  "distortion": 0.8
}
```

### 2. How the GPU interprets the Library
Inside the `coffee.shade()` engine, we would expand the fragment shader to look like a series of modules. I've updated the code below to demonstrate this "Library" approach—adding a **Switchable Mode** system and **Color Presets** controlled entirely by your simple JSON parameters.

I've added a `mode` parameter. Try switching it from `0` (Liquid) to `1` (Waves) or `2` (Rainbow) in the JSON editor.


http://googleusercontent.com/immersive_entry_chip/0

### Why this structure is powerful:

1.  **The Library approach:** Notice the `liquid()`, `waves()`, and `rainbow()` functions inside the shader. They are like "presets."
2.  **The Switchboard:** The `if(u.mode < 0.5)` logic is how the simple JSON value `mode: 0.0` tells the complex GPU which mathematical universe to live in.
3.  **Parent Controls:** `brightness`, `speed`, and `tint` are "Global" parameters that affect *every* mode in the library.

**Next Level:** Eventually, you can make the JSON even more semantic. Instead of `mode: 0`, you could have the JavaScript map a string like `"type": "ocean"` to the number `1.0` before sending it to the GPU.

Does this library logic make sense for how you want to scale it?
