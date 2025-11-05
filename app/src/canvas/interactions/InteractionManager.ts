import type { Application } from 'pixi.js';

/** 2D point in canvas coordinates */
export interface Point {
  x: number;
  y: number;
}

/** Unified interaction event supporting touch, mouse, and keyboard */
export interface InteractionEvent {
  type: 'pointerdown' | 'pointerup' | 'pointermove' | 'wheel' | 'keydown' | 'keyup';
  point: Point;
  button?: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  deltaY?: number;
  key?: string;
}

/** Handler function for interaction events */
export type InteractionHandler = (event: InteractionEvent) => void;

/**
 * Manages user interactions for the canvas including touch, mouse, and keyboard
 * Provides unified event handling with proper cleanup to prevent memory leaks
 * @example
 * ```typescript
 * const manager = new InteractionManager(pixiApp.getApp());
 * manager.on('pointerdown', (event) => {
 *   console.log('Clicked at', event.point);
 * });
 * // Later: manager.destroy() to cleanup
 * ```
 */
export class InteractionManager {
  private handlers: Map<string, InteractionHandler[]> = new Map();
  private canvas: HTMLCanvasElement;
  private isEnabled = true;
  // Store bound handlers for proper cleanup
  private boundHandlers: {
    pointerdown: (e: PointerEvent) => void;
    pointerup: (e: PointerEvent) => void;
    pointermove: (e: PointerEvent) => void;
    wheel: (e: WheelEvent) => void;
    keydown: (e: KeyboardEvent) => void;
    keyup: (e: KeyboardEvent) => void;
  };

  constructor(private app: Application) {
    this.canvas = app.canvas as HTMLCanvasElement;
    // Bind handlers once to enable proper cleanup
    this.boundHandlers = {
      pointerdown: this.handlePointerDown.bind(this),
      pointerup: this.handlePointerUp.bind(this),
      pointermove: this.handlePointerMove.bind(this),
      wheel: this.handleWheel.bind(this),
      keydown: this.handleKeyDown.bind(this),
      keyup: this.handleKeyUp.bind(this),
    };
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for canvas and window
   * @private
   */
  private setupEventListeners(): void {
    // Pointer events
    this.canvas.addEventListener('pointerdown', this.boundHandlers.pointerdown);
    this.canvas.addEventListener('pointerup', this.boundHandlers.pointerup);
    this.canvas.addEventListener('pointermove', this.boundHandlers.pointermove);

    // Wheel events
    this.canvas.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });

    // Keyboard events
    window.addEventListener('keydown', this.boundHandlers.keydown);
    window.addEventListener('keyup', this.boundHandlers.keyup);
  }

  private getCanvasPoint(clientX: number, clientY: number): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  private handlePointerDown(e: PointerEvent): void {
    if (!this.isEnabled) return;
    e.preventDefault();

    const point = this.getCanvasPoint(e.clientX, e.clientY);
    this.emit({
      type: 'pointerdown',
      point,
      button: e.button,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });
  }

  private handlePointerUp(e: PointerEvent): void {
    if (!this.isEnabled) return;
    e.preventDefault();

    const point = this.getCanvasPoint(e.clientX, e.clientY);
    this.emit({
      type: 'pointerup',
      point,
      button: e.button,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });
  }

  private handlePointerMove(e: PointerEvent): void {
    if (!this.isEnabled) return;

    const point = this.getCanvasPoint(e.clientX, e.clientY);
    this.emit({
      type: 'pointermove',
      point,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });
  }

  private handleWheel(e: WheelEvent): void {
    if (!this.isEnabled) return;
    e.preventDefault();

    const point = this.getCanvasPoint(e.clientX, e.clientY);
    this.emit({
      type: 'wheel',
      point,
      deltaY: e.deltaY,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isEnabled) return;

    this.emit({
      type: 'keydown',
      point: { x: 0, y: 0 },
      key: e.key,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (!this.isEnabled) return;

    this.emit({
      type: 'keyup',
      point: { x: 0, y: 0 },
      key: e.key,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });
  }

  /**
   * Register an event handler for the specified event type
   * @param eventType - Event type to listen for
   * @param handler - Handler function to call when event occurs
   */
  public on(eventType: string, handler: InteractionHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  /**
   * Unregister an event handler for the specified event type
   * @param eventType - Event type to stop listening for
   * @param handler - Handler function to remove
   */
  public off(eventType: string, handler: InteractionHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all registered handlers
   * @param event - Event to emit
   * @private
   */
  private emit(event: InteractionEvent): void {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  /**
   * Enable interaction handling
   */
  public enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable interaction handling temporarily
   */
  public disable(): void {
    this.isEnabled = false;
  }

  /**
   * Cleanup all event listeners and handlers
   * Must be called when the component is unmounted to prevent memory leaks
   */
  public destroy(): void {
    // Remove event listeners using bound handlers
    this.canvas.removeEventListener('pointerdown', this.boundHandlers.pointerdown);
    this.canvas.removeEventListener('pointerup', this.boundHandlers.pointerup);
    this.canvas.removeEventListener('pointermove', this.boundHandlers.pointermove);
    this.canvas.removeEventListener('wheel', this.boundHandlers.wheel);
    window.removeEventListener('keydown', this.boundHandlers.keydown);
    window.removeEventListener('keyup', this.boundHandlers.keyup);

    // Clear all handlers
    this.handlers.clear();
  }
}
