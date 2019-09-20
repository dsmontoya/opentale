import { spy } from 'sinon';
import lineTypes from '../../app/constants/lineTypes';
import * as actions from '../../app/actions/editor';
import { JSDOM } from 'jsdom';

describe('actions', () => {
  it('should update the line type when a line is clicked', () => {
    const evt = {
      target: {
        className: "Editor__scene_heading__FQx_9"
      }
    };
    const fn = actions.handleClick(evt);
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const getState = () => ({ lineType: lineTypes.ACT });
    fn(dispatch, getState);
    expect(dispatch.calledWith({ type: actions.SET_LINE_TYPE, lineType: lineTypes.SCENE_HEADING })).toBe(true);
  });

  // it('should update the line type when a line type is selected from menu', () => {
  //   window.getSelection = () => {
  //     return {
  //       focusNode: {
  //         tagName: "DIV"
  //       }
  //     };
  //   };
  //   window.document = (new JSDOM(`<!DOCTYPE html><body><article>hey</article></body>`)).window.document;
  //   console.log(window.document.getElementsByTagName("article")[0])
  //   const option = {
  //     value: "SCENE_HEADING"
  //   };
  //   const fn = actions.handleSelect(option);
  //   expect(fn).toBeInstanceOf(Function);
  //   const dispatch = spy();
  //   const getState = () => ({ lineType: lineTypes.ACT });
  //   fn(dispatch, getState);
  //   expect(dispatch.calledWith({ type: actions.SET_LINE_TYPE, lineType: lineTypes.SCENE_HEADING })).toBe(true);
  // });
});
