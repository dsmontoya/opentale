// @flow
import { NEXT_LINE_TYPE, SET_LINE_TYPE, TAB_NEXT_LINE_TYPE, UPDATE_HTML } from '../actions/editor';
import type { Action } from './types';
import lineTypes from "../constants/lineTypes";
import styles from '../components/Editor.css';
import { switchCase } from '@babel/types';

export function html(state: string = "<div class='"+styles[lineTypes.SCENE_HEADING]+"'>hey</div>", action: Action) {
  console.log("html",state)
  switch (action.type) {
    case UPDATE_HTML:
      return action.html
      break;
  
    default:
      return state
  }
}

export function lineType(state: string = lineTypes.SCENE_HEADING, action: Action) {
  console.log("state editor",state)
  console.log("action",action)
  switch (action.type) {
    case SET_LINE_TYPE:
      return action.lineType
    case NEXT_LINE_TYPE:
      return next(state)
    case TAB_NEXT_LINE_TYPE:
      return tabNext(state)
    default:
      return state
  }
}

function next(t) {
  switch (t) {
    case lineTypes.ACTION:
    case lineTypes.SHOT:
    case lineTypes.SCENE_HEADING:
      return lineTypes.ACTION
      break
    case lineTypes.CHARACTER:
    case lineTypes.PARENTHETICAL:
      return lineTypes.DIALOGUE
      break
    case lineTypes.DIALOGUE:
      return lineTypes.CHARACTER
      break
    case lineTypes.TRANSITION:
    case lineTypes.ACT:
      return lineTypes.SCENE_HEADING
      break
    case lineTypes.NORMAL:
      return lineTypes.NORMAL
      break
    default:

  }
}

function tabNext(t) {
  var vals = values()
  for (var i = 0; i < vals.length; i++) {
    var value = vals[i]
    if (i == vals.length-1) {
      return vals[0]
    }
    if (value == t) {
      var newValue = vals[i+1]
      if (newValue instanceof Function) {
        return vals[0]
      }
      return newValue
    }
  }
}

function values() {
  return Object.values(this)
}