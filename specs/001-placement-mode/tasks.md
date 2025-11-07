````markdown
# Tasks: Placement Mode Foundations

**Input**: Design documents from `/specs/001-placement-mode/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Per constitution Principle 2, features MUST include failing tests before implementation. Test tasks are included for each user story and must be completed before corresponding implementation work begins.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Per plan.md structure:
- **Source**: `app/src/`
- **Tests**: `app/tests/`
- **Public assets**: `app/public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure under app/ with src/, tests/, and public/ subdirectories
- [x] T002 Initialize Bun project with package.json including React 18, PixiJS, Zustand, Dexie, and Zod dependencies in app/
- [x] T003 [P] Configure Vite 5.x build tool with React plugin and TypeScript support in app/vite.config.ts
- [x] T004 [P] Setup Biome 1.x for linting and formatting in app/biome.json
- [x] T005 [P] Configure TypeScript 5.x with strict mode targeting ES2022 in app/tsconfig.json
- [x] T006 [P] Create HTML entry point in app/public/index.html
- [x] T007 [P] Setup Vitest configuration for unit tests in app/vitest.config.ts
- [x] T008 [P] Configure Playwright for E2E tests targeting Chrome 142+, Firefox 144+, Safari 26.0+ with touch/keyboard regression support in app/playwright.config.ts
- [x] T009 [P] Initialize React Testing Library utilities in app/tests/unit/setup.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Setup IndexedDB schema using Dexie with placementSimDB database in app/src/services/storage/db.ts
- [x] T011 [P] Implement localStorage fallback for preferences in app/src/services/storage/preferences.ts
- [x] T012 [P] Create Zustand store structure for placement state management in app/src/state/placementStore.ts
- [x] T013 [P] Create Zustand store for diagram state in app/src/state/diagramStore.ts
- [x] T014 [P] Create Zustand store for execution state in app/src/state/executionStore.ts
- [x] T015 [P] Define Zod validation schemas for all entities from data-model.md in app/src/schemas/entities.ts
- [x] T016 [P] Initialize PixiJS application and setup canvas renderer in app/src/canvas/renderer/PixiApp.ts
- [x] T017 [P] Implement canvas interaction manager for touch and keyboard events in app/src/canvas/interactions/InteractionManager.ts
- [x] T018 [P] Setup internationalization with FormatJS (react-intl) in app/src/i18n/setup.ts
- [x] T019 [P] Create default en-US locale bundle in app/src/i18n/locales/en-US.json
- [x] T020 [P] Implement deterministic seed management utilities in app/src/services/simulation/seedManager.ts
- [x] T021 [P] Create base React App component and routing structure in app/src/app/App.tsx
- [x] T022 [P] Setup performance monitoring utilities using Web Performance APIs in app/src/services/monitoring/performance.ts
- [x] T023 [P] Create error handling and logging infrastructure in app/src/services/logging/logger.ts
- [x] T024 Create baseline performance benchmark script in app/tests/benchmarks/baseline.ts
- [x] T024a Create CI acceptance test for SC-004 performance budget with automated pass/fail gate (fails build if execution preview >5 real minutes for 60 sim minutes) in app/tests/benchmarks/sc004-acceptance.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Lay Route Infrastructure (Priority: P1) 🎯 MVP

**Goal**: Enable route planners to sketch stations, depots, and point-to-point tracks to establish a service corridor before any timetable work begins.

**Independent Test**: Create a new map, place stations with platforms, depots with lanes, connect with track segments including elevated/underground sections, save, reload, and confirm all infrastructure persists with correct attributes.

### Tests for User Story 1 (Complete BEFORE Implementation)

