import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { LandmarkModel } from '../../../src/models/Landmark';

describe('LandmarkModel', () => {
  it('should create a landmark with default values', () => {
    const landmark = new LandmarkModel({ x: 100, y: 200 });

    expect(landmark.x).toBe(100);
    expect(landmark.y).toBe(200);
    expect(landmark.elevationMeters).toBe(0);
    expect(landmark.connections).toEqual([]);
  });

  it('should create a landmark with custom elevation', () => {
    const landmark = new LandmarkModel({ x: 100, y: 200, elevationMeters: 10 });

    expect(landmark.elevationMeters).toBe(10);
  });

  it('should update position immutably', () => {
    const original = new LandmarkModel({ x: 100, y: 200 });
    const updated = original.updatePosition(150, 250);

    expect(original.x).toBe(100);
    expect(original.y).toBe(200);
    expect(updated.x).toBe(150);
    expect(updated.y).toBe(250);
    expect(updated.id).toBe(original.id);
  });

  it('should update elevation immutably', () => {
    const original = new LandmarkModel({ x: 100, y: 200, elevationMeters: 0 });
    const updated = original.updateElevation(10);

    expect(original.elevationMeters).toBe(0);
    expect(updated.elevationMeters).toBe(10);
  });

  it('should add connection', () => {
    const landmark = new LandmarkModel({ x: 100, y: 200 });
    const trackId = uuidv4();
    const updated = landmark.addConnection(trackId);

    expect(updated.connections).toEqual([trackId]);
  });

  it('should not add duplicate connection', () => {
    const landmark = new LandmarkModel({ x: 100, y: 200 });
    const trackId = uuidv4();
    const updated1 = landmark.addConnection(trackId);
    const updated2 = updated1.addConnection(trackId);

    expect(updated2.connections).toEqual([trackId]);
  });

  it('should remove connection', () => {
    const landmark = new LandmarkModel({ x: 100, y: 200 });
    const trackId1 = uuidv4();
    const trackId2 = uuidv4();
    const updated1 = landmark.addConnection(trackId1);
    const updated2 = updated1.addConnection(trackId2);
    const updated3 = updated2.removeConnection(trackId1);

    expect(updated3.connections).toEqual([trackId2]);
  });

  it('should serialize to JSON', () => {
    const landmark = new LandmarkModel({ x: 100, y: 200, elevationMeters: 5 });
    const json = landmark.toJSON();

    expect(json.x).toBe(100);
    expect(json.y).toBe(200);
    expect(json.elevationMeters).toBe(5);
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('createdAt');
    expect(json).toHaveProperty('updatedAt');
  });

  it('should deserialize from JSON', () => {
    const original = new LandmarkModel({ x: 100, y: 200, elevationMeters: 5 });
    const json = original.toJSON();
    const restored = LandmarkModel.fromJSON(json);

    expect(restored.x).toBe(original.x);
    expect(restored.y).toBe(original.y);
    expect(restored.elevationMeters).toBe(original.elevationMeters);
    expect(restored.id).toBe(original.id);
  });
});
