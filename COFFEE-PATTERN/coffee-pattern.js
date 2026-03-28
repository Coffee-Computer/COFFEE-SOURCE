/**
 * coffee.pattern — Serializable pattern shapes for sequencers (no audio, no UI).
 *
 * coffee.pattern.emptyPianoRoll({ stepCount, notes: [] })
 * coffee.pattern.emptyDrum({ stepCount, padIds })
 * coffee.pattern.clone(p)
 */

(function () {
  if (typeof window === 'undefined') return;
  const coffee = window.coffee || {};

  const VERSION = 1;

  coffee.pattern = {
    VERSION,

    /**
     * @param {{ stepCount?: number, notes?: Array<{ step: number, row: number, length?: number }> }} opts
     */
    emptyPianoRoll(opts = {}) {
      const stepCount = Math.max(1, Number(opts.stepCount) || 32);
      return {
        kind: 'coffee.pattern.pianoRoll',
        version: VERSION,
        stepCount,
        notes: Array.isArray(opts.notes) ? opts.notes.slice() : []
      };
    },

    /**
     * @param {{ stepCount?: number, padIds?: string[] }} opts
     */
    emptyDrum(opts = {}) {
      const stepCount = Math.max(1, Number(opts.stepCount) || 16);
      const padIds = Array.isArray(opts.padIds) && opts.padIds.length ? opts.padIds : ['p1', 'p2', 'p3', 'p4'];
      const lanes = {};
      for (let i = 0; i < padIds.length; i++) {
        lanes[padIds[i]] = new Array(stepCount).fill(0);
      }
      return {
        kind: 'coffee.pattern.drum',
        version: VERSION,
        stepCount,
        padIds: padIds.slice(),
        lanes
      };
    },

    clone(p) {
      if (p == null) return null;
      return JSON.parse(JSON.stringify(p));
    },

    isPianoRoll(p) {
      return p && p.kind === 'coffee.pattern.pianoRoll';
    },

    isDrum(p) {
      return p && p.kind === 'coffee.pattern.drum';
    }
  };

  window.coffee = coffee;
})();
