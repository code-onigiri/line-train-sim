import { describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { RouteValidator } from '../../../../src/services/validation/RouteValidator';
import { RouteModel } from '../../../../src/models/Route';
import { StationModel } from '../../../../src/models/Station';
import { DepotModel } from '../../../../src/models/Depot';

describe('RouteValidator', () => {
  const validator = new RouteValidator();

  it('should validate a valid route with station start and end', () => {
    const station1 = new StationModel({
      name: 'Station A',
      areaPolygon: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    });
    const station2 = new StationModel({
      name: 'Station B',
      areaPolygon: [
        { x: 20, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 10 },
      ],
    });
    const stations = new Map([
      [station1.id, station1],
      [station2.id, station2],
    ]);
    const depots = new Map();

    const route = new RouteModel({
      name: 'Route 1',
      stops: [
        { entityId: station1.id, entityType: 'station' },
        { entityId: station2.id, entityType: 'station' },
      ],
    });

    const result = validator.validateRoute(route, stations, depots);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate a valid route with depot start and station end', () => {
    const depot = new DepotModel({
      name: 'Depot A',
      areaPolygon: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    });
    const station = new StationModel({
      name: 'Station B',
      areaPolygon: [
        { x: 20, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 10 },
      ],
    });
    const stations = new Map([[station.id, station]]);
    const depots = new Map([[depot.id, depot]]);

    const route = new RouteModel({
      name: 'Route 1',
      stops: [
        { entityId: depot.id, entityType: 'depot' },
        { entityId: station.id, entityType: 'station' },
      ],
    });

    const result = validator.validateRoute(route, stations, depots);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject route with depot as intermediate stop', () => {
    const station1 = new StationModel({
      name: 'Station A',
      areaPolygon: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    });
    const depot = new DepotModel({
      name: 'Depot',
      areaPolygon: [
        { x: 15, y: 0 },
        { x: 25, y: 0 },
        { x: 25, y: 10 },
      ],
    });
    const station2 = new StationModel({
      name: 'Station B',
      areaPolygon: [
        { x: 30, y: 0 },
        { x: 40, y: 0 },
        { x: 40, y: 10 },
      ],
    });

    const stations = new Map([
      [station1.id, station1],
      [station2.id, station2],
    ]);
    const depots = new Map([[depot.id, depot]]);

    const route = new RouteModel({
      name: 'Route 1',
      stops: [
        { entityId: station1.id, entityType: 'station' },
        { entityId: depot.id, entityType: 'depot' },
        { entityId: station2.id, entityType: 'station' },
      ],
    });

    const result = validator.validateRoute(route, stations, depots);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Intermediate stop'))).toBe(true);
  });

  it('should warn about loops when station appears multiple times', () => {
    const station1 = new StationModel({
      name: 'Station A',
      areaPolygon: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    });
    const station2 = new StationModel({
      name: 'Station B',
      areaPolygon: [
        { x: 20, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 10 },
      ],
    });
    const stations = new Map([
      [station1.id, station1],
      [station2.id, station2],
    ]);
    const depots = new Map();

    const route = new RouteModel({
      name: 'Route 1',
      stops: [
        { entityId: station1.id, entityType: 'station' },
        { entityId: station2.id, entityType: 'station' },
        { entityId: station1.id, entityType: 'station' }, // Loop back to station1
      ],
    });

    const result = validator.validateRoute(route, stations, depots);
    expect(result.warnings.some((w) => w.includes('loop'))).toBe(true);
  });

  it('should prevent execution when loop is detected', () => {
    const station1 = new StationModel({
      name: 'Station A',
      areaPolygon: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    });
    const station2 = new StationModel({
      name: 'Station B',
      areaPolygon: [
        { x: 20, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 10 },
      ],
    });
    const stations = new Map([
      [station1.id, station1],
      [station2.id, station2],
    ]);
    const depots = new Map();

    const route = new RouteModel({
      name: 'Route 1',
      stops: [
        { entityId: station1.id, entityType: 'station' },
        { entityId: station2.id, entityType: 'station' },
        { entityId: station1.id, entityType: 'station' }, // Loop
      ],
    });

    const canExecute = validator.canExecute(route, stations, depots);
    expect(canExecute).toBe(false);
  });

  it('should warn about consecutive duplicate stops', () => {
    const station1 = new StationModel({
      name: 'Station A',
      areaPolygon: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    });
    const station2 = new StationModel({
      name: 'Station B',
      areaPolygon: [
        { x: 20, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 10 },
      ],
    });
    const stations = new Map([
      [station1.id, station1],
      [station2.id, station2],
    ]);
    const depots = new Map();

    const route = new RouteModel({
      name: 'Route 1',
      stops: [
        { entityId: station1.id, entityType: 'station' },
        { entityId: station1.id, entityType: 'station' }, // Consecutive duplicate
        { entityId: station2.id, entityType: 'station' },
      ],
    });

    const result = validator.validateRoute(route, stations, depots);
    expect(result.warnings.some((w) => w.includes('duplicate'))).toBe(true);
  });

  it('should reject route with non-existent end station', () => {
    const station1 = new StationModel({
      name: 'Station A',
      areaPolygon: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    });
    const stations = new Map([[station1.id, station1]]);
    const depots = new Map();

    const fakeStationId = uuidv4();
    const route = new RouteModel({
      name: 'Route 1',
      stops: [
        { entityId: station1.id, entityType: 'station' },
        { entityId: fakeStationId, entityType: 'station' },
      ],
    });

    const result = validator.validateRoute(route, stations, depots);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('not found'))).toBe(true);
  });
});