- [x] T024b [P] [US1-TEST] Write failing unit tests for Landmark model validation (coordinates, elevation, connections) in app/tests/unit/models/Landmark.test.ts
- [x] T024c [P] [US1-TEST] Write failing unit tests for TrackSegment model validation (slope, clearance, intersections) in app/tests/unit/models/TrackSegment.test.ts
- [x] T024d [P] [US1-TEST] Write failing unit tests for Station model validation (area polygon, platforms) in app/tests/unit/models/Station.test.ts
- [x] T024e [P] [US1-TEST] Write failing unit tests for Depot model validation (inventory, lanes) in app/tests/unit/models/Depot.test.ts
- [x] T024f [US1-TEST] Write failing unit tests for LandmarkService operations (create, update, delete) in app/tests/unit/services/placement/LandmarkService.test.ts
- [x] T024g [US1-TEST] Write failing unit tests for TrackSegmentService with intersection detection (4m clearance threshold) in app/tests/unit/services/placement/TrackSegmentService.test.ts
- [x] T024h [US1-TEST] Write failing unit tests for StationService with area validation in app/tests/unit/services/placement/StationService.test.ts
- [x] T024i [US1-TEST] Write failing unit tests for DepotService with inventory management in app/tests/unit/services/placement/DepotService.test.ts
- [x] T024j [US1-TEST] Write failing E2E test for complete US1 acceptance scenarios (place, save, reload infrastructure) in app/tests/e2e/placement-workflow.spec.ts

**Checkpoint**: All US1 tests written and failing - ready to implement

### Implementation for User Story 1

- [x] T025 [P] [US1] Create Landmark model with validation in app/src/models/Landmark.ts
- [x] T026 [P] [US1] Create TrackSegment model with validation in app/src/models/TrackSegment.ts
- [x] T027 [P] [US1] Create Station model with validation in app/src/models/Station.ts
- [x] T028 [P] [US1] Create Depot model with validation in app/src/models/Depot.ts
- [x] T029 [P] [US1] Create Platform and StoppingTrack models in app/src/models/StationComponents.ts
- [x] T030 [P] [US1] Create StoppingLane and DepotInventoryItem models in app/src/models/DepotComponents.ts
- [x] T031 [US1] Implement LandmarkService with create, update, delete operations in app/src/services/placement/LandmarkService.ts
- [x] T032 [US1] Implement TrackSegmentService with create, intersection detection (4m vertical clearance threshold measured from track rail top surface), and manual slope entry (percentage grade) in app/src/services/placement/TrackSegmentService.ts
- [x] T033 [US1] Implement StationService with area polygon validation and platform management in app/src/services/placement/StationService.ts
- [x] T034 [US1] Implement DepotService with inventory management and lane configuration in app/src/services/placement/DepotService.ts
- [x] T035 [P] [US1] Create PixiJS renderer for landmarks in app/src/canvas/renderer/LandmarkRenderer.ts
- [x] T036 [P] [US1] Create PixiJS renderer for track segments with elevation visualization in app/src/canvas/renderer/TrackRenderer.ts
- [x] T037 [P] [US1] Create PixiJS renderer for station areas and platforms in app/src/canvas/renderer/StationRenderer.ts
- [x] T038 [P] [US1] Create PixiJS renderer for depot areas and lanes in app/src/canvas/renderer/DepotRenderer.ts
- [x] T039 [P] [US1] Implement placement mode UI toolbar with drawing tools in app/src/ui/placement/PlacementToolbar.tsx
- [x] T040 [US1] Implement landmark placement interaction handler in app/src/canvas/interactions/LandmarkPlacementHandler.ts
- [x] T041 [US1] Implement track drawing interaction handler with straight line snapping in app/src/canvas/interactions/TrackDrawingHandler.ts
- [x] T042 [US1] Implement station area selection and platform configuration UI in app/src/ui/placement/StationEditor.tsx
- [x] T043 [US1] Implement depot area selection and lane configuration UI in app/src/ui/placement/DepotEditor.tsx
- [x] T044 [US1] Implement intersection detection algorithm with 4m vertical clearance threshold (measured from track rail top surface) for track segments in app/src/services/geometry/IntersectionDetector.ts
- [x] T045 [US1] Implement automatic landmark creation at intersections (only when vertical separation <4m from track rail top surface) in app/src/services/placement/IntersectionHandler.ts
- [x] T046 [P] [US1] Add persistence layer for landmarks using Dexie in app/src/services/storage/LandmarkRepository.ts
- [x] T047 [P] [US1] Add persistence layer for track segments using Dexie in app/src/services/storage/TrackRepository.ts
- [x] T048 [P] [US1] Add persistence layer for stations using Dexie in app/src/services/storage/StationRepository.ts
- [x] T049 [P] [US1] Add persistence layer for depots using Dexie in app/src/services/storage/DepotRepository.ts
- [x] T050 [US1] Implement canvas pan and zoom controls (WASD, arrow keys, pinch-zoom) in app/src/canvas/interactions/ViewportController.ts
- [x] T051 [US1] Implement selection and editing of existing infrastructure in app/src/canvas/interactions/SelectionHandler.ts
- [x] T052 [P] [US1] Add keyboard shortcuts for placement tools (Space toggle, Shift multi-select) in app/src/ui/placement/KeyboardShortcuts.tsx
- [x] T053 [US1] Implement save/load functionality for complete map state in app/src/services/storage/MapPersistence.ts
- [x] T054 [US1] Add validation messages and error feedback for placement operations in app/src/ui/common/ValidationFeedback.tsx
- [x] T054k [US1] Wire Pixi-based placement canvas into React shell via app/src/ui/placement/PlacementCanvas.tsx and integrate toolbar switching in app/src/app/App.tsx
- [x] T054l [US1] Expose placement scene metrics and selection inspector in app/src/app/App.tsx to surface InteractionManager state to the UI

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can create, edit, save, and reload complete infrastructure layouts.

