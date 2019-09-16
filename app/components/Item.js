import React, { Component } from 'react';
import styles from './Select.css';
import { SelectProps } from './Props';

export default class Item extends Component<SelectProps> {
  props: SelectProps;

  changeValue = () => {
    const { onChange, option } = this.props;
    onChange(option);
  };

  render() {
    const { option } = this.props;
    return (
      <div className={styles.item} onMouseDown={this.changeValue}>
        {option.label}
      </div>
    );
  }
}
