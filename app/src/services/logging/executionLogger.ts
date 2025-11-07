import type { ScheduledTrainModel } from '../../models/ScheduledTrain';

/**
 * Execution log entry
 */
export interface ExecutionLogEntry {
  timestamp: number;
  simulationTime: number;
  type: 'train_start' | 'train_arrive' | 'train_depart' | 'train_stop' | 'conflict' | 'error';
  trainId?: string;
  stationId?: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Service for logging execution events and maintaining event history.
 * Provides structured logging for simulation playback and debugging.
 */
export class ExecutionLogger {
  private logs: ExecutionLogEntry[] = [];
  private maxLogSize = 10000; // Maximum number of log entries to keep

  /**
   * Log a train start event.
   */
  logTrainStart(trainId: string, simulationTime: number): void {
    this.addLog({
      timestamp: Date.now(),
      simulationTime,
      type: 'train_start',
      trainId,
      message: `Train ${trainId} started`,
    });
  }

  /**
   * Log a train arrival event.
   */
  logTrainArrival(trainId: string, stationId: string, simulationTime: number): void {
    this.addLog({
      timestamp: Date.now(),
      simulationTime,
      type: 'train_arrive',
      trainId,
      stationId,
      message: `Train ${trainId} arrived at station ${stationId}`,
    });
  }

  /**
   * Log a train departure event.
   */
  logTrainDeparture(trainId: string, stationId: string, simulationTime: number): void {
    this.addLog({
      timestamp: Date.now(),
      simulationTime,
      type: 'train_depart',
      trainId,
      stationId,
      message: `Train ${trainId} departed from station ${stationId}`,
    });
  }

  /**
   * Log a train stop event (emergency or conflict).
   */
  logTrainStop(trainId: string, reason: string, simulationTime: number): void {
    this.addLog({
      timestamp: Date.now(),
      simulationTime,
      type: 'train_stop',
      trainId,
      message: `Train ${trainId} stopped: ${reason}`,
      details: { reason },
    });
  }

  /**
   * Log a conflict event.
   */
  logConflict(
    trainIds: string[],
    stationId: string,
    simulationTime: number,
    details: string,
  ): void {
    this.addLog({
      timestamp: Date.now(),
      simulationTime,
      type: 'conflict',
      stationId,
      message: `Conflict at station ${stationId}: ${details}`,
      details: { trainIds, conflictDetails: details },
    });
  }

  /**
   * Log an error event.
   */
  logError(message: string, simulationTime: number, details?: Record<string, unknown>): void {
    this.addLog({
      timestamp: Date.now(),
      simulationTime,
      type: 'error',
      message,
      details,
    });
  }

  /**
   * Get all logs.
   */
  getLogs(): ExecutionLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by type.
   */
  getLogsByType(type: ExecutionLogEntry['type']): ExecutionLogEntry[] {
    return this.logs.filter((log) => log.type === type);
  }

  /**
   * Get logs for a specific train.
   */
  getLogsForTrain(trainId: string): ExecutionLogEntry[] {
    return this.logs.filter((log) => log.trainId === trainId);
  }

  /**
   * Get logs for a specific station.
   */
  getLogsForStation(stationId: string): ExecutionLogEntry[] {
    return this.logs.filter((log) => log.stationId === stationId);
  }

  /**
   * Get logs within a time range.
   */
  getLogsInTimeRange(startTime: number, endTime: number): ExecutionLogEntry[] {
    return this.logs.filter(
      (log) => log.simulationTime >= startTime && log.simulationTime <= endTime,
    );
  }

  /**
   * Clear all logs.
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON string.
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get summary statistics from logs.
   */
  getLogSummary(): {
    total: number;
    byType: Record<string, number>;
    trainCount: number;
    stationCount: number;
  } {
    const byType: Record<string, number> = {};
    const trains = new Set<string>();
    const stations = new Set<string>();

    for (const log of this.logs) {
      byType[log.type] = (byType[log.type] || 0) + 1;
      if (log.trainId) trains.add(log.trainId);
      if (log.stationId) stations.add(log.stationId);
    }

    return {
      total: this.logs.length,
      byType,
      trainCount: trains.size,
      stationCount: stations.size,
    };
  }

  private addLog(entry: ExecutionLogEntry): void {
    this.logs.push(entry);

    // Trim logs if exceeding max size (keep most recent)
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize);
    }
  }
}
