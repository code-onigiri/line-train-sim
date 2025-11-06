import type { Conflict as ConflictType, DwellAssignment } from '../../models/ExecutionComponents';
import type { RouteModel } from '../../models/Route';
import { ConflictDetector } from '../validation/ConflictDetector';
import { DeterministicEngine } from './DeterministicEngine';

/**
 * Scheduled train information for preview (API format)
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
  conflicts: ConflictType[];
  scheduledTrains: ScheduledTrain[];
}

/**
 * Service for generating timetable previews.
 * Validates routes and produces conflict-free schedules.
 * Per spec FR-011, previews must detect conflicts before execution.
 */
export class PreviewService {
  private conflictDetector = new ConflictDetector();

  /**
   * Generate a timetable preview for a route.
   * Creates a deterministic schedule and validates for conflicts.
   *
   * @param route - The route to generate preview for
   * @param seed - Random seed for deterministic generation
   * @param options - Preview generation options
   */
  generatePreview(
    _route: RouteModel,
    seed?: number,
    _options: PreviewOptions = {},
  ): PreviewResponse {
    const actualSeed = seed ?? Math.floor(Math.random() * 1000000);
    const _engine = new DeterministicEngine(actualSeed);

    // TODO: Implement full schedule generation from route
    // For now, return empty results
    // This requires:
    // 1. Read route stops and consists
    // 2. Calculate travel times between stops
    // 3. Generate dwell assignments
    // 4. Assign trains to tracks

    const scheduledTrains: ScheduledTrain[] = [];
    const conflicts: ConflictType[] = [];

    return {
      conflicts,
      scheduledTrains,
    };
  }

  /**
   * Validate a set of scheduled trains for conflicts.
   *
   * @param dwells - Dwell assignments to validate
   * @returns Array of detected conflicts
   */
  validateSchedule(dwells: DwellAssignment[]): ConflictType[] {
    const conflicts: ConflictType[] = [];

    // Detect dwell overlaps
    const dwellConflicts = this.conflictDetector.detectDwellConflicts(dwells);
    conflicts.push(...dwellConflicts);

    // Validate dwell times
    const timeConflicts = this.conflictDetector.validateDwellTimes(dwells);
    conflicts.push(...timeConflicts);

    return conflicts;
  }
}
