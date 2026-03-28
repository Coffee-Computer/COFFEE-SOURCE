/**
 * coffee.gpu() — Raw WebGPU 3D render engine.
 * Declarative shapes like scene2d/scene3d. No Three.js. Standalone.
 *
 * coffee.gpu({ canvas, shapes, camera, background, custom, container, width, height })
 *
 * shapes: [{ type: 'box'|'sphere', position, scale, rotation, color }]
 *   color: CSS string (#ff0000, rgb(), hsl(), etc.) or [r,g,b,a] 0-1
 * camera: { position, lookAt }
 * custom: (ctx) => {} — escape hatch; ctx = { device, queue, context, canvas, format }
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  // ─── Mat4 math ────────────────────────────────────────────────────────────
  const Mat4 = {
    create: () => new Float32Array(16),
    identity: (out) => {
      out.fill(0);
      out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1;
      return out;
    },
    perspective: (out, fovy, aspect, near, far) => {
      const f = 1.0 / Math.tan(fovy / 2);
      const nf = 1 / (near - far);
      out.fill(0);
      out[0] = f / aspect;
      out[5] = f;
      out[10] = (far + near) * nf;
      out[11] = -1;
      out[14] = (2 * far * near) * nf;
      return out;
    },
    translate: (out, a, v) => {
      out.set(a);
      out[12] = a[0] * v[0] + a[4] * v[1] + a[8] * v[2] + a[12];
      out[13] = a[1] * v[0] + a[5] * v[1] + a[9] * v[2] + a[13];
      out[14] = a[2] * v[0] + a[6] * v[1] + a[10] * v[2] + a[14];
      out[15] = a[3] * v[0] + a[7] * v[1] + a[11] * v[2] + a[15];
      return out;
    },
    scale: (out, a, v) => {
      const sx = v[0], sy = v[1], sz = v[2];
      out[0] = a[0] * sx; out[1] = a[1] * sx; out[2] = a[2] * sx; out[3] = a[3] * sx;
      out[4] = a[4] * sy; out[5] = a[5] * sy; out[6] = a[6] * sy; out[7] = a[7] * sy;
      out[8] = a[8] * sz; out[9] = a[9] * sz; out[10] = a[10] * sz; out[11] = a[11] * sz;
      out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
      return out;
    },
    rotate: (out, a, rad, axis) => {
      let x = axis[0], y = axis[1], z = axis[2];
      let len = Math.sqrt(x * x + y * y + z * z);
      if (len < 0.0001) return out;
      len = 1 / len; x *= len; y *= len; z *= len;
      const s = Math.sin(rad), c = Math.cos(rad), t = 1 - c;
      const b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s;
      const b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s;
      const b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;
      out[0] = a[0] * b00 + a[4] * b01 + a[8] * b02;
      out[1] = a[1] * b00 + a[5] * b01 + a[9] * b02;
      out[2] = a[2] * b00 + a[6] * b01 + a[10] * b02;
      out[3] = a[3] * b00 + a[7] * b01 + a[11] * b02;
      out[4] = a[0] * b10 + a[4] * b11 + a[8] * b12;
      out[5] = a[1] * b10 + a[5] * b11 + a[9] * b12;
      out[6] = a[2] * b10 + a[6] * b11 + a[10] * b12;
      out[7] = a[3] * b10 + a[7] * b11 + a[11] * b12;
      out[8] = a[0] * b20 + a[4] * b21 + a[8] * b22;
      out[9] = a[1] * b20 + a[5] * b21 + a[9] * b22;
      out[10] = a[2] * b20 + a[6] * b21 + a[10] * b22;
      out[11] = a[3] * b20 + a[7] * b21 + a[11] * b22;
      out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
      return out;
    },
    multiply: (out, a, b) => {
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
      const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
      const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
      const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
      for (let i = 0; i < 4; i++) {
        const b0 = b[i * 4], b1 = b[i * 4 + 1], b2 = b[i * 4 + 2], b3 = b[i * 4 + 3];
        out[i * 4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[i * 4 + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[i * 4 + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[i * 4 + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      }
      return out;
    },
    lookAt: (out, eye, center, up) => {
      const ex = eye[0], ey = eye[1], ez = eye[2];
      const cx = center[0], cy = center[1], cz = center[2];
      const ux = up[0], uy = up[1], uz = up[2];
      let z0 = ex - cx, z1 = ey - cy, z2 = ez - cz;
      let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
      z0 *= len; z1 *= len; z2 *= len;
      let x0 = uy * z2 - uz * z1, x1 = uz * z0 - ux * z2, x2 = ux * z1 - uy * z0;
      len = 1 / Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
      x0 *= len; x1 *= len; x2 *= len;
      const y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
      out[0] = x0; out[4] = x1; out[8] = x2; out[12] = -(x0 * ex + x1 * ey + x2 * ez);
      out[1] = y0; out[5] = y1; out[9] = y2; out[13] = -(y0 * ex + y1 * ey + y2 * ez);
      out[2] = z0; out[6] = z1; out[10] = z2; out[14] = -(z0 * ex + z1 * ey + z2 * ez);
      out[3] = 0; out[7] = 0; out[11] = 0; out[15] = 1;
      return out;
    }
  };

  // ─── Parse CSS color to [r,g,b,a] 0-1 ─────────────────────────────────────
  function parseColor(c) {
    if (Array.isArray(c) && c.length >= 3) {
      return [c[0] ?? 1, c[1] ?? 1, c[2] ?? 1, c[3] ?? 1];
    }
    if (typeof c !== 'string') return [0.3, 0.6, 1, 1];
    try {
      const cv = document.createElement('canvas');
      cv.width = 1; cv.height = 1;
      const ctx = cv.getContext('2d');
      if (!ctx) return [0.3, 0.6, 1, 1];
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r / 255, g / 255, b / 255, a / 255];
    } catch {
      return [0.3, 0.6, 1, 1];
    }
  }

  // ─── Geometry: box (cube) ──────────────────────────────────────────────────
  const CUBE_POS = new Float32Array([
    -1, -1, 1, 1,  1, -1, 1, 1,  1, 1, 1, 1,  -1, 1, 1, 1,
    -1, -1, -1, 1,  1, -1, -1, 1,  1, 1, -1, 1,  -1, 1, -1, 1
  ]);
  const CUBE_IDX = new Uint16Array([
    0, 1, 2, 2, 3, 0, 1, 5, 6, 6, 2, 1, 5, 4, 7, 7, 6, 5,
    4, 0, 3, 3, 7, 4, 3, 2, 6, 6, 7, 3, 4, 5, 1, 1, 0, 4
  ]);

  function makeBoxVertices(color) {
    const [r, g, b, a] = parseColor(color);
    const out = new Float32Array(8 * 8); // 8 verts, 8 floats each (pos4 + col4)
    const cols = [r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a];
    for (let i = 0; i < 8; i++) {
      out[i * 8 + 0] = CUBE_POS[i * 4 + 0];
      out[i * 8 + 1] = CUBE_POS[i * 4 + 1];
      out[i * 8 + 2] = CUBE_POS[i * 4 + 2];
      out[i * 8 + 3] = CUBE_POS[i * 4 + 3];
      out[i * 8 + 4] = cols[0];
      out[i * 8 + 5] = cols[1];
      out[i * 8 + 6] = cols[2];
      out[i * 8 + 7] = cols[3];
    }
    return { vertices: out, indices: CUBE_IDX };
  }

  // ─── Geometry: icosphere (unit sphere) ─────────────────────────────────────
  function makeIcosphere(radius, color, subdivisions) {
    const t = (1 + Math.sqrt(5)) / 2;
    let verts = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];
    let faces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];
    const normalize = (v) => {
      const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      return [v[0] / len, v[1] / len, v[2] / len];
    };
    verts = verts.map(normalize);
    const sub = Math.max(0, Math.min(subdivisions ?? 1, 3));
    for (let s = 0; s < sub; s++) {
      const newFaces = [];
      const mid = {};
      const getMid = (a, b) => {
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (!mid[key]) {
          const va = verts[a], vb = verts[b];
          const v = normalize([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2]);
          mid[key] = verts.length;
          verts.push(v);
        }
        return mid[key];
      };
      for (const [a, b, c] of faces) {
        const mab = getMid(a, b), mbc = getMid(b, c), mca = getMid(c, a);
        newFaces.push([a, mab, mca], [b, mbc, mab], [c, mca, mbc], [mab, mbc, mca]);
      }
      faces = newFaces;
    }
    const [r, g, b, a] = parseColor(color);
    const vertices = new Float32Array(verts.length * 8);
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i];
      vertices[i * 8 + 0] = v[0] * radius;
      vertices[i * 8 + 1] = v[1] * radius;
      vertices[i * 8 + 2] = v[2] * radius;
      vertices[i * 8 + 3] = 1;
      vertices[i * 8 + 4] = r;
      vertices[i * 8 + 5] = g;
      vertices[i * 8 + 6] = b;
      vertices[i * 8 + 7] = a;
    }
    const indices = new Uint16Array(faces.flat());
    return { vertices, indices };
  }

  // ─── WGSL shader ──────────────────────────────────────────────────────────
  const SHADER = `
    struct Uniforms { mvp : mat4x4<f32> };
    @binding(0) @group(0) var<uniform> uniforms : Uniforms;
    struct Out { @builtin(position) pos: vec4<f32>, @location(0) color: vec4<f32> };
    @vertex fn vs(@location(0) p: vec4<f32>, @location(1) c: vec4<f32>) -> Out {
      var out: Out;
      out.pos = uniforms.mvp * p;
      out.color = c;
      return out;
    }
    @fragment fn fs(@location(0) c: vec4<f32>) -> @location(0) vec4<f32> { return c; }
  `;

  coffee.gpu = function (opts = {}) {
    const {
      canvas: canvasInput,
      shapes = [],
      camera: camOpts = {},
      background = [0.05, 0.05, 0.05, 1],
      custom: customFn,
      container: containerSel,
      width = 400,
      height = 300
    } = opts;

    const bg = Array.isArray(background) ? background : parseColor(background);
    const camPos = camOpts.position || [0, 0, 7];
    const camLook = camOpts.lookAt || [0, 0, 0];
    const camUp = camOpts.up || [0, 1, 0];

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-coffee', 'gpu');
    wrapper.style.cssText = 'position:relative;width:100%;min-height:' + height + 'px;aspect-ratio:' + width + '/' + height + ';background:#0a0a0a;border-radius:var(--coffee-radius-sm,8px);overflow:hidden';

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    wrapper.appendChild(canvas);

    let device = null;
    let context = null;
    let format = null;
    let pipeline = null;
    let depthTex = null;
    let uniformBuf = null;
    let meshData = [];
    let isRunning = false;
    let rafId = null;

    const ctx = { device, queue: null, context, canvas, format };
    wrapper.gpu = ctx;

    function buildModelMatrix(spec, t = 0) {
      const pos = spec.position || [0, 0, 0];
      const scale = spec.scale ?? 1;
      const s = Array.isArray(scale) ? scale : [scale, scale, scale];
      const rot = spec.rotation || [0, 0, 0];
      const speed = spec.rotationSpeed || [0, 0, 0];
      const rx = (rot[0] ?? 0) + speed[0] * t;
      const ry = (rot[1] ?? 0) + speed[1] * t;
      const rz = (rot[2] ?? 0) + speed[2] * t;
      let M = Mat4.identity(Mat4.create());
      M = Mat4.scale(Mat4.create(), M, s);
      M = Mat4.rotate(Mat4.create(), M, rx * Math.PI / 180, [1, 0, 0]);
      M = Mat4.rotate(Mat4.create(), M, ry * Math.PI / 180, [0, 1, 0]);
      M = Mat4.rotate(Mat4.create(), M, rz * Math.PI / 180, [0, 0, 1]);
      M = Mat4.translate(Mat4.create(), M, pos);
      return M;
    }

    async function init() {
      if (!navigator.gpu) {
        const err = document.createElement('div');
        err.style.cssText = 'padding:24px;color:#ef4444;background:#1a1a1a;border-radius:8px';
        err.textContent = 'coffee.gpu: WebGPU not supported in this browser';
        wrapper.appendChild(err);
        return false;
      }

      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        const err = document.createElement('div');
        err.style.cssText = 'padding:24px;color:#ef4444;background:#1a1a1a;border-radius:8px';
        err.textContent = 'coffee.gpu: No WebGPU adapter';
        wrapper.appendChild(err);
        return false;
      }

      device = await adapter.requestDevice();
      context = canvas.getContext('webgpu');
      format = navigator.gpu.getPreferredCanvasFormat();

      ctx.device = device;
      ctx.queue = device.queue;

      uniformBuf = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

      const module = device.createShaderModule({ code: SHADER });
      pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module,
          entryPoint: 'vs',
          buffers: [{
            arrayStride: 32,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x4' },
              { shaderLocation: 1, offset: 16, format: 'float32x4' }
            ]
          }]
        },
        fragment: { module, entryPoint: 'fs', targets: [{ format }] },
        primitive: { topology: 'triangle-list', cullMode: 'back' },
        depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' }
      });

      for (const spec of shapes) {
        const { type, position, scale, rotation, color, radius } = spec;
        let geom;
        if (type === 'sphere') {
          geom = makeIcosphere(radius ?? 1, color || '#4c9aff', 1);
        } else {
          geom = makeBoxVertices(color || '#4c9aff');
        }
        const vBuf = device.createBuffer({
          size: geom.vertices.byteLength,
          usage: GPUBufferUsage.VERTEX,
          mappedAtCreation: true
        });
        new Float32Array(vBuf.getMappedRange()).set(geom.vertices);
        vBuf.unmap();

        const iBuf = device.createBuffer({
          size: geom.indices.byteLength,
          usage: GPUBufferUsage.INDEX,
          mappedAtCreation: true
        });
        new Uint16Array(iBuf.getMappedRange()).set(geom.indices);
        iBuf.unmap();

        meshData.push({
          spec,
          vBuf,
          iBuf,
          indexCount: geom.indices.length,
          buildModel: (t) => buildModelMatrix(spec, t)
        });
      }

      if (typeof customFn === 'function') customFn(ctx);

      return true;
    }

    function loop() {
      if (!isRunning || !device || !context) return;

      const w = Math.max(1, canvas.clientWidth * (window.devicePixelRatio || 1));
      const h = Math.max(1, canvas.clientHeight * (window.devicePixelRatio || 1));

      if (!depthTex || canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        context.configure({ device, format, alphaMode: 'opaque' });
        depthTex = device.createTexture({
          size: [w, h],
          format: 'depth24plus',
          usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
      }

      const aspect = w / h;
      const proj = Mat4.perspective(Mat4.create(), Math.PI / 4, aspect, 0.1, 100);
      const view = Mat4.lookAt(Mat4.create(), camPos, camLook, camUp);
      const viewProj = Mat4.multiply(Mat4.create(), proj, view);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          clearValue: { r: bg[0], g: bg[1], b: bg[2], a: bg[3] },
          loadOp: 'clear',
          storeOp: 'store'
        }],
        depthStencilAttachment: depthTex ? {
          view: depthTex.createView(),
          depthClearValue: 1,
          depthLoadOp: 'clear',
          depthStoreOp: 'store'
        } : undefined
      });

      pass.setPipeline(pipeline);

      const t = performance.now() / 1000;
      for (const mesh of meshData) {
        const model = mesh.buildModel(t);
        const mvp = Mat4.multiply(Mat4.create(), viewProj, model);
        device.queue.writeBuffer(uniformBuf, 0, mvp);

        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [{ binding: 0, resource: { buffer: uniformBuf } }]
        });
        pass.setBindGroup(0, bindGroup);
        pass.setVertexBuffer(0, mesh.vBuf);
        pass.setIndexBuffer(mesh.iBuf, 'uint16');
        pass.drawIndexed(mesh.indexCount);
      }

      pass.end();
      device.queue.submit([encoder.finish()]);

      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (!isRunning) {
        isRunning = true;
        loop();
      }
    }

    function stop() {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    init().then((ok) => {
      if (ok) start();
    });

    wrapper.gpu.start = start;
    wrapper.gpu.stop = stop;

    if (containerSel) {
      const el = typeof containerSel === 'string' ? document.querySelector(containerSel) : containerSel;
      if (el) el.appendChild(wrapper);
      return wrapper;
    }
    return wrapper;
  };

  window.coffee = coffee;
})();
