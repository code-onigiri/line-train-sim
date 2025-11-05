import { v4 as uuidv4 } from 'uuid';
import { type Route, RouteSchema } from '../schemas/entities';

export class RouteModel {
  private data: Route;

  constructor(data: Partial<Route>) {
    const now = Date.now();
    this.data = RouteSchema.parse({
      id: data.id || uuidv4(),
      name: data.name ?? 'Untitled Route',
      stops: data.stops ?? [],
      diagramSettings: data.diagramSettings ?? {},
      consistTemplates: data.consistTemplates ?? [],
      timeScale: data.timeScale ?? 1.0,
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

  get stops(): Array<{ entityId: string; entityType: 'station' | 'depot' }> {
    return this.data.stops.map((stop) => ({ ...stop }));
  }

  get diagramSettings(): Record<string, unknown> {
    return { ...this.data.diagramSettings };
  }

  get consistTemplates(): string[] {
    return [...this.data.consistTemplates];
  }

  get timeScale(): number {
    return this.data.timeScale;
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateName(name: string): RouteModel {
    return new RouteModel({
      ...this.data,
      name,
      updatedAt: Date.now(),
    });
  }

  addStop(entityId: string, entityType: 'station' | 'depot'): RouteModel {
    return new RouteModel({
      ...this.data,
      stops: [...this.data.stops, { entityId, entityType }],
      updatedAt: Date.now(),
    });
  }

  removeStop(index: number): RouteModel {
    return new RouteModel({
      ...this.data,
      stops: this.data.stops.filter((_, i) => i !== index),
      updatedAt: Date.now(),
    });
  }

  updateStops(stops: Array<{ entityId: string; entityType: 'station' | 'depot' }>): RouteModel {
    return new RouteModel({
      ...this.data,
      stops,
      updatedAt: Date.now(),
    });
  }

  updateDiagramSettings(diagramSettings: Record<string, unknown>): RouteModel {
    return new RouteModel({
      ...this.data,
      diagramSettings: { ...this.data.diagramSettings, ...diagramSettings },
      updatedAt: Date.now(),
    });
  }

  addConsistTemplate(consistTemplateId: string): RouteModel {
    if (this.data.consistTemplates.includes(consistTemplateId)) {
      return this;
    }
    return new RouteModel({
      ...this.data,
      consistTemplates: [...this.data.consistTemplates, consistTemplateId],
      updatedAt: Date.now(),
    });
  }

  removeConsistTemplate(consistTemplateId: string): RouteModel {
    return new RouteModel({
      ...this.data,
      consistTemplates: this.data.consistTemplates.filter((id) => id !== consistTemplateId),
      updatedAt: Date.now(),
    });
  }

  updateTimeScale(timeScale: number): RouteModel {
    return new RouteModel({
      ...this.data,
      timeScale,
      updatedAt: Date.now(),
    });
  }

  toJSON(): Route {
    return { ...this.data };
  }

  static fromJSON(json: Route): RouteModel {
    return new RouteModel(json);
  }
}
