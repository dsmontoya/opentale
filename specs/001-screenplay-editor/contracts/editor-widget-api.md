# Contract: Screenplay Editor Widget API

**Type**: Flutter widget public API
**Package**: `packages/screenplay_editor/`
**Consuming app**: `apps/opentale/` (features/editor/)
**Flutter version**: 3.x
**Stability**: v1 (breaking changes require MAJOR version bump of the package)

---

## Overview

`ScreenplayEditorWidget` is the primary Flutter widget provided by the `screenplay_editor` package.
It wraps `appflowy_editor` with screenplay-specific block types, keyboard shortcuts, and formatting
rules. All screenplay formatting logic is encapsulated in this package — consumers only need to
provide a `ScreenplayDocument` and respond to change callbacks.

---

## ScreenplayEditorWidget

```dart
class ScreenplayEditorWidget extends StatefulWidget {
  const ScreenplayEditorWidget({
    required this.document,
    required this.onDocumentChanged,
    this.readOnly = false,
    this.autofocus = true,
    this.scrollController,
    this.editorStyle = const ScreenplayEditorStyle(),
    this.toolbarBuilder,
    this.onElementSelected,
    super.key,
  });

  /// The screenplay document to edit.
  /// Updating this reference replaces the entire document.
  final ScreenplayDocument document;

  /// Called whenever the document content changes (debounced to avoid excessive calls).
  /// Receives the full updated document.
  final void Function(ScreenplayDocument document) onDocumentChanged;

  /// When true, the editor is rendered but not editable.
  /// Keyboard shortcuts and focus are disabled.
  final bool readOnly;

  /// Whether the editor should request focus on first build.
  final bool autofocus;

  /// Optional external scroll controller. If null, the editor manages its own scroll.
  final ScrollController? scrollController;

  /// Visual styling overrides (font size, margins, colors, page shadow, etc.).
  final ScreenplayEditorStyle editorStyle;

  /// Optional builder for the floating formatting toolbar.
  /// If null, the default ScreenplayToolbar is used.
  final Widget Function(BuildContext context, ScreenplayToolbarState state)? toolbarBuilder;

  /// Called whenever the user's cursor moves to a different Element.
  /// Provides the element ID and element type for the status bar / toolbar to reflect.
  final void Function(String elementId, ElementType type)? onElementSelected;
}
```

---

## ScreenplayDocument

The immutable value object representing the full document content.

```dart
@immutable
class ScreenplayDocument {
  const ScreenplayDocument({
    required this.id,
    required this.title,
    required this.authors,
    required this.elements,
    this.draftNumber = 1,
  });

  final String id;
  final String title;
  final List<String> authors;
  final List<ScreenplayElement> elements;
  final int draftNumber;

  ScreenplayDocument copyWith({
    String? title,
    List<String>? authors,
    List<ScreenplayElement>? elements,
    int? draftNumber,
  });

  /// Serialise to a JSON-compatible map (for persistence / debugging).
  Map<String, dynamic> toJson();

  /// Deserialise from a JSON map.
  factory ScreenplayDocument.fromJson(Map<String, dynamic> json);

  /// Returns an empty document with a placeholder title.
  factory ScreenplayDocument.empty({required String id, required String title});
}
```

---

## ScreenplayElement

An immutable representation of a single formatted block.

```dart
@immutable
class ScreenplayElement {
  const ScreenplayElement({
    required this.id,
    required this.type,
    required this.text,
    required this.position,
  });

  final String id;
  final ElementType type;
  final String text;

  /// Fractional index (LexoRank) for stable ordering without renumbering.
  final double position;

  ScreenplayElement copyWith({ElementType? type, String? text, double? position});
  Map<String, dynamic> toJson();
  factory ScreenplayElement.fromJson(Map<String, dynamic> json);
}
```

---

## ElementType

```dart
enum ElementType {
  sceneHeading,
  action,
  characterCue,
  dialogue,
  parenthetical,
  transition,
}
```

---

## ScreenplayEditorStyle

Visual customisation, primarily for theming. All values have defaults matching the standard
US screenplay format.

