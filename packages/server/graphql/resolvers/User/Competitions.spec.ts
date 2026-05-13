import { competitions } from './Competitions';

const callCompetitions = competitions as (
  parent: { id: number },
  args: unknown,
  context: unknown,
  info: unknown
) => Promise<unknown>;

describe('user field resolvers', () => {
  it('loads competitions accessible to a user', async () => {
    const db = {
      competition: {
        findMany: jest.fn().mockResolvedValue([{ id: 'TestComp2026' }]),
      },
    };

    await expect(
      callCompetitions({ id: 123 }, {}, { db }, {})
    ).resolves.toEqual([{ id: 'TestComp2026' }]);

    expect(db.competition.findMany).toHaveBeenCalledWith({
      include: {
        activityHistory: true,
      },
      where: {
        competitionAccess: {
          some: {
            userId: 123,
          },
        },
      },
    });
  });
});
