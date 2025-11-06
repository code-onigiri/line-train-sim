import { type AddonRegistration, AddonService } from './addons/AddonService';
import { RouteService } from './diagram/RouteService';
import {
  type ExecutionAck,
  type ExecutionRequest,
  ExecutionService,
} from './execution/ExecutionService';
import {
  type PreviewOptions,
  type PreviewResponse,
  PreviewService,
} from './execution/PreviewService';
import { DepotService } from './placement/DepotService';
import { LandmarkService } from './placement/LandmarkService';
import { StationService } from './placement/StationService';
import { TrackSegmentService } from './placement/TrackSegmentService';

import type { AddonModel } from '../models/Addon';
import type { DepotModel } from '../models/Depot';
import type { LandmarkModel } from '../models/Landmark';
import type { RouteModel } from '../models/Route';
import type { StationModel } from '../models/Station';
import type { TrackSegmentModel } from '../models/TrackSegment';

/**
 * Unified client service implementing the OpenAPI contract.
 * Provides a facade over all domain services and orchestrates operations
 * for placement mode, diagram configuration, execution preview, and addon management.
 *
 * This service implements the operations defined in client-service.openapi.yaml
 */
export class ClientService {
  private landmarkService: LandmarkService;
  private trackService: TrackSegmentService;
  private stationService: StationService;
  private depotService: DepotService;
  private routeService: RouteService;
  private previewService: PreviewService;
  private executionService: ExecutionService;
  private addonService: AddonService;

  constructor() {
    this.landmarkService = new LandmarkService();
    this.trackService = new TrackSegmentService(this.landmarkService);
    this.stationService = new StationService();
    this.depotService = new DepotService();
    this.routeService = new RouteService();
    this.previewService = new PreviewService();
    this.executionService = new ExecutionService();
    this.addonService = new AddonService();
  }

  // ============================================================================
  // Landmark Operations (POST /landmarks)
  // ============================================================================

  /**
   * Create a new landmark on the placement canvas.
   * Implements: POST /landmarks (operationId: createLandmark)
   *
   * @param input - Landmark creation parameters
   * @returns Created landmark with generated ID and connections
   */
  createLandmark(input: {
    position: { x: number; y: number };
    elevation: 'ground' | 'elevated' | 'underground';
    metadata?: { label?: string; source?: string };
  }): LandmarkModel {
    // Convert elevation enum to numeric meters
    const elevationMeters = this.convertElevationToMeters(input.elevation);

    return this.landmarkService.create(
      input.position.x,
      input.position.y,
      elevationMeters,
      input.metadata ?? {},
    );
  }

  // ============================================================================
  // Track Segment Operations (POST /tracks)
  // ============================================================================

  /**
   * Connect two landmarks with a straight track segment.
   * Implements: POST /tracks (operationId: createTrackSegment)
   *
   * @param input - Track segment creation parameters
   * @returns Created track segment with auto-generated intersections when needed
   */
  createTrackSegment(input: {
    startLandmarkId: string;
    endLandmarkId: string;
    classification: 'mainline' | 'station' | 'depot';
    permissibleSpeedKph: number;
    elevation: 'ground' | 'elevated' | 'underground';
    isBidirectional?: boolean;
  }): TrackSegmentModel {
    const elevationMeters = this.convertElevationToMeters(input.elevation);

    return this.trackService.create(
      input.startLandmarkId,
      input.endLandmarkId,
      input.classification,
      input.permissibleSpeedKph,
      elevationMeters,
      input.isBidirectional ?? true,
    );
  }

  // ============================================================================
  // Station Operations (POST /stations, PATCH /stations)
  // ============================================================================

  /**
   * Register a station area with platforms and stopping tracks.
   * Implements: POST /stations (operationId: createStation)
   *
   * @param input - Station creation parameters
   * @returns Created station with generated ID
   */
  createStation(input: {
    name: string;
    areaPolygon: Array<{ x: number; y: number }>;
    platforms: Array<{ id: string; name: string; lengthMeters: number }>;
    stoppingTracks: Array<{ trackSegmentId: string; capacity: number }>;
    landmarkEntrances: string[];
    diagramOrderIndex?: number;
  }): StationModel {
    // Create base station
    let station = this.stationService.create(input.name, input.areaPolygon);

    // Add platforms
    for (const platform of input.platforms) {
      station = this.stationService.addPlatform(station.id, platform.id);
    }

    // Add stopping tracks
    for (const track of input.stoppingTracks) {
      station = this.stationService.addStoppingTrack(station.id, track.trackSegmentId);
    }

    // Add landmark entrances
    for (const landmarkId of input.landmarkEntrances) {
      station = this.stationService.addLandmarkEntrance(station.id, landmarkId);
    }

    // Set diagram order if provided
    if (input.diagramOrderIndex !== undefined) {
      const updated = this.stationService.update(station.id, {
        diagramOrderIndex: input.diagramOrderIndex,
      });
      if (updated) {
        station = updated;
      }
    }

    return station;
  }

