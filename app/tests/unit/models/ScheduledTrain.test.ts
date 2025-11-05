import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { ScheduledTrainModel } from '../../../src/models/ScheduledTrain';

describe('ScheduledTrainModel', () => {
  it('should create a scheduled train with default values', () => {
    const train = new ScheduledTrainModel({
      routeId: uuidv4(),
      consistId: uuidv4(),
    });

    expect(typeof train.routeId).toBe('string');
    expect(typeof train.consistId).toBe('string');
    expect(train.departureTime).toBe(0);
    expect(train.dwellAssignments).toEqual([]);
    expect(typeof train.seed).toBe('number');
  });

  it('should create a scheduled train with custom values', () => {
    const train = new ScheduledTrainModel({
      routeId: uuidv4(),
      consistId: uuidv4(),
      departureTime: 1000,
      seed: 12345,
    });

    expect(train.departureTime).toBe(1000);
    expect(train.seed).toBe(12345);
  });

  it('should update departure time immutably', () => {
    const original = new ScheduledTrainModel({
      routeId: uuidv4(),
      consistId: uuidv4(),
    });
    const updated = original.updateDepartureTime(500);

    expect(original.departureTime).toBe(0);
    expect(updated.departureTime).toBe(500);
    expect(updated.id).toBe(original.id);
  });

  it('should add dwell assignments', () => {
    const stopId = uuidv4();
    const trackId = uuidv4();
    const train = new ScheduledTrainModel({
      routeId: uuidv4(),
      consistId: uuidv4(),
    });
    const updated = train.addDwellAssignment(stopId, trackId, 100, 200);

    expect(updated.dwellAssignments).toHaveLength(1);
    expect(updated.dwellAssignments[0]).toEqual({
      stopId,
      trackId,
      arrivalTime: 100,
      departureTime: 200,
    });
  });

  it('should update dwell assignments', () => {
    const train = new ScheduledTrainModel({
      routeId: uuidv4(),
      consistId: uuidv4(),
    });
    const assignments = [
      { stopId: uuidv4(), trackId: uuidv4(), arrivalTime: 100, departureTime: 200 },
      { stopId: uuidv4(), trackId: uuidv4(), arrivalTime: 300, departureTime: 400 },
    ];
    const updated = train.updateDwellAssignments(assignments);

    expect(updated.dwellAssignments).toHaveLength(2);
    expect(updated.dwellAssignments[0].stopId).toBe(assignments[0].stopId);
    expect(updated.dwellAssignments[1].stopId).toBe(assignments[1].stopId);
  });

  it('should serialize to JSON', () => {
    const routeId = uuidv4();
    const consistId = uuidv4();
    const train = new ScheduledTrainModel({
      routeId,
      consistId,
    });
    const json = train.toJSON();

    expect(json.routeId).toBe(routeId);
    expect(json.consistId).toBe(consistId);
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('createdAt');
    expect(json).toHaveProperty('updatedAt');
  });

  it('should deserialize from JSON', () => {
    const original = new ScheduledTrainModel({
      routeId: uuidv4(),
      consistId: uuidv4(),
      seed: 12345,
    });
    const json = original.toJSON();
    const restored = ScheduledTrainModel.fromJSON(json);

    expect(restored.routeId).toBe(original.routeId);
    expect(restored.consistId).toBe(original.consistId);
    expect(restored.seed).toBe(original.seed);
    expect(restored.id).toBe(original.id);
  });
});
