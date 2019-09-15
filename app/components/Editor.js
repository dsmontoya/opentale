// @flow
import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable'
import Select from 'react-select'
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import lineTypes from '../constants/lineTypes';
import styles from './Editor.css';

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

export default class Editor extends Component<Props> {
  props: Props;
  constructor() {
      super()
      this.contentEditable = React.createRef();
    };

    handleSelect(obj: any, action: string) {
      console.log(obj,action)
    }

    formatLineType(key: string) {
      var t = lineTypes[key]
      var split = t.split("_")
      var name: string = ""
      for (let i = 0; i < split.length; i++) {
        const element = split[i];
        name += element
        if (i != split.length-1) {
          name += " "
        }
      }
      return name
    }

    formatLineTypes() {
      var newLineTypes = []
      for (var key in lineTypes) {
        const name = this.formatLineType(key)
        newLineTypes.push({value: key, label: name})
      }
      return newLineTypes
    }

    lineTypeToSelectOption(t: string) {
      const key = t.toUpperCase()
      return {value: key, label: this.formatLineType(key)}
    }

  render() {
    const {
     editor,
     lineType,
     nextLine,
     handleClick,
     html
    } = this.props;
    return (
      <div>
        <Link to={routes.HOME}>
        <i className="fa fa-arrow-left fa-3x" />
        </Link>
        <EditButton cmd="italic" />
        <EditButton cmd="insertHTML" arg="<div class='test'></div>" />
        line type: {lineType.toUpperCase()}
        <Select options={this.formatLineTypes()} onChange={this.handleSelect} value={this.lineTypeToSelectOption(lineType)} className={styles.line_types} />
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
