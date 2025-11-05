import { v4 as uuidv4 } from 'uuid';
import { type Landmark, LandmarkSchema } from '../schemas/entities';

export class LandmarkModel {
  private data: Landmark;

  constructor(data: Partial<Landmark>) {
    const now = Date.now();
    this.data = LandmarkSchema.parse({
      id: data.id || uuidv4(),
      x: data.x ?? 0,
      y: data.y ?? 0,
      elevation: data.elevation ?? 0,
      connections: data.connections ?? [],
      metadata: data.metadata ?? {},
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get x(): number {
    return this.data.x;
  }

  get y(): number {
    return this.data.y;
  }

  get elevation(): number {
    return this.data.elevation;
  }

  get connections(): string[] {
    return [...this.data.connections];
  }

  get metadata(): Record<string, unknown> {
    return { ...this.data.metadata };
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updatePosition(x: number, y: number): LandmarkModel {
    return new LandmarkModel({
      ...this.data,
      x,
      y,
      updatedAt: Date.now(),
    });
  }

  updateElevation(elevation: number): LandmarkModel {
    return new LandmarkModel({
      ...this.data,
      elevation,
      updatedAt: Date.now(),
    });
  }

  addConnection(trackSegmentId: string): LandmarkModel {
    if (this.data.connections.includes(trackSegmentId)) {
      return this;
    }
    return new LandmarkModel({
      ...this.data,
      connections: [...this.data.connections, trackSegmentId],
      updatedAt: Date.now(),
    });
  }

  removeConnection(trackSegmentId: string): LandmarkModel {
    return new LandmarkModel({
      ...this.data,
      connections: this.data.connections.filter((id) => id !== trackSegmentId),
      updatedAt: Date.now(),
    });
  }

  updateMetadata(metadata: Record<string, unknown>): LandmarkModel {
    return new LandmarkModel({
      ...this.data,
      metadata: { ...this.data.metadata, ...metadata },
      updatedAt: Date.now(),
    });
  }

  toJSON(): Landmark {
    return { ...this.data };
  }

  static fromJSON(json: Landmark): LandmarkModel {
    return new LandmarkModel(json);
  }
}
