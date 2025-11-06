import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConsistTemplateModel } from '../../../../src/models/ConsistTemplate';
import { RouteModel } from '../../../../src/models/Route';
import { VehicleTypeModel } from '../../../../src/models/VehicleType';
import { DiagramValidator } from '../../../../src/services/validation/DiagramValidator';

describe('DiagramValidator', () => {
  let validator: DiagramValidator;
  let vehicleTypes: Map<string, VehicleTypeModel>;
  let vehicleTypeId1: string;
  let vehicleTypeId2: string;

  beforeEach(() => {
    validator = new DiagramValidator();
    vehicleTypes = new Map();

    vehicleTypeId1 = uuidv4();
    vehicleTypes.set(
      vehicleTypeId1,
      new VehicleTypeModel({
        id: vehicleTypeId1,
        name: 'Standard Coach',
        lengthMeters: 25,
        speedCategory: 'standard',
      }),
    );

    vehicleTypeId2 = uuidv4();
    vehicleTypes.set(
      vehicleTypeId2,
      new VehicleTypeModel({
        id: vehicleTypeId2,
        name: 'Express Coach',
        lengthMeters: 25,
        speedCategory: 'fast',
      }),
    );
  });

  describe('validateDiagram', () => {
    it('should validate a complete diagram', () => {
      const route = new RouteModel({
        name: 'Test Route',
        stops: [
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
        ],
      });

      const consistTemplates = [
        new ConsistTemplateModel({
          name: 'Consist 1',
          vehicleTypeId: vehicleTypeId1,
          carCount: 8,
          speedCategory: 'standard',
          totalLengthMeters: 200,
        }),
      ];

      const result = validator.validateDiagram(route, consistTemplates, vehicleTypes);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject route with less than 2 stops', () => {
      // Create a valid route first, then test the validator logic
      const route = new RouteModel({
        name: 'Test Route',
        stops: [
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
        ],
      });

      // Manually modify stops to simulate validation scenario
      // Note: This tests the validator's logic even though RouteModel prevents this at construction
      const routeWithFewStops = {
        ...route,
        stops: [{ entityId: uuidv4(), entityType: 'station' as const }],
      } as unknown as RouteModel;

      const consistTemplates: ConsistTemplateModel[] = [];

      const result = validator.validateDiagram(routeWithFewStops, consistTemplates, vehicleTypes);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Route must have at least 2 stops');
    });

    it('should detect loop in route', () => {
      const stationId = uuidv4();
      const route = new RouteModel({
        name: 'Loop Route',
        stops: [
          { entityId: stationId, entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: stationId, entityType: 'station' },
        ],
      });

      const consistTemplates: ConsistTemplateModel[] = [];

      const result = validator.validateDiagram(route, consistTemplates, vehicleTypes);

      expect(result.warnings.some((w) => w.includes('loop'))).toBe(true);
      expect(result.warnings.some((w) => w.includes(stationId))).toBe(true);
    });

    it('should warn about empty consist templates', () => {
      const route = new RouteModel({
        name: 'Test Route',
        stops: [
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
        ],
      });

      const consistTemplates: ConsistTemplateModel[] = [];

      const result = validator.validateDiagram(route, consistTemplates, vehicleTypes);

      expect(result.warnings.some((w) => w.includes('No consist templates'))).toBe(true);
    });

    it('should reject consist template with invalid vehicle type', () => {
      const route = new RouteModel({
        name: 'Test Route',
        stops: [
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
        ],
      });

      const invalidVehicleTypeId = uuidv4();
      const consistTemplates = [
        new ConsistTemplateModel({
          name: 'Invalid Consist',
          vehicleTypeId: invalidVehicleTypeId,
          carCount: 8,
          speedCategory: 'standard',
          totalLengthMeters: 200,
        }),
      ];

      const result = validator.validateDiagram(route, consistTemplates, vehicleTypes);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('non-existent vehicle type'))).toBe(true);
    });

    it('should validate multiple consist templates', () => {
      const route = new RouteModel({
        name: 'Test Route',
        stops: [
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
        ],
      });

      const consistTemplates = [
        new ConsistTemplateModel({
          name: 'Consist 1',
          vehicleTypeId: vehicleTypeId1,
          carCount: 8,
          speedCategory: 'standard',
          totalLengthMeters: 200,
        }),
        new ConsistTemplateModel({
          name: 'Consist 2',
          vehicleTypeId: vehicleTypeId2,
          carCount: 10,
          speedCategory: 'fast',
          totalLengthMeters: 250,
        }),
      ];

      const result = validator.validateDiagram(route, consistTemplates, vehicleTypes);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('canProceedToExecution', () => {
    it('should allow execution with valid diagram', () => {
      const route = new RouteModel({
        name: 'Test Route',
        stops: [
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
        ],
      });

      const consistTemplates = [
        new ConsistTemplateModel({
          name: 'Consist 1',
          vehicleTypeId: vehicleTypeId1,
          carCount: 8,
          speedCategory: 'standard',
          totalLengthMeters: 200,
        }),
      ];

      const canProceed = validator.canProceedToExecution(route, consistTemplates, vehicleTypes);

      expect(canProceed).toBe(true);
    });

    it('should prevent execution with loop in route', () => {
      const stationId = uuidv4();
      const route = new RouteModel({
        name: 'Loop Route',
        stops: [
          { entityId: stationId, entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: stationId, entityType: 'station' },
        ],
      });

      const consistTemplates = [
        new ConsistTemplateModel({
          name: 'Consist 1',
          vehicleTypeId: vehicleTypeId1,
          carCount: 8,
          speedCategory: 'standard',
          totalLengthMeters: 200,
        }),
      ];

      const canProceed = validator.canProceedToExecution(route, consistTemplates, vehicleTypes);

      expect(canProceed).toBe(false);
    });

    it('should prevent execution with validation errors', () => {
      const route = new RouteModel({
        name: 'Test Route',
        stops: [
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
        ],
      });

      // Create route mock with fewer stops for testing
      const routeWithFewStops = {
        ...route,
        stops: [{ entityId: uuidv4(), entityType: 'station' as const }],
      } as unknown as RouteModel;

      const consistTemplates: ConsistTemplateModel[] = [];

      const canProceed = validator.canProceedToExecution(
        routeWithFewStops,
        consistTemplates,
        vehicleTypes,
      );

      expect(canProceed).toBe(false);
    });
  });

  describe('getExecutionPreventionReasons', () => {
    it('should return empty array for valid diagram', () => {
      const route = new RouteModel({
        name: 'Test Route',
        stops: [
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
        ],
      });

      const consistTemplates = [
        new ConsistTemplateModel({
          name: 'Consist 1',
          vehicleTypeId: vehicleTypeId1,
          carCount: 8,
          speedCategory: 'standard',
          totalLengthMeters: 200,
        }),
      ];

      const reasons = validator.getExecutionPreventionReasons(
        route,
        consistTemplates,
        vehicleTypes,
      );

      expect(reasons).toHaveLength(0);
    });

    it('should return reasons for diagram with loop', () => {
      const stationId = uuidv4();
      const route = new RouteModel({
        name: 'Loop Route',
        stops: [
          { entityId: stationId, entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: stationId, entityType: 'station' },
        ],
      });

      const consistTemplates = [
        new ConsistTemplateModel({
          name: 'Consist 1',
          vehicleTypeId: vehicleTypeId1,
          carCount: 8,
          speedCategory: 'standard',
          totalLengthMeters: 200,
        }),
      ];

      const reasons = validator.getExecutionPreventionReasons(
        route,
        consistTemplates,
        vehicleTypes,
      );

      expect(reasons.length).toBeGreaterThan(0);
      expect(reasons.some((r) => r.includes('loop'))).toBe(true);
    });

    it('should return multiple reasons for invalid diagram', () => {
      const route = new RouteModel({
        name: 'Test Route',
        stops: [
          { entityId: uuidv4(), entityType: 'station' },
          { entityId: uuidv4(), entityType: 'station' },
        ],
      });

      // Create route mock with fewer stops for testing
      const routeWithFewStops = {
        ...route,
        stops: [{ entityId: uuidv4(), entityType: 'station' as const }],
      } as unknown as RouteModel;

      const consistTemplates = [
        new ConsistTemplateModel({
          name: 'Invalid Consist',
          vehicleTypeId: uuidv4(),
          carCount: 8,
          speedCategory: 'standard',
          totalLengthMeters: 200,
        }),
      ];

      const reasons = validator.getExecutionPreventionReasons(
        routeWithFewStops,
        consistTemplates,
        vehicleTypes,
      );

      expect(reasons.length).toBeGreaterThan(0);
    });
  });
});
