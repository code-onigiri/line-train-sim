import type { DepotModel } from '../../models/Depot';
import { type DepotEntity, db, safeDatabaseOperation } from './db';

/**
 * Repository for persisting and retrieving depots using IndexedDB
 */
export class DepotRepository {
  /**
   * Save a depot to the database
   * @param depot - Depot to save
   * @returns True if saved successfully
   */
  async save(depot: DepotModel): Promise<boolean> {
    const entity: DepotEntity = {
      id: depot.id,
      name: depot.name,
      areaPolygon: depot.areaPolygon,
      stoppingLanes: depot.stoppingLanes,
      serviceTracks: depot.serviceTracks,
      inventory: depot.inventory,
      createdAt: depot.createdAt,
      updatedAt: depot.updatedAt,
    };

    const result = await safeDatabaseOperation(async () => {
      await db.depots.put(entity);
      return true;
    }, `Failed to save depot ${depot.id}`);

    return result ?? false;
  }

  /**
   * Save multiple depots in a batch
   * @param depots - Array of depots to save
   * @returns Number of depots saved successfully
   */
  async saveBatch(depots: DepotModel[]): Promise<number> {
    const entities: DepotEntity[] = depots.map((depot) => ({
      id: depot.id,
      name: depot.name,
      areaPolygon: depot.areaPolygon,
      stoppingLanes: depot.stoppingLanes,
      serviceTracks: depot.serviceTracks,
      inventory: depot.inventory,
      createdAt: depot.createdAt,
      updatedAt: depot.updatedAt,
    }));

    const result = await safeDatabaseOperation(async () => {
      await db.depots.bulkPut(entities);
      return entities.length;
    }, 'Failed to save depots batch');

    return result ?? 0;
  }

  /**
   * Get a depot by ID
   * @param id - Depot ID
   * @returns Depot entity or null if not found
   */
  async getById(id: string): Promise<DepotEntity | null> {
    return await safeDatabaseOperation(async () => {
      const entity = await db.depots.get(id);
      return entity ?? null;
    }, `Failed to get depot ${id}`);
  }

  /**
   * Get all depots
   * @returns Array of depot entities
   */
  async getAll(): Promise<DepotEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      return await db.depots.toArray();
    }, 'Failed to get all depots');

    return result ?? [];
  }

  /**
   * Get depot by name
   * @param name - Depot name
   * @returns Depot entity or null if not found
   */
  async getByName(name: string): Promise<DepotEntity | null> {
    const result = await safeDatabaseOperation(async () => {
      const depot = await db.depots.where('name').equals(name).first();
      return depot ?? null;
    }, `Failed to get depot by name ${name}`);

    return result ?? null;
  }

  /**
   * Delete a depot by ID
   * @param id - Depot ID
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      await db.depots.delete(id);
      return true;
    }, `Failed to delete depot ${id}`);

    return result ?? false;
  }

  /**
   * Delete all depots
   * @returns Number of depots deleted
   */
  async deleteAll(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      const count = await db.depots.count();
      await db.depots.clear();
      return count;
    }, 'Failed to delete all depots');

    return result ?? 0;
  }

  /**
   * Count total depots
   * @returns Number of depots in database
   */
  async count(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      return await db.depots.count();
    }, 'Failed to count depots');

    return result ?? 0;
  }

  /**
   * Check if a depot exists
   * @param id - Depot ID
   * @returns True if depot exists
   */
  async exists(id: string): Promise<boolean> {
    const depot = await this.getById(id);
    return depot !== null;
  }

  /**
   * Update depot inventory
   * @param id - Depot ID
   * @param inventory - New inventory array
   * @returns True if updated successfully
   */
  async updateInventory(
    id: string,
    inventory: Array<{ vehicleTypeId: string; quantity: number }>,
  ): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      await db.depots.update(id, { inventory, updatedAt: Date.now() });
      return true;
    }, `Failed to update inventory for depot ${id}`);

    return result ?? false;
  }
}
