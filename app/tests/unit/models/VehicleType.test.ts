import { describe, expect, it } from 'vitest';
import { VehicleTypeModel } from '../../../src/models/VehicleType';

describe('VehicleTypeModel', () => {
  it('should create a vehicle type with default values', () => {
    const vehicle = new VehicleTypeModel({ name: 'Express Train' });

    expect(vehicle.name).toBe('Express Train');
    expect(vehicle.speedCategory).toBe('standard');
    expect(vehicle.maxSpeedKph).toBe(100);
    expect(vehicle.capacity).toBe(100);
    expect(vehicle.lengthMeters).toBe(20);
  });

  it('should create a vehicle type with custom values', () => {
    const vehicle = new VehicleTypeModel({
      name: 'High Speed',
      speedCategory: 'fast',
      maxSpeedKph: 200,
      capacity: 300,
      lengthMeters: 250,
    });

    expect(vehicle.name).toBe('High Speed');
    expect(vehicle.speedCategory).toBe('fast');
    expect(vehicle.maxSpeedKph).toBe(200);
    expect(vehicle.capacity).toBe(300);
    expect(vehicle.lengthMeters).toBe(250);
  });

  it('should update name immutably', () => {
    const original = new VehicleTypeModel({ name: 'Original' });
    const updated = original.updateName('Updated');

    expect(original.name).toBe('Original');
    expect(updated.name).toBe('Updated');
    expect(updated.id).toBe(original.id);
  });

  it('should update speed category', () => {
    const original = new VehicleTypeModel({ name: 'Test' });
    const updated = original.updateSpeedCategory('fast');

    expect(original.speedCategory).toBe('standard');
    expect(updated.speedCategory).toBe('fast');
  });

  it('should update max speed', () => {
    const original = new VehicleTypeModel({ name: 'Test' });
    const updated = original.updateMaxSpeed(150);

    expect(original.maxSpeedKph).toBe(100);
    expect(updated.maxSpeedKph).toBe(150);
  });

  it('should update capacity', () => {
    const original = new VehicleTypeModel({ name: 'Test' });
    const updated = original.updateCapacity(200);

    expect(original.capacity).toBe(100);
    expect(updated.capacity).toBe(200);
  });

  it('should update length', () => {
    const original = new VehicleTypeModel({ name: 'Test' });
    const updated = original.updateLength(30);

    expect(original.lengthMeters).toBe(20);
    expect(updated.lengthMeters).toBe(30);
  });

  it('should serialize to JSON', () => {
    const vehicle = new VehicleTypeModel({ name: 'Test Vehicle' });
    const json = vehicle.toJSON();

    expect(json.name).toBe('Test Vehicle');
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('createdAt');
    expect(json).toHaveProperty('updatedAt');
  });

  it('should deserialize from JSON', () => {
    const original = new VehicleTypeModel({ name: 'Test Vehicle' });
    const json = original.toJSON();
    const restored = VehicleTypeModel.fromJSON(json);

    expect(restored.name).toBe(original.name);
    expect(restored.id).toBe(original.id);
    expect(restored.speedCategory).toBe(original.speedCategory);
  });
});
