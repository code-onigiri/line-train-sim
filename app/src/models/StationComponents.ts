import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { PointSchema, TimestampSchema } from '../schemas/entities';

// Platform schema
export const PlatformSchema = z.object({
  id: z.string().uuid(),
  stationId: z.string().uuid(),
  name: z.string().min(1),
  polygon: z.array(PointSchema).min(2),
  trackIds: z.array(z.string().uuid()),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Platform = z.infer<typeof PlatformSchema>;

// StoppingTrack schema
export const StoppingTrackSchema = z.object({
  id: z.string().uuid(),
  stationId: z.string().uuid(),
  trackSegmentId: z.string().uuid(),
  platformId: z.string().uuid(),
  capacity: z.number().int().positive(),
  length: z.number().positive(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type StoppingTrack = z.infer<typeof StoppingTrackSchema>;

// Platform Model
export class PlatformModel {
  private data: Platform;

  constructor(data: Partial<Platform>) {
    const now = Date.now();
    this.data = PlatformSchema.parse({
      id: data.id || uuidv4(),
      stationId: data.stationId ?? '',
      name: data.name ?? 'Platform',
      polygon: data.polygon ?? [],
      trackIds: data.trackIds ?? [],
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get stationId(): string {
    return this.data.stationId;
  }

  get name(): string {
    return this.data.name;
  }

  get polygon(): Array<{ x: number; y: number }> {
    return this.data.polygon.map((p) => ({ ...p }));
  }

  get trackIds(): string[] {
    return [...this.data.trackIds];
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateName(name: string): PlatformModel {
    return new PlatformModel({
      ...this.data,
      name,
      updatedAt: Date.now(),
    });
  }

  updatePolygon(polygon: Array<{ x: number; y: number }>): PlatformModel {
    return new PlatformModel({
      ...this.data,
      polygon,
      updatedAt: Date.now(),
    });
  }

  addTrack(trackId: string): PlatformModel {
    if (this.data.trackIds.includes(trackId)) {
      return this;
    }
    return new PlatformModel({
      ...this.data,
      trackIds: [...this.data.trackIds, trackId],
      updatedAt: Date.now(),
    });
  }

  removeTrack(trackId: string): PlatformModel {
    return new PlatformModel({
      ...this.data,
      trackIds: this.data.trackIds.filter((id) => id !== trackId),
      updatedAt: Date.now(),
    });
  }

  toJSON(): Platform {
    return { ...this.data };
  }

  static fromJSON(json: Platform): PlatformModel {
    return new PlatformModel(json);
  }
}

// StoppingTrack Model
export class StoppingTrackModel {
  private data: StoppingTrack;

  constructor(data: Partial<StoppingTrack>) {
    const now = Date.now();
    this.data = StoppingTrackSchema.parse({
      id: data.id || uuidv4(),
      stationId: data.stationId ?? '',
      trackSegmentId: data.trackSegmentId ?? '',
      platformId: data.platformId ?? '',
      capacity: data.capacity ?? 1,
      length: data.length ?? 100,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get stationId(): string {
    return this.data.stationId;
  }

  get trackSegmentId(): string {
    return this.data.trackSegmentId;
  }

  get platformId(): string {
    return this.data.platformId;
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

  updateCapacity(capacity: number): StoppingTrackModel {
    return new StoppingTrackModel({
      ...this.data,
      capacity,
      updatedAt: Date.now(),
    });
  }

  updateLength(length: number): StoppingTrackModel {
    return new StoppingTrackModel({
      ...this.data,
      length,
      updatedAt: Date.now(),
    });
  }

  toJSON(): StoppingTrack {
    return { ...this.data };
  }

  static fromJSON(json: StoppingTrack): StoppingTrackModel {
    return new StoppingTrackModel(json);
  }
}
