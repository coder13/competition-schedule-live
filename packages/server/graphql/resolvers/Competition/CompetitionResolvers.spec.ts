import { userFixture } from '../../../test/helpers';
import { activities } from './Activities';
import { competitionAccess } from './CompetitionAccess';
import { webhooks } from './Webhooks';

const callActivities = activities as (
  parent: { id: string },
  args: { ongoing?: boolean | null },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callCompetitionAccess = competitionAccess as (
  parent: { id: string },
  args: unknown,
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callWebhooks = webhooks as (
  parent: { id: string },
  args: unknown,
  context: unknown,
  info: unknown
) => Promise<unknown>;

const createDb = () => ({
  activityHistory: {
    findMany: jest.fn().mockResolvedValue([{ activityId: 1 }]),
  },
  competitionAccess: {
    findMany: jest.fn().mockResolvedValue([{ userId: 123 }]),
  },
  webhook: {
    findMany: jest.fn().mockResolvedValue([
      {
        id: 1,
        url: 'https://hooks.example/notify',
        method: 'POST',
        headers: [{ key: 'X-Test', value: 'true' }],
      },
    ]),
  },
});

describe('competition field resolvers', () => {
  it('loads ongoing activities for a competition', async () => {
    const db = createDb();

    await expect(
      callActivities({ id: 'TestComp2026' }, { ongoing: true }, { db }, {})
    ).resolves.toEqual([{ activityId: 1 }]);

    expect(db.activityHistory.findMany).toHaveBeenCalledWith({
      where: {
        competitionId: {
          equals: 'TestComp2026',
          mode: 'insensitive',
        },
        endTime: null,
      },
    });
  });

  it('loads competition access entries case-insensitively', async () => {
    const db = createDb();

    await expect(
      callCompetitionAccess({ id: 'TestComp2026' }, {}, { db }, {})
    ).resolves.toEqual([{ userId: 123 }]);

    expect(db.competitionAccess.findMany).toHaveBeenCalledWith({
      where: {
        competitionId: {
          equals: 'TestComp2026',
          mode: 'insensitive',
        },
      },
    });
  });

  it('hides webhook headers from regular users and exposes them to admins', async () => {
    const regularDb = createDb();
    await expect(
      callWebhooks(
        { id: 'TestComp2026' },
        {},
        { db: regularDb, user: userFixture({ id: 123 }) },
        {}
      )
    ).resolves.toEqual([
      {
        id: 1,
        url: 'https://hooks.example/notify',
        method: 'POST',
      },
    ]);

    const adminDb = createDb();
    await expect(
      callWebhooks(
        { id: 'TestComp2026' },
        {},
        { db: adminDb, user: userFixture({ id: 8184 }) },
        {}
      )
    ).resolves.toEqual([
      {
        id: 1,
        url: 'https://hooks.example/notify',
        method: 'POST',
        headers: [{ key: 'X-Test', value: 'true' }],
      },
    ]);
  });
});
