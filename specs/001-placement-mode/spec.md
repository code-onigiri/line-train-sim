# Feature Specification: Placement Mode Foundations

**Feature Branch**: `001-placement-mode`  
**Created**: 2025-11-04  
**Status**: Draft  
**Input**: User description: "Placement mode: draw stations, depots, and tracks. Stations and depots can have selectable areas; stations allow drawing platforms and stopping tracks; depots allow drawing stopping lanes and regular tracks. Draw tracks point-to-point (landmarks), allow branching and elevated/underground tracks; tracks are straight lines between points. Intersections create points. Place vehicles in depots with quantity and type (speed variations). Flow: setup route -> select stations for route -> diagram settings screen (horizontal time axis, vertical draggable stations) -> select starting station/depot, extend to other stations, set endpoint (start/end must be station or depot) -> specify train cars -> preview. Execution mode: execute diagram with adjustable time speed (respect train speeds and overlaps). Trains shown as single rectangles; when turning, represented as two trapezoids bending along corner normals. Ensure no overlapping train cars at stations by validating line availability. Support add-ons."

## Constitution Guardrails *(mandatory)*

- **Rigorous Code Quality**: Maintain schematic tooling and simulation data structures under existing linting and architectural review gates; require peer review to confirm geometric primitives, route state transitions, and add-on hooks adhere to shared modelling guidelines.
- **Test-Driven Reliability**: Provide unit tests for landmark geometry, station/depot configuration, vehicle assignment, and timetable validation plus end-to-end regression scenarios covering placement-to-preview flow; enforce ≥90% coverage for placement calculations and timetable conflict detection.
- **Consistent User Experience**: Align placement, diagram, and execution screens with existing simulator visual language; update in-game help/tutorial copy describing new workflow stages and note add-on availability in release notes; no deprecations anticipated.
- **Performance and Determinism**: Support editing maps with at least 200 landmarks and 50 concurrent trains while maintaining deterministic outcomes via seedable simulation state and repeatable timeline playback checks; measure editing responsiveness and execution tick rate on reference hardware, including a baseline benchmark with 100 trains and 500 track segments sustaining ≤100 ms per simulation tick per constitution requirements.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lay Route Infrastructure (Priority: P1)

A route planner sketches stations, depots, and point-to-point tracks to establish a service corridor before any timetable work begins.

**Why this priority**: Without an accurate physical layout, the simulator cannot support timetable creation or execution.

**Independent Test**: Fully testable by creating a new map, placing required infrastructure, saving, and reloading to confirm fidelity.

**Acceptance Scenarios**:

1. **Given** a blank placement canvas, **When** the planner draws a station area and assigns platforms and stopping tracks, **Then** the station persists with selectable platform geometry and usable stopping tracks.
2. **Given** two landmarks on the map, **When** the planner connects them with a track segment and sets slope percentage manually, **Then** a straight track appears with the slope attribute accessible for later editing.
3. **Given** two crossing track segments with vertical separation <4m (measured from track rail top surface), **When** they intersect, **Then** the system creates a new landmark at the intersection that can be used as a branching anchor.
4. **Given** existing placed infrastructure, **When** the planner selects an element and modifies its properties (e.g., station name, track slope), **Then** changes persist to storage and visual rendering updates immediately on the canvas.

---

### User Story 2 - Configure Route Diagram (Priority: P2)

A timetable designer takes an existing layout, defines a route, selects its stations, and configures diagram settings before committing train assignments.

**Why this priority**: Structured routes and diagram settings are essential to produce a coherent timetable preview.

**Independent Test**: Testable by selecting a subset of infrastructure, building a route sequence, arranging diagram axes, and verifying preview readiness without running execution mode.

**Acceptance Scenarios**:

1. **Given** an existing placement, **When** the designer chooses a starting station or depot and extends the route through selected stations, **Then** the system enforces both start and end points as valid stations or depots.
2. **Given** the diagram settings screen, **When** the designer drags station rows on the vertical axis, **Then** the updated order reflects immediately on the timeline preview.
3. **Given** the designer assigns vehicle counts and types to the route, **When** the configuration is saved, **Then** the preview summarizes consist lengths and speed categories.

---

### User Story 3 - Validate Execution Preview (Priority: P3)

An operations lead previews and runs the timetable, adjusting time speed and ensuring trains honour signals without overlapping in stations.

**Why this priority**: The execution preview confirms that placement and diagram work produce a conflict-free service before committing to publication.

**Independent Test**: Verified by launching execution mode for a configured route, manipulating playback speed, and observing conflict resolution without editing infrastructure.

**Acceptance Scenarios**:

1. **Given** a generated timetable preview, **When** execution mode runs at accelerated time, **Then** train movement respects individual speed profiles and maintains schedule ordering.
2. **Given** two trains scheduled to occupy the same stopping track, **When** validation runs before execution, **Then** the system blocks the conflict and guides the user to select an alternate line or timing.
3. **Given** a train navigating a corner, **When** it turns, **Then** the visual representation transitions from a rectangle into two trapezoids aligned with the corner normal.

---

### Edge Cases

