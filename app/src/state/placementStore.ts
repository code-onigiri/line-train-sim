import { create } from 'zustand';
import type {
  DepotEntity,
  LandmarkEntity,
  StationEntity,
  TrackSegmentEntity,
} from '../services/storage/db';

export type PlacementTool = 'select' | 'landmark' | 'track' | 'station' | 'depot' | 'pan';

export interface PlacementState {
  // Current tool
  activeTool: PlacementTool;
  setActiveTool: (tool: PlacementTool) => void;

  // Selection
  selectedLandmarks: string[];
  selectedTracks: string[];
  selectedStations: string[];
  selectedDepots: string[];
  selectLandmark: (id: string, multi?: boolean) => void;
  selectTrack: (id: string, multi?: boolean) => void;
  selectStation: (id: string, multi?: boolean) => void;
  selectDepot: (id: string, multi?: boolean) => void;
  clearSelection: () => void;

  // Viewport
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  setViewport: (viewport: Partial<PlacementState['viewport']>) => void;

  // Entities cache
  landmarks: Map<string, LandmarkEntity>;
  tracks: Map<string, TrackSegmentEntity>;
  stations: Map<string, StationEntity>;
  depots: Map<string, DepotEntity>;
  setLandmarks: (landmarks: LandmarkEntity[]) => void;
  setTracks: (tracks: TrackSegmentEntity[]) => void;
  setStations: (stations: StationEntity[]) => void;
  setDepots: (depots: DepotEntity[]) => void;

  // Drawing state
  drawingInProgress: boolean;
  drawingStartPoint: { x: number; y: number } | null;
  setDrawingInProgress: (inProgress: boolean) => void;
  setDrawingStartPoint: (point: { x: number; y: number } | null) => void;
}

export const usePlacementStore = create<PlacementState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),

  selectedLandmarks: [],
  selectedTracks: [],
  selectedStations: [],
  selectedDepots: [],
  selectLandmark: (id, multi = false) =>
    set((state) => ({
      selectedLandmarks: multi
        ? state.selectedLandmarks.includes(id)
          ? state.selectedLandmarks.filter((i) => i !== id)
          : [...state.selectedLandmarks, id]
        : [id],
    })),
  selectTrack: (id, multi = false) =>
    set((state) => ({
      selectedTracks: multi
        ? state.selectedTracks.includes(id)
          ? state.selectedTracks.filter((i) => i !== id)
          : [...state.selectedTracks, id]
        : [id],
    })),
  selectStation: (id, multi = false) =>
    set((state) => ({
      selectedStations: multi
        ? state.selectedStations.includes(id)
          ? state.selectedStations.filter((i) => i !== id)
          : [...state.selectedStations, id]
        : [id],
    })),
  selectDepot: (id, multi = false) =>
    set((state) => ({
      selectedDepots: multi
        ? state.selectedDepots.includes(id)
          ? state.selectedDepots.filter((i) => i !== id)
          : [...state.selectedDepots, id]
        : [id],
    })),
  clearSelection: () =>
    set({
      selectedLandmarks: [],
      selectedTracks: [],
      selectedStations: [],
      selectedDepots: [],
    }),

  viewport: { x: 0, y: 0, zoom: 1 },
  setViewport: (viewport) => set((state) => ({ viewport: { ...state.viewport, ...viewport } })),

  landmarks: new Map(),
  tracks: new Map(),
  stations: new Map(),
  depots: new Map(),
  setLandmarks: (landmarks) => set({ landmarks: new Map(landmarks.map((l) => [l.id, l])) }),
  setTracks: (tracks) => set({ tracks: new Map(tracks.map((t) => [t.id, t])) }),
  setStations: (stations) => set({ stations: new Map(stations.map((s) => [s.id, s])) }),
  setDepots: (depots) => set({ depots: new Map(depots.map((d) => [d.id, d])) }),

  drawingInProgress: false,
  drawingStartPoint: null,
  setDrawingInProgress: (inProgress) => set({ drawingInProgress: inProgress }),
  setDrawingStartPoint: (point) => set({ drawingStartPoint: point }),
}));
