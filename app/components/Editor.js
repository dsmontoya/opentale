// @flow
import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import { Link } from 'react-router-dom';
import Select from './Select';
import routes from '../constants/routes';
import lineTypes from '../constants/lineTypes';
import { formatLineTypes, lineTypeToSelectOption } from '../utils/select'
// import styles from './Editor.css';

type Props = {
  handleClick: () => void,
  handleSelect: () => void,
  nextLine: () => void,
  lineType: string,
  html: string
};

export default class Editor extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.contentEditable = React.createRef();
  }

  render() {
    const { lineType, nextLine, handleClick, handleSelect, html } = this.props;

    return (
      <div>
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x" />
        </Link>
        <Select
          options={formatLineTypes()}
          value={lineTypeToSelectOption(lineType)}
          onChange={handleSelect}
        />
        <ContentEditable
          innerRef={this.contentEditable}
          html={html} // innerHTML of the editable div
          disabled={false} // use true to disable editing
          onChange={nextLine} // handle innerHTML change
          onClick={handleClick}
          className="editor"
          tagName="div" // Use a custom HTML tag (uses a div by default)
        />
      </div>
    );
  }
}
