// @flow
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

export default {
  ACT: "act",
  SCENE_HEADING: "scene_heading",
  ACTION: "action",
  CHARACTER: "character",
  DIALOGUE: "dialogue",
  PARENTHETICAL: "parenthetical",
  TRANSITION: "transition",
  SHOT: "shot",
  NORMAL: "normal",

  next: function (t) {
    switch (t) {
      case this.ACTION:
      case this.SHOT:
      case this.SCENE_HEADING:
        return this.ACTION
        break
      case this.CHARACTER:
      case this.PARENTHETICAL:
        return this.DIALOGUE
        break
      case this.DIALOGUE:
        return this.CHARACTER
        break
      case this.TRANSITION:
      case this.ACT:
        return this.SCENE_HEADING
        break
      case this.NORMAL:
        return this.NORMAL
        break
      default:

    }
  },
  tabNext: function (t) {
    var values = this.values()
    for (var i = 0; i < values.length; i++) {
      var value = values[i]
      if (i == values.length-1) {
        return values[0]
      }
      if (value == t) {
        var newValue = values[i+1]
        if (newValue instanceof Function) {
          return values[0]
        }
        return newValue
      }
    }
  },
  values: function () {
    return Object.values(this)
  }
}
