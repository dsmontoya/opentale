# Contract: Repository Interfaces

**Type**: Dart abstract class interfaces (domain layer)
**Package**: `packages/screenplay_model/`
**Implementations**: `apps/opentale/features/*/data/` (Drift-backed concrete repositories)
**Testing**: Implementations MUST pass a shared contract test suite defined in this package.

---

## Overview

All domain logic depends on these abstract repository interfaces — never on concrete Drift
implementations. This enables full unit testing of use cases by substituting `Mock*Repository`
implementations via Riverpod provider overrides or `mocktail`.

Every method that can fail returns `Either<Failure, T>` (using `fpdart` or equivalent) or throws
a typed domain exception. The convention used here is typed domain exceptions for clarity.

---

## Exceptions

```dart
// packages/screenplay_model/lib/src/exceptions/

sealed class ScreenplayException implements Exception {
  const ScreenplayException(this.message);
  final String message;
}

final class NotFoundException extends ScreenplayException {
  const NotFoundException(String entity, String id)
    : super('$entity with id $id not found');
}

final class ValidationException extends ScreenplayException {
  const ValidationException(super.message);
}

final class StorageException extends ScreenplayException {
  const StorageException(super.message);
}

final class SyncException extends ScreenplayException {
  const SyncException(super.message);
}

final class ConflictException extends ScreenplayException {
  const ConflictException(super.message);
}
```

---

## ScreenplayRepository

CRUD and sync operations on Screenplay entities.

```dart
abstract interface class ScreenplayRepository {
  /// Returns all screenplays belonging to [projectId], ordered by [updatedAt] descending.
  Future<List<Screenplay>> getScreenplays(String projectId);

  /// Returns the screenplay with the given [id].
  /// Throws [NotFoundException] if not found.
  Future<Screenplay> getScreenplay(String id);

  /// Creates a new screenplay in [projectId] with the given metadata.
  /// Returns the persisted Screenplay with server-assigned [id].
  Future<Screenplay> createScreenplay({
    required String projectId,
    required String title,
    required List<String> authors,
  });

  /// Updates screenplay metadata (title, authors, draftNumber).
  /// Does NOT update elements — element changes go through [ElementRepository].
  /// Throws [NotFoundException] if screenplay does not exist.
  Future<Screenplay> updateScreenplay(Screenplay screenplay);

  /// Permanently deletes a screenplay and all its elements, scenes, and characters.
  /// Throws [NotFoundException] if not found.
  Future<void> deleteScreenplay(String id);

  /// Saves the Yjs binary snapshot for sync purposes.
  Future<void> saveYjsSnapshot({
    required String screenplayId,
    required Uint8List snapshot,
    required Uint8List stateVector,
  });

  /// Returns the stored Yjs snapshot, or null if none exists.
  Future<({Uint8List snapshot, Uint8List stateVector})?> getYjsSnapshot(
    String screenplayId,
  );

  /// Watch a screenplay's metadata for real-time changes.
  Stream<Screenplay> watchScreenplay(String id);
}
```

---

## ElementRepository

Ordered element management for a screenplay's content.

```dart
abstract interface class ElementRepository {
  /// Returns all elements for [screenplayId] ordered by [position] ascending.
  Future<List<ScreenplayElement>> getElements(String screenplayId);

  /// Watch all elements for [screenplayId] for real-time changes.
  /// Emits whenever any element in the screenplay is inserted, updated, or deleted.
  Stream<List<ScreenplayElement>> watchElements(String screenplayId);

  /// Inserts a single element.
  /// The [element.position] must be a valid fractional index not already in use.
  Future<ScreenplayElement> insertElement(ScreenplayElement element);

  /// Batch-inserts multiple elements in a single transaction.
  /// Used for initial document load from Yjs snapshot.
  Future<void> insertElements(List<ScreenplayElement> elements);

  /// Updates a single element's text and/or type.
  /// [element.id] and [element.screenplayId] must match an existing record.
  Future<ScreenplayElement> updateElement(ScreenplayElement element);

  /// Deletes the element with [id].
  /// Throws [NotFoundException] if not found.
  Future<void> deleteElement(String id);

  /// Replaces ALL elements for [screenplayId] in a single transaction.
  /// Used for full document sync from server snapshot.
  Future<void> replaceAllElements(
    String screenplayId,
    List<ScreenplayElement> elements,
  );

  /// Returns the fractional position value to insert an element after [afterId].
  /// If [afterId] is null, returns a position before all existing elements.
  Future<double> computeInsertPosition({
    required String screenplayId,
    String? afterId,
  });
}
```

---

## SceneRepository

Scene management derived from scene_heading elements.

