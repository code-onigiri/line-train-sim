import type { RouteModel } from '../../models/Route';

/**
 * Execution request parameters
 */
export interface ExecutionRequest {
  routeId: string;
  previewSeed: number;
  timeScale: number;
  overrides?: {
    timeScale?: number;
    skipConflicts?: boolean;
  };
}

/**
 * Execution acknowledgment response
 */
export interface ExecutionAck {
  executionId: string;
  seed: number;
}

/**
 * Service for managing execution mode playback.
 * Handles time-scaled simulation and deterministic execution.
 */
export class ExecutionService {
  private activeExecutions: Map<string, ExecutionState> = new Map();

  /**
   * Start execution mode for a route.
   * @param request - Execution configuration
   */
  startExecution(request: ExecutionRequest): ExecutionAck {
    const executionId = this.generateExecutionId();
    const seed = request.previewSeed;

    const state: ExecutionState = {
      executionId,
      routeId: request.routeId,
      seed,
      timeScale: request.overrides?.timeScale ?? request.timeScale,
      skipConflicts: request.overrides?.skipConflicts ?? false,
      startTime: Date.now(),
      isPaused: false,
      simulationTime: 0,
    };

    this.activeExecutions.set(executionId, state);

    return {
      executionId,
      seed,
    };
  }

  /**
   * Get execution state by ID.
   */
  getExecution(executionId: string): ExecutionState | undefined {
    return this.activeExecutions.get(executionId);
  }

  /**
   * Update time scale for an active execution.
   */
  updateTimeScale(executionId: string, timeScale: number): boolean {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return false;
    }

    execution.timeScale = timeScale;
    return true;
  }

  /**
   * Pause an active execution.
   */
  pauseExecution(executionId: string): boolean {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return false;
    }

    execution.isPaused = true;
    return true;
  }

  /**
   * Resume a paused execution.
   */
  resumeExecution(executionId: string): boolean {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return false;
    }

    execution.isPaused = false;
    return true;
  }

  /**
   * Stop an active execution.
   */
  stopExecution(executionId: string): boolean {
    return this.activeExecutions.delete(executionId);
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Internal state for an active execution
 */
interface ExecutionState {
  executionId: string;
  routeId: string;
  seed: number;
  timeScale: number;
  skipConflicts: boolean;
  startTime: number;
  isPaused: boolean;
  simulationTime: number;
}
