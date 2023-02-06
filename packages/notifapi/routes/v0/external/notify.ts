import { Activity, Room, Schedule } from '@wca/helpers';
import { NextFunction, Request, Response, Router } from 'express';
// import { check } from 'express-validator';
import fetch from 'node-fetch';
import { getAllUserCompetitionSubscriptions } from '../../../controllers/competitionSubscription';
import prisma from '../../../db';
import { apikeyCheck } from '../../../middlewares/apiKeyCheck';
// import { handleErrors } from '../../../middlewares/errors';
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

// Returns the array items joined with a comma except for the last which is joined with "and"
const smartJoin = (arr: string[]) =>
  arr.length > 1
    ? `${arr.slice(0, -1).join(', ')} and ${arr.pop() as string}`
    : arr[0];

const translateAssignmentCode = (assignmentCode: string) => {
  switch (assignmentCode) {
    case 'competitor':
      return 'compete';
    case 'staff-judge':
      return 'judge';
    case 'staff-scrambler':
      return 'scramble';
    case 'staff-runner':
      return 'run';
    case 'staff-dataentry':
      return 'enter data';
    case 'staff-delegate':
      return 'delegate';
    case 'staff-organizer':
      return 'organize';
    default:
      return assignmentCode;
  }
};

const getMessagingServiceSid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const messagingServiceId = await prisma.competitionSid.findFirst({
    where: {
      competitionId: {
        equals: req.body.competitionId,
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

// const isActivity = (
//   a: ActivityNotification | CompetitorNotification
// ): a is ActivityNotification => a.type === 'activity';
// const isCompetitor = (
//   a: ActivityNotification | CompetitorNotification
// ): a is CompetitorNotification => a.type === 'competitor';

/**
 * Main route with which to ping users
 * fetches the schedule and only fetches the schedule.
 * /v0/external/notify
 * body: {
 *   competitionId: string,
 *   notifications: (ActivityNotification | CompetitorNotification)[],
 * } for the same competition
 * - there will be at leas
 *
 * Assumptions
 * - all notifications aret 1 activity mentioned
 */
router.post(
  '/notify',
  apikeyCheck,
  // check('competitionId').exists().isString(),
  // check('notifications')
  //   .isArray()
  //   .custom((notifications) => {
  //     return notifications.every(
  //       (n: ActivityNotification | CompetitorNotification) => {
  //         if (isActivity(n)) {
  //           return n.id === undefined || (n.id && typeof n.id === 'number');
  //         }

  //         if (isCompetitor(n)) {
  //           return (
  //             n.wcaUserId &&
  //             typeof n.wcaUserId === 'number' &&
  //             n.registrantId &&
  //             typeof n.registrantId === 'number' &&
  //             n.name &&
  //             typeof n.name === 'string' &&
  //             typeof n.wcaId === 'string' &&
  //             (n.activityId === undefined ||
  //               (n.activityId && typeof n.activityId === 'number')) &&
  //             (n.assignmentCode === undefined ||
  //               (n.assignmentCode && typeof n.assignmentCode === 'string'))
  //           );
  //         }

  //         return false;
  //       }
  //     );
  //   }),
  // handleErrors,
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
          `${
            process.env.WCA_ORIGIN ?? ''
          }/api/v0/competitions/${competitionId}/schedule`
        )
      ).json()) as Schedule;

      const rooms = scheduleData.venues.flatMap((v) => v.rooms);
      const roomForActivityId = (activityId: number) =>
        rooms.find((r) =>
          r.activities.some(
            (a) =>
              a.id === activityId ||
              a.childActivities?.some((ca) => ca.id === activityId)
          )
        );
      const includeRoomName = rooms.length > 1;

      const activityNotifications = notifications.filter(
        (n) => n.type === 'activity'
      ) as ActivityNotification[];

      const competitorNotifications = notifications.filter(
        (n) => n.type === 'competitor'
      ) as CompetitorNotification[];

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

      const wcaUserIdsForSearch = uniqueDefinedSet(
        (
          notifications.filter(
            (n) => n.type === 'competitor'
          ) as CompetitorNotification[]
        ).map((n) => n.wcaUserId)
      );

      const userCompetitionSubscriptions =
        await getAllUserCompetitionSubscriptions(competitionId, [
          ...activityCodesForSearch,
          ...wcaUserIdsForSearch.map((i) => i.toString()),
        ]);

      // const userCompetitionCompetitorSubscriptions =
      //   await getAllUserCompetitionCompetitorSubscriptions(
      //     competitionId,
      //     wcaUserIdsForSearch
      //   );

      console.log(userCompetitionSubscriptions);

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

      console.log('Notifying', userCompetitionSubscriptions.length, 'users');
      /**
       * Determines what message to send to each user
       * Uses the assumption that all are for the same activity
       * and that there is at least 1 activity mentioned
       * First determines if there are any competitors for the user to be notified for
       * If so, then it creates a message that implies that the activity is starting
       * If not, then it creates a message that explicitly states that the activity has started
       *  */
      userCompetitionSubscriptions.forEach(
        ({ id, CompetitionSubscription: compSubs }) => {
          const competitorNotificationsForUser = competitorNotifications
            // determine which competitor notifications to send to user
            .filter((competitorNotif) =>
              compSubs.some(
                (s) => competitorNotif.wcaUserId.toString() === s.value
              )
            );

          notificationActivityCodes
            .filter((code) =>
              compSubs.some((s) => s.value === '*' || code.startsWith(s.value))
            )
            .forEach((code) => {
              const data = activityCodeData.get(code);
              if (!data) {
                return;
              }

              const activityName = data?.activities[0].name; //  They all have the same name

              const competitors = competitorNotificationsForUser.filter(
                (competitorNotif) =>
                  data.activities.some(
                    (s) => s.id === competitorNotif.activityId
                  )
              );

              if (competitors.length === 0) {
                messagesByUser.set(id, [
                  ...(messagesByUser.get(id) ?? []),
                  // TODO: create a more advanced concatenation of the room names
                  `${activityName} is starting now${
                    includeRoomName
                      ? ` on ${smartJoin(
                          data.rooms.map((room) => `the ${room.name}`)
                        )}`
                      : ''
                  }!`,
                ]);
              } else {
                messagesByUser.set(id, [
                  ...(messagesByUser.get(id) ?? []),
                  `${smartJoin(
                    competitors.map((c) => {
                      const taskName = translateAssignmentCode(
                        c.assignmentCode
                      );
                      const roomName = roomForActivityId(c.activityId)?.name;

                      return `${c.name} is being called up to ${taskName}${
                        includeRoomName && roomName ? `on the ${roomName}` : ''
                      }`;
                    })
                  )} for ${activityName}!`,
                ]);
                // Some complicated message combining all the competitors being notified
                console.log(
                  activityName,
                  competitors.map((c) => ({
                    name: c.name,
                    assignment: translateAssignmentCode(c.assignmentCode),
                  }))
                );
              }
            });
        }
      );

      const twilioRes = await Promise.allSettled(
        userCompetitionSubscriptions.map(async (user) => {
          if (!user.phoneNumber) {
            return;
          }

          const messages = messagesByUser.get(user.id) ?? [];

          if (!messages.length) {
            // Sanity check. Shouldn't happen.
            return;
          }

          return await twilioClient.messages.create({
            messagingServiceSid: req.sid,
            to: user.phoneNumber,
            body: messages.join('\n'),
          });
        })
      );

      const successfulSends = twilioRes.filter(
        (r) => r && r.status === 'fulfilled'
      );

      res.json({
        success: true,
        numberOfUsersNotified: userCompetitionSubscriptions.length,
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
