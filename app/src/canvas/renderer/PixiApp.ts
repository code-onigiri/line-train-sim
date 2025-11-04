import { Application, Container } from 'pixi.js';

export class PixiApp {
  private app: Application;
  private mainContainer: Container;
  private isInitialized = false;

  constructor() {
    this.app = new Application();
    this.mainContainer = new Container();
  }

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

  private update(_delta: number): void {
    // Update logic will be handled by renderer instances
  }

  public getApp(): Application {
    return this.app;
  }

  public getMainContainer(): Container {
    return this.mainContainer;
  }

  public resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
  }

  public destroy(): void {
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    this.isInitialized = false;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let pixiAppInstance: PixiApp | null = null;

export function getPixiApp(): PixiApp {
  if (!pixiAppInstance) {
    pixiAppInstance = new PixiApp();
  }
  return pixiAppInstance;
}

export function destroyPixiApp(): void {
  if (pixiAppInstance) {
    pixiAppInstance.destroy();
    pixiAppInstance = null;
  }
}
