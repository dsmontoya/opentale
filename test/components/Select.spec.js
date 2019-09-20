import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import Select from '../../app/components/Select';
import Menu from '../../app/components/Menu';
import styles from '../../app/components/Select.css';
import expectExport from 'expect';
import lineTypes from '../../app/constants/lineTypes';
import { formatLineTypes,lineTypeToSelectOption } from '../../app/utils/select'

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const component = mount(<Select options={formatLineTypes()} value={lineTypeToSelectOption(lineTypes.SCENE_HEADING)}/>);
  return {
    component,
  };
}

describe('Editor component', () => {
  it('should display the current line type', () => {
    const { component } = setup();
    expect(component.text()).toBe("scene heading");
  });

  it('should open the menu', () => {
    const { component } = setup();
    let menu = component.find(Menu);
    expect(menu).toHaveLength(0)
    component.setState(state => ({ menuIsOpen: true }))
    menu = component.find(Menu);
    expect(menu.text()).toBe("actscene headingactioncharacterdialogueparentheticaltransitionshotnormal")
  });
});
