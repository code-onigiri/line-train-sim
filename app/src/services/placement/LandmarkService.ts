import { LandmarkModel } from '../../models/Landmark';
import type { Landmark } from '../../schemas/entities';

export class LandmarkService {
  private landmarks: Map<string, LandmarkModel> = new Map();

  create(
    x: number,
    y: number,
    elevationMeters = 0,
    metadata: Record<string, unknown> = {},
  ): LandmarkModel {
    const landmark = new LandmarkModel({ x, y, elevationMeters, metadata });
    this.landmarks.set(landmark.id, landmark);
    return landmark;
  }

  get(id: string): LandmarkModel | undefined {
    return this.landmarks.get(id);
  }

  getAll(): LandmarkModel[] {
    return Array.from(this.landmarks.values());
  }

  update(id: string, updates: Partial<Landmark>): LandmarkModel | undefined {
    const existing = this.landmarks.get(id);
    if (!existing) {
      return undefined;
    }

    let updated = existing;
    if (updates.x !== undefined || updates.y !== undefined) {
      updated = updated.updatePosition(updates.x ?? existing.x, updates.y ?? existing.y);
    }
    if (updates.elevationMeters !== undefined) {
      updated = updated.updateElevation(updates.elevationMeters);
    }
    if (updates.metadata) {
      updated = updated.updateMetadata(updates.metadata);
    }

    this.landmarks.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    const landmark = this.landmarks.get(id);
    if (!landmark) {
      return false;
    }

    // Check if landmark has connections - return false instead of throwing
    if (landmark.connections.length > 0) {
      return false;
    }

    return this.landmarks.delete(id);
  }

  /**
   * Check if a landmark can be safely deleted
   * @param id - Landmark ID
   * @returns true if landmark can be deleted, false otherwise
   */
  canDelete(id: string): boolean {
    const landmark = this.landmarks.get(id);
    if (!landmark) {
      return false;
    }
    return landmark.connections.length === 0;
  }

  addConnection(landmarkId: string, trackSegmentId: string): LandmarkModel {
    const landmark = this.landmarks.get(landmarkId);
    if (!landmark) {
      throw new Error(`Landmark ${landmarkId} not found`);
    }

    const updated = landmark.addConnection(trackSegmentId);
    this.landmarks.set(landmarkId, updated);
    return updated;
  }

  removeConnection(landmarkId: string, trackSegmentId: string): LandmarkModel {
    const landmark = this.landmarks.get(landmarkId);
    if (!landmark) {
      throw new Error(`Landmark ${landmarkId} not found`);
    }

    const updated = landmark.removeConnection(trackSegmentId);
    this.landmarks.set(landmarkId, updated);
    return updated;
  }

  findByPosition(x: number, y: number, tolerance = 5): LandmarkModel | undefined {
    for (const landmark of this.landmarks.values()) {
      const dx = landmark.x - x;
      const dy = landmark.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= tolerance) {
        return landmark;
      }
    }
    return undefined;
  }

  findInArea(minX: number, minY: number, maxX: number, maxY: number): LandmarkModel[] {
    return Array.from(this.landmarks.values()).filter(
      (landmark) =>
        landmark.x >= minX && landmark.x <= maxX && landmark.y >= minY && landmark.y <= maxY,
    );
  }

  clear(): void {
    this.landmarks.clear();
  }

  count(): number {
    return this.landmarks.size;
  }
}
