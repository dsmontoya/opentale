// @flow
import lineTypes from "../constants/lineTypes";

export const NEXT_LINE_TYPE = 'NEXT_LINE_TYPE';
export const PREV_LINE_TYPE = 'PREV_LINE_TYPE';
export const TAB_NEXT_LINE_TYPE = 'TAB_NEXT_LINE_TYPE';
export const TAB_PREV_LINE_TYPE = 'TAB_PREV_LINE_TYPE';

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

export function nextLineType() {
  return {
    type: NEXT_LINE_TYPE
  }
}

export function prevLineType() {
  return {
    type: PREV_LINE_TYPE
  }
}

export function tabNextLineType() {
  return {
    type: TAB_NEXT_LINE_TYPE
  }
}

export function tabPrevLineType() {
  return {
    type: TAB_PREV_LINE_TYPE
  }
}

export default {
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
