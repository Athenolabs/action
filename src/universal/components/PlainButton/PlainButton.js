import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';

import withStyles from 'universal/styles/withStyles';

const PlainButton = ({styles, ...props}) => (
  <button className={css(styles.root)} {...props}>
    {props.children}
  </button>
);

PlainButton.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
  styles: PropTypes.object.isRequired
};

const styleThunk = () => ({
  root: {
    background: 'inherit',
    border: 'none',
    'border-radius': 0,
    margin: 0,
    padding: 0
  }
});

export default withStyles(styleThunk)(PlainButton);
