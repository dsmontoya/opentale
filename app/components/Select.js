import React, { Component } from 'react';
import styles from './Select.css';

type Props = {
  onChange: () => void,
};


export default class Select extends Component<Props,State> {
  props: Props
  state = {
    menuIsOpen: false,
  };
  openMenu = (evt) => {
    evt.preventDefault()
    this.setState(state => ({ menuIsOpen: !state.menuIsOpen }));
  }
  render() {
    const { menuIsOpen } = this.state;
    const {onChange} = this.props;
    return (
      <div
      className={styles.container}
      onMouseDown={this.openMenu}>
        <div className={styles.control}>
          <div className={styles.singleValue}>
            {this.props.value.label}
          </div>
        </div>
        {menuIsOpen ? <Menu options={this.props.options} onChange={onChange}/> : null }
      </div>
    )
  }
}

class Menu extends Component<Props> {
  props: Props

  render() {
    const options = this.props.options.map((option) =>
      <Item
      key={option.value}
      option={option}
      onChange={this.props.onChange}/>
    );
    return (
      <div className={styles.menu}>
        {options}
      </div>
    );
  }
}

class Item extends Component<Props> {
  props: Props

  changeValue = (evt) => {
    console.log("changeValue option",this.props.option,"--")
    this.props.onChange(this.props.option)
  }

  render() {
    const { option } = this.props
    return (
      <li
      className={styles.item}
      onMouseDown={this.changeValue}
      >
        {option.label}
      </li>
    )
  }
}
