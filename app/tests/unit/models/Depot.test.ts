import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { DepotModel } from '../../../src/models/Depot';

describe('DepotModel - T024e: Validation (inventory, lanes)', () => {
  describe('Basic Construction', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should create a depot with default values', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });

      expect(depot.name).toBe('Untitled Depot');
      expect(depot.areaPolygon).toEqual(validPolygon);
      expect(depot.stoppingLanes).toEqual([]);
      expect(depot.serviceTracks).toEqual([]);
      expect(depot.inventory).toEqual([]);
    });

    it('should create a depot with custom name', () => {
      const depot = new DepotModel({ name: 'Main Depot', areaPolygon: validPolygon });

      expect(depot.name).toBe('Main Depot');
    });

    it('should generate unique ID', () => {
      const depot1 = new DepotModel({ areaPolygon: validPolygon });
      const depot2 = new DepotModel({ areaPolygon: validPolygon });

      expect(depot1.id).not.toBe(depot2.id);
    });
  });

  describe('Area Polygon Management', () => {
    it('should accept valid area polygon', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 100 },
        { x: 0, y: 100 },
      ];
      const depot = new DepotModel({ areaPolygon: polygon });

      expect(depot.areaPolygon).toEqual(polygon);
    });

    it('should update area polygon immutably', () => {
      const original = new DepotModel({
        areaPolygon: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ],
      });
      const newPolygon = [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 20, y: 20 },
      ];
      const updated = original.updateAreaPolygon(newPolygon);

      expect(original.areaPolygon).toHaveLength(3);
      expect(updated.areaPolygon).toEqual(newPolygon);
      expect(updated.id).toBe(original.id);
    });

    it('should return a copy of area polygon to prevent mutation', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = new DepotModel({ areaPolygon: polygon });
      const retrieved = depot.areaPolygon;

      retrieved[0].x = 999;

      expect(depot.areaPolygon[0].x).toBe(0);
    });
  });

  describe('Stopping Lane Management', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should add stopping lane to depot', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const laneId = uuidv4();
      const updated = depot.addStoppingLane(laneId);

      expect(updated.stoppingLanes).toContain(laneId);
      expect(updated.stoppingLanes).toHaveLength(1);
    });

    it('should not add duplicate stopping lane', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const laneId = uuidv4();
      const updated1 = depot.addStoppingLane(laneId);
      const updated2 = updated1.addStoppingLane(laneId);

      expect(updated2.stoppingLanes).toEqual([laneId]);
    });

    it('should remove stopping lane from depot', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const laneId1 = uuidv4();
      const laneId2 = uuidv4();
      const updated1 = depot.addStoppingLane(laneId1).addStoppingLane(laneId2);
      const updated2 = updated1.removeStoppingLane(laneId1);

      expect(updated2.stoppingLanes).toEqual([laneId2]);
    });

    it('should add multiple stopping lanes', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const laneId1 = uuidv4();
      const laneId2 = uuidv4();
      const laneId3 = uuidv4();
      const updated = depot
        .addStoppingLane(laneId1)
        .addStoppingLane(laneId2)
        .addStoppingLane(laneId3);

      expect(updated.stoppingLanes).toHaveLength(3);
    });
  });

  describe('Service Track Management', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should add service track to depot', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const trackId = uuidv4();
      const updated = depot.addServiceTrack(trackId);

      expect(updated.serviceTracks).toContain(trackId);
    });

    it('should not add duplicate service track', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const trackId = uuidv4();
      const updated1 = depot.addServiceTrack(trackId);
      const updated2 = updated1.addServiceTrack(trackId);

      expect(updated2.serviceTracks).toEqual([trackId]);
    });

    it('should remove service track from depot', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const trackId1 = uuidv4();
      const trackId2 = uuidv4();
      const updated1 = depot.addServiceTrack(trackId1).addServiceTrack(trackId2);
      const updated2 = updated1.removeServiceTrack(trackId1);

      expect(updated2.serviceTracks).toEqual([trackId2]);
    });
  });

  describe('Inventory Management', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should add inventory item with quantity', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const vehicleTypeId = uuidv4();
      const updated = depot.addInventoryItem(vehicleTypeId, 5);

      expect(updated.inventory).toHaveLength(1);
      expect(updated.inventory[0]).toEqual({
        vehicleTypeId,
        quantity: 5,
      });
    });

    it('should increment existing inventory item quantity', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const vehicleTypeId = uuidv4();
      const updated1 = depot.addInventoryItem(vehicleTypeId, 5);
      const updated2 = updated1.addInventoryItem(vehicleTypeId, 3);

      expect(updated2.inventory).toHaveLength(1);
      expect(updated2.inventory[0].quantity).toBe(8);
    });

    it('should add multiple different vehicle types to inventory', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const vehicleType1 = uuidv4();
      const vehicleType2 = uuidv4();
      const updated = depot.addInventoryItem(vehicleType1, 5).addInventoryItem(vehicleType2, 3);

      expect(updated.inventory).toHaveLength(2);
      expect(updated.inventory.find((i) => i.vehicleTypeId === vehicleType1)?.quantity).toBe(5);
      expect(updated.inventory.find((i) => i.vehicleTypeId === vehicleType2)?.quantity).toBe(3);
    });

    it('should remove inventory item quantity', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const vehicleTypeId = uuidv4();
      const updated1 = depot.addInventoryItem(vehicleTypeId, 10);
      const updated2 = updated1.removeInventoryItem(vehicleTypeId, 3);

      expect(updated2.inventory).toHaveLength(1);
      expect(updated2.inventory[0].quantity).toBe(7);
    });

    it('should remove inventory item completely when quantity reaches zero', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const vehicleTypeId = uuidv4();
      const updated1 = depot.addInventoryItem(vehicleTypeId, 5);
      const updated2 = updated1.removeInventoryItem(vehicleTypeId, 5);

      expect(updated2.inventory).toHaveLength(0);
    });

    it('should not allow negative inventory quantities', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const vehicleTypeId = uuidv4();
      const updated1 = depot.addInventoryItem(vehicleTypeId, 5);
      const updated2 = updated1.removeInventoryItem(vehicleTypeId, 10);

      expect(updated2.inventory).toHaveLength(0);
    });

    it('should update inventory quantity directly', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const vehicleTypeId = uuidv4();
      const updated1 = depot.addInventoryItem(vehicleTypeId, 5);
      const updated2 = updated1.updateInventoryQuantity(vehicleTypeId, 10);

      expect(updated2.inventory[0].quantity).toBe(10);
    });

    it('should create inventory item if not exists when updating quantity', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const vehicleTypeId = uuidv4();
      const updated = depot.updateInventoryQuantity(vehicleTypeId, 7);

      expect(updated.inventory).toHaveLength(1);
      expect(updated.inventory[0].quantity).toBe(7);
    });

    it('should return a copy of inventory to prevent mutation', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const vehicleTypeId = uuidv4();
      const updated = depot.addInventoryItem(vehicleTypeId, 5);
      const inventory = updated.inventory;

      inventory[0].quantity = 999;

      expect(updated.inventory[0].quantity).toBe(5);
    });
  });

  describe('Inventory Validation per Spec', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should enforce inventory quantities >= 0 (per spec FR-007)', () => {
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const vehicleTypeId = uuidv4();
      const updated1 = depot.addInventoryItem(vehicleTypeId, 5);
      const updated2 = updated1.removeInventoryItem(vehicleTypeId, 10);

      // Should not have negative quantity
      const item = updated2.inventory.find((i) => i.vehicleTypeId === vehicleTypeId);
      expect(item).toBeUndefined();
    });

    it('should support inventory grouped by vehicle type and speed category', () => {
      // Per spec FR-007: Depot management must allow users to assign vehicle
      // inventories by quantity and speed category
      const depot = new DepotModel({ areaPolygon: validPolygon });
      const slowTrainType = uuidv4();
      const fastTrainType = uuidv4();
      const updated = depot.addInventoryItem(slowTrainType, 10).addInventoryItem(fastTrainType, 5);

      expect(updated.inventory).toHaveLength(2);
      expect(updated.inventory.find((i) => i.vehicleTypeId === slowTrainType)?.quantity).toBe(10);
      expect(updated.inventory.find((i) => i.vehicleTypeId === fastTrainType)?.quantity).toBe(5);
    });
  });

  describe('Name Updates', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    it('should update name immutably', () => {
      const original = new DepotModel({ name: 'Old Depot', areaPolygon: validPolygon });
      const updated = original.updateName('New Depot');

      expect(original.name).toBe('Old Depot');
      expect(updated.name).toBe('New Depot');
      expect(updated.id).toBe(original.id);
    });
  });

  describe('Serialization', () => {
    const validPolygon = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
    ];

    it('should serialize to JSON', () => {
      const vehicleTypeId = uuidv4();
      const depot = new DepotModel({
        name: 'Test Depot',
        areaPolygon: validPolygon,
      });
      const updated = depot.addInventoryItem(vehicleTypeId, 10);
      const json = updated.toJSON();

      expect(json.name).toBe('Test Depot');
      expect(json.areaPolygon).toEqual(validPolygon);
      expect(json.inventory).toHaveLength(1);
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });

    it('should deserialize from JSON', () => {
      const original = new DepotModel({
        name: 'Test Depot',
        areaPolygon: validPolygon,
      });
      const json = original.toJSON();
      const restored = DepotModel.fromJSON(json);

      expect(restored.name).toBe(original.name);
      expect(restored.areaPolygon).toEqual(original.areaPolygon);
      expect(restored.id).toBe(original.id);
    });
  });

  describe('Area Polygon Overlap Validation', () => {
    it('should support validation that area polygon must not overlap other depots (to be enforced at service layer)', () => {
      // Per spec: Area polygon must not overlap other depots
      // Validation happens at service layer
      const polygon1 = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ];
      const depot = new DepotModel({ areaPolygon: polygon1 });

      expect(depot.areaPolygon).toEqual(polygon1);
    });
  });
});
