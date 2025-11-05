import Dexie, { type EntityTable } from 'dexie';
import { error as logError } from '../logging/logger';

// Database entities
export interface LandmarkEntity {
  id: string;
  x: number;
  y: number;
  elevation: number;
  connections: string[];
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface TrackSegmentEntity {
  id: string;
  startLandmarkId: string;
  endLandmarkId: string;
  classification: 'mainline' | 'station' | 'depot';
  isBidirectional: boolean;
  permissibleSpeedKph: number;
  elevation: number;
  addons: string[];
  createdAt: number;
  updatedAt: number;
}

export interface StationEntity {
  id: string;
  name: string;
  areaPolygon: Array<{ x: number; y: number }>;
  platforms: string[];
  stoppingTracks: string[];
  landmarkEntrances: string[];
  diagramOrderIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface DepotEntity {
  id: string;
  name: string;
  areaPolygon: Array<{ x: number; y: number }>;
  stoppingLanes: string[];
  serviceTracks: string[];
  inventory: Array<{ vehicleTypeId: string; quantity: number }>;
  createdAt: number;
  updatedAt: number;
}

export interface RouteEntity {
  id: string;
  name: string;
  stops: Array<{ entityId: string; entityType: 'station' | 'depot' }>;
  diagramSettings: Record<string, unknown>;
  consistTemplates: string[];
  timeScale: number;
  createdAt: number;
  updatedAt: number;
}

export interface VehicleTypeEntity {
  id: string;
  name: string;
  speedCategory: 'slow' | 'standard' | 'fast';
  maxSpeedKph: number;
  capacity: number;
  lengthMeters: number;
  createdAt: number;
  updatedAt: number;
}

export interface ScheduledTrainEntity {
  id: string;
  routeId: string;
  consistId: string;
  departureTime: number;
  dwellAssignments: Array<{
    stopId: string;
    trackId: string;
    arrivalTime: number;
    departureTime: number;
  }>;
  seed: number;
  createdAt: number;
  updatedAt: number;
}

export interface AddonEntity {
  id: string;
  name: string;
  version: string;
  eventHooks: Array<{ event: string; handler: string }>;
  assets: Array<{ type: string; path: string }>;
  permissions: string[];
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * IndexedDB database for train simulation persistence
 * Provides type-safe access to all entity tables with error handling
 */
class PlacementSimDB extends Dexie {
  landmarks!: EntityTable<LandmarkEntity, 'id'>;
  trackSegments!: EntityTable<TrackSegmentEntity, 'id'>;
  stations!: EntityTable<StationEntity, 'id'>;
  depots!: EntityTable<DepotEntity, 'id'>;
  routes!: EntityTable<RouteEntity, 'id'>;
  vehicleTypes!: EntityTable<VehicleTypeEntity, 'id'>;
  scheduledTrains!: EntityTable<ScheduledTrainEntity, 'id'>;
  addons!: EntityTable<AddonEntity, 'id'>;

  constructor() {
    super('placementSimDB');

    this.version(1).stores({
      landmarks: 'id, elevation, createdAt',
      trackSegments: 'id, startLandmarkId, endLandmarkId, classification, createdAt',
      stations: 'id, name, diagramOrderIndex, createdAt',
      depots: 'id, name, createdAt',
      routes: 'id, name, createdAt',
      vehicleTypes: 'id, name, speedCategory, createdAt',
      scheduledTrains: 'id, routeId, departureTime, createdAt',
      addons: 'id, name, enabled, createdAt',
    });

    // Setup error handling
    this.on('ready', () => {
      console.info('PlacementSimDB initialized successfully');
    });

    this.on('blocked', () => {
      logError('Database upgrade blocked by another tab');
    });
  }
}

// Export singleton instance
export const db = new PlacementSimDB();

/**
 * Safe database operation wrapper with error handling
 * @param operation - Database operation to execute
 * @param errorMessage - Error message prefix for logging
 * @returns Result of operation or null on error
 */
export async function safeDatabaseOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string,
): Promise<T | null> {
  try {
    return await operation();
  } catch (err) {
    logError(errorMessage, err instanceof Error ? err : undefined, {
      operation: operation.name,
    });
    return null;
  }
}
