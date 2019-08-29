export const lineTypes = {
  ACT: "act",
  SCENE_HEADING: "scene_heading",
  ACTION: "action",
  CHARACTER: "character",
  DIALOGUE: "dialogue",
  PARENTHETICAL: "parenthetical",
  TRANSITION: "transition",
  SHOT: "shot",
  NORMAL: "normal",
}
export const extraLineTypes = {
  FORMATTING: {
    BOLD: "bold",
    ITALIC: "italic",
    UNDERLINE: "underline",
    STRIKETHROUGH: "strikethrough",
    CENTER: "center"
  },
  CUSTOM: "custom"
}

export const nextType = function (t) {
  switch (t) {
    case lineTypes.ACTION, lineTypes.SHOT, lineTypes.SCENE_HEADING:
      return lineTypes.ACTION
      break
    case lineTypes.CHARACTER, lineTypes.PARENTHETICAL:
      return lineTypes.DIALOGUE
      break
    case lineTypes.DIALOGUE:
      return lineTypes.CHARACTER
      break
    case lineTypes.TRANSITION:
      return lineTypes.SCENE_HEADING
      break
    case lineTypes.NORMAL:
      return lineTypes.NORMAL
      break
    default:

  }
}

export default {}
