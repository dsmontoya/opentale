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

export function handleSelect(option: any) {
  return (dispatch: Dispatch, getState: GetState) => {
    const lineType = option.value.toLowerCase()
    dispatch(setLineType(lineType))
    updateSelection(lineType)(dispatch, getState)
  }
}

export function nextLine(evt: any) {
  return (dispatch: Dispatch, getState: GetState) => {
    console.log("evt",evt)
    var nativeEvent = evt.nativeEvent
    dispatch(updateHTML(evt.target.value))
    if (nativeEvent.inputType == "insertParagraph") {
      dispatch(nextLineType());
      const { lineType } = getState();
      updateSelection(lineType)(dispatch, getState)
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

function updateSelection(lineType: string) {
  return (dispatch: Dispatch, getState: GetState) => {
    const selection = window.getSelection()
    const focusNode = selection.focusNode
    const tagName = focusNode.tagName
    var div: Node
    console.log("tagname",tagName)
    if (tagName == "DIV") {
      div = focusNode
    } else {
      div = focusNode.parentNode
    }
    updateDiv(div, lineType)(dispatch, getState)
  }
}

function updateDiv(div: Node, lineType: string) {
  return (dispatch: Dispatch, getState: GetState) => {
    div.className = styles[lineType]
    dispatch(updateHTML(document.getElementsByTagName("article")[0].innerHTML))
  }
}
