import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCurrentSeed,
  getSeededRandom,
  initializeSeed,
  resetSeed,
} from '../../../src/services/simulation/seedManager';

describe('seedManager', () => {
  describe('SeededRandom', () => {
    beforeEach(() => {
      initializeSeed(12345);
    });

    it('should generate deterministic random numbers', () => {
      const rng = getSeededRandom();
      const values = [rng.next(), rng.next(), rng.next()];

      // Reset and generate again with same seed
      resetSeed(12345);
      const rng2 = getSeededRandom();
      const values2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(values).toEqual(values2);
    });

    it('should generate numbers between 0 and 1', () => {
      const rng = getSeededRandom();
      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should generate integers within range', () => {
      const rng = getSeededRandom();
      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should generate floats within range', () => {
      const rng = getSeededRandom();
      for (let i = 0; i < 100; i++) {
        const value = rng.nextFloat(0.5, 2.5);
        expect(value).toBeGreaterThanOrEqual(0.5);
        expect(value).toBeLessThan(2.5);
      }
    });

    it('should maintain current seed', () => {
      const seed = 54321;
      initializeSeed(seed);
      const currentSeed = getCurrentSeed();
      expect(currentSeed).toBe(seed);
    });

    it('should produce different sequences with different seeds', () => {
      initializeSeed(111);
      const rng1 = getSeededRandom();
      const values1 = [rng1.next(), rng1.next(), rng1.next()];

      initializeSeed(222);
      const rng2 = getSeededRandom();
      const values2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(values1).not.toEqual(values2);
    });
  });
});
