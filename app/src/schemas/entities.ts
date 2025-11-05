import { z } from 'zod';

// Common schemas
export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const TimestampSchema = z.number().int().positive();

// Landmark schema
export const LandmarkSchema = z.object({
  id: z.string().uuid(),
  x: z.number(),
  y: z.number(),
  elevationMeters: z.number(),
  connections: z.array(z.string().uuid()),
  metadata: z.record(z.unknown()),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Landmark = z.infer<typeof LandmarkSchema>;

// TrackSegment schema
export const TrackSegmentSchema = z.object({
  id: z.string().uuid(),
  startLandmarkId: z.string().uuid(),
  endLandmarkId: z.string().uuid(),
  classification: z.enum(['mainline', 'station', 'depot']),
  isBidirectional: z.boolean(),
  permissibleSpeedKph: z.number().positive(),
  slopePercent: z.number(),
  addons: z.array(z.string()),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type TrackSegment = z.infer<typeof TrackSegmentSchema>;

// Station schema
export const StationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  areaPolygon: z.array(PointSchema).min(3),
  platforms: z.array(z.string().uuid()),
  stoppingTracks: z.array(z.string().uuid()),
  landmarkEntrances: z.array(z.string().uuid()),
  diagramOrderIndex: z.number().int().nonnegative(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Station = z.infer<typeof StationSchema>;

// Depot schema
export const DepotSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  areaPolygon: z.array(PointSchema).min(3),
  stoppingLanes: z.array(z.string().uuid()),
  serviceTracks: z.array(z.string().uuid()),
  inventory: z.array(
    z.object({
      vehicleTypeId: z.string().uuid(),
      quantity: z.number().int().nonnegative(),
    }),
  ),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Depot = z.infer<typeof DepotSchema>;

// Route schema
export const RouteSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  stops: z
    .array(
      z.object({
        entityId: z.string().uuid(),
        entityType: z.enum(['station', 'depot']),
      }),
    )
    .min(2),
  diagramSettings: z.record(z.unknown()),
  consistTemplates: z.array(z.string().uuid()),
  timeScale: z.number().positive(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Route = z.infer<typeof RouteSchema>;

// VehicleType schema
export const VehicleTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  speedCategory: z.enum(['slow', 'standard', 'fast']),
  maxSpeedKph: z.number().positive(),
  capacity: z.number().int().positive(),
  lengthMeters: z.number().positive(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type VehicleType = z.infer<typeof VehicleTypeSchema>;

// ScheduledTrain schema
export const ScheduledTrainSchema = z.object({
  id: z.string().uuid(),
  routeId: z.string().uuid(),
  consistId: z.string().uuid(),
  departureTime: z.number().nonnegative(),
  dwellAssignments: z.array(
    z.object({
      stopId: z.string().uuid(),
      trackId: z.string().uuid(),
      arrivalTime: z.number().nonnegative(),
      departureTime: z.number().nonnegative(),
    }),
  ),
  seed: z.number().int(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type ScheduledTrain = z.infer<typeof ScheduledTrainSchema>;

// Addon schema
export const AddonSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  eventHooks: z.array(
    z.object({
      event: z.string(),
      handler: z.string(),
    }),
  ),
  assets: z.array(
    z.object({
      type: z.string(),
      path: z.string(),
    }),
  ),
  permissions: z.array(z.string()),
  enabled: z.boolean(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Addon = z.infer<typeof AddonSchema>;

// Validation helpers
export function validateLandmark(data: unknown): Landmark {
  return LandmarkSchema.parse(data);
}

export function validateTrackSegment(data: unknown): TrackSegment {
  return TrackSegmentSchema.parse(data);
}

export function validateStation(data: unknown): Station {
  return StationSchema.parse(data);
}

export function validateDepot(data: unknown): Depot {
  return DepotSchema.parse(data);
}

export function validateRoute(data: unknown): Route {
  return RouteSchema.parse(data);
}

export function validateVehicleType(data: unknown): VehicleType {
  return VehicleTypeSchema.parse(data);
}

export function validateScheduledTrain(data: unknown): ScheduledTrain {
  return ScheduledTrainSchema.parse(data);
}

export function validateAddon(data: unknown): Addon {
  return AddonSchema.parse(data);
}
