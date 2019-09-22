import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import Editor from '../../app/components/Editor';
import styles from '../../app/components/Editor.css';
import expectExport from 'expect';
import lineTypes from "../../app/constants/lineTypes";
import ContentEditable from 'react-contenteditable';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const actions = {
    handleClick: spy(),
    handleSelect: spy(),
    nextLine: spy(),
  };
  const component = mount(<Router><Editor  html={"<div class='" + styles[lineTypes.SCENE_HEADING] + " line'>hey</div>"} lineType={lineTypes.SCENE_HEADING} {...actions} /></Router>);
  return {
    component,
    actions,
    select: component.find('.select'),
    editor: component.find(ContentEditable)
  };
}

describe('Editor component', () => {
  it('should display a line', () => {
    const { editor } = setup();
    expect(editor.text()).toBe("hey");
  });

  it('should show a line type in menu', () => {
    const { select } = setup();
    expect(select.text()).toBe("scene heading");
  });
});
