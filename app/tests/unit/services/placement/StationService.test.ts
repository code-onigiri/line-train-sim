import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { StationService } from '../../../../src/services/placement/StationService';

describe('StationService - T024h: Area validation', () => {
  let service: StationService;

  beforeEach(() => {
    service = new StationService();
  });

  describe('Station Creation', () => {
    it('should create a station with valid polygon', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 0, y: 50 },
      ];
      const station = service.create('Central Station', polygon);

      expect(station.name).toBe('Central Station');
      expect(station.areaPolygon).toEqual(polygon);
      expect(station.id).toBeDefined();
    });

    it('should reject polygon with less than 3 points', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ];

      expect(() => service.create('Invalid Station', polygon)).toThrow(
        'Station area must have at least 3 points',
      );
    });

    it('should reject self-intersecting polygon', () => {
      const selfIntersecting = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
      ];

      expect(() => service.create('Invalid Station', selfIntersecting)).toThrow(
        'Station area polygon is self-intersecting',
      );
    });

    it('should create station with triangle polygon', () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 50, y: 100 },
        { x: 100, y: 0 },
      ];
      const station = service.create('Triangle Station', triangle);

      expect(station.areaPolygon).toEqual(triangle);
    });

    it('should create station with complex valid polygon', () => {
      const complex = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 75, y: 25 },
        { x: 50, y: 50 },
        { x: 0, y: 50 },
      ];
      const station = service.create('Complex Station', complex);

      expect(station.areaPolygon).toEqual(complex);
    });
  });

  describe('Station Retrieval', () => {
    it('should retrieve station by id', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test Station', polygon);
      const retrieved = service.get(station.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(station.id);
    });

    it('should return undefined for non-existent station', () => {
      const result = service.get(uuidv4());

      expect(result).toBeUndefined();
    });

    it('should retrieve all stations', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      service.create('Station 1', polygon);
      service.create('Station 2', polygon);
      service.create('Station 3', polygon);
      const all = service.getAll();

      expect(all).toHaveLength(3);
    });
  });

  describe('Station Updates', () => {
    it('should update station name', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Old Name', polygon);
      const updated = service.update(station.id, { name: 'New Name' });

      expect(updated?.name).toBe('New Name');
      expect(updated?.id).toBe(station.id);
    });

    it('should update station area polygon', () => {
      const originalPolygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const newPolygon = [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 20, y: 20 },
      ];
      const station = service.create('Test', originalPolygon);
      const updated = service.update(station.id, { areaPolygon: newPolygon });

      expect(updated?.areaPolygon).toEqual(newPolygon);
    });

    it('should reject update with self-intersecting polygon', () => {
      const validPolygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test', validPolygon);

      const selfIntersecting = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
      ];

      expect(() => service.update(station.id, { areaPolygon: selfIntersecting })).toThrow(
        'Updated polygon is self-intersecting',
      );
    });

    it('should return undefined when updating non-existent station', () => {
      const result = service.update(uuidv4(), { name: 'Test' });

      expect(result).toBeUndefined();
    });

    it('should update diagram order index', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test', polygon);
      const updated = service.update(station.id, { diagramOrderIndex: 5 });

      expect(updated?.diagramOrderIndex).toBe(5);
    });
  });

  describe('Station Deletion', () => {
    it('should delete station', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test', polygon);
      const deleted = service.delete(station.id);

      expect(deleted).toBe(true);
      expect(service.get(station.id)).toBeUndefined();
    });

    it('should return false when deleting non-existent station', () => {
      const result = service.delete(uuidv4());

      expect(result).toBe(false);
    });
  });

  describe('Platform Management', () => {
    it('should add platform to station', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test', polygon);
      const platformId = uuidv4();
      const updated = service.addPlatform(station.id, platformId);

      expect(updated?.platforms).toContain(platformId);
    });

    it('should remove platform from station', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test', polygon);
      const platformId = uuidv4();
      service.addPlatform(station.id, platformId);
      const updated = service.removePlatform(station.id, platformId);

      expect(updated?.platforms).not.toContain(platformId);
    });
  });

  describe('Stopping Track Management', () => {
    it('should add stopping track to station', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test', polygon);
      const trackId = uuidv4();
      const updated = service.addStoppingTrack(station.id, trackId);

      expect(updated?.stoppingTracks).toContain(trackId);
    });

    it('should remove stopping track from station', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test', polygon);
      const trackId = uuidv4();
      service.addStoppingTrack(station.id, trackId);
      const updated = service.removeStoppingTrack(station.id, trackId);

      expect(updated?.stoppingTracks).not.toContain(trackId);
    });
  });

  describe('Landmark Entrance Management', () => {
    it('should add landmark entrance to station', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test', polygon);
      const landmarkId = uuidv4();
      const updated = service.addLandmarkEntrance(station.id, landmarkId);

      expect(updated?.landmarkEntrances).toContain(landmarkId);
    });

    it('should remove landmark entrance from station', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test', polygon);
      const landmarkId = uuidv4();
      service.addLandmarkEntrance(station.id, landmarkId);
      const updated = service.removeLandmarkEntrance(station.id, landmarkId);

      expect(updated?.landmarkEntrances).not.toContain(landmarkId);
    });
  });

  describe('Validation Requirements per Spec FR-002', () => {
    it('should enforce minimum 3 points for area polygon', () => {
      const invalidPolygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];

      expect(() => service.create('Invalid', invalidPolygon)).toThrow();
    });

    it('should prevent self-intersecting polygons', () => {
      const selfIntersecting = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
      ];

      expect(() => service.create('Invalid', selfIntersecting)).toThrow('self-intersecting');
    });

    it('should validate that platforms and stopping tracks can be configured', () => {
      // Per spec FR-002: Stations allow drawing platforms and stopping tracks
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = service.create('Test', polygon);
      const platformId = uuidv4();
      const trackId = uuidv4();

      let updated = service.addPlatform(station.id, platformId);
      updated = service.addStoppingTrack(updated?.id, trackId);

      expect(updated?.platforms).toContain(platformId);
      expect(updated?.stoppingTracks).toContain(trackId);
    });
  });
});
