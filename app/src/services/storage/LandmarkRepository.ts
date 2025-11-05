import type { LandmarkModel } from '../../models/Landmark';
import { type LandmarkEntity, db, safeDatabaseOperation } from './db';

/**
 * Repository for persisting and retrieving landmarks using IndexedDB
 */
export class LandmarkRepository {
  /**
   * Save a landmark to the database
   * @param landmark - Landmark to save
   * @returns True if saved successfully
   */
  async save(landmark: LandmarkModel): Promise<boolean> {
    const entity: LandmarkEntity = {
      id: landmark.id,
      x: landmark.x,
      y: landmark.y,
      elevation: landmark.elevation,
      connections: landmark.connections,
      metadata: landmark.metadata,
      createdAt: landmark.metadata.createdAt as number,
      updatedAt: Date.now(),
    };

    const result = await safeDatabaseOperation(async () => {
      await db.landmarks.put(entity);
      return true;
    }, `Failed to save landmark ${landmark.id}`);

    return result ?? false;
  }

  /**
   * Save multiple landmarks in a batch
   * @param landmarks - Array of landmarks to save
   * @returns Number of landmarks saved successfully
   */
  async saveBatch(landmarks: LandmarkModel[]): Promise<number> {
    const entities: LandmarkEntity[] = landmarks.map((landmark) => ({
      id: landmark.id,
      x: landmark.x,
      y: landmark.y,
      elevation: landmark.elevation,
      connections: landmark.connections,
      metadata: landmark.metadata,
      createdAt: landmark.metadata.createdAt as number,
      updatedAt: Date.now(),
    }));

    const result = await safeDatabaseOperation(async () => {
      await db.landmarks.bulkPut(entities);
      return entities.length;
    }, 'Failed to save landmarks batch');

    return result ?? 0;
  }

  /**
   * Get a landmark by ID
   * @param id - Landmark ID
   * @returns Landmark entity or null if not found
   */
  async getById(id: string): Promise<LandmarkEntity | null> {
    return await safeDatabaseOperation(async () => {
      const entity = await db.landmarks.get(id);
      return entity ?? null;
    }, `Failed to get landmark ${id}`);
  }

  /**
   * Get all landmarks
   * @returns Array of landmark entities
   */
  async getAll(): Promise<LandmarkEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      return await db.landmarks.toArray();
    }, 'Failed to get all landmarks');

    return result ?? [];
  }

  /**
   * Get landmarks by elevation range
   * @param minElevation - Minimum elevation
   * @param maxElevation - Maximum elevation
   * @returns Array of landmark entities within elevation range
   */
  async getByElevationRange(minElevation: number, maxElevation: number): Promise<LandmarkEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      return await db.landmarks
        .where('elevation')
        .between(minElevation, maxElevation, true, true)
        .toArray();
    }, `Failed to get landmarks by elevation range [${minElevation}, ${maxElevation}]`);

    return result ?? [];
  }

  /**
   * Delete a landmark by ID
   * @param id - Landmark ID
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      await db.landmarks.delete(id);
      return true;
    }, `Failed to delete landmark ${id}`);

    return result ?? false;
  }

  /**
   * Delete all landmarks
   * @returns Number of landmarks deleted
   */
  async deleteAll(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      const count = await db.landmarks.count();
      await db.landmarks.clear();
      return count;
    }, 'Failed to delete all landmarks');

    return result ?? 0;
  }

  /**
   * Count total landmarks
   * @returns Number of landmarks in database
   */
  async count(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      return await db.landmarks.count();
    }, 'Failed to count landmarks');

    return result ?? 0;
  }

  /**
   * Check if a landmark exists
   * @param id - Landmark ID
   * @returns True if landmark exists
   */
  async exists(id: string): Promise<boolean> {
    const landmark = await this.getById(id);
    return landmark !== null;
  }
}
