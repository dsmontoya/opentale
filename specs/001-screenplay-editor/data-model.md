# Data Model: Opentale Screenplay Editor

**Phase**: 1 — Design
**Date**: 2026-05-09
**Input**: `spec.md` (entities section) + `research.md` (Drift/SQLite relational storage)

---

## Overview

All entities are persisted locally using Drift (SQLite). When sync is enabled, the full Yjs document
state (binary snapshot) is stored as a BLOB alongside the structured relational data, enabling both
fast SQL queries and CRDT-based sync. The canonical document representation for sync purposes is the
Yjs binary; the relational tables are projections derived from it for query performance.

---

## Entity Definitions

### User

Represents an authenticated user of the application.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (TEXT) | PK, NOT NULL | Server-assigned identifier |
| `email` | TEXT | UNIQUE, NOT NULL | Login credential |
| `display_name` | TEXT | NOT NULL | Shown in collaboration UI |
| `avatar_url` | TEXT | NULLABLE | Remote URL for profile image |
| `created_at` | INTEGER (epoch ms) | NOT NULL | Account creation timestamp |
| `last_synced_at` | INTEGER (epoch ms) | NULLABLE | Last successful sync timestamp |

**Relationships**: One user → many Projects (as owner); many users ↔ many Projects (via Collaborator).

---

### Project

A top-level container for one or more screenplays, shared notes, and brainstorm cards.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (TEXT) | PK, NOT NULL | Universally unique project ID |
| `name` | TEXT | NOT NULL | Human-readable project title |
| `owner_id` | UUID (TEXT) | FK → User.id, NOT NULL | User who created the project |
| `created_at` | INTEGER (epoch ms) | NOT NULL | Creation timestamp |
| `updated_at` | INTEGER (epoch ms) | NOT NULL | Last modification timestamp |
| `is_archived` | INTEGER (bool) | NOT NULL, DEFAULT 0 | Soft-delete / archive flag |

**Relationships**: One Project → many Screenplays; one Project → many BrainstormCards;
one Project → many Collaborators.

---

### Collaborator

Join table linking users to projects with an assigned role.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (TEXT) | PK, NOT NULL | Record ID |
| `project_id` | UUID (TEXT) | FK → Project.id, NOT NULL | Target project |
| `user_id` | UUID (TEXT) | FK → User.id, NOT NULL | Collaborating user |
| `role` | TEXT | NOT NULL, CHECK IN ('viewer','editor','owner') | Access level |
| `invited_at` | INTEGER (epoch ms) | NOT NULL | When access was granted |

**Unique constraint**: `(project_id, user_id)` — a user can have only one role per project.

---

### Screenplay

The primary document entity. Holds metadata and a Yjs binary snapshot for sync.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (TEXT) | PK, NOT NULL | Universally unique screenplay ID |
| `project_id` | UUID (TEXT) | FK → Project.id, NOT NULL | Owning project |
| `title` | TEXT | NOT NULL | Screenplay title |
| `authors` | TEXT | NOT NULL | JSON array of author display names |
| `draft_number` | INTEGER | NOT NULL, DEFAULT 1 | Draft revision number (WGA-style) |
| `format` | TEXT | NOT NULL, DEFAULT 'us_feature' | Format: `us_feature` (only v1) |
| `created_at` | INTEGER (epoch ms) | NOT NULL | Creation timestamp |
| `updated_at` | INTEGER (epoch ms) | NOT NULL | Last edit timestamp |
| `yjs_snapshot` | BLOB | NULLABLE | Binary Yjs document snapshot for sync |
| `yjs_state_vector` | BLOB | NULLABLE | Yjs state vector for incremental sync |
| `page_count` | INTEGER | NOT NULL, DEFAULT 0 | Cached page count (recalculated on export) |
| `is_locked` | INTEGER (bool) | NOT NULL, DEFAULT 0 | True when in read-only export mode |

**Relationships**: One Screenplay → many Elements; one Screenplay → many Scenes (derived);
one Screenplay → many Characters (derived); one Screenplay → many Revisions.

---

### Element