---

## Phase 4: User Story 2 - Configure Route Diagram (Priority: P2)

**Goal**: Enable timetable designers to take an existing layout, define a route, select its stations, and configure diagram settings before committing train assignments.

**Independent Test**: Load a saved map with infrastructure, create a new route selecting start/end stations or depots, add intermediate stations, configure diagram axis order by dragging, assign vehicle types and quantities, save configuration, and verify preview readiness without entering execution mode.

### Tests for User Story 2 (Complete BEFORE Implementation)

- [x] T054a [P] [US2-TEST] Write failing unit tests for Route model validation (start/end constraints, depot position rules) in app/tests/unit/models/Route.test.ts
- [x] T054b [P] [US2-TEST] Write failing unit tests for ConsistTemplate model in app/tests/unit/models/ConsistTemplate.test.ts
- [x] T054c [US2-TEST] Write failing unit tests for RouteService with stop ordering validation in app/tests/unit/services/diagram/RouteService.test.ts
- [x] T054d [US2-TEST] Write failing unit tests for route validator (start/end must be station/depot, intermediate must be stations only) in app/tests/unit/services/validation/RouteValidator.test.ts
- [x] T054e [US2-TEST] Write failing unit tests for diagram validator (loop detection, completeness) in app/tests/unit/services/validation/DiagramValidator.test.ts
- [x] T054f [US2-TEST] Write failing E2E test for US2 acceptance scenarios (route creation, diagram config, drag-reorder) in app/tests/e2e/diagram-workflow.spec.ts

**Checkpoint**: All US2 tests written and failing - ready to implement

### Implementation for User Story 2

- [x] T054g Immediately update all references from "Consist" to "ConsistTemplate" in models and services

- [x] T055 [P] [US2] Create Route model with validation in app/src/models/Route.ts
- [x] T056 [P] [US2] Create RouteStop and DiagramConfig models in app/src/models/RouteComponents.ts
- [x] T057 [P] [US2] Create VehicleType model with speed categories in app/src/models/VehicleType.ts
- [x] T058 [P] [US2] Create ConsistTemplate model in app/src/models/ConsistTemplate.ts
- [x] T059 [US2] Implement RouteService with stop ordering and validation in app/src/services/diagram/RouteService.ts
- [x] T060 [US2] Implement route definition UI with station/depot selection in app/src/ui/diagram/RouteBuilder.tsx
- [x] T061 [US2] Implement validation for start/end must be station or depot in app/src/services/validation/RouteValidator.ts
- [x] T062 [US2] Implement diagram settings screen with horizontal time axis in app/src/ui/diagram/DiagramSettings.tsx
- [x] T063 [US2] Implement vertical station list with drag-and-drop reordering in app/src/ui/diagram/StationOrderEditor.tsx
- [x] T063a [US2] Implement real-time diagram preview updates during station drag-and-drop reordering in app/src/ui/diagram/LivePreviewPanel.tsx
- [x] T064 [P] [US2] Create VehicleTypeService with speed category management in app/src/services/diagram/VehicleTypeService.ts
- [x] T065 [US2] Implement consist configuration UI with car counts and speed profiles in app/src/ui/diagram/ConsistEditor.tsx
- [x] T066 [US2] Implement depot inventory assignment interface in app/src/ui/diagram/DepotInventoryPanel.tsx
- [x] T067 [P] [US2] Add persistence layer for routes using Dexie in app/src/services/storage/RouteRepository.ts
- [x] T068 [P] [US2] Add persistence layer for vehicle types using Dexie in app/src/services/storage/VehicleTypeRepository.ts
- [x] T069 [US2] Implement diagram preview summary showing consist lengths and speed categories in app/src/ui/diagram/PreviewSummary.tsx
- [x] T070 [US2] Add route navigation between placement and diagram modes in app/src/app/routes/routeNavigation.ts
- [x] T071 [US2] Implement diagram settings persistence and retrieval in app/src/services/storage/DiagramRepository.ts
- [x] T072 [US2] Add validation for route completeness and loop detection (warning + execution prevention on error) before preview in app/src/services/validation/DiagramValidator.ts
- [x] T072a [US2] Implement loop detection warning UI dialog with guidance to insert intermediate landmark in app/src/ui/diagram/LoopWarningDialog.tsx
- [x] T073 [P] [US2] Implement localized time formatting for diagram axis in app/src/i18n/timeFormatters.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can build infrastructure (US1) and configure routes with diagrams (US2) as separate workflows.

