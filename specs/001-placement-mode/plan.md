# Implementation Plan: Placement Mode Foundations

**Branch**: `001-placement-mode` | **Date**: 2025-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-placement-mode/spec.md`

## Summary

Implement the placement, diagram configuration, and execution preview workflow for line-train-sim as a browser-based TypeScript application bundled with Vite. The solution will deliver an interactive canvas for infrastructure editing, client-side timetable validation, and a real-time preview layer that honours train speed profiles and conflict detection while remaining extensible through sandboxed add-ons.

## Technical Context

**Language/Version**: TypeScript 5.x (ES2022 targeting Chrome 142+, Firefox 144+, Safari 26.0+)  
**Runtime**: Bun 1.x for package management, script execution, and test running  
**Build Tool**: Vite 5.x with React plugin for fast HMR and optimized production builds  
**Primary Dependencies**: React 18, PixiJS for high-performance 2D rendering, Zustand for state management, Dexie for IndexedDB access, Zod for runtime validation  
**Storage**: IndexedDB (via Dexie) with localStorage fallback for lightweight preferences  
**Testing**: Vitest + React Testing Library + Playwright for interaction regression packs (executed via Bun)  
**Target Platform**: Modern desktop and mobile browsers (Chrome 142+, Firefox 144+, Safari 26.0+) distributed via Vite-built static bundle  
**Project Type**: Web client (single-page application)  
**Performance Goals**: Maintain 60 fps canvas interactions with up to 200 landmarks and 50 concurrent trains; execution preview must simulate 60 in-game minutes in ≤5 real minutes per spec SC-004  
**Constraints**: Time-scaling controls must respond within 150 ms, validation results return in ≤200 ms for 50-train scenarios, memory footprint ≤256 MB in client session, offline-capable after initial load  
**Scale/Scope**: Support maps up to 200 landmarks, 50 trains, 20 routes, and 3 concurrent add-ons per session  
**Reference Hardware**: Average consumer PC (non-gaming): modern multi-core CPU, 8-16GB RAM, integrated or entry-level discrete GPU  
**Developer Tooling**: Biome 1.x for linting/formatting; Vite dev server with Bun runtime for local development with HMR

## Constitution Check

1. **Rigorous Code Quality**: Enforce Biome (lint + format), TypeScript strict mode, and PixiJS-specific lint rules in Bun-based CI. PR checklist will require lint/test snapshots plus manual verification of add-on sandbox boundaries.
2. **Test-Driven Reliability**: Author route geometry unit tests (landmark creation, intersections), depot inventory validation tests, and execution preview conflict detection tests before feature work. Maintain ≥90% coverage on simulation-critical modules; use deterministic seeds for playback verification in Playwright.
3. **Consistent User Experience**: Primary surfaces include placement canvas, diagram settings panel, and execution preview controls. Update in-app help overlays and release notes to document touch gestures, keyboard shortcuts, and add-on sandbox limitations. No migrations required for existing saves beyond documented schema bump.
4. **Performance and Determinism**: Instrument PixiJS render loop and validation pipelines with performance markers captured via Web Performance APIs. Provide Bun script to replay seeded scenarios, ensuring identical results across runs. Benchmark maps with 200 landmarks and 50 trains to confirm budgets.

## Project Structure

### Documentation (this feature)

```text
specs/001-placement-mode/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── public/
│   └── index.html
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes/
│   ├── canvas/
│   │   ├── renderer/
│   │   └── interactions/
│   ├── state/
│   ├── services/
│   │   ├── validation/
│   │   └── storage/
│   ├── addons/
│   └── ui/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

**Structure Decision**: Single-page web client housed under `app/`; subdirectories isolate rendering, domain state, storage, and add-on sandboxing while aligning with testing quadrants in `app/tests/`.

## Complexity Tracking

No constitution exceptions required at this time; table intentionally left empty.
