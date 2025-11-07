/**
 * Performance metrics for rendering
 */
export interface RenderPerformanceMetrics {
  fps: number;
  frameTime: number;
  renderTime: number;
  updateTime: number;
  droppedFrames: number;
  totalFrames: number;
}

/**
 * Frame timing data
 */
interface FrameTiming {
  timestamp: number;
  duration: number;
  renderDuration: number;
  updateDuration: number;
}

/**
 * Service for monitoring canvas rendering performance.
 * Tracks FPS, frame times, and dropped frames to maintain 60 fps target.
 */
export class RenderPerformanceMonitor {
  private targetFPS = 60;
  private targetFrameTime = 1000 / 60; // ~16.67ms
  private frameTimes: FrameTiming[] = [];
  private maxFrameHistory = 60; // Keep last 60 frames (1 second at 60fps)
  private totalFrames = 0;
  private droppedFrames = 0;
  private lastFrameTime = 0;
  private isMonitoring = false;

  /**
   * Start monitoring performance.
   */
  start(): void {
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
  }

  /**
   * Stop monitoring performance.
   */
  stop(): void {
    this.isMonitoring = false;
  }

  /**
   * Record a frame.
   * @param renderDuration - Time spent rendering in ms
   * @param updateDuration - Time spent updating state in ms
   */
  recordFrame(renderDuration: number, updateDuration: number): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const frameDuration = now - this.lastFrameTime;

    const timing: FrameTiming = {
      timestamp: now,
      duration: frameDuration,
      renderDuration,
      updateDuration,
    };

    this.frameTimes.push(timing);

    // Trim history to max size
    if (this.frameTimes.length > this.maxFrameHistory) {
      this.frameTimes.shift();
    }

    // Track dropped frames (frame time exceeded target by more than 50%)
    if (frameDuration > this.targetFrameTime * 1.5) {
      this.droppedFrames++;
    }

    this.totalFrames++;
    this.lastFrameTime = now;
  }

  /**
   * Get current performance metrics.
   */
  getMetrics(): RenderPerformanceMetrics {
    if (this.frameTimes.length === 0) {
      return {
        fps: 0,
        frameTime: 0,
        renderTime: 0,
        updateTime: 0,
        droppedFrames: this.droppedFrames,
        totalFrames: this.totalFrames,
      };
    }

    // Calculate average FPS from recent frames
    const totalDuration = this.frameTimes.reduce((sum, t) => sum + t.duration, 0);
    const avgFrameTime = totalDuration / this.frameTimes.length;
    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

    // Calculate average render and update times
    const avgRenderTime =
      this.frameTimes.reduce((sum, t) => sum + t.renderDuration, 0) / this.frameTimes.length;
    const avgUpdateTime =
      this.frameTimes.reduce((sum, t) => sum + t.updateDuration, 0) / this.frameTimes.length;

    return {
      fps: Math.round(fps * 100) / 100,
      frameTime: Math.round(avgFrameTime * 100) / 100,
      renderTime: Math.round(avgRenderTime * 100) / 100,
      updateTime: Math.round(avgUpdateTime * 100) / 100,
      droppedFrames: this.droppedFrames,
      totalFrames: this.totalFrames,
    };
  }

  /**
   * Check if performance is meeting target (60 fps).
   */
  isMeetingTarget(): boolean {
    const metrics = this.getMetrics();
    return metrics.fps >= this.targetFPS * 0.9; // Allow 10% tolerance
  }

  /**
   * Get detailed frame timing history.
   */
  getFrameHistory(): FrameTiming[] {
    return [...this.frameTimes];
  }

  /**
   * Reset all metrics.
   */
  reset(): void {
    this.frameTimes = [];
    this.totalFrames = 0;
    this.droppedFrames = 0;
    this.lastFrameTime = 0;
  }

  /**
   * Get performance summary as a string.
   */
  getSummary(): string {
    const metrics = this.getMetrics();
    const dropRate =
      metrics.totalFrames > 0
        ? ((metrics.droppedFrames / metrics.totalFrames) * 100).toFixed(1)
        : '0.0';

    return [
      `FPS: ${metrics.fps.toFixed(1)}/${this.targetFPS}`,
      `Frame Time: ${metrics.frameTime.toFixed(2)}ms`,
      `Render: ${metrics.renderTime.toFixed(2)}ms`,
      `Update: ${metrics.updateTime.toFixed(2)}ms`,
      `Dropped: ${metrics.droppedFrames} (${dropRate}%)`,
    ].join(' | ');
  }

  /**
   * Log performance warning if below target.
   */
  checkPerformanceWarning(): void {
    const metrics = this.getMetrics();

    if (metrics.fps < this.targetFPS * 0.8) {
      console.warn(
        `Performance warning: FPS ${metrics.fps.toFixed(1)} is below target ${this.targetFPS}`,
      );
    }

    if (metrics.droppedFrames > metrics.totalFrames * 0.1) {
      console.warn(
        `Performance warning: High dropped frame rate (${((metrics.droppedFrames / metrics.totalFrames) * 100).toFixed(1)}%)`,
      );
    }
  }

  /**
   * Set target FPS.
   */
  setTargetFPS(fps: number): void {
    if (fps <= 0) {
      throw new Error('Target FPS must be positive');
    }
    this.targetFPS = fps;
    this.targetFrameTime = 1000 / fps;
  }

  /**
   * Get target FPS.
   */
  getTargetFPS(): number {
    return this.targetFPS;
  }
}
