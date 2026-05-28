export const runWithConcurrency = async <T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<R[]> => {
  if (!items.length) {
    return [];
  }

  const workerCount = Math.min(
    items.length,
    Math.max(1, Math.floor(concurrency))
  );
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await worker(items[index], index);
      }
    })
  );

  return results;
};

export const settleWithConcurrency = async <T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<Array<PromiseSettledResult<R>>> =>
  runWithConcurrency(
    items,
    async (item, index): Promise<PromiseSettledResult<R>> => {
      try {
        return {
          status: 'fulfilled',
          value: await worker(item, index),
        };
      } catch (reason) {
        return {
          status: 'rejected',
          reason,
        };
      }
    },
    concurrency
  );
