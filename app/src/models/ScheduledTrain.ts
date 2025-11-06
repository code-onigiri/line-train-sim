import { v4 as uuidv4 } from 'uuid';
import { type ScheduledTrain, ScheduledTrainSchema } from '../schemas/entities';

export class ScheduledTrainModel {
  private data: ScheduledTrain;

  constructor(data: Partial<ScheduledTrain>) {
    const now = Date.now();
    this.data = ScheduledTrainSchema.parse({
      id: data.id || uuidv4(),
      routeId: data.routeId ?? '',
      consistTemplateId: data.consistTemplateId ?? '',
      departureTime: data.departureTime ?? 0,
      dwellAssignments: data.dwellAssignments ?? [],
      seed: data.seed ?? Math.floor(Math.random() * 1000000),
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get routeId(): string {
    return this.data.routeId;
  }

  get consistTemplateId(): string {
    return this.data.consistTemplateId;
  }

  get departureTime(): number {
    return this.data.departureTime;
  }

  get dwellAssignments(): Array<{
    stopId: string;
    trackId: string;
    arrivalTime: number;
    departureTime: number;
  }> {
    return this.data.dwellAssignments.map((dwell) => ({ ...dwell }));
  }

  get seed(): number {
    return this.data.seed;
  }

  get createdAt(): number {
    return this.data.createdAt;
  }

  get updatedAt(): number {
    return this.data.updatedAt;
  }

  updateDepartureTime(departureTime: number): ScheduledTrainModel {
    return new ScheduledTrainModel({
      ...this.data,
      departureTime,
      updatedAt: Date.now(),
    });
  }

  addDwellAssignment(
    stopId: string,
    trackId: string,
    arrivalTime: number,
    departureTime: number,
  ): ScheduledTrainModel {
    return new ScheduledTrainModel({
      ...this.data,
      dwellAssignments: [
        ...this.data.dwellAssignments,
        { stopId, trackId, arrivalTime, departureTime },
      ],
      updatedAt: Date.now(),
    });
  }

  updateDwellAssignments(
    dwellAssignments: Array<{
      stopId: string;
      trackId: string;
      arrivalTime: number;
      departureTime: number;
    }>,
  ): ScheduledTrainModel {
    return new ScheduledTrainModel({
      ...this.data,
      dwellAssignments,
      updatedAt: Date.now(),
    });
  }

  toJSON(): ScheduledTrain {
    return { ...this.data };
  }

  static fromJSON(json: ScheduledTrain): ScheduledTrainModel {
    return new ScheduledTrainModel(json);
  }
}
