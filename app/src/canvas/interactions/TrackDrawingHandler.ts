import type { Graphics } from 'pixi.js';
import { Graphics as PixiGraphics } from 'pixi.js';
import type { LandmarkService } from '../../services/placement/LandmarkService';
import type { TrackSegmentService } from '../../services/placement/TrackSegmentService';
import type { TrackRenderer } from '../renderer/TrackRenderer';
import type { InteractionEvent } from './InteractionManager';

export interface TrackDrawingOptions {
  classification?: 'mainline' | 'station' | 'depot';
  permissibleSpeedKph?: number;
  isBidirectional?: boolean;
  snapDistance?: number;
}

/**
 * Handles track drawing interactions with straight line snapping
 * Supports drawing tracks between landmarks with preview
 */
export class TrackDrawingHandler {
  private isActive = false;
  private startLandmarkId: string | null = null;
  private previewGraphics: Graphics | null = null;
  private options: TrackDrawingOptions = {
    classification: 'mainline',
    permissibleSpeedKph: 100,
    isBidirectional: true,
    snapDistance: 10,
  };

  constructor(
    private trackSegmentService: TrackSegmentService,
    private landmarkService: LandmarkService,
    private trackRenderer: TrackRenderer,
    private container: {
      stage: { addChild: (child: Graphics) => void; removeChild: (child: Graphics) => void };
    },
  ) {}

  /**
   * Activate track drawing mode
   */
  activate(options?: TrackDrawingOptions): void {
    this.isActive = true;
    if (options) {
      this.options = { ...this.options, ...options };
    }
    this.startLandmarkId = null;
  }

  /**
   * Deactivate track drawing mode
   */
  deactivate(): void {
    this.isActive = false;
    this.startLandmarkId = null;
    this.clearPreview();
  }

  /**
   * Handle pointer down event for track drawing
   */
  handlePointerDown(event: InteractionEvent): void {
    if (!this.isActive) {
      return;
    }

    const { x, y } = event.point;
    const landmark = this.findNearestLandmark(x, y, this.options.snapDistance ?? 10);

    if (!landmark) {
      console.warn('No landmark found near cursor position. Place landmarks first.');
      return;
    }

    if (!this.startLandmarkId) {
      // First click: select start landmark
      this.startLandmarkId = landmark.id;
      console.log(`Selected start landmark: ${landmark.id}`);
    } else {
      // Second click: create track segment
      if (this.startLandmarkId === landmark.id) {
        console.warn('Cannot create track segment to the same landmark');
        return;
      }

      // Check if track already exists
      const existing = this.trackSegmentService
        .getAll()
        .find(
          (seg) =>
            (seg.startLandmarkId === this.startLandmarkId && seg.endLandmarkId === landmark.id) ||
            (seg.endLandmarkId === this.startLandmarkId && seg.startLandmarkId === landmark.id),
        );

      if (existing) {
        console.warn('Track segment already exists between these landmarks');
        this.startLandmarkId = null;
        this.clearPreview();
        return;
      }

      // Create track segment
      const segment = this.trackSegmentService.create(
        this.startLandmarkId,
        landmark.id,
        this.options.classification ?? 'mainline',
        {
          permissibleSpeedKph: this.options.permissibleSpeedKph,
          isBidirectional: this.options.isBidirectional,
        },
      );

      // Render the track
      this.trackRenderer.render(segment);

      console.log(`Created track segment from ${this.startLandmarkId} to ${landmark.id}`);

      // Reset for next track
      this.startLandmarkId = null;
      this.clearPreview();
    }
  }

  /**
   * Handle pointer move event for track preview
   */
  handlePointerMove(event: InteractionEvent): void {
    if (!this.isActive || !this.startLandmarkId) {
      return;
    }

    const { x, y } = event.point;
    const startLandmark = this.landmarkService.get(this.startLandmarkId);

    if (!startLandmark) {
      return;
    }

    // Draw preview line from start landmark to cursor
    this.drawPreview(startLandmark.x, startLandmark.y, x, y);

    // Highlight nearest landmark if within snap distance
    const nearestLandmark = this.findNearestLandmark(x, y, this.options.snapDistance ?? 10);
    if (nearestLandmark && nearestLandmark.id !== this.startLandmarkId) {
      // Snap preview to landmark
      this.drawPreview(
        startLandmark.x,
        startLandmark.y,
        nearestLandmark.x,
        nearestLandmark.y,
        true,
      );
    }
  }

  /**
   * Find nearest landmark to the given position
   */
  private findNearestLandmark(
    x: number,
    y: number,
    maxDistance: number,
  ): { id: string; x: number; y: number } | null {
    const landmarks = this.landmarkService.getAll();
    let nearest: { id: string; x: number; y: number; distance: number } | null = null;

    for (const landmark of landmarks) {
      const distance = Math.sqrt((landmark.x - x) ** 2 + (landmark.y - y) ** 2);

      if (distance <= maxDistance && (!nearest || distance < nearest.distance)) {
        nearest = {
          id: landmark.id,
          x: landmark.x,
          y: landmark.y,
          distance,
        };
      }
    }

    return nearest;
  }

  /**
   * Draw preview line
   */
  private drawPreview(x1: number, y1: number, x2: number, y2: number, snapped = false): void {
    if (!this.previewGraphics) {
      this.previewGraphics = new PixiGraphics();
      this.container.stage.addChild(this.previewGraphics);
    }

    this.previewGraphics.clear();

    // Draw line with different style based on whether it's snapped
    if (snapped) {
      this.previewGraphics.lineStyle({
        width: 3,
        color: 0x00ff00,
        alpha: 0.7,
      });
    } else {
      this.previewGraphics.lineStyle({
        width: 2,
        color: 0x888888,
        alpha: 0.5,
      });
    }

    this.previewGraphics.moveTo(x1, y1);
    this.previewGraphics.lineTo(x2, y2);
  }

  /**
   * Clear preview graphics
   */
  private clearPreview(): void {
    if (this.previewGraphics) {
      this.container.stage.removeChild(this.previewGraphics);
      this.previewGraphics.destroy();
      this.previewGraphics = null;
    }
  }

  /**
   * Check if handler is active
   */
  isActivated(): boolean {
    return this.isActive;
  }

  /**
   * Update drawing options
   */
  updateOptions(options: Partial<TrackDrawingOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current drawing options
   */
  getOptions(): TrackDrawingOptions {
    return { ...this.options };
  }

  /**
   * Cancel current drawing operation
   */
  cancel(): void {
    this.startLandmarkId = null;
    this.clearPreview();
  }
}
