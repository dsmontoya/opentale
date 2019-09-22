import React, { Component } from 'react';
import styles from './Select.css';
import { SelectProps } from './Props';
import Menu from './Menu';

export default class Select extends Component<SelectProps, State> {
  props: SelectProps;

  state = {
    menuIsOpen: false
  };

  openMenu = evt => {
    evt.preventDefault();
    this.setState(state => ({ menuIsOpen: !state.menuIsOpen }));
  };

  render() {
    const { menuIsOpen } = this.state;
    const { onChange, options, value } = this.props;
    console.log("options",options)
    return (
      <div className="select">
        <div className={styles.container} onMouseDown={this.openMenu}>
          <div className={styles.control}>
            <div className="single-value">
              <div className={styles.singleValue}>{value.label}</div>
            </div>
          </div>
          {menuIsOpen ? <Menu options={options} onChange={onChange} /> : null}
        </div>
      </div>
    );
  }
}
