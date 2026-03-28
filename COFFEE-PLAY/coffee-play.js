/**
 * coffee.play — Game API built on coffee.cup + coffee.dot.
 * Orchestrates logic (CUP) and render (DOT). One-call setup.
 *
 * coffee.play(canvas, setup)
 * setup: { onUpdate(game), onDraw(ctx, game), onAnnounce?(msg), friction?, ... }
 *
 * game: spawn, shoot, keys, mouse, entities, projectiles, player, canvas, ctx,
 *       announce, getDistance, checkCollision, config
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  if (!coffee.cup || !coffee.dot) {
    console.warn('coffee.play requires coffee.cup and coffee.dot. Load them first.');
  }

  /**
   * Start a game. Creates CUP + DOT, runs loop.
   * @param {HTMLCanvasElement|string} canvasOrSelector
   * @param {object} setup - { onUpdate, onDraw, onAnnounce?, friction?, ... }
   * @returns {object} Game handle { stop() }
   */
  function play(canvasOrSelector, setup = {}) {
    const canvas = typeof canvasOrSelector === 'string'
      ? document.querySelector(canvasOrSelector)
      : canvasOrSelector;

    if (!canvas || !canvas.getContext) {
      throw new Error('coffee.play: valid canvas element required');
    }

    const config = {
      friction: 0.92,
      gravity: 0,
      onUpdate: setup.onUpdate || (() => {}),
      onDraw: setup.onDraw || (() => {}),
      onAnnounce: setup.onAnnounce || (() => {}),
      ...setup
    };

    const cup = coffee.cup.create({
      width: canvas.width || window.innerWidth,
      height: canvas.height || window.innerHeight,
      friction: config.friction,
      gravity: config.gravity
    });

    const dot = coffee.dot.create(canvas);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cup.resize(canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    // Game API — passed to onUpdate / onDraw
    const game = {
      canvas,
      ctx: canvas.getContext('2d'),
      cup,
      dot,
      entities: cup.entities,
      projectiles: cup.projectiles,
      keys: cup.keys,
      mouse: cup.mouse,
      player: null,
      config,

      spawn(props = {}) {
        return cup.spawn({
          x: props.x ?? canvas.width / 2,
          y: props.y ?? canvas.height / 2,
          ...props
        });
      },

      shoot(origin, targetX, targetY, speed) {
        return cup.shoot(origin, targetX, targetY, speed);
      },

      announce(msg) {
        config.onAnnounce(msg);
      },

      getDistance: cup.getDistance.bind(cup),
      checkCollision: cup.checkCollision.bind(cup)
    };

    let lastTime = 0;
    let running = true;

    function loop(timestamp) {
      if (!running) return;

      const dt = Math.min(timestamp - lastTime, 100);
      lastTime = timestamp;

      // 1. User logic (input, AI, collision, etc.)
      config.onUpdate(game);

      // 2. CUP step → state
      const state = cup.step(dt);

      // 3. DOT draw state
      dot.draw(state);

      // 4. User custom draw (overlay, effects)
      config.onDraw(game.ctx, game);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame((t) => { lastTime = t; loop(t); });

    return {
      stop() {
        running = false;
      },
      game,
      cup,
      dot
    };
  }

  coffee.play = play;
  window.coffee = coffee;
})();
