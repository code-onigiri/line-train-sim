/**
 * SpeedProfile: Defines acceleration, deceleration, and max speed for a vehicle
 * Per spec FR-012, trains must respect speed profiles and smoothly accelerate/decelerate
 */
export interface SpeedProfile {
  maxSpeed: number; // km/h
  acceleration: number; // m/s²
  deceleration: number; // m/s²
}

/**
 * TrackSegment: Minimal segment info needed for position calculation
 */
interface SegmentInfo {
  id: string;
  startLandmarkId: string;
  endLandmarkId: string;
  length: number; // meters
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

/**
 * TrainMovement: Calculates train positions and speeds during execution
 * Per spec FR-012, trains must follow speed profiles with realistic physics
 */
export class TrainMovement {
  /**
   * Calculate the 2D position of a train on a track segment.
   * 
   * @param segment - The track segment
   * @param distanceAlongSegment - Distance traveled along the segment in meters
   * @param offset - Perpendicular offset from track centerline
   * @returns The x,y position
   */
  calculatePosition(
    segment: SegmentInfo,
    distanceAlongSegment: number,
    offset = 0,
  ): { x: number; y: number } {
    // Clamp distance to segment bounds
    const distance = Math.max(0, Math.min(segment.length, distanceAlongSegment));
    
    // Calculate position ratio along segment
    const ratio = segment.length > 0 ? distance / segment.length : 0;

    // Linear interpolation
    const x = segment.startPoint.x + (segment.endPoint.x - segment.startPoint.x) * ratio;
    const y = segment.startPoint.y + (segment.endPoint.y - segment.startPoint.y) * ratio;

    // Apply perpendicular offset if needed
    if (offset !== 0) {
      const dx = segment.endPoint.x - segment.startPoint.x;
      const dy = segment.endPoint.y - segment.startPoint.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        // Perpendicular vector (rotate 90 degrees)
        const perpX = -dy / length;
        const perpY = dx / length;
        
        return {
          x: x + perpX * offset,
          y: y + perpY * offset,
        };
      }
    }

    return { x, y };
  }

  /**
   * Calculate the speed of a train given current state and speed profile.
   * Applies acceleration/deceleration based on distance to next stop.
   * 
   * @param currentSpeed - Current speed in m/s
   * @param distanceToStop - Distance to next stop in meters
   * @param profile - Speed profile with max speed and acceleration rates
   * @param deltaTime - Time step in seconds
   * @returns New speed in m/s
   */
  calculateSpeed(
    currentSpeed: number,
    distanceToStop: number,
    profile: SpeedProfile,
    deltaTime: number,
  ): number {
    // Convert max speed from km/h to m/s
    const maxSpeedMs = profile.maxSpeed / 3.6;

    // If exactly at stop location, remain stopped
    if (distanceToStop === 0) {
      return 0;
    }

    // If distance to stop is unknown or infinite, just accelerate
    if (!Number.isFinite(distanceToStop) || distanceToStop < 0) {
      return Math.min(maxSpeedMs, currentSpeed + profile.acceleration * deltaTime);
    }

    // Calculate stopping distance needed at current speed
    const stoppingDistance = (currentSpeed * currentSpeed) / (2 * profile.deceleration);

    // Decide whether to accelerate or decelerate
    let newSpeed: number;

    if (distanceToStop <= stoppingDistance) {
      // Need to decelerate to stop in time
      newSpeed = Math.max(0, currentSpeed - profile.deceleration * deltaTime);
    } else if (currentSpeed < maxSpeedMs) {
      // Can accelerate
      newSpeed = Math.min(
        maxSpeedMs,
        currentSpeed + profile.acceleration * deltaTime,
      );
    } else {
      // Maintain current speed
      newSpeed = currentSpeed;
    }

    return newSpeed;
  }

  /**
   * Calculate total travel time for a given distance using a speed profile.
   * Accounts for acceleration and deceleration phases.
   * 
   * @param distance - Total distance to travel in meters
   * @param profile - Speed profile
   * @returns Estimated travel time in seconds
   */
  calculateTravelTime(distance: number, profile: SpeedProfile): number {
    if (distance <= 0) {
      return 0;
    }

    const maxSpeedMs = profile.maxSpeed / 3.6;

    // Handle zero acceleration/deceleration (instant speed changes)
    if (profile.acceleration === 0 || profile.deceleration === 0) {
      // Just use constant speed
      return distance / maxSpeedMs;
    }

    // Time to reach max speed
    const accelTime = maxSpeedMs / profile.acceleration;
    const accelDistance = 0.5 * profile.acceleration * accelTime * accelTime;

    // Time to decelerate from max speed
    const decelTime = maxSpeedMs / profile.deceleration;
    const decelDistance = 0.5 * profile.deceleration * decelTime * decelTime;

    // If distance is too short to reach max speed
    if (distance < accelDistance + decelDistance) {
      // Calculate peak speed achievable
      const peakSpeed = Math.sqrt(
        (2 * distance * profile.acceleration * profile.deceleration) /
          (profile.acceleration + profile.deceleration),
      );

      const timeToAccel = peakSpeed / profile.acceleration;
      const timeToDecel = peakSpeed / profile.deceleration;

      return timeToAccel + timeToDecel;
    }

    // Distance traveled at constant max speed
    const constantDistance = distance - accelDistance - decelDistance;
    const constantTime = constantDistance / maxSpeedMs;

    return accelTime + constantTime + decelTime;
  }

  /**
   * Calculate heading angle (direction) from a track segment.
   * 
   * @param segment - The track segment
   * @returns Heading angle in radians
   */
  calculateHeading(segment: SegmentInfo): number {
    const dx = segment.endPoint.x - segment.startPoint.x;
    const dy = segment.endPoint.y - segment.startPoint.y;
    return Math.atan2(dy, dx);
  }
}
