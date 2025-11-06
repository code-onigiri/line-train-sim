import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { RouteService } from '../../../../src/services/diagram/RouteService';

describe('RouteService', () => {
  let service: RouteService;
  let stationId1: string;
  let stationId2: string;
  let _stationId3: string;
  let depotId1: string;
  let consistId1: string;

  beforeEach(() => {
    service = new RouteService();
    stationId1 = uuidv4();
    stationId2 = uuidv4();
    _stationId3 = uuidv4();
    depotId1 = uuidv4();
    consistId1 = uuidv4();
  });

  describe('create', () => {
    it('should create a route with valid parameters', () => {
      const route = service.create(
        'Test Route',
        [
          { entityId: stationId1, entityType: 'station' },
          { entityId: stationId2, entityType: 'station' },
        ],
        { horizontalAxis: 'time', verticalAxis: 'stations' },
        [consistId1],
        1.0,
      );

      expect(route.name).toBe('Test Route');
      expect(route.stops).toHaveLength(2);
      expect(route.timeScale).toBe(1.0);
    });
  });

  describe('validateRoute', () => {
    it('should validate a route with at least 2 stops', () => {
      const route = service.create(
        'Test Route',
        [
          { entityId: stationId1, entityType: 'station' },
          { entityId: stationId2, entityType: 'station' },
        ],
        {},
        [],
      );

      const validation = service.validateRoute(route);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation if intermediate stop is a depot', () => {
      const route = service.create(
        'Test Route',
        [
          { entityId: stationId1, entityType: 'station' },
          { entityId: depotId1, entityType: 'depot' },
          { entityId: stationId2, entityType: 'station' },
        ],
        {},
        [],
      );

      const validation = service.validateRoute(route);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('Intermediate'))).toBe(true);
    });
  });

  describe('detectLoop', () => {
    it('should detect loop when route returns to same station', () => {
      const route = service.create(
        'Test Route',
        [
          { entityId: stationId1, entityType: 'station' },
          { entityId: stationId2, entityType: 'station' },
          { entityId: stationId1, entityType: 'station' },
        ],
        {},
        [],
      );

      const loopCheck = service.detectLoop(route);
      expect(loopCheck.hasLoop).toBe(true);
      expect(loopCheck.loopingStationId).toBe(stationId1);
    });
  });
});
