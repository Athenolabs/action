import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getEndMeetingSortOrders from 'server/graphql/mutations/helpers/endMeeting/getEndMeetingSortOrders';
import {endSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack';
import UpdateMeetingPayload from 'server/graphql/types/UpdateMeetingPayload';
import archiveTasksForDB from 'server/safeMutations/archiveTasksForDB';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {errorObj} from 'server/utils/utils';
import {DONE, LOBBY, MEETING_UPDATED, TASK_UPDATED, SUMMARY} from 'universal/utils/constants';
import {makeSuccessExpression, makeSuccessStatement} from 'universal/utils/makeSuccessCopy';

export default {
  type: UpdateMeetingPayload,
  description: 'Finish a meeting and go to the summary',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that will be having the meeting'
    }
  },
  async resolve(source, {teamId}, {authToken, socketId, getDataLoader}) {
    const r = getRethink();
    const dataLoader = getDataLoader();
    const operationId = dataLoader.share();

    // AUTH
    requireSUOrTeamMember(authToken, teamId);
    const meeting = await r.table('Meeting')
    // get the most recent meeting
      .getAll(teamId, {index: 'teamId'})
      .orderBy(r.desc('createdAt'))
      .nth(0)
      .pluck('id', 'endedAt')
      .default({endedAt: r.now()});
    if (meeting.endedAt) {
      throw errorObj({_error: 'Meeting already ended!'});
    }

    // RESOLUTION
    const now = new Date();
    const {id: meetingId} = meeting;
    const completedMeeting = await r.table('AgendaItem')
    // get all agenda items
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .map((doc) => doc('id'))
      .coerceTo('array')
      .do((agendaItemIds) => {
        return r.table('Task')
          .getAll(r.args(agendaItemIds), {index: 'agendaId'})
          .map((row) => row.merge({id: r.expr(meetingId).add('::').add(row('id'))}))
          .orderBy('createdAt')
          .pluck('id', 'content', 'status', 'tags', 'teamMemberId')
          .coerceTo('array')
          .default([])
          .do((tasks) => {
            return r.table('Meeting').get(meetingId)
              .update({
                agendaItemsCompleted: agendaItemIds.count().default(0),
                endedAt: now,
                facilitator: `${authToken.sub}::${teamId}`,
                successExpression: makeSuccessExpression(),
                successStatement: makeSuccessStatement(),
                invitees: r.table('TeamMember')
                  .getAll(teamId, {index: 'teamId'})
                  .filter({isNotRemoved: true})
                  .orderBy('preferredName')
                  .coerceTo('array')
                  .map((teamMember) => ({
                    id: teamMember('id'),
                    picture: teamMember('picture'),
                    preferredName: teamMember('preferredName'),
                    present: teamMember('isCheckedIn').not().not()
                      .default(false),
                    tasks: tasks.filter({teamMemberId: teamMember('id')})
                  })),
                tasks
              }, {
                nonAtomic: true,
                returnChanges: true
              })('changes')(0)('new_val').pluck('invitees', 'meetingNumber', 'tasks');
          });
      });
    const updatedTasks = await getEndMeetingSortOrders(completedMeeting);
    const {tasksToArchive} = await r({
      updatedSortOrders: r(updatedTasks)
        .forEach((task) => {
          return r.table('Task').get(task('id')).update({
            sortOrder: task('sortOrder')
          });
        }),
      // send to summary view
      team: r.table('Team').get(teamId)
        .update({
          facilitatorPhase: LOBBY,
          meetingPhase: LOBBY,
          meetingId: null,
          facilitatorPhaseItem: null,
          meetingPhaseItem: null,
          activeFacilitator: null
        }),
      agenda: r.table('AgendaItem').getAll(teamId, {index: 'teamId'})
        .update({
          isActive: false
        }),
      // shuffle the teamMember check in order, uncheck them in
      teamMember: r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .sample(100000)
        .coerceTo('array')
        .do((arr) => arr.forEach((doc) => {
          return r.table('TeamMember').get(doc('id'))
            .update({
              checkInOrder: arr.offsetsOf(doc).nth(0),
              isCheckedIn: null
            });
        })),
      tasksToArchive: r.table('Task').getAll(teamId, {index: 'teamId'})
        .filter({status: DONE})
        .filter((task) => task('tags').contains('archived').not())
        .pluck('id', 'content', 'tags')
        .coerceTo('array')
    });

    if (tasksToArchive.length) {
      const archivedTasks = await archiveTasksForDB(tasksToArchive);
      archivedTasks.forEach((task) => {
        const taskUpdated = {task};
        // since this is from the meeting, we don't need to remove it from the user dash
        // because we are guaranteed they have a sub going for the team dash
        getPubSub().publish(`${TASK_UPDATED}.${teamId}`, taskUpdated);
      });
    }
    const {meetingNumber} = completedMeeting;
    const userIds = completedMeeting.invitees
      .filter((invitee) => invitee.present)
      .map((invitee) => invitee.id.split('::')[0]);
    sendSegmentEvent('Meeting Completed', userIds, {teamId, meetingNumber});
    endSlackMeeting(meetingId, teamId);

    const summaryMeeting = {
      facilitatorPhase: SUMMARY,
      meetingPhase: SUMMARY,
      facilitatorPhaseItem: null,
      meetingPhaseItem: null
    };
    const meetingUpdated = {team: summaryMeeting};
    getPubSub().publish(`${MEETING_UPDATED}.${teamId}`, {meetingUpdated, mutatorId: socketId, operationId});
    return meetingUpdated;

    // TODO maybe update team members via pubsub?
  }
};
