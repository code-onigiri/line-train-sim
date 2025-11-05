import { DepotModel } from '../../models/Depot';
import type { Depot } from '../../schemas/entities';

export class DepotService {
  private depots: Map<string, DepotModel> = new Map();

  create(name: string, areaPolygon: Array<{ x: number; y: number }>): DepotModel {
    // Validate polygon
    if (areaPolygon.length < 3) {
      throw new Error('Depot area must have at least 3 points');
    }

    const depot = new DepotModel({
      name,
      areaPolygon,
    });

    this.depots.set(depot.id, depot);
    return depot;
  }

  get(id: string): DepotModel | undefined {
    return this.depots.get(id);
  }

  getAll(): DepotModel[] {
    return Array.from(this.depots.values());
  }

  update(id: string, updates: Partial<Depot>): DepotModel | undefined {
    const existing = this.depots.get(id);
    if (!existing) {
      return undefined;
    }

    let updated = existing;
    if (updates.name) {
      updated = updated.updateName(updates.name);
    }
    if (updates.areaPolygon) {
      updated = updated.updateAreaPolygon(updates.areaPolygon);
    }

    this.depots.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.depots.delete(id);
  }

  addStoppingLane(depotId: string, laneId: string): DepotModel {
    const depot = this.depots.get(depotId);
    if (!depot) {
      throw new Error(`Depot ${depotId} not found`);
    }

    const updated = depot.addStoppingLane(laneId);
    this.depots.set(depotId, updated);
    return updated;
  }

  removeStoppingLane(depotId: string, laneId: string): DepotModel {
    const depot = this.depots.get(depotId);
    if (!depot) {
      throw new Error(`Depot ${depotId} not found`);
    }

    const updated = depot.removeStoppingLane(laneId);
    this.depots.set(depotId, updated);
    return updated;
  }

  addServiceTrack(depotId: string, trackId: string): DepotModel {
    const depot = this.depots.get(depotId);
    if (!depot) {
      throw new Error(`Depot ${depotId} not found`);
    }

    const updated = depot.addServiceTrack(trackId);
    this.depots.set(depotId, updated);
    return updated;
  }

  removeServiceTrack(depotId: string, trackId: string): DepotModel {
    const depot = this.depots.get(depotId);
    if (!depot) {
      throw new Error(`Depot ${depotId} not found`);
    }

    const updated = depot.removeServiceTrack(trackId);
    this.depots.set(depotId, updated);
    return updated;
  }

  addInventory(depotId: string, vehicleTypeId: string, quantity: number): DepotModel {
    const depot = this.depots.get(depotId);
    if (!depot) {
      throw new Error(`Depot ${depotId} not found`);
    }

    if (quantity < 0) {
      throw new Error('Quantity must be non-negative');
    }

    const updated = depot.addInventoryItem(vehicleTypeId, quantity);
    this.depots.set(depotId, updated);
    return updated;
  }

  removeInventory(depotId: string, vehicleTypeId: string, quantity: number): DepotModel {
    const depot = this.depots.get(depotId);
    if (!depot) {
      throw new Error(`Depot ${depotId} not found`);
    }

    if (quantity < 0) {
      throw new Error('Quantity must be non-negative');
    }

    const updated = depot.removeInventoryItem(vehicleTypeId, quantity);
    this.depots.set(depotId, updated);
    return updated;
  }

  updateInventoryQuantity(depotId: string, vehicleTypeId: string, quantity: number): DepotModel {
    const depot = this.depots.get(depotId);
    if (!depot) {
      throw new Error(`Depot ${depotId} not found`);
    }

    if (quantity < 0) {
      throw new Error('Quantity must be non-negative');
    }

    const updated = depot.updateInventoryQuantity(vehicleTypeId, quantity);
    this.depots.set(depotId, updated);
    return updated;
  }

  getInventory(
    depotId: string,
    vehicleTypeId: string,
  ): { vehicleTypeId: string; quantity: number } | undefined {
    const depot = this.depots.get(depotId);
    if (!depot) {
      return undefined;
    }

    return depot.inventory.find((item) => item.vehicleTypeId === vehicleTypeId);
  }

  hasAvailableInventory(depotId: string, vehicleTypeId: string, requiredQuantity: number): boolean {
    const item = this.getInventory(depotId, vehicleTypeId);
    return item ? item.quantity >= requiredQuantity : false;
  }

  findByName(name: string): DepotModel | undefined {
    return Array.from(this.depots.values()).find((depot) => depot.name === name);
  }

  clear(): void {
    this.depots.clear();
  }

  count(): number {
    return this.depots.size;
  }
}
