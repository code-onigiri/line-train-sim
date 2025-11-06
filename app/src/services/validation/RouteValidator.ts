import type { RouteModel } from '../../models/Route';
import type { StationModel } from '../../models/Station';
import type { DepotModel } from '../../models/Depot';

/**
 * Validation result for route checks
 */
export interface RouteValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * RouteValidator service
 * Validates route configuration according to FR-008:
 * - Start and end must be station or depot
 * - Intermediate stops must be stations only
 * - No consecutive duplicate stops
 * - Loop detection with guidance
 */
export class RouteValidator {
  /**
   * Validate a complete route configuration
   * @param route - The route to validate
   * @param stations - Map of station IDs to station models
   * @param depots - Map of depot IDs to depot models
   * @returns Validation result with errors and warnings
   */
  validateRoute(
    route: RouteModel,
    stations: Map<string, StationModel>,
    depots: Map<string, DepotModel>,
  ): RouteValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const stops = route.stops;

    // Must have at least 2 stops
    if (stops.length < 2) {
      errors.push('Route must have at least 2 stops');
      return { isValid: false, errors, warnings };
    }

    // Validate start stop (first)
    const startStop = stops[0];
    if (!this.isValidStartOrEnd(startStop.entityId, startStop.entityType, stations, depots)) {
      errors.push(
        `Start stop must be a valid station or depot, got ${startStop.entityType} with ID ${startStop.entityId}`,
      );
    }

    // Validate end stop (last)
    const endStop = stops[stops.length - 1];
    if (!this.isValidStartOrEnd(endStop.entityId, endStop.entityType, stations, depots)) {
      errors.push(
        `End stop must be a valid station or depot, got ${endStop.entityType} with ID ${endStop.entityId}`,
      );
    }

    // Validate intermediate stops (all between first and last)
    for (let i = 1; i < stops.length - 1; i++) {
      const stop = stops[i];
      if (stop.entityType !== 'station') {
        errors.push(
          `Intermediate stop at position ${i + 1} must be a station, got ${stop.entityType}`,
        );
      }
      if (!stations.has(stop.entityId)) {
        errors.push(`Station ${stop.entityId} at position ${i + 1} not found`);
      }
    }

    // Also validate that the end stop entity exists
    if (endStop.entityType === 'station' && !stations.has(endStop.entityId)) {
      errors.push(`End station ${endStop.entityId} not found`);
    } else if (endStop.entityType === 'depot' && !depots.has(endStop.entityId)) {
      errors.push(`End depot ${endStop.entityId} not found`);
    }

    // Check for consecutive duplicates
    for (let i = 1; i < stops.length; i++) {
      if (stops[i].entityId === stops[i - 1].entityId) {
        warnings.push(
          `Consecutive duplicate stop at positions ${i} and ${i + 1}: ${stops[i].entityId}`,
        );
      }
    }

    // Check for loops (same station appears more than once)
    const visitedStations = new Set<string>();
    let loopDetected = false;
    let loopStationId: string | null = null;

    for (const stop of stops) {
      if (stop.entityType === 'station') {
        if (visitedStations.has(stop.entityId)) {
          loopDetected = true;
          loopStationId = stop.entityId;
          break;
        }
        visitedStations.add(stop.entityId);
      }
    }

    if (loopDetected) {
      warnings.push(
        `Route contains a loop: station ${loopStationId} appears multiple times. ` +
          'Insert an intermediate landmark to break the circular path before execution.',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if an entity is valid as a start or end point
   * @param entityId - The entity ID
   * @param entityType - The entity type
   * @param stations - Map of stations
   * @param depots - Map of depots
   * @returns True if valid start/end point
   */
  private isValidStartOrEnd(
    entityId: string,
    entityType: 'station' | 'depot',
    stations: Map<string, StationModel>,
    depots: Map<string, DepotModel>,
  ): boolean {
    if (entityType === 'station') {
      return stations.has(entityId);
    }
    if (entityType === 'depot') {
      return depots.has(entityId);
    }
    return false;
  }

  /**
   * Validate that a route is ready for execution
   * @param route - The route to validate
   * @param stations - Map of stations
   * @param depots - Map of depots
   * @returns True if route can be executed
   */
  canExecute(
    route: RouteModel,
    stations: Map<string, StationModel>,
    depots: Map<string, DepotModel>,
  ): boolean {
    const result = this.validateRoute(route, stations, depots);
    // Cannot execute if there are validation errors OR if there are loop warnings
    return (
      result.isValid && !result.warnings.some((warning) => warning.includes('loop'))
    );
  }
}
