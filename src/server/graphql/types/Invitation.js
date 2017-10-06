import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {globalIdField} from 'graphql-relay';

const Invitation = new GraphQLObjectType({
  name: 'Invitation',
  description: 'An invitation to become a team member',
  fields: () => ({
    id: globalIdField('Invitation', ({id}) => id),
    acceptedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the invitation was accepted'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the invitation was created'
    },
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The email of the invitee'
    },
    fullName: {
      type: GraphQLString,
      description: 'The name of the invitee, derived from the email address'
    },
    hashedToken: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Secret token used when inviting a user',
      // lock it down
      resolve: () => null
    },
    invitedBy: {type: GraphQLID, description: 'The teamMemberId of the person that sent the invitation'},
    inviteCount: {
      type: GraphQLInt,
      description: 'How many invites have been sent to this email address?'
    },
    task: {
      type: GraphQLString,
      description: 'The task that the invitee is currently working on'
    },
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team invited to'},
    tokenExpiration: {
      type: GraphQLISO8601Type,
      description: 'The datestamp of when the invitation will expire'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the invitation was last updated'
    }
  })
});

export default Invitation;