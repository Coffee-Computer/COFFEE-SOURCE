/**
 * coffee.svg — Vector graphics engine. Draw rect, circle, text. Select, edit, export.
 * Coupled to DOM (needs SVG element + mouse events). UI-agnostic API.
 *
 * const svg = coffee.svg({ svg: artboard, onSelect: (el) => updateInspector(el) });
 * svg.setTool('rect');
 * svg.clear();
 * svg.export();
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};
  const NS = 'http://www.w3.org/2000/svg';

  coffee.svg = function (opts = {}) {
    const { svg: svgEl, width = 800, height = 600, onSelect } = opts;

    let artboard;
    if (svgEl && svgEl.tagName === 'svg') {
      artboard = svgEl;
    } else {
      artboard = document.createElementNS(NS, 'svg');
      artboard.setAttribute('xmlns', NS);
      artboard.setAttribute('width', width);
      artboard.setAttribute('height', height);
      artboard.setAttribute('viewBox', `0 0 ${width} ${height}`);
      artboard.innerHTML = `
        <defs>
          <filter id="coffee-svg-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="2"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g data-coffee-svg-shapes=""></g>
      `;
    }

    let currentTool = 'rect';
    let selectedElement = null;
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let tempShape = null;
    let fillColor = '#10b981';

    function getMousePos(e) {
      const CTM = artboard.getScreenCTM();
      if (!CTM) return { x: 0, y: 0 };
      return {
        x: (e.clientX - CTM.e) / CTM.a,
        y: (e.clientY - CTM.f) / CTM.d
      };
    }

    function deselect() {
      if (selectedElement) {
        selectedElement.style.outline = 'none';
        selectedElement.style.outlineOffset = '';
        selectedElement = null;
      }
      if (typeof onSelect === 'function') onSelect(null);
    }

    function select(el) {
      deselect();
      if (el && el !== artboard) {
        selectedElement = el;
        selectedElement.style.outline = '2px solid #10b981';
        selectedElement.style.outlineOffset = '2px';
      }
      if (typeof onSelect === 'function') onSelect(selectedElement);
    }

    function getShapesContainer() {
      let g = artboard.querySelector('[data-coffee-svg-shapes]');
      if (!g) {
        g = document.createElementNS(NS, 'g');
        g.setAttribute('data-coffee-svg-shapes', '');
        artboard.appendChild(g);
      }
      return g;
    }

    function appendShape(el) {
      const container = artboard.querySelector('[data-coffee-svg-shapes]');
      if (container) container.appendChild(el);
      else artboard.appendChild(el);
    }

    function artboardMousedown(e) {
      const pos = getMousePos(e);
      startPos = pos;
      isDragging = true;

      if (currentTool === 'select') {
        const target = e.target.closest ? e.target.closest('rect, circle, text') : e.target;
        if (target && target !== artboard && artboard.contains(target)) {
          select(target);
        } else {
          deselect();
        }
        return;
      }

      if (currentTool === 'rect') {
        tempShape = document.createElementNS(NS, 'rect');
        tempShape.setAttribute('x', pos.x);
        tempShape.setAttribute('y', pos.y);
        tempShape.setAttribute('fill', fillColor);
        tempShape.setAttribute('rx', '4');
        appendShape(tempShape);
      } else if (currentTool === 'circle') {
        tempShape = document.createElementNS(NS, 'circle');
        tempShape.setAttribute('cx', pos.x);
        tempShape.setAttribute('cy', pos.y);
        tempShape.setAttribute('fill', fillColor);
        appendShape(tempShape);
      } else if (currentTool === 'text') {
        tempShape = document.createElementNS(NS, 'text');
        tempShape.setAttribute('x', pos.x);
        tempShape.setAttribute('y', pos.y);
        tempShape.setAttribute('fill', fillColor);
        tempShape.setAttribute('font-size', '40');
        tempShape.setAttribute('font-weight', 'bold');
        tempShape.setAttribute('style', 'font-family: Inter, system-ui, sans-serif; user-select: none;');
        tempShape.textContent = 'Type...';
        appendShape(tempShape);
      }
    }

    function artboardMousemove(e) {
      if (!isDragging || !tempShape) return;
      const pos = getMousePos(e);

      if (currentTool === 'rect') {
        const x = Math.min(pos.x, startPos.x);
        const y = Math.min(pos.y, startPos.y);
        const w = Math.abs(pos.x - startPos.x);
        const h = Math.abs(pos.y - startPos.y);
        tempShape.setAttribute('x', x);
        tempShape.setAttribute('y', y);
        tempShape.setAttribute('width', w);
        tempShape.setAttribute('height', h);
      } else if (currentTool === 'circle') {
        const r = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        tempShape.setAttribute('r', r);
      }
    }

    function artboardMouseup() {
      isDragging = false;
      tempShape = null;
    }

    artboard.addEventListener('mousedown', artboardMousedown);
    artboard.addEventListener('mousemove', artboardMousemove);
    artboard.addEventListener('mouseup', artboardMouseup);
    artboard.addEventListener('mouseleave', artboardMouseup);

    return {
      setTool(tool) {
        currentTool = tool;
        if (tool !== 'select') deselect();
      },

      getTool() {
        return currentTool;
      },

      setFillColor(color) {
        fillColor = color;
      },

      getFillColor() {
        return fillColor;
      },

      getSelected() {
        return selectedElement;
      },

      updateSelected(prop, val) {
        if (!selectedElement) return;
        const tag = selectedElement.tagName.toLowerCase();
        if (prop === 'text') {
          selectedElement.textContent = val;
          return;
        }
        if (prop === 'fontSize') {
          selectedElement.setAttribute('font-size', String(val));
          return;
        }
        if (prop === 'opacity') {
          selectedElement.setAttribute('fill-opacity', String(val));
          return;
        }
        if (prop === 'fill') {
          selectedElement.setAttribute('fill', String(val));
          return;
        }
        const geom = {
          x: 'x',
          y: 'y',
          width: 'width',
          height: 'height',
          r: 'r',
          cx: 'cx',
          cy: 'cy',
          rx: 'rx'
        };
        const attr = geom[prop];
        if (!attr) return;
        if (tag === 'rect' && (prop === 'r' || prop === 'cx' || prop === 'cy')) return;
        if (tag === 'circle' && (prop === 'width' || prop === 'height' || prop === 'x' || prop === 'y' || prop === 'rx')) return;
        if (tag === 'text' && (prop === 'width' || prop === 'height' || prop === 'r' || prop === 'rx')) return;
        selectedElement.setAttribute(attr, String(val));
      },

      deleteSelected() {
        if (selectedElement) {
          selectedElement.remove();
          deselect();
        }
      },

      clear() {
        const container = artboard.querySelector('[data-coffee-svg-shapes]');
        if (container) {
          container.innerHTML = '';
        } else {
          Array.from(artboard.children).filter(c => c.tagName !== 'defs').forEach(c => c.remove());
        }
        deselect();
      },

      export() {
        const svgData = new XMLSerializer().serializeToString(artboard);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },

      getSVG() {
        return artboard;
      }
    };
  };

  window.coffee = coffee;
})();
