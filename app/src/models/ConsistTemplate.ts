import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

/**
 * ConsistTemplate model
 * Defines a reusable train composition with vehicle types and counts
 */

export const ConsistTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  vehicleTypeId: z.string().uuid(),
  carCount: z.number().int().positive(),
  /** Speed category for the entire consist */
  speedCategory: z.enum(['slow', 'standard', 'fast']),
  /** Total length in meters (calculated from vehicle type and car count) */
  totalLengthMeters: z.number().positive(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

export type ConsistTemplate = z.infer<typeof ConsistTemplateSchema>;

export class ConsistTemplateModel {
  private data: ConsistTemplate;

  constructor(data: Partial<ConsistTemplate>) {
    const now = Date.now();
    this.data = ConsistTemplateSchema.parse({
      id: data.id || uuidv4(),
      name: data.name ?? 'Untitled Consist',
      vehicleTypeId: data.vehicleTypeId || '',
      carCount: data.carCount ?? 1,
      speedCategory: data.speedCategory ?? 'standard',
      totalLengthMeters: data.totalLengthMeters ?? 0,
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

  get vehicleTypeId(): string {
    return this.data.vehicleTypeId;
  }

  get carCount(): number {
    return this.data.carCount;
  }

  get speedCategory(): 'slow' | 'standard' | 'fast' {
    return this.data.speedCategory;
  }

  get totalLengthMeters(): number {
    return this.data.totalLengthMeters;
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateName(name: string): ConsistTemplateModel {
    return new ConsistTemplateModel({
      ...this.data,
      name,
      updatedAt: Date.now(),
    });
  }

  updateVehicleType(vehicleTypeId: string): ConsistTemplateModel {
    return new ConsistTemplateModel({
      ...this.data,
      vehicleTypeId,
      updatedAt: Date.now(),
    });
  }

  updateCarCount(carCount: number): ConsistTemplateModel {
    return new ConsistTemplateModel({
      ...this.data,
      carCount,
      updatedAt: Date.now(),
    });
  }

  updateSpeedCategory(speedCategory: 'slow' | 'standard' | 'fast'): ConsistTemplateModel {
    return new ConsistTemplateModel({
      ...this.data,
      speedCategory,
      updatedAt: Date.now(),
    });
  }

  updateTotalLength(totalLengthMeters: number): ConsistTemplateModel {
    return new ConsistTemplateModel({
      ...this.data,
      totalLengthMeters,
      updatedAt: Date.now(),
    });
  }

  toJSON(): ConsistTemplate {
    return { ...this.data };
  }

  static fromJSON(json: ConsistTemplate): ConsistTemplateModel {
    return new ConsistTemplateModel(json);
  }
}
