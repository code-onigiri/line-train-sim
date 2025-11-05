import type { FederatedPointerEvent } from 'pixi.js';
import type { LandmarkService } from '../../services/placement/LandmarkService';
import type { LandmarkRenderer } from '../renderer/LandmarkRenderer';

export interface PlacementOptions {
  elevation?: number;
  snapToGrid?: boolean;
  gridSize?: number;
}

export class LandmarkPlacementHandler {
  private isActive = false;
  private options: PlacementOptions = {
    elevation: 0,
    snapToGrid: false,
    gridSize: 10,
  };

  constructor(
    private landmarkService: LandmarkService,
    private landmarkRenderer: LandmarkRenderer,
  ) {}

  /**
   * Activate landmark placement mode
   */
  activate(options?: PlacementOptions): void {
    this.isActive = true;
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  /**
   * Deactivate landmark placement mode
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Handle pointer down event for landmark placement
   */
  handlePointerDown(event: FederatedPointerEvent): void {
    if (!this.isActive) {
      return;
    }

    const { x, y } = this.getSnappedPosition(event.global.x, event.global.y);

    // Check if landmark already exists at this position
    const existing = this.landmarkService.findByPosition(x, y, 5);
    if (existing) {
      console.warn('Landmark already exists at this position');
      return;
    }

    // Create new landmark
    const landmark = this.landmarkService.create(x, y, this.options.elevation ?? 0, {
      createdBy: 'user',
      createdAt: Date.now(),
    });

    // Render the landmark
    this.landmarkRenderer.render(landmark);

    console.log(`Created landmark at (${x}, ${y})`);
  }

  /**
   * Handle pointer move event (for preview)
   */
  handlePointerMove(_event: FederatedPointerEvent): void {
    if (!this.isActive) {
      return;
    }

    // TODO: Implement preview circle at cursor position
    // This would show where the landmark will be placed
  }

  /**
   * Get snapped position if grid snapping is enabled
   */
  private getSnappedPosition(x: number, y: number): { x: number; y: number } {
    if (!this.options.snapToGrid || !this.options.gridSize) {
      return { x, y };
    }

    const gridSize = this.options.gridSize;
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }

  /**
   * Check if handler is active
   */
  isActivated(): boolean {
    return this.isActive;
  }

  /**
   * Update placement options
   */
  updateOptions(options: Partial<PlacementOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current placement options
   */
  getOptions(): PlacementOptions {
    return { ...this.options };
  }
}