```dart
@immutable
class ScreenplayEditorStyle {
  const ScreenplayEditorStyle({
    this.pageBackgroundColor = Colors.white,
    this.pageShadowColor,
    this.pageWidth = 612.0,     // 8.5 inches at 72 DPI
    this.pageHeight = 792.0,    // 11 inches at 72 DPI
    this.marginTop = 72.0,      // 1 inch
    this.marginBottom = 72.0,
    this.marginLeft = 108.0,    // 1.5 inches
    this.marginRight = 72.0,    // 1 inch
    this.bodyFontSize = 12.0,
    this.lineHeight = 1.0,      // Single-spaced
  });

  final Color pageBackgroundColor;
  final Color? pageShadowColor;
  final double pageWidth;
  final double pageHeight;
  final double marginTop;
  final double marginBottom;
  final double marginLeft;
  final double marginRight;
  final double bodyFontSize;
  final double lineHeight;
}
```

---

## ScreenplayEditorController

An optional controller for programmatic access to the editor state.

```dart
class ScreenplayEditorController {
  /// Jump the viewport to the element with the given ID.
  void scrollToElement(String elementId);

  /// Insert a new element of the given type after the element with [afterId].
  /// If [afterId] is null, inserts at the end of the document.
  void insertElement({required ElementType type, String? afterId, String text = ''});

  /// Delete the element with the given ID.
  void deleteElement(String elementId);

  /// Replace the entire document. The editor rebuilds its state accordingly.
  void replaceDocument(ScreenplayDocument document);

  /// Return the currently focused element ID, or null if no element is focused.
  String? get focusedElementId;

  /// Return a plain-text representation of the document (for Fountain export input).
  String exportToPlainText();

  /// Undo the last edit operation.
  void undo();

  /// Redo the last undone operation.
  void redo();

  /// Returns true if there are operations available to undo.
  bool get canUndo;

  /// Returns true if there are operations available to redo.
  bool get canRedo;

  /// Dispose the controller. MUST be called when the widget is removed.
  void dispose();
}
```

To use a controller, pass it to the widget:
```dart
ScreenplayEditorWidget(
  document: myDoc,
  onDocumentChanged: _handleChange,
  controller: _myController,  // optional
)
```

---

## Keyboard Shortcuts

The following shortcuts MUST be implemented and documented in the widget's README:

| Shortcut | Action |
|----------|--------|
| `Tab` | Advance to next element type in context sequence |
| `Shift+Tab` | Retreat to previous element type |
| `Enter` | Confirm current element; context-advance to next type |
| `Shift+Enter` | Insert line break within dialogue |
| `Cmd/Ctrl+Z` | Undo |
| `Cmd/Ctrl+Shift+Z` or `Cmd/Ctrl+Y` | Redo |
| `Cmd/Ctrl+B` | Toggle bold (action/dialogue only) |
| `Cmd/Ctrl+I` | Toggle italic (action/dialogue only) |
| `Cmd/Ctrl+U` | Toggle underline (action/dialogue only) |

**Element type context sequence** (Tab / Enter advancement):

```
scene_heading → action → character_cue → dialogue → character_cue
                      ↑                         └→ parenthetical → dialogue
```

---

## Behaviour Contracts

1. `onDocumentChanged` MUST be called at most once every 300 ms (debounced). It MUST NOT be called
   on programmatic `replaceDocument()` calls from a controller.
2. The widget MUST NOT mutate the `document` argument passed in; it MUST create new instances via
   `copyWith`.
3. `readOnly = true` MUST prevent all keyboard input and hide the toolbar; it MUST still allow
   scrolling and selection for copy.
4. Element ordering MUST be maintained by `position` (ascending). The widget MUST NOT rely on list
   index order.
5. Undo/redo history MUST be per-session (in-memory); it is NOT persisted across app restarts.
6. When `document` is replaced via `copyWith` from the parent (e.g., sync update arrives), the
   editor MUST merge the change without losing the current undo/redo stack unless the document ID
   has changed.
7. The widget MUST be fully testable via Flutter widget tests using `WidgetTester.pumpWidget` and
   `WidgetTester.enterText` without requiring a real render pipeline.
