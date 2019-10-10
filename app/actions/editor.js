// @flow
import React from 'react';
import type { GetState, Dispatch } from '../reducers/types';
import styles from '../components/Editor.css';
const { clipboard } = require('electron')

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

export function onPaste(evt: React.ClipboardEvent) {
  return (dispatch: Dispatch, getState: GetState) => {
    evt.preventDefault();
    const { currentTarget } = evt;
    const { lineType } = getState();
    const newContainer = formatClipboard(lineType);
    let { startContainer, endContainer } = rangeValues();
    const newEndContainer = endContainer.cloneNode(true);
    document.execCommand('delete');
    const {
      startLineType,
      endLineType,
      startContainerText,
      endContainerText
    } = rangeValues();
    ({ startContainer, endContainer } = rangeValues());
    // TODO: move to rangeValues
    let nextSibling: Node & ParentNode;
    for (let i = 0; i < newContainer.children.length; i += 1) {
      console.log("i",i)
      const element = newContainer.children[i].cloneNode(true);
      if (i === 0) {
        console.log("element",element)
        console.log(startLineType,element.className.split('__')[1])
        if (startLineType === element.className.split('__')[1]) {
          let textContent = `${startContainerText}${element.textContent}`;
          if (newContainer.children.length === 1) {
            textContent += endContainerText;
          }
          console.log("start container",startContainer.tagName)
          getDiv(startContainer).textContent = textContent;
          // WTF?! I have to reload the start container
          ({ startContainer } = rangeValues());
          console.log("start container",startContainer)
          console.log("text content",getDiv(startContainer).textContent)
          nextSibling = getDiv(startContainer).nextSibling;
          continue;
        } else {
          getDiv(startContainer).textContent = startContainerText;
          ({ startContainer } = rangeValues());
          nextSibling = getDiv(startContainer).nextSibling;

          // keep start text
          // insert element after
        }
      }
      console.log("nextSibling",nextSibling)
      currentTarget.insertBefore(element, nextSibling);
      // if (i === 0) {
      //   if (startContainer.tagName === undefined) {
      //     console.log("should append text")
      //     // TODO: insert new text between current text
      //     console.log("text A",startContainer.parentNode.textContent)
      //     console.log("text B",element.textContent)
      //     startContainer.parentNode.textContent += element.textContent;
      //     // eslint-disable-next-line no-continue
      //     continue;
      //   }
      // }
    //   console.log("before",window.document.getElementsByClassName('editor')[0].innerHTML)

    //   currentTarget.insertBefore(element, nextSibling);
    //   ({ nextSibling } = element);
    //   console.log("after",window.document.getElementsByClassName('editor')[0].innerHTML)
      if (i === newContainer.children.length - 1) {
        const newRange = window.document.createRange();
        const originalTextLength = element.textContent.length;
        if (endContainerText !== '') {
          if (endLineType === element.className.split('__')[1]) {
            element.textContent += endContainerText;
          } else {
            currentTarget.insertBefore(newEndContainer, nextSibling);
          }
        }
        newRange.setStart(element.firstChild, originalTextLength);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(newRange);
      }
    }
    // if (startContainerText !== '') {
    //   console.log("start text",startContainerText)
    //   startContainer.textContent = startContainerText;
    // } else {
    //   currentTarget.removeChild(startContainer);
    // }
    // if (endContainerText !== '') {
    //   newEndContainer.textContent = endContainerText;
    //   currentTarget.insertBefore(newEndContainer, nextSibling);
    // }
    dispatch(
      updateHTML(window.document.getElementsByClassName('editor')[0].innerHTML)
    );
  };
}

export function nextLine(evt: ContentEditableEvent) {
  return (dispatch: Dispatch, getState: GetState) => {
    console.log('evt', evt);
    const { nativeEvent } = evt;
    // dispatch(updateHTML(evt.target.value));
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

function formatClipboard(lineType: string): HTMLDivElement {
  const cb = clipboard.readHTML('clipboard');
  const container = document.createElement('div');
  const newContainer = document.createElement('div');
  console.log(cb);
  container.innerHTML = cb;
  const { children } = container;
  for (let i = 0; i < children.length; i += 1) {
    const element = children[i];
    const { tagName } = element;
    const newDiv = document.createElement('div');
    switch (tagName) {
      case 'DIV':
        newDiv.className = element.className;
        newDiv.textContent = element.textContent;
        break;
      case 'SPAN':
        newDiv.className = `${styles[lineType]} ${styles.line}`;
        newDiv.textContent = element.textContent;
        break;
      default:
        // eslint-disable-next-line no-continue
        continue;
    }
    newContainer.appendChild(newDiv);
  }
  return newContainer;
}

function getDiv(node: Node): Node & ParentNode {
  const { tagName } = node;
  if (tagName === undefined) {
    return node.parentNode;
  }
  if (tagName === 'DIV') {
    return node;
  }
}

function rangeNextSibling(range: Range): Node & ParentNode {
  if (range.startContainer.tagName === 'DIV') {
    return range.startContainer;
  }
  if (range.startContainer.tagName === undefined) {
    return range.startContainer.parentNode;
  }
}

function rangeValues() {
  const range = window.getSelection().getRangeAt(0);
  console.log(range)
  const { startContainer, startOffset, endContainer, endOffset } = range;
  const startContainerText = startContainer.textContent.slice(0, startOffset);
  const endContainerText = endContainer.textContent.slice(
    endOffset,
    endContainer.textContent.length
  );
  const startLineType = startContainer.parentNode.className.split('__')[1];
  const endLineType = endContainer.parentNode.className.split('__')[1];
  return {
    startContainer,
    startOffset,
    endContainer,
    endOffset,
    endContainerText,
    startContainerText,
    startLineType,
    endLineType
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
      const range = window.document.createRange();
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
