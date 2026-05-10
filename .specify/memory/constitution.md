<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0 [initial ratification]

Modified principles: N/A (first version)

Added sections:
  - Core Principles (4 principles)
    - I. Code Quality
    - II. Testing Standards
    - III. User Experience Consistency
    - IV. Performance Requirements
  - Quality Gates
  - Development Workflow
  - Governance

Removed sections: N/A

Templates reviewed:
  - .specify/templates/plan-template.md      ✅ aligned (Constitution Check section present)
  - .specify/templates/spec-template.md      ✅ aligned (requirements, success criteria, acceptance scenarios)
  - .specify/templates/tasks-template.md     ✅ aligned (testing, polish, performance tasks covered)
  - .specify/templates/constitution-template.md ✅ source template (no changes required)

Follow-up TODOs:
  - None. All placeholders resolved.
-->

# Opentale Constitution

## Core Principles

### I. Code Quality

Every piece of code merged to the main branch MUST meet the following non-negotiable standards:

- Code MUST be readable, self-documenting, and reviewed by at least one other contributor before merge.
- Functions and modules MUST have a single, clearly stated responsibility (Single Responsibility Principle).
- Duplication MUST be eliminated through abstraction; copy-paste code is not permitted without explicit justification.
- All public APIs and exported symbols MUST include documentation (docstrings, JSDoc, or equivalent).
- Linting and formatting rules MUST pass in CI; no suppressions without documented rationale.

**Rationale**: Readable, well-structured code reduces onboarding friction, lowers defect rates, and makes
the codebase sustainable as the project scales.

### II. Testing Standards

Testing is non-negotiable and MUST follow a disciplined, layered approach:

- Tests MUST be written before or alongside implementation — not retroactively.
- Every user-facing feature MUST have at least one integration or end-to-end test covering its primary
  acceptance scenario.
- Unit tests MUST cover all business logic with meaningful assertions; coverage thresholds are enforced in CI.
- Tests MUST be deterministic and isolated; flaky tests MUST be fixed or quarantined immediately.
- The Red-Green-Refactor cycle MUST be followed: tests fail first, then implementation makes them pass,
  then code is refactored without breaking tests.
- Contract tests MUST be written for all inter-service or inter-module boundaries before implementation
  of those boundaries begins.

**Rationale**: Disciplined testing catches regressions early, validates requirements at the right boundary,
and gives the team confidence to refactor and ship at pace.

### III. User Experience Consistency

All user-facing surfaces (UI, CLI, API responses) MUST adhere to consistent design and interaction patterns:

- Visual and interaction patterns MUST follow the established design system or style guide; ad-hoc
  deviations are not permitted without a documented design decision.
- Error messages MUST be human-readable, actionable, and consistently formatted across all surfaces.
- Terminology, labels, and naming MUST be consistent across the entire product — divergent vocabulary
  requires a documented justification and a migration plan.
- New features MUST include UX review against existing patterns before implementation begins.
- Accessibility standards (WCAG 2.1 AA or equivalent for the target platform) MUST be met for all
  new user-facing components.

**Rationale**: Inconsistent UX increases cognitive load, erodes user trust, and multiplies support costs.
Consistency is a force-multiplier for usability.

### IV. Performance Requirements

Performance is a first-class requirement and MUST be treated as such from design through delivery:

- Performance budgets MUST be defined in the feature specification before implementation begins; targets
  are documented in `plan.md` under "Performance Goals".
- No feature MUST be shipped that demonstrably degrades existing performance baselines by more than 10%
  without explicit approval and a documented mitigation plan.
- Rendering or response time targets: interactive UI MUST respond to user input within 100 ms; API
  endpoints MUST return within agreed SLA (default: p95 ≤ 200 ms).
- Performance regressions detected in CI MUST block merges; they are treated with the same severity as
  failing tests.
- Profiling evidence MUST accompany any optimization that changes algorithmic complexity.

**Rationale**: Performance is a feature. Latency and throughput directly affect user satisfaction and
system scalability. Establishing budgets up front prevents performance debt from accumulating silently.

## Quality Gates

All pull requests MUST pass the following gates before merging:

- **CI green**: All tests pass, linting clean, no formatting violations.
- **Coverage threshold**: Unit test coverage MUST not drop below the project-defined minimum (set in CI
  config); new code MUST be covered.
- **Performance budget check**: No measurable regression against baseline benchmarks.
- **Constitution check**: PR author MUST attest that changes comply with all four Core Principles;
  reviewer MUST verify this attestation is reasonable.
- **UX review**: Any change to a user-facing surface requires sign-off from the UX lead or designated
  reviewer confirming consistency with the design system.

Exceptions to any gate require explicit, documented approval from a project maintainer and MUST be
tracked as technical debt with a resolution target date.

## Development Workflow

- **Specification first**: Features MUST have an approved spec (`spec.md`) before implementation begins.
  Implementation without a spec is not permitted for non-trivial changes.
- **Plan before code**: A `plan.md` MUST exist and include a completed Constitution Check section before
  any Phase 2 (Foundational) work starts.
- **Incremental delivery**: Work MUST be broken into independently testable user story slices. Each slice
  MUST be demonstrable and deployable on its own.
- **Commit discipline**: Commits MUST be atomic, with a clear imperative message. Squash commits are
  preferred on merge to keep history clean.
- **Dependency hygiene**: Third-party dependencies MUST be evaluated for license compatibility, maintenance
  health, and security posture before adoption.

## Governance

This constitution supersedes all other documented practices. Any practice that conflicts with a principle
defined here MUST be brought into alignment; the constitution takes precedence.

**Amendment procedure**:

1. Open a proposal issue describing the change and rationale.
2. Obtain approval from at least two maintainers.
3. Update this file following semantic versioning rules (see version policy below).
4. Document a migration plan if the amendment affects existing code or workflow.

**Versioning policy**:

- MAJOR bump: Removal or backward-incompatible redefinition of an existing principle.
- MINOR bump: Addition of a new principle, section, or materially expanded guidance.
- PATCH bump: Clarifications, wording improvements, typo fixes, non-semantic refinements.

**Compliance review**: Every sprint retrospective MUST include a brief constitution-compliance check.
All code reviews MUST verify adherence to the Core Principles. Persistent non-compliance MUST be raised
as a team process issue.

**Version**: 1.0.0 | **Ratified**: 2026-05-03 | **Last Amended**: 2026-05-03
