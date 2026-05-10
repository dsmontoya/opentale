# Research: Opentale Screenplay Editor

**Phase**: 0 — Tech Stack & Architecture Research
**Date**: 2026-05-09
**Input**: Feature spec at `specs/001-screenplay-editor/spec.md`
**User constraint**: Single codebase for desktop + mobile + web; highest code and testing standards;
easy for contributors to maintain and test.

---

## 1. Multiplatform Framework

**Decision**: Flutter 3.x (Dart 3.x)

**Rationale**: Flutter is the only framework that delivers *official, stable, production-ready* builds
across all six required targets — iOS, Android, macOS, Windows, Linux, and Web — from a single Dart
codebase. Measured code reuse sits at 90–95% across platforms. Flutter's Impeller rendering engine
(stable on all platforms as of 2025) delivers consistent 60/120 fps with pixel-perfect typography
consistency — essential for a custom editor that formats screenplay elements precisely. The `flutter_test`
+ golden test infrastructure provides superior UI regression tooling compared to any React Native
equivalent. Dart 3.x brings sound null safety, sealed classes, pattern matching, and records — all of
which reduce a contributor's ability to write unsafe code silently.

**Alternatives considered**:
- React Native: Mobile-only officially; desktop targets are community-maintained with compatibility
  gaps; true multiplatform requires three separate UI trees, collapsing code reuse to ~40–60%.
- Electron/Tauri + React: Desktop + web, not mobile; requires a separate React Native codebase for
  iOS/Android. Does not satisfy single-codebase requirement.
- Kotlin Multiplatform: Shares logic but not UI; platform-specific UI layers still required per target.

---

## 2. Flutter Editor Engine

**Decision**: `appflowy_editor`

**Rationale**: AppFlowy Editor's architecture models a document as a **tree of typed nodes**, which maps
directly to screenplay's block-type structure. Each screenplay element — scene heading, action, character
cue, dialogue, parenthetical, transition — becomes a named `Node` type with its own `NodeWidgetBuilder`.
Custom block types are first-class citizens: register a type, provide a builder, attach shortcut events
(Tab-to-advance to next element type, Enter-to-create dialogue from character cue). AppFlowy ships this
editor in production; the library has 79–80% test coverage, 90+ contributors, and 53+ releases. The
AppFlowy team previously used `flutter_quill` and explicitly migrated away citing extensibility and test
coverage deficiencies — a strong signal.

**Alternatives considered**:
- `flutter_quill`: Flat Delta model from Quill.js — adequate for inline prose, awkward for structured
  block-type documents. Community support weak. Original author team migrated away.
- `super_editor`: Best architectural design (document/composer/editor separation, CSS-like stylesheet);
  excellent for screenplay elements via `ParagraphNode.blockType`. However, publishing dev-preview
  builds only (`0.3.0-dev.x`) with no standard pub release — too high a risk for a v1 contributor-facing
  codebase. Revisit at v1.1 once it reaches a stable release.
- Custom editor: Correct, performant, cross-platform rich text editors require multi-year engineering.
  Not viable for a v1 open-source project.

---

## 3. State Management

**Decision**: Riverpod 3.x with `riverpod_generator`

**Rationale**: Riverpod 3.x is the optimal choice for testability and contributor-friendliness:
- **Compile-time safety**: All providers are statically resolved; dependency graph errors surface at
  compile time, not runtime — critical for contributors who don't know the full provider graph.
- **Testability**: Any provider can be overridden in a `ProviderContainer(overrides: [...])` without
  mocking frameworks; this is the cleanest DI story in the Flutter ecosystem.
- **`riverpod_generator`**: Reduces boilerplate to annotated `@riverpod` functions; new contributors
  do not write `StateNotifier` subclasses.
- **`autoDispose`** prevents memory leaks by default, important for a document editor with potentially
  many open files.

**Note**: GetX is explicitly excluded. The GetX GitHub repository was deleted in April 2026, forcing
emergency migrations across thousands of projects. Even prior to deletion, its runtime-only type safety
and global singleton model made it untestable at scale.

**Alternatives considered**:
- Bloc/Cubit: Legitimate second choice; higher boilerplate; best-in-class `bloc_test` library; better
  for strict event audit trails (fintech/healthcare). Onboarding friction higher than Riverpod.