A single formatted block within a screenplay. The ordered list of elements is the canonical
document content, stored both in the relational table and within the Yjs document.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (TEXT) | PK, NOT NULL | Universally unique element ID |
| `screenplay_id` | UUID (TEXT) | FK → Screenplay.id ON DELETE CASCADE | Parent screenplay |
| `scene_id` | UUID (TEXT) | FK → Scene.id NULLABLE | Owning scene (null before scene inference) |
| `type` | TEXT | NOT NULL, CHECK IN types below | Element type |
| `text` | TEXT | NOT NULL, DEFAULT '' | Raw text content |
| `position` | REAL | NOT NULL | Fractional index for ordering without renumbering |
| `created_at` | INTEGER (epoch ms) | NOT NULL | Insertion timestamp |
| `updated_at` | INTEGER (epoch ms) | NOT NULL | Last edit timestamp |

**Element types** (`type` CHECK constraint values):

| Value | Screenplay Role | Formatting Rules |
|-------|----------------|-----------------|
| `scene_heading` | INT./EXT. LOCATION – TIME | ALL CAPS, left margin, blank line before |
| `action` | Scene description / stage direction | Mixed case, full width |
| `character_cue` | Character name before dialogue | ALL CAPS, centered (3.7" from left) |
| `dialogue` | Spoken words | Mixed case, narrow column (2.5"–6.0") |
| `parenthetical` | Acting direction within dialogue | Lower case in parentheses, narrow column |
| `transition` | CUT TO:, FADE OUT. etc. | ALL CAPS, flush right |

**Fractional indexing**: `position` uses LexoRank / midpoint fractions so elements can be reordered
without renumbering all subsequent rows. On overflow (gap < ε), a background task renormalises the
entire screenplay's positions.

---

### Scene

A logical grouping of consecutive elements sharing a scene heading. Carries synopsis for the outline
view and an act marker for structure visualization.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (TEXT) | PK, NOT NULL | Scene ID |
| `screenplay_id` | UUID (TEXT) | FK → Screenplay.id ON DELETE CASCADE | Parent screenplay |
| `heading_element_id` | UUID (TEXT) | FK → Element.id, NOT NULL | The `scene_heading` element |
| `synopsis` | TEXT | NOT NULL, DEFAULT '' | Freeform synopsis for index card |
| `act_marker` | TEXT | NULLABLE | E.g. `'Act 1'`, `'Act 2'`, `'Act 3'` |
| `card_color` | TEXT | NULLABLE | Hex color for corkboard index card |
| `position` | REAL | NOT NULL | Scene order (mirrors heading element position) |
| `created_at` | INTEGER (epoch ms) | NOT NULL | |
| `updated_at` | INTEGER (epoch ms) | NOT NULL | |

**Derived from**: A Scene record is created/updated whenever a `scene_heading` Element is added or
edited. Deletion of the heading Element cascades to the Scene record.

---

### Character

A named participant extracted from `character_cue` elements. Serves as the identity record for
the character dashboard.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (TEXT) | PK, NOT NULL | Character ID (stable across renames) |
| `screenplay_id` | UUID (TEXT) | FK → Screenplay.id ON DELETE CASCADE | Parent screenplay |
| `canonical_name` | TEXT | NOT NULL | Current display name (after global rename) |
| `scene_count` | INTEGER | NOT NULL, DEFAULT 0 | Cached count of scenes with ≥1 appearance |
| `dialogue_count` | INTEGER | NOT NULL, DEFAULT 0 | Cached count of `dialogue` elements |
| `created_at` | INTEGER (epoch ms) | NOT NULL | |
| `updated_at` | INTEGER (epoch ms) | NOT NULL | |

**Derived from**: Scanning `character_cue` elements. The `id` is stable; `canonical_name` changes
on global rename. Cached counts are refreshed via a `TRIGGER` on Element insert/update/delete, or
on-demand when the character dashboard is opened.

---

### CharacterSceneAppearance

Join table tracking which characters appear in which scenes (many-to-many).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `character_id` | UUID (TEXT) | FK → Character.id ON DELETE CASCADE | |
| `scene_id` | UUID (TEXT) | FK → Scene.id ON DELETE CASCADE | |
| `first_element_position` | REAL | NOT NULL | Position of first cue in scene |

**Primary key**: `(character_id, scene_id)`.

---

### BrainstormCard

A freeform idea card pinned to the project's corkboard. Optionally linked to a scene.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (TEXT) | PK, NOT NULL | Card ID |
| `project_id` | UUID (TEXT) | FK → Project.id ON DELETE CASCADE | Owning project |
| `linked_scene_id` | UUID (TEXT) | FK → Scene.id NULLABLE | Optional link to a scene |
| `title` | TEXT | NOT NULL | Card heading |
| `content` | TEXT | NOT NULL, DEFAULT '' | Card body text |
| `position_x` | REAL | NOT NULL | X coordinate on corkboard canvas |
| `position_y` | REAL | NOT NULL | Y coordinate on corkboard canvas |
| `card_color` | TEXT | NULLABLE | Hex color |
| `created_at` | INTEGER (epoch ms) | NOT NULL | |
| `updated_at` | INTEGER (epoch ms) | NOT NULL | |

---

### Revision

A named snapshot of a screenplay at a specific point in time.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (TEXT) | PK, NOT NULL | Revision ID |
| `screenplay_id` | UUID (TEXT) | FK → Screenplay.id ON DELETE CASCADE | |
| `author_id` | UUID (TEXT) | FK → User.id, NOT NULL | User who created the snapshot |
| `description` | TEXT | NOT NULL, DEFAULT '' | Human label (e.g. "Before act 2 rewrite") |
| `yjs_snapshot` | BLOB | NOT NULL | Full Yjs document binary at snapshot time |
| `page_count` | INTEGER | NOT NULL | Page count at snapshot time |
| `created_at` | INTEGER (epoch ms) | NOT NULL | |

---

## Entity Relationship Diagram

```
User ──< Collaborator >── Project ──< Screenplay ──< Element
                    │                       │
                    │                 ──< Scene ──< CharacterSceneAppearance
                    │                 │         │
                    │               Character ──┘
                    │
                    └──< BrainstormCard

Screenplay ──< Revision
```

---

## State Transitions

### Screenplay lifecycle

```
draft → active → archived
             └→ locked (during export)
```

- `draft`: Newly created, no sync configured.
- `active`: Has at least one element; synced if user is authenticated.
- `archived`: `is_archived = 1`; read-only in UI; not deleted from local storage.
- `locked` (transient): `is_locked = 1` during PDF export; prevents concurrent writes.

### Element editing flow

```
[user types] → Element.text updated → position maintained
                  │
                  ├─ type = scene_heading → Scene record upserted
                  ├─ type = character_cue → Character record upserted
                  └─ type = dialogue      → Character.dialogue_count incremented
```

---

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| Project | `name` | 1–200 characters, not blank |
| Screenplay | `title` | 1–200 characters, not blank |
| Screenplay | `draft_number` | ≥ 1 |
| Element | `text` | 0–10,000 characters per element |
| Element | `position` | Unique within screenplay; maintained by fractional index algorithm |
| Element | `type` | Must be one of the 6 defined types |
| Scene | `act_marker` | Free text, max 50 chars; commonly `'Act 1'`, `'Act 2'`, `'Act 3'` |
| Character | `canonical_name` | 1–100 characters, ALL CAPS enforced at write |
| Collaborator | `role` | Must be `viewer`, `editor`, or `owner` |
| BrainstormCard | `title` | 1–200 characters |

---

## Indexes

| Table | Index | Reason |
|-------|-------|--------|
| `elements` | `(screenplay_id, position)` | Ordered element fetch |
| `elements` | `(screenplay_id, type)` | Character cue / dialogue extraction |
| `scenes` | `(screenplay_id, position)` | Ordered scene fetch for outline view |
| `characters` | `(screenplay_id, canonical_name)` | Character lookup + rename |
| `character_scene_appearances` | `(character_id)`, `(scene_id)` | Dashboard queries |
| `brainstorm_cards` | `(project_id)` | Corkboard load |
| `revisions` | `(screenplay_id, created_at DESC)` | Revision list |
