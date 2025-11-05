import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { TrackSegmentModel } from '../../../src/models/TrackSegment';

describe('TrackSegmentModel - T024c: Validation (slope, clearance, intersections)', () => {
  describe('Basic Construction', () => {
    it('should create a track segment with default values', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const track = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
      });

      expect(track.startLandmarkId).toBe(startId);
      expect(track.endLandmarkId).toBe(endId);
      expect(track.classification).toBe('mainline');
      expect(track.isBidirectional).toBe(true);
      expect(track.permissibleSpeedKph).toBe(100);
      expect(track.slopePercent).toBe(0);
      expect(track.addons).toEqual([]);
    });

    it('should create a track segment with custom classification', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const track = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        classification: 'station',
      });

      expect(track.classification).toBe('station');
    });
  });

  describe('Slope Validation', () => {
    it('should accept zero slope', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const track = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        slopePercent: 0,
      });

      expect(track.slopePercent).toBe(0);
    });

    it('should accept positive slope (uphill)', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const track = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        slopePercent: 5.5,
      });

      expect(track.slopePercent).toBe(5.5);
    });

    it('should accept negative slope (downhill)', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const track = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        slopePercent: -3.2,
      });

      expect(track.slopePercent).toBe(-3.2);
    });

    it('should update slope immutably', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const original = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        slopePercent: 2.0,
      });
      const updated = original.updateSlope(4.5);

      expect(original.slopePercent).toBe(2.0);
      expect(updated.slopePercent).toBe(4.5);
      expect(updated.id).toBe(original.id);
    });
  });

  describe('Speed and Bidirectional Settings', () => {
    it('should update permissible speed immutably', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const original = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        permissibleSpeedKph: 100,
      });
      const updated = original.updateSpeed(80);

      expect(original.permissibleSpeedKph).toBe(100);
      expect(updated.permissibleSpeedKph).toBe(80);
    });

    it('should set bidirectional flag immutably', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const original = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        isBidirectional: true,
      });
      const updated = original.setBidirectional(false);

      expect(original.isBidirectional).toBe(true);
      expect(updated.isBidirectional).toBe(false);
    });
  });

  describe('Classification Updates', () => {
    it('should update classification from mainline to station', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const original = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        classification: 'mainline',
      });
      const updated = original.updateClassification('station');

      expect(original.classification).toBe('mainline');
      expect(updated.classification).toBe('station');
    });

    it('should update classification to depot', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const original = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
      });
      const updated = original.updateClassification('depot');

      expect(updated.classification).toBe('depot');
    });
  });

  describe('Addon Management', () => {
    it('should add addon to track segment', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const track = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
      });
      const addonId = uuidv4();
      const updated = track.addAddon(addonId);

      expect(updated.addons).toContain(addonId);
    });

    it('should not add duplicate addon', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const track = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
      });
      const addonId = uuidv4();
      const updated1 = track.addAddon(addonId);
      const updated2 = updated1.addAddon(addonId);

      expect(updated2.addons).toEqual([addonId]);
    });

    it('should remove addon from track segment', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const track = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
      });
      const addonId1 = uuidv4();
      const addonId2 = uuidv4();
      const updated1 = track.addAddon(addonId1).addAddon(addonId2);
      const updated2 = updated1.removeAddon(addonId1);

      expect(updated2.addons).toEqual([addonId2]);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const track = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        slopePercent: 3.5,
        classification: 'depot',
      });
      const json = track.toJSON();

      expect(json.startLandmarkId).toBe(startId);
      expect(json.endLandmarkId).toBe(endId);
      expect(json.slopePercent).toBe(3.5);
      expect(json.classification).toBe('depot');
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });

    it('should deserialize from JSON', () => {
      const startId = uuidv4();
      const endId = uuidv4();
      const original = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        slopePercent: 2.5,
      });
      const json = original.toJSON();
      const restored = TrackSegmentModel.fromJSON(json);

      expect(restored.startLandmarkId).toBe(original.startLandmarkId);
      expect(restored.endLandmarkId).toBe(original.endLandmarkId);
      expect(restored.slopePercent).toBe(original.slopePercent);
      expect(restored.id).toBe(original.id);
    });
  });

  describe('Intersection and Clearance Context', () => {
    it('should maintain slope information for intersection detection', () => {
      // Slope is manually entered and used for vertical clearance calculations
      // 4m clearance threshold is measured from track rail top surface
      const startId = uuidv4();
      const endId = uuidv4();
      const track = new TrackSegmentModel({
        startLandmarkId: startId,
        endLandmarkId: endId,
        slopePercent: 2.0, // Manual entry
      });

      expect(track.slopePercent).toBe(2.0);
    });
  });
});
