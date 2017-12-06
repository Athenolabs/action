import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AreaEnum from 'server/graphql/types/AreaEnum';
import CreateTaskPayload from 'server/graphql/types/CreateTaskPayload';
import CreateTaskInput from 'server/graphql/types/CreateTaskInput';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {
  ASSIGNEE,
  MEETING,
  MENTIONEE,
  NOTIFICATIONS_ADDED,
  TASK_CREATED,
  TASK_INVOLVES
} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';
import makeTaskSchema from 'universal/validation/makeTaskSchema';

export default {
  type: CreateTaskPayload,
  description: 'Create a new task, triggering a CreateCard for other viewers',
  args: {
    newTask: {
      type: new GraphQLNonNull(CreateTaskInput),
      description: 'The new task including an id, status, and type, and teamMemberId'
    },
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    }
  },
  async resolve(source, {newTask, area}, {authToken, getDataLoader}) {
    const r = getRethink();
    const dataLoader = getDataLoader();
    const operationId = dataLoader.share();
    const now = new Date();

    // AUTH
    const myUserId = getUserId(authToken);

    // VALIDATION
    const schema = makeTaskSchema();
    const {errors, data: validNewTask} = schema({content: 1, ...newTask});
    handleSchemaErrors(errors);
    const {teamId, userId, content} = validNewTask;
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const {entityMap} = JSON.parse(content);
    const task = {
      ...validNewTask,
      id: `${teamId}::${shortid.generate()}`,
      agendaId: validNewTask.agendaId,
      content: validNewTask.content,
      createdAt: now,
      createdBy: myUserId,
      sortOrder: validNewTask.sortOrder,
      status: validNewTask.status,
      tags: getTagsFromEntityMap(entityMap),
      teamId,
      teamMemberId: `${userId}::${teamId}`,
      updatedAt: now,
      userId
    };
    const history = {
      id: shortid.generate(),
      content: task.content,
      taskId: task.id,
      status: task.status,
      teamMemberId: task.teamMemberId,
      updatedAt: task.updatedAt
    };
    const {usersToIgnore} = await r({
      task: r.table('Task').insert(task),
      history: r.table('TaskHistory').insert(history),
      usersToIgnore: area === MEETING ? await r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isCheckedIn: true
        })('userId')
        .coerceTo('array') : []
    });
    const taskCreated = {task};

    getPubSub().publish(`${TASK_CREATED}.${teamId}`, {taskCreated, operationId});
    getPubSub().publish(`${TASK_CREATED}.${userId}`, {taskCreated, operationId});

    // Handle notifications
    // Almost always you start out with a blank card assigned to you (except for filtered team dash)
    const changeAuthorId = `${myUserId}::${teamId}`;
    const notificationsToAdd = [];
    if (changeAuthorId !== task.teamMemberId && !usersToIgnore.includes(task.userId)) {
      notificationsToAdd.push({
        id: shortid.generate(),
        startAt: now,
        type: TASK_INVOLVES,
        userIds: [userId],
        involvement: ASSIGNEE,
        taskId: task.id,
        changeAuthorId,
        teamId
      });
    }

    getTypeFromEntityMap('MENTION', entityMap)
      .filter((mention) => mention !== myUserId && mention !== task.userId && !usersToIgnore.includes(mention))
      .forEach((mentioneeUserId) => {
        notificationsToAdd.push({
          id: shortid.generate(),
          startAt: now,
          type: TASK_INVOLVES,
          userIds: [mentioneeUserId],
          involvement: MENTIONEE,
          taskId: task.id,
          changeAuthorId,
          teamId
        });
      });
    if (notificationsToAdd.length) {
      await r.table('Notification').insert(notificationsToAdd);
      notificationsToAdd.forEach((notification) => {
        const notificationsAdded = {notifications: [notification]};
        const notificationUserId = notification.userIds[0];
        getPubSub().publish(`${NOTIFICATIONS_ADDED}.${notificationUserId}`, {notificationsAdded});
      });
    }
    return taskCreated;
  }
};
