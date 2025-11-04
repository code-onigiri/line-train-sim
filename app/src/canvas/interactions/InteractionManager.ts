import type { Application } from 'pixi.js';

export interface Point {
  x: number;
  y: number;
}

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

export type InteractionHandler = (event: InteractionEvent) => void;

export class InteractionManager {
  private handlers: Map<string, InteractionHandler[]> = new Map();
  private canvas: HTMLCanvasElement;
  private isEnabled = true;

  constructor(private app: Application) {
    this.canvas = app.canvas as HTMLCanvasElement;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Pointer events
    this.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    this.canvas.addEventListener('pointerup', this.handlePointerUp.bind(this));
    this.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));

    // Wheel events
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
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

  public on(eventType: string, handler: InteractionHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  public off(eventType: string, handler: InteractionHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: InteractionEvent): void {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown.bind(this));
    this.canvas.removeEventListener('pointerup', this.handlePointerUp.bind(this));
    this.canvas.removeEventListener('pointermove', this.handlePointerMove.bind(this));
    this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    this.handlers.clear();
  }
}
