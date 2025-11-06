import { describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { CapacityValidator } from '../../../../src/services/validation/CapacityValidator';
import type { DwellAssignment } from '../../../../src/models/ExecutionComponents';
import type { StoppingTrack } from '../../../../src/models/StationComponents';

describe('CapacityValidator', () => {
  const validator = new CapacityValidator();

  describe('validateStoppingTrackCapacity', () => {
    it('should pass validation when track capacity is sufficient', () => {
      const trackId = uuidv4();
      const track: StoppingTrack = {
        id: trackId,
        trackId,
        platformId: uuidv4(),
        capacity: 5,
      };

      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: uuidv4(),
          trackId,
          arrivalTime: 100,
          departureTime: 200,
        },
      ];

      const conflicts = validator.validateStoppingTrackCapacity([track], dwells);
      expect(conflicts).toEqual([]);
    });

    it('should detect conflict when train exceeds track capacity', () => {
      const trackId = uuidv4();
      const track: StoppingTrack = {
        id: trackId,
        trackId,
        platformId: uuidv4(),
        capacity: 3,
      };

      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: uuidv4(),
          trackId,
          arrivalTime: 100,
          departureTime: 200,
          trainLength: 4, // Exceeds capacity of 3
        },
      ];

      const conflicts = validator.validateStoppingTrackCapacity([track], dwells);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('CAPACITY_EXCEEDED');
      expect(conflicts[0].locationId).toBe(trackId);
    });

    it('should allow trains up to exact capacity', () => {
      const trackId = uuidv4();
      const track: StoppingTrack = {
        id: trackId,
        trackId,
        platformId: uuidv4(),
        capacity: 3,
      };

      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: uuidv4(),
          trackId,
          arrivalTime: 100,
          departureTime: 200,
          trainLength: 3,
        },
      ];

      const conflicts = validator.validateStoppingTrackCapacity([track], dwells);
      expect(conflicts).toEqual([]);
    });

    it('should validate multiple tracks independently', () => {
      const track1Id = uuidv4();
      const track2Id = uuidv4();
      
      const tracks: StoppingTrack[] = [
        {
          id: track1Id,
          trackId: track1Id,
          platformId: uuidv4(),
          capacity: 3,
        },
        {
          id: track2Id,
          trackId: track2Id,
          platformId: uuidv4(),
          capacity: 5,
        },
      ];

      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: uuidv4(),
          trackId: track1Id,
          arrivalTime: 100,
          departureTime: 200,
          trainLength: 4, // Exceeds track1 capacity
        },
        {
          trainId: uuidv4(),
          stopId: uuidv4(),
          trackId: track2Id,
          arrivalTime: 100,
          departureTime: 200,
          trainLength: 4, // Within track2 capacity
        },
      ];

      const conflicts = validator.validateStoppingTrackCapacity(tracks, dwells);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].locationId).toBe(track1Id);
    });

    it('should use default train length if not specified', () => {
      const trackId = uuidv4();
      const track: StoppingTrack = {
        id: trackId,
        trackId,
        platformId: uuidv4(),
        capacity: 1,
      };

      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: uuidv4(),
          trackId,
          arrivalTime: 100,
          departureTime: 200,
          // trainLength not specified, should default to 1
        },
      ];

      const conflicts = validator.validateStoppingTrackCapacity([track], dwells);
      expect(conflicts).toEqual([]);
    });

    it('should include helpful message in capacity conflict', () => {
      const trackId = uuidv4();
      const track: StoppingTrack = {
        id: trackId,
        trackId,
        platformId: uuidv4(),
        capacity: 2,
      };

      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: uuidv4(),
          trackId,
          arrivalTime: 100,
          departureTime: 200,
          trainLength: 5,
        },
      ];

      const conflicts = validator.validateStoppingTrackCapacity([track], dwells);
      expect(conflicts[0].message).toContain('capacity');
      expect(conflicts[0].message).toContain('5');
      expect(conflicts[0].message).toContain('2');
    });

    it('should handle empty track list', () => {
      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: uuidv4(),
          trackId: uuidv4(),
          arrivalTime: 100,
          departureTime: 200,
        },
      ];

      const conflicts = validator.validateStoppingTrackCapacity([], dwells);
      expect(conflicts).toEqual([]);
    });

    it('should handle empty dwell list', () => {
      const track: StoppingTrack = {
        id: uuidv4(),
        trackId: uuidv4(),
        platformId: uuidv4(),
        capacity: 3,
      };

      const conflicts = validator.validateStoppingTrackCapacity([track], []);
      expect(conflicts).toEqual([]);
    });
  });
});
