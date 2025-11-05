/**
 * Deterministic seed management for reproducible simulations
 */

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate next pseudo-random number between 0 and 1
   * Uses a simple LCG (Linear Congruential Generator)
   */
  public next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32;
    return this.seed / 2 ** 32;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate random float between min and max
   */
  public nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Reset seed to initial value
   */
  public reset(newSeed: number): void {
    this.seed = newSeed;
  }

  /**
   * Get current seed value
   */
  public getSeed(): number {
    return this.seed;
  }
}

// Singleton instance
let globalSeededRandom: SeededRandom | null = null;

export function initializeSeed(seed?: number): SeededRandom {
  const actualSeed = seed ?? Date.now();
  globalSeededRandom = new SeededRandom(actualSeed);
  return globalSeededRandom;
}

export function getSeededRandom(): SeededRandom {
  if (!globalSeededRandom) {
    return initializeSeed();
  }
  return globalSeededRandom;
}

export function resetSeed(seed: number): void {
  if (globalSeededRandom) {
    globalSeededRandom.reset(seed);
  } else {
    initializeSeed(seed);
  }
}

export function getCurrentSeed(): number {
  return globalSeededRandom?.getSeed() ?? Date.now();
}
