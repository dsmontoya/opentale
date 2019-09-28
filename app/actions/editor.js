// @flow
import type { GetState, Dispatch } from '../reducers/types';
import styles from '../components/Editor.css';

export const NEXT_LINE_TYPE = 'NEXT_LINE_TYPE';
export const PREV_LINE_TYPE = 'PREV_LINE_TYPE';
export const SET_LINE_TYPE = 'SET_LINE_TYPE';
export const TAB_NEXT_LINE_TYPE = 'TAB_NEXT_LINE_TYPE';
export const TAB_PREV_LINE_TYPE = 'TAB_PREV_LINE_TYPE';
export const UPDATE_HTML = 'UPDATE_HTML';

export const extraLineTypes = {
  FORMATTING: {
    BOLD: 'bold',
    ITALIC: 'italic',
    UNDERLINE: 'underline',
    STRIKETHROUGH: 'strikethrough',
    CENTER: 'center'
  },
  CUSTOM: 'custom'
};

export function handleClick(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
  return (dispatch: Dispatch, getState: GetState) => {
    const { lineType } = getState();
    const { target } = evt;
    const targetLineType = target.className.split('__')[1];
    if (targetLineType && lineType !== targetLineType) {
      dispatch(setLineType(targetLineType));
    }
  };
}

export function handleSelect(option: Option) {
  return (dispatch: Dispatch, getState: GetState) => {
    const lineType = option.value.toLowerCase();
    dispatch(setLineType(lineType));
    updateSelection(lineType)(dispatch, getState);
  };
}

export function nextLine(evt: ContentEditableEvent) {
  return (dispatch: Dispatch, getState: GetState) => {
    console.log('evt', evt);
    const { nativeEvent } = evt;
    dispatch(updateHTML(evt.target.value));
    if (
      nativeEvent.inputType === 'deleteContentBackward' ||
      nativeEvent.inputType === 'deleteContentForward'
    ) {
      removeSpan()(dispatch);
    }
    if (
      nativeEvent.inputType === 'insertParagraph' ||
      (nativeEvent.inputType === 'insertText' && nativeEvent.data === null)
    ) {
      dispatch(nextLineType());
      const { lineType } = getState();
      updateSelection(lineType)(dispatch, getState);
    }
  };
}

export function nextLineType() {
  return {
    type: NEXT_LINE_TYPE
  };
}

// TODO action for new line

export function prevLineType() {
  return {
    type: PREV_LINE_TYPE
  };
}

export function setLineType(lineType: string) {
  return {
    type: SET_LINE_TYPE,
    lineType
  };
}

export function tabNextLineType() {
  return {
    type: TAB_NEXT_LINE_TYPE
  };
}

export function tabPrevLineType() {
  return {
    type: TAB_PREV_LINE_TYPE
  };
}

export function updateHTML(html: string) {
  return {
    type: UPDATE_HTML,
    html
  };
}

function updateSelection(lineType: string) {
  return (dispatch: Dispatch, getState: GetState) => {
    const selection = window.getSelection();
    const { focusNode } = selection;
    const { tagName } = focusNode;
    let div: Node;
    console.log('tagname', tagName);
    if (tagName === 'DIV') {
      div = focusNode;
    } else {
      div = focusNode.parentNode;
    }
    updateDiv(div, lineType)(dispatch, getState);
  };
}

function updateDiv(div: Node, lineType: string) {
  // eslint-disable-next-line no-unused-vars
  return (dispatch: Dispatch, getState: GetState) => {
    // eslint-disable-next-line no-param-reassign
    div.className = `${styles[lineType]} ${styles.line}`;
    dispatch(
      updateHTML(window.document.getElementsByClassName('editor')[0].innerHTML)
    );
  };
}

function removeSpan() {
  return (dispatch: Dispatch) => {
    const selection = window.getSelection();
    const { focusNode } = selection;
    const { nextSibling } = focusNode;
    if (nextSibling) {
      const textLen = focusNode.textContent.length;
      const range = new Range();
      focusNode.textContent += nextSibling.textContent;
      focusNode.parentNode.removeChild(nextSibling);
      dispatch(
        updateHTML(
          window.document.getElementsByClassName('editor')[0].innerHTML
        )
      );
      selection.removeAllRanges();
      range.setStart(focusNode, textLen);
      range.setEnd(focusNode, textLen);
      selection.addRange(range);
    }
  };
}
