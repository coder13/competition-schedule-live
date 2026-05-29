import fs from 'fs';
import os from 'os';
import path from 'path';
import { getGitCommit, getHealthCheck } from './healthCheck';

const createMigrationsDir = (migrationNames: string[]) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'notifycomp-migrations-'));
  migrationNames.forEach((name) => {
    fs.mkdirSync(path.join(dir, name));
  });
  return dir;
};

describe('healthCheck', () => {
  const originalGitCommit = process.env.GIT_COMMIT;

  afterEach(() => {
    if (originalGitCommit === undefined) {
      delete process.env.GIT_COMMIT;
    } else {
      process.env.GIT_COMMIT = originalGitCommit;
    }
  });

  it('reports a healthy database and applied migrations', async () => {
    process.env.GIT_COMMIT = 'abc123';
    const migrationsDir = createMigrationsDir(['20260101000000_init']);
    const db = {
      $queryRawUnsafe: jest
        .fn()
        .mockResolvedValueOnce([{ '?column?': 1 }])
        .mockResolvedValueOnce([
          {
            migration_name: '20260101000000_init',
            started_at: new Date('2026-01-01T00:00:00Z'),
            finished_at: new Date('2026-01-01T00:00:01Z'),
            rolled_back_at: null,
          },
        ]),
    };

    await expect(getHealthCheck(db, migrationsDir)).resolves.toEqual({
      status: 'ok',
      commit: {
        sha: 'abc123',
        source: 'env:GIT_COMMIT',
      },
      database: {
        ok: true,
      },
      migrations: {
        ok: true,
        latestApplied: '20260101000000_init',
        pending: [],
        failed: [],
      },
    });
  });

  it('reports pending and failed migrations as degraded', async () => {
    const migrationsDir = createMigrationsDir([
      '20260101000000_init',
      '20260201000000_next',
    ]);
    const db = {
      $queryRawUnsafe: jest
        .fn()
        .mockResolvedValueOnce([{ '?column?': 1 }])
        .mockResolvedValueOnce([
          {
            migration_name: '20260101000000_init',
            started_at: new Date('2026-01-01T00:00:00Z'),
            finished_at: new Date('2026-01-01T00:00:01Z'),
            rolled_back_at: null,
          },
          {
            migration_name: '20260301000000_failed',
            started_at: new Date('2026-03-01T00:00:00Z'),
            finished_at: null,
            rolled_back_at: null,
          },
        ]),
    };

    const result = await getHealthCheck(db, migrationsDir);

    expect(result).toMatchObject({
      status: 'degraded',
      database: {
        ok: true,
      },
      migrations: {
        ok: false,
        latestApplied: '20260101000000_init',
        pending: ['20260201000000_next'],
        failed: ['20260301000000_failed'],
      },
    });
  });

  it('reports database errors as degraded', async () => {
    const migrationsDir = createMigrationsDir([]);
    const db = {
      $queryRawUnsafe: jest.fn().mockRejectedValue(new Error('db down')),
    };

    await expect(getHealthCheck(db, migrationsDir)).resolves.toMatchObject({
      status: 'degraded',
      database: {
        ok: false,
        error: 'db down',
      },
      migrations: {
        ok: false,
        latestApplied: null,
        error: 'Unable to read migration status',
      },
    });
  });

  it('uses the git commit environment variable when present', () => {
    process.env.GIT_COMMIT = 'commit-from-env';

    expect(getGitCommit()).toEqual({
      sha: 'commit-from-env',
      source: 'env:GIT_COMMIT',
    });
  });
});
