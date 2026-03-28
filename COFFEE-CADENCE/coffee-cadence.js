/**
 * Cadence — Music UI on top of coffee-ui (transport strip, etc.).
 * Depends: coffee-ui (after injectTheme).
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  /**
   * @param {HTMLElement} container
   * @param {object} transport - coffee.transport
   * @returns {HTMLElement} strip root
   */
  function transportStrip(container, transport) {
    const wrap = document.createElement('div');
    wrap.setAttribute('data-cadence', 'transport-strip');
    wrap.style.cssText =
      'display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:12px;' +
      'background:var(--coffee-bg-elev,#252525);border-radius:var(--coffee-radius-sm,8px);' +
      'border:1px solid var(--coffee-panel,#2d2d2d)';

    const playBtn = coffee.button('Play', () => transport.play());
    const stopBtn = coffee.button(
      'Stop',
      () => transport.stop(),
      { style: { backgroundColor: 'var(--coffee-text-muted,#6b7280)' } }
    );

    const bpmLabel = document.createElement('label');
    bpmLabel.style.cssText = 'display:flex;align-items:center;gap:8px;color:var(--coffee-text-primary);font-size:14px';
    bpmLabel.textContent = 'BPM';
    const bpmInput = document.createElement('input');
    bpmInput.type = 'number';
    bpmInput.min = '40';
    bpmInput.max = '240';
    bpmInput.value = String(transport.bpm);
    bpmInput.style.cssText =
      'width:64px;padding:8px;border-radius:8px;border:1px solid var(--coffee-panel);background:var(--coffee-bg-surface);color:var(--coffee-text-primary)';
    bpmInput.onchange = () => {
      transport.bpm = Number(bpmInput.value) || 120;
      bpmInput.value = String(transport.bpm);
    };

    const stepReadout = document.createElement('span');
    stepReadout.style.cssText = 'font-family:monospace;color:var(--coffee-text-muted);font-size:13px;margin-left:8px';
    function updateReadout() {
      stepReadout.textContent = `step ${transport.currentStep + 1}/${transport.totalSteps}${transport.isPlaying ? ' ▶' : ''}`;
    }
    transport.onStep(() => updateReadout());
    setInterval(updateReadout, 200);
    updateReadout();

    bpmLabel.appendChild(bpmInput);
    wrap.appendChild(playBtn);
    wrap.appendChild(stopBtn);
    wrap.appendChild(bpmLabel);
    wrap.appendChild(stepReadout);
    container.appendChild(wrap);
    return wrap;
  }

  coffee.cadence = {
    version: 1,
    transportStrip
  };

  window.coffee = coffee;
})();
