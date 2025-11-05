import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { TimestampSchema } from '../schemas/entities';

// StoppingLane schema
export const StoppingLaneSchema = z.object({
  id: z.string().uuid(),
  depotId: z.string().uuid(),
  name: z.string().min(1),
  trackSegmentId: z.string().uuid(),
  capacity: z.number().int().positive(),
  length: z.number().positive(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type StoppingLane = z.infer<typeof StoppingLaneSchema>;

// DepotInventoryItem schema
export const DepotInventoryItemSchema = z.object({
  id: z.string().uuid(),
  depotId: z.string().uuid(),
  vehicleTypeId: z.string().uuid(),
  quantity: z.number().int().nonnegative(),
  laneAssignment: z.string().uuid().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type DepotInventoryItem = z.infer<typeof DepotInventoryItemSchema>;

// StoppingLane Model
export class StoppingLaneModel {
  private data: StoppingLane;

  constructor(data: Partial<StoppingLane>) {
    const now = Date.now();
    this.data = StoppingLaneSchema.parse({
      id: data.id || uuidv4(),
      depotId: data.depotId ?? '',
      name: data.name ?? 'Lane',
      trackSegmentId: data.trackSegmentId ?? '',
      capacity: data.capacity ?? 1,
      length: data.length ?? 200,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get depotId(): string {
    return this.data.depotId;
  }

  get name(): string {
    return this.data.name;
  }

  get trackSegmentId(): string {
    return this.data.trackSegmentId;
  }

  get capacity(): number {
    return this.data.capacity;
  }

  get length(): number {
    return this.data.length;
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateName(name: string): StoppingLaneModel {
    return new StoppingLaneModel({
      ...this.data,
      name,
      updatedAt: Date.now(),
    });
  }

  updateCapacity(capacity: number): StoppingLaneModel {
    return new StoppingLaneModel({
      ...this.data,
      capacity,
      updatedAt: Date.now(),
    });
  }

  updateLength(length: number): StoppingLaneModel {
    return new StoppingLaneModel({
      ...this.data,
      length,
      updatedAt: Date.now(),
    });
  }

  toJSON(): StoppingLane {
    return { ...this.data };
  }

  static fromJSON(json: StoppingLane): StoppingLaneModel {
    return new StoppingLaneModel(json);
  }
}

// DepotInventoryItem Model
export class DepotInventoryItemModel {
  private data: DepotInventoryItem;

  constructor(data: Partial<DepotInventoryItem>) {
    const now = Date.now();
    this.data = DepotInventoryItemSchema.parse({
      id: data.id || uuidv4(),
      depotId: data.depotId ?? '',
      vehicleTypeId: data.vehicleTypeId ?? '',
      quantity: data.quantity ?? 0,
      laneAssignment: data.laneAssignment,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get depotId(): string {
    return this.data.depotId;
  }

  get vehicleTypeId(): string {
    return this.data.vehicleTypeId;
  }

  get quantity(): number {
    return this.data.quantity;
  }

  get laneAssignment(): string | undefined {
    return this.data.laneAssignment;
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateQuantity(quantity: number): DepotInventoryItemModel {
    return new DepotInventoryItemModel({
      ...this.data,
      quantity,
      updatedAt: Date.now(),
    });
  }

  assignToLane(laneId: string): DepotInventoryItemModel {
    return new DepotInventoryItemModel({
      ...this.data,
      laneAssignment: laneId,
      updatedAt: Date.now(),
    });
  }

  unassignFromLane(): DepotInventoryItemModel {
    return new DepotInventoryItemModel({
      ...this.data,
      laneAssignment: undefined,
      updatedAt: Date.now(),
    });
  }

  toJSON(): DepotInventoryItem {
    return { ...this.data };
  }

  static fromJSON(json: DepotInventoryItem): DepotInventoryItemModel {
    return new DepotInventoryItemModel(json);
  }
}