- What happens when a route loops back to its origin? The system must detect loops and display a warning; if validation error occurs, prevent execution until the designer inserts an intermediate landmark to break the loop.
- How does system handle an elevated track intersecting an underground track? The intersection should not create a shared landmark if vertical separation is ≥4m (train clearance height), keeping paths independent.
- How is deterministic output preserved when multiple trains adjust speeds simultaneously? The execution engine must sequence updates by timetable order and shared seed to avoid diverging results across replays.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Placement mode MUST allow users to create and name new routes that reference existing stations or depots once the necessary infrastructure is in place.
- **FR-002**: Placement mode MUST support drawing station areas with configurable platforms and stopping tracks that can be individually selected and edited.
- **FR-003**: Placement mode MUST support drawing depot areas with configurable stopping lanes and regular tracks used for staging trains.
- **FR-004**: Placement mode MUST enable creation of landmarks and straight track segments between landmarks, including branching from existing points.
- **FR-005**: The system MUST automatically generate a landmark whenever two track segments intersect with vertical separation less than train clearance height (4 meters); tracks separated by ≥4m are considered different elevation levels and do not create intersection landmarks.
- **FR-006**: Placement mode MUST let designers set track characteristics such as elevation (numeric height in meters); elevation changes between connected landmarks define slopes and do not propagate automatically to other segments.
- **FR-007**: Depot management MUST allow users to assign vehicle inventories by quantity and speed category for each depot.
- **FR-008**: Route definition MUST require selecting a valid station or depot as the starting point, extending through ordered stations, and finishing at a station or depot.
- **FR-009**: The diagram settings screen MUST display time horizontally and stations vertically, allowing drag-and-drop reordering of station rows with immediate feedback.
- **FR-010**: The system MUST capture consist definitions (train cars, counts, speed profiles) for each route and surface them in the preview.
- **FR-011**: Preview generation MUST validate that stopping tracks and depot lanes have sufficient capacity to avoid overlapping train cars during dwell periods.
- **FR-012**: Execution mode MUST respect user-selected time scaling while maintaining per-train speed constraints and preventing visual or logical overlaps.
- **FR-013**: Train visualization MUST render consist bodies as single rectangles on straight segments and as paired trapezoids that bend smoothly through corners.
- **FR-014**: The platform MUST expose an add-on interface that lets optional content register new assets and event-driven behaviors tied to simulator timing while preventing access to security-sensitive operations.
- **FR-015**: The user interface MUST support configurable locale packs with translated text, numeric, and time formatting for placement, diagram, and execution surfaces.

### Key Entities *(include if feature involves data)*

- **Landmark**: Spatial point defining track endpoints or intersections; stores coordinates, elevation, and connected segments.
- **Track Segment**: Straight connection between two landmarks with attributes for elevation, permissible speed, and whether it belongs to a depot or mainline.
- **Station**: Area selection containing named platforms and stopping tracks; references associated landmarks for entry and exit.
- **Depot**: Area selection containing stopping lanes, service tracks, and assigned vehicle inventory grouped by speed category.
- **Route**: Ordered list of stations and depots defining service flow, linked to diagram settings and assigned consists.
- **Vehicle Type**: Classification describing consist capabilities such as nominal speed tier and capacity, used when assigning trains to depots and routes.
- **Scheduled Train**: Timetabled movement referencing a route, vehicle type, and dwell/arrival times for validation and execution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Experienced designers can create a complete route with at least four stations, one depot, and ten track segments in under 15 minutes during usability testing.
- **SC-002**: Validation catches 100% of intentional overlapping dwell conflicts across regression scenario suites before execution starts.
- **SC-003**: At least 90% of beta testers report that diagram configuration controls are understandable without external documentation.
- **SC-004**: Execution previews render 60 simulation minutes in under 5 real-time minutes on reference hardware while preserving consistent outcomes across repeated runs.
- **SC-005**: Add-on content can be installed and activated without regressions in core placement mode across three representative external packages.
- **SC-006**: At least two locales ship at launch, and 90% of UI copy in usability tests reflects the selected locale’s language and formatting rules.
- **SC-007**: Baseline scenario with 100 trains and 500 track segments sustains ≤100 ms per simulation tick on reference hardware with a documented measurement procedure.

## Assumptions & Dependencies

- External asset add-ons follow documented content schemas and do not bypass validation logic.
- Reference hardware for performance measures: Average consumer PC (non-gaming grade) with modern CPU, 8-16GB RAM, integrated or entry-level discrete GPU.
- Target browser versions: Chrome 142+, Firefox 144+, Safari 26.0+ (latest evergreen releases as of November 2025).
- Existing save/load infrastructure remains available to persist placement and timetable data for testing scenarios.

## Clarifications

### Session 2025-11-04

- Q: What level of executable capability should add-ons provide? → A: Add-ons can register event-timed gameplay code but must not perform security-sensitive actions.

### Session 2025-11-05 (Analysis Refinements)

- Q: How are elevation slopes calculated between landmarks? → A: Slope calculation is **manual entry** by the user; the system stores slope percentage on each track segment but does not automatically derive it from landmark elevation differences.
- Q: What is the measurement reference point for elevation and clearance? → A: All elevation values (landmark heights and vertical separation for clearance) are measured from **track rail top surface**.
- Q: What defines "experienced designers" in SC-001? → A: Users who have completed the in-app tutorial and successfully created at least one route with minimum 2 stations.
- Q: How does the system handle route loops? → A: Loop detection algorithm identifies when a route returns to a previously visited station; system displays a **warning message** and **prevents execution** until the designer inserts an intermediate landmark to break the circular path.
- Q: How are dwell durations determined for capacity validation? → A: Dwell durations are configured per route stop in the diagram settings screen; default values provided based on station type (terminal: 5min, intermediate: 2min) but user-adjustable.
- Q: Can routes include depots as intermediate stops? → A: No, depots are permitted **only as start or end points**; intermediate stops must be stations only.
- Q: How should train rendering handle multiple consecutive corners? → A: Train visualization transitions to trapezoid mode when entering a corner and maintains trapezoid geometry until the train fully exits onto a straight segment; consecutive corners chain trapezoid transformations without snapping back to rectangles.
