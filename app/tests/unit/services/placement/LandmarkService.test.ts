import { beforeEach, describe, expect, it } from 'vitest';
import { LandmarkService } from '../../../../src/services/placement/LandmarkService';

describe('LandmarkService', () => {
  let service: LandmarkService;

  beforeEach(() => {
    service = new LandmarkService();
  });

  describe('create', () => {
    it('should create a landmark', () => {
      const landmark = service.create(100, 200, 5);

      expect(landmark.x).toBe(100);
      expect(landmark.y).toBe(200);
      expect(landmark.elevationMeters).toBe(5);
      expect(service.count()).toBe(1);
    });

    it('should create landmark with metadata', () => {
      const landmark = service.create(100, 200, 0, { type: 'junction' });

      expect(landmark.metadata).toEqual({ type: 'junction' });
    });
  });

  describe('get', () => {
    it('should retrieve existing landmark', () => {
      const created = service.create(100, 200);
      const retrieved = service.get(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent landmark', () => {
      const retrieved = service.get('non-existent-id');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update landmark position', () => {
      const landmark = service.create(100, 200);
      const updated = service.update(landmark.id, { x: 150, y: 250 });

      expect(updated?.x).toBe(150);
      expect(updated?.y).toBe(250);
    });

    it('should return undefined for non-existent landmark', () => {
      const updated = service.update('non-existent-id', { x: 150 });

      expect(updated).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete landmark without connections', () => {
      const landmark = service.create(100, 200);
      const deleted = service.delete(landmark.id);

      expect(deleted).toBe(true);
      expect(service.get(landmark.id)).toBeUndefined();
    });

    it('should not delete landmark with connections', () => {
      const landmark = service.create(100, 200);
      const trackId = '550e8400-e29b-41d4-a716-446655440000';
      service.addConnection(landmark.id, trackId);
      const deleted = service.delete(landmark.id);

      expect(deleted).toBe(false);
      expect(service.get(landmark.id)).toBeDefined();
    });

    it('should return false for non-existent landmark', () => {
      const deleted = service.delete('non-existent-id');

      expect(deleted).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('should return true for landmark without connections', () => {
      const landmark = service.create(100, 200);

      expect(service.canDelete(landmark.id)).toBe(true);
    });

    it('should return false for landmark with connections', () => {
      const landmark = service.create(100, 200);
      const trackId = '550e8400-e29b-41d4-a716-446655440000';
      service.addConnection(landmark.id, trackId);

      expect(service.canDelete(landmark.id)).toBe(false);
    });

    it('should return false for non-existent landmark', () => {
      expect(service.canDelete('non-existent-id')).toBe(false);
    });
  });

  describe('connections', () => {
    it('should add connection', () => {
      const landmark = service.create(100, 200);
      const trackId = '550e8400-e29b-41d4-a716-446655440000';
      const updated = service.addConnection(landmark.id, trackId);

      expect(updated.connections).toEqual([trackId]);
    });

    it('should remove connection', () => {
      const landmark = service.create(100, 200);
      const trackId = '550e8400-e29b-41d4-a716-446655440000';
      service.addConnection(landmark.id, trackId);
      const updated = service.removeConnection(landmark.id, trackId);

      expect(updated.connections).toEqual([]);
    });

    it('should throw when adding connection to non-existent landmark', () => {
      const trackId = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => {
        service.addConnection('non-existent-id', trackId);
      }).toThrow('Landmark non-existent-id not found');
    });
  });

  describe('findByPosition', () => {
    it('should find landmark by position within tolerance', () => {
      const landmark = service.create(100, 200);
      const found = service.findByPosition(102, 198, 5);

      expect(found?.id).toBe(landmark.id);
    });

    it('should not find landmark outside tolerance', () => {
      service.create(100, 200);
      const found = service.findByPosition(110, 210, 5);

      expect(found).toBeUndefined();
    });
  });

  describe('findInArea', () => {
    it('should find landmarks within area', () => {
      service.create(100, 200);
      service.create(150, 250);
      service.create(300, 400);

      const found = service.findInArea(50, 150, 200, 300);

      expect(found).toHaveLength(2);
    });
  });

  describe('memory management', () => {
    it('should handle large number of landmarks (200+)', () => {
      for (let i = 0; i < 250; i++) {
        service.create(i * 10, i * 10);
      }

      expect(service.count()).toBe(250);
      expect(service.getAll()).toHaveLength(250);

      // Clear and verify cleanup
      service.clear();
      expect(service.count()).toBe(0);
    });
  });
});
