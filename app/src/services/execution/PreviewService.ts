import type { RouteModel } from '../../models/Route';

/**
 * Conflict types that can occur in a timetable
 */
export interface Conflict {
  type: string;
  locationId: string;
  message: string;
}

/**
 * Scheduled train information for preview
 */
export interface ScheduledTrain {
  id: string;
  routeId: string;
  consistId: string;
  departureTime: string;
  dwellAssignments: Array<{
    stopId: string;
    arrival: string;
    departure: string;
    trackId: string;
  }>;
  seed: number;
}

/**
 * Preview options for customizing preview generation
 */
export interface PreviewOptions {
  includeAddons?: boolean;
}

/**
 * Preview response with conflicts and scheduled trains
 */
export interface PreviewResponse {
  conflicts: Conflict[];
  scheduledTrains: ScheduledTrain[];
}

/**
 * Service for generating timetable previews.
 * Validates routes and produces conflict-free schedules.
 */
export class PreviewService {
  /**
   * Generate a timetable preview for a route.
   * @param route - The route to generate preview for
   * @param seed - Random seed for deterministic generation
   * @param options - Preview generation options
   */
  generatePreview(route: RouteModel, seed?: number, options: PreviewOptions = {}): PreviewResponse {
    const actualSeed = seed ?? Math.random();
    const conflicts: Conflict[] = [];
    const scheduledTrains: ScheduledTrain[] = [];

    // TODO: Implement actual preview generation logic
    // For now, return empty result structure
    // This will be implemented when execution mode is fully developed

    return {
      conflicts,
      scheduledTrains,
    };
  }

  /**
   * Validate capacity constraints for scheduled trains.
   * Checks if stopping tracks have sufficient capacity to avoid overlaps.
   */
  validateCapacity(scheduledTrains: ScheduledTrain[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // TODO: Implement capacity validation per FR-011
    // Check stopping tracks and depot lanes for sufficient capacity

    return conflicts;
  }

  /**
   * Detect overlapping dwell periods on the same track.
   */
  detectDwellConflicts(scheduledTrains: ScheduledTrain[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // TODO: Implement dwell conflict detection per FR-011
    // Check for overlapping train cars during dwell periods

    return conflicts;
  }
}
