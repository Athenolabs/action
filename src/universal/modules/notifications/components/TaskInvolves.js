import {css} from 'aphrodite-local-styles/no-important';
import {convertFromRaw, Editor, EditorState} from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';
import withRouter from 'react-router-dom/es/withRouter';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import editorDecorators from 'universal/components/TaskEditor/decorators';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import {ACTIVE, DONE, FUTURE, STUCK} from 'universal/utils/constants';
import withStyles from 'universal/styles/withStyles';
import {ASSIGNEE, MENTIONEE} from 'universal/utils/constants';
import {clearNotificationLabel} from '../helpers/constants';

const involvementWord = {
  [ASSIGNEE]: 'assigned',
  [MENTIONEE]: 'mentioned'
};

const TaskInvolves = (props) => {
  const {
    atmosphere,
    styles,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted,
    history
  } = props;
  const {id: notificationId, team, task, involvement, changeAuthor: {preferredName: changeAuthorName}} = notification;
  const {id: teamId, name: teamName} = team;
  const {content, status, tags, teamMember} = task;
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
  };
  const gotoBoard = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
    const archiveSuffix = tags.includes('archived') ? '/archive' : '';
    history.push(`/team/${teamId}${archiveSuffix}`);
  };
  const action = involvementWord[involvement];
  const contentState = convertFromRaw(JSON.parse(content));
  const editorState = EditorState.createWithContent(contentState, editorDecorators);
  const taskStyles = css(
    styles.taskListView,
    styles[status],
    tags.includes('private') && styles.private
  );
  return (
    <Row compact>
      <div className={css(styles.icon)}>
        <IconAvatar icon={involvement === MENTIONEE ? 'at' : 'id-card-o'} size="small" />
      </div>
      <div className={css(styles.message)}>
        <div className={css(styles.messageText)}>
          <b>{changeAuthorName}</b>
          <span>{' has '}</span>
          <b><i>{`${action} you`}</i></b>
          {involvement === MENTIONEE ? ' in' : ''}
          <span>{' a task for '}</span>
          <span className={css(styles.messageVar, styles.notifLink)} onClick={gotoBoard} title={`Go to ${teamName}’s Board`}>
            {teamName}
          </span>
          <span>{':'}</span>
        </div>
        <div className={taskStyles}>
          <Editor
            readOnly
            editorState={editorState}
          />
          {teamMember &&
            <div className={css(styles.owner)}>
              <img alt="Avatar" className={css(styles.ownerAvatar)} src={teamMember.picture} />
              <div className={css(styles.ownerName)}>
                {teamMember.preferredName}
              </div>
            </div>
          }
        </div>
      </div>
      <div className={css(styles.buttonGroup)}>
        <div className={css(styles.widerButton)}>
          <Button
            aria-label="Go to this board"
            colorPalette="cool"
            isBlock
            label="Go to Board"
            buttonSize={ui.notificationButtonSize}
            type="submit"
            onClick={gotoBoard}
            waiting={submitting}
          />
        </div>
        <div className={css(styles.iconButton)}>
          <Button
            aria-label={clearNotificationLabel}
            buttonSize="small"
            colorPalette="gray"
            icon="check"
            isBlock
            onClick={acknowledge}
            type="submit"
          />
        </div>
      </div>
    </Row>
  );
};

TaskInvolves.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    team: PropTypes.object.isRequired
  })
};

const styleThunk = () => ({
  ...defaultStyles,

  taskListView: {
    backgroundColor: appTheme.palette.mid10l,
    borderRadius: ui.borderRadiusMedium,
    borderLeft: '.25rem solid',
    margin: '.25rem 0 0',
    padding: '.5rem'
  },

  [ACTIVE]: {
    borderColor: labels.taskStatus[ACTIVE].color
  },

  [STUCK]: {
    borderColor: labels.taskStatus[STUCK].color
  },

  [DONE]: {
    borderColor: labels.taskStatus[DONE].color
  },

  [FUTURE]: {
    borderColor: labels.taskStatus[FUTURE].color
  },

  private: {
    backgroundColor: ui.privateCardBgColor
  }
});

export default withRouter(withStyles(styleThunk)(TaskInvolves));
