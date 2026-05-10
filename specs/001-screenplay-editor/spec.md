# Feature Specification: Opentale Screenplay Editor

**Feature Branch**: `001-screenplay-editor`
**Created**: 2026-05-03
**Status**: Draft
**Input**: User description: "Build an open source multiplatform screenwriting tool that allows writers
to efficiently create, organize, and collaborate on screenplays across devices. The main goal is that
writers can use opentale to brainstorm ideas and quickly develop their scripts, with tools to visualize
plot structure, character arcs, and dialogue."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Script Writing & Formatting (Priority: P1)

A writer opens Opentale and creates a new screenplay. They type scenes, action lines, character names,
and dialogue and the tool automatically formats each element according to industry-standard screenplay
format (scene headings, action, character, dialogue, parentheticals, transitions). The writer can move
between formatting elements using keyboard shortcuts without manual styling.

**Why this priority**: Correct screenplay formatting is the non-negotiable core of any screenwriting
tool. Without it, writers cannot produce professional-quality scripts. All other features depend on a
working editor.

**Independent Test**: A writer creates a new script, types a complete short scene with a heading, action
line, character name, dialogue, and transition; the output matches industry-standard screenplay format
and can be exported as a properly formatted PDF.

**Acceptance Scenarios**:

1. **Given** a new blank screenplay, **When** the writer types a scene heading, **Then** it is
   automatically formatted as `INT./EXT. LOCATION - TIME` in the correct typeface and position.
2. **Given** the cursor is in a scene heading, **When** the writer presses Tab/Enter, **Then** the
   cursor advances to the next appropriate element type (action line) with correct formatting.
3. **Given** a completed screenplay, **When** the writer exports to PDF, **Then** the output conforms
   to standard US screenplay format (12pt Courier, correct margins, page numbering).
4. **Given** a writer is mid-sentence in dialogue, **When** they use the keyboard shortcut to switch
   element type, **Then** the text is re-styled instantly without losing content.

---

### User Story 2 - Brainstorming & Outline Tools (Priority: P2)

A writer uses Opentale's brainstorming workspace before writing a scene. They can create a beat sheet,
outline acts, jot down ideas on a virtual corkboard/index cards, and reorder scenes by drag-and-drop.
Changes in the outline propagate to the script structure.

**Why this priority**: Rapid ideation and structure planning are the features that differentiate
Opentale from a plain text formatter. Writers need to develop ideas before committing to prose.

**Independent Test**: A writer creates a 3-act outline with 5 index cards, reorders two cards via
drag-and-drop, and verifies the corresponding scenes in the script appear in the updated order.

**Acceptance Scenarios**:

1. **Given** a screenplay project, **When** the writer opens the outline view, **Then** they see an
   index-card board where each card represents one scene with its heading and a brief synopsis.
2. **Given** index cards in the outline view, **When** the writer drags a card to a new position,
   **Then** the scene order in the script editor updates to match immediately.
3. **Given** a blank index card, **When** the writer types a synopsis, **Then** the text is saved and
   visible both in the outline view and in the script's scene header notes.
4. **Given** a beat sheet with act markers, **When** the writer views structure visualization,
   **Then** they can see a timeline/graph showing where each act begins and ends relative to page count.

---

### User Story 3 - Character & Dialogue Tracking (Priority: P3)

A writer can view a character dashboard showing which scenes each character appears in, how many lines
they have, and a timeline of their arc across the screenplay. The writer can also see all of a
character's dialogue lines in a single filtered view.

**Why this priority**: Understanding character presence and dialogue distribution is essential for
developing arcs and spotting imbalances, but it is a layer on top of the core writing experience.

**Independent Test**: Given a screenplay with 3 named characters and at least 10 dialogue exchanges,
the writer opens the character dashboard and sees accurate line counts per character and a scene
appearance list per character.

**Acceptance Scenarios**:

1. **Given** a screenplay with named characters, **When** the writer opens the character dashboard,
   **Then** each character is listed with their total scene count and dialogue line count.
2. **Given** a selected character, **When** the writer chooses "view all dialogue", **Then** every
   dialogue block for that character is displayed in sequence with scene references.
3. **Given** a screenplay, **When** the writer views the character arc timeline, **Then** a visual
   indicator shows which scenes each character is active in, mapped to the screenplay's page range.
4. **Given** a character name, **When** the writer renames it globally, **Then** all occurrences in
   the script (character cue, dialogue, action) update automatically.

---

### User Story 4 - Multiplatform Sync & Collaboration (Priority: P4)

A writer works on a screenplay on their desktop and later continues on a mobile device. Their work
syncs seamlessly. Two collaborators can be notified of each other's changes and merge edits without
overwriting work.

**Why this priority**: Multiplatform access and collaboration are core to the project's open-source
vision, but require foundational single-user editing to be solid first.

**Independent Test**: A writer saves a screenplay on one device, opens Opentale on a second device,
and sees the latest version of the script without manual file transfer.

**Acceptance Scenarios**:

1. **Given** a writer authenticated on two devices, **When** they save a change on device A, **Then**
   the change is available on device B within 30 seconds of saving.
