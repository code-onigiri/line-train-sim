import { StationModel } from '../../models/Station';
import type { Station } from '../../schemas/entities';

export class StationService {
  private stations: Map<string, StationModel> = new Map();

  create(name: string, areaPolygon: Array<{ x: number; y: number }>): StationModel {
    // Validate polygon
    if (areaPolygon.length < 3) {
      throw new Error('Station area must have at least 3 points');
    }

    if (!this.isValidPolygon(areaPolygon)) {
      throw new Error('Station area polygon is self-intersecting');
    }

    const station = new StationModel({
      name,
      areaPolygon,
    });

    this.stations.set(station.id, station);
    return station;
  }

  get(id: string): StationModel | undefined {
    return this.stations.get(id);
  }

  getAll(): StationModel[] {
    return Array.from(this.stations.values());
  }

  update(id: string, updates: Partial<Station>): StationModel | undefined {
    const existing = this.stations.get(id);
    if (!existing) {
      return undefined;
    }

    let updated = existing;
    if (updates.name) {
      updated = updated.updateName(updates.name);
    }
    if (updates.areaPolygon) {
      if (!this.isValidPolygon(updates.areaPolygon)) {
        throw new Error('Updated polygon is self-intersecting');
      }
      updated = updated.updateAreaPolygon(updates.areaPolygon);
    }
    if (updates.diagramOrderIndex !== undefined) {
      updated = updated.updateDiagramOrderIndex(updates.diagramOrderIndex);
    }

    this.stations.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.stations.delete(id);
  }

  addPlatform(stationId: string, platformId: string): StationModel {
    const station = this.stations.get(stationId);
    if (!station) {
      throw new Error(`Station ${stationId} not found`);
    }

    const updated = station.addPlatform(platformId);
    this.stations.set(stationId, updated);
    return updated;
  }

  removePlatform(stationId: string, platformId: string): StationModel {
    const station = this.stations.get(stationId);
    if (!station) {
      throw new Error(`Station ${stationId} not found`);
    }

    const updated = station.removePlatform(platformId);
    this.stations.set(stationId, updated);
    return updated;
  }

  addStoppingTrack(stationId: string, trackId: string): StationModel {
    const station = this.stations.get(stationId);
    if (!station) {
      throw new Error(`Station ${stationId} not found`);
    }

    const updated = station.addStoppingTrack(trackId);
    this.stations.set(stationId, updated);
    return updated;
  }

  removeStoppingTrack(stationId: string, trackId: string): StationModel {
    const station = this.stations.get(stationId);
    if (!station) {
      throw new Error(`Station ${stationId} not found`);
    }

    const updated = station.removeStoppingTrack(trackId);
    this.stations.set(stationId, updated);
    return updated;
  }

  addLandmarkEntrance(stationId: string, landmarkId: string): StationModel {
    const station = this.stations.get(stationId);
    if (!station) {
      throw new Error(`Station ${stationId} not found`);
    }

    const updated = station.addLandmarkEntrance(landmarkId);
    this.stations.set(stationId, updated);
    return updated;
  }

  removeLandmarkEntrance(stationId: string, landmarkId: string): StationModel {
    const station = this.stations.get(stationId);
    if (!station) {
      throw new Error(`Station ${stationId} not found`);
    }

    const updated = station.removeLandmarkEntrance(landmarkId);
    this.stations.set(stationId, updated);
    return updated;
  }

  // Validate that polygon is non-self-intersecting
  private isValidPolygon(polygon: Array<{ x: number; y: number }>): boolean {
    if (polygon.length < 3) {
      return false;
    }

    // Check for self-intersection using line segment intersection
    for (let i = 0; i < polygon.length; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % polygon.length];

      for (let j = i + 2; j < polygon.length; j++) {
        // Skip adjacent segments
        if (j === (i + polygon.length - 1) % polygon.length) {
          continue;
        }

        const p3 = polygon[j];
        const p4 = polygon[(j + 1) % polygon.length];

        if (this.segmentsIntersect(p1, p2, p3, p4)) {
          return false;
        }
      }
    }

    return true;
  }

  private segmentsIntersect(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number },
  ): boolean {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (Math.abs(denom) < 1e-10) {
      return false;
    }

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

    return ua > 0 && ua < 1 && ub > 0 && ub < 1;
  }

  findByName(name: string): StationModel | undefined {
    return Array.from(this.stations.values()).find((station) => station.name === name);
  }

  clear(): void {
    this.stations.clear();
  }

  count(): number {
    return this.stations.size;
  }
}
