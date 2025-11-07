import { Container, Graphics } from 'pixi.js';
import type { LandmarkModel } from '../../models/Landmark';

export class LandmarkRenderer {
  private container: Container;
  private graphics: Map<string, Graphics> = new Map();
  private lastRenderedState: Map<string, string> = new Map();

  constructor(parentContainer: Container) {
    this.container = new Container();
    parentContainer.addChild(this.container);
  }

  /**
   * Render a single landmark
   * @param landmark - Landmark model to render
   * @param force - Force re-render even if state hasn't changed
   */
  render(landmark: LandmarkModel, force = false): void {
    // Generate state hash to detect changes
    const stateHash = `${landmark.x},${landmark.y},${landmark.elevation},${landmark.connections.length}`;
    const lastHash = this.lastRenderedState.get(landmark.id);

    // Skip rendering if state hasn't changed (performance optimization)
    if (!force && lastHash === stateHash) {
      return;
    }

    let graphic = this.graphics.get(landmark.id);

    if (!graphic) {
      graphic = new Graphics();
      this.graphics.set(landmark.id, graphic);
      this.container.addChild(graphic);
    }

    // Clear previous graphics
    graphic.clear();

    // Draw landmark as a circle
    const radius = 5;
    const color = this.getColorByElevation(landmark.elevation);

    // Draw filled circle
    graphic.circle(landmark.x, landmark.y, radius).fill({ color, alpha: 1 });

    // Draw border
    graphic
      .circle(landmark.x, landmark.y, radius)
      .stroke({ width: 1, color: 0x000000, alpha: 0.5 });

    // If landmark has connections, show as a junction
    if (landmark.connections.length > 2) {
      graphic
        .circle(landmark.x, landmark.y, radius + 2)
        .stroke({ width: 2, color: 0x0066cc, alpha: 0.8 });
    }

    // Cache the rendered state
    this.lastRenderedState.set(landmark.id, stateHash);
  }

  /**
   * Render multiple landmarks
   * @param landmarks - Array of landmark models to render
   */
  renderAll(landmarks: LandmarkModel[]): void {
    // Track which landmarks are still active
    const activeLandmarkIds = new Set(landmarks.map((l) => l.id));

    // Remove graphics for landmarks that no longer exist
    for (const [id, graphic] of this.graphics.entries()) {
      if (!activeLandmarkIds.has(id)) {
        graphic.destroy();
        this.graphics.delete(id);
      }
    }

    // Render all landmarks
    for (const landmark of landmarks) {
      this.render(landmark);
    }
  }

  /**
   * Remove a landmark graphic
   * @param landmarkId - ID of landmark to remove
   */
  remove(landmarkId: string): void {
    const graphic = this.graphics.get(landmarkId);
    if (graphic) {
      graphic.destroy();
      this.graphics.delete(landmarkId);
      this.lastRenderedState.delete(landmarkId);
    }
  }

  /**
   * Clear all landmark graphics
   */
  clear(): void {
    for (const graphic of this.graphics.values()) {
      graphic.destroy();
    }
    this.graphics.clear();
    this.lastRenderedState.clear();
  }

  /**
   * Get color based on elevation
   * Ground level: gray, Elevated: blue, Underground: brown
   */
  private getColorByElevation(elevation: number): number {
    if (elevation > 0) {
      return 0x4a90e2; // Blue for elevated
    }
    if (elevation < 0) {
      return 0x8b4513; // Brown for underground
    }
    return 0x808080; // Gray for ground level
  }

  /**
   * Destroy the renderer and cleanup resources
   */
  destroy(): void {
    this.clear();
    this.container.destroy({ children: true });
  }
}
