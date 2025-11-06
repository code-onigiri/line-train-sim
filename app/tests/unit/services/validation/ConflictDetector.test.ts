import { describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { ConflictDetector } from '../../../../src/services/validation/ConflictDetector';
import type { DwellAssignment } from '../../../../src/models/ExecutionComponents';

describe('ConflictDetector', () => {
  const detector = new ConflictDetector();

  describe('detectDwellConflicts', () => {
    it('should detect no conflicts when no trains exist', () => {
      const conflicts = detector.detectDwellConflicts([]);
      expect(conflicts).toEqual([]);
    });

    it('should detect no conflicts when trains use different tracks', () => {
      const track1 = uuidv4();
      const track2 = uuidv4();
      const stop1 = uuidv4();
      
      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 100,
          departureTime: 200,
        },
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track2,
          arrivalTime: 150,
          departureTime: 250,
        },
      ];

      const conflicts = detector.detectDwellConflicts(dwells);
      expect(conflicts).toEqual([]);
    });

    it('should detect no conflicts when trains use same track but different times', () => {
      const track1 = uuidv4();
      const stop1 = uuidv4();
      
      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 100,
          departureTime: 200,
        },
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 250,
          departureTime: 350,
        },
      ];

      const conflicts = detector.detectDwellConflicts(dwells);
      expect(conflicts).toEqual([]);
    });

    it('should detect conflict when trains overlap on same track', () => {
      const track1 = uuidv4();
      const stop1 = uuidv4();
      const train1 = uuidv4();
      const train2 = uuidv4();
      
      const dwells: DwellAssignment[] = [
        {
          trainId: train1,
          stopId: stop1,
          trackId: track1,
          arrivalTime: 100,
          departureTime: 300,
        },
        {
          trainId: train2,
          stopId: stop1,
          trackId: track1,
          arrivalTime: 200,
          departureTime: 400,
        },
      ];

      const conflicts = detector.detectDwellConflicts(dwells);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('DWELL_OVERLAP');
      expect(conflicts[0].locationId).toBe(track1);
    });

    it('should detect conflict when second train arrives before first departs', () => {
      const track1 = uuidv4();
      const stop1 = uuidv4();
      
      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 100,
          departureTime: 250,
        },
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 249,
          departureTime: 300,
        },
      ];

      const conflicts = detector.detectDwellConflicts(dwells);
      expect(conflicts).toHaveLength(1);
    });

    it('should allow trains to arrive exactly when previous departs', () => {
      const track1 = uuidv4();
      const stop1 = uuidv4();
      
      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 100,
          departureTime: 200,
        },
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 200,
          departureTime: 300,
        },
      ];

      const conflicts = detector.detectDwellConflicts(dwells);
      expect(conflicts).toEqual([]);
    });

    it('should detect multiple conflicts across different tracks', () => {
      const track1 = uuidv4();
      const track2 = uuidv4();
      const stop1 = uuidv4();
      
      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 100,
          departureTime: 200,
        },
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 150,
          departureTime: 250,
        },
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track2,
          arrivalTime: 100,
          departureTime: 200,
        },
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track2,
          arrivalTime: 180,
          departureTime: 280,
        },
      ];

      const conflicts = detector.detectDwellConflicts(dwells);
      expect(conflicts).toHaveLength(2);
    });

    it('should include train IDs in conflict details', () => {
      const track1 = uuidv4();
      const stop1 = uuidv4();
      const train1 = uuidv4();
      const train2 = uuidv4();
      
      const dwells: DwellAssignment[] = [
        {
          trainId: train1,
          stopId: stop1,
          trackId: track1,
          arrivalTime: 100,
          departureTime: 300,
        },
        {
          trainId: train2,
          stopId: stop1,
          trackId: track1,
          arrivalTime: 200,
          departureTime: 400,
        },
      ];

      const conflicts = detector.detectDwellConflicts(dwells);
      expect(conflicts[0].trainIds).toContain(train1);
      expect(conflicts[0].trainIds).toContain(train2);
    });

    it('should provide helpful conflict message', () => {
      const track1 = uuidv4();
      const stop1 = uuidv4();
      
      const dwells: DwellAssignment[] = [
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 100,
          departureTime: 300,
        },
        {
          trainId: uuidv4(),
          stopId: stop1,
          trackId: track1,
          arrivalTime: 200,
          departureTime: 400,
        },
      ];

      const conflicts = detector.detectDwellConflicts(dwells);
      expect(conflicts[0].message).toContain('overlap');
    });
  });
});
