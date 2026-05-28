/* eslint-disable import/first */
const assignmentWatchFindMany = jest.fn();
const assignmentSnapshotFindUnique = jest.fn();
const assignmentSnapshotUpsert = jest.fn();
const pushDeliveryFindFirst = jest.fn();
const pushDeliveryCreate = jest.fn();
const pushDeliveryUpdateMany = jest.fn();
const pushDeliveryUpdate = jest.fn();
const sendAssignmentPush = jest.fn();
const fetchWcif = jest.fn();

jest.mock('../db', () => ({
  __esModule: true,
  default: {
    assignmentWatch: {
      findMany: assignmentWatchFindMany,
    },
    assignmentSnapshot: {
      findUnique: assignmentSnapshotFindUnique,
      upsert: assignmentSnapshotUpsert,
    },
    pushDelivery: {
      findFirst: pushDeliveryFindFirst,
      create: pushDeliveryCreate,
      updateMany: pushDeliveryUpdateMany,
      update: pushDeliveryUpdate,
    },
  },
}));

jest.mock('./webPush', () => ({
  sendAssignmentPush,
}));

jest.mock('./wcif', () => ({
  fetchWcif,
}));

import {
  runAssignmentNotificationPoll,
  startAssignmentNotificationWorker,
} from './assignmentNotificationWorker';

const subscription = {
  id: 10,
  endpoint: 'https://push.example/subscription',
  p256dh: 'p256dh',
  auth: 'auth',
};

const activeWatch = {
  competitionId: 'TestComp2026',
  wcaUserId: 123,
  pushSubscription: subscription,
};

const pollNow = new Date('2026-01-01T10:00:00Z');

interface TestActivity {
  id: number;
  name: string;
  activityCode: string;
  startTime: string;
  endTime: string;
  childActivities: TestActivity[];
  extensions: never[];
}

const activity = (
  id: number,
  startTime: string,
  childActivities: TestActivity[] = []
): TestActivity => ({
  id,
  name: `activity-${id}`,
  activityCode: `activity-${id}`,
  startTime,
  endTime: new Date(
    new Date(startTime).getTime() + 30 * 60 * 1000
  ).toISOString(),
  childActivities,
  extensions: [],
});

const scheduleWithRooms = (rooms: Array<{ activities: TestActivity[] }>) => ({
  startDate: '2026-01-01',
  numberOfDays: 1,
  venues: [
    {
      id: 1,
      name: 'Main venue',
      latitudeMicrodegrees: 0,
      longitudeMicrodegrees: 0,
      countryIso2: 'US',
      timezone: 'UTC',
      rooms: rooms.map((room, index) => ({
        id: index + 1,
        name: `Room ${index + 1}`,
        color: '#ffffff',
        extensions: [],
        ...room,
      })),
      extensions: [],
    },
  ],
});

const wcifWithSchedule = (schedule: ReturnType<typeof scheduleWithRooms>) => ({
  id: 'TestComp2026',
  name: 'Test Competition 2026',
  persons: [
    {
      wcaUserId: 123,
      assignments: [
        {
          activityId: 1,
          assignmentCode: 'competitor',
          stationNumber: null,
        },
      ],
    },
  ],
  schedule,
});

