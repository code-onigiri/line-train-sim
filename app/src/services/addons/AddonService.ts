import { AddonModel } from '../../models/Addon';

/**
 * Addon registration request
 */
export interface AddonRegistration {
  id: string;
  version: string;
  permissions: string[];
  hooks: Array<{
    event: string;
    handlerId: string;
  }>;
  assets?: Array<{
    type: string;
    assetId: string;
  }>;
}

/**
 * Service for managing addon registration and lifecycle.
 * Handles sandbox permissions and event hooks.
 */
export class AddonService {
  private addons: Map<string, AddonModel> = new Map();

  /**
   * Register a new addon with the system.
   * @param registration - Addon registration details
   */
  register(registration: AddonRegistration): AddonModel {
    // Validate permissions (ensure no security-sensitive scopes)
    this.validatePermissions(registration.permissions);

    // Validate event hooks (ensure only approved lifecycle points)
    this.validateHooks(registration.hooks);

    const addon = new AddonModel({
      id: registration.id,
      version: registration.version,
      permissions: registration.permissions,
      hooks: registration.hooks,
      assets: registration.assets ?? [],
    });

    this.addons.set(addon.id, addon);
    return addon;
  }

  /**
   * Get an addon by ID.
   */
  get(id: string): AddonModel | undefined {
    return this.addons.get(id);
  }

  /**
   * Get all registered addons.
   */
  getAll(): AddonModel[] {
    return Array.from(this.addons.values());
  }

  /**
   * Unregister an addon.
   */
  unregister(id: string): boolean {
    return this.addons.delete(id);
  }

  /**
   * Validate that addon permissions don't include security-sensitive scopes.
   */
  private validatePermissions(permissions: string[]): void {
    const prohibitedScopes = [
      'network-access',
      'filesystem-access',
      'indexeddb-write',
      'localstorage-write',
      'arbitrary-execution',
    ];

    for (const permission of permissions) {
      if (prohibitedScopes.includes(permission)) {
        throw new Error(`Prohibited permission: ${permission}`);
      }
    }

    // Validate allowed permissions
    const allowedPermissions = ['asset-read', 'asset-write', 'event-hooks'];
    for (const permission of permissions) {
      if (!allowedPermissions.includes(permission)) {
        throw new Error(`Unknown permission: ${permission}`);
      }
    }
  }

  /**
   * Validate that event hooks are restricted to approved lifecycle points.
   */
  private validateHooks(hooks: Array<{ event: string; handlerId: string }>): void {
    const approvedEvents = [
      'onPlacementReady',
      'onBeforePreview',
      'onAfterPreview',
      'onExecutionTick',
    ];

    for (const hook of hooks) {
      if (!approvedEvents.includes(hook.event)) {
        throw new Error(`Unapproved event hook: ${hook.event}`);
      }
    }
  }
}