  /**
   * Update station geometry or platform definitions.
   * Implements: PATCH /stations (operationId: updateStation)
   *
   * @param input - Station update parameters
   * @returns Updated station
   */
  updateStation(input: {
    id: string;
    name?: string;
    areaPolygon?: Array<{ x: number; y: number }>;
    platforms?: Array<{ id: string; name: string; lengthMeters: number }>;
    stoppingTracks?: Array<{ trackSegmentId: string; capacity: number }>;
    landmarkEntrances?: string[];
    diagramOrderIndex?: number;
  }): StationModel | undefined {
    const { id, ...updates } = input;
    return this.stationService.update(id, updates);
  }

  // ============================================================================
  // Depot Operations (POST /depots, PATCH /depots)
  // ============================================================================

  /**
   * Create a depot area with stopping lanes and inventory.
   * Implements: POST /depots (operationId: createDepot)
   *
   * @param input - Depot creation parameters
   * @returns Created depot with generated ID
   */
  createDepot(input: {
    name: string;
    areaPolygon: Array<{ x: number; y: number }>;
    stoppingLanes: Array<{ trackSegmentId: string; capacity: number }>;
    serviceTracks: string[];
    inventory?: Array<{ vehicleTypeId: string; quantity: number }>;
  }): DepotModel {
    // Create base depot
    let depot = this.depotService.create(input.name, input.areaPolygon);

    // Add stopping lanes
    for (const lane of input.stoppingLanes) {
      depot = this.depotService.addStoppingLane(depot.id, lane.trackSegmentId);
    }

    // Add service tracks
    for (const trackId of input.serviceTracks) {
      depot = this.depotService.addServiceTrack(depot.id, trackId);
    }

    // Add inventory if provided
    if (input.inventory) {
      for (const item of input.inventory) {
        depot = this.depotService.addInventory(depot.id, item.vehicleTypeId, item.quantity);
      }
    }

    return depot;
  }

  /**
   * Change depot inventory, lanes, or service tracks.
   * Implements: PATCH /depots (operationId: updateDepot)
   *
   * @param input - Depot update parameters
   * @returns Updated depot
   */
  updateDepot(input: {
    id: string;
    areaPolygon?: Array<{ x: number; y: number }>;
    stoppingLanes?: Array<{ trackSegmentId: string; capacity: number }>;
    serviceTracks?: string[];
    inventory?: Array<{ vehicleTypeId: string; quantity: number }>;
  }): DepotModel | undefined {
    const { id, inventory, stoppingLanes, serviceTracks, ...basicUpdates } = input;

    // First update basic properties
    let depot = this.depotService.update(id, basicUpdates);
    if (!depot) {
      return undefined;
    }

    // Handle inventory updates if provided
    if (inventory) {
      for (const item of inventory) {
        depot = this.depotService.addInventory(depot.id, item.vehicleTypeId, item.quantity);
      }
    }

    // TODO: Handle stoppingLanes and serviceTracks updates
    // These would require clearing existing and adding new ones

    return depot;
  }

  // ============================================================================
  // Route Operations (POST /routes, PATCH /routes)
  // ============================================================================

