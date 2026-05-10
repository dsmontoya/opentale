# Contract: Fountain Format

**Type**: Plain-text interchange format
**Version**: Fountain v1.1 (https://fountain.io/syntax)
**Package**: `packages/fountain_parser/`
**Purpose**: Defines the subset of Fountain that Opentale MUST parse (import) and MUST produce
(export), ensuring round-trip fidelity between the internal Drift/Yjs model and the `.fountain` file.

---

## Overview

Fountain is the industry-standard plain-text screenplay format. A `.fountain` file is UTF-8 plain
text with formatting conveyed through whitespace and syntax conventions — no binary encoding, no
proprietary schema. Opentale uses Fountain as its primary interchange format (read/write) and as the
input to the PDF export pipeline.

---

## Element Mapping

| Opentale Element Type | Fountain Syntax | Detection Rule |
|-----------------------|-----------------|----------------|
| `scene_heading` | `INT. OFFICE - DAY` | Line starts with `INT.`, `EXT.`, `INT./EXT.`, `EST.`, `I/E.`, or forced with `.` prefix |
| `action` | Plain paragraph | Any line not matching another rule |
| `character_cue` | `JOHN` (all caps) | ALL CAPS line, not a transition, preceded by blank line, followed by dialogue/paren |
| `dialogue` | Line immediately after character/paren | Any text following a character cue or parenthetical |
| `parenthetical` | `(beat)` | Line enclosed in `( )`, appearing between character cue and dialogue |
| `transition` | `CUT TO:` | ALL CAPS ending in `:`, or forced with `>` prefix; flush right |

---

## Title Page

```fountain
Title: My Screenplay
Credit: Written by
Author: Jane Doe
Draft date: May 2026
Contact: jane@example.com

===
```

Fields are colon-separated key-value pairs. The `===` separator marks the end of the title page and
the start of the script body. Opentale MUST parse and preserve `Title`, `Author`, `Draft date`, and
`Contact` fields, mapping them to `Screenplay.title`, `Screenplay.authors`, `Screenplay.draft_number`,
and project metadata respectively. Unknown fields MUST be preserved as-is in export.

---

## Scene Headings

```fountain
INT. DETECTIVE'S OFFICE - NIGHT

EXT. ROOFTOP - DAY

INT./EXT. MOVING CAR - DAY

.FORCED SCENE HEADING
```

- MUST be detected case-insensitively for the `INT.`/`EXT.` prefix.
- The `.` forced prefix is REQUIRED support (some writers use lowercase headings).
- Scene numbers (e.g., `INT. OFFICE - DAY #1#`) MUST be parsed and stripped on import; Opentale
  does not expose scene numbers as editable in v1 but MUST round-trip them on export.

---

## Action Lines

```fountain
Jake enters, soaking wet. He drops his bag on the floor and looks around.

!Forced action line that starts with a character-name-like pattern.
```

- The `!` forced prefix MUST be supported for lines that would otherwise be detected as character cues.
- Blank lines between action paragraphs are preserved as separate Action elements.

---

## Character Cues

```fountain
JAKE

JAKE (V.O.)

JAKE (O.S.)

JAKE (CONT'D)

@jake (forced, lowercase name preserved as-is)
```

- Standard character cues are ALL CAPS. Opentale maps these to `Character.canonical_name`.
- Extensions `(V.O.)`, `(O.S.)`, `(CONT'D)` MUST be parsed and preserved in the element text but
  stripped when deriving `Character.canonical_name`.
- The `@` forced prefix MUST be supported, preserving mixed-case names exactly.

---

## Dialogue

```fountain
JAKE
I've been waiting for you.

JAKE (V.O.)
I didn't know then what I know now.
```

Dialogue is any text immediately following a character cue or parenthetical with no blank line
between. A blank line terminates the dialogue block.

---

## Parentheticals

```fountain
SARAH
(quietly)
Did you see what happened?

JAKE
(pause, then:)
I saw everything.
```

Parentheticals MUST be enclosed in `( )`. They MUST appear only between a character cue and its
dialogue. Parentheticals without a surrounding dialogue block MUST be treated as action lines.

---

## Transitions

```fountain
CUT TO:

FADE OUT.

>SMASH CUT TO:
```

- All-caps lines ending with `:` MUST be detected as transitions.
- `FADE IN:` at the start of a script MUST be treated as a transition, not a character cue.
- The `>` forced prefix MUST force any line to be a transition regardless of formatting.

---

## Notes and Comments

```fountain
[[This is a Fountain note - visible in editing, excluded from export]]

/* This is a Fountain boneyard - content excluded from print */
```

- `[[...]]` notes MUST be parsed and preserved but MUST NOT appear in PDF export.
- `/* ... */` boneyard MUST be parsed and preserved but excluded from all export formats.
- Opentale v1 stores notes as element metadata; they are not exposed in the character dashboard.

---

## Emphasis (Inline Formatting)

```fountain
*italic text*
**bold text**
***bold italic***
_underline_
```

Inline emphasis within action and dialogue MUST be parsed and preserved. Opentale maps these to
`appflowy_editor` inline formatting attributes for display.

---

## Section Headers and Synopses

```fountain
# Act One

## Sequence A

### Scene Group

= This is a synopsis for the following scene
```

- `#`-prefixed section headers MUST be parsed and stored as act/section metadata on the Scene entity
  (`act_marker` field).
- `= ` synopses MUST be parsed and stored as `Scene.synopsis`.
- Section headers and synopses MUST NOT appear in PDF export (they are structural metadata only).

---

## Page Breaks

```fountain
===
```

A line containing only `===` (outside the title page) MUST be treated as a manual page break and
preserved on round-trip.

---

## Import Rules

1. UTF-8 encoding is REQUIRED. Files with a BOM MUST have the BOM stripped silently.
2. Line endings MUST be normalised to `\n` before parsing (CRLF → LF).
3. An empty file or a file containing only whitespace MUST produce a valid empty Screenplay with
   zero Elements.
4. Unknown or ambiguous lines MUST default to `action` type and MUST NOT error.
5. The parser MUST be lenient: a malformed file MUST produce the best-effort parse result with
   warnings logged (not thrown errors).

---

## Export Rules

1. Output MUST be UTF-8, `\n` line endings, no BOM.
2. The title page MUST be emitted first if `Screenplay.title` is non-empty.
3. Each element type MUST be serialised to its canonical Fountain syntax (no forced prefixes unless
   needed to disambiguate).
4. Blank lines between elements MUST follow standard Fountain spacing:
   - One blank line before scene headings, character cues, and transitions.
   - No blank line between character cue and dialogue/parenthetical.
5. Scene numbers (if present in original import) MUST be re-attached on export.
6. `[[notes]]` MUST be included in `.fountain` export but excluded from PDF export.
7. Boneyard `/* ... */` MUST be included in `.fountain` export but excluded from PDF export.
8. ALL CAPS enforcement for character cues and transitions MUST be applied at export time
   regardless of what is stored in the Element.text field.

---

## Round-Trip Fidelity

A round-trip is defined as:
```
parse(fountain_text) → internal model → export(internal model) → fountain_text'
```

`fountain_text'` MUST be semantically equivalent to `fountain_text` — the same structural
elements in the same order with the same text content — though minor whitespace normalisation
(consistent blank line counts, consistent line endings) is acceptable.

The `fountain_parser` package MUST include a round-trip property test (using `fast_check`-style
generation or a corpus of known `.fountain` files from the Fountain spec test suite) that is run
in CI on every PR touching that package.
