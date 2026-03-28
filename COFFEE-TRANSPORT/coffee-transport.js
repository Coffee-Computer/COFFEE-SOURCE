/**
 * coffee.transport — Step clock for sequencers (BPM, 16th-note steps).
 * Optional: uses coffee.synth.audioContext for scheduling when synth is loaded.
 *
 * coffee.transport.bpm = 120;
 * coffee.transport.totalSteps = 32;
 * const off = coffee.transport.onStep((step, audioTime) => { ... });
 * coffee.transport.play();
 * coffee.transport.stop();
 * off();
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const state = {
    bpm: 120,
    totalSteps: 32,
    currentStep: 0,
    isPlaying: false,
    _listeners: [],
    _interval: null,
    _nextTickTime: 0,
    _wallNext: 0,
    _wall0: 0
  };

  function secondsPerStep() {
    return 60 / state.bpm / 4;
  }

  function emit(step, t) {
    for (let i = 0; i < state._listeners.length; i++) {
      try {
        state._listeners[i](step, t);
      } catch (e) {
        console.error('[coffee.transport]', e);
      }
    }
  }

  function tick() {
    if (!state.isPlaying) return;
    const ac = coffee.synth && coffee.synth.audioContext;
    if (ac) {
      const horizon = ac.currentTime + 0.1;
      while (state._nextTickTime < horizon) {
        emit(state.currentStep, state._nextTickTime);
        state._nextTickTime += secondsPerStep();
        state.currentStep = (state.currentStep + 1) % state.totalSteps;
      }
    } else {
      const now = performance.now() / 1000;
      while (state._wallNext <= now + 0.02) {
        emit(state.currentStep, state._wallNext);
        state._wallNext += secondsPerStep();
        state.currentStep = (state.currentStep + 1) % state.totalSteps;
      }
    }
  }

  coffee.transport = {
    get bpm() {
      return state.bpm;
    },
    set bpm(v) {
      state.bpm = Math.max(40, Math.min(240, Number(v) || 120));
    },
    get totalSteps() {
      return state.totalSteps;
    },
    set totalSteps(v) {
      state.totalSteps = Math.max(1, Math.min(512, Number(v) || 32));
    },
    get currentStep() {
      return state.currentStep;
    },
    get isPlaying() {
      return state.isPlaying;
    },
    secondsPerStep,

    onStep(fn) {
      if (typeof fn !== 'function') return function () {};
      state._listeners.push(fn);
      return function unsubscribe() {
        const i = state._listeners.indexOf(fn);
        if (i >= 0) state._listeners.splice(i, 1);
      };
    },

    play() {
      if (state.isPlaying) return;
      if (coffee.synth && coffee.synth.init) coffee.synth.init();
      if (coffee.synth && coffee.synth.audioContext && coffee.synth.audioContext.state === 'suspended') {
        coffee.synth.audioContext.resume();
      }
      state.isPlaying = true;
      const ac = coffee.synth && coffee.synth.audioContext;
      if (ac) {
        state._nextTickTime = ac.currentTime;
      } else {
        state._wall0 = performance.now() / 1000;
        state._wallNext = state._wall0;
      }
      state._interval = setInterval(tick, 25);
      tick();
    },

    stop() {
      state.isPlaying = false;
      if (state._interval) {
        clearInterval(state._interval);
        state._interval = null;
      }
      state.currentStep = 0;
    }
  };

  window.coffee = coffee;
})();
