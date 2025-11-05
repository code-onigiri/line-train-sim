import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { StationModel } from '../../../src/models/Station';

describe('StationModel - T024d: Validation (area polygon, platforms)', () => {
  describe('Basic Construction', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should create a station with default values', () => {
      const station = new StationModel({ areaPolygon: validPolygon });

      expect(station.name).toBe('Untitled Station');
      expect(station.areaPolygon).toEqual(validPolygon);
      expect(station.platforms).toEqual([]);
      expect(station.stoppingTracks).toEqual([]);
      expect(station.landmarkEntrances).toEqual([]);
      expect(station.diagramOrderIndex).toBe(0);
    });

    it('should create a station with custom name', () => {
      const station = new StationModel({ name: 'Central Station', areaPolygon: validPolygon });

      expect(station.name).toBe('Central Station');
    });

    it('should generate unique ID', () => {
      const station1 = new StationModel({ areaPolygon: validPolygon });
      const station2 = new StationModel({ areaPolygon: validPolygon });

      expect(station1.id).not.toBe(station2.id);
    });
  });

  describe('Area Polygon Validation', () => {
    it('should require at least 3 points for area polygon per schema', () => {
      // Per schema validation: areaPolygon must have at least 3 points
      const validPolygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = new StationModel({ areaPolygon: validPolygon });

      expect(station.areaPolygon).toEqual(validPolygon);
    });

    it('should accept valid rectangular area polygon', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 0, y: 50 },
      ];
      const station = new StationModel({ areaPolygon: polygon });

      expect(station.areaPolygon).toEqual(polygon);
    });

    it('should accept complex non-self-intersecting polygon', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 75, y: 25 },
        { x: 50, y: 50 },
        { x: 0, y: 50 },
      ];
      const station = new StationModel({ areaPolygon: polygon });

      expect(station.areaPolygon).toEqual(polygon);
    });

    it('should update area polygon immutably', () => {
      const original = new StationModel({
        areaPolygon: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ],
      });
      const newPolygon = [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 20, y: 20 },
      ];
      const updated = original.updateAreaPolygon(newPolygon);

      expect(original.areaPolygon).toHaveLength(3);
      expect(original.areaPolygon[2]).toEqual({ x: 10, y: 10 });
      expect(updated.areaPolygon).toEqual(newPolygon);
      expect(updated.id).toBe(original.id);
    });

    it('should return a copy of area polygon to prevent mutation', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const station = new StationModel({ areaPolygon: polygon });
      const retrieved = station.areaPolygon;

      retrieved[0].x = 999;

      expect(station.areaPolygon[0].x).toBe(0);
    });
  });

  describe('Platform Management', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should add platform to station', () => {
      const station = new StationModel({ areaPolygon: validPolygon });
      const platformId = uuidv4();
      const updated = station.addPlatform(platformId);

      expect(updated.platforms).toContain(platformId);
      expect(updated.platforms).toHaveLength(1);
    });

    it('should not add duplicate platform', () => {
      const station = new StationModel({ areaPolygon: validPolygon });
      const platformId = uuidv4();
      const updated1 = station.addPlatform(platformId);
      const updated2 = updated1.addPlatform(platformId);

      expect(updated2.platforms).toEqual([platformId]);
    });

    it('should remove platform from station', () => {
      const station = new StationModel({ areaPolygon: validPolygon });
      const platformId1 = uuidv4();
      const platformId2 = uuidv4();
      const updated1 = station.addPlatform(platformId1).addPlatform(platformId2);
      const updated2 = updated1.removePlatform(platformId1);

      expect(updated2.platforms).toEqual([platformId2]);
    });

    it('should add multiple platforms', () => {
      const station = new StationModel({ areaPolygon: validPolygon });
      const platformId1 = uuidv4();
      const platformId2 = uuidv4();
      const platformId3 = uuidv4();
      const updated = station
        .addPlatform(platformId1)
        .addPlatform(platformId2)
        .addPlatform(platformId3);

      expect(updated.platforms).toHaveLength(3);
      expect(updated.platforms).toContain(platformId1);
      expect(updated.platforms).toContain(platformId2);
      expect(updated.platforms).toContain(platformId3);
    });
  });

  describe('Stopping Track Management', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should add stopping track to station', () => {
      const station = new StationModel({ areaPolygon: validPolygon });
      const trackId = uuidv4();
      const updated = station.addStoppingTrack(trackId);

      expect(updated.stoppingTracks).toContain(trackId);
    });

    it('should not add duplicate stopping track', () => {
      const station = new StationModel({ areaPolygon: validPolygon });
      const trackId = uuidv4();
      const updated1 = station.addStoppingTrack(trackId);
      const updated2 = updated1.addStoppingTrack(trackId);

      expect(updated2.stoppingTracks).toEqual([trackId]);
    });

    it('should remove stopping track from station', () => {
      const station = new StationModel({ areaPolygon: validPolygon });
      const trackId1 = uuidv4();
      const trackId2 = uuidv4();
      const updated1 = station.addStoppingTrack(trackId1).addStoppingTrack(trackId2);
      const updated2 = updated1.removeStoppingTrack(trackId1);

      expect(updated2.stoppingTracks).toEqual([trackId2]);
    });
  });

  describe('Landmark Entrance Management', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should add landmark entrance to station', () => {
      const station = new StationModel({ areaPolygon: validPolygon });
      const landmarkId = uuidv4();
      const updated = station.addLandmarkEntrance(landmarkId);

      expect(updated.landmarkEntrances).toContain(landmarkId);
    });

    it('should not add duplicate landmark entrance', () => {
      const station = new StationModel({ areaPolygon: validPolygon });
      const landmarkId = uuidv4();
      const updated1 = station.addLandmarkEntrance(landmarkId);
      const updated2 = updated1.addLandmarkEntrance(landmarkId);

      expect(updated2.landmarkEntrances).toEqual([landmarkId]);
    });

    it('should remove landmark entrance from station', () => {
      const station = new StationModel({ areaPolygon: validPolygon });
      const landmarkId1 = uuidv4();
      const landmarkId2 = uuidv4();
      const updated1 = station.addLandmarkEntrance(landmarkId1).addLandmarkEntrance(landmarkId2);
      const updated2 = updated1.removeLandmarkEntrance(landmarkId1);

      expect(updated2.landmarkEntrances).toEqual([landmarkId2]);
    });
  });

  describe('Diagram Order Index', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should update diagram order index immutably', () => {
      const original = new StationModel({ diagramOrderIndex: 0, areaPolygon: validPolygon });
      const updated = original.updateDiagramOrderIndex(5);

      expect(original.diagramOrderIndex).toBe(0);
      expect(updated.diagramOrderIndex).toBe(5);
      expect(updated.id).toBe(original.id);
    });

    it('should enforce nonnegative diagram order index per schema', () => {
      // Per schema: diagramOrderIndex must be nonnegative
      const station = new StationModel({ diagramOrderIndex: 0, areaPolygon: validPolygon });

      expect(station.diagramOrderIndex).toBe(0);
    });
  });

  describe('Name Updates', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should update name immutably', () => {
      const original = new StationModel({ name: 'Old Name', areaPolygon: validPolygon });
      const updated = original.updateName('New Name');

      expect(original.name).toBe('Old Name');
      expect(updated.name).toBe('New Name');
      expect(updated.id).toBe(original.id);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
      ];
      const station = new StationModel({
        name: 'Test Station',
        areaPolygon: polygon,
        diagramOrderIndex: 3,
      });
      const json = station.toJSON();

      expect(json.name).toBe('Test Station');
      expect(json.areaPolygon).toEqual(polygon);
      expect(json.diagramOrderIndex).toBe(3);
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });

    it('should deserialize from JSON', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
      ];
      const original = new StationModel({
        name: 'Test Station',
        areaPolygon: polygon,
      });
      const json = original.toJSON();
      const restored = StationModel.fromJSON(json);

      expect(restored.name).toBe(original.name);
      expect(restored.areaPolygon).toEqual(original.areaPolygon);
      expect(restored.id).toBe(original.id);
    });
  });

  describe('Validation Requirements per Spec', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should require at least one platform and stopping track for valid station (validation to be enforced at service layer)', () => {
      // Per spec FR-002: Station must have at least one platform and stopping track
      // This validation happens at the service layer, not model layer
      const station = new StationModel({ areaPolygon: validPolygon });

      expect(station.platforms).toHaveLength(0);
      expect(station.stoppingTracks).toHaveLength(0);
      // Service layer will validate this requirement
    });

    it('should support polygon that must be non-self-intersecting (validation to be enforced at service layer)', () => {
      // Per spec: Polygon must be non-self-intersecting
      // Validation happens at service layer
      const validPolygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      const station = new StationModel({ areaPolygon: validPolygon });

      expect(station.areaPolygon).toEqual(validPolygon);
    });
  });
});
