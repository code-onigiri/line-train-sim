import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { ConsistTemplateModel } from '../../../src/models/ConsistTemplate';

describe('ConsistTemplateModel', () => {
  it('should create a consist template with default values', () => {
    const vehicleTypeId = uuidv4();
    const consist = new ConsistTemplateModel({
      name: 'Test Consist',
      vehicleTypeId,
      carCount: 8,
      speedCategory: 'standard',
      totalLengthMeters: 200,
    });

    expect(consist.name).toBe('Test Consist');
    expect(consist.vehicleTypeId).toBe(vehicleTypeId);
    expect(consist.carCount).toBe(8);
    expect(consist.speedCategory).toBe('standard');
    expect(consist.totalLengthMeters).toBe(200);
    expect(consist.id).toBeDefined();
    expect(consist.createdAt).toBeGreaterThan(0);
    expect(consist.updatedAt).toBeGreaterThan(0);
  });

  it('should create a consist template with minimal data', () => {
    const vehicleTypeId = uuidv4();
    const consist = new ConsistTemplateModel({
      vehicleTypeId,
      totalLengthMeters: 25,
    });

    expect(consist.name).toBe('Untitled Consist');
    expect(consist.vehicleTypeId).toBe(vehicleTypeId);
    expect(consist.carCount).toBe(1);
    expect(consist.speedCategory).toBe('standard');
    expect(consist.totalLengthMeters).toBe(25);
  });

  it('should support slow speed category', () => {
    const consist = new ConsistTemplateModel({
      name: 'Slow Train',
      vehicleTypeId: uuidv4(),
      speedCategory: 'slow',
      carCount: 4,
      totalLengthMeters: 100,
    });

    expect(consist.speedCategory).toBe('slow');
  });

  it('should support fast speed category', () => {
    const consist = new ConsistTemplateModel({
      name: 'Express Train',
      vehicleTypeId: uuidv4(),
      speedCategory: 'fast',
      carCount: 12,
      totalLengthMeters: 300,
    });

    expect(consist.speedCategory).toBe('fast');
  });

  it('should update name immutably', () => {
    const original = new ConsistTemplateModel({
      name: 'Original',
      vehicleTypeId: uuidv4(),
      carCount: 6,
      totalLengthMeters: 150,
    });

    // Wait a bit to ensure timestamp difference
    const updated = original.updateName('Updated');

    expect(original.name).toBe('Original');
    expect(updated.name).toBe('Updated');
    expect(updated.id).toBe(original.id);
    expect(updated.updatedAt).toBeGreaterThanOrEqual(original.updatedAt);
  });

  it('should update vehicle type immutably', () => {
    const originalVehicleTypeId = uuidv4();
    const newVehicleTypeId = uuidv4();
    const original = new ConsistTemplateModel({
      name: 'Test',
      vehicleTypeId: originalVehicleTypeId,
      carCount: 6,
      totalLengthMeters: 150,
    });
    const updated = original.updateVehicleType(newVehicleTypeId);

    expect(original.vehicleTypeId).toBe(originalVehicleTypeId);
    expect(updated.vehicleTypeId).toBe(newVehicleTypeId);
    expect(updated.id).toBe(original.id);
  });

  it('should update car count immutably', () => {
    const original = new ConsistTemplateModel({
      name: 'Test',
      vehicleTypeId: uuidv4(),
      carCount: 6,
      totalLengthMeters: 150,
    });
    const updated = original.updateCarCount(10);

    expect(original.carCount).toBe(6);
    expect(updated.carCount).toBe(10);
    expect(updated.id).toBe(original.id);
  });

  it('should update speed category immutably', () => {
    const original = new ConsistTemplateModel({
      name: 'Test',
      vehicleTypeId: uuidv4(),
      carCount: 6,
      speedCategory: 'standard',
      totalLengthMeters: 150,
    });
    const updated = original.updateSpeedCategory('fast');

    expect(original.speedCategory).toBe('standard');
    expect(updated.speedCategory).toBe('fast');
    expect(updated.id).toBe(original.id);
  });

  it('should update total length immutably', () => {
    const original = new ConsistTemplateModel({
      name: 'Test',
      vehicleTypeId: uuidv4(),
      carCount: 6,
      totalLengthMeters: 150,
    });
    const updated = original.updateTotalLength(180);

    expect(original.totalLengthMeters).toBe(150);
    expect(updated.totalLengthMeters).toBe(180);
    expect(updated.id).toBe(original.id);
  });

  it('should serialize to JSON', () => {
    const vehicleTypeId = uuidv4();
    const consist = new ConsistTemplateModel({
      name: 'Test Consist',
      vehicleTypeId,
      carCount: 8,
      speedCategory: 'fast',
      totalLengthMeters: 200,
    });
    const json = consist.toJSON();

    expect(json.id).toBe(consist.id);
    expect(json.name).toBe('Test Consist');
    expect(json.vehicleTypeId).toBe(vehicleTypeId);
    expect(json.carCount).toBe(8);
    expect(json.speedCategory).toBe('fast');
    expect(json.totalLengthMeters).toBe(200);
  });

  it('should deserialize from JSON', () => {
    const json = {
      id: uuidv4(),
      name: 'Deserialized',
      vehicleTypeId: uuidv4(),
      carCount: 5,
      speedCategory: 'slow' as const,
      totalLengthMeters: 125,
      createdAt: Date.now() - 1000,
      updatedAt: Date.now(),
    };
    const consist = ConsistTemplateModel.fromJSON(json);

    expect(consist.id).toBe(json.id);
    expect(consist.name).toBe(json.name);
    expect(consist.vehicleTypeId).toBe(json.vehicleTypeId);
    expect(consist.carCount).toBe(json.carCount);
    expect(consist.speedCategory).toBe(json.speedCategory);
    expect(consist.totalLengthMeters).toBe(json.totalLengthMeters);
  });

  it('should require positive car count', () => {
    expect(() => {
      new ConsistTemplateModel({
        name: 'Invalid',
        vehicleTypeId: uuidv4(),
        carCount: 0,
        totalLengthMeters: 100,
      });
    }).toThrow();
  });

  it('should require positive total length', () => {
    expect(() => {
      new ConsistTemplateModel({
        name: 'Invalid',
        vehicleTypeId: uuidv4(),
        carCount: 5,
        totalLengthMeters: -50,
      });
    }).toThrow();
  });

  it('should validate speed category', () => {
    expect(() => {
      new ConsistTemplateModel({
        name: 'Invalid',
        vehicleTypeId: uuidv4(),
        carCount: 5,
        // biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
        speedCategory: 'turbo' as any,
        totalLengthMeters: 100,
      });
    }).toThrow();
  });
});
