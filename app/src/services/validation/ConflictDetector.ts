import type { Conflict, DwellAssignment } from '../../models/ExecutionComponents';

/**
 * ConflictDetector: Detects overlapping dwell periods on the same track
 * Per spec FR-011, trains cannot overlap on the same stopping track
 */
export class ConflictDetector {
  /**
   * Detect conflicts where trains have overlapping dwell periods on the same track.
   * Two trains conflict if they use the same track and their time windows overlap.
   *
   * @param dwells - Array of dwell assignments to check
   * @returns Array of detected conflicts
   */
  detectDwellConflicts(dwells: DwellAssignment[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // Group dwells by track ID
    const dwellsByTrack = new Map<string, DwellAssignment[]>();
    for (const dwell of dwells) {
      const trackDwells = dwellsByTrack.get(dwell.trackId) || [];
      trackDwells.push(dwell);
      dwellsByTrack.set(dwell.trackId, trackDwells);
    }

    // Check each track for overlapping dwells
    for (const [trackId, trackDwells] of dwellsByTrack.entries()) {
      // Sort by arrival time for easier comparison
      const sorted = [...trackDwells].sort((a, b) => a.arrivalTime - b.arrivalTime);

      // Check consecutive pairs for overlaps (O(n) optimization)
      // Since sorted by arrival time, only need to check if next train arrives before current departs
      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        // Check if time periods overlap
        // Overlap occurs if: next train arrives before current train departs
        if (next.arrivalTime < current.departureTime) {
          conflicts.push({
            type: 'DWELL_OVERLAP',
            locationId: trackId,
            message: `Trains overlap on track ${trackId}: Train arrives at ${next.arrivalTime}s before previous train departs at ${current.departureTime}s`,
            trainIds: [current.trainId, next.trainId],
            severity: 'ERROR',
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Validate that all dwell assignments have valid time windows.
   *
   * @param dwells - Array of dwell assignments to validate
   * @returns Array of validation conflicts
   */
  validateDwellTimes(dwells: DwellAssignment[]): Conflict[] {
    const conflicts: Conflict[] = [];

    for (const dwell of dwells) {
      if (dwell.departureTime <= dwell.arrivalTime) {
        conflicts.push({
          type: 'INVALID_SCHEDULE',
          locationId: dwell.trackId,
          message: `Train ${dwell.trainId} has invalid dwell time: departure (${dwell.departureTime}s) must be after arrival (${dwell.arrivalTime}s)`,
          trainIds: [dwell.trainId],
          severity: 'ERROR',
        });
      }

      if (dwell.arrivalTime < 0 || dwell.departureTime < 0) {
        conflicts.push({
          type: 'INVALID_SCHEDULE',
          locationId: dwell.trackId,
          message: `Train ${dwell.trainId} has negative time values`,
          trainIds: [dwell.trainId],
          severity: 'ERROR',
        });
      }
    }

    return conflicts;
  }
}
