import type { Conflict, DwellAssignment } from '../../models/ExecutionComponents';
import type { StoppingTrack } from '../../models/StationComponents';

/**
 * CapacityValidator: Validates that stopping tracks have sufficient capacity
 * Per spec FR-011, each stopping track has a capacity measured in train cars
 */
export class CapacityValidator {
  /**
   * Validate that all scheduled trains fit within the capacity of their assigned tracks.
   *
   * @param tracks - Array of stopping tracks with capacity information
   * @param dwells - Array of dwell assignments to validate
   * @returns Array of capacity conflicts
   */
  validateStoppingTrackCapacity(tracks: StoppingTrack[], dwells: DwellAssignment[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // Create a map of track capacities
    const trackCapacities = new Map<string, number>();
    for (const track of tracks) {
      trackCapacities.set(track.trackId, track.capacity);
    }

    // Check each dwell against track capacity
    for (const dwell of dwells) {
      const capacity = trackCapacities.get(dwell.trackId);

      // Skip validation if track not in our list (might be from different stop)
      if (capacity === undefined) {
        continue;
      }

      // Default train length is 1 car if not specified
      const trainLength = dwell.trainLength ?? 1;

      if (trainLength > capacity) {
        conflicts.push({
          type: 'CAPACITY_EXCEEDED',
          locationId: dwell.trackId,
          message: `Train ${dwell.trainId} requires ${trainLength} car(s) but track ${dwell.trackId} has capacity for only ${capacity} car(s)`,
          trainIds: [dwell.trainId],
          severity: 'ERROR',
        });
      }
    }

    return conflicts;
  }

  /**
   * Validate depot lane capacities for train storage.
   *
   * @param lanes - Array of depot lanes with capacity information
   * @param assignments - Array of train-to-lane assignments
   * @returns Array of capacity conflicts
   */
  validateDepotLaneCapacity(
    lanes: Array<{ id: string; capacity: number }>,
    assignments: Array<{ laneId: string; trainId: string; trainLength?: number }>,
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Create a map of lane capacities
    const laneCapacities = new Map<string, number>();
    for (const lane of lanes) {
      laneCapacities.set(lane.id, lane.capacity);
    }

    // Group assignments by lane
    const assignmentsByLane = new Map<string, typeof assignments>();
    for (const assignment of assignments) {
      const laneAssignments = assignmentsByLane.get(assignment.laneId) || [];
      laneAssignments.push(assignment);
      assignmentsByLane.set(assignment.laneId, laneAssignments);
    }

    // Check total capacity per lane
    for (const [laneId, laneAssignments] of assignmentsByLane.entries()) {
      const capacity = laneCapacities.get(laneId);

      if (capacity === undefined) {
        continue;
      }

      const totalLength = laneAssignments.reduce(
        (sum, assignment) => sum + (assignment.trainLength ?? 1),
        0,
      );

      if (totalLength > capacity) {
        conflicts.push({
          type: 'CAPACITY_EXCEEDED',
          locationId: laneId,
          message: `Depot lane ${laneId} has ${laneAssignments.length} train(s) requiring ${totalLength} car(s) but capacity is ${capacity} car(s)`,
          trainIds: laneAssignments.map((a) => a.trainId),
          severity: 'ERROR',
        });
      }
    }

    return conflicts;
  }
}
