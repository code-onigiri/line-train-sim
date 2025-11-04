/**
 * Performance monitoring utilities using Web Performance APIs
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private maxSamples = 60;
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
  };

  public startFrame(): void {
    this.lastFrameTime = performance.now();
  }

  public endFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;

    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    // Calculate average
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.metrics.fps = 1000 / avgFrameTime;
    this.metrics.frameTime = avgFrameTime;

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public reset(): void {
    this.frameTimes = [];
    this.metrics = {
      fps: 0,
      frameTime: 0,
    };
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

/**
 * Mark a performance measurement
 */
export function mark(name: string): void {
  performance.mark(name);
}

/**
 * Measure time between two marks
 */
export function measure(name: string, startMark: string, endMark: string): number {
  performance.measure(name, startMark, endMark);
  const entries = performance.getEntriesByName(name, 'measure');
  return entries[entries.length - 1]?.duration ?? 0;
}

/**
 * Clear all performance marks and measures
 */
export function clearPerformance(): void {
  performance.clearMarks();
  performance.clearMeasures();
}
