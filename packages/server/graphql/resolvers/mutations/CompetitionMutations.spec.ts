/* eslint-disable import/first */
import { userFixture } from '../../../test/helpers';

const mockCancelCompetitionActivityJobs = jest.fn();
const mockDetermineAndScheduleCompetition = jest.fn();
const mockFetchCompWithNoScheduledActivities = jest.fn();

jest.mock('../../../scheduler', () => ({
  cancelCompetitionActivityJobs: mockCancelCompetitionActivityJobs,
  determineAndScheduleCompetition: mockDetermineAndScheduleCompetition,
}));

jest.mock('../../../scheduler/utils', () => ({
  fetchCompWithNoScheduledActivities: mockFetchCompWithNoScheduledActivities,
}));

import { importCompetition, updateAutoAdvance } from './CompetitionMutations';

const callImportCompetition = importCompetition as (
  parent: unknown,
  args: { competitionId: string },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const callUpdateAutoAdvance = updateAutoAdvance as (
  parent: unknown,
  args: {
    competitionId: string;
    autoAdvance?: boolean | null;
    autoAdvanceDelay?: number | null;
  },
  context: unknown,
  info: unknown
) => Promise<unknown>;

const createDb = () => {
  const db = {
    competitionAccess: {
      findFirst: jest.fn().mockResolvedValue({ userId: 123 }),
      createMany: jest.fn().mockResolvedValue({ count: 3 }),
    },
    activityHistory: {
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    competition: {
      upsert: jest.fn().mockResolvedValue({
        id: 'TestComp2026',
        name: 'Test Competition',
      }),
      findFirstOrThrow: jest.fn().mockResolvedValue({
        id: 'TestComp2026',
        name: 'Test Competition',
        competitionAccess: [{ userId: 123, roomId: 0 }],
      }),
      update: jest.fn().mockResolvedValue({
        id: 'TestComp2026',
        autoAdvance: false,
        autoAdvanceDelay: 0,
      }),
    },
  };

  return {
    ...db,
    $transaction: jest.fn(async (callback: (tx: typeof db) => unknown) =>
      callback(db)
    ),
  };
};

describe('CompetitionMutations.importCompetition', () => {
  it('rejects unauthenticated imports', async () => {
    await expect(
      callImportCompetition(
        {},
        { competitionId: 'TestComp2026' },
        { db: createDb(), user: undefined, wcaApi: { getWcif: jest.fn() } },
        {}
      )
    ).rejects.toThrow('Not Authenticated');
  });

  it('upserts a competition with delegate and organizer access', async () => {
    const db = createDb();
    const wcaApi = {
      getWcif: jest.fn().mockResolvedValue({
        id: 'TestComp2026',
        name: 'Test Competition',
        persons: [
          { wcaUserId: 111, roles: ['delegate'] },
          { wcaUserId: 222, roles: ['trainee-delegate'] },
          { wcaUserId: 333, roles: ['organizer'] },
          { wcaUserId: 444, roles: [] },
        ],
        schedule: {
          startDate: '2026-05-01',
          numberOfDays: 3,
          venues: [{ countryIso2: 'US' }],
        },
      }),
    };

    await expect(
      callImportCompetition(
        {},
        { competitionId: 'TestComp2026' },
        { db, user: userFixture(), wcaApi },
        {}
      )
    ).resolves.toEqual({
      id: 'TestComp2026',
      name: 'Test Competition',
      competitionAccess: [{ userId: 123, roomId: 0 }],
    });

    expect(wcaApi.getWcif).toHaveBeenCalledWith('TestComp2026');
    expect(db.$transaction).toHaveBeenCalled();
    expect(db.competition.upsert).toHaveBeenCalledWith({
      where: {
        id: 'TestComp2026',
      },
      update: {
        name: 'Test Competition',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        country: 'US',
      },
      create: {
        id: 'TestComp2026',
        name: 'Test Competition',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        country: 'US',
      },
    });
    expect(db.competitionAccess.createMany).toHaveBeenCalledWith({
      data: [
        { competitionId: 'TestComp2026', userId: 111, roomId: 0 },
        { competitionId: 'TestComp2026', userId: 222, roomId: 0 },
        { competitionId: 'TestComp2026', userId: 333, roomId: 0 },
      ],
      skipDuplicates: true,
    });
  });

  it('rejects imports when the WCIF has invalid schedule metadata', async () => {
    const db = createDb();
    const wcaApi = {
      getWcif: jest.fn().mockResolvedValue({
        id: 'TestComp2026',
        name: 'Test Competition',
        persons: [],
        schedule: {
          startDate: 'not-a-date',
          numberOfDays: 1,
          venues: [{ countryIso2: 'US' }],
        },
      }),
    };

    await expect(
      callImportCompetition(
        {},
        { competitionId: 'TestComp2026' },
        { db, user: userFixture(), wcaApi },
        {}
      )
    ).rejects.toThrow('WCIF competition has an invalid start date');

    expect(db.competition.upsert).not.toHaveBeenCalled();
  });
});

describe('CompetitionMutations.updateAutoAdvance', () => {
  beforeEach(() => {
    mockCancelCompetitionActivityJobs.mockReset();
    mockDetermineAndScheduleCompetition.mockReset().mockResolvedValue(undefined);
    mockFetchCompWithNoScheduledActivities.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('clears queued activity times and cancels jobs when disabling auto advance', async () => {
    const db = createDb();

    await callUpdateAutoAdvance(
      {},
      {
        competitionId: 'TestComp2026',
        autoAdvance: false,
        autoAdvanceDelay: null,
      },
      { db, user: userFixture() },
      {}
    );

    expect(db.activityHistory.updateMany).toHaveBeenCalledWith({
      where: {
        competitionId: 'TestComp2026',
        OR: [
          { scheduledEndTime: { not: null } },
          { scheduledStartTime: { not: null } },
        ],
      },
      data: {
        scheduledStartTime: null,
        scheduledEndTime: null,
      },
    });
    expect(mockCancelCompetitionActivityJobs).toHaveBeenCalledWith(
      'TestComp2026'
    );
    expect(db.competition.update).toHaveBeenCalledWith({
      where: {
        id: 'TestComp2026',
      },
      data: {
        autoAdvance: false,
      },
    });
  });

  it('allows Competition Groups users scoped to the competition without access rows', async () => {
    const db = createDb();
    db.competitionAccess.findFirst.mockResolvedValue(null);
    db.competition.update.mockResolvedValue({
      id: 'TestComp2026',
      autoAdvance: false,
      autoAdvanceDelay: 45,
    });

    await expect(
      callUpdateAutoAdvance(
        {},
        {
          competitionId: 'testcomp2026',
          autoAdvance: null,
          autoAdvanceDelay: 45,
        },
        {
          db,
          user: userFixture({
            competitionGroups: {
              competitionIds: ['TestComp2026'],
              scopes: ['notifycomp.remote'],
            },
          }),
        },
        {}
      )
    ).resolves.toEqual({
      id: 'TestComp2026',
      autoAdvance: false,
      autoAdvanceDelay: 45,
    });

    expect(db.competitionAccess.findFirst).not.toHaveBeenCalled();
  });

  it('does not schedule when only updating the auto-advance delay', async () => {
    const db = createDb();

    await callUpdateAutoAdvance(
      {},
      {
        competitionId: 'TestComp2026',
        autoAdvance: null,
        autoAdvanceDelay: 45,
      },
      { db, user: userFixture() },
      {}
    );

    expect(mockFetchCompWithNoScheduledActivities).not.toHaveBeenCalled();
    expect(mockDetermineAndScheduleCompetition).not.toHaveBeenCalled();
    expect(db.competition.update).toHaveBeenCalledWith({
      where: {
        id: 'TestComp2026',
      },
      data: {
        autoAdvanceDelay: 45,
      },
    });
  });

  it('rejects negative auto-advance delays', async () => {
    const db = createDb();

    await expect(
      callUpdateAutoAdvance(
        {},
        {
          competitionId: 'TestComp2026',
          autoAdvance: null,
          autoAdvanceDelay: -1,
        },
        { db, user: userFixture() },
        {}
      )
    ).rejects.toThrow('Auto advance delay must be non-negative');

    expect(db.competition.update).not.toHaveBeenCalled();
  });

  it('schedules the competition when enabling auto advance and no queued activities exist', async () => {
    const db = createDb();
    const competition = { id: 'TestComp2026', activityHistory: [] };
    mockFetchCompWithNoScheduledActivities.mockResolvedValue(competition);
    db.competition.update.mockResolvedValue({
      id: 'TestComp2026',
      autoAdvance: true,
      autoAdvanceDelay: 30,
    });

    await callUpdateAutoAdvance(
      {},
      {
        competitionId: 'TestComp2026',
        autoAdvance: true,
        autoAdvanceDelay: 30,
      },
      { db, user: userFixture() },
      {}
    );

    expect(mockFetchCompWithNoScheduledActivities).toHaveBeenCalledWith(
      'TestComp2026'
    );
    expect(mockDetermineAndScheduleCompetition).toHaveBeenCalledWith(
      competition
    );
    expect(db.competition.update).toHaveBeenCalledWith({
      where: {
        id: 'TestComp2026',
      },
      data: {
        autoAdvance: true,
        autoAdvanceDelay: 30,
      },
    });
  });
});
