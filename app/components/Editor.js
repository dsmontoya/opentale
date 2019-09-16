// @flow
import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import { Link } from 'react-router-dom';
import Select from './Select';
import routes from '../constants/routes';
import lineTypes from '../constants/lineTypes';
// import styles from './Editor.css';

type Props = {
  nextLine: () => void,
  editor: string,
  lineType: string,
  html: string
};

function EditButton(props) {
  return (
    <button
      key={props.cmd}
      onMouseDown={evt => {
        evt.preventDefault(); // Avoids loosing focus from the editable area
        document.execCommand(props.cmd, false, props.arg); // Send the command to the browser
      }}
    >
      {props.name || props.cmd}
    </button>
  );
}

export default class Editor extends Component<Props,State> {
  props: Props;
  constructor() {
      super();
      this.contentEditable = React.createRef();
    };

    formatLineType = (key: string) => {
      var t = lineTypes[key];
      var split = t.split('_');
      var name: string = '';
      for (let i = 0; i < split.length; i++) {
        const element = split[i];
        name += element;
        if (i !== split.length - 1) {
          name += ' ';
        }
      }
      return name;
    }

    formatLineTypes() {
      let newLineTypes = [];
      for (let key in lineTypes) {
        const name = this.formatLineType(key);
        newLineTypes.push({value: key, label: name});
      }
      return newLineTypes;
    }

    lineTypeToSelectOption(t: string) {
      const key = t.toUpperCase();
      return {value: key, label: this.formatLineType(key)};
    }

  render() {
    const {
     editor,
     lineType,
     nextLine,
     handleClick,
     handleSelect,
     html
    } = this.props;

    return (
      <div>
        <Link to={routes.HOME}>
        <i className="fa fa-arrow-left fa-3x" />
        </Link>
        <EditButton cmd="italic" />
        <EditButton cmd="insertHTML" arg="<div class='test'></div>" />
        <Select
        options={this.formatLineTypes()}
        value={this.lineTypeToSelectOption(lineType)}
        onChange={handleSelect}
        />
        <ContentEditable
        innerRef={this.contentEditable}
        html={html} // innerHTML of the editable div
        disabled={false}       // use true to disable editing
        onChange={nextLine} // handle innerHTML change
        onClick={handleClick}
        tagName='article' // Use a custom HTML tag (uses a div by default)
        />
      </div>
    );
  }
}