---

## Phase 5: User Story 3 - Validate Execution Preview (Priority: P3)

**Goal**: Enable operations leads to preview and run the timetable, adjusting time speed and ensuring trains honour signals without overlapping in stations.

**Independent Test**: Load a configured route from US2, generate execution preview, launch execution mode, manipulate playback speed (0.1x to 5x), observe train movement respecting speed profiles, verify conflict detection prevents overlapping trains at stopping tracks, and confirm train visualization shows correct rectangle/trapezoid transitions at corners.

### Tests for User Story 3 (Complete BEFORE Implementation)

   - [x] T073a [P] [US3-TEST] Write failing unit tests for ScheduledTrain model with dwell assignments in app/tests/unit/models/ScheduledTrain.test.ts
   - [x] T073b [US3-TEST] Write failing unit tests for ConflictDetector (overlapping dwell detection) in app/tests/unit/services/validation/ConflictDetector.test.ts
   - [x] T073c [US3-TEST] Write failing unit tests for CapacityValidator (stopping track capacity) in app/tests/unit/services/validation/CapacityValidator.test.ts
   - [x] T073d [US3-TEST] Write failing unit tests for train movement calculations with speed profiles in app/tests/unit/services/simulation/TrainMovement.test.ts
   - [x] T073e [US3-TEST] Write failing unit tests for deterministic execution with seeded state in app/tests/unit/services/execution/DeterministicEngine.test.ts
   - [x] T073f [US3-TEST] Write failing unit tests for corner normal calculation and trapezoid rendering in app/tests/unit/services/geometry/CornerNormals.test.ts
   - [x] T073g [US3-TEST] Write failing E2E test for US3 acceptance scenarios (preview generation, execution playback, conflict display, train visualization) in app/tests/e2e/execution-workflow.spec.ts

**Checkpoint**: All US3 tests written and failing - ready to implement. Tests MUST remain in place before enabling any T074+ work to satisfy Constitution Principle 2.

### Implementation for User Story 3

- [x] T074 [P] [US3] Create ScheduledTrain model with dwell assignments in app/src/models/ScheduledTrain.ts
- [x] T075 [P] [US3] Create DwellAssignment and Conflict models in app/src/models/ExecutionComponents.ts
- [x] T076 [US3] Implement PreviewService to generate timetable from route in app/src/services/execution/PreviewService.ts
- [x] T077 [US3] Implement conflict detection algorithm for overlapping dwells in app/src/services/validation/ConflictDetector.ts
- [x] T078 [US3] Implement validation that checks stopping track capacity in app/src/services/validation/CapacityValidator.ts
- [x] T079 [US3] Implement preview generation UI showing scheduled trains in app/src/ui/execution/PreviewPanel.tsx
- [x] T080 [US3] Implement conflict display and resolution guidance in app/src/ui/execution/ConflictResolutionPanel.tsx
- [x] T081 [US3] Implement ExecutionService with time-scaled simulation loop in app/src/services/execution/ExecutionService.ts
- [x] T082 [US3] Implement train movement calculations respecting speed profiles in app/src/services/simulation/TrainMovement.ts
- [x] T083 [US3] Implement deterministic execution with seeded state management in app/src/services/execution/DeterministicEngine.ts
- [x] T084 [US3] Implement execution mode UI with time scaling controls (0.1x to 5x) in app/src/ui/execution/ExecutionControls.tsx
- [x] T085 [P] [US3] Create PixiJS renderer for train rectangles on straight segments in app/src/canvas/renderer/TrainRenderer.ts
- [x] T086 [US3] Implement trapezoid rendering for trains turning at corners (chain transformations for consecutive corners without snapping back to rectangles) in app/src/canvas/renderer/TurnRenderer.ts
- [x] T087 [US3] Implement corner normal calculation for trapezoid alignment in app/src/services/geometry/CornerNormals.ts
- [x] T088 [US3] Implement train position interpolation along track segments in app/src/services/simulation/PositionInterpolator.ts
- [x] T089 [US3] Implement execution preview validation before playback start in app/src/services/validation/ExecutionValidator.ts
- [x] T090 [US3] Add execution state persistence for replay capability in app/src/services/storage/ExecutionRepository.ts
- [x] T091 [US3] Implement playback speed adjustment with <150ms response time in app/src/services/execution/TimeScaleController.ts
- [x] T092 [P] [US3] Add performance monitoring for 60 fps canvas rendering target in app/src/services/monitoring/renderPerformance.ts
- [x] T093 [US3] Implement execution timeline scrubber for manual time navigation in app/src/ui/execution/TimelineScrubber.tsx
- [x] T094 [P] [US3] Add execution logging and event history tracking in app/src/services/logging/executionLogger.ts

