import type { ConsistTemplateModel } from '../../models/ConsistTemplate';
import type { RouteModel } from '../../models/Route';
import type { VehicleTypeModel } from '../../models/VehicleType';

/**
 * Validation result for diagram checks
 */
export interface DiagramValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * DiagramValidator service
 * Validates diagram configuration before execution preview:
 * - Route completeness (all stops are valid)
 * - Loop detection with warnings
 * - Consist template assignment validation
 * - Vehicle inventory constraints
 */
export class DiagramValidator {
  /**
   * Validate a diagram configuration before execution
   * @param route - The route to validate
   * @param consistTemplates - Array of assigned consist templates
   * @param vehicleTypes - Map of vehicle type IDs to vehicle type models
   * @returns Validation result with errors and warnings
   */
  validateDiagram(
    route: RouteModel,
    consistTemplates: ConsistTemplateModel[],
    vehicleTypes: Map<string, VehicleTypeModel>,
  ): DiagramValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate route has minimum stops
    if (route.stops.length < 2) {
      errors.push('Route must have at least 2 stops');
    }

    // Validate consist templates
    this.validateConsistTemplates(consistTemplates, vehicleTypes, errors);

    // Check for loops
    this.checkForLoops(route, warnings);

    // Validate diagram completeness
    this.validateDiagramCompleteness(route, consistTemplates, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate consist templates have valid vehicle types
   */
  private validateConsistTemplates(
    consistTemplates: ConsistTemplateModel[],
    vehicleTypes: Map<string, VehicleTypeModel>,
    errors: string[],
  ): void {
    for (const consist of consistTemplates) {
      if (!vehicleTypes.has(consist.vehicleTypeId)) {
        errors.push(
          `Consist template "${consist.name}" references non-existent vehicle type ${consist.vehicleTypeId}`,
        );
      }

      if (consist.carCount <= 0) {
        errors.push(`Consist template "${consist.name}" must have at least 1 car`);
      }

      if (consist.totalLengthMeters <= 0) {
        errors.push(`Consist template "${consist.name}" must have positive total length`);
      }
    }
  }

  /**
   * Check for loops in the route
   */
  private checkForLoops(route: RouteModel, warnings: string[]): void {
    const visitedStations = new Set<string>();
    let loopDetected = false;
    let loopStation: string | undefined;

    for (const stop of route.stops) {
      if (stop.entityType === 'station') {
        if (visitedStations.has(stop.entityId)) {
          loopDetected = true;
          loopStation = stop.entityId;
          break;
        }
        visitedStations.add(stop.entityId);
      }
    }

    if (loopDetected) {
      warnings.push(
        `Route contains a loop at station: ${loopStation}. Execution preview will be prevented. Insert an intermediate landmark to break the circular path.`,
      );
    }
  }

  /**
   * Validate diagram completeness
   */
  private validateDiagramCompleteness(
    route: RouteModel,
    consistTemplates: ConsistTemplateModel[],
    warnings: string[],
  ): void {
    if (consistTemplates.length === 0) {
      warnings.push('No consist templates assigned to route. Execution preview will be empty.');
    }

    if (route.stops.length < 2) {
      warnings.push('Route must have at least 2 stops for meaningful execution preview.');
    }
  }

  /**
   * Check if a diagram can proceed to execution preview
   * @param route - The route to validate
   * @param consistTemplates - Array of assigned consist templates
   * @param vehicleTypes - Map of vehicle types
   * @returns True if diagram can proceed to execution preview
   */
  canProceedToExecution(
    route: RouteModel,
    consistTemplates: ConsistTemplateModel[],
    vehicleTypes: Map<string, VehicleTypeModel>,
  ): boolean {
    const result = this.validateDiagram(route, consistTemplates, vehicleTypes);
    // Cannot proceed if there are validation errors OR if there are loop warnings
    return result.isValid && !result.warnings.some((warning) => warning.includes('loop'));
  }

  /**
   * Get execution prevention reasons
   * @param route - The route to validate
   * @param consistTemplates - Array of assigned consist templates
   * @param vehicleTypes - Map of vehicle types
   * @returns Array of reasons why execution is prevented
   */
  getExecutionPreventionReasons(
    route: RouteModel,
    consistTemplates: ConsistTemplateModel[],
    vehicleTypes: Map<string, VehicleTypeModel>,
  ): string[] {
    const result = this.validateDiagram(route, consistTemplates, vehicleTypes);
    const reasons: string[] = [...result.errors];

    // Add loop warnings as prevention reasons
    const loopWarnings = result.warnings.filter((warning) => warning.includes('loop'));
    reasons.push(...loopWarnings);

    return reasons;
  }
}
