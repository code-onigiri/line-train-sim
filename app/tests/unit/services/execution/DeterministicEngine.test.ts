import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { DeterministicEngine } from '../../../../src/services/execution/DeterministicEngine';

describe('DeterministicEngine', () => {
  describe('deterministic execution with seeded state', () => {
    it('should produce identical results with same seed', () => {
      const seed = 12345;
      const engine1 = new DeterministicEngine(seed);
      const engine2 = new DeterministicEngine(seed);

      const result1 = engine1.nextRandom();
      const result2 = engine2.nextRandom();

      expect(result1).toBe(result2);
    });

    it('should produce different results with different seeds', () => {
      const engine1 = new DeterministicEngine(12345);
      const engine2 = new DeterministicEngine(54321);

      const result1 = engine1.nextRandom();
      const result2 = engine2.nextRandom();

      expect(result1).not.toBe(result2);
    });

    it('should produce consistent sequence for same seed', () => {
      const seed = 99999;
      const engine1 = new DeterministicEngine(seed);
      const sequence1 = [engine1.nextRandom(), engine1.nextRandom(), engine1.nextRandom()];

      const engine2 = new DeterministicEngine(seed);
      const sequence2 = [engine2.nextRandom(), engine2.nextRandom(), engine2.nextRandom()];

      expect(sequence1).toEqual(sequence2);
    });

    it('should maintain state across multiple calls', () => {
      const engine = new DeterministicEngine(42);

      const first = engine.nextRandom();
      const second = engine.nextRandom();
      const third = engine.nextRandom();

      expect(first).not.toBe(second);
      expect(second).not.toBe(third);
      expect(first).not.toBe(third);
    });

    it('should reset to initial state when reseeded', () => {
      const seed = 777;
      const engine = new DeterministicEngine(seed);

      const initial = engine.nextRandom();
      engine.nextRandom(); // Advance state
      engine.nextRandom(); // Advance state

      engine.reseed(seed);
      const afterReseed = engine.nextRandom();

      expect(afterReseed).toBe(initial);
    });

    it('should generate numbers in valid range [0, 1)', () => {
      const engine = new DeterministicEngine(123);

      for (let i = 0; i < 100; i++) {
        const value = engine.nextRandom();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should support saving and restoring state', () => {
      const engine = new DeterministicEngine(456);

      engine.nextRandom();
      engine.nextRandom();

      const savedState = engine.saveState();
      const nextValue = engine.nextRandom();

      const restoredEngine = new DeterministicEngine(0);
      restoredEngine.restoreState(savedState);
      const restoredValue = restoredEngine.nextRandom();

      expect(restoredValue).toBe(nextValue);
    });

    it('should produce different sequences for consecutive seeds', () => {
      const engine1 = new DeterministicEngine(1);
      const engine2 = new DeterministicEngine(2);

      const seq1 = [engine1.nextRandom(), engine1.nextRandom()];
      const seq2 = [engine2.nextRandom(), engine2.nextRandom()];

      expect(seq1[0]).not.toBe(seq2[0]);
      expect(seq1[1]).not.toBe(seq2[1]);
    });

    it('should handle large seed values', () => {
      const largeSeed = 2147483647; // Max 32-bit int
      const engine = new DeterministicEngine(largeSeed);

      expect(() => {
        engine.nextRandom();
      }).not.toThrow();
    });

    it('should handle zero seed', () => {
      const engine = new DeterministicEngine(0);

      expect(() => {
        engine.nextRandom();
      }).not.toThrow();
    });
  });

  describe('nextInt', () => {
    it('should generate integers in specified range', () => {
      const engine = new DeterministicEngine(789);

      for (let i = 0; i < 50; i++) {
        const value = engine.nextInt(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should be deterministic for integers', () => {
      const seed = 321;
      const engine1 = new DeterministicEngine(seed);
      const engine2 = new DeterministicEngine(seed);

      const ints1 = [engine1.nextInt(0, 100), engine1.nextInt(0, 100)];
      const ints2 = [engine2.nextInt(0, 100), engine2.nextInt(0, 100)];

      expect(ints1).toEqual(ints2);
    });
  });

  describe('shuffle', () => {
    it('should shuffle array deterministically', () => {
      const arr = [1, 2, 3, 4, 5];
      const engine1 = new DeterministicEngine(555);
      const engine2 = new DeterministicEngine(555);

      const shuffled1 = engine1.shuffle([...arr]);
      const shuffled2 = engine2.shuffle([...arr]);

      expect(shuffled1).toEqual(shuffled2);
    });

    it('should preserve all elements when shuffling', () => {
      const arr = [1, 2, 3, 4, 5];
      const engine = new DeterministicEngine(666);

      const shuffled = engine.shuffle([...arr]);

      expect(shuffled).toHaveLength(arr.length);
      expect(shuffled.sort()).toEqual(arr.sort());
    });
  });
});
