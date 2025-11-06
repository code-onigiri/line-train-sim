# ClientService API Documentation

Complete API documentation for the unified ClientService that implements the OpenAPI specification.

## Quick Start

```typescript
import { ClientService } from './services/ClientService';
const client = new ClientService();
```

## Operations

See the OpenAPI specification at `specs/001-placement-mode/contracts/client-service.openapi.yaml` for full details.

### Landmark Operations
- `createLandmark()` - Create landmarks with position and elevation

### Track Operations
- `createTrackSegment()` - Connect landmarks with track segments

### Station Operations
- `createStation()` - Create stations with platforms and stopping tracks
- `updateStation()` - Update station properties

### Depot Operations
- `createDepot()` - Create depots with lanes and inventory
- `updateDepot()` - Update depot properties

### Route Operations
- `createRoute()` - Define routes with ordered stops
- `updateRoute()` - Modify route properties

### Preview & Execution
- `generatePreview()` - Generate timetable preview with conflict detection
- `runExecution()` - Start execution mode playback

### Addon Management
- `registerAddon()` - Register addons with security validation

## Validation

- Route validation ensures proper start/end constraints
- Loop detection warns about circular routes
- Addon security prevents unauthorized operations

For complete usage examples, see the test files in `tests/unit/services/ClientService.test.ts`
