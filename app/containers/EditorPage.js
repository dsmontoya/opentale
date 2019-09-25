import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Editor from '../components/Editor';
import * as EditorActions from '../actions/editor';

function mapStateToProps(state) {
  return {
    editor: state.editor,
    lineType: state.lineType,
    html: state.html
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(EditorActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);
