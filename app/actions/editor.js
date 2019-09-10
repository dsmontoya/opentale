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
