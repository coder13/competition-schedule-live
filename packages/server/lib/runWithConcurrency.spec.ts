import {
  runWithConcurrency,
  settleWithConcurrency,
} from './runWithConcurrency';

describe('runWithConcurrency', () => {
  it('runs all workers and preserves result order', async () => {
    await expect(
      runWithConcurrency([1, 2, 3], async (value) => value * 2, 2)
    ).resolves.toEqual([2, 4, 6]);
  });

  it('limits concurrent workers', async () => {
    let active = 0;
    let maxActive = 0;

    await runWithConcurrency(
      [1, 2, 3, 4],
      async () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await new Promise((resolve) => {
          setTimeout(resolve, 1);
        });
        active -= 1;
      },
      2
    );

    expect(maxActive).toBe(2);
  });

  it('settles worker failures without aborting remaining work', async () => {
    const results = await settleWithConcurrency(
      [1, 2, 3],
      async (value) => {
        if (value === 2) {
          throw new Error('failed');
        }

        return value;
      },
      2
    );

    expect(results.map((result) => result.status)).toEqual([
      'fulfilled',
      'rejected',
      'fulfilled',
    ]);
  });
});
