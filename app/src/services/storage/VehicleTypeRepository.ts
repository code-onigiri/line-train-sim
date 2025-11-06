import type { VehicleTypeModel } from '../../models/VehicleType';
import { type VehicleTypeEntity, db, safeDatabaseOperation } from './db';

/**
 * Repository for persisting and retrieving vehicle types using IndexedDB
 */
export class VehicleTypeRepository {
  /**
   * Save a vehicle type to the database
   * @param vehicleType - Vehicle type to save
   * @returns True if saved successfully
   */
  async save(vehicleType: VehicleTypeModel): Promise<boolean> {
    const entity: VehicleTypeEntity = {
      id: vehicleType.id,
      name: vehicleType.name,
      speedCategory: vehicleType.speedCategory,
      maxSpeedKph: vehicleType.maxSpeedKph,
      capacity: vehicleType.capacity,
      lengthMeters: vehicleType.lengthMeters,
      createdAt: vehicleType.createdAt,
      updatedAt: vehicleType.updatedAt,
    };

    const result = await safeDatabaseOperation(async () => {
      await db.vehicleTypes.put(entity);
      return true;
    }, `Failed to save vehicle type ${vehicleType.id}`);

    return result ?? false;
  }

  /**
   * Save multiple vehicle types in a batch
   * @param vehicleTypes - Array of vehicle types to save
   * @returns Number of vehicle types saved successfully
   */
  async saveBatch(vehicleTypes: VehicleTypeModel[]): Promise<number> {
    const entities: VehicleTypeEntity[] = vehicleTypes.map((vt) => ({
      id: vt.id,
      name: vt.name,
      speedCategory: vt.speedCategory,
      maxSpeedKph: vt.maxSpeedKph,
      capacity: vt.capacity,
      lengthMeters: vt.lengthMeters,
      createdAt: vt.createdAt,
      updatedAt: vt.updatedAt,
    }));

    const result = await safeDatabaseOperation(async () => {
      await db.vehicleTypes.bulkPut(entities);
      return entities.length;
    }, 'Failed to save vehicle types batch');

    return result ?? 0;
  }

  /**
   * Get a vehicle type by ID
   * @param id - Vehicle type ID
   * @returns Vehicle type entity or null if not found
   */
  async getById(id: string): Promise<VehicleTypeEntity | null> {
    return await safeDatabaseOperation(async () => {
      const entity = await db.vehicleTypes.get(id);
      return entity ?? null;
    }, `Failed to get vehicle type ${id}`);
  }

  /**
   * Get all vehicle types
   * @returns Array of vehicle type entities
   */
  async getAll(): Promise<VehicleTypeEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      return await db.vehicleTypes.toArray();
    }, 'Failed to get all vehicle types');

    return result ?? [];
  }

  /**
   * Get vehicle types by speed category
   * @param speedCategory - Speed category to filter by
   * @returns Array of vehicle type entities with matching category
   */
  async getBySpeedCategory(
    speedCategory: 'slow' | 'standard' | 'fast',
  ): Promise<VehicleTypeEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      return await db.vehicleTypes.where('speedCategory').equals(speedCategory).toArray();
    }, `Failed to get vehicle types by speed category ${speedCategory}`);

    return result ?? [];
  }

  /**
   * Get vehicle types by name (partial match)
   * @param namePattern - Name pattern to search for
   * @returns Array of matching vehicle type entities
   */
  async getByName(namePattern: string): Promise<VehicleTypeEntity[]> {
    const result = await safeDatabaseOperation(async () => {
      const allTypes = await db.vehicleTypes.toArray();
      return allTypes.filter((vt) => vt.name.toLowerCase().includes(namePattern.toLowerCase()));
    }, `Failed to search vehicle types by name ${namePattern}`);

    return result ?? [];
  }

  /**
   * Delete a vehicle type by ID
   * @param id - Vehicle type ID
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    const result = await safeDatabaseOperation(async () => {
      await db.vehicleTypes.delete(id);
      return true;
    }, `Failed to delete vehicle type ${id}`);

    return result ?? false;
  }

  /**
   * Delete all vehicle types
   * @returns Number of vehicle types deleted
   */
  async deleteAll(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      const count = await db.vehicleTypes.count();
      await db.vehicleTypes.clear();
      return count;
    }, 'Failed to delete all vehicle types');

    return result ?? 0;
  }

  /**
   * Count total vehicle types
   * @returns Number of vehicle types in database
   */
  async count(): Promise<number> {
    const result = await safeDatabaseOperation(async () => {
      return await db.vehicleTypes.count();
    }, 'Failed to count vehicle types');

    return result ?? 0;
  }

  /**
   * Check if a vehicle type exists
   * @param id - Vehicle type ID
   * @returns True if vehicle type exists
   */
  async exists(id: string): Promise<boolean> {
    const vehicleType = await this.getById(id);
    return vehicleType !== null;
  }
}