**Checkpoint**: All three user stories should now be independently functional - complete workflow from placement (US1) to diagram configuration (US2) to execution preview (US3).

---

## Phase 6: Add-on System (Extension)

**Goal**: Enable external add-on packages to extend assets and event-driven behaviors while maintaining security sandbox boundaries.

**Independent Test**: Create a sample add-on package with event hooks, place it in app/public/addons/, enable it via settings UI, verify hooks execute at correct lifecycle points without accessing restricted operations, disable add-on and confirm core functionality unaffected.

- [ ] T095 [P] Create Addon model with permissions and hooks in app/src/models/Addon.ts
- [ ] T096 [P] Create AddonHookDescriptor and AddonAssetRef models in app/src/models/AddonComponents.ts
- [ ] T097 Implement add-on registration service in app/src/services/addons/AddonRegistry.ts
- [ ] T098 Implement sandboxed execution environment using Web Workers with message passing protocol (structured clone for data exchange, no shared memory, timeout enforcement) in app/src/addons/sandbox/SandboxWorker.ts
- [ ] T099 Implement add-on permission validation in app/src/services/addons/PermissionValidator.ts
- [ ] T100 Create add-on lifecycle hooks interface in app/src/addons/hooks/LifecycleHooks.ts
- [ ] T101 Implement event hook execution (onPlacementReady, onBeforePreview, onAfterPreview, onExecutionTick) in app/src/addons/hooks/HookExecutor.ts
- [ ] T102 [P] Create add-on asset loader for external resources in app/src/services/addons/AssetLoader.ts
- [ ] T103 Create add-on management UI in settings panel in app/src/ui/settings/AddonManager.tsx
- [ ] T104 [P] Add persistence for enabled add-ons using Dexie in app/src/services/storage/AddonRepository.ts
- [ ] T105 Implement add-on schema validation with Zod in app/src/schemas/addonSchema.ts
- [ ] T106 [P] Create sample add-on package template in app/public/addons/sample-addon/
- [ ] T107 Add add-on error handling and fallback mechanisms in app/src/services/addons/ErrorHandler.ts
- [ ] T108 Implement add-on security boundary tests to prevent privileged access in app/tests/integration/addon-security.test.ts
- [ ] T108a Run regression validation across at least three representative add-ons covering placement, diagram, and execution workflows in app/tests/integration/addon-regressions.test.ts

