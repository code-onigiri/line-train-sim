import { describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { TrainMovement } from '../../../../src/services/simulation/TrainMovement';
import type { SpeedProfile } from '../../../../src/models/VehicleType';

describe('TrainMovement', () => {
  const movement = new TrainMovement();

  describe('calculatePosition', () => {
    it('should calculate position on straight segment', () => {
      const segment = {
        id: uuidv4(),
        startLandmarkId: uuidv4(),
        endLandmarkId: uuidv4(),
        length: 1000, // meters
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 1000, y: 0 },
      };

      const position = movement.calculatePosition(segment, 500, 0);
      expect(position.x).toBeCloseTo(500, 1);
      expect(position.y).toBeCloseTo(0, 1);
    });

    it('should handle position at start of segment', () => {
      const segment = {
        id: uuidv4(),
        startLandmarkId: uuidv4(),
        endLandmarkId: uuidv4(),
        length: 1000,
        startPoint: { x: 100, y: 200 },
        endPoint: { x: 1100, y: 200 },
      };

      const position = movement.calculatePosition(segment, 0, 0);
      expect(position.x).toBeCloseTo(100, 1);
      expect(position.y).toBeCloseTo(200, 1);
    });

    it('should handle position at end of segment', () => {
      const segment = {
        id: uuidv4(),
        startLandmarkId: uuidv4(),
        endLandmarkId: uuidv4(),
        length: 1000,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 1000 },
      };

      const position = movement.calculatePosition(segment, 1000, 0);
      expect(position.x).toBeCloseTo(0, 1);
      expect(position.y).toBeCloseTo(1000, 1);
    });

    it('should calculate position on diagonal segment', () => {
      const segment = {
        id: uuidv4(),
        startLandmarkId: uuidv4(),
        endLandmarkId: uuidv4(),
        length: Math.sqrt(2) * 1000,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 1000, y: 1000 },
      };

      const position = movement.calculatePosition(segment, 1000, 0);
      expect(position.x).toBeCloseTo(707.1, 1);
      expect(position.y).toBeCloseTo(707.1, 1);
    });
  });

  describe('calculateSpeed', () => {
    it('should respect speed profile limits', () => {
      const profile: SpeedProfile = {
        maxSpeed: 100, // km/h
        acceleration: 2.0, // m/s²
        deceleration: 2.5, // m/s²
      };

      const speed = movement.calculateSpeed(0, 50, profile, 1.0);
      expect(speed).toBeLessThanOrEqual(100 / 3.6); // Convert km/h to m/s
    });

    it('should accelerate from rest', () => {
      const profile: SpeedProfile = {
        maxSpeed: 100,
        acceleration: 2.0,
        deceleration: 2.5,
      };

      const speed = movement.calculateSpeed(0, 0, profile, 1.0);
      expect(speed).toBeGreaterThan(0);
      expect(speed).toBeLessThanOrEqual(2.0); // One second of acceleration
    });

    it('should decelerate when approaching stop', () => {
      const profile: SpeedProfile = {
        maxSpeed: 100,
        acceleration: 2.0,
        deceleration: 2.5,
      };

      const currentSpeed = 20; // m/s
      const distanceToStop = 50; // meters
      
      const speed = movement.calculateSpeed(currentSpeed, distanceToStop, profile, 1.0);
      expect(speed).toBeLessThan(currentSpeed);
    });

    it('should maintain constant speed when at max speed with distance', () => {
      const profile: SpeedProfile = {
        maxSpeed: 100,
        acceleration: 2.0,
        deceleration: 2.5,
      };

      const maxSpeedMs = 100 / 3.6;
      const speed = movement.calculateSpeed(maxSpeedMs, 5000, profile, 1.0);
      expect(speed).toBeCloseTo(maxSpeedMs, 1);
    });

    it('should scale with time factor', () => {
      const profile: SpeedProfile = {
        maxSpeed: 100,
        acceleration: 2.0,
        deceleration: 2.5,
      };

      const speed1 = movement.calculateSpeed(0, 1000, profile, 1.0);
      const speed2 = movement.calculateSpeed(0, 1000, profile, 2.0);
      
      // With 2x time, acceleration should be applied for 2 seconds
      expect(speed2).toBeGreaterThan(speed1);
    });

    it('should stop at zero distance remaining', () => {
      const profile: SpeedProfile = {
        maxSpeed: 100,
        acceleration: 2.0,
        deceleration: 2.5,
      };

      const speed = movement.calculateSpeed(10, 0, profile, 1.0);
      expect(speed).toBe(0);
    });
  });

  describe('calculateTravelTime', () => {
    it('should calculate time for constant speed travel', () => {
      const profile: SpeedProfile = {
        maxSpeed: 100, // km/h
        acceleration: 0, // Instant acceleration for this test
        deceleration: 0,
      };

      const distance = 1000; // meters
      const time = movement.calculateTravelTime(distance, profile);
      
      // At 100 km/h = 27.78 m/s, 1000m should take ~36 seconds
      expect(time).toBeGreaterThan(30);
      expect(time).toBeLessThan(40);
    });

    it('should account for acceleration time', () => {
      const profile: SpeedProfile = {
        maxSpeed: 50,
        acceleration: 1.0,
        deceleration: 1.0,
      };

      const distance = 500;
      const time = movement.calculateTravelTime(distance, profile);
      
      expect(time).toBeGreaterThan(0);
    });

    it('should handle very short distances', () => {
      const profile: SpeedProfile = {
        maxSpeed: 100,
        acceleration: 2.0,
        deceleration: 2.5,
      };

      const distance = 10; // meters
      const time = movement.calculateTravelTime(distance, profile);
      
      expect(time).toBeGreaterThan(0);
      expect(time).toBeLessThan(10);
    });
  });
});
