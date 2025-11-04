# Research Log: Placement Mode Foundations

## Findings

- **Decision**: Use React 18 with PixiJS for the interactive placement canvas
  - **Rationale**: React provides a well-supported component model for UI panels, while PixiJS delivers GPU-accelerated 2D rendering suitable for large rail networks and touch input; ecosystem has proven key/touch integration patterns.
  - **Alternatives considered**: Konva (simpler API but lower performance for 200+ landmarks), Three.js (3D-focused, unnecessary complexity for 2D schematic)

- **Decision**: Persist session data in IndexedDB via Dexie with localStorage fallback for preferences
  - **Rationale**: IndexedDB handles larger datasets (routes, assets) offline with transactional safety; Dexie simplifies schema upgrades. localStorage covers lightweight settings when persistence requirements are minimal.
  - **Alternatives considered**: Raw IndexedDB (more boilerplate), Service Worker Cache (not suited for structured edits), WebSQL (deprecated)

- **Decision**: Employ Zustand for client-side state management and Zod for validation schemas
  - **Rationale**: Zustand offers minimal boilerplate with strong TypeScript support and works well with PixiJS render loops; Zod enables runtime validation aligning with deterministic test needs.
  - **Alternatives considered**: Redux Toolkit (heavier setup), MobX (less predictable mutation patterns)

- **Decision**: Adopt Vitest, React Testing Library, and Playwright for the testing stack
  - **Rationale**: Vitest integrates tightly with Bun/TypeScript, RTL covers component interactions, and Playwright provides cross-browser automation for key/touch parity and deterministic replay scenarios.
  - **Alternatives considered**: Jest (slower under Bun), Cypress (weaker multi-browser automation for touch controls)

- **Decision**: Introduce an add-on sandbox API exposing event hooks without privileged access
  - **Rationale**: Maintains extensibility while satisfying security constraint against privileged operations; event hooks allow timing-based behaviors and remain testable.
  - **Alternatives considered**: Deny script execution (limits feature goals), full scripting without sandbox (violates security requirement)
