import { VehicleTypeModel } from '../../models/VehicleType';

/**
 * Service for managing vehicle types and their speed categories.
 * Handles vehicle type creation, updates, and category management according to FR-007.
 */
export class VehicleTypeService {
  private vehicleTypes: Map<string, VehicleTypeModel> = new Map();

  /**
   * Create a new vehicle type with the given configuration.
   * @param name - Vehicle type name
   * @param speedCategory - Speed category (slow, standard, fast)
   * @param maxSpeedKph - Maximum speed in km/h
   * @param capacity - Passenger capacity
   * @param lengthMeters - Vehicle length in meters
   */
  create(
    name: string,
    speedCategory: 'slow' | 'standard' | 'fast',
    maxSpeedKph: number,
    capacity: number,
    lengthMeters: number,
  ): VehicleTypeModel {
    const vehicleType = new VehicleTypeModel({
      name,
      speedCategory,
      maxSpeedKph,
      capacity,
      lengthMeters,
    });
    this.vehicleTypes.set(vehicleType.id, vehicleType);
    return vehicleType;
  }

  /**
   * Get a vehicle type by ID.
   */
  get(id: string): VehicleTypeModel | undefined {
    return this.vehicleTypes.get(id);
  }

  /**
   * Get all vehicle types.
   */
  getAll(): VehicleTypeModel[] {
    return Array.from(this.vehicleTypes.values());
  }

  /**
   * Get vehicle types by speed category.
   * @param speedCategory - Speed category to filter by
   */
  getBySpeedCategory(speedCategory: 'slow' | 'standard' | 'fast'): VehicleTypeModel[] {
    return this.getAll().filter((vt) => vt.speedCategory === speedCategory);
  }

  /**
   * Update an existing vehicle type.
   * @param id - Vehicle type ID
   * @param updates - Partial vehicle type data to update
   */
  update(id: string, updates: Partial<VehicleTypeModel>): VehicleTypeModel | undefined {
    const existing = this.vehicleTypes.get(id);
    if (!existing) {
      return undefined;
    }

    let updated = existing;

    if (updates.name !== undefined) {
      updated = updated.updateName(updates.name);
    }
    if (updates.speedCategory !== undefined) {
      updated = updated.updateSpeedCategory(updates.speedCategory);
    }
    if (updates.maxSpeedKph !== undefined) {
      updated = updated.updateMaxSpeed(updates.maxSpeedKph);
    }
    if (updates.capacity !== undefined) {
      updated = updated.updateCapacity(updates.capacity);
    }
    if (updates.lengthMeters !== undefined) {
      updated = updated.updateLength(updates.lengthMeters);
    }

    this.vehicleTypes.set(id, updated);
    return updated;
  }

  /**
   * Delete a vehicle type by ID.
   * @param id - Vehicle type ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): boolean {
    return this.vehicleTypes.delete(id);
  }

  /**
   * Load vehicle types from storage.
   * @param vehicleTypes - Array of vehicle type data
   */
  loadAll(vehicleTypes: VehicleTypeModel[]): void {
    this.vehicleTypes.clear();
    for (const vt of vehicleTypes) {
      this.vehicleTypes.set(vt.id, vt);
    }
  }

  /**
   * Clear all vehicle types (for testing/reset).
   */
  clear(): void {
    this.vehicleTypes.clear();
  }
}
