import { v4 as uuidv4 } from 'uuid';
import { type Depot, DepotSchema } from '../schemas/entities';

export class DepotModel {
  private data: Depot;

  constructor(data: Partial<Depot>) {
    const now = Date.now();
    this.data = DepotSchema.parse({
      id: data.id || uuidv4(),
      name: data.name ?? 'Untitled Depot',
      areaPolygon: data.areaPolygon ?? [],
      stoppingLanes: data.stoppingLanes ?? [],
      serviceTracks: data.serviceTracks ?? [],
      inventory: data.inventory ?? [],
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get areaPolygon(): Array<{ x: number; y: number }> {
    return this.data.areaPolygon.map((p) => ({ ...p }));
  }

  get stoppingLanes(): string[] {
    return [...this.data.stoppingLanes];
  }

  get serviceTracks(): string[] {
    return [...this.data.serviceTracks];
  }

  get inventory(): Array<{ vehicleTypeId: string; quantity: number }> {
    return this.data.inventory.map((item) => ({ ...item }));
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateName(name: string): DepotModel {
    return new DepotModel({
      ...this.data,
      name,
      updatedAt: Date.now(),
    });
  }

  updateAreaPolygon(areaPolygon: Array<{ x: number; y: number }>): DepotModel {
    return new DepotModel({
      ...this.data,
      areaPolygon,
      updatedAt: Date.now(),
    });
  }

  addStoppingLane(laneId: string): DepotModel {
    if (this.data.stoppingLanes.includes(laneId)) {
      return this;
    }
    return new DepotModel({
      ...this.data,
      stoppingLanes: [...this.data.stoppingLanes, laneId],
      updatedAt: Date.now(),
    });
  }

  removeStoppingLane(laneId: string): DepotModel {
    return new DepotModel({
      ...this.data,
      stoppingLanes: this.data.stoppingLanes.filter((id) => id !== laneId),
      updatedAt: Date.now(),
    });
  }

  addServiceTrack(trackId: string): DepotModel {
    if (this.data.serviceTracks.includes(trackId)) {
      return this;
    }
    return new DepotModel({
      ...this.data,
      serviceTracks: [...this.data.serviceTracks, trackId],
      updatedAt: Date.now(),
    });
  }

  removeServiceTrack(trackId: string): DepotModel {
    return new DepotModel({
      ...this.data,
      serviceTracks: this.data.serviceTracks.filter((id) => id !== trackId),
      updatedAt: Date.now(),
    });
  }

  addInventoryItem(vehicleTypeId: string, quantity: number): DepotModel {
    const existing = this.data.inventory.find((item) => item.vehicleTypeId === vehicleTypeId);
    if (existing) {
      return new DepotModel({
        ...this.data,
        inventory: this.data.inventory.map((item) =>
          item.vehicleTypeId === vehicleTypeId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
        updatedAt: Date.now(),
      });
    }
    return new DepotModel({
      ...this.data,
      inventory: [...this.data.inventory, { vehicleTypeId, quantity }],
      updatedAt: Date.now(),
    });
  }

  removeInventoryItem(vehicleTypeId: string, quantity: number): DepotModel {
    return new DepotModel({
      ...this.data,
      inventory: this.data.inventory
        .map((item) =>
          item.vehicleTypeId === vehicleTypeId
            ? { ...item, quantity: Math.max(0, item.quantity - quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0),
      updatedAt: Date.now(),
    });
  }

  updateInventoryQuantity(vehicleTypeId: string, quantity: number): DepotModel {
    const existing = this.data.inventory.find((item) => item.vehicleTypeId === vehicleTypeId);
    if (!existing) {
      return this.addInventoryItem(vehicleTypeId, quantity);
    }
    return new DepotModel({
      ...this.data,
      inventory: this.data.inventory.map((item) =>
        item.vehicleTypeId === vehicleTypeId ? { ...item, quantity } : item,
      ),
      updatedAt: Date.now(),
    });
  }

  toJSON(): Depot {
    return { ...this.data };
  }

  static fromJSON(json: Depot): DepotModel {
    return new DepotModel(json);
  }
}