2. **Given** two collaborators with access to the same project, **When** collaborator A edits scene 1
   and collaborator B edits scene 3 simultaneously, **Then** both edits are preserved and visible to
   both parties after sync.
3. **Given** a conflict occurs (same lines edited by two users), **When** the system detects the
   conflict, **Then** the writer is shown both versions and prompted to choose or merge them.
4. **Given** a writer is offline, **When** they edit the screenplay, **Then** changes are stored
   locally and synced automatically when connectivity is restored.

---

### Edge Cases

- What happens when a writer tries to export a screenplay with no content?
- How does the system handle very long screenplays (200+ pages) in terms of outline and
  character tracking performance?
- How are scene cards handled when a scene is deleted from the script — does the card persist
  or disappear from the board?
- What happens if two collaborators rename the same character differently at the same time?
- How does offline editing interact with a collaborator who made conflicting online edits?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The editor MUST support all standard screenplay formatting elements: scene headings,
  action lines, character cues, dialogue, parentheticals, and transitions.
- **FR-002**: The editor MUST auto-format elements based on context (current element type) using
  keyboard-driven navigation between element types.
- **FR-003**: Writers MUST be able to export screenplays to PDF in industry-standard format and to
  a plain-text/fountain interchange format.
- **FR-004**: The system MUST provide an outline/index-card view where scenes can be created,
  edited, and reordered by drag-and-drop, with changes reflected in the script.
- **FR-005**: The system MUST display a visual plot structure representation (act breakdown, page
  count per act) derived from the script's scene and act markers.
- **FR-006**: Writers MUST be able to access a character dashboard showing per-character scene
  counts, dialogue line counts, and an arc timeline.
- **FR-007**: The system MUST support global character rename that updates all occurrences across
  the screenplay.
- **FR-008**: The system MUST sync a writer's work across devices when the writer is authenticated;
  sync MUST complete within 30 seconds of saving.
- **FR-009**: Two or more collaborators MUST be able to work on different sections of the same
  screenplay simultaneously without overwriting each other's changes.
- **FR-010**: The system MUST support offline editing with automatic sync upon reconnection.
- **FR-011**: The system MUST detect edit conflicts and present the writer with a resolution
  interface (accept mine / accept theirs / manual merge).
- **FR-012**: The application MUST be available on at minimum desktop (macOS, Windows, Linux) and
  mobile (iOS, Android) platforms from a single codebase.

### Key Entities

- **Screenplay**: Top-level document containing metadata (title, author, draft number) and an
  ordered list of elements.
- **Element**: A single formatted unit within a screenplay — one of: scene heading, action, character
  cue, dialogue, parenthetical, or transition.
- **Scene**: A logical grouping of elements sharing a scene heading; carries a synopsis for the
  outline view.
- **Character**: A named participant derived from character cue elements; carries dialogue counts
  and scene appearances.
- **Project**: A container for one or more screenplays plus shared assets (notes, brainstorm cards).
- **Collaborator**: A user with read or read-write access to a project.
- **Revision**: A saved snapshot of a screenplay at a point in time, enabling version comparison.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A writer can create a formatted screenplay scene (heading + action + dialogue) within
  60 seconds of opening a new project, with no prior training.
- **SC-002**: Sync latency between two authenticated devices is 30 seconds or less under normal
  connectivity conditions.
- **SC-003**: The outline view accurately reflects scene order changes within 2 seconds of a
  drag-and-drop reorder on a screenplay of up to 120 scenes.
- **SC-004**: Character dashboard loads and displays accurate statistics for a 120-page screenplay
  in under 3 seconds.
- **SC-005**: 90% of new users successfully complete writing and exporting their first scene without
  consulting documentation.
- **SC-006**: Collaborative edits from two simultaneous users on different scenes are both preserved
  in 100% of non-conflicting edit sessions.
- **SC-007**: The application is available and functionally equivalent on desktop (macOS, Windows,
  Linux) and mobile (iOS, Android).

## Assumptions

- Writers are assumed to be familiar with screenplay conventions; the tool targets intermediate and
  professional writers rather than complete beginners, though onboarding hints will be provided.
- The "industry-standard format" baseline is the US feature-film screenplay format (WGA/Final Draft
  convention); other formats (e.g., BBC, stage play) are out of scope for v1.
- Collaboration requires user accounts; the authentication mechanism will follow standard OAuth2/
  email-password patterns — no specific provider is mandated by this spec.
- Cloud sync is assumed to use the project's own sync infrastructure; direct file-sharing via
  Dropbox/Google Drive is out of scope for v1.
- Mobile platforms targeted are iOS and Android; the desktop platforms are macOS, Windows, and Linux.
- Real-time co-editing (Google Docs-style simultaneous cursor visibility) is out of scope for v1;
  the collaboration model is near-real-time sync with conflict resolution.
- Screenplay import from Final Draft (.fdx) or other proprietary formats is a desirable future
  feature but is out of scope for this specification.
- The open-source model means no paid tier is in scope; monetisation decisions are deferred.
