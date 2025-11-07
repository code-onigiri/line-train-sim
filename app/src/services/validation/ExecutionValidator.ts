import type { RouteModel } from '../../models/Route';
import type { ScheduledTrainModel } from '../../models/ScheduledTrain';
import { CapacityValidator } from '../validation/CapacityValidator';
import { ConflictDetector } from '../validation/ConflictDetector';

/**
 * Validation result for execution preview
 */
export interface ExecutionValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  type: 'route_incomplete' | 'conflict_detected' | 'capacity_exceeded' | 'invalid_schedule';
  message: string;
  trainId?: string;
  stationId?: string;
  details?: Record<string, unknown>;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  type: 'tight_schedule' | 'high_utilization' | 'performance_concern';
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Service for validating execution preview before playback.
 * Ensures timetable is conflict-free and meets capacity constraints.
 */
export class ExecutionValidator {
  private conflictDetector = new ConflictDetector();
  private capacityValidator = new CapacityValidator();

  /**
   * Validate an execution preview before starting playback.
   * @param route - The route to validate
   * @param scheduledTrains - Scheduled trains for the route
   */
  async validateExecution(
    route: RouteModel,
    scheduledTrains: ScheduledTrainModel[],
  ): Promise<ExecutionValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate route completeness
    if (!route.startPoint || !route.endPoint) {
      errors.push({
        type: 'route_incomplete',
        message: 'Route must have both start and end points',
      });
    }

    if (!route.stops || route.stops.length === 0) {
      errors.push({
        type: 'route_incomplete',
        message: 'Route must have at least one stop',
      });
    }

    // Validate scheduled trains
    for (const train of scheduledTrains) {
      if (!train.dwellAssignments || train.dwellAssignments.length === 0) {
        errors.push({
          type: 'invalid_schedule',
          message: `Train ${train.id} has no dwell assignments`,
          trainId: train.id,
        });
      }
    }

    // Check for conflicts using ConflictDetector
    const conflicts = await this.conflictDetector.detectConflicts(scheduledTrains);
    for (const conflict of conflicts) {
      errors.push({
        type: 'conflict_detected',
        message: `Conflict detected at station ${conflict.stationId}: ${conflict.trainIds.join(', ')}`,
        stationId: conflict.stationId,
        details: { conflict },
      });
    }

    // Check capacity constraints using CapacityValidator
    const capacityIssues = await this.capacityValidator.validateCapacity(route, scheduledTrains);
    for (const issue of capacityIssues) {
      errors.push({
        type: 'capacity_exceeded',
        message: issue.message,
        stationId: issue.stationId,
        details: { issue },
      });
    }

    // Add warnings for tight schedules
    this.checkForTightSchedules(scheduledTrains, warnings);

    // Add warnings for high station utilization
    this.checkStationUtilization(route, scheduledTrains, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Quick validation check (synchronous, less thorough)
   */
  quickValidate(route: RouteModel, scheduledTrains: ScheduledTrainModel[]): boolean {
    if (!route.startPoint || !route.endPoint) {
      return false;
    }

    if (!route.stops || route.stops.length === 0) {
      return false;
    }

    if (scheduledTrains.length === 0) {
      return false;
    }

    return true;
  }

  private checkForTightSchedules(
    scheduledTrains: ScheduledTrainModel[],
    warnings: ValidationWarning[],
  ): void {
    // Check for trains with very short dwell times
    for (const train of scheduledTrains) {
      if (train.dwellAssignments) {
        for (const dwell of train.dwellAssignments) {
          const dwellDuration = dwell.departureTime - dwell.arrivalTime;
          if (dwellDuration < 60) {
            // Less than 60 seconds
            warnings.push({
              type: 'tight_schedule',
              message: `Train ${train.id} has very short dwell time (${dwellDuration}s) at a station`,
              details: { trainId: train.id, dwellDuration },
            });
          }
        }
      }
    }
  }

  private checkStationUtilization(
    _route: RouteModel,
    scheduledTrains: ScheduledTrainModel[],
    warnings: ValidationWarning[],
  ): void {
    // Warn if many trains are scheduled (potential performance concern)
    if (scheduledTrains.length > 50) {
      warnings.push({
        type: 'performance_concern',
        message: `High number of scheduled trains (${scheduledTrains.length}). Performance may be impacted.`,
        details: { trainCount: scheduledTrains.length },
      });
    }
  }
}
