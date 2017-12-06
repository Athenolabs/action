import notificationHandler from 'universal/subscriptions/helpers/notificationHandler';

const subscription = graphql`
  subscription NotificationsAddedSubscription {
    notificationsAdded {
      notifications {
        id
        orgId
        startAt
        type
        ... on NotifyAddedToTeam {
          teamName
          teamId
        }
        ... on NotifyDenial {
          reason
          deniedByName
          inviteeEmail
        }
        ... on NotifyFacilitatorRequest {
          requestor {
            id
            preferredName
          }
        }
        ... on NotifyFacilitatorDisconnected {
          newFacilitator {
            id
            preferredName
            userId
          }
          oldFacilitator {
            preferredName
          }
          teamId
        }
        ... on NotifyInvitation {
          inviterName
          inviteeEmail
          teamId
          teamName
          team {
            tier
          }
        }
        ... on NotifyKickedOut {
          isKickout
          teamName
          teamId
        }
        ... on NotifyNewTeamMember {
          preferredName
          teamName
        }
        ... on NotifyPayment {
          last4
          brand
        }
        ... on NotifyPromotion {
          groupName
        }
        ... on NotifyTeamArchived {
          teamName
        }
        ... on NotifyTaskInvolves {
          involvement
          team {
            id
            name
          }
          changeAuthor {
            preferredName
          }
          task {
            id
            content
            teamMember {
              picture
              preferredName
            }
            status
            tags
          }
        }
      }
    }
  }
`;


const NotificationsAddedSubscription = (environment, queryVariables, {dispatch, history, location}) => {
  const {viewerId} = environment;
  return {
    subscription,
    updater: (store) => {
      const options = {dispatch, environment, history, location, store, viewerId};
      const notifications = store.getRootField('notificationsAdded').getLinkedRecords('notifications');
      notifications.forEach((payload) => {
        const type = payload.getValue('type');
        const handler = notificationHandler[type];
        if (handler) {
          handler(payload, options);
        }
      });
    }
  };
};

export default NotificationsAddedSubscription;
