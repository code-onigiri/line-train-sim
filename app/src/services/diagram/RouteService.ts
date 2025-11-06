import { RouteModel } from '../../models/Route';
import type { Route } from '../../schemas/entities';

/**
 * Service for managing routes and their configuration.
 * Handles route creation, updates, and validation according to FR-008.
 */
export class RouteService {
  private routes: Map<string, RouteModel> = new Map();

  /**
   * Create a new route with the given configuration.
   * @param name - Route name
   * @param stops - Ordered list of stops (stations/depots)
   * @param diagramSettings - Diagram configuration
   * @param consistTemplates - Train consist templates
   * @param timeScale - Time scaling factor (default 1.0)
   */
  create(
    name: string,
    stops: Array<{ entityId: string; entityType: 'station' | 'depot' }>,
    diagramSettings: Record<string, unknown>,
    consistTemplates: string[],
    timeScale = 1.0,
  ): RouteModel {
    const route = new RouteModel({
      name,
      stops,
      diagramSettings,
      consistTemplates,
      timeScale,
    });
    this.routes.set(route.id, route);
    return route;
  }

  /**
   * Get a route by ID.
   */
  get(id: string): RouteModel | undefined {
    return this.routes.get(id);
  }

  /**
   * Get all routes.
   */
  getAll(): RouteModel[] {
    return Array.from(this.routes.values());
  }

  /**
   * Update an existing route.
   */
  update(id: string, updates: Partial<Route>): RouteModel | undefined {
    const existing = this.routes.get(id);
    if (!existing) {
      return undefined;
    }

    let updated = existing;
    if (updates.name !== undefined) {
      updated = updated.updateName(updates.name);
    }
    if (updates.stops !== undefined) {
      updated = updated.updateStops(updates.stops);
    }
    if (updates.diagramSettings !== undefined) {
      updated = updated.updateDiagramSettings(updates.diagramSettings);
    }
    if (updates.consistTemplates !== undefined) {
      updated = updated.updateConsistTemplates(updates.consistTemplates);
    }
    if (updates.timeScale !== undefined) {
      updated = updated.updateTimeScale(updates.timeScale);
    }

    this.routes.set(id, updated);
    return updated;
  }

  /**
   * Delete a route.
   */
  delete(id: string): boolean {
    return this.routes.delete(id);
  }

  /**
   * Validate that a route follows the required constraints:
   * - First and last stops must be station or depot
   * - Intermediate stops must be stations only
   */
  validateRoute(route: RouteModel): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const stops = route.stops;

    if (stops.length < 2) {
      errors.push('Route must have at least 2 stops (start and end)');
    }

    if (stops.length >= 2) {
      const firstStop = stops[0];
      const lastStop = stops[stops.length - 1];

      // First and last must be station or depot
      if (!['station', 'depot'].includes(firstStop.entityType)) {
        errors.push('First stop must be a station or depot');
      }
      if (!['station', 'depot'].includes(lastStop.entityType)) {
        errors.push('Last stop must be a station or depot');
      }

      // Intermediate stops must be stations only
      for (let i = 1; i < stops.length - 1; i++) {
        if (stops[i].entityType !== 'station') {
          errors.push(
            `Intermediate stop at position ${i + 1} must be a station (depots only allowed at start/end)`,
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if a route forms a loop (returns to a previously visited station).
   */
  detectLoop(route: RouteModel): { hasLoop: boolean; loopingStationId?: string } {
    const stops = route.stops;
    const visited = new Set<string>();

    for (const stop of stops) {
      if (visited.has(stop.entityId)) {
        return { hasLoop: true, loopingStationId: stop.entityId };
      }
      visited.add(stop.entityId);
    }

    return { hasLoop: false };
  }
}
