/**
 * coffee.shade — Headless WebGPU shader engine.
 * Supports layered config: layers[] with mode, opacity, blend, params.
 * Backward compat: flat params → single liquid layer.
 *
 * coffee.shade(opts) — opts: { canvas, config, shader }
 * config: { layers: [...] } or flat { density, color_shift, ... }
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const MODE_BACKGROUND = 0;
  const MODE_LIQUID = 1;
  const MODE_WAVES = 2;
  const MODE_LINES = 3;
  const BLEND_NORMAL = 0;
  const BLEND_ADD = 1;

  const LAYERED_SHADER = `
    @group(0) @binding(0) var<uniform> u: array<f32, 64>;

    fn get_layer(i: u32) -> array<f32, 9> {
      let off = 4u + i * 9u;
      return array<f32, 9>(
        u[off], u[off+1u], u[off+2u], u[off+3u], u[off+4u],
        u[off+5u], u[off+6u], u[off+7u], u[off+8u]
      );
    }

    fn layer_background(p: array<f32, 9>) -> vec4<f32> {
      return vec4<f32>(p[3], p[4], p[5], 1.0);
    }

    fn layer_liquid(uv: vec2<f32>, t: f32, p: array<f32, 9>) -> vec4<f32> {
      let res = vec2<f32>(u[1], u[2]);
      let aspect = res.x / res.y;
      let den = p[3]; let shift = p[4]; let zoom = max(p[5], 0.01);
      let spd = p[6]; let comp = p[7]; let bright = p[8];
      var pt = uv * vec2<f32>(aspect, 1.0) * (1.0 / zoom);

      for(var i = 1.0; i < 10.0; i += 1.0) {
        if (i > comp) { break; }
        pt.x += 0.5 / i * sin(i * den * pt.y + t * spd);
        pt.y += 0.5 / i * cos(i * den * pt.x + t * spd);
      }

      let r = 0.5 + 0.5 * sin(pt.x + t * shift);
      let g = 0.5 + 0.5 * cos(pt.y + t);
      let b = 0.5 + 0.5 * sin(pt.x + pt.y + t);
      return vec4<f32>(vec3<f32>(r, g, b) * bright, 1.0);
    }

    fn layer_waves(uv: vec2<f32>, t: f32, p: array<f32, 9>) -> vec4<f32> {
      let freq = p[3] * 10.0;
      let spd = p[5];
      let v = 0.5 + 0.5 * sin(uv.x * freq + t * spd) * cos(uv.y * freq * 0.7 + t * spd * 0.8);
      return vec4<f32>(v * 0.3, v * 0.5, v, 1.0);
    }

    fn layer_lines(uv: vec2<f32>, t: f32, p: array<f32, 9>) -> vec4<f32> {
      let grid = p[3] * 20.0;
      let thick = p[4] * 0.1;
      let px = uv.x * grid;
      let py = uv.y * grid;
      let fx = abs(fract(px) - 0.5);
      let fy = abs(fract(py) - 0.5);
      let line = 1.0 - smoothstep(thick, thick + 0.02, min(fx, fy));
      return vec4<f32>(line * 0.8, line * 0.9, line, 1.0);
    }

    fn eval_layer(uv: vec2<f32>, t: f32, p: array<f32, 9>) -> vec4<f32> {
      let mode = p[0];
      if (mode < 0.5) { return layer_background(p); }
      if (mode < 1.5) { return layer_liquid(uv, t, p); }
      if (mode < 2.5) { return layer_waves(uv, t, p); }
      return layer_lines(uv, t, p);
    }

    fn blend_colors(base: vec4<f32>, over: vec4<f32>, blendMode: f32) -> vec4<f32> {
      if (blendMode < 0.5) {
        return mix(base, over, over.a);
      }
      return base + over * over.a;
    }

    @vertex
    fn vs(@builtin(vertex_index) i : u32) -> @builtin(position) vec4<f32> {
      var p = array<vec2<f32>, 3>(vec2(-1.,-1.), vec2(3.,-1.), vec2(-1.,3.));
      return vec4<f32>(p[i], 0.0, 1.0);
    }

    @fragment
    fn fs(@builtin(position) pos : vec4<f32>) -> @location(0) vec4<f32> {
      let res = vec2<f32>(u[1], u[2]);
      let uv = (pos.xy / res) * 2.0 - 1.0;
      let t = u[0];
      let layer_count = u[3];
      var color = vec4<f32>(0.0, 0.0, 0.0, 1.0);

      for (var i = 0u; i < 4u; i++) {
        if (f32(i) >= layer_count) { break; }
        let p = get_layer(i);
        let c = eval_layer(uv, t, p);
        let opacity = p[1];
        let blendMode = p[2];
        let blended = blend_colors(color, c * opacity, blendMode);
        color = blended;
      }

      return color;
    }
  `;

  function normalizeConfig(config) {
    if (config.layers && Array.isArray(config.layers)) {
      return { layers: config.layers };
    }
    const p = config;
    return {
      layers: [{
        mode: 'liquid',
        opacity: 1,
        blend: 'normal',
        params: {
          density: p.density ?? 5,
          color_shift: p.color_shift ?? 1,
          zoom: p.zoom ?? 1,
          speed: p.speed ?? 1,
          brightness: p.brightness ?? 1,
          complexity: p.complexity ?? 4
        }
      }]
    };
  }

  function packLayer(layer) {
    const m = layer.mode;
    const modeId = m === 'background' ? MODE_BACKGROUND : m === 'liquid' ? MODE_LIQUID : m === 'waves' ? MODE_WAVES : MODE_LINES;
    const blendId = (layer.blend === 'add') ? BLEND_ADD : BLEND_NORMAL;
    const p = layer.params || {};
    const opacity = Math.max(0, Math.min(1, layer.opacity ?? 1));

    if (modeId === MODE_BACKGROUND) {
      const c = p.color || [0.05, 0.05, 0.12];
      return [modeId, opacity, blendId, c[0] ?? 0.05, c[1] ?? 0.05, c[2] ?? 0.12, 0, 0, 0];
    }
    if (modeId === MODE_LIQUID) {
      return [
        modeId, opacity, blendId,
        p.density ?? 5, p.color_shift ?? 1, p.zoom ?? 1,
        p.speed ?? 1, p.complexity ?? 4, p.brightness ?? 1
      ];
    }
    if (modeId === MODE_WAVES) {
      return [
        modeId, opacity, blendId,
        p.frequency ?? 8, p.amplitude ?? 0.3, p.speed ?? 1,
        0, 0, 0
      ];
    }
    if (modeId === MODE_LINES) {
      return [
        modeId, opacity, blendId,
        p.grid ?? 20, p.thickness ?? 0.02, 0,
        0, 0, 0
      ];
    }
    return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  function packBuffer(layers, t, w, h) {
    const floatsPerLayer = 9;
    const headerFloats = 4;
    const arr = new Float32Array(headerFloats + 4 * floatsPerLayer);
    arr[0] = t / 1000;
    arr[1] = w;
    arr[2] = h;
    arr[3] = Math.min(4, layers.length);

    for (let i = 0; i < 4; i++) {
      const layer = layers[i] || { mode: 'background', opacity: 0, params: { color: [0, 0, 0] } };
      const packed = packLayer(layer);
      const off = headerFloats + i * floatsPerLayer;
      for (let j = 0; j < floatsPerLayer; j++) arr[off + j] = packed[j];
    }

    return arr;
  }

  const UNIFORM_SIZE = 64 * 4;

  coffee.shade = function (opts = {}) {
    const { canvas: canvasInput, config = {}, shader: shaderSource = LAYERED_SHADER } = opts;

    let device = null;
    let context = null;
    let pipeline = null;
    let bindGroup = null;
    let uniformBuffer = null;
    let canvas = null;
    let isRunning = false;
    let normalized = normalizeConfig(config);

    function resolveCanvas() {
      if (!canvasInput) return null;
      canvas = typeof canvasInput === 'string' ? document.querySelector(canvasInput) : canvasInput;
      return canvas;
    }

    async function init() {
      if (!navigator.gpu) {
        console.warn('coffee.shade: WebGPU not supported');
        return false;
      }

      if (!resolveCanvas()) {
        console.warn('coffee.shade: No canvas');
        return false;
      }

      const adapter = await navigator.gpu.requestAdapter();
      device = await adapter.requestDevice();
      context = canvas.getContext('webgpu');

      context.configure({
        device,
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: 'premultiplied'
      });

      uniformBuffer = device.createBuffer({
        size: UNIFORM_SIZE,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });

      const module = device.createShaderModule({ code: shaderSource });
      pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module, entryPoint: 'vs' },
        fragment: {
          module,
          entryPoint: 'fs',
          targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
        }
      });

      bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
      });

      return true;
    }

    function render(t) {
      if (!device || !pipeline || !isRunning) return;

      const rect = canvas.getBoundingClientRect();
      const w = (canvas.width = rect.width * (window.devicePixelRatio || 1));
      const h = (canvas.height = rect.height * (window.devicePixelRatio || 1));

      const bufferData = packBuffer(normalized.layers, t, w, h);
      device.queue.writeBuffer(uniformBuffer, 0, bufferData);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: 'clear',
          storeOp: 'store'
        }]
      });

      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();

      device.queue.submit([encoder.finish()]);
      requestAnimationFrame(render);
    }

    return {
      async start() {
        const ok = await init();
        if (!ok) return false;
        isRunning = true;
        requestAnimationFrame(render);
        return true;
      },

      stop() {
        isRunning = false;
      },

      update(newConfig) {
        if (newConfig.layers) {
          normalized = { layers: newConfig.layers };
        } else {
          const flat = (normalized.layers && normalized.layers[0]?.params) || {};
          normalized = normalizeConfig({ ...flat, ...newConfig });
        }
      },

      get config() {
        return { layers: normalized.layers };
      },

      get isRunning() {
        return isRunning;
      },

      version: '2.0'
    };
  };

  window.coffee = coffee;
})();
