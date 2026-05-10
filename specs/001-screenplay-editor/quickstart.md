# Quickstart: Opentale Screenplay Editor

**Audience**: New contributors and developers
**Date**: 2026-05-09
**Prerequisites**: macOS, Linux, or Windows with admin access; internet connection for package downloads

---

## 1. Prerequisites

Install the following tools before cloning the repository.

### Flutter SDK (via FVM)

Opentale pins the Flutter version in `.tool-versions`. Use FVM to install the exact version:

```bash
# Install FVM (Flutter Version Manager)
dart pub global activate fvm

# From the repo root (after cloning), install the pinned Flutter version:
fvm install
fvm use
```

Verify:
```bash
fvm flutter --version
# Should print: Flutter 3.x.x, Dart 3.x.x
```

### Melos (monorepo orchestration)

```bash
dart pub global activate melos
```

### Go (for the optional sync server)

Install Go 1.22+ via your package manager or from https://go.dev/dl/

```bash
go version  # Should print: go1.22.x or later
```

### Docker (optional, for local backend)

Required only if running the full sync server stack locally. Install Docker Desktop or
Colima (macOS/Linux).

---

## 2. Clone and Bootstrap

```bash
git clone https://github.com/opentale/opentale.git
cd opentale

# Bootstrap all Dart/Flutter packages (pub get + code generation)
melos bootstrap

# Verify all packages resolve without errors:
melos run analyze
```

`melos bootstrap` runs `dart pub get` across all workspace packages and runs any
`build_runner` code generation (Drift table code, Riverpod generated files).

---

## 3. Run the Flutter App

### Desktop (macOS)

```bash
cd apps/opentale
fvm flutter run -d macos
```

### Desktop (Linux)

```bash
cd apps/opentale
fvm flutter run -d linux
```

### Desktop (Windows)

```powershell
cd apps\opentale
fvm flutter run -d windows
```

### Web

```bash
cd apps/opentale
fvm flutter run -d chrome
```

### iOS Simulator

```bash
# Open Simulator first:
open -a Simulator

cd apps/opentale
fvm flutter run -d iPhone  # or use the device name from `flutter devices`
```

### Android Emulator

```bash
# Start an AVD from Android Studio or:
emulator -avd Pixel_7_API_34

cd apps/opentale
fvm flutter run -d emulator-5554
```

---

## 4. Run Tests

### Unit + Widget Tests (all packages)

```bash
# Run all tests across all packages:
melos run test

# Run tests only in packages changed relative to main:
melos run test --diff=origin/main

# Run tests for a single package:
cd packages/fountain_parser
fvm flutter test --coverage
```

### Integration Tests (on device/emulator)

Integration tests require a connected device or running emulator:

```bash
cd apps/opentale
fvm flutter test integration_test/ -d <device_id>
```

### Coverage Report

```bash
cd apps/opentale
fvm flutter test --coverage
# Coverage report is written to coverage/lcov.info
# View HTML report (requires lcov installed):
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

Coverage MUST NOT drop below 80% for new code. CI enforces this automatically.

---

## 5. Run the Sync Server (Optional)

The Flutter app runs in local-only mode without the sync server. To test sync and
collaboration features, start the backend:

### With Docker Compose (recommended)

```bash
# From the repository root:
docker-compose up -d

# The sync server starts at: ws://localhost:8080/api/v1/sync/:id
# PostgreSQL starts at: localhost:5432 (user: opentale, pass: opentale)
```

### Without Docker (Go directly)

```bash
cd backend
cp .env.example .env   # Edit with your PostgreSQL connection string

go run ./cmd/server
# Server starts at: http://localhost:8080
```

Configure the Flutter app to point to the local server:
```bash
cd apps/opentale
fvm flutter run --dart-define=SYNC_BASE_URL=http://localhost:8080 -d macos
```

---

## 6. Code Generation

Opentale uses `build_runner` for Drift (database) and `riverpod_generator` code generation.
Re-run after modifying table definitions or Riverpod providers:

```bash
# Regenerate in all packages:
melos run build

# Watch mode (regenerates automatically on file change):
melos run build:watch
```

---

## 7. Lint and Format

```bash
# Analyse all packages (uses very_good_analysis rules):
melos run analyze

# Format all Dart files:
melos run format

# Format check only (no modifications, used in CI):
melos run format:check
```

---

## 8. Project Structure Reference

```text
opentale/
├── apps/
│   └── opentale/                     Flutter app (all platforms)
│       ├── lib/
│       │   ├── main.dart
│       │   ├── app/                  Root app setup (router, theme, DI)
│       │   └── features/
│       │       ├── editor/           US1: Screenplay editor (clean arch)
│       │       ├── outline/          US2: Brainstorm & outline
│       │       ├── characters/       US3: Character dashboard
│       │       ├── sync/             US4: Sync & collaboration
│       │       ├── projects/         Project management
│       │       └── auth/             Authentication
│       └── test/
│           ├── unit/
│           ├── widget/
│           └── integration/
├── packages/
│   ├── screenplay_model/             Pure Dart: domain models + repository interfaces
│   ├── fountain_parser/              Pure Dart: Fountain format parser/serializer
│   ├── screenplay_editor/            Flutter: ScreenplayEditorWidget (appflowy_editor)
│   └── sync_client/                  Dart: Yjs WebSocket sync client
├── backend/                          Go sync relay server (y-websocket protocol)
│   ├── cmd/server/
│   └── internal/ (auth, documents, sync, db)
├── docker-compose.yml
├── pubspec.yaml                       Workspace root (pub workspaces + melos config)
├── .tool-versions                     Flutter + Dart version pin
└── Makefile                           Convenience targets
```

---

## 9. Common Makefile Targets

```bash
make setup-mac         # Install all tools on macOS (Homebrew, FVM, Melos, Go)
make bootstrap         # melos bootstrap (same as step 2)
make test              # melos run test (all packages)
make analyze           # melos run analyze
make build             # melos run build (code generation)
make backend-up        # docker-compose up -d
make backend-down      # docker-compose down
make backend-logs      # docker-compose logs -f backend
```

---

## 10. Validation

To confirm your setup is working correctly, complete this checklist:

- [ ] `melos run analyze` exits with no errors or warnings
- [ ] `melos run test` shows all tests passing with ≥ 80% coverage
- [ ] `fvm flutter run -d <your_platform>` launches the app to the Projects screen
- [ ] Creating a new project and typing a scene heading applies `scene_heading` formatting
- [ ] Exporting a short scene produces a valid `.fountain` file
