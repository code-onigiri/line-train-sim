import { describe, expect, it } from 'vitest';
import { AddonModel } from '../../../src/models/Addon';

describe('AddonModel', () => {
  it('should create an addon with default values', () => {
    const addon = new AddonModel({ name: 'Test Addon' });

    expect(addon.name).toBe('Test Addon');
    expect(addon.version).toBe('1.0.0');
    expect(addon.eventHooks).toEqual([]);
    expect(addon.assets).toEqual([]);
    expect(addon.permissions).toEqual([]);
    expect(addon.enabled).toBe(false);
  });

  it('should create an addon with custom values', () => {
    const addon = new AddonModel({
      name: 'Custom Addon',
      version: '2.0.0',
      enabled: true,
    });

    expect(addon.name).toBe('Custom Addon');
    expect(addon.version).toBe('2.0.0');
    expect(addon.enabled).toBe(true);
  });

  it('should update name immutably', () => {
    const original = new AddonModel({ name: 'Original' });
    const updated = original.updateName('Updated');

    expect(original.name).toBe('Original');
    expect(updated.name).toBe('Updated');
    expect(updated.id).toBe(original.id);
  });

  it('should update version', () => {
    const original = new AddonModel({ name: 'Test' });
    const updated = original.updateVersion('2.0.0');

    expect(original.version).toBe('1.0.0');
    expect(updated.version).toBe('2.0.0');
  });

  it('should add event hooks', () => {
    const addon = new AddonModel({ name: 'Test' });
    const updated = addon.addEventHook('onPlacementReady', 'handlePlacement');

    expect(updated.eventHooks).toHaveLength(1);
    expect(updated.eventHooks[0]).toEqual({
      event: 'onPlacementReady',
      handler: 'handlePlacement',
    });
  });

  it('should remove event hooks', () => {
    const addon = new AddonModel({ name: 'Test' });
    const updated1 = addon.addEventHook('onPlacementReady', 'handlePlacement');
    const updated2 = updated1.removeEventHook('onPlacementReady');

    expect(updated2.eventHooks).toHaveLength(0);
  });

  it('should add assets', () => {
    const addon = new AddonModel({ name: 'Test' });
    const updated = addon.addAsset('vehicle', '/assets/train.png');

    expect(updated.assets).toHaveLength(1);
    expect(updated.assets[0]).toEqual({
      type: 'vehicle',
      path: '/assets/train.png',
    });
  });

  it('should remove assets by path', () => {
    const addon = new AddonModel({ name: 'Test' });
    const updated1 = addon.addAsset('vehicle', '/assets/train.png');
    const updated2 = updated1.removeAsset('/assets/train.png');

    expect(updated2.assets).toHaveLength(0);
  });

  it('should add permissions', () => {
    const addon = new AddonModel({ name: 'Test' });
    const updated = addon.addPermission('read:landmarks');

    expect(updated.permissions).toContain('read:landmarks');
  });

  it('should not add duplicate permissions', () => {
    const addon = new AddonModel({ name: 'Test' });
    const updated1 = addon.addPermission('read:landmarks');
    const updated2 = updated1.addPermission('read:landmarks');

    expect(updated2.permissions).toHaveLength(1);
  });

  it('should remove permissions', () => {
    const addon = new AddonModel({ name: 'Test' });
    const updated1 = addon.addPermission('read:landmarks');
    const updated2 = updated1.removePermission('read:landmarks');

    expect(updated2.permissions).toHaveLength(0);
  });

  it('should enable and disable addon', () => {
    const addon = new AddonModel({ name: 'Test' });
    expect(addon.enabled).toBe(false);

    const enabled = addon.enable();
    expect(enabled.enabled).toBe(true);

    const disabled = enabled.disable();
    expect(disabled.enabled).toBe(false);
  });

  it('should serialize to JSON', () => {
    const addon = new AddonModel({ name: 'Test Addon' });
    const json = addon.toJSON();

    expect(json.name).toBe('Test Addon');
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('createdAt');
    expect(json).toHaveProperty('updatedAt');
  });

  it('should deserialize from JSON', () => {
    const original = new AddonModel({ name: 'Test Addon', version: '2.0.0' });
    const json = original.toJSON();
    const restored = AddonModel.fromJSON(json);

    expect(restored.name).toBe(original.name);
    expect(restored.version).toBe(original.version);
    expect(restored.id).toBe(original.id);
  });
});
