import { Container, Graphics } from 'pixi.js';
import type { TrackSegmentModel } from '../../models/TrackSegment';
import type { LandmarkService } from '../../services/placement/LandmarkService';

export class TrackRenderer {
  private container: Container;
  private graphics: Map<string, Graphics> = new Map();

  constructor(
    parentContainer: Container,
    private landmarkService: LandmarkService,
  ) {
    this.container = new Container();
    parentContainer.addChild(this.container);
  }

  /**
   * Render a single track segment
   * @param track - Track segment model to render
   */
  render(track: TrackSegmentModel): void {
    let graphic = this.graphics.get(track.id);

    if (!graphic) {
      graphic = new Graphics();
      this.graphics.set(track.id, graphic);
      this.container.addChild(graphic);
    }

    // Clear previous graphics
    graphic.clear();

    // Get landmark positions
    const startLandmark = this.landmarkService.get(track.startLandmarkId);
    const endLandmark = this.landmarkService.get(track.endLandmarkId);

    if (!startLandmark || !endLandmark) {
      return;
    }

    // Draw track line
    const color = this.getColorByClassification(track.classification);
    const lineWidth = this.getLineWidthByClassification(track.classification);

    // Main track line
    graphic.moveTo(startLandmark.x, startLandmark.y);
    graphic.lineTo(endLandmark.x, endLandmark.y);
    graphic.stroke({ width: lineWidth, color, alpha: 0.8 });

    // Draw elevation indicator if elevated or underground
    if (track.elevation > 0) {
      // Elevated track - draw parallel line above
      this.drawElevationIndicator(
        graphic,
        startLandmark.x,
        startLandmark.y,
        endLandmark.x,
        endLandmark.y,
        2,
        0x4a90e2,
      );
    } else if (track.elevation < 0) {
      // Underground track - draw dashed pattern
      this.drawUndergroundPattern(
        graphic,
        startLandmark.x,
        startLandmark.y,
        endLandmark.x,
        endLandmark.y,
        0x8b4513,
      );
    }

    // Draw direction indicators if not bidirectional
    if (!track.isBidirectional) {
      this.drawDirectionArrow(
        graphic,
        startLandmark.x,
        startLandmark.y,
        endLandmark.x,
        endLandmark.y,
        color,
      );
    }
  }

  /**
   * Render multiple track segments
   * @param tracks - Array of track segment models to render
   */
  renderAll(tracks: TrackSegmentModel[]): void {
    // Track which tracks are still active
    const activeTrackIds = new Set(tracks.map((t) => t.id));

    // Remove graphics for tracks that no longer exist
    for (const [id, graphic] of this.graphics.entries()) {
      if (!activeTrackIds.has(id)) {
        graphic.destroy();
        this.graphics.delete(id);
      }
    }

    // Render all tracks
    for (const track of tracks) {
      this.render(track);
    }
  }

  /**
   * Remove a track graphic
   * @param trackId - ID of track to remove
   */
  remove(trackId: string): void {
    const graphic = this.graphics.get(trackId);
    if (graphic) {
      graphic.destroy();
      this.graphics.delete(trackId);
    }
  }

  /**
   * Clear all track graphics
   */
  clear(): void {
    for (const graphic of this.graphics.values()) {
      graphic.destroy();
    }
    this.graphics.clear();
  }

  private getColorByClassification(classification: 'mainline' | 'station' | 'depot'): number {
    switch (classification) {
      case 'mainline':
        return 0x333333; // Dark gray
      case 'station':
        return 0x0066cc; // Blue
      case 'depot':
        return 0xcc6600; // Orange
    }
  }

  private getLineWidthByClassification(classification: 'mainline' | 'station' | 'depot'): number {
    switch (classification) {
      case 'mainline':
        return 3;
      case 'station':
        return 2;
      case 'depot':
        return 2;
    }
  }

  private drawElevationIndicator(
    graphic: Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    offset: number,
    color: number,
  ): void {
    // Calculate perpendicular offset
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = (-dy / length) * offset;
    const ny = (dx / length) * offset;

    graphic.moveTo(x1 + nx, y1 + ny);
    graphic.lineTo(x2 + nx, y2 + ny);
    graphic.stroke({ width: 1, color, alpha: 0.6 });
  }

  private drawUndergroundPattern(
    graphic: Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number,
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const dashLength = 5;
    const gapLength = 3;
    const totalDashLength = dashLength + gapLength;
    const numDashes = Math.floor(length / totalDashLength);

    for (let i = 0; i < numDashes; i++) {
      const t1 = (i * totalDashLength) / length;
      const t2 = (i * totalDashLength + dashLength) / length;

      const startX = x1 + dx * t1;
      const startY = y1 + dy * t1;
      const endX = x1 + dx * t2;
      const endY = y1 + dy * t2;

      graphic.moveTo(startX, startY);
      graphic.lineTo(endX, endY);
      graphic.stroke({ width: 1, color, alpha: 0.5 });
    }
  }

  private drawDirectionArrow(
    graphic: Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number,
  ): void {
    // Draw arrow at midpoint
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / length;
    const dirY = dy / length;

    const arrowSize = 5;
    const perpX = -dirY;
    const perpY = dirX;

    // Arrow tip
    const tipX = midX + dirX * arrowSize;
    const tipY = midY + dirY * arrowSize;

    // Arrow base
    const base1X = midX + perpX * arrowSize * 0.5;
    const base1Y = midY + perpY * arrowSize * 0.5;
    const base2X = midX - perpX * arrowSize * 0.5;
    const base2Y = midY - perpY * arrowSize * 0.5;

    graphic.moveTo(tipX, tipY);
    graphic.lineTo(base1X, base1Y);
    graphic.lineTo(base2X, base2Y);
    graphic.lineTo(tipX, tipY);
    graphic.fill({ color, alpha: 0.8 });
  }

  /**
   * Destroy the renderer and cleanup resources
   */
  destroy(): void {
    this.clear();
    this.container.destroy({ children: true });
  }
}
