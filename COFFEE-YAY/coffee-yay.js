/**
 * coffee.yay — Spatial 3D “website builder” core (Three.js).
 * Scene graph: meshes + HTML nodes projected onto the viewport.
 *
 * Requires: window.THREE (e.g. r128 build/three.min.js)
 * Load: coffee-control (opt) → coffee-ui (opt) → three → coffee-yay.js
 *
 * const y = coffee.yay({ viewport: '#vp', onSelectionChange, onSceneChange });
 * y.addPrimitive('box'); y.addHtmlNode('light'); y.select(mesh); y.dispose();
 */

(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || (window.coffee = {});

  const PRIMITIVES = ['box', 'sphere', 'cylinder', 'torus'];

  function uid() {
    return 'node-' + Math.random().toString(36).slice(2, 7);
  }

  /**
   * @param {object} opts
   * @param {HTMLElement|string} opts.viewport
   * @param {number} [opts.accent=0xff3e00]
   * @param {number|string} [opts.background=0x080808]
   * @param {boolean} [opts.addInitialBox=true]
   * @param {function(object|null):void} [opts.onSelectionChange]
   * @param {function():void} [opts.onSceneChange]
   */
  coffee.yay = function (opts) {
    opts = opts || {};
    const THREE = window.THREE;
    if (!THREE) {
      console.warn('coffee.yay: load Three.js first');
      return null;
    }

    const viewport =
      typeof opts.viewport === 'string'
        ? document.querySelector(opts.viewport)
        : opts.viewport;
    if (!viewport) {
      console.warn('coffee.yay: viewport missing');
      return null;
    }

    const accent = opts.accent != null ? opts.accent : 0xff3e00;
    const bg = opts.background != null ? opts.background : 0x080808;
    const onSelectionChange = typeof opts.onSelectionChange === 'function' ? opts.onSelectionChange : function () {};
    const onSceneChange = typeof opts.onSceneChange === 'function' ? opts.onSceneChange : function () {};

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bg);

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const cameraAngle = { phi: Math.PI / 4, theta: Math.PI / 4, radius: 8 };

    function updateCameraPosition() {
      const r = cameraAngle.radius;
      const ph = cameraAngle.phi;
      const th = cameraAngle.theta;
      camera.position.x = r * Math.sin(ph) * Math.cos(th);
      camera.position.y = r * Math.cos(ph);
      camera.position.z = r * Math.sin(ph) * Math.sin(th);
      camera.lookAt(0, 0, 0);
    }
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    viewport.style.position = viewport.style.position || 'relative';
    viewport.appendChild(renderer.domElement);

    const overlay = document.createElement('div');
    overlay.setAttribute('data-coffee-yay-overlay', '');
    overlay.style.cssText =
      'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:10';
    viewport.appendChild(overlay);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 10, 7);
    scene.add(directional);

    const grid = new THREE.GridHelper(20, 20, 0x333333, 0x111111);
    scene.add(grid);

    const clock = new THREE.Clock();
    const meshes = [];
    const htmlNodes = [];
    let selected = null;
    let rafId = null;
    let running = false;

    let isDragging = false;

    function handleMouseMove(e) {
      if (!isDragging) return;
      cameraAngle.theta -= e.movementX * 0.01;
      cameraAngle.phi -= e.movementY * 0.01;
      cameraAngle.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAngle.phi));
      updateCameraPosition();
    }

    function handleWheel(e) {
      e.preventDefault();
      cameraAngle.radius += e.deltaY * 0.005;
      cameraAngle.radius = Math.max(2, Math.min(20, cameraAngle.radius));
      updateCameraPosition();
    }

    function onResize() {
      const w = viewport.clientWidth | 0;
      const h = viewport.clientHeight | 0;
      if (w < 1 || h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    function meshGeometry(type) {
      switch (type) {
        case 'box':
          return new THREE.BoxGeometry(1, 1, 1);
        case 'sphere':
          return new THREE.SphereGeometry(0.7, 32, 32);
        case 'cylinder':
          return new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32);
        case 'torus':
          return new THREE.TorusGeometry(0.5, 0.2, 16, 100);
        default:
          return new THREE.BoxGeometry(1, 1, 1);
      }
    }

    function notifyScene() {
      onSceneChange();
    }

    function notifySelection() {
      onSelectionChange(selected);
    }

    function makeHtmlSelectionProxy(node) {
      const rot = {};
      Object.defineProperty(rot, 'y', {
        get: function () {
          return node.rotationY || 0;
        },
        set: function (v) {
          node.rotationY = v;
        },
        configurable: true,
        enumerable: true
      });
      return {
        id: node.id,
        name: node.title,
        isNode: true,
        title: node.title,
        body: node.body,
        position: node.position,
        rotation: rot
      };
    }

    function renderHtmlDom() {
      overlay.innerHTML = '';
      htmlNodes.forEach(function (node) {
        const wrap = document.createElement('div');
        wrap.id = node.id;
        wrap.className = 'yay-html-overlay';
        wrap.style.cssText =
          'position:absolute;pointer-events:none;user-select:none;transform:translate(-50%,-50%)';
        const card = document.createElement('div');
        card.className = 'yay-content-card' + (node.style === 'dark' ? ' yay-content-card-dark' : '');
        card.style.pointerEvents = 'auto';
        card.innerHTML =
          '<h2 class="yay-card-title">' +
          escapeHtml(node.title) +
          '</h2><p class="yay-card-body">' +
          escapeHtml(node.body) +
          '</p><div class="yay-card-actions"><button type="button" class="yay-card-btn yay-card-btn-primary">View Repo</button><button type="button" class="yay-card-btn yay-card-btn-ghost">Details</button></div>';
        wrap.appendChild(card);
        overlay.appendChild(wrap);
      });
    }

    function escapeHtml(s) {
      const d = document.createElement('div');
      d.textContent = s == null ? '' : String(s);
      return d.innerHTML;
    }

    function updateHtmlPositions() {
      const cw = renderer.domElement.clientWidth;
      const ch = renderer.domElement.clientHeight;
      htmlNodes.forEach(function (node) {
        const el = document.getElementById(node.id);
        if (!el) return;
        const v = node.position.clone();
        v.project(camera);
        const x = (v.x * 0.5 + 0.5) * cw;
        const y = (v.y * -0.5 + 0.5) * ch;
        if (v.z < 1) {
          el.style.display = 'block';
          el.style.left = x + 'px';
          el.style.top = y + 'px';
          const dist = camera.position.distanceTo(node.position);
          const scale = Math.max(0.3, 10 / (dist + 5));
          el.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
          el.style.opacity = dist > 15 ? '0' : '1';
        } else {
          el.style.display = 'none';
        }
      });
    }

    function tick() {
      if (!running) return;
      rafId = requestAnimationFrame(tick);
      onResize();
      const t = clock.getElapsedTime();
      meshes.forEach(function (obj, i) {
        if (obj !== selected) {
          obj.rotation.y += 0.005;
          obj.position.y += Math.sin(t + i) * 0.001;
        }
      });
      updateHtmlPositions();
      renderer.render(scene, camera);
    }

    function onMouseDown() {
      isDragging = true;
    }
    function onMouseUp() {
      isDragging = false;
    }

    viewport.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    viewport.addEventListener('mousemove', handleMouseMove);
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', onResize);

    function select(sel) {
      selected = sel || null;
      notifySelection();
    }

    function addPrimitive(type) {
      const t = PRIMITIVES.indexOf(type) >= 0 ? type : 'box';
      const mat = new THREE.MeshStandardMaterial({
        color: accent,
        roughness: 0.3,
        metalness: 0.5
      });
      const mesh = new THREE.Mesh(meshGeometry(t), mat);
      mesh.name = t.charAt(0).toUpperCase() + t.slice(1) + '_' + (meshes.length + 1);
      scene.add(mesh);
      meshes.push(mesh);
      select(mesh);
      notifyScene();
      return mesh;
    }

    function addHtmlNode(style) {
      const st = style === 'dark' ? 'dark' : 'light';
      const node = {
        id: uid(),
        style: st,
        title: st === 'light' ? 'Feature Info' : 'Dark Analysis',
        body: 'Edit coordinates and content in the inspector.',
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          Math.random() * 2,
          (Math.random() - 0.5) * 6
        ),
        rotationY: 0
      };
      htmlNodes.push(node);
      renderHtmlDom();
      select(makeHtmlSelectionProxy(node));
      notifyScene();
      return node;
    }

    function removeSelected() {
      if (!selected) return;
      if (selected.isNode) {
        const id = selected.id;
        const i = htmlNodes.findIndex(function (n) {
          return n.id === id;
        });
        if (i >= 0) htmlNodes.splice(i, 1);
        renderHtmlDom();
      } else {
        scene.remove(selected);
        const j = meshes.indexOf(selected);
        if (j >= 0) meshes.splice(j, 1);
      }
      selected = null;
      notifySelection();
      notifyScene();
    }

    function setMeshColor(mesh, cssHex) {
      if (!mesh || !mesh.material || mesh.isNode) return;
      mesh.material.color.set(cssHex);
    }

    function applyTransform(sel, prop, val) {
      if (!sel) return;
      const v = parseFloat(val);
      if (prop === 'px') sel.position.x = v;
      if (prop === 'py') sel.position.y = v;
      if (prop === 'pz') sel.position.z = v;
      if (prop === 'ry') {
        if (sel.isNode) sel.rotation.y = v;
        else sel.rotation.y = v;
      }
      if (sel.isNode) {
        const node = htmlNodes.find(function (n) {
          return n.id === sel.id;
        });
        if (node) {
          node.position.copy(sel.position);
          if (prop === 'ry') node.rotationY = v;
        }
      }
    }

    function setNodeContent(id, field, val) {
      const node = htmlNodes.find(function (n) {
        return n.id === id;
      });
      if (!node) return;
      node[field] = val;
      if (selected && selected.isNode && selected.id === id) {
        selected.title = node.title;
        selected.body = node.body;
        selected.name = node.title;
      }
      renderHtmlDom();
      notifyScene();
      notifySelection();
    }

    function toJSON() {
      return {
        version: 1,
        cameraAngle: {
          phi: cameraAngle.phi,
          theta: cameraAngle.theta,
          radius: cameraAngle.radius
        },
        meshes: meshes.map(function (m) {
          const t =
            m.geometry && m.geometry.type === 'BoxGeometry'
              ? 'box'
              : m.geometry && m.geometry.type === 'SphereGeometry'
                ? 'sphere'
                : m.geometry && m.geometry.type === 'CylinderGeometry'
                  ? 'cylinder'
                  : m.geometry && m.geometry.type === 'TorusGeometry'
                    ? 'torus'
                    : 'box';
          return {
            type: t,
            name: m.name,
            position: [m.position.x, m.position.y, m.position.z],
            rotationY: m.rotation.y,
            color: m.material && m.material.color ? '#' + m.material.color.getHexString() : '#ff3e00'
          };
        }),
        htmlNodes: htmlNodes.map(function (n) {
          return {
            id: n.id,
            style: n.style,
            title: n.title,
            body: n.body,
            position: [n.position.x, n.position.y, n.position.z],
            rotationY: n.rotationY || 0
          };
        })
      };
    }

    function fromJSON(data) {
      if (!data || !data.version) return;
      meshes.forEach(function (m) {
        scene.remove(m);
      });
      meshes.length = 0;
      htmlNodes.length = 0;
      selected = null;

      if (data.cameraAngle) {
        cameraAngle.phi = data.cameraAngle.phi != null ? data.cameraAngle.phi : cameraAngle.phi;
        cameraAngle.theta = data.cameraAngle.theta != null ? data.cameraAngle.theta : cameraAngle.theta;
        cameraAngle.radius = data.cameraAngle.radius != null ? data.cameraAngle.radius : cameraAngle.radius;
        updateCameraPosition();
      }

      (data.meshes || []).forEach(function (spec) {
        const mesh = addPrimitive(spec.type || 'box');
        mesh.name = spec.name || mesh.name;
        if (spec.position) mesh.position.set(spec.position[0], spec.position[1], spec.position[2]);
        if (spec.rotationY != null) mesh.rotation.y = spec.rotationY;
        if (spec.color) mesh.material.color.set(spec.color);
      });

      (data.htmlNodes || []).forEach(function (n) {
        const node = {
          id: n.id || uid(),
          style: n.style === 'dark' ? 'dark' : 'light',
          title: n.title || 'Node',
          body: n.body || '',
          position: new THREE.Vector3(
            n.position ? n.position[0] : 0,
            n.position ? n.position[1] : 1,
            n.position ? n.position[2] : 0
          ),
          rotationY: n.rotationY || 0
        };
        htmlNodes.push(node);
      });

      renderHtmlDom();
      select(null);
      notifyScene();
      notifySelection();
    }

    function dispose() {
      running = false;
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
      window.removeEventListener('resize', onResize);
      viewport.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      viewport.removeEventListener('mousemove', handleMouseMove);
      viewport.removeEventListener('wheel', handleWheel);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    function start() {
      if (running) return;
      running = true;
      tick();
    }

    if (opts.addInitialBox !== false) {
      addPrimitive('box');
    }

    onResize();
    start();

    return {
      scene: scene,
      camera: camera,
      renderer: renderer,
      THREE: THREE,
      getMeshes: function () {
        return meshes.slice();
      },
      getHtmlNodes: function () {
        return htmlNodes.slice();
      },
      getSelected: function () {
        return selected;
      },
      select: function (ref) {
        if (ref == null) {
          select(null);
          return;
        }
        if (ref.isNode || ref.isMesh) {
          select(ref);
          return;
        }
        const node = htmlNodes.find(function (n) {
          return n.id === ref.id;
        });
        if (node) select(makeHtmlSelectionProxy(node));
        else select(ref);
      },
      selectHtmlNodeById: function (id) {
        const node = htmlNodes.find(function (n) {
          return n.id === id;
        });
        if (node) select(makeHtmlSelectionProxy(node));
      },
      clearSelection: function () {
        select(null);
      },
      addPrimitive: addPrimitive,
      addHtmlNode: addHtmlNode,
      removeSelected: removeSelected,
      setMeshColor: setMeshColor,
      applyTransform: applyTransform,
      setNodeContent: setNodeContent,
      makeHtmlSelectionProxy: makeHtmlSelectionProxy,
      toJSON: toJSON,
      fromJSON: fromJSON,
      resize: onResize,
      start: start,
      dispose: dispose,
      version: '1.0'
    };
  };

  coffee.yayPrimitives = PRIMITIVES.slice();

  window.coffee = coffee;
})();
