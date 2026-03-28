/**
 * coffee.Synth — Web Audio synthesizer.
 * Oscillator types: sine, square, sawtooth, triangle.
 * ADSR envelope: attack, decay, sustain (0–1), release.
 * Polyphonic: play() returns a note with .stop().
 * Lazy AudioContext init (requires user gesture).
 *
 * const s = new coffee.Synth('sawtooth');
 * const n1 = s.play(440);
 * const n2 = s.play(523);
 * n1.stop(0.3);
 *
 * coffee.synth.note('A4') → 440
 * coffee.synth.volume — master volume 0–1
 * coffee.synth.analyzer — AnalyserNode for visualizers (after init)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  let audioCtx = null;
  let masterGain = null;
  let analyzer = null;

  const NOTE_MAP = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

  function init() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      analyzer = audioCtx.createAnalyser();
      masterGain.connect(analyzer);
      analyzer.connect(audioCtx.destination);
    }
  }

  /**
   * Convert note name to frequency. A4 = 440.
   * @param {string} name - e.g. 'A4', 'C#5', 'Bb3'
   * @returns {number} Frequency in Hz
   */
  function noteToFreq(name) {
    const m = String(name).trim().match(/^([A-Ga-g][#b]?)(-?\d+)$/);
    if (!m) return 440;
    const semitone = NOTE_MAP[m[1].charAt(0).toUpperCase() + (m[1].slice(1) || '')];
    if (semitone == null) return 440;
    const octave = parseInt(m[2], 10);
    const midi = 12 + octave * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  coffee.Synth = class Synth {
    constructor(type = 'sine') {
      init();
      this.type = type;
      this._destination = null;
    }

    /**
     * Route output to a node (e.g. effect input). Default: masterGain.
     */
    connect(destination) {
      this._destination = destination;
    }

    /**
     * Route back to default output.
     */
    disconnect() {
      this._destination = null;
    }

    /**
     * Play a frequency with ADSR envelope. Returns a note with .stop().
     * @param {number|string} freq - Frequency in Hz or note name (e.g. 'A4')
     * @param {object} opts - { attack, decay, sustain, release } in seconds (sustain 0–1)
     * @returns {{ stop: function }} Note handle
     */
    play(freq = 440, opts = {}) {
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const hz = typeof freq === 'string' ? noteToFreq(freq) : freq;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      const attack = Math.max(0.001, opts.attack ?? 0.05);
      const decay = Math.max(0.001, opts.decay ?? 0.1);
      const sustain = Math.max(0, Math.min(1, opts.sustain ?? 0.7));
      const vol = coffee.synth.volume;
      const sustainLevel = vol * sustain;

      const t0 = audioCtx.currentTime;
      osc.type = this.type;
      osc.frequency.setValueAtTime(hz, t0);
      gainNode.gain.setValueAtTime(0, t0);
      gainNode.gain.linearRampToValueAtTime(vol, t0 + attack);
      gainNode.gain.linearRampToValueAtTime(sustainLevel, t0 + attack + decay);

      osc.connect(gainNode);
      gainNode.connect(this._destination ?? masterGain);
      osc.start();

      return {
        stop(time = 0.1) {
          const t = audioCtx.currentTime;
          const releaseTime = t + time;
          gainNode.gain.cancelScheduledValues(t);
          gainNode.gain.setValueAtTime(sustainLevel, t);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseTime);
          osc.stop(releaseTime);
        }
      };
    }
  };

  coffee.synth = {
    volume: 0.5,
    note: noteToFreq,
    get analyzer() {
      init();
      return analyzer;
    },
    get output() {
      init();
      return masterGain;
    },
    get audioContext() {
      init();
      return audioCtx;
    },
    init
  };

  coffee.Synth.types = ['sine', 'square', 'sawtooth', 'triangle'];

  window.coffee = coffee;
})();
