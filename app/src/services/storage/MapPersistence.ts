import type { DepotModel } from '../../models/Depot';
import type { LandmarkModel } from '../../models/Landmark';
import type { StationModel } from '../../models/Station';
import type { TrackSegmentModel } from '../../models/TrackSegment';
import { info, error as logError } from '../logging/logger';
import { DepotRepository } from './DepotRepository';
import { LandmarkRepository } from './LandmarkRepository';
import { StationRepository } from './StationRepository';
import { TrackRepository } from './TrackRepository';

/**
 * Complete map state including all infrastructure
 */
export interface MapState {
  landmarks: LandmarkModel[];
  trackSegments: TrackSegmentModel[];
  stations: StationModel[];
  depots: DepotModel[];
  metadata: {
    name?: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
    version: number;
  };
}

/**
 * Result of save/load operations
 */
export interface PersistenceResult {
  success: boolean;
  message: string;
  itemCount?: number;
}

/**
 * Handles complete map state persistence (save/load) using repositories
 * Provides atomic operations for complete infrastructure snapshots
 */
export class MapPersistence {
  private landmarkRepo: LandmarkRepository;
  private trackRepo: TrackRepository;
  private stationRepo: StationRepository;
  private depotRepo: DepotRepository;

  constructor() {
    this.landmarkRepo = new LandmarkRepository();
    this.trackRepo = new TrackRepository();
    this.stationRepo = new StationRepository();
    this.depotRepo = new DepotRepository();
  }