```dart
abstract interface class SceneRepository {
  /// Returns all scenes for [screenplayId] ordered by [position] ascending.
  Future<List<Scene>> getScenes(String screenplayId);

  /// Watch scenes for real-time updates (e.g., outline view).
  Stream<List<Scene>> watchScenes(String screenplayId);

  /// Upserts a scene record.
  /// Called when a scene_heading element is created or updated.
  Future<Scene> upsertScene(Scene scene);

  /// Deletes the scene with [id].
  Future<void> deleteScene(String id);

  /// Updates the synopsis or act marker for a scene.
  /// [id] and [screenplayId] must match an existing scene.
  Future<Scene> updateSceneMetadata({
    required String id,
    String? synopsis,
    String? actMarker,
    String? cardColor,
  });

  /// Reorders scenes by setting new positions.
  /// [orderedSceneIds] is the desired order; the repository recomputes positions.
  Future<void> reorderScenes({
    required String screenplayId,
    required List<String> orderedSceneIds,
  });
}
```

---

## CharacterRepository

Character entity management and statistics.

```dart
abstract interface class CharacterRepository {
  /// Returns all characters for [screenplayId] ordered by [canonicalName].
  Future<List<Character>> getCharacters(String screenplayId);

  /// Watch characters for real-time dashboard updates.
  Stream<List<Character>> watchCharacters(String screenplayId);

  /// Upserts a character (called when a new character_cue element is seen).
  Future<Character> upsertCharacter(Character character);

  /// Globally renames a character.
  /// Updates [Character.canonicalName] AND all character_cue, dialogue, and action
  /// elements that reference the old name.
  /// Returns the count of updated elements.
  Future<int> renameCharacter({
    required String characterId,
    required String newName,
  });

  /// Returns all elements (character_cue + dialogue) for [characterId] in position order.
  Future<List<ScreenplayElement>> getCharacterDialogue(String characterId);

  /// Returns scene IDs where [characterId] appears, ordered by scene position.
  Future<List<String>> getCharacterSceneIds(String characterId);

  /// Refreshes cached [scene_count] and [dialogue_count] for [characterId].
  Future<void> refreshCharacterStats(String characterId);
}
```

---

## ProjectRepository

Project and collaborator management.

```dart
abstract interface class ProjectRepository {
  /// Returns all projects accessible to the current user.
  Future<List<Project>> getProjects();

  /// Returns the project with [id].
  /// Throws [NotFoundException] if not found locally.
  Future<Project> getProject(String id);

  /// Creates a new project. [ownerId] is the current user's ID.
  Future<Project> createProject({required String name, required String ownerId});

  /// Updates project name or archive status.
  Future<Project> updateProject(Project project);

  /// Deletes a project and all its screenplays.
  Future<void> deleteProject(String id);

  /// Watch all projects for real-time changes.
  Stream<List<Project>> watchProjects();
}
```

---

## SyncRepository

Manages connectivity, Yjs update streaming, and conflict surfacing.

```dart
abstract interface class SyncRepository {
  /// Connect to the sync relay for [screenplayId].
  /// Returns a [SyncSession] for managing the connection lifecycle.
  /// Throws [SyncException] if the server is unreachable (the session enters offline mode).
  Future<SyncSession> connect(String screenplayId, String authToken);

  /// Queues a Yjs binary update for sending when online.
  /// Persists the update locally first so it survives app restarts.
  Future<void> queueUpdate({
    required String screenplayId,
    required Uint8List yjsUpdate,
  });

  /// Returns all pending (unsynced) updates for [screenplayId].
  Future<List<Uint8List>> getPendingUpdates(String screenplayId);

  /// Marks all pending updates for [screenplayId] as sent.
  Future<void> clearPendingUpdates(String screenplayId);

  /// Returns the current sync connectivity status.
  Stream<SyncStatus> watchSyncStatus(String screenplayId);
}

enum SyncStatus { connecting, online, offline, syncing, error }

abstract interface class SyncSession {
  /// Stream of incoming Yjs binary updates from the server.
  Stream<Uint8List> get incomingUpdates;

  /// Stream of awareness updates from collaborators.
  Stream<AwarenessState> get awarenessUpdates;

  /// Send a Yjs binary update to the relay.
  Future<void> sendUpdate(Uint8List yjsUpdate);

  /// Send an awareness state (cursor position, user presence).
  Future<void> sendAwareness(AwarenessState state);

  /// Current connection state.
  SyncStatus get status;

  /// Disconnect and clean up resources.
  Future<void> disconnect();
}
```

---

## Contract Test Suite

The `screenplay_model` package MUST expose a shared contract test file at:
`packages/screenplay_model/lib/testing/repository_contract_tests.dart`

This file defines parameterised test functions that any concrete repository implementation can
run by providing the implementation under test:

```dart
// Usage in a concrete repository test:
void main() {
  final impl = DriftScreenplayRepository(inMemoryDatabase());
  runScreenplayRepositoryContractTests(impl);
}
```

Contract tests MUST cover:
- Create → Get → Update → Delete round-trip for each entity
- `watchX` streams emit after mutations
- Correct exception types thrown for missing entities
- Fractional index ordering preserved after insert + reorder
- Character stats refreshed correctly after element changes