  /**
   * Define a route with ordered stops and consist templates.
   * Implements: POST /routes (operationId: createRoute)
   *
   * @param input - Route creation parameters
   * @returns Created route with validation results
   */
  createRoute(input: {
    name: string;
    stops: Array<{
      entityId: string;
      type: 'station' | 'depot';
      dwellTemplate?: { minSeconds?: number; maxSeconds?: number };
    }>;
    diagramSettings: {
      horizontalAxis: 'time';
      verticalAxis: 'stations';
      stationOrder?: string[];
    };
    consistTemplates: Array<{ id: string; vehicleTypeId: string; carCount: number }>;
    timeScale?: number;
  }): RouteModel {
    // Map the stops format
    const stops = input.stops.map((stop) => ({
      entityId: stop.entityId,
      entityType: stop.type,
    }));

    // Convert consist templates to string IDs for now
    const consistTemplates = input.consistTemplates.map((ct) => ct.id);

    const route = this.routeService.create(
      input.name,
      stops,
      input.diagramSettings,
      consistTemplates,
      input.timeScale ?? 1.0,
    );

    // Validate the route
    const validation = this.routeService.validateRoute(route);
    if (!validation.valid) {
      throw new Error(`Route validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for loops
    const loopCheck = this.routeService.detectLoop(route);
    if (loopCheck.hasLoop) {
      console.warn(`Route contains a loop at station: ${loopCheck.loopingStationId}`);
    }

    return route;
  }

  /**
   * Modify stops, diagram settings, or consist templates.
   * Implements: PATCH /routes (operationId: updateRoute)
   *
   * @param input - Route update parameters
   * @returns Updated route
   */
  updateRoute(input: {
    id: string;
    stops?: Array<{ entityId: string; type: 'station' | 'depot' }>;
    diagramSettings?: Record<string, unknown>;
    consistTemplates?: Array<{ id: string; vehicleTypeId: string; carCount: number }>;
    timeScale?: number;
  }): RouteModel | undefined {
    const { id, stops, consistTemplates, ...otherUpdates } = input;

    // Map the updates format
    const updates: Record<string, unknown> = { ...otherUpdates };
    if (stops) {
      updates.stops = stops.map((stop) => ({
        entityId: stop.entityId,
        entityType: stop.type,
      }));
    }
    if (consistTemplates) {
      updates.consistTemplates = consistTemplates.map((ct) => ct.id);
    }

    const updated = this.routeService.update(id, updates);

    // Validate updated route
    if (updated) {
      const validation = this.routeService.validateRoute(updated);
      if (!validation.valid) {
        throw new Error(`Route validation failed: ${validation.errors.join(', ')}`);
      }
    }

    return updated;
  }

  // ============================================================================
  // Preview Operations (POST /preview)
  // ============================================================================

  /**
   * Produce timetable preview including conflict validation results.
   * Implements: POST /preview (operationId: generatePreview)
   *
   * @param input - Preview generation parameters
   * @returns Preview with validation outcomes
   */
  generatePreview(input: {
    routeId: string;
    seed?: number;
    options?: PreviewOptions;
  }): PreviewResponse {
    const route = this.routeService.get(input.routeId);
    if (!route) {
      throw new Error(`Route not found: ${input.routeId}`);
    }

    // Validate route before preview
    const validation = this.routeService.validateRoute(route);
    if (!validation.valid) {
      throw new Error(`Cannot generate preview for invalid route: ${validation.errors.join(', ')}`);
    }

    // Check for loops and prevent execution if found
    const loopCheck = this.routeService.detectLoop(route);
    if (loopCheck.hasLoop) {
      throw new Error(
        `Cannot generate preview for route with loop at station: ${loopCheck.loopingStationId}`,
      );
    }

    return this.previewService.generatePreview(route, input.seed, input.options ?? {});
  }

  // ============================================================================
  // Execution Operations (POST /execution)
  // ============================================================================

  /**
   * Begin execution mode playback using the validated timetable.
   * Implements: POST /execution (operationId: runExecution)
   *
   * @param input - Execution request parameters
   * @returns Execution acknowledgment with seed for deterministic playback
   */
  runExecution(input: ExecutionRequest): ExecutionAck {
    const route = this.routeService.get(input.routeId);
    if (!route) {
      throw new Error(`Route not found: ${input.routeId}`);
    }

    // Validate route before execution
    const validation = this.routeService.validateRoute(route);
    if (!validation.valid) {
      throw new Error(`Cannot execute invalid route: ${validation.errors.join(', ')}`);
    }

    // Check for loops and prevent execution if found
    const loopCheck = this.routeService.detectLoop(route);
    if (loopCheck.hasLoop) {
      throw new Error(`Cannot execute route with loop at station: ${loopCheck.loopingStationId}`);
    }

    return this.executionService.startExecution(input);
  }

  // ============================================================================
  // Addon Operations (POST /addons/register)
  // ============================================================================

  /**
   * Load an add-on package and enable its sandboxed event hooks.
   * Implements: POST /addons/register (operationId: registerAddon)
   *
   * @param input - Addon registration parameters
   * @returns Registered addon with permitted hooks
   */
  registerAddon(input: AddonRegistration): AddonModel {
    return this.addonService.register(input);
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Convert elevation enum to numeric meters.
   * Per spec: ground = 0m, elevated = +10m, underground = -10m
   */
  private convertElevationToMeters(elevation: 'ground' | 'elevated' | 'underground'): number {
    switch (elevation) {
      case 'ground':
        return 0;
      case 'elevated':
        return 10;
      case 'underground':
        return -10;
      default:
        return 0;
    }
  }

  // ============================================================================
  // Service Accessors (for testing and advanced usage)
  // ============================================================================

  getLandmarkService(): LandmarkService {
    return this.landmarkService;
  }

  getTrackService(): TrackSegmentService {
    return this.trackService;
  }

  getStationService(): StationService {
    return this.stationService;
  }

  getDepotService(): DepotService {
    return this.depotService;
  }

  getRouteService(): RouteService {
    return this.routeService;
  }

  getPreviewService(): PreviewService {
    return this.previewService;
  }

  getExecutionService(): ExecutionService {
    return this.executionService;
  }

  getAddonService(): AddonService {
    return this.addonService;
  }
}
