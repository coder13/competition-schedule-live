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
    pushDeliveryUpdate.mockReset().mockResolvedValue({ id: 20 });
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

  it('leaves the worker disabled unless assignment pushes are enabled', () => {
    delete process.env.ASSIGNMENT_PUSH_ENABLED;

    startAssignmentNotificationWorker();

    expect(console.info).toHaveBeenCalledWith(
      'Assignment push worker disabled'
    );
  });
});
