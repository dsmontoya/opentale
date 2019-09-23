// @flow
import {
  NEXT_LINE_TYPE,
  SET_LINE_TYPE,
  TAB_NEXT_LINE_TYPE,
  UPDATE_HTML
} from '../actions/editor';
import type { Action } from './types';
import lineTypes from '../constants/lineTypes';
import styles from '../components/Editor.css';

export function html(
  state: string = `<div class='${styles[lineTypes.SCENE_HEADING]} line ${
    styles.line
  }'><br></div>`,
  action: Action
) {
  console.log('html', state);
  switch (action.type) {
    case UPDATE_HTML:
      return action.html;
    default:
      return state;
  }
}

export function lineType(
  state: string = lineTypes.SCENE_HEADING,
  action: Action
) {
  console.log('state editor', state);
  console.log('action', action);
  switch (action.type) {
    case SET_LINE_TYPE:
      return action.lineType;
    case NEXT_LINE_TYPE:
      return next(state);
    case TAB_NEXT_LINE_TYPE:
      return tabNext(state);
    default:
      return state;
  }
}

function next(t) {
  switch (t) {
    case lineTypes.ACTION:
    case lineTypes.SHOT:
    case lineTypes.SCENE_HEADING:
      return lineTypes.ACTION;
    case lineTypes.CHARACTER:
      return lineTypes.DIALOGUE;
    case lineTypes.DIALOGUE:
      return lineTypes.CHARACTER;
    case lineTypes.TRANSITION:
    case lineTypes.ACT:
      return lineTypes.SCENE_HEADING;
    case lineTypes.PARENTHETICAL:
      return lineTypes.PARENTHETICAL;
    case lineTypes.NORMAL:
      return lineTypes.NORMAL;
    default:
  }
}

function tabNext(t) {
  const vals = values();
  for (let i = 0; i < vals.length; i += 1) {
    const value = vals[i];
    if (i === vals.length - 1) {
      return vals[0];
    }
    if (value === t) {
      const newValue = vals[i + 1];
      if (newValue instanceof Function) {
        return vals[0];
      }
      return newValue;
    }
  }
}

function values() {
  return Object.values(this);
}
