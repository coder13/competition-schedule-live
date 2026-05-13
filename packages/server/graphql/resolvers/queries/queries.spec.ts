import { userFixture } from '../../../test/helpers';
import { activities } from './ActivityQueries';
import { competition, competitions } from './CompetitionQueries';
import { currentUser } from './CurrentUser';

const callActivities = activities as (
  parent: unknown,
  args: { competitionId: string },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callCompetitions = competitions as (
  parent: unknown,
  args: { competitionIds?: string[] | null },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callCompetition = competition as (
  parent: unknown,
  args: { competitionId: string },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callCurrentUser = currentUser as (
  parent: unknown,
  args: unknown,
  context: unknown,
  info: unknown
) => Promise<unknown>;

const createDb = () => ({
  activityHistory: {
    findMany: jest.fn().mockResolvedValue([{ activityId: 1 }]),
  },
  competition: {
    findMany: jest.fn().mockResolvedValue([
      {
        id: 'TestComp2026',
        status: 'IN_PROGRESS',
        activityHistory: [],
      },
    ]),
    findFirst: jest.fn().mockResolvedValue({
      id: 'TestComp2026',
      status: 'NOT_STARTED',
      activityHistory: [],
    }),
  },
});

describe('query resolvers', () => {
  it('loads activities case-insensitively by competition ID', async () => {
    const db = createDb();

    await expect(
      callActivities({}, { competitionId: 'testcomp2026' }, { db }, {})
    ).resolves.toEqual([{ activityId: 1 }]);

    expect(db.activityHistory.findMany).toHaveBeenCalledWith({
      where: {
        competitionId: {
          equals: 'testcomp2026',
          mode: 'insensitive',
        },
      },
    });
  });

  it('loads competitions with optional ID filters', async () => {
    const db = createDb();

    await expect(
      callCompetitions(
        {},
        { competitionIds: ['TestComp2026'] },
        { db },
        {}
      )
    ).resolves.toEqual([
      {
        id: 'TestComp2026',
        status: 'IN_PROGRESS',
        activityHistory: [],
      },
    ]);

    expect(db.competition.findMany).toHaveBeenCalledWith({
      include: {
        activityHistory: true,
      },
      where: {
        id: {
          in: ['TestComp2026'],
          mode: 'insensitive',
        },
      },
    });
  });

  it('returns null when a competition is not found', async () => {
    const db = createDb();
    db.competition.findFirst.mockResolvedValue(null);

    await expect(
      callCompetition({}, { competitionId: 'missing' }, { db }, {})
    ).resolves.toBeNull();
  });

  it('returns the current user ID or rejects anonymous users', async () => {
    await expect(
      callCurrentUser({}, {}, { user: userFixture({ id: 123 }) }, {})
    ).resolves.toEqual({ id: 123 });

    await expect(callCurrentUser({}, {}, { user: undefined }, {})).rejects.toThrow(
      'Not Authenticated'
    );
  });
});
