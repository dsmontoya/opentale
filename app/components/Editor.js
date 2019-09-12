// @flow
import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable'
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
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
