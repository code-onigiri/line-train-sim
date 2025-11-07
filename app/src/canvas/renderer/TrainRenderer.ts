import * as PIXI from 'pixi.js';
import type { ScheduledTrainModel } from '../../models/ScheduledTrain';

/**
 * Visual representation of a train
 */
export interface TrainVisual {
  graphics: PIXI.Graphics;
  trainId: string;
  x: number;
  y: number;
  rotation: number;
  length: number;
  width: number;
}

/**
 * Renderer for train rectangles on straight track segments.
 * Handles basic train visualization as single rectangles.
 */
export class TrainRenderer {
  private app: PIXI.Application;
  private trainGraphics: Map<string, TrainVisual> = new Map();
  private trainColor = 0x3498db; // Blue
  private trainStrokeColor = 0x2c3e50; // Dark blue
  private trainWidth = 8; // Default train width in pixels
  private trainLength = 20; // Default train length in pixels

  constructor(app: PIXI.Application) {
    this.app = app;
  }

  /**
   * Render a train as a rectangle.
   * @param train - The scheduled train
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param rotation - Rotation in radians
   */
  renderTrain(train: ScheduledTrainModel, x: number, y: number, rotation: number): void {
    let visual = this.trainGraphics.get(train.id);

    if (!visual) {
      // Create new graphics object for this train
      const graphics = new PIXI.Graphics();
      this.app.stage.addChild(graphics);

      visual = {
        graphics,
        trainId: train.id,
        x,
        y,
        rotation,
        length: this.trainLength,
        width: this.trainWidth,
      };

      this.trainGraphics.set(train.id, visual);
    }

    // Update position and rotation
    visual.x = x;
    visual.y = y;
    visual.rotation = rotation;

    // Redraw the train
    this.drawTrainRectangle(visual);
  }

  /**
   * Remove a train from rendering.
   */
  removeTrain(trainId: string): void {
    const visual = this.trainGraphics.get(trainId);
    if (visual) {
      this.app.stage.removeChild(visual.graphics);
      visual.graphics.destroy();
      this.trainGraphics.delete(trainId);
    }
  }

  /**
   * Update train position without redrawing.
   */
  updatePosition(trainId: string, x: number, y: number, rotation: number): void {
    const visual = this.trainGraphics.get(trainId);
    if (visual) {
      visual.x = x;
      visual.y = y;
      visual.rotation = rotation;
      visual.graphics.x = x;
      visual.graphics.y = y;
      visual.graphics.rotation = rotation;
    }
  }

  /**
   * Clear all trains.
   */
  clearAll(): void {
    for (const [trainId] of this.trainGraphics) {
      this.removeTrain(trainId);
    }
  }

  /**
   * Get all rendered train IDs.
   */
  getRenderedTrains(): string[] {
    return Array.from(this.trainGraphics.keys());
  }

  /**
   * Set train dimensions.
   */
  setTrainDimensions(length: number, width: number): void {
    this.trainLength = length;
    this.trainWidth = width;

    // Redraw all trains with new dimensions
    for (const visual of this.trainGraphics.values()) {
      visual.length = length;
      visual.width = width;
      this.drawTrainRectangle(visual);
    }
  }

  /**
   * Set train colors.
   */
  setTrainColors(fillColor: number, strokeColor: number): void {
    this.trainColor = fillColor;
    this.trainStrokeColor = strokeColor;

    // Redraw all trains with new colors
    for (const visual of this.trainGraphics.values()) {
      this.drawTrainRectangle(visual);
    }
  }

  /**
   * Draw train as a rectangle.
   */
  private drawTrainRectangle(visual: TrainVisual): void {
    const { graphics, length, width } = visual;

    graphics.clear();
    graphics.lineStyle(1, this.trainStrokeColor);
    graphics.beginFill(this.trainColor);

    // Draw rectangle centered on position
    graphics.drawRect(-length / 2, -width / 2, length, width);

    graphics.endFill();

    // Update position and rotation
    graphics.x = visual.x;
    graphics.y = visual.y;
    graphics.rotation = visual.rotation;
  }

  /**
   * Highlight a specific train (e.g., for selection).
   */
  highlightTrain(trainId: string, highlightColor = 0xff9800): void {
    const visual = this.trainGraphics.get(trainId);
    if (visual) {
      const { graphics, length, width } = visual;

      graphics.clear();
      graphics.lineStyle(2, highlightColor);
      graphics.beginFill(this.trainColor);
      graphics.drawRect(-length / 2, -width / 2, length, width);
      graphics.endFill();

      graphics.x = visual.x;
      graphics.y = visual.y;
      graphics.rotation = visual.rotation;
    }
  }

  /**
   * Remove highlight from a train.
   */
  removeHighlight(trainId: string): void {
    const visual = this.trainGraphics.get(trainId);
    if (visual) {
      this.drawTrainRectangle(visual);
    }
  }

  /**
   * Get train visual by ID.
   */
  getTrainVisual(trainId: string): TrainVisual | undefined {
    return this.trainGraphics.get(trainId);
  }
}
