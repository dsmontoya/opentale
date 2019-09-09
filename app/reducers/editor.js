// @flow
import { NEXT_LINE_TYPE } from '../actions/editor';
import type { Action } from './types';

export default function editor(state: string, action: Action) {
  console.log("state",state)
  console.log("action",action)
  return "sup"
}
