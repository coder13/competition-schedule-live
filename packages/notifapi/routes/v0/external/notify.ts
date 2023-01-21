import { Activity, Room, Schedule } from '@wca/helpers';
import { NextFunction, Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import fetch from 'node-fetch';
import { getAllUserCompetitionSubscriptions } from '../../../controllers/competitionSubscription';
import prisma from '../../../db';
import { handleErrors } from '../../../middlewares/errors';
import { twilioClient } from '../../../services/twilio';

const uniqueDefinedSet = <T>(arr: Array<T | null | undefined>): T[] => [
  ...new Set(arr.filter(Boolean) as T[]),
];

const getParentActivitiyCodes = (activityCode: string): string[] => {
  if (activityCode.startsWith('other')) {
    return [];
  }

  const index = activityCode.lastIndexOf('-');
  if (index > -1) {
    const parent = activityCode.slice(0, index);
    return [parent, ...getParentActivitiyCodes(parent)];
  }

  return [];
};

const getMessagingServiceSid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const messagingServiceId = await prisma.competitionSid.findFirst({
    where: {
      competitionId: {
        equals: req.body.competitionId.toLowerCase(),
        mode: 'insensitive',
      },
    },
  });

  const sid = messagingServiceId?.sid;
  if (!sid) {
    res
      .status(400)
      .json({ success: false, message: 'Invalid messaging service id' });
    return;
  }

  req.sid = sid;
  next();
};

/**
 *
 * @param schedule WCIF Schedule
 * @param id activityId
 * @returns
 */
const activityFromId = (schedule: Schedule, id: number) => {
  const rooms = schedule.venues.flatMap((v) => v.rooms);
  const roomActivities = rooms.flatMap((r) => r.activities);
  const allActivities = roomActivities.flatMap((r) => [
    r,
    ...(r.childActivities ?? []),
  ]);

  const activity = allActivities.find((a) => a.id === id);
  if (!activity) {
    throw new Error(`Activity with id ${id} not found`);
  }

  return activity;
};

const roomsAndActivitiesFromCode = (schedule: Schedule, code: string) => {
  const rooms = schedule.venues
    .flatMap((v) => v.rooms)
    .filter((r) =>
      r.activities.some(
        (ra) =>
          ra.activityCode === code ||
          ra?.childActivities?.some((ca) => ca.activityCode === code)
      )
    );

  const activities = rooms.flatMap((ra) =>
    ra.activities
      .flatMap((ca) => [ca, ...(ca.childActivities ?? [])])
      .filter((a) => a.activityCode === code)
  );

  return {
    activities,
    rooms,
  };
};

const router = Router();

interface ActivityNotification {
  type: 'activity';
  id: number;
}

interface CompetitorNotification {
  type: 'competitor';
  /**
   * id of competitor
   */
  id: number;
  /**
   * name of competitor
   */
  name: string;
  activityId?: number;
  assignmentCode?: string;
}

const isActivity = (
  a: ActivityNotification | CompetitorNotification
): a is ActivityNotification => a.type === 'activity';
const isCompetitor = (
  a: ActivityNotification | CompetitorNotification
): a is CompetitorNotification => a.type === 'competitor';

/**
 * Main route with which to ping users
 * fetches the schedule and only fetches the schedule.
 * /v0/external/notify
 * body: {
 *   competitionId: string,
 *   notifications: (ActivityNotification | CompetitorNotification)[],
 * }
 *
 */
