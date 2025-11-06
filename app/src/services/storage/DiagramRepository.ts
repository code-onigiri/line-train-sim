import { db, safeDatabaseOperation } from './db';

/**
 * Repository for persisting and retrieving diagram settings
 * Diagram settings are stored as part of route entities
 */
export class DiagramRepository {
  /**
   * Save diagram settings for a route
   * @param routeId - Route ID
   * @param settings - Diagram settings to save
   * @returns True if saved successfully
   */
  async saveDiagramSettings(routeId: string, settings: Record<string, unknown>): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      const route = await db.routes.get(routeId);
      if (!route) {
        return false;
      }

      route.diagramSettings = settings;
      route.updatedAt = Date.now();
      await db.routes.put(route);
      return true;
    }, `Failed to save diagram settings for route ${routeId}`);

    return result ?? false;
  }

  /**
   * Get diagram settings for a route
   * @param routeId - Route ID
   * @returns Diagram settings or null if not found
   */
  async getDiagramSettings(routeId: string): Promise<Record<string, unknown> | null> {
    return await safeDatabaseOperation(async () => {
      const route = await db.routes.get(routeId);
      return route?.diagramSettings ?? null;
    }, `Failed to get diagram settings for route ${routeId}`);
  }

  /**
   * Update specific diagram setting
   * @param routeId - Route ID
   * @param key - Setting key
   * @param value - Setting value
   * @returns True if updated successfully
   */
  async updateDiagramSetting(routeId: string, key: string, value: unknown): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      const route = await db.routes.get(routeId);
      if (!route) {
        return false;
      }

      route.diagramSettings[key] = value;
      route.updatedAt = Date.now();
      await db.routes.put(route);
      return true;
    }, `Failed to update diagram setting ${key} for route ${routeId}`);

    return result ?? false;
  }

  /**
   * Delete diagram settings for a route
   * @param routeId - Route ID
   * @returns True if deleted successfully
   */
  async deleteDiagramSettings(routeId: string): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      const route = await db.routes.get(routeId);
      if (!route) {
        return false;
      }

      route.diagramSettings = {};
      route.updatedAt = Date.now();
      await db.routes.put(route);
      return true;
    }, `Failed to delete diagram settings for route ${routeId}`);

    return result ?? false;
  }

  /**
   * Save time scale for a route
   * @param routeId - Route ID
   * @param timeScale - Time scale value (e.g., 1.0 for normal, 2.0 for 2x speed)
   * @returns True if saved successfully
   */
  async saveTimeScale(routeId: string, timeScale: number): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      const route = await db.routes.get(routeId);
      if (!route) {
        return false;
      }

      route.timeScale = timeScale;
      route.updatedAt = Date.now();
      await db.routes.put(route);
      return true;
    }, `Failed to save time scale for route ${routeId}`);

    return result ?? false;
  }

  /**
   * Get time scale for a route
   * @param routeId - Route ID
   * @returns Time scale value or null if not found
   */
  async getTimeScale(routeId: string): Promise<number | null> {
    return await safeDatabaseOperation(async () => {
      const route = await db.routes.get(routeId);
      return route?.timeScale ?? null;
    }, `Failed to get time scale for route ${routeId}`);
  }
}
