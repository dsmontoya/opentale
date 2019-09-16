import React, { Component } from 'react';
import styles from './Select.css';
import { SelectProps } from './Props';
import Item from './Item';

export default class Menu extends Component<SelectProps> {
  props: SelectProps;

  render() {
    const { onChange, options } = this.props;
    const optionsMap = options.map(option => (
      <Item key={option.value} option={option} onChange={onChange} />
    ));
    return <div className={styles.menu}>{optionsMap}</div>;
  }
}
