# Implementation Plan: Opentale Screenplay Editor

**Branch**: `001-screenplay-editor` | **Date**: 2026-05-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-screenplay-editor/spec.md`

## Summary

Build Opentale — an open-source, multiplatform screenwriting tool — as a Flutter 3.x application
targeting macOS, Windows, Linux, iOS, Android, and Web from a single Dart codebase. The application
enables writers to create industry-standard formatted screenplays, organise their work with an
index-card outline board, track character arcs and dialogue, and sync/collaborate across devices
using a Yjs CRDT backend. Architecture follows Clean Architecture with feature-sliced modules,
Riverpod 3.x for state management, Drift for local SQLite storage, and `appflowy_editor` as the
editor engine with custom screenplay block types.

## Technical Context

**Language/Version**: Dart 3.6+ / Flutter 3.x (pinned via FVM in `.tool-versions`)
**Primary Dependencies**:
- `appflowy_editor` — block-tree editor engine with custom screenplay node types
- `riverpod 3.x` + `riverpod_generator` — state management and DI
- `drift` — type-safe SQLite ORM (reactive streams, migrations, compile-time queries)
- `go_router` — declarative routing
- `pdf` — Dart-native PDF generation for screenplay export
- `very_good_analysis` — strict lint ruleset
- `melos` — monorepo orchestration (scripts, versioning, change-filtered CI)

**Backend** (optional self-hosted sync relay):
- Go 1.22+ with `gorilla/websocket` implementing the `y-websocket` protocol
- PostgreSQL 16 for document snapshots and user accounts
- Docker Compose for local development

**Storage**: Drift (SQLite via `sqlite3` FFI on desktop/mobile, WASM on web). Yjs binary snapshots
stored as BLOBs alongside relational tables for character/scene analytics.

**Sync protocol**: Yjs CRDT + `y-websocket` binary message framing. Client (`packages/sync_client`)
exchanges binary Yjs updates with the Go relay server. Offline writes are queued locally and flushed
on reconnect. Conflict resolution is automatic and convergent (CRDT property).

**Testing**:
- Unit: `flutter_test` + `mocktail` + `fake_async`; Riverpod `ProviderContainer(overrides)` for DI
- Widget: `flutter_test` + `ProviderScope(overrides)` for screen-level component tests
- Visual regression: `alchemist` (pinned Linux CI runner for deterministic font rendering)
- Integration/E2E: `integration_test` + `patrol` (native automation on real devices/emulators)
- Coverage: 80% minimum enforced via `lcov` in CI; failing coverage blocks PR merge

**Target Platform**: iOS 17+, Android API 26+, macOS 13+, Windows 10+, Ubuntu 22.04+, Web (Chrome/Firefox/Safari)

**Project Type**: Cross-platform desktop + mobile application (monorepo)

**Performance Goals**:
- Outline reorder: scene list update visible within 2 seconds for ≤120 scenes
- Character dashboard load: ≤3 seconds for a 120-page screenplay
- Editor keystroke response: ≤100 ms (Flutter Impeller rendering budget)
- Sync latency: ≤30 seconds from save on device A to availability on device B (online)

**Constraints**:
- Single Dart/Flutter codebase across all 6 platforms; no platform-specific forks
- Offline-first: app MUST be fully functional without network connectivity
- Open-source (MIT): no proprietary dependencies; all runtime libraries must be permissively licensed
- Contributor-friendly: code generation must be documented; `melos bootstrap` must be the single
  setup step; `melos run test` must work without any additional configuration

**Scale/Scope**: v1 targets individual writers and small collaborating teams (2–5 users per project).
Not designed for concurrent editing by 50+ users in v1.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality ✅

- Single Responsibility enforced by Clean Architecture layers (presentation / domain / data) in each
  feature module. Each layer has one job and does not reference layers above it.
- `very_good_analysis` strict linting enforced in CI; no suppressions without documented rationale.
- All public APIs in `packages/screenplay_model/`, `packages/screenplay_editor/`,
  `packages/fountain_parser/`, and `packages/sync_client/` MUST have dartdoc documentation.
- Duplication eliminated through the shared `screenplay_model` package (domain entities used by all
  features) and the `screenplay_editor` widget (one editor implementation, all platforms).

### II. Testing Standards ✅

- Tests are written alongside or before implementation. Pure-Dart packages (`screenplay_model`,
  `fountain_parser`) implement TDD strictly (Red-Green-Refactor).
- Every user story has ≥1 integration test covering its primary acceptance scenario
  (see `apps/opentale/test/integration/`).
- Repository contract test suite (`screenplay_model/lib/testing/repository_contract_tests.dart`)
  ensures all concrete Drift implementations honour their interface contracts.
- Flaky tests are treated as build failures and must be quarantined immediately.
- `alchemist` golden tests cover: screenplay element formatting, scene heading rendering, outline
  card layout. Goldens run on pinned Linux CI to eliminate font variance.

### III. User Experience Consistency ✅

- Single Flutter codebase guarantees pixel-perfect rendering parity across all platforms
  (Impeller renderer). No platform-specific UI forks.
- Design system tokens defined in `apps/opentale/lib/app/theme/` and consumed by all feature
  widgets. No ad-hoc colours, fonts, or spacing outside the token system.
- Error messages and empty states follow a single `AppErrorWidget` / `AppEmptyState` pattern defined
  in `apps/opentale/lib/shared/`.
- Accessibility: semantic labels on all interactive elements; minimum 44×44 pt touch targets on
  mobile; keyboard-navigable on desktop.

### IV. Performance Requirements ✅

- Performance budgets defined above; all three metrics have concrete targets in the spec
  (`SC-002`, `SC-003`, `SC-004`).
- Flutter Impeller renderer guarantees ≤16ms frame budget at 60fps; jank profiling runs on merge
  to `main` via `flutter drive --profile`.
- Drift reactive streams (`watchElements`) push delta updates only — no full document reload on
  each keystroke.
- CI benchmark job (`melos run benchmark`) runs a 120-scene screenplay through the outline reorder
  and character dashboard load paths; regression blocks merge.

**Post-design re-check**: All four principles pass. No Complexity Tracking violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-screenplay-editor/
├── plan.md              # This file
├── research.md          # Phase 0: Tech stack decisions
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Getting started guide
├── contracts/
│   ├── sync-api.md           # Go backend REST + WebSocket API
│   ├── fountain-format.md    # Fountain interchange format spec
│   ├── editor-widget-api.md  # ScreenplayEditorWidget public API
│   └── repository-interfaces.md # Domain layer repository interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (repository root)

```text
opentale/
├── apps/
│   └── opentale/                     # Flutter application (all 6 platforms)
│       ├── android/
│       ├── ios/
│       ├── linux/
│       ├── macos/
│       ├── web/
│       ├── windows/
│       ├── lib/
│       │   ├── main.dart
│       │   ├── bootstrap.dart         # Riverpod ProviderScope + app init
│       │   ├── app/
│       │   │   ├── app.dart           # Root MaterialApp + go_router
│       │   │   ├── router/            # Route definitions + guards
│       │   │   └── theme/             # Design system tokens
│       │   └── features/
│       │       ├── editor/            # US1: Screenplay editor
│       │       │   ├── data/          # DriftScreenplayRepository, DriftElementRepository
│       │       │   ├── domain/        # GetScreenplayUseCase, SaveElementUseCase, ExportUseCase
│       │       │   └── presentation/  # EditorScreen, ScreenplayToolbar providers
│       │       ├── outline/           # US2: Brainstorm & outline
│       │       │   ├── data/          # DriftSceneRepository, DriftBrainstormCardRepository
│       │       │   ├── domain/        # ReorderScenesUseCase, UpdateSynopsisUseCase
│       │       │   └── presentation/  # OutlineScreen, IndexCardBoard, ActStructureChart
│       │       ├── characters/        # US3: Character dashboard
│       │       │   ├── data/          # DriftCharacterRepository
│       │       │   ├── domain/        # GetCharacterStatsUseCase, RenameCharacterUseCase
│       │       │   └── presentation/  # CharacterDashboardScreen, ArcTimelineWidget
│       │       ├── sync/              # US4: Sync & collaboration
│       │       │   ├── data/          # SyncRepositoryImpl (WebSocket + Drift queue)
│       │       │   ├── domain/        # ConnectSyncUseCase, QueueUpdateUseCase
│       │       │   └── presentation/  # SyncStatusIndicator, ConflictResolutionDialog
│       │       ├── projects/          # Project & screenplay management
│       │       │   ├── data/
│       │       │   ├── domain/
│       │       │   └── presentation/  # ProjectsScreen, NewProjectDialog
│       │       └── auth/              # Authentication
│       │           ├── data/          # AuthRepositoryImpl (JWT + refresh token)
│       │           ├── domain/
│       │           └── presentation/  # LoginScreen, RegisterScreen
│       └── test/
│           ├── unit/                  # Use case tests, pure Dart
│           ├── widget/                # Flutter widget tests
│           └── integration/           # patrol E2E tests
├── packages/
│   ├── screenplay_model/              # Pure Dart: entities, repository interfaces, exceptions
│   │   ├── lib/src/
│   │   │   ├── models/                # Screenplay, Element, Scene, Character, Project, etc.
│   │   │   ├── repositories/          # Abstract interface classes
│   │   │   └── exceptions/            # Domain exception types
│   │   ├── lib/testing/               # Shared repository contract test helpers
│   │   └── test/                      # Model + enum tests
│   ├── fountain_parser/               # Pure Dart: Fountain format parser + serializer
│   │   ├── lib/src/
│   │   │   ├── parser.dart            # FountainParser
│   │   │   └── serializer.dart        # FountainSerializer
│   │   └── test/                      # Round-trip property tests + corpus tests
│   ├── screenplay_editor/             # Flutter: ScreenplayEditorWidget + ScreenplayEditorController
│   │   ├── lib/src/
│   │   │   ├── nodes/                 # Custom appflowy_editor node types per element type
│   │   │   ├── shortcuts/             # Keyboard shortcut handlers
│   │   │   └── style/                 # Screenplay-specific NodeWidgetBuilder styling
│   │   └── test/                      # Widget tests, golden tests (alchemist)
│   └── sync_client/                   # Dart: Yjs y-websocket protocol client
│       ├── lib/src/
│       │   ├── yjs_codec.dart          # Yjs binary update encode/decode
│       │   ├── websocket_channel.dart  # WebSocket connection management
│       │   └── offline_queue.dart      # Pending update queue
│       └── test/
├── backend/                           # Go sync relay server
│   ├── cmd/server/main.go
│   ├── internal/
│   │   ├── auth/                      # JWT generation + validation
│   │   ├── documents/                 # Screenplay CRUD, snapshot storage
│   │   ├── sync/                      # y-websocket relay, fan-out broadcaster
│   │   └── db/                        # PostgreSQL migrations + queries (pgx)
│   ├── go.mod
│   └── Dockerfile
├── docker-compose.yml
├── pubspec.yaml                        # Pub workspace root + Melos config
├── melos.yaml                          # (or melos: key in pubspec.yaml)
├── .tool-versions                      # Flutter + Dart version pin (FVM)
├── .github/workflows/
│   ├── ci-flutter.yml                  # Unit/widget/golden tests on every PR
│   ├── ci-integration.yml              # E2E tests on merge to main
│   └── ci-backend.yml                  # Go tests + build on backend changes
└── Makefile
```

**Structure Decision**: Feature-sliced monorepo with shared Dart packages. Each of the 4 user stories
maps to a dedicated feature module in `apps/opentale/lib/features/`. Shared domain logic and UI
contracts live in `packages/` to enable independent testing and future reuse (e.g., a CLI export
tool could use `fountain_parser` and `screenplay_model` without depending on Flutter).

## Complexity Tracking

> No Constitution Check violations — no complexity justification required.

All design decisions stay within the principles:
- 4 feature modules + 3 support modules (projects, auth, sync) — each single-responsibility
- 4 packages — each independently testable pure-Dart or Flutter packages
- 1 Go backend — single responsibility (sync relay only)
- Repository pattern justified: decouples domain from Drift implementation; enables contract tests
  without a real database; required for Riverpod provider override testing strategy
