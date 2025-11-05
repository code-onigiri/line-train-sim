import type { DepotService } from '../../services/placement/DepotService';
import type { LandmarkService } from '../../services/placement/LandmarkService';
import type { StationService } from '../../services/placement/StationService';
import type { TrackSegmentService } from '../../services/placement/TrackSegmentService';
import type { InteractionEvent } from './InteractionManager';

export type SelectableEntityType = 'landmark' | 'track' | 'station' | 'depot';

export interface SelectedEntity {
  type: SelectableEntityType;
  id: string;
}

export interface SelectionOptions {
  multiSelect?: boolean;
  selectDistance?: number;
}

/**
 * Handles selection and editing of existing infrastructure
 * Supports single and multi-select with keyboard modifiers
 */
export class SelectionHandler {
  private isActive = false;
  private selectedEntities: SelectedEntity[] = [];
  private options: SelectionOptions = {
    multiSelect: false,
    selectDistance: 10,
  };

  // Callbacks for selection changes
  private onSelectionChangeCallbacks: Array<(selected: SelectedEntity[]) => void> = [];

  constructor(
    private landmarkService: LandmarkService,
    private trackSegmentService: TrackSegmentService,
    private stationService: StationService,
    private depotService: DepotService,
  ) {}

  /**
   * Activate selection mode
   */
  activate(options?: SelectionOptions): void {
    this.isActive = true;
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  /**
   * Deactivate selection mode
   */
  deactivate(): void {
    this.isActive = false;
    this.clearSelection();
  }

  /**
   * Handle pointer down for selection
   */
  handlePointerDown(event: InteractionEvent): void {
    if (!this.isActive) {
      return;
    }

    const { x, y } = event.point;
    const selectDistance = this.options.selectDistance ?? 10;

    // Try to find entity at click position
    const entity = this.findEntityAtPosition(x, y, selectDistance);

    if (!entity) {
      // Click on empty space - clear selection unless holding Shift/Ctrl
      if (!event.shiftKey && !event.ctrlKey) {
        this.clearSelection();
      }
      return;
    }

    // Handle multi-select
    if ((event.shiftKey || event.ctrlKey) && this.options.multiSelect) {
      // Toggle selection
      const index = this.selectedEntities.findIndex(
        (e) => e.type === entity.type && e.id === entity.id,
      );

      if (index >= 0) {
        // Deselect
        this.selectedEntities.splice(index, 1);
      } else {
        // Add to selection
        this.selectedEntities.push(entity);
      }
    } else {
      // Single select
      this.selectedEntities = [entity];
    }

    this.notifySelectionChange();
  }

  /**
   * Find entity at position using nearest-neighbor search
   */
  private findEntityAtPosition(x: number, y: number, maxDistance: number): SelectedEntity | null {
    // Try landmarks first (smallest)
    const landmark = this.landmarkService.findByPosition(x, y, maxDistance);
    if (landmark) {
      return { type: 'landmark', id: landmark.id };
    }

    // Try tracks (linear)
    const track = this.findNearestTrack(x, y, maxDistance);
    if (track) {
      return { type: 'track', id: track };
    }

    // Try stations (area)
    const station = this.findStationAtPosition(x, y);
    if (station) {
      return { type: 'station', id: station };
    }

    // Try depots (area)
    const depot = this.findDepotAtPosition(x, y);
    if (depot) {
      return { type: 'depot', id: depot };
    }

    return null;
  }

  /**
   * Find nearest track segment to position
   */
  private findNearestTrack(x: number, y: number, maxDistance: number): string | null {
    const tracks = this.trackSegmentService.getAll();
    let nearestTrack: string | null = null;
    let minDistance = maxDistance;

    for (const track of tracks) {
      const startLandmark = this.landmarkService.get(track.startLandmarkId);
      const endLandmark = this.landmarkService.get(track.endLandmarkId);

      if (!startLandmark || !endLandmark) {
        continue;
      }

      // Calculate distance from point to line segment
      const distance = this.pointToLineDistance(
        x,
        y,
        startLandmark.x,
        startLandmark.y,
        endLandmark.x,
        endLandmark.y,
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestTrack = track.id;
      }
    }

    return nearestTrack;
  }

  /**
   * Calculate distance from point to line segment
   */
  private pointToLineDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
      // Line segment is a point
      return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    }

