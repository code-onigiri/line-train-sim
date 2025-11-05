import type { StationModel } from '../../models/Station';
import { type StationEntity, db, safeDatabaseOperation } from './db';

/**
 * Repository for persisting and retrieving stations using IndexedDB
 */
export class StationRepository {
  /**
   * Save a station to the database
   * @param station - Station to save
   * @returns True if saved successfully
   */
  async save(station: StationModel): Promise<boolean> {
    const entity: StationEntity = {
      id: station.id,
      name: station.name,
      areaPolygon: station.areaPolygon,
      platforms: station.platforms,
      stoppingTracks: station.stoppingTracks,
      landmarkEntrances: station.landmarkEntrances,
      diagramOrderIndex: station.diagramOrderIndex,
      createdAt: station.createdAt,
      updatedAt: station.updatedAt,
    };

    const result = await safeDatabaseOperation(async () => {
      await db.stations.put(entity);
      return true;
    }, `Failed to save station ${station.id}`);

    return result ?? false;
  }

  /**
   * Save multiple stations in a batch
   * @param stations - Array of stations to save
   * @returns Number of stations saved successfully
   */
  async saveBatch(stations: StationModel[]): Promise<number> {
    const entities: StationEntity[] = stations.map((station) => ({
      id: station.id,
      name: station.name,
      areaPolygon: station.areaPolygon,
      platforms: station.platforms,
      stoppingTracks: station.stoppingTracks,
      landmarkEntrances: station.landmarkEntrances,
      diagramOrderIndex: station.diagramOrderIndex,
      createdAt: station.createdAt,
      updatedAt: station.updatedAt,
    }));

    const result = await safeDatabaseOperation(async () => {
      await db.stations.bulkPut(entities);
      return entities.length;
    }, 'Failed to save stations batch');

    return result ?? 0;
  }

  /**
   * Get a station by ID
   * @param id - Station ID
   * @returns Station entity or null if not found
   */
  async getById(id: string): Promise<StationEntity | null> {
    return await safeDatabaseOperation(async () => {
      const entity = await db.stations.get(id);
      return entity ?? null;
    }, `Failed to get station ${id}`);
  }

  /**
   * Get all stations
   * @returns Array of station entities
   */
  async getAll(): Promise<StationEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      return await db.stations.toArray();
    }, 'Failed to get all stations');

    return result ?? [];
  }

  /**
   * Get station by name
   * @param name - Station name
   * @returns Station entity or null if not found
   */
  async getByName(name: string): Promise<StationEntity | null> {
    const result = await safeDatabaseOperation(async () => {
      const station = await db.stations.where('name').equals(name).first();
      return station ?? null;
    }, `Failed to get station by name ${name}`);

    return result ?? null;
  }

  /**
   * Get stations ordered by diagram index
   * @returns Array of station entities sorted by diagram order
   */
  async getAllByDiagramOrder(): Promise<StationEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      return await db.stations.orderBy('diagramOrderIndex').toArray();
    }, 'Failed to get stations by diagram order');

    return result ?? [];
  }

  /**
   * Delete a station by ID
   * @param id - Station ID
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      await db.stations.delete(id);
      return true;
    }, `Failed to delete station ${id}`);

    return result ?? false;
  }

  /**
   * Delete all stations
   * @returns Number of stations deleted
   */
  async deleteAll(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      const count = await db.stations.count();
      await db.stations.clear();
      return count;
    }, 'Failed to delete all stations');

    return result ?? 0;
  }

  /**
   * Count total stations
   * @returns Number of stations in database
   */
  async count(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      return await db.stations.count();
    }, 'Failed to count stations');

    return result ?? 0;
  }

  /**
   * Check if a station exists
   * @param id - Station ID
   * @returns True if station exists
   */
  async exists(id: string): Promise<boolean> {
    const station = await this.getById(id);
    return station !== null;
  }

  /**
   * Update station diagram order
   * @param id - Station ID
   * @param newOrderIndex - New diagram order index
   * @returns True if updated successfully
   */
  async updateDiagramOrder(id: string, newOrderIndex: number): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      await db.stations.update(id, { diagramOrderIndex: newOrderIndex, updatedAt: Date.now() });
      return true;
    }, `Failed to update diagram order for station ${id}`);

    return result ?? false;
  }
}
