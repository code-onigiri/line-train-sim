/**
 * DwellAssignment: Represents a scheduled stop for a train at a specific track
 * Per spec FR-011, tracks need to validate capacity and prevent overlapping dwells
 */
export interface DwellAssignment {
  trainId: string;
  stopId: string;
  trackId: string;
  arrivalTime: number; // Simulation time in seconds
  departureTime: number; // Simulation time in seconds
  trainLength?: number; // Optional train length in cars for capacity validation
}

/**
 * Conflict: Represents a validation conflict in the execution preview
 * Per spec FR-011, conflicts prevent execution until resolved
 */
export interface Conflict {
  type: 'DWELL_OVERLAP' | 'CAPACITY_EXCEEDED' | 'ROUTE_INCOMPLETE' | 'INVALID_SCHEDULE';
  locationId: string; // ID of the track, station, or landmark where conflict occurs
  message: string; // Human-readable description of the conflict
  trainIds?: string[]; // IDs of trains involved in the conflict
  severity: 'ERROR' | 'WARNING';
}

/**
 * ExecutionState: Represents the current state of an execution session
 */
export interface ExecutionState {
  executionId: string;
  routeId: string;
  seed: number;
  timeScale: number;
  skipConflicts: boolean;
  startTime: number;
  isPaused: boolean;
  simulationTime: number;
}

/**
 * TrainState: Represents the runtime state of a train during execution
 */
export interface TrainState {
  trainId: string;
  currentSegmentId: string;
  position: { x: number; y: number };
  distanceAlongSegment: number; // meters
  speed: number; // m/s
  heading: number; // radians
}
