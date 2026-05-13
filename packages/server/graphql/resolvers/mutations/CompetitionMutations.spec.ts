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

import { updateAutoAdvance } from './CompetitionMutations';

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

const createDb = () => ({
  competitionAccess: {
    findFirst: jest.fn().mockResolvedValue({ userId: 123 }),
  },
  activityHistory: {
    updateMany: jest.fn().mockResolvedValue({ count: 2 }),
  },
  competition: {
    update: jest.fn().mockResolvedValue({
      id: 'TestComp2026',
      autoAdvance: false,
      autoAdvanceDelay: 0,
    }),
  },
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
