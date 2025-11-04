import { create } from 'zustand';
import type { ScheduledTrainEntity } from '../services/storage/db';

export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface TrainPosition {
  trainId: string;
  x: number;
  y: number;
  rotation: number;
  segmentId: string | null;
  progress: number; // 0-1 along current segment
}

export interface ExecutionState {
  // Execution control
  status: ExecutionStatus;
  setStatus: (status: ExecutionStatus) => void;

  // Time control
  currentTime: number; // Simulation time in seconds
  timeScale: number; // Speed multiplier (0.1x to 5x)
  setCurrentTime: (time: number) => void;
  setTimeScale: (scale: number) => void;

  // Scheduled trains
  scheduledTrains: Map<string, ScheduledTrainEntity>;
  setScheduledTrains: (trains: ScheduledTrainEntity[]) => void;

  // Train positions
  trainPositions: Map<string, TrainPosition>;
  updateTrainPosition: (trainId: string, position: TrainPosition) => void;

  // Conflicts
  conflicts: Array<{
    id: string;
    type: 'overlap' | 'capacity';
    trainIds: string[];
    location: string;
    time: number;
  }>;
  setConflicts: (conflicts: ExecutionState['conflicts']) => void;

  // Seed for deterministic simulation
  seed: number;
  setSeed: (seed: number) => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  status: 'idle',
  setStatus: (status) => set({ status }),

  currentTime: 0,
  timeScale: 1.0,
  setCurrentTime: (time) => set({ currentTime: time }),
  setTimeScale: (scale) => set({ timeScale: Math.max(0.1, Math.min(5.0, scale)) }),

  scheduledTrains: new Map(),
  setScheduledTrains: (trains) => set({ scheduledTrains: new Map(trains.map((t) => [t.id, t])) }),

  trainPositions: new Map(),
  updateTrainPosition: (trainId, position) =>
    set((state) => {
      const newPositions = new Map(state.trainPositions);
      newPositions.set(trainId, position);
      return { trainPositions: newPositions };
    }),

  conflicts: [],
  setConflicts: (conflicts) => set({ conflicts }),

  seed: Date.now(),
  setSeed: (seed) => set({ seed }),
}));
