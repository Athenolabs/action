import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import {clearNotificationLabel} from '../helpers/constants';

const KickedOut = (props) => {
  const {
    atmosphere,
    styles,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props;
  const {id, teamName} = notification;
  const {id: dbNotificationId} = fromGlobalId(id);
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, dbNotificationId, onError, onCompleted);
  };
  return (
    <Row>
      <div className={css(styles.icon)}>
        <IconAvatar icon="users" size="medium" />
      </div>
      <div className={css(styles.message)}>
        <span className={css(styles.messageVar)}>You have been removed from the</span>
        <span className={css(styles.messageVar)}> {teamName} </span>
        team.
      </div>
      <div className={css(styles.button)}>
        <Button
          aria-label={clearNotificationLabel}
          colorPalette="cool"
          waiting={submitting}
          isBlock
          label="OK"
          buttonSize={ui.notificationButtonSize}
          type="submit"
          onClick={acknowledge}
        />
      </div>
    </Row>
  );
};

KickedOut.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    teamName: PropTypes.string.isRequired
  })
};

const styleThunk = () => ({
  ...defaultStyles,

  button: {
    marginLeft: ui.rowGutter,
    minWidth: '3.5rem'
  }
});

export default withStyles(styleThunk)(KickedOut);
