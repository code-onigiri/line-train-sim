import { create } from 'zustand';
import type { RouteEntity, VehicleTypeEntity } from '../services/storage/db';

export interface DiagramState {
  // Current route
  currentRoute: RouteEntity | null;
  setCurrentRoute: (route: RouteEntity | null) => void;

  // Diagram configuration
  stationOrder: Array<{ id: string; name: string; type: 'station' | 'depot' }>;
  setStationOrder: (order: DiagramState['stationOrder']) => void;

  // Time axis
  timeRange: { start: number; end: number };
  setTimeRange: (range: DiagramState['timeRange']) => void;

  // Vehicle types
  vehicleTypes: Map<string, VehicleTypeEntity>;
  setVehicleTypes: (types: VehicleTypeEntity[]) => void;

  // Consist templates
  consistTemplates: Array<{
    id: string;
    name: string;
    vehicles: Array<{ vehicleTypeId: string; count: number }>;
  }>;
  setConsistTemplates: (templates: DiagramState['consistTemplates']) => void;

  // Preview state
  previewGenerated: boolean;
  setPreviewGenerated: (generated: boolean) => void;
}

export const useDiagramStore = create<DiagramState>((set) => ({
  currentRoute: null,
  setCurrentRoute: (route) => set({ currentRoute: route }),

  stationOrder: [],
  setStationOrder: (order) => set({ stationOrder: order }),

  timeRange: { start: 0, end: 86400 }, // Default: 24 hours in seconds
  setTimeRange: (range) => set({ timeRange: range }),

  vehicleTypes: new Map(),
  setVehicleTypes: (types) => set({ vehicleTypes: new Map(types.map((t) => [t.id, t])) }),

  consistTemplates: [],
  setConsistTemplates: (templates) => set({ consistTemplates: templates }),

  previewGenerated: false,
  setPreviewGenerated: (generated) => set({ previewGenerated: generated }),
}));