    // Calculate projection parameter t
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));

    // Find closest point on segment
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    // Return distance to closest point
    return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
  }

  /**
   * Find station at position (point in polygon test)
   */
  private findStationAtPosition(x: number, y: number): string | null {
    const stations = this.stationService.getAll();

    for (const station of stations) {
      if (this.isPointInPolygon(x, y, station.areaPolygon)) {
        return station.id;
      }
    }

    return null;
  }

  /**
   * Find depot at position (point in polygon test)
   */
  private findDepotAtPosition(x: number, y: number): string | null {
    const depots = this.depotService.getAll();

    for (const depot of depots) {
      if (this.isPointInPolygon(x, y, depot.areaPolygon)) {
        return depot.id;
      }
    }

    return null;
  }

  /**
   * Check if point is inside polygon using ray casting algorithm
   */
  private isPointInPolygon(
    x: number,
    y: number,
    polygon: Array<{ x: number; y: number }>,
  ): boolean {
    if (polygon.length < 3) {
      return false;
    }

    let inside = false;
    let j = polygon.length - 1;

    for (let i = 0; i < polygon.length; i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (intersect) {
        inside = !inside;
      }

      j = i;
    }

    return inside;
  }

  /**
   * Clear current selection
   */
  clearSelection(): void {
    this.selectedEntities = [];
    this.notifySelectionChange();
  }

  /**
   * Get currently selected entities
   */
  getSelection(): SelectedEntity[] {
    return [...this.selectedEntities];
  }

  /**
   * Select entity by ID and type
   */
  selectEntity(type: SelectableEntityType, id: string): void {
    const entity: SelectedEntity = { type, id };

    if (this.options.multiSelect) {
      // Add to selection if not already selected
      const exists = this.selectedEntities.some((e) => e.type === type && e.id === id);
      if (!exists) {
        this.selectedEntities.push(entity);
        this.notifySelectionChange();
      }
    } else {
      // Replace selection
      this.selectedEntities = [entity];
      this.notifySelectionChange();
    }
  }

  /**
   * Deselect entity by ID and type
   */
  deselectEntity(type: SelectableEntityType, id: string): void {
    const index = this.selectedEntities.findIndex((e) => e.type === type && e.id === id);
    if (index >= 0) {
      this.selectedEntities.splice(index, 1);
      this.notifySelectionChange();
    }
  }

  /**
   * Check if entity is selected
   */
  isSelected(type: SelectableEntityType, id: string): boolean {
    return this.selectedEntities.some((e) => e.type === type && e.id === id);
  }

  /**
   * Delete selected entities
   */
  deleteSelected(): void {
    for (const entity of this.selectedEntities) {
      switch (entity.type) {
        case 'landmark':
          this.landmarkService.delete(entity.id);
          break;
        case 'track':
          this.trackSegmentService.delete(entity.id);
          break;
        case 'station':
          this.stationService.delete(entity.id);
          break;
        case 'depot':
          this.depotService.delete(entity.id);
          break;
      }
    }

    this.clearSelection();
  }

  /**
   * Register callback for selection changes
   */
  onSelectionChange(callback: (selected: SelectedEntity[]) => void): void {
    this.onSelectionChangeCallbacks.push(callback);
  }

  /**
   * Notify all registered callbacks of selection change
   */
  private notifySelectionChange(): void {
    for (const callback of this.onSelectionChangeCallbacks) {
      callback(this.getSelection());
    }
  }

  /**
   * Check if handler is active
   */
  isActivated(): boolean {
    return this.isActive;
  }

  /**
   * Update selection options
   */
  updateOptions(options: Partial<SelectionOptions>): void {
    this.options = { ...this.options, ...options };
  }
}