describe('assignment notification worker', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      COMPETITION_GROUPS_ORIGIN: 'https://groups.example/',
    };
    assignmentWatchFindMany.mockReset();
    assignmentSnapshotFindUnique.mockReset().mockResolvedValue({
      assignmentsHash: 'old-hash',
    });
    assignmentSnapshotUpsert.mockReset().mockResolvedValue({});
    pushDeliveryFindFirst.mockReset().mockResolvedValue(null);
    pushDeliveryCreate.mockReset().mockResolvedValue({ id: 20 });
    pushDeliveryUpdateMany.mockReset().mockResolvedValue({ count: 1 });
    pushDeliveryUpdate
      .mockReset()
      .mockImplementation(async ({ where }) => ({ id: where.id }));
    sendAssignmentPush.mockReset().mockResolvedValue({
      success: true,
      error: null,
    });
    fetchWcif.mockReset().mockResolvedValue({
      id: 'TestComp2026',
      persons: [
        {
          wcaUserId: 123,
          assignments: [
            {
              activityId: 1,
              assignmentCode: 'competitor',
              stationNumber: null,
            },
          ],
        },
      ],
    });
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = env;
    jest.restoreAllMocks();
  });

  it('updates snapshots and sends pushes when assignments change', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);

    await runAssignmentNotificationPoll();

    expect(assignmentWatchFindMany).toHaveBeenCalledWith({
      where: {
        pushSubscription: {
          disabledAt: null,
        },
      },
      include: {
        pushSubscription: true,
      },
    });
    expect(fetchWcif).toHaveBeenCalledWith('TestComp2026');
    expect(assignmentSnapshotUpsert).toHaveBeenCalledWith({
      where: {
        competitionId_wcaUserId: {
          competitionId: 'TestComp2026',
          wcaUserId: 123,
        },
      },
      update: {
        assignmentsHash: expect.any(String),
      },
      create: {
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        assignmentsHash: expect.any(String),
      },
    });
    expect(sendAssignmentPush).toHaveBeenCalledWith(
      subscription,
      expect.objectContaining({
        type: 'assignment-change',
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        title: 'Assignment update',
        url: 'https://groups.example/competitions/TestComp2026/persons/123',
        dedupeKey: expect.stringContaining(
          'assignment-change:TestComp2026:123:'
        ),
      })
    );
    expect(pushDeliveryUpdate).toHaveBeenCalledWith({
      where: {
        id: 20,
      },
      data: {
        status: 'sent',
        error: expect.anything(),
      },
    });
  });

  it('does not send a push for first snapshots or unchanged assignments', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    assignmentSnapshotFindUnique.mockResolvedValue(null);

    await runAssignmentNotificationPoll();

    expect(assignmentSnapshotUpsert).toHaveBeenCalled();
    expect(sendAssignmentPush).not.toHaveBeenCalled();
  });

  it('skips delivery when a matching push delivery was already sent', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    pushDeliveryFindFirst.mockResolvedValue({ id: 99, status: 'sent' });

    await runAssignmentNotificationPoll();

    expect(pushDeliveryCreate).not.toHaveBeenCalled();
    expect(sendAssignmentPush).not.toHaveBeenCalled();
    expect(assignmentSnapshotUpsert).toHaveBeenCalled();
  });

  it('retries failed deliveries before advancing the assignment snapshot', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    pushDeliveryFindFirst.mockResolvedValue({ id: 99, status: 'failed' });

    await runAssignmentNotificationPoll();

    expect(pushDeliveryUpdateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: 99,
      }),
      data: {
        status: 'pending',
        error: expect.anything(),
      },
    });
    expect(sendAssignmentPush).toHaveBeenCalled();
    expect(assignmentSnapshotUpsert).toHaveBeenCalled();
  });

  it('does not retry a matching push delivery that is already in flight', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    pushDeliveryFindFirst.mockResolvedValue({
      id: 99,
      status: 'pending',
      updatedAt: new Date(),
    });
    pushDeliveryUpdateMany.mockResolvedValue({ count: 0 });

    await runAssignmentNotificationPoll();

    expect(pushDeliveryCreate).not.toHaveBeenCalled();
    expect(sendAssignmentPush).not.toHaveBeenCalled();
    expect(assignmentSnapshotUpsert).not.toHaveBeenCalled();
  });

  it('records failed assignment-change deliveries without a Competition Groups URL', async () => {
    delete process.env.COMPETITION_GROUPS_ORIGIN;
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    sendAssignmentPush.mockResolvedValue({
      success: false,
      error: { message: 'push failed' },
    });

    await runAssignmentNotificationPoll();

    expect(sendAssignmentPush).toHaveBeenCalledWith(
      subscription,
      expect.objectContaining({
        url: undefined,
      })
    );
    expect(pushDeliveryUpdate).toHaveBeenCalledWith({
      where: {
        id: 20,
      },
      data: {
        status: 'failed',
        error: { message: 'push failed' },
      },
    });
    expect(assignmentSnapshotUpsert).not.toHaveBeenCalled();
  });

  it('sends one reminder when the earliest activity starts within 24 hours', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    assignmentSnapshotFindUnique.mockResolvedValue(null);
    fetchWcif.mockResolvedValue(
      wcifWithSchedule(
        scheduleWithRooms([
          {
            activities: [activity(1, '2026-01-02T09:00:00.000Z')],
          },
        ])
      )
    );

    await runAssignmentNotificationPoll(pollNow);

    expect(pushDeliveryCreate).toHaveBeenCalledWith({
      data: {
        pushSubscriptionId: subscription.id,
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        dedupeKey:
          'competition-start-reminder:TestComp2026:123:2026-01-02T09:00:00.000Z',
        status: 'pending',
      },
    });
    expect(sendAssignmentPush).toHaveBeenCalledWith(
      subscription,
      expect.objectContaining({
        type: 'competition-start-reminder',
        competitionId: 'TestComp2026',
        wcaUserId: 123,
        startsAt: '2026-01-02T09:00:00.000Z',
        title: 'Competition tomorrow',
        body: 'Test Competition 2026 starts within 24 hours.',
        url: 'https://groups.example/competitions/TestComp2026/persons/123',
        dedupeKey:
          'competition-start-reminder:TestComp2026:123:2026-01-02T09:00:00.000Z',
      })
    );
    expect(pushDeliveryUpdate).toHaveBeenCalledWith({
      where: {
        id: 20,
      },
      data: {
        status: 'sent',
        error: expect.anything(),
      },
    });
  });

  it('uses the earliest activity across rooms and child activities', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    assignmentSnapshotFindUnique.mockResolvedValue(null);
    fetchWcif.mockResolvedValue(
      wcifWithSchedule(
        scheduleWithRooms([
          {
            activities: [activity(1, '2026-01-02T12:00:00.000Z')],
          },
          {
            activities: [
              activity(2, '2026-01-02T11:00:00.000Z', [
                activity(3, '2026-01-02T08:30:00.000Z'),
                activity(4, '2026-01-02T10:00:00.000Z'),
              ]),
            ],
          },
        ])
      )
    );

    await runAssignmentNotificationPoll(pollNow);

    expect(sendAssignmentPush).toHaveBeenCalledWith(
      subscription,
      expect.objectContaining({
        type: 'competition-start-reminder',
        startsAt: '2026-01-02T08:30:00.000Z',
        dedupeKey:
          'competition-start-reminder:TestComp2026:123:2026-01-02T08:30:00.000Z',
      })
    );
  });

  it('skips reminders when the earliest activity is more than 24 hours away', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    assignmentSnapshotFindUnique.mockResolvedValue(null);
    fetchWcif.mockResolvedValue(
      wcifWithSchedule(
        scheduleWithRooms([
          {
            activities: [activity(1, '2026-01-02T10:00:01.000Z')],
          },
        ])
      )
    );

    await runAssignmentNotificationPoll(pollNow);

    expect(sendAssignmentPush).not.toHaveBeenCalled();
    expect(pushDeliveryCreate).not.toHaveBeenCalled();
  });

  it('skips reminders when the earliest activity is already past', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    assignmentSnapshotFindUnique.mockResolvedValue(null);
    fetchWcif.mockResolvedValue(
      wcifWithSchedule(
        scheduleWithRooms([
          {
            activities: [activity(1, '2026-01-01T09:59:59.000Z')],
          },
        ])
      )
    );

    await runAssignmentNotificationPoll(pollNow);

    expect(sendAssignmentPush).not.toHaveBeenCalled();
    expect(pushDeliveryCreate).not.toHaveBeenCalled();
  });

  it('skips reminders when a matching delivery was already sent', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    assignmentSnapshotFindUnique.mockResolvedValue(null);
    pushDeliveryFindFirst.mockResolvedValue({ id: 99, status: 'sent' });
    fetchWcif.mockResolvedValue(
      wcifWithSchedule(
        scheduleWithRooms([
          {
            activities: [activity(1, '2026-01-02T09:00:00.000Z')],
          },
        ])
      )
    );

    await runAssignmentNotificationPoll(pollNow);

    expect(pushDeliveryCreate).not.toHaveBeenCalled();
    expect(sendAssignmentPush).not.toHaveBeenCalled();
    expect(assignmentSnapshotUpsert).toHaveBeenCalled();
  });

  it('retries failed reminder deliveries while still in the window', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    assignmentSnapshotFindUnique.mockResolvedValue(null);
    pushDeliveryFindFirst.mockResolvedValue({ id: 99, status: 'failed' });
    fetchWcif.mockResolvedValue(
      wcifWithSchedule(
        scheduleWithRooms([
          {
            activities: [activity(1, '2026-01-02T09:00:00.000Z')],
          },
        ])
      )
    );

    await runAssignmentNotificationPoll(pollNow);

    expect(pushDeliveryCreate).not.toHaveBeenCalled();
    expect(pushDeliveryUpdateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: 99,
      }),
      data: {
        status: 'pending',
        error: expect.anything(),
      },
    });
    expect(sendAssignmentPush).toHaveBeenCalledWith(
      subscription,
      expect.objectContaining({
        type: 'competition-start-reminder',
      })
    );
    expect(pushDeliveryUpdate).toHaveBeenCalledWith({
      where: {
        id: 99,
      },
      data: {
        status: 'sent',
        error: expect.anything(),
      },
    });
  });

  it('still runs assignment-change logic after reminder checks', async () => {
    assignmentWatchFindMany.mockResolvedValue([activeWatch]);
    fetchWcif.mockResolvedValue(
      wcifWithSchedule(
        scheduleWithRooms([
          {
            activities: [activity(1, '2026-01-02T09:00:00.000Z')],
          },
        ])
      )
    );

    await runAssignmentNotificationPoll(pollNow);

    expect(sendAssignmentPush).toHaveBeenNthCalledWith(
      1,
      subscription,
      expect.objectContaining({
        type: 'competition-start-reminder',
      })
    );
    expect(sendAssignmentPush).toHaveBeenNthCalledWith(
      2,
      subscription,
      expect.objectContaining({
        type: 'assignment-change',
      })
    );
    expect(assignmentSnapshotUpsert).toHaveBeenCalled();
  });

  it('leaves the worker disabled unless assignment pushes are enabled', () => {
    delete process.env.ASSIGNMENT_PUSH_ENABLED;

    startAssignmentNotificationWorker();

    expect(console.info).toHaveBeenCalledWith(
      'Assignment push worker disabled'
    );
  });
});
