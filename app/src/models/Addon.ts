import { v4 as uuidv4 } from 'uuid';
import { type Addon, AddonSchema } from '../schemas/entities';

export class AddonModel {
  private data: Addon;

  constructor(data: Partial<Addon>) {
    const now = Date.now();
    this.data = AddonSchema.parse({
      id: data.id || uuidv4(),
      name: data.name ?? 'Untitled Addon',
      version: data.version ?? '1.0.0',
      eventHooks: data.eventHooks ?? [],
      assets: data.assets ?? [],
      permissions: data.permissions ?? [],
      enabled: data.enabled ?? false,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get version(): string {
    return this.data.version;
  }

  get eventHooks(): Array<{ event: string; handler: string }> {
    return this.data.eventHooks.map((hook) => ({ ...hook }));
  }

  get assets(): Array<{ type: string; path: string }> {
    return this.data.assets.map((asset) => ({ ...asset }));
  }

  get permissions(): string[] {
    return [...this.data.permissions];
  }

  get enabled(): boolean {
    return this.data.enabled;
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateName(name: string): AddonModel {
    return new AddonModel({
      ...this.data,
      name,
      updatedAt: Date.now(),
    });
  }

  updateVersion(version: string): AddonModel {
    return new AddonModel({
      ...this.data,
      version,
      updatedAt: Date.now(),
    });
  }

  addEventHook(event: string, handler: string): AddonModel {
    return new AddonModel({
      ...this.data,
      eventHooks: [...this.data.eventHooks, { event, handler }],
      updatedAt: Date.now(),
    });
  }

  removeEventHook(event: string): AddonModel {
    return new AddonModel({
      ...this.data,
      eventHooks: this.data.eventHooks.filter((hook) => hook.event !== event),
      updatedAt: Date.now(),
    });
  }

  addAsset(type: string, path: string): AddonModel {
    return new AddonModel({
      ...this.data,
      assets: [...this.data.assets, { type, path }],
      updatedAt: Date.now(),
    });
  }

  removeAsset(path: string): AddonModel {
    return new AddonModel({
      ...this.data,
      assets: this.data.assets.filter((asset) => asset.path !== path),
      updatedAt: Date.now(),
    });
  }

  addPermission(permission: string): AddonModel {
    if (this.data.permissions.includes(permission)) {
      return this;
    }
    return new AddonModel({
      ...this.data,
      permissions: [...this.data.permissions, permission],
      updatedAt: Date.now(),
    });
  }

  removePermission(permission: string): AddonModel {
    return new AddonModel({
      ...this.data,
      permissions: this.data.permissions.filter((p) => p !== permission),
      updatedAt: Date.now(),
    });
  }

  enable(): AddonModel {
    return new AddonModel({
      ...this.data,
      enabled: true,
      updatedAt: Date.now(),
    });
  }

  disable(): AddonModel {
    return new AddonModel({
      ...this.data,
      enabled: false,
      updatedAt: Date.now(),
    });
  }

  toJSON(): Addon {
    return { ...this.data };
  }

  static fromJSON(json: Addon): AddonModel {
    return new AddonModel(json);
  }
}
