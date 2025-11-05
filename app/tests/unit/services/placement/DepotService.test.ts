import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { DepotService } from '../../../../src/services/placement/DepotService';

describe('DepotService - T024i: Inventory management', () => {
  let service: DepotService;

  beforeEach(() => {
    service = new DepotService();
  });

  describe('Depot Creation', () => {
    it('should create a depot with valid polygon', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 100 },
        { x: 0, y: 100 },
      ];
      const depot = service.create('Main Depot', polygon);

      expect(depot.name).toBe('Main Depot');
      expect(depot.areaPolygon).toEqual(polygon);
      expect(depot.id).toBeDefined();
    });

    it('should reject polygon with less than 3 points', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ];

      expect(() => service.create('Invalid Depot', polygon)).toThrow(
        'Depot area must have at least 3 points',
      );
    });

    it('should create depot with triangle polygon', () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        { x: 200, y: 0 },
      ];
      const depot = service.create('Triangle Depot', triangle);

      expect(depot.areaPolygon).toEqual(triangle);
    });
  });

  describe('Depot Retrieval', () => {
    it('should retrieve depot by id', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test Depot', polygon);
      const retrieved = service.get(depot.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(depot.id);
    });

    it('should return undefined for non-existent depot', () => {
      const result = service.get(uuidv4());

      expect(result).toBeUndefined();
    });

    it('should retrieve all depots', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      service.create('Depot 1', polygon);
      service.create('Depot 2', polygon);
      service.create('Depot 3', polygon);
      const all = service.getAll();

      expect(all).toHaveLength(3);
    });
  });

  describe('Depot Updates', () => {
    it('should update depot name', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Old Name', polygon);
      const updated = service.update(depot.id, { name: 'New Name' });

      expect(updated?.name).toBe('New Name');
      expect(updated?.id).toBe(depot.id);
    });

    it('should update depot area polygon', () => {
      const originalPolygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const newPolygon = [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 20, y: 20 },
      ];
      const depot = service.create('Test', originalPolygon);
      const updated = service.update(depot.id, { areaPolygon: newPolygon });

      expect(updated?.areaPolygon).toEqual(newPolygon);
    });

    it('should return undefined when updating non-existent depot', () => {
      const result = service.update(uuidv4(), { name: 'Test' });

      expect(result).toBeUndefined();
    });
  });

  describe('Depot Deletion', () => {
    it('should delete depot', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const deleted = service.delete(depot.id);

      expect(deleted).toBe(true);
      expect(service.get(depot.id)).toBeUndefined();
    });

    it('should return false when deleting non-existent depot', () => {
      const result = service.delete(uuidv4());

      expect(result).toBe(false);
    });
  });

  describe('Stopping Lane Management', () => {
    it('should add stopping lane to depot', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const laneId = uuidv4();
      const updated = service.addStoppingLane(depot.id, laneId);

      expect(updated?.stoppingLanes).toContain(laneId);
    });

    it('should remove stopping lane from depot', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const laneId = uuidv4();
      service.addStoppingLane(depot.id, laneId);
      const updated = service.removeStoppingLane(depot.id, laneId);

      expect(updated?.stoppingLanes).not.toContain(laneId);
    });

    it('should throw error when adding lane to non-existent depot', () => {
      expect(() => service.addStoppingLane(uuidv4(), uuidv4())).toThrow('not found');
    });
  });

  describe('Service Track Management', () => {
    it('should add service track to depot', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const trackId = uuidv4();
      const updated = service.addServiceTrack(depot.id, trackId);

      expect(updated?.serviceTracks).toContain(trackId);
    });

    it('should remove service track from depot', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const trackId = uuidv4();
      service.addServiceTrack(depot.id, trackId);
      const updated = service.removeServiceTrack(depot.id, trackId);

      expect(updated?.serviceTracks).not.toContain(trackId);
    });
  });

  describe('Inventory Management', () => {
    it('should add inventory item to depot', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const vehicleTypeId = uuidv4();
      const updated = service.addInventory(depot.id, vehicleTypeId, 10);

      expect(updated.inventory).toHaveLength(1);
      expect(updated.inventory[0].vehicleTypeId).toBe(vehicleTypeId);
      expect(updated.inventory[0].quantity).toBe(10);
    });

    it('should increment existing inventory item', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const vehicleTypeId = uuidv4();
      service.addInventory(depot.id, vehicleTypeId, 5);
      const updated = service.addInventory(depot.id, vehicleTypeId, 3);

      expect(updated.inventory).toHaveLength(1);
      expect(updated.inventory[0].quantity).toBe(8);
    });

    it('should remove inventory item from depot', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const vehicleTypeId = uuidv4();
      service.addInventory(depot.id, vehicleTypeId, 10);
      const updated = service.removeInventory(depot.id, vehicleTypeId, 3);

      expect(updated.inventory[0].quantity).toBe(7);
    });

    it('should update inventory quantity', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const vehicleTypeId = uuidv4();
      service.addInventory(depot.id, vehicleTypeId, 5);
      const updated = service.updateInventoryQuantity(depot.id, vehicleTypeId, 15);

      expect(updated.inventory[0].quantity).toBe(15);
    });

    it('should not allow negative inventory quantities', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const vehicleTypeId = uuidv4();
      service.addInventory(depot.id, vehicleTypeId, 5);
      const updated = service.removeInventory(depot.id, vehicleTypeId, 10);

      // Should remove item entirely when quantity would go negative
      expect(updated.inventory).toHaveLength(0);
    });

    it('should throw error when managing inventory of non-existent depot', () => {
      expect(() => service.addInventory(uuidv4(), uuidv4(), 5)).toThrow('not found');
    });

    it('should manage multiple vehicle types in inventory', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const type1 = uuidv4();
      const type2 = uuidv4();
      const type3 = uuidv4();

      service.addInventory(depot.id, type1, 10);
      service.addInventory(depot.id, type2, 5);
      const updated = service.addInventory(depot.id, type3, 7);

      expect(updated.inventory).toHaveLength(3);
    });
  });

  describe('Validation Requirements per Spec FR-003 and FR-007', () => {
    it('should enforce minimum 3 points for area polygon', () => {
      const invalidPolygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];

      expect(() => service.create('Invalid', invalidPolygon)).toThrow();
    });

    it('should support stopping lanes and service tracks configuration per FR-003', () => {
      // Per spec FR-003: Depots allow drawing stopping lanes and regular tracks
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const laneId = uuidv4();
      const trackId = uuidv4();

      let updated = service.addStoppingLane(depot.id, laneId);
      updated = service.addServiceTrack(updated?.id, trackId);

      expect(updated?.stoppingLanes).toContain(laneId);
      expect(updated?.serviceTracks).toContain(trackId);
    });

    it('should support vehicle inventory by quantity and speed category per FR-007', () => {
      // Per spec FR-007: Depot management MUST allow users to assign vehicle
      // inventories by quantity and speed category
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const slowTrain = uuidv4();
      const fastTrain = uuidv4();

      service.addInventory(depot.id, slowTrain, 10);
      const updated = service.addInventory(depot.id, fastTrain, 5);

      expect(updated.inventory).toHaveLength(2);
      expect(updated.inventory.find((i) => i.vehicleTypeId === slowTrain)?.quantity).toBe(10);
      expect(updated.inventory.find((i) => i.vehicleTypeId === fastTrain)?.quantity).toBe(5);
    });

    it('should enforce inventory quantities >= 0 per FR-007', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];
      const depot = service.create('Test', polygon);
      const vehicleTypeId = uuidv4();

      service.addInventory(depot.id, vehicleTypeId, 5);
      const updated = service.removeInventory(depot.id, vehicleTypeId, 10);

      // Should not have negative quantity
      expect(updated.inventory.find((i) => i.vehicleTypeId === vehicleTypeId)).toBeUndefined();
    });
  });
});
