import { Container, Graphics, Text } from 'pixi.js';
import type { StationModel } from '../../models/Station';

export class StationRenderer {
  private container: Container;
  private graphics: Map<string, { area: Graphics; label: Text }> = new Map();

  constructor(parentContainer: Container) {
    this.container = new Container();
    parentContainer.addChild(this.container);
  }

  /**
   * Render a single station
   * @param station - Station model to render
   */
  render(station: StationModel): void {
    let elements = this.graphics.get(station.id);

    if (!elements) {
      const area = new Graphics();
      const label = new Text({
        text: station.name,
        style: {
          fontSize: 12,
          fill: 0x333333,
          fontWeight: 'bold',
        },
      });

      elements = { area, label };
      this.graphics.set(station.id, elements);
      this.container.addChild(area);
      this.container.addChild(label);
    }

    const { area, label } = elements;

    // Clear previous graphics
    area.clear();

    // Draw station area polygon
    const polygon = station.areaPolygon;
    if (polygon.length >= 3) {
      // Fill area
      area.poly(polygon.flatMap((p) => [p.x, p.y]));
      area.fill({ color: 0x0066cc, alpha: 0.2 });

      // Draw border
      area.poly(polygon.flatMap((p) => [p.x, p.y]));
      area.stroke({ width: 2, color: 0x0066cc, alpha: 0.8 });

      // Calculate center for label
      const centerX = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length;
      const centerY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;

      label.text = station.name;
      label.x = centerX - label.width / 2;
      label.y = centerY - label.height / 2;
    }

    // Draw platform indicators
    this.drawPlatformIndicators(area, station);
  }

  /**
   * Render multiple stations
   * @param stations - Array of station models to render
   */
  renderAll(stations: StationModel[]): void {
    // Track which stations are still active
    const activeStationIds = new Set(stations.map((s) => s.id));

    // Remove graphics for stations that no longer exist
    for (const [id, elements] of this.graphics.entries()) {
      if (!activeStationIds.has(id)) {
        elements.area.destroy();
        elements.label.destroy();
        this.graphics.delete(id);
      }
    }

    // Render all stations
    for (const station of stations) {
      this.render(station);
    }
  }

  /**
   * Remove a station graphic
   * @param stationId - ID of station to remove
   */
  remove(stationId: string): void {
    const elements = this.graphics.get(stationId);
    if (elements) {
      elements.area.destroy();
      elements.label.destroy();
      this.graphics.delete(stationId);
    }
  }

  /**
   * Clear all station graphics
   */
  clear(): void {
    for (const elements of this.graphics.values()) {
      elements.area.destroy();
      elements.label.destroy();
    }
    this.graphics.clear();
  }

  private drawPlatformIndicators(graphic: Graphics, station: StationModel): void {
    // Draw small indicators for number of platforms
    const polygon = station.areaPolygon;
    if (polygon.length < 3) return;

    const centerX = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length;
    const centerY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;

    const platformCount = station.platforms.length;
    const indicatorRadius = 3;
    const spacing = 8;
    const startX = centerX - ((platformCount - 1) * spacing) / 2;

    for (let i = 0; i < platformCount; i++) {
      const x = startX + i * spacing;
      const y = centerY + 15; // Below the label

      graphic.circle(x, y, indicatorRadius);
      graphic.fill({ color: 0xffffff, alpha: 0.8 });
      graphic.circle(x, y, indicatorRadius);
      graphic.stroke({ width: 1, color: 0x0066cc, alpha: 0.8 });
    }
  }

  /**
   * Highlight a station
   * @param stationId - ID of station to highlight
   */
  highlight(stationId: string): void {
    const elements = this.graphics.get(stationId);
    if (elements) {
      elements.area.alpha = 1;
    }
  }

  /**
   * Remove highlight from a station
   * @param stationId - ID of station to unhighlight
   */
  unhighlight(stationId: string): void {
    const elements = this.graphics.get(stationId);
    if (elements) {
      elements.area.alpha = 0.6;
    }
  }

  /**
   * Destroy the renderer and cleanup resources
   */
  destroy(): void {
    this.clear();
    this.container.destroy({ children: true });
  }
}
