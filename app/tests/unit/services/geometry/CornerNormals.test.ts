import { describe, expect, it } from 'vitest';
import { CornerNormals } from '../../../../src/services/geometry/CornerNormals';

describe('CornerNormals', () => {
  const cornerNormals = new CornerNormals();

  describe('calculateNormal', () => {
    it('should calculate normal for 90-degree right turn', () => {
      const incoming = { x: 1, y: 0 }; // Moving east
      const outgoing = { x: 0, y: 1 }; // Turning north

      const normal = cornerNormals.calculateNormal(incoming, outgoing);

      // For a right turn (east to north), the bisector is northeast {1,1}
      // Rotating clockwise 90° gives {1,-1} normalized to {0.707,-0.707}
      expect(normal.x).toBeCloseTo(0.707, 2);
      expect(normal.y).toBeCloseTo(-0.707, 2);
    });

    it('should calculate normal for 90-degree left turn', () => {
      const incoming = { x: 1, y: 0 }; // Moving east
      const outgoing = { x: 0, y: -1 }; // Turning south

      const normal = cornerNormals.calculateNormal(incoming, outgoing);

      // For a left turn (east to south), the bisector is southeast {1,-1}
      // Rotating clockwise 90° gives {-1,-1} normalized to {-0.707,-0.707}
      expect(normal.x).toBeCloseTo(-0.707, 2);
      expect(normal.y).toBeCloseTo(-0.707, 2);
    });

    it('should calculate normal for 180-degree turn', () => {
      const incoming = { x: 1, y: 0 }; // Moving east
      const outgoing = { x: -1, y: 0 }; // Turning west (U-turn)

      const normal = cornerNormals.calculateNormal(incoming, outgoing);

      // For U-turn, normal should be perpendicular
      expect(Math.abs(normal.y)).toBeGreaterThan(0.9);
    });

    it('should calculate normal for straight path', () => {
      const incoming = { x: 1, y: 0 };
      const outgoing = { x: 1, y: 0 }; // Same direction

      const normal = cornerNormals.calculateNormal(incoming, outgoing);

      // For straight path, normal should be perpendicular to direction
      expect(normal.x).toBeCloseTo(0, 2);
      expect(Math.abs(normal.y)).toBeCloseTo(1, 2);
    });

    it('should normalize result vector', () => {
      const incoming = { x: 2, y: 0 };
      const outgoing = { x: 0, y: 3 };

      const normal = cornerNormals.calculateNormal(incoming, outgoing);

      const magnitude = Math.sqrt(normal.x ** 2 + normal.y ** 2);
      expect(magnitude).toBeCloseTo(1, 2);
    });

    it('should calculate normal for 45-degree turn', () => {
      const incoming = { x: 1, y: 0 };
      const outgoing = { x: 0.707, y: 0.707 };

      const normal = cornerNormals.calculateNormal(incoming, outgoing);

      const magnitude = Math.sqrt(normal.x ** 2 + normal.y ** 2);
      expect(magnitude).toBeCloseTo(1, 2);
    });

    it('should calculate normal for diagonal to horizontal', () => {
      const incoming = { x: 1, y: 1 };
      const outgoing = { x: 1, y: 0 };

      const normal = cornerNormals.calculateNormal(incoming, outgoing);

      const magnitude = Math.sqrt(normal.x ** 2 + normal.y ** 2);
      expect(magnitude).toBeCloseTo(1, 2);
    });
  });

  describe('calculateTrapezoidPoints', () => {
    it('should calculate trapezoid for train at corner', () => {
      const trainLength = 100; // meters
      const trainWidth = 10; // meters
      const cornerPoint = { x: 500, y: 500 };
      const incoming = { x: 1, y: 0 };
      const outgoing = { x: 0, y: 1 };

      const points = cornerNormals.calculateTrapezoidPoints(
        cornerPoint,
        trainLength,
        trainWidth,
        incoming,
        outgoing,
      );

      expect(points).toHaveLength(4);
      // Verify points form a closed shape
      expect(points[0]).toHaveProperty('x');
      expect(points[0]).toHaveProperty('y');
    });

    it('should create symmetric trapezoid for straight sections', () => {
      const trainLength = 100;
      const trainWidth = 10;
      const cornerPoint = { x: 0, y: 0 };
      const direction = { x: 1, y: 0 }; // Same direction

      const points = cornerNormals.calculateTrapezoidPoints(
        cornerPoint,
        trainLength,
        trainWidth,
        direction,
        direction,
      );

      expect(points).toHaveLength(4);
      
      // For straight section, should form a rectangle
      const widths = [
        Math.abs(points[0].y - points[1].y),
        Math.abs(points[2].y - points[3].y),
      ];
      expect(widths[0]).toBeCloseTo(widths[1], 1);
    });

    it('should handle different train lengths', () => {
      const cornerPoint = { x: 0, y: 0 };
      const incoming = { x: 1, y: 0 };
      const outgoing = { x: 0, y: 1 };

      const points1 = cornerNormals.calculateTrapezoidPoints(
        cornerPoint,
        50,
        10,
        incoming,
        outgoing,
      );

      const points2 = cornerNormals.calculateTrapezoidPoints(
        cornerPoint,
        100,
        10,
        incoming,
        outgoing,
      );

      // Longer train should have greater span
      const span1 = Math.max(
        Math.abs(points1[2].x - points1[0].x),
        Math.abs(points1[2].y - points1[0].y),
      );
      const span2 = Math.max(
        Math.abs(points2[2].x - points2[0].x),
        Math.abs(points2[2].y - points2[0].y),
      );

      expect(span2).toBeGreaterThan(span1);
    });

    it('should handle different train widths', () => {
      const cornerPoint = { x: 0, y: 0 };
      const incoming = { x: 1, y: 0 };
      const outgoing = { x: 0, y: 1 };

      const points1 = cornerNormals.calculateTrapezoidPoints(
        cornerPoint,
        100,
        5,
        incoming,
        outgoing,
      );

      const points2 = cornerNormals.calculateTrapezoidPoints(
        cornerPoint,
        100,
        15,
        incoming,
        outgoing,
      );

      // Wider train should have different perpendicular distance
      expect(points1).not.toEqual(points2);
    });
  });

  describe('chainCornerTransformations', () => {
    it('should chain transformations through consecutive corners', () => {
      const corners = [
        {
          point: { x: 0, y: 0 },
          incoming: { x: 1, y: 0 },
          outgoing: { x: 0, y: 1 },
        },
        {
          point: { x: 100, y: 100 },
          incoming: { x: 0, y: 1 },
          outgoing: { x: -1, y: 0 },
        },
      ];

      const transformations = cornerNormals.chainCornerTransformations(corners);

      expect(transformations).toHaveLength(2);
      expect(transformations[0].normal).toBeDefined();
      expect(transformations[1].normal).toBeDefined();
    });

    it('should maintain continuity across corners', () => {
      const corners = [
        {
          point: { x: 0, y: 0 },
          incoming: { x: 1, y: 0 },
          outgoing: { x: 1, y: 1 },
        },
        {
          point: { x: 100, y: 100 },
          incoming: { x: 1, y: 1 },
          outgoing: { x: 0, y: 1 },
        },
      ];

      const transformations = cornerNormals.chainCornerTransformations(corners);

      // Second corner's incoming should be normalized version of input
      expect(transformations[1].incoming.x).toBeCloseTo(0.707, 2);
      expect(transformations[1].incoming.y).toBeCloseTo(0.707, 2);
    });

    it('should handle single corner', () => {
      const corners = [
        {
          point: { x: 0, y: 0 },
          incoming: { x: 1, y: 0 },
          outgoing: { x: 0, y: 1 },
        },
      ];

      const transformations = cornerNormals.chainCornerTransformations(corners);

      expect(transformations).toHaveLength(1);
    });

    it('should handle empty corner list', () => {
      const transformations = cornerNormals.chainCornerTransformations([]);

      expect(transformations).toEqual([]);
    });
  });
});
