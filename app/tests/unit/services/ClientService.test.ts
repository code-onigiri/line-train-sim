import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { ClientService } from '../../../src/services/ClientService';

describe('ClientService', () => {
  let clientService: ClientService;

  beforeEach(() => {
    clientService = new ClientService();
  });

  describe('Landmark Operations', () => {
    it('should create a landmark', () => {
      const landmark = clientService.createLandmark({
        position: { x: 100, y: 200 },
        elevation: 'ground',
        metadata: { label: 'Test Landmark' },
      });

      expect(landmark).toBeDefined();
      expect(landmark.x).toBe(100);
      expect(landmark.y).toBe(200);
    });

    it('should convert elevation to meters', () => {
      const groundLandmark = clientService.createLandmark({
        position: { x: 0, y: 0 },
        elevation: 'ground',
      });
      expect(groundLandmark.elevationMeters).toBe(0);

      const elevatedLandmark = clientService.createLandmark({
        position: { x: 0, y: 0 },
        elevation: 'elevated',
      });
      expect(elevatedLandmark.elevationMeters).toBe(10);

      const undergroundLandmark = clientService.createLandmark({
        position: { x: 0, y: 0 },
        elevation: 'underground',
      });
      expect(undergroundLandmark.elevationMeters).toBe(-10);
    });
  });

  describe('Track Segment Operations', () => {
    it('should create a track segment', () => {
      const landmark1 = clientService.createLandmark({
        position: { x: 0, y: 0 },
        elevation: 'ground',
      });
      const landmark2 = clientService.createLandmark({
        position: { x: 100, y: 100 },
        elevation: 'ground',
      });

      const track = clientService.createTrackSegment({
        startLandmarkId: landmark1.id,
        endLandmarkId: landmark2.id,
        classification: 'mainline',
        permissibleSpeedKph: 100,
        elevation: 'ground',
        isBidirectional: true,
      });

      expect(track).toBeDefined();
      expect(track.startLandmarkId).toBe(landmark1.id);
      expect(track.endLandmarkId).toBe(landmark2.id);
    });
  });

  describe('Station Operations', () => {
    it('should create a station', () => {
      const platformId = uuidv4();
      const trackId = uuidv4();
      const landmarkId = uuidv4();

      const station = clientService.createStation({
        name: 'Test Station',
        areaPolygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
        platforms: [{ id: platformId, name: 'Platform 1', lengthMeters: 200 }],
        stoppingTracks: [{ trackSegmentId: trackId, capacity: 2 }],
        landmarkEntrances: [landmarkId],
      });

      expect(station).toBeDefined();
      expect(station.name).toBe('Test Station');
      expect(station.platforms).toHaveLength(1);
    });

    it('should update a station', () => {
      const station = clientService.createStation({
        name: 'Original Station',
        areaPolygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
        platforms: [],
        stoppingTracks: [],
        landmarkEntrances: [],
      });

      const updated = clientService.updateStation({
        id: station.id,
        name: 'Updated Station',
      });

      expect(updated?.name).toBe('Updated Station');
    });
  });

  describe('Depot Operations', () => {
    it('should create a depot', () => {
      const trackId1 = uuidv4();
      const trackId2 = uuidv4();
      const vehicleId = uuidv4();

      const depot = clientService.createDepot({
        name: 'Test Depot',
        areaPolygon: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 200 },
        ],
        stoppingLanes: [{ trackSegmentId: trackId1, capacity: 5 }],
        serviceTracks: [trackId2],
        inventory: [{ vehicleTypeId: vehicleId, quantity: 10 }],
      });

      expect(depot).toBeDefined();
      expect(depot.name).toBe('Test Depot');
      expect(depot.inventory).toHaveLength(1);
    });

    it('should update a depot', () => {
      const depot = clientService.createDepot({
        name: 'Original Depot',
        areaPolygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
        stoppingLanes: [],
        serviceTracks: [],
      });

      const vehicleId = uuidv4();
      const updated = clientService.updateDepot({
        id: depot.id,
        inventory: [{ vehicleTypeId: vehicleId, quantity: 5 }],
      });

      expect(updated?.inventory).toHaveLength(1);
    });
  });

  describe('Route Operations', () => {
    it('should create a valid route', () => {
      const stationId1 = uuidv4();
      const stationId2 = uuidv4();
      const consistId = uuidv4();
      const vehicleId = uuidv4();

      const route = clientService.createRoute({
        name: 'Test Route',
        stops: [
          { entityId: stationId1, type: 'station' },
          { entityId: stationId2, type: 'station' },
        ],
        diagramSettings: {
          horizontalAxis: 'time',
          verticalAxis: 'stations',
        },
        consistTemplates: [{ id: consistId, vehicleTypeId: vehicleId, carCount: 6 }],
      });

      expect(route).toBeDefined();
      expect(route.name).toBe('Test Route');
      expect(route.stops).toHaveLength(2);
    });

    it('should throw error for invalid route with less than 2 stops', () => {
      const stationId = uuidv4();

      expect(() => {
        clientService.createRoute({
          name: 'Invalid Route',
          stops: [{ entityId: stationId, type: 'station' }],
          diagramSettings: {
            horizontalAxis: 'time',
            verticalAxis: 'stations',
          },
          consistTemplates: [],
        });
      }).toThrow();
    });

    it('should allow creating route with loop but log warning', () => {
      const stationId1 = uuidv4();
      const stationId2 = uuidv4();

      // Loop detection should warn but not prevent creation
      const route = clientService.createRoute({
        name: 'Loop Route',
        stops: [
          { entityId: stationId1, type: 'station' },
          { entityId: stationId2, type: 'station' },
          { entityId: stationId1, type: 'station' },
        ],
        diagramSettings: {
          horizontalAxis: 'time',
          verticalAxis: 'stations',
        },
        consistTemplates: [],
      });

      expect(route).toBeDefined();
      expect(route.stops).toHaveLength(3);
    });

    it('should update a route', () => {
      const stationId1 = uuidv4();
      const stationId2 = uuidv4();

      const route = clientService.createRoute({
        name: 'Original Route',
        stops: [
          { entityId: stationId1, type: 'station' },
          { entityId: stationId2, type: 'station' },
        ],
        diagramSettings: {
          horizontalAxis: 'time',
          verticalAxis: 'stations',
        },
        consistTemplates: [],
      });

      const updated = clientService.updateRoute({
        id: route.id,
        timeScale: 2.0,
      });

      expect(updated?.timeScale).toBe(2.0);
    });
  });

  describe('Preview Operations', () => {
    it('should generate preview for valid route', () => {
      const stationId1 = uuidv4();
      const stationId2 = uuidv4();

      const route = clientService.createRoute({
        name: 'Test Route',
        stops: [
          { entityId: stationId1, type: 'station' },
          { entityId: stationId2, type: 'station' },
        ],
        diagramSettings: {
          horizontalAxis: 'time',
          verticalAxis: 'stations',
        },
        consistTemplates: [],
      });

      const preview = clientService.generatePreview({
        routeId: route.id,
        seed: 12345,
      });

      expect(preview).toBeDefined();
      expect(preview.conflicts).toBeDefined();
      expect(preview.scheduledTrains).toBeDefined();
    });

    it('should throw error for non-existent route', () => {
      expect(() => {
        clientService.generatePreview({
          routeId: 'non-existent-route',
        });
      }).toThrow(/not found/);
    });

    it('should throw error for route with loop', () => {
      const stationId1 = uuidv4();
      const stationId2 = uuidv4();

      const route = clientService.getRouteService().create(
        'Loop Route',
        [
          { entityId: stationId1, entityType: 'station' },
          { entityId: stationId2, entityType: 'station' },
          { entityId: stationId1, entityType: 'station' },
        ],
        {},
        [],
      );

      expect(() => {
        clientService.generatePreview({
          routeId: route.id,
        });
      }).toThrow(/loop/);
    });
  });

  describe('Execution Operations', () => {
    it('should start execution for valid route', () => {
      const stationId1 = uuidv4();
      const stationId2 = uuidv4();

      const route = clientService.createRoute({
        name: 'Test Route',
        stops: [
          { entityId: stationId1, type: 'station' },
          { entityId: stationId2, type: 'station' },
        ],
        diagramSettings: {
          horizontalAxis: 'time',
          verticalAxis: 'stations',
        },
        consistTemplates: [],
      });

      const execution = clientService.runExecution({
        routeId: route.id,
        previewSeed: 12345,
        timeScale: 1.0,
      });

      expect(execution).toBeDefined();
      expect(execution.executionId).toBeDefined();
      expect(execution.seed).toBe(12345);
    });

    it('should throw error for non-existent route', () => {
      expect(() => {
        clientService.runExecution({
          routeId: 'non-existent-route',
          previewSeed: 12345,
          timeScale: 1.0,
        });
      }).toThrow(/not found/);
    });
  });

  describe('Addon Operations', () => {
    it('should register an addon', () => {
      const addonId = uuidv4();
      const handlerId = uuidv4();

      const addon = clientService.registerAddon({
        id: addonId,
        version: '1.0.0',
        permissions: ['asset-read', 'event-hooks'],
        hooks: [{ event: 'onPlacementReady', handlerId }],
      });

      expect(addon).toBeDefined();
      expect(addon.id).toBe(addonId);
    });

    it('should throw error for prohibited permissions', () => {
      const addonId = uuidv4();

      expect(() => {
        clientService.registerAddon({
          id: addonId,
          version: '1.0.0',
          permissions: ['network-access'],
          hooks: [],
        });
      }).toThrow(/Prohibited permission/);
    });

    it('should throw error for unapproved event hooks', () => {
      const addonId = uuidv4();
      const handlerId = uuidv4();

      expect(() => {
        clientService.registerAddon({
          id: addonId,
          version: '1.0.0',
          permissions: ['event-hooks'],
          hooks: [{ event: 'onSystemBoot', handlerId }],
        });
      }).toThrow(/Unapproved event hook/);
    });
  });
});
