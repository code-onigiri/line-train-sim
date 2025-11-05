import type { TrackSegmentModel } from '../../models/TrackSegment';
import { type TrackSegmentEntity, db, safeDatabaseOperation } from './db';

/**
 * Repository for persisting and retrieving track segments using IndexedDB
 */
export class TrackRepository {
  /**
   * Save a track segment to the database
   * @param segment - Track segment to save
   * @returns True if saved successfully
   */
  async save(segment: TrackSegmentModel): Promise<boolean> {
    const entity: TrackSegmentEntity = {
      id: segment.id,
      startLandmarkId: segment.startLandmarkId,
      endLandmarkId: segment.endLandmarkId,
      classification: segment.classification,
      isBidirectional: segment.isBidirectional,
      permissibleSpeedKph: segment.permissibleSpeedKph,
      elevation: segment.elevation,
      addons: segment.addons,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await safeDatabaseOperation(async () => {
      await db.trackSegments.put(entity);
      return true;
    }, `Failed to save track segment ${segment.id}`);

    return result ?? false;
  }

  /**
   * Save multiple track segments in a batch
   * @param segments - Array of track segments to save
   * @returns Number of segments saved successfully
   */
  async saveBatch(segments: TrackSegmentModel[]): Promise<number> {
    const entities: TrackSegmentEntity[] = segments.map((segment) => ({
      id: segment.id,
      startLandmarkId: segment.startLandmarkId,
      endLandmarkId: segment.endLandmarkId,
      classification: segment.classification,
      isBidirectional: segment.isBidirectional,
      permissibleSpeedKph: segment.permissibleSpeedKph,
      elevation: segment.elevation,
      addons: segment.addons,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    const result = await safeDatabaseOperation(async () => {
      await db.trackSegments.bulkPut(entities);
      return entities.length;
    }, 'Failed to save track segments batch');

    return result ?? 0;
  }

  /**
   * Get a track segment by ID
   * @param id - Track segment ID
   * @returns Track segment entity or null if not found
   */
  async getById(id: string): Promise<TrackSegmentEntity | null> {
    return await safeDatabaseOperation(async () => {
      const entity = await db.trackSegments.get(id);
      return entity ?? null;
    }, `Failed to get track segment ${id}`);
  }

  /**
   * Get all track segments
   * @returns Array of track segment entities
   */
  async getAll(): Promise<TrackSegmentEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      return await db.trackSegments.toArray();
    }, 'Failed to get all track segments');

    return result ?? [];
  }

  /**
   * Get track segments by classification
   * @param classification - Track classification type
   * @returns Array of track segment entities with matching classification
   */
  async getByClassification(
    classification: 'mainline' | 'station' | 'depot',
  ): Promise<TrackSegmentEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      return await db.trackSegments.where('classification').equals(classification).toArray();
    }, `Failed to get track segments by classification ${classification}`);

    return result ?? [];
  }

  /**
   * Get track segments connected to a landmark
   * @param landmarkId - Landmark ID
   * @returns Array of track segment entities connected to the landmark
   */
  async getByLandmark(landmarkId: string): Promise<TrackSegmentEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      const segments = await db.trackSegments.toArray();
      return segments.filter(
        (seg) => seg.startLandmarkId === landmarkId || seg.endLandmarkId === landmarkId,
      );
    }, `Failed to get track segments by landmark ${landmarkId}`);

    return result ?? [];
  }

  /**
   * Delete a track segment by ID
   * @param id - Track segment ID
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      await db.trackSegments.delete(id);
      return true;
    }, `Failed to delete track segment ${id}`);

    return result ?? false;
  }

  /**
   * Delete all track segments
   * @returns Number of segments deleted
   */
  async deleteAll(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      const count = await db.trackSegments.count();
      await db.trackSegments.clear();
      return count;
    }, 'Failed to delete all track segments');

    return result ?? 0;
  }

  /**
   * Count total track segments
   * @returns Number of track segments in database
   */
  async count(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      return await db.trackSegments.count();
    }, 'Failed to count track segments');

    return result ?? 0;
  }

  /**
   * Check if a track segment exists
   * @param id - Track segment ID
   * @returns True if track segment exists
   */
  async exists(id: string): Promise<boolean> {
    const segment = await this.getById(id);
    return segment !== null;
  }
}
