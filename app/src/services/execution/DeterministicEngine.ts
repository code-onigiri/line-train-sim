/**
 * DeterministicEngine: Provides seeded random number generation for reproducible execution
 * Per spec FR-012 and SC-004, execution must be deterministic with same seed
 * Uses a Linear Congruential Generator (LCG) for simple, deterministic PRNG
 */
export class DeterministicEngine {
  private state: number;
  private readonly a = 1664525; // LCG multiplier
  private readonly c = 1013904223; // LCG increment
  private readonly m = 2 ** 32; // LCG modulus

  /**
   * Create a new deterministic random number generator with the given seed.
   * 
   * @param seed - Initial seed value (must be deterministic for replay)
   */
  constructor(seed: number) {
    this.state = seed >>> 0; // Ensure unsigned 32-bit integer
  }

  /**
   * Generate the next random number in [0, 1).
   * Uses Linear Congruential Generator algorithm.
   * 
   * @returns Random number in range [0, 1)
   */
  nextRandom(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / this.m;
  }

  /**
   * Generate a random integer in the range [min, max] (inclusive).
   * 
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns Random integer in range
   */
  nextInt(min: number, max: number): number {
    const range = max - min + 1;
    return Math.floor(this.nextRandom() * range) + min;
  }

  /**
   * Shuffle an array in-place using Fisher-Yates algorithm.
   * Returns the shuffled array for chaining.
   * 
   * @param array - Array to shuffle
   * @returns The shuffled array
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Reset the generator to a new seed.
   * Useful for restarting execution from the beginning.
   * 
   * @param seed - New seed value
   */
  reseed(seed: number): void {
    this.state = seed >>> 0;
  }

  /**
   * Save the current state for later restoration.
   * Enables save/load of execution state.
   * 
   * @returns Current internal state
   */
  saveState(): number {
    return this.state;
  }

  /**
   * Restore a previously saved state.
   * 
   * @param state - Saved state to restore
   */
  restoreState(state: number): void {
    this.state = state >>> 0;
  }

  /**
   * Generate a random boolean value.
   * 
   * @returns Random boolean
   */
  nextBoolean(): boolean {
    return this.nextRandom() < 0.5;
  }

  /**
   * Select a random element from an array.
   * 
   * @param array - Array to select from
   * @returns Random element, or undefined if array is empty
   */
  choice<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.nextInt(0, array.length - 1)];
  }
}
