/**
 * Vector2D: Simple 2D vector representation
 */
interface Vector2D {
  x: number;
  y: number;
}

/**
 * CornerInfo: Information about a corner between two track segments
 */
interface CornerInfo {
  point: Vector2D;
  incoming: Vector2D; // Normalized direction vector
  outgoing: Vector2D; // Normalized direction vector
}

/**
 * CornerTransformation: Result of calculating corner geometry
 */
interface CornerTransformation {
  point: Vector2D;
  normal: Vector2D;
  incoming: Vector2D;
  outgoing: Vector2D;
}

/**
 * CornerNormals: Calculates normal vectors and trapezoid geometry for trains at corners
 * Per spec FR-013, trains must render as trapezoids when turning at corners
 * with continuous transformation through consecutive corners
 */
export class CornerNormals {
  /**
   * Calculate the normal vector for a corner between two track segments.
   * The normal is perpendicular to the bisector of the incoming and outgoing directions.
   *
   * @param incoming - Incoming direction vector (will be normalized)
   * @param outgoing - Outgoing direction vector (will be normalized)
   * @returns Normalized normal vector
   */
  calculateNormal(incoming: Vector2D, outgoing: Vector2D): Vector2D {
    // Normalize input vectors
    const inNorm = this.normalize(incoming);
    const outNorm = this.normalize(outgoing);

    // Calculate bisector (average direction)
    const bisectorX = inNorm.x + outNorm.x;
    const bisectorY = inNorm.y + outNorm.y;

    // Handle straight path (vectors are parallel or opposite)
    if (Math.abs(bisectorX) < 0.0001 && Math.abs(bisectorY) < 0.0001) {
      // Return perpendicular to incoming direction
      return { x: -inNorm.y, y: inNorm.x };
    }

    // Normal is perpendicular to bisector (rotate 90 degrees clockwise)
    const normal = { x: bisectorY, y: -bisectorX };

    return this.normalize(normal);
  }

  /**
   * Calculate the four corner points of a trapezoid representing a train at a corner.
   *
   * @param cornerPoint - The position of the corner
   * @param trainLength - Length of the train in meters
   * @param trainWidth - Width of the train in meters
   * @param incoming - Incoming direction vector
   * @param outgoing - Outgoing direction vector
   * @returns Array of 4 points forming the trapezoid (in clockwise order)
   */
  calculateTrapezoidPoints(
    cornerPoint: Vector2D,
    trainLength: number,
    trainWidth: number,
    incoming: Vector2D,
    outgoing: Vector2D,
  ): Vector2D[] {
    const inNorm = this.normalize(incoming);
    const outNorm = this.normalize(outgoing);

    // Calculate perpendicular vectors for width offset
    const inPerp = { x: -inNorm.y, y: inNorm.x };
    const outPerp = { x: -outNorm.y, y: outNorm.x };

    // Back edge of train (along incoming direction)
    const backCenter = {
      x: cornerPoint.x - inNorm.x * (trainLength / 2),
      y: cornerPoint.y - inNorm.y * (trainLength / 2),
    };

    // Front edge of train (along outgoing direction)
    const frontCenter = {
      x: cornerPoint.x + outNorm.x * (trainLength / 2),
      y: cornerPoint.y + outNorm.y * (trainLength / 2),
    };

    // Calculate four corners of trapezoid
    const halfWidth = trainWidth / 2;

    return [
      {
        x: backCenter.x - inPerp.x * halfWidth,
        y: backCenter.y - inPerp.y * halfWidth,
      },
      {
        x: backCenter.x + inPerp.x * halfWidth,
        y: backCenter.y + inPerp.y * halfWidth,
      },
      {
        x: frontCenter.x + outPerp.x * halfWidth,
        y: frontCenter.y + outPerp.y * halfWidth,
      },
      {
        x: frontCenter.x - outPerp.x * halfWidth,
        y: frontCenter.y - outPerp.y * halfWidth,
      },
    ];
  }

  /**
   * Chain corner transformations through multiple consecutive corners.
   * Per spec FR-013, transformations must chain continuously without snapping back to rectangles.
   *
   * @param corners - Array of corner information
   * @returns Array of transformations for each corner
   */
  chainCornerTransformations(corners: CornerInfo[]): CornerTransformation[] {
    if (corners.length === 0) {
      return [];
    }

    const transformations: CornerTransformation[] = [];

    for (const corner of corners) {
      const normal = this.calculateNormal(corner.incoming, corner.outgoing);

      transformations.push({
        point: corner.point,
        normal,
        incoming: this.normalize(corner.incoming),
        outgoing: this.normalize(corner.outgoing),
      });
    }

    return transformations;
  }

  /**
   * Normalize a vector to unit length.
   *
   * @param v - Vector to normalize
   * @returns Normalized vector
   */
  private normalize(v: Vector2D): Vector2D {
    const length = Math.sqrt(v.x * v.x + v.y * v.y);

    if (length === 0) {
      return { x: 0, y: 0 };
    }

    return {
      x: v.x / length,
      y: v.y / length,
    };
  }

  /**
   * Calculate the angle between two vectors in radians.
   *
   * @param v1 - First vector
   * @param v2 - Second vector
   * @returns Angle in radians
   */
  calculateAngle(v1: Vector2D, v2: Vector2D): number {
    const dot = v1.x * v2.x + v1.y * v2.y;
    const det = v1.x * v2.y - v1.y * v2.x;
    return Math.atan2(det, dot);
  }
}
