import * as PIXI from 'pixi.js';

/**
 * Trapezoid shape for train turning visualization
 */
export interface TrapezoidShape {
  points: number[]; // Flat array of x, y coordinates
  rotation: number;
}

/**
 * Corner information for turn rendering
 */
export interface CornerInfo {
  centerX: number;
  centerY: number;
  normalAngle: number; // Angle of the corner normal
  isSharp: boolean; // Whether this is a sharp turn (>45 degrees)
}

/**
 * Renderer for trains turning at corners.
 * Transforms train visualization into trapezoids aligned with corner normals.
 */
export class TurnRenderer {
  private app: PIXI.Application;
  private turnGraphics: Map<string, PIXI.Graphics> = new Map();
  private trainColor = 0x3498db; // Blue
  private trainStrokeColor = 0x2c3e50; // Dark blue

  constructor(app: PIXI.Application) {
    this.app = app;
  }

  /**
   * Render a train in turning mode as paired trapezoids.
   * @param trainId - Train identifier
   * @param cornerInfo - Corner geometry information
   * @param trainLength - Total length of the train
   * @param trainWidth - Width of the train
   * @param progress - Progress through the turn (0.0 to 1.0)
   */
  renderTurn(
    trainId: string,
    cornerInfo: CornerInfo,
    trainLength: number,
    trainWidth: number,
    progress: number,
  ): void {
    let graphics = this.turnGraphics.get(trainId);

    if (!graphics) {
      graphics = new PIXI.Graphics();
      this.app.stage.addChild(graphics);
      this.turnGraphics.set(trainId, graphics);
    }

    graphics.clear();

    // Calculate trapezoid shapes based on corner geometry
    const trapezoids = this.calculateTrapezoids(cornerInfo, trainLength, trainWidth, progress);

    // Draw each trapezoid
    for (const trapezoid of trapezoids) {
      this.drawTrapezoid(graphics, trapezoid);
    }
  }

  /**
   * Remove turn graphics for a train.
   */
  removeTurn(trainId: string): void {
    const graphics = this.turnGraphics.get(trainId);
    if (graphics) {
      this.app.stage.removeChild(graphics);
      graphics.destroy();
      this.turnGraphics.delete(trainId);
    }
  }

  /**
   * Clear all turn graphics.
   */
  clearAll(): void {
    for (const [trainId] of this.turnGraphics) {
      this.removeTurn(trainId);
    }
  }

  /**
   * Check if a train is in turning mode.
   */
  isTrainTurning(trainId: string): boolean {
    return this.turnGraphics.has(trainId);
  }

  /**
   * Set train colors for turn rendering.
   */
  setTrainColors(fillColor: number, strokeColor: number): void {
    this.trainColor = fillColor;
    this.trainStrokeColor = strokeColor;
  }

  /**
   * Calculate trapezoid shapes for turning train.
   * For consecutive corners, this maintains trapezoid geometry without snapping back to rectangles.
   */
  private calculateTrapezoids(
    cornerInfo: CornerInfo,
    trainLength: number,
    trainWidth: number,
    progress: number,
  ): TrapezoidShape[] {
    const { centerX, centerY, normalAngle, isSharp } = cornerInfo;

    // For a turning train, we create two trapezoids that bend along the corner normal
    const halfLength = trainLength / 2;
    const halfWidth = trainWidth / 2;

    // Calculate bend angle based on progress and corner sharpness
    const maxBendAngle = isSharp ? Math.PI / 3 : Math.PI / 6; // 60° or 30°
    const bendAngle = maxBendAngle * progress;

    // First trapezoid (front half of train)
    const frontTrapezoid = this.createTrapezoid(
      centerX,
      centerY,
      normalAngle,
      bendAngle / 2,
      halfLength,
      halfWidth,
      true,
    );

    // Second trapezoid (back half of train)
    const backTrapezoid = this.createTrapezoid(
      centerX,
      centerY,
      normalAngle + Math.PI,
      -bendAngle / 2,
      halfLength,
      halfWidth,
      false,
    );

    return [frontTrapezoid, backTrapezoid];
  }

  /**
   * Create a single trapezoid shape.
   */
  private createTrapezoid(
    centerX: number,
    centerY: number,
    baseAngle: number,
    bendAngle: number,
    length: number,
    width: number,
    _isFront: boolean,
  ): TrapezoidShape {
    const angle = baseAngle + bendAngle;

    // Calculate four corners of trapezoid
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Perpendicular direction for width
    const perpCos = Math.cos(angle + Math.PI / 2);
    const perpSin = Math.sin(angle + Math.PI / 2);

    // Calculate corner points
    const frontLeft = {
      x: centerX + cos * length + perpCos * width,
      y: centerY + sin * length + perpSin * width,
    };

    const frontRight = {
      x: centerX + cos * length - perpCos * width,
      y: centerY + sin * length - perpSin * width,
    };

    const backLeft = {
      x: centerX + perpCos * width,
      y: centerY + perpSin * width,
    };

    const backRight = {
      x: centerX - perpCos * width,
      y: centerY - perpSin * width,
    };

    // Return points in order for polygon drawing
    const points = [
      frontLeft.x,
      frontLeft.y,
      frontRight.x,
      frontRight.y,
      backRight.x,
      backRight.y,
      backLeft.x,
      backLeft.y,
    ];

    return {
      points,
      rotation: angle,
    };
  }

  /**
   * Draw a trapezoid shape.
   */
  private drawTrapezoid(graphics: PIXI.Graphics, trapezoid: TrapezoidShape): void {
    graphics.lineStyle(1, this.trainStrokeColor);
    graphics.beginFill(this.trainColor);
    graphics.drawPolygon(trapezoid.points);
    graphics.endFill();
  }

  /**
   * Highlight a turning train.
   */
  highlightTurn(trainId: string, highlightColor = 0xff9800): void {
    const graphics = this.turnGraphics.get(trainId);
    if (graphics) {
      // Redraw with highlight color
      graphics.tint = highlightColor;
    }
  }

  /**
   * Remove highlight from turning train.
   */
  removeHighlight(trainId: string): void {
    const graphics = this.turnGraphics.get(trainId);
    if (graphics) {
      graphics.tint = 0xffffff; // Reset to white (no tint)
    }
  }
}
