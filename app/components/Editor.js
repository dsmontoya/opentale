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

    formatLineTypes(lt: any) {
      var newLineTypes = []
      for (var key in lt) {
        var t = lt[key]
        var split = t.split("_")
        console.log("split",split)
        var name: string = ""
        for (let i = 0; i < split.length; i++) {
          const element = split[i];
          console.log("element",element)
          console.log("uppercase before",name)
          name += element
          if (i != split.length-1) {
            name += " "
          }
        }
        console.log("uppercase",name)
        newLineTypes.push({value: key, label: name})
      }
      return newLineTypes
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
        line type: {lineType}
        <Select options={this.formatLineTypes(lineTypes)} />
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
