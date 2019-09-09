// @flow
import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable'
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Editor.css';

type Props = {
  editor: string
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
      this.state = {currentType: "scene_heading", html: "<div class='scene_heading'>hey</div>"};
      console.log("yay",this.contentEditable)
    };


  handleChange = (evt: any) => {
    console.log("evt",evt)
    var selection = window.getSelection()
    var focusNode = selection.focusNode
    var tagName = focusNode.tagName
    var nativeEvent = evt.nativeEvent
    if (nativeEvent.inputType == "insertParagraph") {
      console.log("new paragraph")
    }
    this.setState({html: evt.target.value});
  };

  render() {
    const {
     editor
    } = this.props;
    return (
      <div>
        <Link to={routes.HOME}>
        <i className="fa fa-arrow-left fa-3x" />
        </Link>
        <EditButton cmd="italic" />
        <EditButton cmd="insertHTML" arg="<div class='test'></div>" />
        line type: {editor}
        <ContentEditable
        innerRef={this.contentEditable}
        html={this.state.html} // innerHTML of the editable div
        disabled={false}       // use true to disable editing
        onChange={this.handleChange} // handle innerHTML change
        tagName='article' // Use a custom HTML tag (uses a div by default)
        />
      </div>
    );
  }
}