router.post(
  '/notify',
  check('competitionId').exists().isString(),
  check('notifications')
    .isArray()
    .custom((notifications) => {
      return notifications.every(
        (n: ActivityNotification | CompetitorNotification) => {
          if (isActivity(n)) {
            return n.id === undefined || (n.id && typeof n.id === 'number');
          }

          if (isCompetitor(n)) {
            return (
              n.id &&
              typeof n.id === 'number' &&
              n.name &&
              typeof n.name === 'string' &&
              (n.activityId === undefined ||
                (n.activityId && typeof n.activityId === 'number')) &&
              (n.assignmentCode === undefined ||
                (n.assignmentCode && typeof n.assignmentCode === 'string'))
            );
          }

          return false;
        }
      );
    }),
  handleErrors,
  getMessagingServiceSid,
  async (req: Request, res: Response) => {
    try {
      // map of phone numbers to messages

      const { competitionId, notifications } = req.body as {
        competitionId: string;
        notifications: Array<ActivityNotification | CompetitorNotification>;
      };

      const scheduleData = (await (
        await fetch(
          new URL(
            `/api/v0/competitions/${competitionId}/schedule`,
            process.env.WCA_ORIGIN
          )
        )
      ).json()) as Schedule;

      /**
       * I need to group activity notifications by activityCode
       * I'm going to send this server notifications for activity "17" and "18" and I want to group that into some datastructure that resolves to an activityCode and which rooms are being notified
       * that data strucutre looks like:
       * {
       * "333-r1-g1": [{
       *   "id": 1,
       *   "name": "Room 1",
       * }, {
       *   "id": 2,
       *   "name": "Room 2",
       * }]
       *
       * User is subscribed to "333-r1" so they are notified of this.
       * Their notification looks like "3x3x3 Round 1 group 1 is happening at Room 1 and Room 2"
       *
       * This looks like we should create a map of string to array of rooms
       * We'll iterate over the unique activityCodes and figure out which rooms are being notified among these
       * When we go to notify users, we can iterate over the unique activityCodes and notify users who are subscribed to that activityCode
       *
       */

      const activityNotifications = notifications.filter(
        (n) => n.type === 'activity'
      ) as ActivityNotification[];

      // short lived memory cache of activity data
      const activityData = new Map<number, Activity>();
      activityNotifications.forEach((n) => {
        const activity = activityFromId(scheduleData, n.id);
        activityData.set(n.id, activity);
      });

      // Array of activityCodes to send notifications for
      const notificationActivityCodes = uniqueDefinedSet(
        activityNotifications.map((n) => {
          const activity = activityData.get(n.id);
          if (!activity) {
            return null;
          }
          return activity.activityCode;
        })
      );

      // Unique set of activityCodes that include the parents to search on user competition subscriptions
      const activityCodesForSearch = uniqueDefinedSet(
        notificationActivityCodes.flatMap((code) => [
          code,
          ...getParentActivitiyCodes(code),
        ])
      );

      const usersToPing = await getAllUserCompetitionSubscriptions(
        competitionId,
        activityCodesForSearch
      );

      const messagesByUser = new Map<number, string[]>();

      const activityCodeData = new Map<
        string,
        {
          activities: Activity[];
          rooms: Room[];
        }
      >();

      notificationActivityCodes.forEach((code) => {
        activityCodeData.set(
          code,
          roomsAndActivitiesFromCode(scheduleData, code)
        );
      });

      console.log('Notifying', usersToPing.length, 'users');
      usersToPing.forEach(({ user }) => {
        notificationActivityCodes.forEach((code) => {
          const data = activityCodeData.get(code);
          if (!data) {
            return;
          }

          const activityName = data?.activities[0].name; //  They all have the same name

          messagesByUser.set(user.id, [
            ...(messagesByUser.get(user.id) ?? []),
            // TODO: create a more advanced concatenation of the room names
            `${activityName} is starting now on the ${data.rooms
              .map((room) => room.name)
              .join(' and the ')}!`,
          ]);
        });
      });

      const twilioRes = await Promise.all(
        [...messagesByUser.entries()].map(async ([userId, messages]) => {
          const user = usersToPing.find((u) => u.user.id === userId);

          if (!user) {
            throw new Error('User not found!');
          }

          if (!user.user.phoneNumber) {
            return;
          }

          return await twilioClient.messages.create({
            messagingServiceSid: req.sid,
            to: user.user.phoneNumber,
            body: messages.join('\n'),
          });
        })
      );

      const successfulSends = twilioRes.filter(
        (r) => r && r.status === 'accepted'
      );

      res.json({
        success: true,
        numberOfUsersNotified: usersToPing.length,
        message: `${successfulSends.length} messages sent`,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({
        success: false,
        message: 'Error occured while sending notifications',
      });
    }
  }
);

export default router;
