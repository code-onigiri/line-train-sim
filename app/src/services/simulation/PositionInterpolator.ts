import type { LandmarkModel } from '../../models/Landmark';
import type { TrackSegmentModel } from '../../models/TrackSegment';

/**
 * Position on a track segment
 */
export interface TrackPosition {
  segmentId: string;
  /** Progress along the segment (0.0 to 1.0) */
  progress: number;
  /** Interpolated coordinates */
  x: number;
  y: number;
  /** Elevation at this position */
  elevation: number;
}

/**
 * Service for interpolating train positions along track segments.
 * Handles smooth movement calculations between landmarks.
 */
export class PositionInterpolator {
  /**
   * Interpolate position along a track segment.
   * @param segment - The track segment
   * @param startLandmark - Starting landmark
   * @param endLandmark - Ending landmark
   * @param progress - Progress along segment (0.0 to 1.0)
   */
  interpolatePosition(
    segment: TrackSegmentModel,
    startLandmark: LandmarkModel,
    endLandmark: LandmarkModel,
    progress: number,
  ): TrackPosition {
    // Clamp progress to valid range
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // Linear interpolation for coordinates
    const x = startLandmark.x + (endLandmark.x - startLandmark.x) * clampedProgress;
    const y = startLandmark.y + (endLandmark.y - startLandmark.y) * clampedProgress;

    // Linear interpolation for elevation
    const elevation =
      startLandmark.elevation + (endLandmark.elevation - startLandmark.elevation) * clampedProgress;

    return {
      segmentId: segment.id,
      progress: clampedProgress,
      x,
      y,
      elevation,
    };
  }

  /**
   * Calculate distance along a track segment.
   * @param startLandmark - Starting landmark
   * @param endLandmark - Ending landmark
   */
  calculateSegmentLength(startLandmark: LandmarkModel, endLandmark: LandmarkModel): number {
    const dx = endLandmark.x - startLandmark.x;
    const dy = endLandmark.y - startLandmark.y;
    const dz = endLandmark.elevation - startLandmark.elevation;

    // Calculate 3D distance
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate progress along segment given distance traveled.
   * @param segment - The track segment
   * @param startLandmark - Starting landmark
   * @param endLandmark - Ending landmark
   * @param distanceTraveled - Distance traveled from start
   */
  calculateProgress(
    _segment: TrackSegmentModel,
    startLandmark: LandmarkModel,
    endLandmark: LandmarkModel,
    distanceTraveled: number,
  ): number {
    const totalLength = this.calculateSegmentLength(startLandmark, endLandmark);

    if (totalLength === 0) {
      return 1.0; // If segment has zero length, we're already at the end
    }

    return Math.max(0, Math.min(1, distanceTraveled / totalLength));
  }

  /**
   * Calculate bearing (direction) at a position on the segment.
   * @param startLandmark - Starting landmark
   * @param endLandmark - Ending landmark
   */
  calculateBearing(startLandmark: LandmarkModel, endLandmark: LandmarkModel): number {
    const dx = endLandmark.x - startLandmark.x;
    const dy = endLandmark.y - startLandmark.y;

    // Calculate angle in radians
    return Math.atan2(dy, dx);
  }
}
