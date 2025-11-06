import type { RouteModel } from '../../models/Route';
import { type RouteEntity, db, safeDatabaseOperation } from './db';

/**
 * Repository for persisting and retrieving routes using IndexedDB
 */
export class RouteRepository {
  /**
   * Save a route to the database
   * @param route - Route to save
   * @returns True if saved successfully
   */
  async save(route: RouteModel): Promise<boolean> {
    const entity: RouteEntity = {
      id: route.id,
      name: route.name,
      stops: route.stops,
      diagramSettings: route.diagramSettings,
      consistTemplates: route.consistTemplates,
      timeScale: route.timeScale,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
    };

    const result = await safeDatabaseOperation(async () => {
      await db.routes.put(entity);
      return true;
    }, `Failed to save route ${route.id}`);

    return result ?? false;
  }

  /**
   * Save multiple routes in a batch
   * @param routes - Array of routes to save
   * @returns Number of routes saved successfully
   */
  async saveBatch(routes: RouteModel[]): Promise<number> {
    const entities: RouteEntity[] = routes.map((route) => ({
      id: route.id,
      name: route.name,
      stops: route.stops,
      diagramSettings: route.diagramSettings,
      consistTemplates: route.consistTemplates,
      timeScale: route.timeScale,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
    }));

    const result = await safeDatabaseOperation(async () => {
      await db.routes.bulkPut(entities);
      return entities.length;
    }, 'Failed to save routes batch');

    return result ?? 0;
  }

  /**
   * Get a route by ID
   * @param id - Route ID
   * @returns Route entity or null if not found
   */
  async getById(id: string): Promise<RouteEntity | null> {
    return await safeDatabaseOperation(async () => {
      const entity = await db.routes.get(id);
      return entity ?? null;
    }, `Failed to get route ${id}`);
  }

  /**
   * Get all routes
   * @returns Array of route entities
   */
  async getAll(): Promise<RouteEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      return await db.routes.toArray();
    }, 'Failed to get all routes');

    return result ?? [];
  }

  /**
   * Get routes by name (partial match)
   * @param namePattern - Name pattern to search for
   * @returns Array of matching route entities
   */
  async getByName(namePattern: string): Promise<RouteEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      const allRoutes = await db.routes.toArray();
      return allRoutes.filter((route) =>
        route.name.toLowerCase().includes(namePattern.toLowerCase()),
      );
    }, `Failed to search routes by name ${namePattern}`);

    return result ?? [];
  }

  /**
   * Delete a route by ID
   * @param id - Route ID
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      await db.routes.delete(id);
      return true;
    }, `Failed to delete route ${id}`);

    return result ?? false;
  }

  /**
   * Delete all routes
   * @returns Number of routes deleted
   */
  async deleteAll(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      const count = await db.routes.count();
      await db.routes.clear();
      return count;
    }, 'Failed to delete all routes');

    return result ?? 0;
  }

  /**
   * Count total routes
   * @returns Number of routes in database
   */
  async count(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      return await db.routes.count();
    }, 'Failed to count routes');

    return result ?? 0;
  }

  /**
   * Check if a route exists
   * @param id - Route ID
   * @returns True if route exists
   */
  async exists(id: string): Promise<boolean> {
    const route = await this.getById(id);
    return route !== null;
  }
}
