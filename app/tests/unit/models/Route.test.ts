import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { RouteModel } from '../../../src/models/Route';

describe('RouteModel', () => {
  it('should create a route with minimum stops', () => {
    const route = new RouteModel({
      name: 'Test Route',
      stops: [
        { entityId: uuidv4(), entityType: 'station' },
        { entityId: uuidv4(), entityType: 'station' },
      ],
    });

    expect(route.name).toBe('Test Route');
    expect(route.stops).toHaveLength(2);
    expect(route.consistTemplates).toEqual([]);
    expect(route.timeScale).toBe(1.0);
  });

  it('should create a route with custom values', () => {
    const route = new RouteModel({
      name: 'Express Line',
      stops: [
        { entityId: uuidv4(), entityType: 'station' },
        { entityId: uuidv4(), entityType: 'station' },
      ],
      timeScale: 2.0,
    });

    expect(route.name).toBe('Express Line');
    expect(route.stops).toHaveLength(2);
    expect(route.timeScale).toBe(2.0);
  });

  it('should update name immutably', () => {
    const original = new RouteModel({
      name: 'Original',
      stops: [
        { entityId: uuidv4(), entityType: 'station' },
        { entityId: uuidv4(), entityType: 'station' },
      ],
    });
    const updated = original.updateName('Updated');

    expect(original.name).toBe('Original');
    expect(updated.name).toBe('Updated');
    expect(updated.id).toBe(original.id);
  });

  it('should add stops', () => {
    const route = new RouteModel({
      name: 'Test Route',
      stops: [
        { entityId: uuidv4(), entityType: 'station' },
        { entityId: uuidv4(), entityType: 'station' },
      ],
    });
    const station3Id = uuidv4();
    const updated = route.addStop(station3Id, 'station');

    expect(updated.stops).toHaveLength(3);
    expect(updated.stops[2]).toEqual({ entityId: station3Id, entityType: 'station' });
  });

  it('should remove stops by index', () => {
    const station1Id = uuidv4();
    const station2Id = uuidv4();
    const station3Id = uuidv4();
    const route = new RouteModel({
      name: 'Test Route',
      stops: [
        { entityId: station1Id, entityType: 'station' },
        { entityId: station2Id, entityType: 'station' },
        { entityId: station3Id, entityType: 'station' },
      ],
    });
    const updated = route.removeStop(0);

    expect(updated.stops).toHaveLength(2);
    expect(updated.stops[0].entityId).toBe(station2Id);
    expect(updated.stops[1].entityId).toBe(station3Id);
  });

  it('should update time scale', () => {
    const original = new RouteModel({
      name: 'Test Route',
      stops: [
        { entityId: uuidv4(), entityType: 'station' },
        { entityId: uuidv4(), entityType: 'station' },
      ],
    });
    const updated = original.updateTimeScale(0.5);

    expect(original.timeScale).toBe(1.0);
    expect(updated.timeScale).toBe(0.5);
  });

  it('should add consist templates', () => {
    const route = new RouteModel({
      name: 'Test Route',
      stops: [
        { entityId: uuidv4(), entityType: 'station' },
        { entityId: uuidv4(), entityType: 'station' },
      ],
    });
    const consistId = uuidv4();
    const updated = route.addConsistTemplate(consistId);

    expect(updated.consistTemplates).toContain(consistId);
  });

  it('should not add duplicate consist templates', () => {
    const route = new RouteModel({
      name: 'Test Route',
      stops: [
        { entityId: uuidv4(), entityType: 'station' },
        { entityId: uuidv4(), entityType: 'station' },
      ],
    });
    const consistId = uuidv4();
    const updated1 = route.addConsistTemplate(consistId);
    const updated2 = updated1.addConsistTemplate(consistId);

    expect(updated2.consistTemplates).toHaveLength(1);
  });

  it('should serialize to JSON', () => {
    const route = new RouteModel({
      name: 'Test Route',
      stops: [
        { entityId: uuidv4(), entityType: 'station' },
        { entityId: uuidv4(), entityType: 'station' },
      ],
    });
    const json = route.toJSON();

    expect(json.name).toBe('Test Route');
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('createdAt');
    expect(json).toHaveProperty('updatedAt');
  });

  it('should deserialize from JSON', () => {
    const original = new RouteModel({
      name: 'Test Route',
      stops: [
        { entityId: uuidv4(), entityType: 'station' },
        { entityId: uuidv4(), entityType: 'station' },
      ],
    });
    const json = original.toJSON();
    const restored = RouteModel.fromJSON(json);

    expect(restored.name).toBe(original.name);
    expect(restored.id).toBe(original.id);
  });
});
