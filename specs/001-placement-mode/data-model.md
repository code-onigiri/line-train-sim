# Data Model: Placement Mode Foundations

## Entities

### Landmark
- **Description**: Spatial point anchoring track endpoints, intersections, and branching nodes.
- **Fields**:
  - `id: string` (UUID)
  - `position: { x: number; y: number }` (canvas coordinates in meters)
  - `elevationMeters: number` (numeric height in meters; measured from track rail top surface)
  - `connections: string[]` (track segment ids)
  - `metadata: LandmarkMeta` (labels, creation source)
- **Relationships**: Bidirectional links to `TrackSegment` via `connections`.
- **Validation Rules**: Coordinates must stay within map bounds; elevation changes between connected landmarks are used to manually calculate and set track segment slopes.
- **State Transitions**: Created via placement, updated when connected segments change, deleted when orphaned and user confirms.

### TrackSegment
- **Description**: Straight line between two landmarks representing physical track.
- **Fields**:
  - `id: string`
  - `startLandmarkId: string`
  - `endLandmarkId: string`
  - `classification: 'mainline' | 'station' | 'depot'`
  - `isBidirectional: boolean`
  - `permissibleSpeedKph: number`
  - `slopePercent: number` (manually entered grade; positive = uphill from start to end)
  - `addons: AddonBinding[]`
- **Relationships**: Belongs to exactly two landmarks; optionally referenced by stations or depots for stopping areas.
- **Validation Rules**: No duplicate segment pairs; intersection with vertical separation <4m (measured from track rail top surface) triggers new landmark creation; segments separated by ≥4m are considered different elevation levels and do not create intersection landmarks.
- **State Transitions**: Derived from placement edits; splits when new landmark inserted; merges during simplification if colinear.

### Station
- **Description**: Area with platforms and stopping tracks available for passenger service.
- **Fields**:
  - `id: string`
  - `name: string`
  - `areaPolygon: Point[]`
  - `platforms: Platform[]`
  - `stoppingTracks: StoppingTrack[]`
  - `landmarkEntrances: string[]`
  - `diagramOrderIndex: number`
- **Relationships**: References track segments for stopping tracks; participates in `Route.stops` list.
- **Validation Rules**: At least one platform and stopping track; polygon must be non-self-intersecting; order indexes unique within diagram configuration.
- **State Transitions**: Created by user selection, updated through platform edits, archived when removed from all routes.

### Depot
- **Description**: Yard area for staging and maintaining rolling stock.
- **Fields**:
  - `id: string`
  - `name: string`
  - `areaPolygon: Point[]`
  - `stoppingLanes: StoppingLane[]`
  - `serviceTracks: string[]` (track segment ids)
  - `inventory: DepotInventoryItem[]`
- **Relationships**: Supplies `ScheduledTrain.consistId`; referenced as valid start/end for routes.
- **Validation Rules**: Inventory quantities >= 0; stopping lanes linked to valid track segments; area polygon must not overlap other depots.
- **State Transitions**: Inventory changes when trains dispatched or returned; lanes added/removed via placement edits.

### Route
- **Description**: Ordered sequence of stations and depots defining service flow.
- **Fields**:
  - `id: string`
  - `name: string`
  - `stops: RouteStop[]` (ordered list of station/depot ids; depots allowed only at start/end positions)
  - `diagramSettings: DiagramConfig`
  - `consistTemplates: ConsistTemplate[]`
  - `timeScale: number` (execution speed multiplier default)
- **Relationships**: Consumed by `ScheduledTrain`; references `Station` and `Depot` entities.
- **Validation Rules**: First and last stops must be station or depot; intermediate stops must be stations only; no consecutive duplicate stops unless flagged as loop (loop detection displays warning and prevents execution until resolved with intermediate landmark insertion); diagram settings must align with stop list.
- **State Transitions**: Updated when designer reorders stops, modifies diagram settings, or changes consist templates.

### VehicleType
- **Description**: Canonical catalog entry describing available rolling stock characteristics.
- **Fields**:
  - `id: string`
  - `name: string`
  - `speedCategory: 'slow' | 'standard' | 'fast'`
  - `maxSpeedKph: number`
  - `capacity: number`
  - `lengthMeters: number`
- **Relationships**: Referenced by depot inventories and consist templates.
- **Validation Rules**: max speed must align with category ranges; capacity > 0; length > 0.
- **State Transitions**: Usually static; updated when add-ons register new vehicles.

### ScheduledTrain
- **Description**: Timetabled service generated from a route and consist template.
- **Fields**:
  - `id: string`
  - `routeId: string`
  - `consistTemplateId: string`
  - `departureTime: TimelineTime`
  - `dwellAssignments: DwellAssignment[]` (each includes dwell duration calculated from route configuration)
  - `seed: number`
- **Relationships**: Links to `Route`, references `Depot` for start availability, uses `VehicleType` via `ConsistTemplate`.
- **Validation Rules**: Must pass conflict detection (no overlapping dwell on same stopping track/lane); seed must persist for deterministic playback.
- **State Transitions**: Generated during preview, updated when timetable changes, archived after execution logs stored.

### Addon
- **Description**: External package extending assets and event-driven behaviors.
- **Fields**:
  - `id: string`
  - `name: string`
  - `version: string`
  - `eventHooks: AddonHookDescriptor[]`
  - `assets: AddonAssetRef[]`
  - `permissions: AddonPermission[]`
- **Relationships**: Hooks integrate with render or simulation events; assets referenced by vehicle or scenery definitions.
- **Validation Rules**: Permissions cannot include security-sensitive scopes (prohibited: network access, file system access, IndexedDB write, localStorage write, arbitrary code execution outside sandbox); version must follow semver; event hooks restricted to approved lifecycle points (onPlacementReady, onBeforePreview, onAfterPreview, onExecutionTick).
- **State Transitions**: Enabled/disabled per session; validated at load and on update.
