/**
 * coffee.draw() — Interactive drawing canvas. Depends on scene2d.
 *
 * coffee.draw({ brush: { size, color, opacity, mode }, background, width, height, onStrokeComplete })
 *
 * If coffee.plex is loaded first, strokes use plex modes for live draw + replay.
 * Load order: coffee-scene2d → coffee-plex (optional) → coffee-draw
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};
  if (!coffee.scene2d) {
    coffee.draw = function () {
      const err = document.createElement('div');
      err.style.cssText = 'padding:24px;color:#ef4444;background:#1a1a1a;border-radius:8px';
      err.textContent = 'coffee.draw() requires coffee.scene2d. Load scene2d first.';
      return err;
    };
    window.coffee = coffee;
    return;
  }

  function hasPlex() {
    return coffee.plex && typeof coffee.plex.apply === 'function' && typeof coffee.plex.reset === 'function';
  }

  function drawOneStroke(ctx, s) {
    if (!s.points || s.points.length < 2) return;

    const mode = s.mode || 'pen';
    const opacity = s.opacity != null ? s.opacity : 1;

    if (hasPlex()) {
      coffee.plex.apply(ctx, {
        mode,
        color: s.color,
        size: s.size,
        opacity
      });
    } else {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = opacity;
    }

    ctx.beginPath();
    ctx.moveTo(s.points[0][0], s.points[0][1]);
    for (let i = 1; i < s.points.length; i++) {
      ctx.lineTo(s.points[i][0], s.points[i][1]);
    }
    ctx.stroke();

    if (hasPlex()) {
      coffee.plex.reset(ctx);
    }
  }

  coffee.draw = function (opts = {}) {
    const {
      brush = {},
      background = '#ffffff',
      width = 400,
      height = 300,
      onStrokeComplete
    } = opts;

    const brushState = {
      size: brush.size ?? 4,
      color: brush.color ?? '#000000',
      opacity: brush.opacity != null ? Math.max(0, Math.min(1, Number(brush.opacity))) : 1,
      mode: brush.mode || 'pen'
    };

    const strokes = [];
    let currentStroke = null;

    function drawStrokes(ctx) {
      for (const s of strokes) {
        drawOneStroke(ctx, s);
      }
      if (currentStroke && currentStroke.points.length > 1) {
        drawOneStroke(ctx, currentStroke);
      }
    }

    const view = coffee.scene2d({
      shapes: [],
      background,
      width,
      height,
      custom: (scene) => drawStrokes(scene.ctx)
    });

    const canvas = view.scene2d.canvas;
    canvas.style.cursor = 'crosshair';
    canvas.style.touchAction = 'none';

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      return [x, y];
    }

    function onDown(e) {
      e.preventDefault();
      const [x, y] = getCoords(e);
      currentStroke = {
        points: [[x, y]],
        size: brushState.size,
        color: brushState.color,
        opacity: brushState.opacity,
        mode: brushState.mode
      };
      view.scene2d.render();
    }

    function onMove(e) {
      if (!currentStroke) return;
      e.preventDefault();
      const [x, y] = getCoords(e);
      currentStroke.points.push([x, y]);
      view.scene2d.render();
    }

    function onUp(e) {
      if (!currentStroke) return;
      e.preventDefault();
      if (currentStroke.points.length > 1) {
        strokes.push(currentStroke);
        if (typeof onStrokeComplete === 'function') onStrokeComplete(currentStroke);
      }
      currentStroke = null;
      view.scene2d.render();
    }

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onUp);

    view.draw = {
      strokes: () => strokes,

      getBrush: () => ({ ...brushState }),

      setBrush(patch) {
        if (!patch || typeof patch !== 'object') return;
        if (patch.size != null) brushState.size = Number(patch.size) || brushState.size;
        if (patch.color != null) brushState.color = String(patch.color);
        if (patch.opacity != null) {
          brushState.opacity = Math.max(0, Math.min(1, Number(patch.opacity)));
        }
        if (patch.mode != null) brushState.mode = String(patch.mode);
      },

      clear() {
        strokes.length = 0;
        currentStroke = null;
        view.scene2d.render();
      },

      undo() {
        if (strokes.length === 0) return;
        strokes.pop();
        currentStroke = null;
        view.scene2d.render();
      },

      /**
       * Replace strokes from serialized data (e.g. coffee.load).
       * @param {Array<{ points: number[][], size?: number, color?: string, opacity?: number, mode?: string }>} arr
       */
      loadStrokes(arr) {
        strokes.length = 0;
        currentStroke = null;
        if (!Array.isArray(arr)) {
          view.scene2d.render();
          return;
        }
        for (const s of arr) {
          if (!s || !Array.isArray(s.points) || s.points.length < 2) continue;
          strokes.push({
            points: s.points.map((p) => [Number(p[0]) || 0, Number(p[1]) || 0]),
            size: s.size != null ? Number(s.size) : brushState.size,
            color: s.color != null ? String(s.color) : brushState.color,
            opacity: s.opacity != null ? Math.max(0, Math.min(1, Number(s.opacity))) : 1,
            mode: s.mode || 'pen'
          });
        }
        view.scene2d.render();
      },

      exportStrokes() {
        return strokes.map((s) => ({
          points: s.points.map((p) => [p[0], p[1]]),
          size: s.size,
          color: s.color,
          opacity: s.opacity,
          mode: s.mode || 'pen'
        }));
      },

      getShapes: () =>
        strokes.map((s) => ({
          type: 'path',
          points: s.points,
          stroke: s.color,
          strokeWidth: s.size,
          mode: s.mode,
          opacity: s.opacity
        }))
    };

    return view;
  };

  window.coffee = coffee;
})();
