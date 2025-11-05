import type { LandmarkModel } from '../../models/Landmark';
import type { TrackSegmentModel } from '../../models/TrackSegment';

/** 2D point interface */
export interface Point2D {
  x: number;
  y: number;
}

/** Intersection result */
export interface IntersectionResult {
  intersects: boolean;
  point?: Point2D;
  /** Parameter t for first segment (0-1) */
  t?: number;
  /** Parameter u for second segment (0-1) */
  u?: number;
}

/**
 * Vertical clearance threshold in meters (measured from track rail top surface)
 * Tracks separated by >= 4m are considered different elevation levels
 */
export const VERTICAL_CLEARANCE_THRESHOLD = 4;

/**
 * Detects intersections between track segments with 4m vertical clearance threshold
 * Per FR-005: Creates intersection landmarks only when vertical separation < 4m
 */
export class IntersectionDetector {
  /**
   * Check if two track segments intersect considering vertical clearance
   * @param seg1 - First track segment
   * @param seg2 - Second track segment
   * @param landmarks - Map of landmark IDs to landmark objects
   * @returns Intersection result with point if intersection exists
   */
  checkSegmentIntersection(
    seg1: TrackSegmentModel,
    seg2: TrackSegmentModel,
    landmarks: Map<string, LandmarkModel>,
  ): IntersectionResult {
    // Check vertical clearance first
    const elevationDiff = Math.abs(seg1.elevation - seg2.elevation);
    if (elevationDiff >= VERTICAL_CLEARANCE_THRESHOLD) {
      return { intersects: false };
    }

    // Get landmark positions
    const start1 = landmarks.get(seg1.startLandmarkId);
    const end1 = landmarks.get(seg1.endLandmarkId);
    const start2 = landmarks.get(seg2.startLandmarkId);
    const end2 = landmarks.get(seg2.endLandmarkId);

    if (!start1 || !end1 || !start2 || !end2) {
      return { intersects: false };
    }

    // Calculate line segment intersection
    return this.calculateLineIntersection(
      { x: start1.x, y: start1.y },
      { x: end1.x, y: end1.y },
      { x: start2.x, y: start2.y },
      { x: end2.x, y: end2.y },
    );
  }

  /**
   * Calculate intersection point of two line segments
   * Uses parametric line equation: P = P1 + t(P2 - P1)
   * @param p1 - Start point of first segment
   * @param p2 - End point of first segment
   * @param p3 - Start point of second segment
   * @param p4 - End point of second segment
   * @returns Intersection result with point and parameters if intersection exists
   */
  calculateLineIntersection(
    p1: Point2D,
    p2: Point2D,
    p3: Point2D,
    p4: Point2D,
  ): IntersectionResult {
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;
    const x3 = p3.x;
    const y3 = p3.y;
    const x4 = p4.x;
    const y4 = p4.y;

    // Calculate denominator
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // Check for parallel or coincident lines
    if (Math.abs(denom) < 1e-10) {
      return { intersects: false };
    }

    // Calculate parameters t and u
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    // Check if intersection point is within both line segments
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      // Calculate intersection point
      const x = x1 + t * (x2 - x1);
      const y = y1 + t * (y2 - y1);

      return {
        intersects: true,
        point: { x, y },
        t,
        u,
      };
    }

    return { intersects: false };
  }

  /**
   * Find all intersections between a new segment and existing segments
   * @param newSegment - New track segment to check
   * @param existingSegments - Existing track segments
   * @param landmarks - Map of landmark IDs to landmark objects
   * @returns Array of intersection results with segment IDs
   */
  findAllIntersections(
    newSegment: TrackSegmentModel,
    existingSegments: TrackSegmentModel[],
    landmarks: Map<string, LandmarkModel>,
  ): Array<{ segmentId: string; result: IntersectionResult }> {
    const intersections: Array<{ segmentId: string; result: IntersectionResult }> = [];

    for (const existingSegment of existingSegments) {
      // Skip if same segment
      if (existingSegment.id === newSegment.id) {
        continue;
      }

      // Skip if segments share a landmark (they connect at endpoint, not intersection)
      if (
        newSegment.startLandmarkId === existingSegment.startLandmarkId ||
        newSegment.startLandmarkId === existingSegment.endLandmarkId ||
        newSegment.endLandmarkId === existingSegment.startLandmarkId ||
        newSegment.endLandmarkId === existingSegment.endLandmarkId
      ) {
        continue;
      }

      const result = this.checkSegmentIntersection(newSegment, existingSegment, landmarks);

      if (result.intersects) {
        intersections.push({
          segmentId: existingSegment.id,
          result,
        });
      }
    }

    return intersections;
  }

  /**
   * Check if a point is close to an existing landmark
   * @param point - Point to check
   * @param landmarks - Array of existing landmarks
   * @param threshold - Distance threshold (default 5 units)
   * @returns Nearest landmark within threshold, or null
   */
  findNearbyLandmark(
    point: Point2D,
    landmarks: LandmarkModel[],
    threshold = 5,
  ): LandmarkModel | null {
    let nearest: LandmarkModel | null = null;
    let minDistance = threshold;

    for (const landmark of landmarks) {
      const distance = Math.sqrt((landmark.x - point.x) ** 2 + (landmark.y - point.y) ** 2);

      if (distance < minDistance) {
        nearest = landmark;
        minDistance = distance;
      }
    }

    return nearest;
  }
}
