import {css} from 'aphrodite-local-styles/no-important';
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import PlainButton from 'universal/components/PlainButton/PlainButton';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import 'universal/components/TaskEditor/Draft.css';
import Tooltip from 'universal/components/Tooltip/Tooltip';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import UpdateCheckInQuestionMutation from 'universal/mutations/UpdateCheckInQuestionMutation';
import ui from 'universal/styles/ui';
import {tierSupportsUpdateCheckInQuestion} from 'universal/utils/tierSupportsUpdateCheckInQuestion';
import withStyles from 'universal/styles/withStyles';
import EditorInputWrapper from 'universal/components/EditorInputWrapper';
import PropTypes from 'prop-types';

const iconStyle = {
  fontSize: '1rem',
  verticalAlign: 'middle',
  marginLeft: '0.5rem'
};

const buttonStyle = {
  cursor: 'pointer'
};

class CheckInQuestion extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    styles: PropTypes.object.isRequired,
    team: PropTypes.object.isRequired
  }
  state = {
    editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(this.props.team.checkInQuestion)), editorDecorators)
  };

  componentWillReceiveProps(nextProps) {
    const {team: {checkInQuestion}} = nextProps;
    const {team: {oldCheckInQuestion}} = this.props;
    if (checkInQuestion !== oldCheckInQuestion) {
      this.setState({
        editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(checkInQuestion)), editorDecorators)
      });
    }
  }

  setEditorState = (editorState) => {
    const wasFocused = this.state.editorState.getSelection().getHasFocus();
    const isFocused = editorState.getSelection().getHasFocus();
    if (wasFocused !== isFocused) {
      if (!isFocused) {
        const {atmosphere, team: {id: teamId}} = this.props;
        const checkInQuestion = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        UpdateCheckInQuestionMutation(atmosphere, teamId, checkInQuestion);
      }
    }
    this.setState({
      editorState
    });
  }

  selectAllQuestion = () => {
    this.editorRef.focus();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const fullSelection = selection.merge({
      anchorKey: contentState.getFirstBlock().getKey(),
      focusKey: contentState.getLastBlock().getKey(),
      anchorOffset: 0,
      focusOffset: contentState.getLastBlock().getLength()
    });
    const nextEditorState = EditorState.forceSelection(editorState, fullSelection);
    this.setEditorState(nextEditorState);
  };

  render() {
    const {styles, team: {tier}} = this.props;
    const {editorState} = this.state;
    const canEdit = tierSupportsUpdateCheckInQuestion(tier);
    const isEditing = editorState.getSelection().getHasFocus();
    const tip = canEdit
      ? 'Tap to customize'
      : 'Upgrade to a Pro Account to customize the Social Check-in question.';

    return (
      <Tooltip
        tip={<div>{tip}</div>}
        originAnchor={{vertical: 'bottom', horizontal: 'center'}}
        targetAnchor={{vertical: 'top', horizontal: 'center'}}
        hideOnFocus
      >
        <div className={css(styles.root)}>
          <div className={css(styles.editor)}>
            <EditorInputWrapper
              editorState={editorState}
              setEditorState={this.setEditorState}
              placehodler="e.g. How are you?"
              readOnly={!canEdit}
              setRef={(c) => {
                this.editorRef = c;
              }}
            />
          </div>
          {canEdit &&
          <PlainButton aria-label={tip} onClick={this.selectAllQuestion}>
            <FontAwesome
              name="pencil"
              style={{...iconStyle, ...buttonStyle, visibility: isEditing ? 'hidden' : 'visible'}}
            />
          </PlainButton>
          }
          {!canEdit && <FontAwesome name="pencil" style={iconStyle} />}
        </div>
      </Tooltip>
    );
  }
}

const styleThunk = () => ({
  root: {
    display: 'flex',
    fontSize: '1.5rem',
    lineHeight: '1.25rem',
    padding: `${ui.cardPaddingBase} 0 ${ui.cardPaddingBase} 0`,
    fontWeight: 300
  },

  editor: {
    minWidth: '20rem'
  }
});

export default createFragmentContainer(
  withAtmosphere(withStyles(styleThunk)(CheckInQuestion)),
  graphql`
    fragment CheckInQuestion_team on Team {
      id
      checkInQuestion
      tier
    }`
);
