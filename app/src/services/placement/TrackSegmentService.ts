import { TrackSegmentModel } from '../../models/TrackSegment';
import type { TrackSegment } from '../../schemas/entities';
import type { LandmarkService } from './LandmarkService';

// Vertical clearance threshold in meters
const VERTICAL_CLEARANCE_THRESHOLD = 4;

export class TrackSegmentService {
  private trackSegments: Map<string, TrackSegmentModel> = new Map();

  constructor(private landmarkService: LandmarkService) {}

  create(
    startLandmarkId: string,
    endLandmarkId: string,
    classification: 'mainline' | 'station' | 'depot' = 'mainline',
    options: {
      isBidirectional?: boolean;
      permissibleSpeedKph?: number;
      slopePercent?: number;
    } = {},
  ): TrackSegmentModel {
    // Validate landmarks exist
    const startLandmark = this.landmarkService.get(startLandmarkId);
    const endLandmark = this.landmarkService.get(endLandmarkId);

    if (!startLandmark) {
      throw new Error(`Start landmark not found: ${startLandmarkId}`);
    }
    if (!endLandmark) {
      throw new Error(`End landmark not found: ${endLandmarkId}`);
    }

    // Slope must be manually entered, default to 0
    const slopePercent = options.slopePercent ?? 0;

    const segment = new TrackSegmentModel({
      startLandmarkId,
      endLandmarkId,
      classification,
      isBidirectional: options.isBidirectional ?? true,
      permissibleSpeedKph: options.permissibleSpeedKph ?? 100,
      slopePercent,
    });

    this.trackSegments.set(segment.id, segment);

    // Add connections to landmarks
    this.landmarkService.addConnection(startLandmarkId, segment.id);
    this.landmarkService.addConnection(endLandmarkId, segment.id);

    return segment;
  }

  get(id: string): TrackSegmentModel | undefined {
    return this.trackSegments.get(id);
  }

  getAll(): TrackSegmentModel[] {
    return Array.from(this.trackSegments.values());
  }

  update(id: string, updates: Partial<TrackSegment>): TrackSegmentModel | undefined {
    const existing = this.trackSegments.get(id);
    if (!existing) {
      return undefined;
    }

    let updated = existing;
    if (updates.classification) {
      updated = updated.updateClassification(updates.classification);
    }
    if (updates.permissibleSpeedKph !== undefined) {
      updated = updated.updateSpeed(updates.permissibleSpeedKph);
    }
    if (updates.slopePercent !== undefined) {
      updated = updated.updateSlope(updates.slopePercent);
    }
    if (updates.isBidirectional !== undefined) {
      updated = updated.setBidirectional(updates.isBidirectional);
    }

    this.trackSegments.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    const segment = this.trackSegments.get(id);
    if (!segment) {
      return false;
    }

    // Remove connections from landmarks
    this.landmarkService.removeConnection(segment.startLandmarkId, segment.id);
    this.landmarkService.removeConnection(segment.endLandmarkId, segment.id);

    return this.trackSegments.delete(id);
  }

  // Intersection detection: returns true if two segments intersect on the same elevation
  detectIntersection(segment1Id: string, segment2Id: string): boolean {
    const seg1 = this.trackSegments.get(segment1Id);
    const seg2 = this.trackSegments.get(segment2Id);

    if (!seg1 || !seg2) {
      return false;
    }

    // Check vertical clearance based on landmark elevations
    // Get elevation at the midpoint of each segment for comparison
    const start1 = this.landmarkService.get(seg1.startLandmarkId);
    const end1 = this.landmarkService.get(seg1.endLandmarkId);
    const start2 = this.landmarkService.get(seg2.startLandmarkId);
    const end2 = this.landmarkService.get(seg2.endLandmarkId);

    if (!start1 || !end1 || !start2 || !end2) {
      return false;
    }

    // Calculate average elevation for each segment
    const avgElevation1 = (start1.elevationMeters + end1.elevationMeters) / 2;
    const avgElevation2 = (start2.elevationMeters + end2.elevationMeters) / 2;
    const elevationDiff = Math.abs(avgElevation1 - avgElevation2);

    if (elevationDiff >= VERTICAL_CLEARANCE_THRESHOLD) {
      return false; // No intersection due to sufficient vertical separation
    }

    // Line segment intersection algorithm
    const intersectionPoint = this.calculateLineIntersection(
      { x: start1.x, y: start1.y },
      { x: end1.x, y: end1.y },
      { x: start2.x, y: start2.y },
      { x: end2.x, y: end2.y },
    );

    return intersectionPoint !== null;
  }

  // Helper: Calculate line segment intersection point
  private calculateLineIntersection(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number },
  ): { x: number; y: number } | null {
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;
    const x3 = p3.x;
    const y3 = p3.y;
    const x4 = p4.x;
    const y4 = p4.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) {
      return null; // Parallel or coincident
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1),
      };
    }

    return null;
  }

  getByLandmark(landmarkId: string): TrackSegmentModel[] {
    return Array.from(this.trackSegments.values()).filter(
      (segment) => segment.startLandmarkId === landmarkId || segment.endLandmarkId === landmarkId,
    );
  }

  clear(): void {
    this.trackSegments.clear();
  }

  count(): number {
    return this.trackSegments.size;
  }
}
