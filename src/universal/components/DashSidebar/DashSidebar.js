import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import FontAwesome from 'react-fontawesome';
import DashNavList from 'universal/components/DashNavList/DashNavList';
import DashNavItem from 'universal/components/DashNavItem/DashNavItem';
import UserHub from 'universal/components/UserHub/UserHub';

let styles = {};

// const sampleDashNav = [
//   {
//     active: false,
//     label: 'Core'
//   },
//   {
//     active: false,
//     label: 'Engineering'
//   },
//   {
//     active: false,
//     label: 'Product'
//   },
//   {
//     active: false,
//     label: 'Talent'
//   }
// ];

const DashSidebar = (props) =>
  <div className={styles.root}>
    <UserHub user={props.user} />
    <nav className={styles.nav}>
      <div className={styles.singleNavItem}>
        <DashNavItem active label="My Outcomes" />
      </div>
      <div className={styles.navLabel}>
        Teams
      </div>
      <DashNavList items={props.teams} />
      <div className={styles.addTeam} title="Add New Team">
        <div className={styles.addTeamIcon}>
          <FontAwesome name="plus-square" />
        </div>
        <div className={styles.addTeamLabel}>
          Add New Team
        </div>
      </div>
    </nav>
  </div>;

DashSidebar.propTypes = {
  user: PropTypes.object,
  teams: PropTypes.array
};

styles = StyleSheet.create({
  root: {
    width: '100%'
  },

  nav: {
    paddingLeft: '3.75rem',
    width: '100%'
  },

  singleNavItem: {
    padding: '1.25rem 0'
  },

  navLabel: {
    borderTop: '1px solid rgba(255, 255, 255, .5)',
    fontSize: theme.typography.s2,
    fontWeight: 700,
    marginLeft: '1rem',
    padding: '1rem 0',
    textTransform: 'uppercase'
  },

  addTeam: {
    cursor: 'pointer',
    position: 'relative',

    ':hover': {
      opacity: '.5'
    },
    ':focus': {
      opacity: '.5'
    }
  },

  addTeamIcon: {
    fontSize: '28px',
    height: '28px',
    lineHeight: '28px',
    position: 'absolute',
    right: '100%',
    top: '1px',
    width: '24px',
  },

  addTeamLabel: {
    fontSize: theme.typography.s2,
    fontWeight: 700,
    lineHeight: theme.typography.s4,
    padding: '.4375rem .5rem .4375rem 1rem',
    textTransform: 'uppercase'
  }
});

export default look(DashSidebar);
