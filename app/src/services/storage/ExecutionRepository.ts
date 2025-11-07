import Dexie from 'dexie';
import type { ScheduledTrainModel } from '../../models/ScheduledTrain';

/**
 * Execution state snapshot for replay capability
 */
export interface ExecutionSnapshot {
  id: string;
  executionId: string;
  routeId: string;
  seed: number;
  simulationTime: number;
  trainStates: TrainState[];
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Train state at a point in time
 */
export interface TrainState {
  trainId: string;
  position: {
    segmentId: string;
    progress: number;
    x: number;
    y: number;
    elevation: number;
  };
  speed: number;
  status: 'running' | 'stopped' | 'dwelling' | 'completed';
  currentStationId?: string;
}

/**
 * Repository for persisting execution state for replay capability.
 * Uses IndexedDB via Dexie for storage.
 */
export class ExecutionRepository {
  private db: Dexie;
  private snapshots: Dexie.Table<ExecutionSnapshot, string>;

  constructor(db?: Dexie) {
    this.db = db || new Dexie('ExecutionDB');

    // Define schema if not already defined
    if (!this.db.isOpen()) {
      this.db.version(1).stores({
        snapshots: 'id, executionId, routeId, timestamp, simulationTime',
      });
    }

    this.snapshots = this.db.table('snapshots');
  }

  /**
   * Save an execution snapshot.
   */
  async saveSnapshot(snapshot: ExecutionSnapshot): Promise<void> {
    await this.snapshots.put(snapshot);
  }

  /**
   * Get a specific snapshot by ID.
   */
  async getSnapshot(id: string): Promise<ExecutionSnapshot | undefined> {
    return await this.snapshots.get(id);
  }

  /**
   * Get all snapshots for an execution.
   */
  async getSnapshotsForExecution(executionId: string): Promise<ExecutionSnapshot[]> {
    return await this.snapshots.where('executionId').equals(executionId).sortBy('simulationTime');
  }

  /**
   * Get snapshot at specific simulation time.
   */
  async getSnapshotAtTime(
    executionId: string,
    simulationTime: number,
  ): Promise<ExecutionSnapshot | undefined> {
    const snapshots = await this.snapshots
      .where('executionId')
      .equals(executionId)
      .and((s) => s.simulationTime <= simulationTime)
      .reverse()
      .sortBy('simulationTime');

    return snapshots[0];
  }

  /**
   * Get the latest snapshot for an execution.
   */
  async getLatestSnapshot(executionId: string): Promise<ExecutionSnapshot | undefined> {
    const snapshots = await this.snapshots
      .where('executionId')
      .equals(executionId)
      .reverse()
      .sortBy('simulationTime');

    return snapshots[0];
  }

  /**
   * Delete all snapshots for an execution.
   */
  async deleteExecutionSnapshots(executionId: string): Promise<void> {
    await this.snapshots.where('executionId').equals(executionId).delete();
  }

  /**
   * Delete old snapshots (older than specified timestamp).
   */
  async deleteOldSnapshots(beforeTimestamp: number): Promise<void> {
    await this.snapshots.where('timestamp').below(beforeTimestamp).delete();
  }

  /**
   * Get total number of snapshots stored.
   */
  async getSnapshotCount(): Promise<number> {
    return await this.snapshots.count();
  }

  /**
   * Get storage statistics.
   */
  async getStorageStats(): Promise<{
    totalSnapshots: number;
    executionCount: number;
    oldestSnapshot?: number;
    newestSnapshot?: number;
  }> {
    const totalSnapshots = await this.snapshots.count();

    if (totalSnapshots === 0) {
      return {
        totalSnapshots: 0,
        executionCount: 0,
      };
    }

    const executions = new Set<string>();
    const allSnapshots = await this.snapshots.toArray();

    let oldestTimestamp: number | undefined;
    let newestTimestamp: number | undefined;

    for (const snapshot of allSnapshots) {
      executions.add(snapshot.executionId);

      if (!oldestTimestamp || snapshot.timestamp < oldestTimestamp) {
        oldestTimestamp = snapshot.timestamp;
      }

      if (!newestTimestamp || snapshot.timestamp > newestTimestamp) {
        newestTimestamp = snapshot.timestamp;
      }
    }

    return {
      totalSnapshots,
      executionCount: executions.size,
      oldestSnapshot: oldestTimestamp,
      newestSnapshot: newestTimestamp,
    };
  }

  /**
   * Clear all execution data.
   */
  async clearAll(): Promise<void> {
    await this.snapshots.clear();
  }

  /**
   * Create a new snapshot from current execution state.
   */
  createSnapshot(
    executionId: string,
    routeId: string,
    seed: number,
    simulationTime: number,
    trainStates: TrainState[],
  ): ExecutionSnapshot {
    return {
      id: `${executionId}_${simulationTime}`,
      executionId,
      routeId,
      seed,
      simulationTime,
      trainStates: trainStates.map((ts) => ({ ...ts })), // Deep copy
      timestamp: Date.now(),
    };
  }
}
