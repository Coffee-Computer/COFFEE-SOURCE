/**
 * coffee.fuzz — Audio FX chain. Homage to the fuzz pedal.
 * Reverb, delay, fuzz (distortion), filter.
 * Works with coffee.Synth or any AudioNode. Use synth.connect(effect.input).
 *
 * const rev = coffee.fuzz.reverb(2, 3, 0.3);
 * synth.connect(rev.input);
 * rev.output.connect(coffee.synth.output);
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  function ctx() {
    if (coffee.synth && coffee.synth.init) coffee.synth.init();
    return coffee.synth?.audioContext;
  }

  /**
   * Fuzz/distortion. drive 0–1 (higher = more grit).
   */
  function fuzz(drive = 0.5) {
    const ac = ctx();
    if (!ac) return { input: null, output: null };

    const input = ac.createGain();
    input.gain.value = 1;
    const shaper = ac.createWaveShaper();
    const output = ac.createGain();
    output.gain.value = 1;

    const k = Math.min(100, 1 + drive * 99);
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128 - 1) * k;
      curve[i] = (3 + k) * x / (1 + k * Math.abs(x));
    }
    shaper.curve = curve;
    shaper.oversample = '4x';

    input.connect(shaper);
    shaper.connect(output);
    return { input, output };
  }

  /**
   * Delay. opts: { time, feedback, mix } in seconds / 0–1.
   */
  function delay(opts = {}) {
    const ac = ctx();
    if (!ac) return { input: null, output: null };

    const { time = 0.3, feedback = 0.4, mix = 0.5 } = opts;
    const input = ac.createGain();
    input.gain.value = 1;
    const delayNode = ac.createDelay(2);
    delayNode.delayTime.value = time;
    const feedbackGain = ac.createGain();
    feedbackGain.gain.value = feedback;
    const wetGain = ac.createGain();
    wetGain.gain.value = mix;
    const dryGain = ac.createGain();
    dryGain.gain.value = 1 - mix;
    const output = ac.createGain();
    output.gain.value = 1;

    input.connect(dryGain);
    input.connect(delayNode);
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    delayNode.connect(wetGain);
    dryGain.connect(output);
    wetGain.connect(output);
    return { input, output };
  }

  /**
   * Reverb. seconds = length, decay = tail, dryWet = 0–1 (wet amount).
   */
  function reverb(seconds = 2, decay = 3, dryWet = 0.3) {
    const ac = ctx();
    if (!ac) return { input: null, output: null };

    const length = ac.sampleRate * seconds;
    const ir = ac.createBuffer(1, length, ac.sampleRate);
    const data = ir.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }

    const input = ac.createGain();
    input.gain.value = 1;
    const conv = ac.createConvolver();
    conv.buffer = ir;
    const dryGain = ac.createGain();
    dryGain.gain.value = 1 - dryWet;
    const wetGain = ac.createGain();
    wetGain.gain.value = dryWet;
    const output = ac.createGain();
    output.gain.value = 1;

    input.connect(dryGain);
    input.connect(conv);
    conv.connect(wetGain);
    dryGain.connect(output);
    wetGain.connect(output);
    return { input, output };
  }

  /**
   * Filter. type = lowpass|highpass|bandpass, freq in Hz, Q = resonance.
   */
  function filter(type = 'lowpass', freq = 1000, Q = 1) {
    const ac = ctx();
    if (!ac) return { input: null, output: null };

    const input = ac.createGain();
    input.gain.value = 1;
    const filt = ac.createBiquadFilter();
    filt.type = type;
    filt.frequency.value = freq;
    filt.Q.value = Q;
    const output = ac.createGain();
    output.gain.value = 1;

    input.connect(filt);
    filt.connect(output);
    return { input, output };
  }

  coffee.fuzz = {
    fuzz,
    delay,
    reverb,
    filter
  };

  window.coffee = coffee;
})();
