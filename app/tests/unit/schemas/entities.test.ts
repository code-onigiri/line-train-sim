import { describe, expect, it } from 'vitest';
import {
  DepotSchema,
  LandmarkSchema,
  RouteSchema,
  StationSchema,
  TrackSegmentSchema,
  VehicleTypeSchema,
  validateLandmark,
  validateTrackSegment,
} from '../../../src/schemas/entities';

describe('Entity Schemas', () => {
  describe('LandmarkSchema', () => {
    it('should validate a valid landmark', () => {
      const validLandmark = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        x: 100,
        y: 200,
        elevation: 5.5,
        connections: ['123e4567-e89b-12d3-a456-426614174001'],
        metadata: { source: 'user' },
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      expect(() => LandmarkSchema.parse(validLandmark)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const invalidLandmark = {
        id: 'not-a-uuid',
        x: 100,
        y: 200,
        elevation: 0,
        connections: [],
        metadata: {},
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      expect(() => LandmarkSchema.parse(invalidLandmark)).toThrow();
    });

    it('should reject negative timestamp', () => {
      const invalidLandmark = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        x: 100,
        y: 200,
        elevation: 0,
        connections: [],
        metadata: {},
        createdAt: -1,
        updatedAt: 1234567890,
      };

      expect(() => LandmarkSchema.parse(invalidLandmark)).toThrow();
    });
  });

  describe('TrackSegmentSchema', () => {
    it('should validate a valid track segment', () => {
      const validTrack = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        startLandmarkId: '123e4567-e89b-12d3-a456-426614174001',
        endLandmarkId: '123e4567-e89b-12d3-a456-426614174002',
        classification: 'mainline' as const,
        isBidirectional: true,
        permissibleSpeedKph: 120,
        elevation: 0,
        addons: [],
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      expect(() => TrackSegmentSchema.parse(validTrack)).not.toThrow();
    });

    it('should reject invalid classification', () => {
      const invalidTrack = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        startLandmarkId: '123e4567-e89b-12d3-a456-426614174001',
        endLandmarkId: '123e4567-e89b-12d3-a456-426614174002',
        classification: 'invalid',
        isBidirectional: true,
        permissibleSpeedKph: 120,
        elevation: 0,
        addons: [],
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      expect(() => TrackSegmentSchema.parse(invalidTrack)).toThrow();
    });

    it('should reject negative speed', () => {
      const invalidTrack = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        startLandmarkId: '123e4567-e89b-12d3-a456-426614174001',
        endLandmarkId: '123e4567-e89b-12d3-a456-426614174002',
        classification: 'mainline' as const,
        isBidirectional: true,
        permissibleSpeedKph: -10,
        elevation: 0,
        addons: [],
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      expect(() => TrackSegmentSchema.parse(invalidTrack)).toThrow();
    });
  });

  describe('StationSchema', () => {
    it('should validate a valid station', () => {
      const validStation = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Central Station',
        areaPolygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
        platforms: ['123e4567-e89b-12d3-a456-426614174001'],
        stoppingTracks: ['123e4567-e89b-12d3-a456-426614174002'],
        landmarkEntrances: ['123e4567-e89b-12d3-a456-426614174003'],
        diagramOrderIndex: 0,
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      expect(() => StationSchema.parse(validStation)).not.toThrow();
    });

    it('should reject polygon with less than 3 points', () => {
      const invalidStation = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Central Station',
        areaPolygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
        platforms: [],
        stoppingTracks: [],
        landmarkEntrances: [],
        diagramOrderIndex: 0,
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      expect(() => StationSchema.parse(invalidStation)).toThrow();
    });

    it('should reject empty name', () => {
      const invalidStation = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '',
        areaPolygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
        platforms: [],
        stoppingTracks: [],
        landmarkEntrances: [],
        diagramOrderIndex: 0,
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      expect(() => StationSchema.parse(invalidStation)).toThrow();
    });
  });

  describe('VehicleTypeSchema', () => {
    it('should validate a valid vehicle type', () => {
      const validVehicle = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Express Train',
        speedCategory: 'fast' as const,
        maxSpeedKph: 200,
        capacity: 300,
        lengthMeters: 200,
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      expect(() => VehicleTypeSchema.parse(validVehicle)).not.toThrow();
    });

    it('should reject invalid speed category', () => {
      const invalidVehicle = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Express Train',
        speedCategory: 'super-fast',
        maxSpeedKph: 200,
        capacity: 300,
        lengthMeters: 200,
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      expect(() => VehicleTypeSchema.parse(invalidVehicle)).toThrow();
    });
  });

  describe('Validation helpers', () => {
    it('should use validateLandmark helper', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        x: 100,
        y: 200,
        elevation: 0,
        connections: [],
        metadata: {},
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      const result = validateLandmark(validData);
      expect(result).toEqual(validData);
    });

    it('should throw on invalid data', () => {
      const invalidData = { id: 'not-a-uuid' };
      expect(() => validateLandmark(invalidData)).toThrow();
    });
  });
});