- Provider: Predecessor to Riverpod; `BuildContext` coupling; stagnant development.

---

## 4. Local Storage

**Decision**: Drift (SQLite ORM)

**Rationale**: Screenplay data is inherently relational — scripts contain scenes, scenes contain
elements, elements reference characters, characters appear in multiple scenes. Drift provides:
- Type-safe query API (compile-time invalid query detection)
- Reactive `Stream<T>` queries that auto-emit on data changes (perfect for syncing editor state)
- Full SQLite expressiveness (joins, foreign keys, migrations)
- Active maintenance by Stream (the company) with a clear roadmap
- Proven on all six Flutter platforms via `sqlite3` FFI

**Note**: Isar and Hive are both end-of-life — the original author has confirmed abandonment. Do not
use either for a new project.

**Alternatives considered**:
- Isar: Fastest raw insert speed (5ms/1000 rows vs Drift's 17ms), but abandoned — EOL confirmed. At
  human-speed writes, the performance advantage is meaningless.
- Hive: Isar's predecessor, also abandoned.
- ObjectBox: Strong NoSQL alternative, company-backed; weaker for complex SQL joins.
- sqflite: Raw SQLite without ORM; no type safety, no reactive queries; more boilerplate than Drift.

---

## 5. Sync Architecture

**Decision**: Yjs CRDT + WebSocket relay

**Rationale**: The spec requires offline-first editing with sync and conflict resolution. CRDTs are the
correct baseline: a CRDT document can be modified independently on any replica (device, user) and merged
automatically without coordination. Offline-first is a consequence of the data model, not a retrofit.

Yjs is the concrete CRDT library:
- Production proven at scale (~920K weekly npm downloads; used in production by the majority of
  collaborative open-source editors via Tiptap, ProseMirror, CodeMirror, and Quill bindings)
- Implements the YATA sequence CRDT algorithm with proven correctness
- Rich provider ecosystem: `y-websocket` for real-time relay, Hocuspocus as production-quality
  WebSocket server, `y-indexeddb` for web local persistence

**v1 implementation approach**:
- Client stores document state locally (Drift SQLite BLOB on mobile/desktop, IndexedDB on web)
- When online, client connects to relay server via WebSocket using the `y-websocket` protocol
- Relay broadcasts Yjs updates to connected clients and persists snapshots to PostgreSQL
- Conflict resolution is automatic and always convergent — no server-side merge logic required
- The ≤30s sync latency target is trivially satisfied; WebSocket updates propagate in milliseconds
  when online; the bound applies to reconnect/sync-on-reconnect scenarios

**Client library**: A Dart `sync_client` package wrapping the Yjs binary update protocol. The client
does not need to implement the full Yjs CRDT; it only encodes/decodes Yjs binary update messages and
manages WebSocket connectivity and local persistence.

**Alternatives considered**:
- OT (Jupiter/Google Docs): Requires central server coordination; offline-first is a retrofit, not
  native; transformation function correctness for all screenplay block types is complex.
- Last-write-wins: Simple but data-lossy under concurrent edits. Unacceptable for a writing tool.
- Automerge: Technically superior history model (causal DAG); better fit if branching revision history
  is a priority feature. Larger bundle, smaller ecosystem. Good v1.1 migration path.

---

## 6. Sync Relay Server

**Decision**: Go (with y-websocket-compatible relay)

**Rationale**: Go is optimal for an open-source sync server that contributors must run locally:
- **Single binary**: `go build` produces a self-contained binary; contributors run `go run .` or
  download a pre-built binary. No Docker required for local development.
- **Goroutine model**: Handles 10,000+ concurrent WebSocket connections at 20–120 MB RAM — the sync
  server's primary job is maintaining WebSocket connections and broadcasting CRDT updates.
- **Operational simplicity**: One binary, one config file, one PostgreSQL/SQLite connection. Easy to
  containerize (scratch image ~15 MB). Easy to self-host on a $5 VPS.
- **Standard library quality**: `net/http` + `gorilla/websocket` + `database/sql` are production-grade;
  fewer transitive dependencies reduces contributor onboarding friction and supply chain risk.

The server implements the `y-websocket` wire protocol (documented, straightforward binary framing)
so it is compatible with the same Yjs client libraries used in any future web dashboard.

**Alternatives considered**:
- Node.js/TypeScript + Hocuspocus: Second choice if a SaaS API layer (user accounts, billing, email)
  is built alongside the sync relay — shared TypeScript types between client and server have real value.
  Consider for v1.1 hosted offering.
- Python/FastAPI: GIL limits concurrent WebSocket handling; 10–26× slower than Go for CPU tasks;
  highest memory footprint. No deployment simplicity advantage.
- Rust: Fastest performance, lowest memory; contributor pool dramatically smaller. Overkill for v1.

---

## 7. Testing Toolchain

**Decision**: `flutter_test` + `integration_test` + `mocktail` + Riverpod `ProviderContainer` +
`alchemist` + `patrol`

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | `flutter_test` + `mocktail` + `fake_async` | Business logic, repositories, parsers |
| Widget | `flutter_test` + Riverpod `ProviderScope(overrides)` | Component-level UI |
| Visual regression | `alchemist` | Screenplay formatting, toolbar, layout |
| Integration / E2E | `integration_test` + `patrol` | Cross-device flows, offline/online sync |

**Coverage**: 80% minimum enforced via `lcov` in CI on every PR. New code must be covered.

**Testing pyramid target**: 70% unit / 20% widget / 10% integration.

**Rationale highlights**:
- `mocktail` requires no code generation (`build_runner`), reducing CI complexity and generated file
  noise in version control. New contributors can write a mock in five lines.
- Riverpod provider overrides eliminate the need for mocking DI wrappers entirely in widget tests.
- `alchemist` (preferred over `golden_toolkit`) provides better multi-theme support and is more
  actively maintained. Golden tests run on a pinned Linux CI runner to eliminate font rendering variance.
- `patrol` extends `integration_test` with native automation (system dialogs, permission prompts,
  background/foreground) — critical for testing offline→online sync resumption on real devices.

**Alternatives considered**:
- `mockito`: Requires `build_runner`; fine if already in use for JSON serialization. No strong
  reason to prefer over `mocktail` on a greenfield project.
- `golden_toolkit`: Less actively maintained than `alchemist`.

---

## 8. Monorepo Tooling

**Decision**: Pub Workspaces (Dart 3.6+) + Melos — both, as complementary tools

**Rationale**:
- **Pub Workspaces**: Single shared `pubspec.lock` at repo root guarantees all packages resolve to
  identical dependency versions. Interdependent local packages resolve automatically without
  `pubspec_overrides.yaml` hacks. `dart pub get` once handles the entire repo.
- **Melos**: Workflow orchestration on top of pub workspaces. `melos run test` runs tests across all
  packages; `--diff=origin/main` runs only packages touched by a PR (critical CI speed); `melos version`
  handles semantic versioning with Conventional Commits + automated CHANGELOG generation.

**Root `pubspec.yaml` (workspace declaration)**:
```yaml
name: _workspace
publish_to: none
environment:
  sdk: '>=3.6.0 <4.0.0'
workspace:
  - apps/opentale
  - packages/screenplay_model
  - packages/fountain_parser
  - packages/screenplay_editor
  - packages/sync_client
```

**Alternatives considered**:
- Pub Workspaces alone: Handles dependency resolution; lacks scripting, versioning, change-filtering.
  Insufficient for a growing 10+ package monorepo.
- Melos alone (pre-v5): Used `pubspec_overrides.yaml` for linking; deprecated. Melos v5+ requires
  pub workspaces as its foundation.

---

## Summary

| Area | Decision |
|------|----------|
| Framework | Flutter 3.x / Dart 3.x |
| Editor engine | `appflowy_editor` |
| State management | Riverpod 3.x + `riverpod_generator` |
| Local storage | Drift (SQLite ORM) |
| Sync protocol | Yjs CRDT + `y-websocket` |
| Sync server | Go (`y-websocket`-compatible relay) |
| Testing | `flutter_test` + `mocktail` + `alchemist` + `patrol` |
| Monorepo | Pub Workspaces + Melos |
| Linting | `very_good_analysis` |
| Navigation | `go_router` |
| PDF export | `pdf` package (Dart native) |
| CI | GitHub Actions (matrix: Flutter unit/widget, integration, backend) |
