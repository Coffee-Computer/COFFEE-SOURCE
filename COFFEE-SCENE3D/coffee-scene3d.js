/**
 * coffee.scene3d() — Declarative 3D scene. Load after coffee-ui.
 * Requires Three.js + OrbitControls (optional). See README for script tags.
 *
 * coffee.scene3d({ shapes, camera, lights, background, controls, custom, container, width, height })
 *
 * shapes: [{ type, position, scale, rotation, color }]
 *   type: 'box' | 'sphere' | 'plane' | 'cylinder' | 'torus' | 'cone'
 * custom: (ctx) => {} — escape hatch; ctx = { scene, camera, renderer, THREE }
 * wrapper.scene3d — same ctx for later mutation
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  coffee.scene3d = function (opts = {}) {
    const THREE = window.THREE;
    if (!THREE) {
      const err = document.createElement('div');
      err.style.cssText = 'padding:24px;color:#ef4444;background:#1a1a1a;border-radius:8px';
      err.textContent = 'coffee.scene3d requires Three.js. Add: <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"><\/script>';
      return err;
    }

    const {
      shapes = [],
      camera: camOpts = {},
      lights: lightOpts = [],
      background = '#0a0a0a',
      controls: controlsOpt = 'orbit',
      custom: customFn,
      container: containerSel,
      width = 400,
      height = 300
    } = opts;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-coffee', 'scene3d');
    wrapper.style.cssText = 'position:relative;width:100%;min-height:' + height + 'px;aspect-ratio:' + width + '/' + height + ';background:' + background + ';border-radius:var(--coffee-radius-sm,8px);overflow:hidden';

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    wrapper.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.1,
      1000
    );
    camera.position.set(
      camOpts.position?.[0] ?? 0,
      camOpts.position?.[1] ?? 5,
      camOpts.position?.[2] ?? 10
    );
    const lookAt = camOpts.lookAt || [0, 0, 0];
    camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function vec3(arr) {
      if (!arr || !Array.isArray(arr)) return new THREE.Vector3(0, 0, 0);
      return new THREE.Vector3(arr[0] ?? 0, arr[1] ?? 0, arr[2] ?? 0);
    }

    function createMesh(spec) {
      const { type, position, scale, rotation, color } = spec;
      let geometry;
      if (type === 'box') {
        const s = scale ?? 1;
        const sz = Array.isArray(s) ? s : [s, s, s];
        geometry = new THREE.BoxGeometry(sz[0], sz[1], sz[2]);
      } else if (type === 'sphere') {
        geometry = new THREE.SphereGeometry(spec.radius ?? 1, 32, 32);
      } else if (type === 'plane') {
        geometry = new THREE.PlaneGeometry(spec.width ?? 10, spec.height ?? 10);
        if (spec.rotation === undefined) spec.rotation = [-90, 0, 0];
      } else if (type === 'cylinder') {
        geometry = new THREE.CylinderGeometry(
          spec.radiusTop ?? 1,
          spec.radiusBottom ?? 1,
          spec.height ?? 2,
          spec.radialSegments ?? 32
        );
      } else if (type === 'torus') {
        geometry = new THREE.TorusGeometry(
          spec.radius ?? 1,
          spec.tube ?? 0.3,
          spec.radialSegments ?? 16,
          spec.tubularSegments ?? 48
        );
      } else if (type === 'cone') {
        geometry = new THREE.CylinderGeometry(0, spec.radius ?? 1, spec.height ?? 2, 32);
      } else {
        geometry = new THREE.BoxGeometry(1, 1, 1);
      }

      const material = new THREE.MeshStandardMaterial({
        color: color || 0x4c9aff
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(vec3(position));
      mesh.rotation.set(
        (rotation?.[0] ?? 0) * Math.PI / 180,
        (rotation?.[1] ?? 0) * Math.PI / 180,
        (rotation?.[2] ?? 0) * Math.PI / 180
      );
      if (scale !== undefined && type !== 'box') {
        const s = Array.isArray(scale) ? scale : [scale, scale, scale];
        mesh.scale.set(s[0], s[1], s[2]);
      }
      return mesh;
    }

    for (const spec of shapes) {
      scene.add(createMesh(spec));
    }

    if (lightOpts.length === 0) {
      scene.add(new THREE.AmbientLight(0x404040, 0.6));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 10, 5);
      scene.add(dirLight);
    } else {
      for (const L of lightOpts) {
        if (L.type === 'ambient') {
          scene.add(new THREE.AmbientLight(L.color || 0xffffff, L.intensity ?? 0.5));
        } else if (L.type === 'directional') {
          const light = new THREE.DirectionalLight(L.color || 0xffffff, L.intensity ?? 1);
          light.position.copy(vec3(L.position || [5, 10, 5]));
          scene.add(light);
        }
      }
    }

    let orbitControls = null;
    if (controlsOpt === 'orbit' && THREE.OrbitControls) {
      orbitControls = new THREE.OrbitControls(camera, canvas);
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.05;
    }

    const ctx = { scene, camera, renderer, THREE, controls: orbitControls };
    wrapper.scene3d = ctx;
    if (typeof customFn === 'function') customFn(ctx);

    function resize() {
      const rect = wrapper.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : width;
      const h = rect.height > 0 ? rect.height : height;
      if (w > 0 && h > 0) {
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      if (!wrapper.isConnected) return;
      resize();
      if (orbitControls) orbitControls.update();
      renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', resize);

    if (containerSel) {
      const el = typeof containerSel === 'string' ? document.querySelector(containerSel) : containerSel;
      if (el) el.appendChild(wrapper);
      return wrapper;
    }
    return wrapper;
  };

  window.coffee = coffee;
})();
