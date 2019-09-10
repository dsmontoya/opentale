// @flow
import { NEXT_LINE_TYPE, TAB_NEXT_LINE_TYPE } from '../actions/editor';
import type { Action } from './types';
import lineTypes from "../constants/lineTypes";

export function lineType(state: string, action: Action) {
  console.log("state editor",state)
  console.log("action",action)
  switch (action) {
    case NEXT_LINE_TYPE:
      next(state)
      break;
  
    case TAB_NEXT_LINE_TYPE:
      tabNext(state)
      break;
    default:
      return lineTypes.SCENE_HEADING;
  }
}

function next(t) {
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