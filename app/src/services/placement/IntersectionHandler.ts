import type { TrackSegmentModel } from '../../models/TrackSegment';
import { IntersectionDetector } from '../geometry/IntersectionDetector';
import type { LandmarkService } from './LandmarkService';
import type { TrackSegmentService } from './TrackSegmentService';

/**
 * Handles automatic landmark creation at track intersections
 * Per FR-005: Creates landmarks only when vertical separation < 4m
 */
export class IntersectionHandler {
  private intersectionDetector: IntersectionDetector;

  constructor(
    private landmarkService: LandmarkService,
    private trackSegmentService: TrackSegmentService,
  ) {
    this.intersectionDetector = new IntersectionDetector();
  }

  /**
   * Check for intersections and create landmarks at intersection points
   * @param newSegment - Newly created track segment
   * @returns Array of created landmark IDs at intersections
   */
  processIntersections(newSegment: TrackSegmentModel): string[] {
    const existingSegments = this.trackSegmentService.getAll();
    const landmarkMap = new Map(this.landmarkService.getAll().map((l) => [l.id, l]));

    const intersections = this.intersectionDetector.findAllIntersections(
      newSegment,
      existingSegments,
      landmarkMap,
    );

    const createdLandmarkIds: string[] = [];

    for (const intersection of intersections) {
      if (!intersection.result.point) {
        continue;
      }

      const { x, y } = intersection.result.point;

      // Check if landmark already exists at this position
      const existingLandmark = this.intersectionDetector.findNearbyLandmark(
        { x, y },
        this.landmarkService.getAll(),
        2, // 2 unit threshold for considering positions as same
      );

      if (existingLandmark) {
        // Use existing landmark
        createdLandmarkIds.push(existingLandmark.id);
        console.log(`Using existing landmark ${existingLandmark.id} at intersection`);
        continue;
      }

      // Calculate elevation at intersection point (average of intersecting segments)
      const intersectedSegment = this.trackSegmentService.get(intersection.segmentId);
      if (!intersectedSegment) {
        continue;
      }

      const averageElevation = (newSegment.elevation + intersectedSegment.elevation) / 2;

      // Create new landmark at intersection
      const landmark = this.landmarkService.create(x, y, averageElevation, {
        createdBy: 'intersection',
        createdAt: Date.now(),
      });

      createdLandmarkIds.push(landmark.id);
      console.log(`Created intersection landmark ${landmark.id} at (${x}, ${y})`);

      // Split both track segments at the intersection point
      this.splitSegmentAtLandmark(newSegment, landmark.id, intersection.result.t ?? 0.5);
      this.splitSegmentAtLandmark(intersectedSegment, landmark.id, intersection.result.u ?? 0.5);
    }

    return createdLandmarkIds;
  }

  /**
   * Split a track segment at a landmark
   * Replaces the original segment with two new segments connected by the landmark
   * @param segment - Segment to split
   * @param landmarkId - ID of landmark to insert
   * @param parameter - Position along segment (0-1) where landmark is located
   */
  private splitSegmentAtLandmark(
    segment: TrackSegmentModel,
    landmarkId: string,
    parameter: number,
  ): void {
    // Determine split order based on parameter
    const isCloserToStart = parameter < 0.5;

    // Delete original segment
    this.trackSegmentService.delete(segment.id);

    // Create two new segments
    if (isCloserToStart) {
      // Create segment from start to intersection landmark
      this.trackSegmentService.create(segment.startLandmarkId, landmarkId, segment.classification, {
        isBidirectional: segment.isBidirectional,
        permissibleSpeedKph: segment.permissibleSpeedKph,
        elevation: segment.elevation,
      });

      // Create segment from intersection landmark to end
      this.trackSegmentService.create(landmarkId, segment.endLandmarkId, segment.classification, {
        isBidirectional: segment.isBidirectional,
        permissibleSpeedKph: segment.permissibleSpeedKph,
        elevation: segment.elevation,
      });
    } else {
      // Create segment from start to intersection landmark
      this.trackSegmentService.create(segment.startLandmarkId, landmarkId, segment.classification, {
        isBidirectional: segment.isBidirectional,
        permissibleSpeedKph: segment.permissibleSpeedKph,
        elevation: segment.elevation,
      });

      // Create segment from intersection landmark to end
      this.trackSegmentService.create(landmarkId, segment.endLandmarkId, segment.classification, {
        isBidirectional: segment.isBidirectional,
        permissibleSpeedKph: segment.permissibleSpeedKph,
        elevation: segment.elevation,
      });
    }

    console.log(`Split segment ${segment.id} at landmark ${landmarkId}`);
  }

  /**
   * Check if two segments would intersect (without creating landmarks)
   * @param segment1Id - First segment ID
   * @param segment2Id - Second segment ID
   * @returns True if segments intersect with vertical separation < 4m
   */
  checkIntersection(segment1Id: string, segment2Id: string): boolean {
    const seg1 = this.trackSegmentService.get(segment1Id);
    const seg2 = this.trackSegmentService.get(segment2Id);

    if (!seg1 || !seg2) {
      return false;
    }

    const landmarkMap = new Map(this.landmarkService.getAll().map((l) => [l.id, l]));
    const result = this.intersectionDetector.checkSegmentIntersection(seg1, seg2, landmarkMap);

    return result.intersects;
  }
}
