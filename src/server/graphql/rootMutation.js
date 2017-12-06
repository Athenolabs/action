import {GraphQLObjectType} from 'graphql';
import meeting from 'server/graphql/models/Meeting/meetingMutation';
import organization from 'server/graphql/models/Organization/organizationMutation';
import orgApproval from 'server/graphql/models/OrgApproval/orgApprovalMutation';
import presence from 'server/graphql/models/Presence/presenceMutation';
import team from 'server/graphql/models/Team/teamMutation';
import teamMember from 'server/graphql/models/TeamMember/teamMemberMutation';
import user from 'server/graphql/models/User/userMutation';
import acceptTeamInviteEmail from 'server/graphql/mutations/acceptTeamInviteEmail';
import acceptTeamInviteNotification from 'server/graphql/mutations/acceptTeamInviteNotification';
import addAgendaItem from 'server/graphql/mutations/addAgendaItem';
import addGitHubRepo from 'server/graphql/mutations/addGitHubRepo';
import addOrg from 'server/graphql/mutations/addOrg';
import addProvider from 'server/graphql/mutations/addProvider';
import addSlackChannel from 'server/graphql/mutations/addSlackChannel';
import approveToOrg from 'server/graphql/mutations/approveToOrg';
import cancelTeamInvite from 'server/graphql/mutations/cancelTeamInvite';
import clearNotification from 'server/graphql/mutations/clearNotification';
import createGitHubIssue from 'server/graphql/mutations/createGitHubIssue';
import createTask from 'server/graphql/mutations/createTask';
import deleteTask from 'server/graphql/mutations/deleteTask';
import editTask from 'server/graphql/mutations/editTask';
import endMeeting from 'server/graphql/mutations/endMeeting';
import githubAddAssignee from 'server/graphql/mutations/githubAddAssignee';
import githubAddMember from 'server/graphql/mutations/githubAddMember';
import githubRemoveMember from 'server/graphql/mutations/githubRemoveMember';
import inactivateUser from 'server/graphql/mutations/inactivateUser';
import inviteTeamMembers from 'server/graphql/mutations/inviteTeamMembers';
import joinIntegration from 'server/graphql/mutations/joinIntegration';
import killMeeting from 'server/graphql/mutations/killMeeting';
import leaveIntegration from 'server/graphql/mutations/leaveIntegration';
import meetingCheckIn from 'server/graphql/mutations/meetingCheckIn';
import moveMeeting from 'server/graphql/mutations/moveMeeting';
import promoteFacilitator from 'server/graphql/mutations/promoteFacilitator';
import removeAgendaItem from 'server/graphql/mutations/removeAgendaItem';
import removeGitHubRepo from 'server/graphql/mutations/removeGitHubRepo';
import removeProvider from 'server/graphql/mutations/removeProvider';
import removeSlackChannel from 'server/graphql/mutations/removeSlackChannel';
import removeTeamMember from 'server/graphql/mutations/removeTeamMember';
import requestFacilitator from 'server/graphql/mutations/requestFacilitator';
import resendTeamInvite from 'server/graphql/mutations/resendTeamInvite';
import segmentEventTrack from 'server/graphql/mutations/segmentEventTrack';
import setOrgUserRole from 'server/graphql/mutations/setOrgUserRole';
import startMeeting from 'server/graphql/mutations/startMeeting';
import stripeCreateInvoice from 'server/graphql/mutations/stripeCreateInvoice';
import stripeFailPayment from 'server/graphql/mutations/stripeFailPayment';
import stripeSucceedPayment from 'server/graphql/mutations/stripeSucceedPayment';
import stripeUpdateCreditCard from 'server/graphql/mutations/stripeUpdateCreditCard';
import stripeUpdateInvoiceItem from 'server/graphql/mutations/stripeUpdateInvoiceItem';
import toggleAgendaList from 'server/graphql/mutations/toggleAgendaList';
import updateAgendaItem from 'server/graphql/mutations/updateAgendaItem';
import updateCreditCard from 'server/graphql/mutations/updateCreditCard';
import updateOrg from 'server/graphql/mutations/updateOrg';
import updateTask from 'server/graphql/mutations/updateTask';
import updateCheckInQuestion from 'server/graphql/mutations/updateTeamCheckInQuestion';
import upgradeToPro from 'server/graphql/mutations/upgradeToPro';

const rootFields = Object.assign({},
  meeting,
  orgApproval,
  organization,
  presence,
  team,
  teamMember,
  user
);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ...rootFields,
    acceptTeamInviteEmail,
    acceptTeamInviteNotification,
    addAgendaItem,
    addGitHubRepo,
    addOrg,
    addProvider,
    addSlackChannel,
    approveToOrg,
    cancelTeamInvite,
    clearNotification,
    createGitHubIssue,
    createTask,
    deleteTask,
    editTask,
    endMeeting,
    githubAddAssignee,
    githubAddMember,
    githubRemoveMember,
    inactivateUser,
    inviteTeamMembers,
    joinIntegration,
    killMeeting,
    leaveIntegration,
    meetingCheckIn,
    moveMeeting,
    promoteFacilitator,
    removeAgendaItem,
    removeProvider,
    removeSlackChannel,
    removeGitHubRepo,
    removeTeamMember,
    requestFacilitator,
    resendTeamInvite,
    segmentEventTrack,
    setOrgUserRole,
    startMeeting,
    stripeCreateInvoice,
    stripeFailPayment,
    stripeSucceedPayment,
    stripeUpdateCreditCard,
    stripeUpdateInvoiceItem,
    toggleAgendaList,
    updateAgendaItem,
    updateCreditCard,
    updateOrg,
    updateCheckInQuestion,
    updateTask,
    upgradeToPro
  })
});
