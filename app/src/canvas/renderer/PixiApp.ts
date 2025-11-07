import { Application, Container } from 'pixi.js';

/**
 * PixiJS application wrapper for train simulation rendering
 * Manages the main canvas, render loop, and scene container
 * @example
 * ```typescript
 * const pixiApp = getPixiApp();
 * await pixiApp.initialize(canvasElement);
 * const container = pixiApp.getMainContainer();
 * // Add your graphics to container
 * ```
 */
export class PixiApp {
  private app: Application;
  private mainContainer: Container;
  private isInitialized = false;

  constructor() {
    this.app = new Application();
    this.mainContainer = new Container();
  }

  /**
   * Initialize the PixiJS application with the given canvas element
   * @param canvas - HTML canvas element to render into
   * @throws {Error} If initialization fails
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    if (this.isInitialized) {
      console.warn('PixiApp already initialized');
      return;
    }

    await this.app.init({
      canvas,
      backgroundColor: 0xf5f5f5,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
      resizeTo: canvas.parentElement || window,
    });

    this.app.stage.addChild(this.mainContainer);
    this.isInitialized = true;

    // Start render loop
    this.app.ticker.add(this.update.bind(this));
  }

  /**
   * Update callback for render loop
   * @param _delta - Time delta since last frame (unused, reserved for future use)
   * @private
   */
  private update(_delta: number): void {
    // Update logic will be handled by renderer instances
  }

  /**
   * Get the underlying PixiJS Application instance
   * @returns PixiJS Application
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Get the main container for adding scene graphics
   * @returns Main scene container
   */
  public getMainContainer(): Container {
    return this.mainContainer;
  }

  /**
   * Resize the renderer to the specified dimensions
   * @param width - New width in pixels
   * @param height - New height in pixels
   */
  public resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
  }

  /**
   * Destroy the PixiJS application and cleanup resources
   * Should be called when the component is unmounted
   */
  public destroy(): void {
    if (this.isInitialized) {
      this.app.destroy({ removeView: true });
      this.isInitialized = false;
    }
  }

  /**
   * Check if the application has been initialized
   * @returns True if initialized, false otherwise
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let pixiAppInstance: PixiApp | null = null;

/**
 * Get the singleton PixiApp instance
 * Creates a new instance if one doesn't exist
 * @returns PixiApp singleton
 */
export function getPixiApp(): PixiApp {
  if (!pixiAppInstance) {
    pixiAppInstance = new PixiApp();
  }
  return pixiAppInstance;
}

/**
 * Destroy the singleton PixiApp instance
 * Cleans up all resources and resets the singleton
 */
export function destroyPixiApp(): void {
  if (pixiAppInstance) {
    pixiAppInstance.destroy();
    pixiAppInstance = null;
  }
}
