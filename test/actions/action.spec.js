import { spy } from 'sinon';
import lineTypes from '../../app/constants/lineTypes';
import * as actions from '../../app/actions/editor';

describe('actions', () => {
  it('should update the line type when a line is clicked', () => {
    const evt = {
      target: {
        className: 'Editor__scene_heading__FQx_9'
      }
    };
    const fn = actions.handleClick(evt);
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const getState = () => ({ lineType: lineTypes.ACT });
    fn(dispatch, getState);
    expect(
      dispatch.calledWith({
        type: actions.SET_LINE_TYPE,
        lineType: lineTypes.SCENE_HEADING
      })
    ).toBe(true);
  });

  it('should update the line type when a line type is selected from menu', () => {
    window.getSelection = () => {
      return {
        focusNode: {
          tagName: 'DIV'
        }
      };
    };
    window.document.body.innerHTML = `<!DOCTYPE html><body><div class='editor'>hey</div></body>`;
    const option = {
      value: 'SCENE_HEADING'
    };
    const fn = actions.handleSelect(option);
    expect(fn).toBeInstanceOf(Function);
    const dispatch = spy();
    const getState = () => ({ lineType: lineTypes.ACT });
    fn(dispatch, getState);
    expect(
      dispatch.calledWith({
        type: actions.SET_LINE_TYPE,
        lineType: lineTypes.SCENE_HEADING
      })
    ).toBe(true);
  });

  it('should remove span', () => {
    setupRange();
    setupSelection();
    const evt = {
      target: {
        value: ''
      },
      nativeEvent: {
        inputType: 'deleteContentBackward'
      }
    };
    window.document.body.innerHTML = `<!DOCTYPE html><body><div class='editor'>text</div></body>`;
    const fn = actions.nextLine(evt);
    const dispatch = spy();
    fn(dispatch);
    const selection = window.getSelection();
    const { focusNode } = selection;
    expect(
      dispatch.calledWith({
        type: actions.UPDATE_HTML,
        html: 'text'
      })
    ).toBe(true);
    expect(
      focusNode.parentNode.removeChild.calledWith(
        window.getSelection().focusNode.nextSibling
      )
    ).toBe(true);
    expect(focusNode.textContent).toBe('sample text');
  });
});

const setupRange = () => {
  global.window.document.createRange = () => ({
    setStart: spy(),
    setEnd: spy(),
    commonAncestorContainer: {
      nodeName: 'BODY'
    }
  });
};

const setupSelection = () => {
  const selection = {
    focusNode: {
      textContent: 'sample ',
      nextSibling: {
        textContent: 'text'
      },
      parentNode: {
        removeChild: spy()
      }
    },
    addRange: spy(),
    removeAllRanges: spy()
  };
  window.getSelection = () => {
    return selection;
  };
};
