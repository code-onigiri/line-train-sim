import { v4 as uuidv4 } from 'uuid';
import { type Station, StationSchema } from '../schemas/entities';

export class StationModel {
  private data: Station;

  constructor(data: Partial<Station>) {
    const now = Date.now();
    this.data = StationSchema.parse({
      id: data.id || uuidv4(),
      name: data.name ?? 'Untitled Station',
      areaPolygon: data.areaPolygon ?? [],
      platforms: data.platforms ?? [],
      stoppingTracks: data.stoppingTracks ?? [],
      landmarkEntrances: data.landmarkEntrances ?? [],
      diagramOrderIndex: data.diagramOrderIndex ?? 0,
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

  get platforms(): string[] {
    return [...this.data.platforms];
  }

  get stoppingTracks(): string[] {
    return [...this.data.stoppingTracks];
  }

  get landmarkEntrances(): string[] {
    return [...this.data.landmarkEntrances];
  }

  get diagramOrderIndex(): number {
    return this.data.diagramOrderIndex;
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateName(name: string): StationModel {
    return new StationModel({
      ...this.data,
      name,
      updatedAt: Date.now(),
    });
  }

  updateAreaPolygon(areaPolygon: Array<{ x: number; y: number }>): StationModel {
    return new StationModel({
      ...this.data,
      areaPolygon,
      updatedAt: Date.now(),
    });
  }

  addPlatform(platformId: string): StationModel {
    if (this.data.platforms.includes(platformId)) {
      return this;
    }
    return new StationModel({
      ...this.data,
      platforms: [...this.data.platforms, platformId],
      updatedAt: Date.now(),
    });
  }

  removePlatform(platformId: string): StationModel {
    return new StationModel({
      ...this.data,
      platforms: this.data.platforms.filter((id) => id !== platformId),
      updatedAt: Date.now(),
    });
  }

  addStoppingTrack(trackId: string): StationModel {
    if (this.data.stoppingTracks.includes(trackId)) {
      return this;
    }
    return new StationModel({
      ...this.data,
      stoppingTracks: [...this.data.stoppingTracks, trackId],
      updatedAt: Date.now(),
    });
  }

  removeStoppingTrack(trackId: string): StationModel {
    return new StationModel({
      ...this.data,
      stoppingTracks: this.data.stoppingTracks.filter((id) => id !== trackId),
      updatedAt: Date.now(),
    });
  }

  addLandmarkEntrance(landmarkId: string): StationModel {
    if (this.data.landmarkEntrances.includes(landmarkId)) {
      return this;
    }
    return new StationModel({
      ...this.data,
      landmarkEntrances: [...this.data.landmarkEntrances, landmarkId],
      updatedAt: Date.now(),
    });
  }

  removeLandmarkEntrance(landmarkId: string): StationModel {
    return new StationModel({
      ...this.data,
      landmarkEntrances: this.data.landmarkEntrances.filter((id) => id !== landmarkId),
      updatedAt: Date.now(),
    });
  }

  updateDiagramOrderIndex(index: number): StationModel {
    return new StationModel({
      ...this.data,
      diagramOrderIndex: index,
      updatedAt: Date.now(),
    });
  }

  toJSON(): Station {
    return { ...this.data };
  }

  static fromJSON(json: Station): StationModel {
    return new StationModel(json);
  }
}
