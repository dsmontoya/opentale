// @flow
import type { GetState, Dispatch } from '../reducers/types';
import lineTypes from "../constants/lineTypes";
import styles from '../components/Editor.css';

export const NEXT_LINE_TYPE = 'NEXT_LINE_TYPE';
export const PREV_LINE_TYPE = 'PREV_LINE_TYPE';
export const SET_LINE_TYPE = 'SET_LINE_TYPE';
export const TAB_NEXT_LINE_TYPE = 'TAB_NEXT_LINE_TYPE';
export const TAB_PREV_LINE_TYPE = 'TAB_PREV_LINE_TYPE';
export const UPDATE_HTML = "UPDATE_HTML"

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

export function handleClick(evt: any) {
  return (dispatch: Dispatch, getState: GetState) => {
    const { lineType } = getState();
    var target = evt.target
    var targetLineType = target.className.split("__")[1]
    console.log(targetLineType,lineType)
    if (targetLineType && lineType != targetLineType) {
      dispatch(setLineType(targetLineType))
    }
  }
}

export function nextLine(evt: any) {
  return (dispatch: Dispatch, getState: GetState) => {
    console.log("evt",evt)
    var selection = window.getSelection()
    var focusNode = selection.focusNode
    var tagName = focusNode.tagName
    var nativeEvent = evt.nativeEvent
    dispatch(updateHTML(evt.target.value))
    if (nativeEvent.inputType == "insertParagraph") {
      console.log("selection",selection)
      console.log("focusNode",focusNode, tagName)
      console.log("new paragraph")
      dispatch(nextLineType());
      const { lineType } = getState();
      if (tagName == "DIV") {
        focusNode.className = styles[lineType]
        dispatch(updateHTML(document.getElementsByTagName("article")[0].innerHTML))
      }
    }
  };
}

export function nextLineType() {
  return {
    type: NEXT_LINE_TYPE
  }
}

//TODO action for new line

export function prevLineType() {
  return {
    type: PREV_LINE_TYPE
  }
}

export function setLineType(lineType: string) {
  return {
    type: SET_LINE_TYPE,
    lineType: lineType
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

export function updateHTML(html: string){
  console.log("updating html",html)
  return {
    type: UPDATE_HTML,
    html: html
  }
}
