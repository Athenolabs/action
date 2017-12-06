import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import connectionFromTasks from 'server/graphql/queries/helpers/connectionFromTasks';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import {TaskConnection} from 'server/graphql/types/Task';
import Team from 'server/graphql/types/Team';
import User from 'server/graphql/types/User';

const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'An ID for the teamMember. userId::teamId'
    },
    isNotRemoved: {
      type: GraphQLBoolean,
      description: 'true if the user is a part of the team, false if they no longer are'
    },
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'},
    hideAgenda: {
      type: GraphQLBoolean,
      description: 'hide the agenda list on the dashboard'
    },
    /* denormalized from User */
    email: {
      type: GraphQLEmailType,
      description: 'The user email'
    },
    picture: {
      type: GraphQLURLType,
      description: 'url of user’s profile picture'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    },
    /* Ephemeral meeting state */
    checkInOrder: {
      type: GraphQLInt,
      description: 'The place in line for checkIn, regenerated every meeting'
    },
    isCheckedIn: {
      type: GraphQLBoolean,
      description: 'true if present, false if absent, null before check-in'
    },
    /* Foreign keys */
    teamId: {
      type: GraphQLID,
      description: 'foreign key to Team table'
    },
    userId: {
      type: GraphQLID,
      description: 'foreign key to User table'
    },
    /* GraphQL sugar */
    team: {
      type: Team,
      description: 'The team this team member belongs to',
      resolve({teamId}) {
        const r = getRethink();
        return r.table('Team')
          .get(teamId)
          .run();
      }
    },
    user: {
      type: User,
      description: 'The user for the team member',
      resolve({userId}, args, {getDataLoader}) {
        return getDataLoader().users.load(userId);
      }
    },
    tasks: {
      type: TaskConnection,
      description: 'Tasks owned by the team member',
      args: {
        ...forwardConnectionArgs,
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
        // private: {
        //  type: GraphQLBoolean,
        //  description: 'true if the result should include private cards'
        // }
      },
      resolve: async ({teamId, userId}, args, {getDataLoader}) => {
        const allTasks = await getDataLoader().tasksByTeamId.load(teamId);
        const tasksForUserId = allTasks.filter((task) => task.userId === userId);
        const publicTasksForUserId = tasksForUserId.filter((task) => !task.tags.includes('private'));
        return connectionFromTasks(publicTasksForUserId);
      }
    }
  })
});

export default TeamMember;
