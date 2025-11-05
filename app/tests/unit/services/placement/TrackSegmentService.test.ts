import { beforeEach, describe, expect, it } from 'vitest';
import { LandmarkService } from '../../../../src/services/placement/LandmarkService';
import { TrackSegmentService } from '../../../../src/services/placement/TrackSegmentService';

describe('TrackSegmentService', () => {
  let landmarkService: LandmarkService;
  let trackService: TrackSegmentService;

  beforeEach(() => {
    landmarkService = new LandmarkService();
    trackService = new TrackSegmentService(landmarkService);
  });

  describe('create', () => {
    it('should create a track segment between two landmarks', () => {
      const start = landmarkService.create(100, 200);
      const end = landmarkService.create(200, 300);

      const track = trackService.create(start.id, end.id);

      expect(track.startLandmarkId).toBe(start.id);
      expect(track.endLandmarkId).toBe(end.id);
      expect(track.classification).toBe('mainline');
    });

    it('should throw specific error for missing start landmark', () => {
      const end = landmarkService.create(200, 300);

      expect(() => {
        trackService.create('non-existent-id', end.id);
      }).toThrow('Start landmark not found: non-existent-id');
    });

    it('should throw specific error for missing end landmark', () => {
      const start = landmarkService.create(100, 200);

      expect(() => {
        trackService.create(start.id, 'non-existent-id');
      }).toThrow('End landmark not found: non-existent-id');
    });

    it('should calculate average elevation if not provided', () => {
      const start = landmarkService.create(100, 200, 10);
      const end = landmarkService.create(200, 300, 20);

      const track = trackService.create(start.id, end.id);

      expect(track.elevation).toBe(15);
    });

    it('should add connections to both landmarks', () => {
      const start = landmarkService.create(100, 200);
      const end = landmarkService.create(200, 300);

      const track = trackService.create(start.id, end.id);

      const updatedStart = landmarkService.get(start.id);
      const updatedEnd = landmarkService.get(end.id);

      expect(updatedStart?.connections).toContain(track.id);
      expect(updatedEnd?.connections).toContain(track.id);
    });
  });

  describe('intersection detection', () => {
    it('should detect intersection when vertical clearance < 4m', () => {
      const l1 = landmarkService.create(0, 0, 0);
      const l2 = landmarkService.create(100, 100, 0);
      const l3 = landmarkService.create(100, 0, 2);
      const l4 = landmarkService.create(0, 100, 2);

      const track1 = trackService.create(l1.id, l2.id);
      const track2 = trackService.create(l3.id, l4.id);

      const intersects = trackService.detectIntersection(track1.id, track2.id);

      expect(intersects).toBe(true);
    });

    it('should not detect intersection when vertical clearance >= 4m', () => {
      const l1 = landmarkService.create(0, 0, 0);
      const l2 = landmarkService.create(100, 100, 0);
      const l3 = landmarkService.create(100, 0, 5);
      const l4 = landmarkService.create(0, 100, 5);

      const track1 = trackService.create(l1.id, l2.id);
      const track2 = trackService.create(l3.id, l4.id);

      const intersects = trackService.detectIntersection(track1.id, track2.id);

      expect(intersects).toBe(false);
    });

    it('should not detect intersection for parallel lines', () => {
      const l1 = landmarkService.create(0, 0, 0);
      const l2 = landmarkService.create(100, 0, 0);
      const l3 = landmarkService.create(0, 10, 0);
      const l4 = landmarkService.create(100, 10, 0);

      const track1 = trackService.create(l1.id, l2.id);
      const track2 = trackService.create(l3.id, l4.id);

      const intersects = trackService.detectIntersection(track1.id, track2.id);

      expect(intersects).toBe(false);
    });

    it('should not detect intersection for non-intersecting segments', () => {
      const l1 = landmarkService.create(0, 0, 0);
      const l2 = landmarkService.create(50, 0, 0);
      const l3 = landmarkService.create(60, 0, 0);
      const l4 = landmarkService.create(100, 0, 0);

      const track1 = trackService.create(l1.id, l2.id);
      const track2 = trackService.create(l3.id, l4.id);

      const intersects = trackService.detectIntersection(track1.id, track2.id);

      expect(intersects).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete track and remove connections from landmarks', () => {
      const start = landmarkService.create(100, 200);
      const end = landmarkService.create(200, 300);
      const track = trackService.create(start.id, end.id);

      const deleted = trackService.delete(track.id);

      expect(deleted).toBe(true);
      expect(trackService.get(track.id)).toBeUndefined();

      const updatedStart = landmarkService.get(start.id);
      const updatedEnd = landmarkService.get(end.id);

      expect(updatedStart?.connections).not.toContain(track.id);
      expect(updatedEnd?.connections).not.toContain(track.id);
    });
  });

  describe('getByLandmark', () => {
    it('should find all tracks connected to a landmark', () => {
      const center = landmarkService.create(100, 100);
      const l1 = landmarkService.create(0, 100);
      const l2 = landmarkService.create(200, 100);
      const l3 = landmarkService.create(100, 0);

      const track1 = trackService.create(center.id, l1.id);
      const track2 = trackService.create(center.id, l2.id);
      trackService.create(center.id, l3.id);

      const tracks = trackService.getByLandmark(center.id);

      expect(tracks).toHaveLength(3);
      expect(tracks.map((t) => t.id)).toContain(track1.id);
      expect(tracks.map((t) => t.id)).toContain(track2.id);
    });
  });
});