**Checkpoint**: Add-on system functional - external packages can extend simulator while maintaining security constraints.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T109 [P] Create user documentation for placement mode in app/public/docs/placement-guide.md
- [ ] T110 [P] Create user documentation for diagram configuration in app/public/docs/diagram-guide.md
- [ ] T111 [P] Create user documentation for execution preview in app/public/docs/execution-guide.md
- [ ] T112 [P] Create add-on developer documentation in app/public/docs/addon-development.md
- [ ] T113 [P] Add in-app help overlays for placement tools in app/src/ui/help/PlacementHelp.tsx
- [ ] T114 [P] Add in-app help overlays for diagram settings in app/src/ui/help/DiagramHelp.tsx
- [ ] T115 [P] Add in-app help overlays for execution controls in app/src/ui/help/ExecutionHelp.tsx
- [ ] T116 Optimize PixiJS rendering for 200+ landmarks performance target in app/src/canvas/renderer/optimizations.ts
- [ ] T117 Implement object pooling for train renderers to reduce GC pressure in app/src/canvas/renderer/ObjectPool.ts
- [ ] T118 Add memory usage monitoring to maintain <256MB budget in app/src/services/monitoring/memoryMonitor.ts
- [ ] T119 Implement validation performance optimization for <200ms on 50-train scenarios in app/src/services/validation/optimizations.ts
- [ ] T120 Run determinism verification with seeded scenarios across replays in app/tests/benchmarks/determinism-check.ts
- [ ] T121 Verify 60 simulation minutes render in <5 real minutes per SC-004 in app/tests/benchmarks/execution-performance.ts
- [ ] T121a Automate baseline benchmark for 100 trains and 500 track segments sustaining ≤100 ms per simulation tick in app/tests/benchmarks/baseline-100x500.test.ts
- [ ] T122 [P] Create ja-JP locale bundle with complete translations for all UI strings in app/src/i18n/locales/ja-JP.json
- [ ] T122a [P] [Localization] Create E2E test validating locale switching with numeric/time formatting verification and text translation completeness in app/tests/e2e/i18n.spec.ts
- [ ] T123 Implement schema migration utilities for future data model changes in app/src/services/storage/migrations.ts
- [ ] T124 Add offline capability verification after initial load in app/tests/integration/offline-mode.test.ts
- [ ] T125 [P] Create release notes template documenting new features in app/public/docs/release-notes.md
- [ ] T126 Implement accessibility improvements (ARIA labels, keyboard navigation) in app/src/ui/accessibility/
- [ ] T127 Add error boundary components for graceful failure handling in app/src/ui/common/ErrorBoundary.tsx
- [ ] T128 Run quickstart.md validation scenarios in app/tests/e2e/quickstart.spec.ts
- [ ] T129 Perform usability testing for 15-minute route creation per SC-001 and document results
- [ ] T129a Conduct diagram configuration usability study documenting ≥90% comprehension among beta testers with findings published in app/public/docs/usability/diagram-study.md
- [ ] T130 Final code cleanup and refactoring with Biome formatting across all files
- [ ] T131 Verify all constitution guardrails met (quality, testing, UX, performance) per plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - No other story dependencies
- **User Story 2 (Phase 4)**: Depends on Foundational completion - References infrastructure from US1 but independently testable
- **User Story 3 (Phase 5)**: Depends on Foundational completion - References routes from US2 but independently testable
- **Add-on System (Phase 6)**: Depends on Foundational completion - Can be developed in parallel with user stories
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Reads infrastructure created by US1 but independently testable (can use mock data)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Reads routes created by US2 but independently testable (can use mock data)

### Within Each User Story

**User Story 1**:
1. Models (T025-T030) can all run in parallel
2. Services (T031-T034) depend on models but can run in parallel with each other
3. Renderers (T035-T038) can run in parallel after models exist
4. UI components (T039, T042-T043) can start after services
5. Interaction handlers (T040-T041, T044-T045) depend on services
6. Repositories (T046-T049) can run in parallel after models
7. Canvas controls (T050-T052) can run in parallel
8. Final integration (T053-T054) after core implementation

**User Story 2**:
1. Models (T055-T058) can all run in parallel
2. Services (T059, T064) depend on models
3. UI components (T060, T062-T063, T065-T066, T069) can proceed after services
4. Repositories (T067-T068) can run in parallel after models
5. Validation and navigation (T061, T070-T072) in middle phase
6. Localization (T073) can run in parallel

**User Story 3**:
1. Models (T074-T075) can run in parallel
2. Core services (T076-T083) sequential flow for simulation logic
3. UI components (T079-T080, T084, T093) after services ready
4. Renderers (T085-T087) can run in parallel after models
5. Supporting utilities (T088-T094) can be parallelized by category

### Parallel Opportunities

