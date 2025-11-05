import { Container, Graphics, Text } from 'pixi.js';
import type { DepotModel } from '../../models/Depot';

export class DepotRenderer {
  private container: Container;
  private graphics: Map<string, { area: Graphics; label: Text }> = new Map();

  constructor(parentContainer: Container) {
    this.container = new Container();
    parentContainer.addChild(this.container);
  }

  /**
   * Render a single depot
   * @param depot - Depot model to render
   */
  render(depot: DepotModel): void {
    let elements = this.graphics.get(depot.id);

    if (!elements) {
      const area = new Graphics();
      const label = new Text({
        text: depot.name,
        style: {
          fontSize: 12,
          fill: 0x333333,
          fontWeight: 'bold',
        },
      });

      elements = { area, label };
      this.graphics.set(depot.id, elements);
      this.container.addChild(area);
      this.container.addChild(label);
    }

    const { area, label } = elements;

    // Clear previous graphics
    area.clear();

    // Draw depot area polygon
    const polygon = depot.areaPolygon;
    if (polygon.length >= 3) {
      // Fill area
      area.poly(polygon.flatMap((p) => [p.x, p.y]));
      area.fill({ color: 0xcc6600, alpha: 0.2 });

      // Draw border
      area.poly(polygon.flatMap((p) => [p.x, p.y]));
      area.stroke({ width: 2, color: 0xcc6600, alpha: 0.8 });

      // Calculate center for label
      const centerX = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length;
      const centerY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;

      label.text = depot.name;
      label.x = centerX - label.width / 2;
      label.y = centerY - label.height / 2;
    }

    // Draw lane indicators
    this.drawLaneIndicators(area, depot);

    // Draw inventory summary
    this.drawInventorySummary(area, depot);
  }

  /**
   * Render multiple depots
   * @param depots - Array of depot models to render
   */
  renderAll(depots: DepotModel[]): void {
    // Track which depots are still active
    const activeDepotIds = new Set(depots.map((d) => d.id));

    // Remove graphics for depots that no longer exist
    for (const [id, elements] of this.graphics.entries()) {
      if (!activeDepotIds.has(id)) {
        elements.area.destroy();
        elements.label.destroy();
        this.graphics.delete(id);
      }
    }

    // Render all depots
    for (const depot of depots) {
      this.render(depot);
    }
  }

  /**
   * Remove a depot graphic
   * @param depotId - ID of depot to remove
   */
  remove(depotId: string): void {
    const elements = this.graphics.get(depotId);
    if (elements) {
      elements.area.destroy();
      elements.label.destroy();
      this.graphics.delete(depotId);
    }
  }

  /**
   * Clear all depot graphics
   */
  clear(): void {
    for (const elements of this.graphics.values()) {
      elements.area.destroy();
      elements.label.destroy();
    }
    this.graphics.clear();
  }

  private drawLaneIndicators(graphic: Graphics, depot: DepotModel): void {
    // Draw small indicators for number of lanes
    const polygon = depot.areaPolygon;
    if (polygon.length < 3) return;

    const centerX = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length;
    const centerY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;

    const laneCount = depot.stoppingLanes.length;
    const indicatorWidth = 6;
    const indicatorHeight = 3;
    const spacing = 8;
    const startX = centerX - ((laneCount - 1) * spacing) / 2;

    for (let i = 0; i < laneCount; i++) {
      const x = startX + i * spacing;
      const y = centerY + 15; // Below the label

      graphic.rect(
        x - indicatorWidth / 2,
        y - indicatorHeight / 2,
        indicatorWidth,
        indicatorHeight,
      );
      graphic.fill({ color: 0xffffff, alpha: 0.8 });
      graphic.rect(
        x - indicatorWidth / 2,
        y - indicatorHeight / 2,
        indicatorWidth,
        indicatorHeight,
      );
      graphic.stroke({ width: 1, color: 0xcc6600, alpha: 0.8 });
    }
  }

  private drawInventorySummary(graphic: Graphics, depot: DepotModel): void {
    // Draw inventory count indicator
    const polygon = depot.areaPolygon;
    if (polygon.length < 3) return;

    const centerX = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length;
    const centerY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;

    const totalVehicles = depot.inventory.reduce((sum, item) => sum + item.quantity, 0);

    if (totalVehicles > 0) {
      const badgeRadius = 8;
      const badgeX = centerX + 30;
      const badgeY = centerY - 10;

      // Badge background
      graphic.circle(badgeX, badgeY, badgeRadius);
      graphic.fill({ color: 0xcc6600, alpha: 0.9 });

      // Badge border
      graphic.circle(badgeX, badgeY, badgeRadius);
      graphic.stroke({ width: 1, color: 0xffffff, alpha: 1 });
    }
  }

  /**
   * Highlight a depot
   * @param depotId - ID of depot to highlight
   */
  highlight(depotId: string): void {
    const elements = this.graphics.get(depotId);
    if (elements) {
      elements.area.alpha = 1;
    }
  }

  /**
   * Remove highlight from a depot
   * @param depotId - ID of depot to unhighlight
   */
  unhighlight(depotId: string): void {
    const elements = this.graphics.get(depotId);
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
