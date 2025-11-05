import { v4 as uuidv4 } from 'uuid';
import { type TrackSegment, TrackSegmentSchema } from '../schemas/entities';

export class TrackSegmentModel {
  private data: TrackSegment;

  constructor(data: Partial<TrackSegment>) {
    const now = Date.now();
    this.data = TrackSegmentSchema.parse({
      id: data.id || uuidv4(),
      startLandmarkId: data.startLandmarkId ?? '',
      endLandmarkId: data.endLandmarkId ?? '',
      classification: data.classification ?? 'mainline',
      isBidirectional: data.isBidirectional ?? true,
      permissibleSpeedKph: data.permissibleSpeedKph ?? 100,
      elevation: data.elevation ?? 0,
      addons: data.addons ?? [],
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get startLandmarkId(): string {
    return this.data.startLandmarkId;
  }

  get endLandmarkId(): string {
    return this.data.endLandmarkId;
  }

  get classification(): 'mainline' | 'station' | 'depot' {
    return this.data.classification;
  }

  get isBidirectional(): boolean {
    return this.data.isBidirectional;
  }

  get permissibleSpeedKph(): number {
    return this.data.permissibleSpeedKph;
  }

  get elevation(): number {
    return this.data.elevation;
  }

  get addons(): string[] {
    return [...this.data.addons];
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateClassification(classification: 'mainline' | 'station' | 'depot'): TrackSegmentModel {
    return new TrackSegmentModel({
      ...this.data,
      classification,
      updatedAt: Date.now(),
    });
  }

  updateSpeed(permissibleSpeedKph: number): TrackSegmentModel {
    return new TrackSegmentModel({
      ...this.data,
      permissibleSpeedKph,
      updatedAt: Date.now(),
    });
  }

  updateElevation(elevation: number): TrackSegmentModel {
    return new TrackSegmentModel({
      ...this.data,
      elevation,
      updatedAt: Date.now(),
    });
  }

  setBidirectional(isBidirectional: boolean): TrackSegmentModel {
    return new TrackSegmentModel({
      ...this.data,
      isBidirectional,
      updatedAt: Date.now(),
    });
  }

  addAddon(addonId: string): TrackSegmentModel {
    if (this.data.addons.includes(addonId)) {
      return this;
    }
    return new TrackSegmentModel({
      ...this.data,
      addons: [...this.data.addons, addonId],
      updatedAt: Date.now(),
    });
  }

  removeAddon(addonId: string): TrackSegmentModel {
    return new TrackSegmentModel({
      ...this.data,
      addons: this.data.addons.filter((id) => id !== addonId),
      updatedAt: Date.now(),
    });
  }

  toJSON(): TrackSegment {
    return { ...this.data };
  }

  static fromJSON(json: TrackSegment): TrackSegmentModel {
    return new TrackSegmentModel(json);
  }
}