  /**
   * Save complete map state to IndexedDB
   * Saves all landmarks, tracks, stations, and depots
   * @param state - Complete map state to save
   * @returns Result indicating success or failure
   */
  async saveMap(state: MapState): Promise<PersistenceResult> {
    try {
      info('Saving map state', { itemCount: this.countItems(state) });

      // Save in dependency order: landmarks first, then tracks, then stations/depots
      const landmarkCount = await this.landmarkRepo.saveBatch(state.landmarks);
      const trackCount = await this.trackRepo.saveBatch(state.trackSegments);
      const stationCount = await this.stationRepo.saveBatch(state.stations);
      const depotCount = await this.depotRepo.saveBatch(state.depots);

      const totalCount = landmarkCount + trackCount + stationCount + depotCount;

      info('Map state saved successfully', {
        landmarks: landmarkCount,
        tracks: trackCount,
        stations: stationCount,
        depots: depotCount,
        total: totalCount,
      });

      return {
        success: true,
        message: `Saved ${totalCount} items successfully`,
        itemCount: totalCount,
      };
    } catch (err) {
      logError('Failed to save map state', err instanceof Error ? err : undefined);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        itemCount: 0,
      };
    }
  }

  /**
   * Load complete map state from IndexedDB
   * @returns Map state or null if loading fails
   */
  async loadMap(): Promise<MapState | null> {
    try {
      info('Loading map state from database');

      const landmarks = await this.landmarkRepo.getAll();
      const trackSegments = await this.trackRepo.getAll();
      const stations = await this.stationRepo.getAll();
      const depots = await this.depotRepo.getAll();

      // Convert entities back to models
      // Note: This is a simplified conversion. In production, you'd want proper
      // factory methods to reconstruct model instances from entities.
      const landmarkModels = landmarks.map(
        (entity) =>
          ({
            id: entity.id,
            x: entity.x,
            y: entity.y,
            elevationMeters: entity.elevationMeters,
            connections: entity.connections,
            metadata: entity.metadata,
          }) as unknown as LandmarkModel,
      );

      const trackModels = trackSegments.map(
        (entity) =>
          ({
            id: entity.id,
            startLandmarkId: entity.startLandmarkId,
            endLandmarkId: entity.endLandmarkId,
            classification: entity.classification,
            isBidirectional: entity.isBidirectional,
            permissibleSpeedKph: entity.permissibleSpeedKph,
            slopePercent: entity.slopePercent,
            addons: entity.addons,
          }) as unknown as TrackSegmentModel,
      );

      const stationModels = stations.map(
        (entity) =>
          ({
            id: entity.id,
            name: entity.name,
            areaPolygon: entity.areaPolygon,
            platforms: entity.platforms,
            stoppingTracks: entity.stoppingTracks,
            landmarkEntrances: entity.landmarkEntrances,
            diagramOrderIndex: entity.diagramOrderIndex,
          }) as unknown as StationModel,
      );

      const depotModels = depots.map(
        (entity) =>
          ({
            id: entity.id,
            name: entity.name,
            areaPolygon: entity.areaPolygon,
            stoppingLanes: entity.stoppingLanes,
            serviceTracks: entity.serviceTracks,
            inventory: entity.inventory,
          }) as unknown as DepotModel,
      );

      const mapState: MapState = {
        landmarks: landmarkModels,
        trackSegments: trackModels,
        stations: stationModels,
        depots: depotModels,
        metadata: {
          name: 'Loaded Map',
          description: 'Map loaded from database',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: 1,
        },
      };

      info('Map state loaded successfully', {
        landmarks: landmarkModels.length,
        tracks: trackModels.length,
        stations: stationModels.length,
        depots: depotModels.length,
      });

      return mapState;
    } catch (err) {
      logError('Failed to load map state', err instanceof Error ? err : undefined);
      return null;
    }
  }

  /**
   * Clear all map data from database
   * @returns Result indicating success or failure
   */
  async clearMap(): Promise<PersistenceResult> {
    try {
      info('Clearing all map data');

      // Delete in reverse dependency order
      const depotCount = await this.depotRepo.deleteAll();
      const stationCount = await this.stationRepo.deleteAll();
      const trackCount = await this.trackRepo.deleteAll();
      const landmarkCount = await this.landmarkRepo.deleteAll();

      const totalCount = landmarkCount + trackCount + stationCount + depotCount;

      info('Map data cleared successfully', {
        landmarks: landmarkCount,
        tracks: trackCount,
        stations: stationCount,
        depots: depotCount,
        total: totalCount,
      });

      return {
        success: true,
        message: `Cleared ${totalCount} items`,
        itemCount: totalCount,
      };
    } catch (err) {
      logError('Failed to clear map data', err instanceof Error ? err : undefined);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        itemCount: 0,
      };
    }
  }

  /**
   * Export map state as JSON string
   * @param state - Map state to export
   * @returns JSON string representation
   */
  exportToJSON(state: MapState): string {
    return JSON.stringify(state, null, 2);
  }

  /**
   * Import map state from JSON string
   * @param json - JSON string to parse
   * @returns Parsed map state or null if invalid
   */
  importFromJSON(json: string): MapState | null {
    try {
      const parsed = JSON.parse(json);

      // Basic validation
      if (
        !parsed.landmarks ||
        !parsed.trackSegments ||
        !parsed.stations ||
        !parsed.depots ||
        !parsed.metadata
      ) {
        throw new Error('Invalid map state format');
      }

      return parsed as MapState;
    } catch (err) {
      logError('Failed to import map from JSON', err instanceof Error ? err : undefined);
      return null;
    }
  }

  /**
   * Check if database has any map data
   * @returns True if database contains map data
   */
  async hasMapData(): Promise<boolean> {
    const landmarkCount = await this.landmarkRepo.count();
    const trackCount = await this.trackRepo.count();
    const stationCount = await this.stationRepo.count();
    const depotCount = await this.depotRepo.count();

    return landmarkCount > 0 || trackCount > 0 || stationCount > 0 || depotCount > 0;
  }

  /**
   * Get map statistics
   * @returns Statistics about current map data
   */
  async getMapStatistics(): Promise<{
    landmarks: number;
    tracks: number;
    stations: number;
    depots: number;
    total: number;
  }> {
    const landmarks = await this.landmarkRepo.count();
    const tracks = await this.trackRepo.count();
    const stations = await this.stationRepo.count();
    const depots = await this.depotRepo.count();

    return {
      landmarks,
      tracks,
      stations,
      depots,
      total: landmarks + tracks + stations + depots,
    };
  }

  /**
   * Count total items in map state
   */
  private countItems(state: MapState): number {
    return (
      state.landmarks.length +
      state.trackSegments.length +
      state.stations.length +
      state.depots.length
    );
  }
}
