import { v4 as uuidv4 } from 'uuid';
import { type VehicleType, VehicleTypeSchema } from '../schemas/entities';

export class VehicleTypeModel {
  private data: VehicleType;

  constructor(data: Partial<VehicleType>) {
    const now = Date.now();
    this.data = VehicleTypeSchema.parse({
      id: data.id || uuidv4(),
      name: data.name ?? 'Untitled Vehicle',
      speedCategory: data.speedCategory ?? 'standard',
      maxSpeedKph: data.maxSpeedKph ?? 100,
      capacity: data.capacity ?? 100,
      lengthMeters: data.lengthMeters ?? 20,
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

  get speedCategory(): 'slow' | 'standard' | 'fast' {
    return this.data.speedCategory;
  }

  get maxSpeedKph(): number {
    return this.data.maxSpeedKph;
  }

  get capacity(): number {
    return this.data.capacity;
  }

  get lengthMeters(): number {
    return this.data.lengthMeters;
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateName(name: string): VehicleTypeModel {
    return new VehicleTypeModel({
      ...this.data,
      name,
      updatedAt: Date.now(),
    });
  }

  updateSpeedCategory(speedCategory: 'slow' | 'standard' | 'fast'): VehicleTypeModel {
    return new VehicleTypeModel({
      ...this.data,
      speedCategory,
      updatedAt: Date.now(),
    });
  }

  updateMaxSpeed(maxSpeedKph: number): VehicleTypeModel {
    return new VehicleTypeModel({
      ...this.data,
      maxSpeedKph,
      updatedAt: Date.now(),
    });
  }

  updateCapacity(capacity: number): VehicleTypeModel {
    return new VehicleTypeModel({
      ...this.data,
      capacity,
      updatedAt: Date.now(),
    });
  }

  updateLength(lengthMeters: number): VehicleTypeModel {
    return new VehicleTypeModel({
      ...this.data,
      lengthMeters,
      updatedAt: Date.now(),
    });
  }

  toJSON(): VehicleType {
    return { ...this.data };
  }

  static fromJSON(json: VehicleType): VehicleTypeModel {
    return new VehicleTypeModel(json);
  }
}
