import {GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql';
import addOrgValidation from 'server/graphql/models/Organization/addOrg/addOrgValidation';
import createNewOrg from 'server/graphql/models/Organization/addOrg/createNewOrg';
import {TeamInput} from 'server/graphql/models/Team/teamSchema';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import {ensureUniqueId, getUserId, requireWebsocket} from 'server/utils/authorization';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {handleSchemaErrors} from 'server/utils/utils';
import createTeamAndLeader from '../../Team/createFirstTeam/createTeamAndLeader';
import Invitee from 'server/graphql/types/Invitee';

export default {
  type: GraphQLBoolean,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(TeamInput),
      description: 'The new team object with exactly 1 team member'
    },
    invitees: {
      type: new GraphQLList(new GraphQLNonNull(Invitee))
    },
    orgName: {
      type: GraphQLString,
      description: 'The name of the new team'
    }
  },
  async resolve(source, args, {authToken, socket}) {
    // AUTH
    const {orgId} = args.newTeam;
    const userId = getUserId(authToken);
    requireWebsocket(socket);

    // VALIDATION
    const {data: {invitees, newTeam, orgName}, errors} = addOrgValidation()(args);
    const {id: teamId} = newTeam;
    handleSchemaErrors(errors);
    // this isn't concurrent-safe, but it reduces the risk of conflicting writes
    await Promise.all([
      ensureUniqueId('Team', teamId),
      ensureUniqueId('Organization', orgId)
    ]);

    // RESOLUTION
    // set the token first because it's on the critical path for UX
    const newAuthToken = {
      ...authToken,
      tms: authToken.tms.concat(teamId),
      exp: undefined
    };
    socket.setAuthToken(newAuthToken);

    await Promise.all([
      createTeamAndLeader(userId, newTeam, true),
      createNewOrg(orgId, orgName, userId)
    ]);

    if (invitees && invitees.length) {
      await inviteTeamMembers(invitees, teamId, userId);
    }
    sendSegmentEvent('New Org', userId, {orgId, teamId});
    return true;
  }
};
