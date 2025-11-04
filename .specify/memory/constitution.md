<!--
Sync Impact Report
Version change: none -> 1.0.0
Modified principles: Initial baseline established (new principles defined)
Added sections: Core Principles, Engineering Standards, Delivery Workflow, Governance
Removed sections: Placeholder Principle 5 block
Templates requiring updates:
- updated .specify/templates/plan-template.md
- updated .specify/templates/spec-template.md
- updated .specify/templates/tasks-template.md
Follow-up TODOs: none
-->
# Line Train Sim Constitution

## Core Principles

### Principle 1: Rigorous Code Quality
- Every change MUST pass automated formatting, linting, and static analysis gates before review.
- Complex logic MUST include inline rationale or docstrings so future contributors understand intent.
- Architectural or dependency shifts MUST be justified in the associated plan/spec so impacts stay traceable.
*Rationale*: Enforced hygiene keeps the simulation codebase maintainable and lowers onboarding effort.

### Principle 2: Test-Driven Reliability
- Features MUST include failing tests (unit and, when user flows are impacted, integration) before implementation.
- Simulation-critical modules MUST sustain >=90% line coverage, with deterministic seeds captured in tests.
- CI MUST run the full automated suite on every pull request; any failure blocks merge until resolved.
*Rationale*: High-confidence tests ensure timetable logic and physics remain dependable as the model evolves.

### Principle 3: Consistent User Experience
- Command interfaces and output formats MUST follow the documented UX contract; changes require a spec-approved migration path and release notes.
- User-facing text, flags, and configuration keys MUST remain stable unless deprecation notices ship one release in advance.
- Documentation updates MUST ship alongside any behavior or interface change users can observe.
*Rationale*: Predictable interactions keep dispatchers and tool integrators effective without relearning workflows.

### Principle 4: Performance and Determinism
- Baseline scenarios (100 trains, 500 segments) MUST simulate at <=100 ms per tick on reference hardware defined in specs.
- Performance budgets MUST appear in feature specs with explicit measurement plans; regressions over 5% require remediation tasks before release.
- Simulation results MUST remain deterministic under identical inputs; randomness requires seeded controls stored with the run configuration.
*Rationale*: A fast, repeatable simulation keeps planning iterations responsive and comparisons trustworthy.

## Engineering Standards

- Repository MUST maintain a single, documented coding style enforced via automated tooling stored in version control.
- Dependencies MUST be pinned with reproducible lockfiles; upgrades require regression testing notes in the plan.
- Observability hooks (logging, metrics, trace IDs) MUST exist around performance-critical flows to validate Principle 4 budgets.
- Security-sensitive data (credentials, private topology) MUST stay out of source control and rely on environment configuration.

## Delivery Workflow

- Work begins with an approved spec and plan demonstrating compliance with all Core Principles.
- Implementation tasks MUST map directly to user stories and declare the tests they add or update.
- Pull requests MUST include evidence of local test runs and, when applicable, performance benchmarking outputs.
- Release notes MUST list UX-impacting changes, new configuration defaults, and updated performance baselines.

## Governance

- This constitution overrides conflicting process guidance; deviations require a governance-approved exception documented in the repository.
- Amendments require consensus from one maintainer representing simulation accuracy, one representing user experience, and an implementation plan capturing migration impact.
- Versioning follows semantic rules: MAJOR for breaking principle changes, MINOR for new principles or major expansions, PATCH for clarifications.
- Compliance reviews occur at each spec approval and before merging feature branches; unresolved violations block release until remediated or formally excepted.

**Version**: 1.0.0 | **Ratified**: 2025-11-04 | **Last Amended**: 2025-11-04