- All Setup tasks marked [P] (T003-T009) can run in parallel
- All Foundational tasks marked [P] (T011-T023) can run in parallel within Phase 2
- Once Foundational phase completes, US1, US2, US3, and Add-on System can all start in parallel if team capacity allows
- Within each user story, all tasks marked [P] can run in parallel
- Models within a story can typically run in parallel
- Renderers can run in parallel after models exist
- Repositories can run in parallel after models exist
- Documentation tasks in Polish phase can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase complete, launch all US1 models together:
T025: "Create Landmark model with validation in app/src/models/Landmark.ts"
T026: "Create TrackSegment model with validation in app/src/models/TrackSegment.ts"
T027: "Create Station model with validation in app/src/models/Station.ts"
T028: "Create Depot model with validation in app/src/models/Depot.ts"
T029: "Create Platform and StoppingTrack models in app/src/models/StationComponents.ts"
T030: "Create StoppingLane and DepotInventoryItem models in app/src/models/DepotComponents.ts"

# Then launch all US1 renderers together:
T035: "Create PixiJS renderer for landmarks in app/src/canvas/renderer/LandmarkRenderer.ts"
T036: "Create PixiJS renderer for track segments in app/src/canvas/renderer/TrackRenderer.ts"
T037: "Create PixiJS renderer for station areas in app/src/canvas/renderer/StationRenderer.ts"
T038: "Create PixiJS renderer for depot areas in app/src/canvas/renderer/DepotRenderer.ts"

# Then launch all US1 repositories together:
T046: "Add persistence for landmarks in app/src/services/storage/LandmarkRepository.ts"
T047: "Add persistence for track segments in app/src/services/storage/TrackRepository.ts"
T048: "Add persistence for stations in app/src/services/storage/StationRepository.ts"
T049: "Add persistence for depots in app/src/services/storage/DepotRepository.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T024) - CRITICAL foundation
3. Complete Phase 3: User Story 1 (T025-T054)
4. **STOP and VALIDATE**: Test US1 independently per acceptance scenarios
5. Deploy/demo infrastructure placement capability

**MVP Delivers**: Complete placement mode for drawing stations, depots, tracks with elevation, intersections, and persistence - usable standalone for map design.

### Incremental Delivery

1. **Foundation** (Setup + Foundational) → Project initialized with core services
2. **MVP Release** (+ User Story 1) → Placement mode ready → Deploy/Demo
3. **Route Planning Release** (+ User Story 2) → Diagram configuration added → Deploy/Demo
4. **Full Simulation Release** (+ User Story 3) → Execution preview functional → Deploy/Demo
5. **Extensibility Release** (+ Add-on System) → Third-party content support → Deploy/Demo
6. **Production Release** (+ Polish) → Performance optimized, documented, localized

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (critical blocking work)
2. Once Foundational is done (after T024):
   - **Developer A**: User Story 1 (Placement) - T025-T054
   - **Developer B**: User Story 2 (Diagram) - T055-T073
   - **Developer C**: User Story 3 (Execution) - T074-T094
   - **Developer D**: Add-on System - T095-T108
3. Stories integrate at well-defined boundaries:
   - US2 consumes US1's persisted infrastructure
   - US3 consumes US2's route definitions
   - Add-ons hook into all lifecycle events
4. Polish phase (T109-T131) can be distributed by category

---

## Success Metrics

Per spec.md Success Criteria:

- **SC-001**: Route creation in <15 minutes → Validate with usability testing (T129)
- **SC-002**: 100% conflict detection → Covered by T077-T078 validation
- **SC-003**: 90% diagram usability → Validate with beta testing (T129a)
- **SC-004**: 60 sim minutes in <5 real minutes → Benchmarked by T024a + T121
- **SC-005**: Add-on compatibility → Verified by T106-T108 + regression suite T108a
- **SC-006**: Multi-locale support → Delivered by T019, T122 + validation T122a
- **SC-007**: 100 trains / 500 segments ≤100 ms tick → Benchmarked by T121a

---

## Notes

- **[P] tasks** = different files, no dependencies, can execute in parallel
- **[Story] label** maps task to specific user story for traceability and independent testing
- Each user story should be independently completable and testable per constitution Principle 2
- Verify deterministic simulation outcomes using seeded scenarios per Principle 4
- Commit after each task or logical group per constitution Principle 1 review requirements
- Stop at any checkpoint to validate story independently
- **No tests generated** unless explicitly requested per project conventions
- Focus on performance budgets: 60 fps rendering, <200ms validation, <256MB memory
- Maintain offline capability throughout per plan.md constraints

````