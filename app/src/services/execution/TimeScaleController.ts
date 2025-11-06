/**
 * Time scale controller for execution playback.
 * Manages playback speed with responsive adjustment.
 */
export class TimeScaleController {
  private currentScale = 1.0;
  private minScale = 0.1;
  private maxScale = 5.0;
  private targetResponseTime = 150; // milliseconds
  private lastAdjustmentTime = 0;

  /**
   * Set the time scale with bounds checking.
   * @param scale - Desired time scale (0.1x to 5.0x)
   */
  setTimeScale(scale: number): number {
    const now = Date.now();
    this.lastAdjustmentTime = now;

    // Clamp to valid range
    this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, scale));

    return this.currentScale;
  }

  /**
   * Get the current time scale.
   */
  getTimeScale(): number {
    return this.currentScale;
  }

  /**
   * Increase time scale by a step.
   * @param step - Amount to increase (default 0.5x)
   */
  increaseScale(step = 0.5): number {
    return this.setTimeScale(this.currentScale + step);
  }

  /**
   * Decrease time scale by a step.
   * @param step - Amount to decrease (default 0.5x)
   */
  decreaseScale(step = 0.5): number {
    return this.setTimeScale(this.currentScale - step);
  }

  /**
   * Reset to normal speed (1.0x).
   */
  resetScale(): number {
    return this.setTimeScale(1.0);
  }

  /**
   * Calculate elapsed simulation time given real time delta.
   * @param realTimeDelta - Real time elapsed in milliseconds
   */
  calculateSimulationTime(realTimeDelta: number): number {
    return realTimeDelta * this.currentScale;
  }

  /**
   * Calculate real time required for simulation time delta.
   * @param simulationTimeDelta - Simulation time delta in milliseconds
   */
  calculateRealTime(simulationTimeDelta: number): number {
    return simulationTimeDelta / this.currentScale;
  }

  /**
   * Check if last adjustment was within target response time.
   */
  isResponsive(): boolean {
    const timeSinceAdjustment = Date.now() - this.lastAdjustmentTime;
    return timeSinceAdjustment <= this.targetResponseTime;
  }

  /**
   * Get time since last adjustment in milliseconds.
   */
  getTimeSinceAdjustment(): number {
    return Date.now() - this.lastAdjustmentTime;
  }

  /**
   * Get the valid scale range.
   */
  getScaleRange(): { min: number; max: number } {
    return {
      min: this.minScale,
      max: this.maxScale,
    };
  }

  /**
   * Set the valid scale range.
   * @param min - Minimum scale (must be > 0)
   * @param max - Maximum scale (must be > min)
   */
  setScaleRange(min: number, max: number): void {
    if (min <= 0 || max <= min) {
      throw new Error('Invalid scale range: min must be > 0 and max must be > min');
    }

    this.minScale = min;
    this.maxScale = max;

    // Re-clamp current scale to new range
    this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, this.currentScale));
  }

  /**
   * Get predefined scale presets.
   */
  getPresets(): number[] {
    return [0.1, 0.25, 0.5, 1.0, 2.0, 3.0, 5.0];
  }

  /**
   * Set scale to nearest preset.
   * @param preferHigher - If true, rounds up; if false, rounds down
   */
  snapToPreset(preferHigher = true): number {
    const presets = this.getPresets();
    const validPresets = presets.filter((p) => p >= this.minScale && p <= this.maxScale);

    if (validPresets.length === 0) {
      return this.currentScale;
    }

    // Find closest preset
    let closest = validPresets[0];
    let minDiff = Math.abs(this.currentScale - closest);

    for (const preset of validPresets) {
      const diff = Math.abs(this.currentScale - preset);
      if (diff < minDiff) {
        closest = preset;
        minDiff = diff;
      } else if (diff === minDiff && preferHigher && preset > closest) {
        closest = preset;
      }
    }

    return this.setTimeScale(closest);
  }
}
