import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface MigrationRow {
  migration_name: string;
  started_at: Date;
  finished_at: Date | null;
  rolled_back_at: Date | null;
}

interface HealthCheckDb {
  $queryRawUnsafe: <T = unknown>(query: string) => Promise<T>;
}

export interface HealthCheckResult {
  status: 'ok' | 'degraded';
  commit: {
    sha: string | null;
    source: string;
  };
  database: {
    ok: boolean;
    error?: string;
  };
  migrations: {
    ok: boolean;
    latestApplied: string | null;
    pending: string[];
    failed: string[];
    error?: string;
  };
}

const MIGRATIONS_DIR = path.join(__dirname, '..', 'prisma', 'migrations');

const commitEnvKeys = [
  'GIT_COMMIT',
  'SOURCE_COMMIT',
  'COMMIT_SHA',
  'DO_APP_DEPLOYMENT_COMMIT',
];

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

export const getGitCommit = () => {
  for (const key of commitEnvKeys) {
    const value = process.env[key];
    if (value) {
      return { sha: value, source: `env:${key}` };
    }
  }

  try {
    return {
      sha: execFileSync('git', ['rev-parse', 'HEAD'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim(),
      source: 'git',
    };
  } catch {
    return { sha: null, source: 'unknown' };
  }
};

const listMigrationNames = (migrationsDir: string) =>
  fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const latestAppliedMigration = (rows: MigrationRow[]) =>
  rows
    .filter((row) => row.finished_at)
    .sort((a, b) => b.finished_at!.getTime() - a.finished_at!.getTime())[0]
    ?.migration_name ?? null;

export const getHealthCheck = async (
  db: HealthCheckDb,
  migrationsDir = MIGRATIONS_DIR
): Promise<HealthCheckResult> => {
  const commit = getGitCommit();

  try {
    await db.$queryRawUnsafe('SELECT 1');

    const migrationRows = await db.$queryRawUnsafe<MigrationRow[]>(
      'SELECT migration_name, started_at, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at'
    );

    const appliedMigrations = new Set(
      migrationRows
        .filter((row) => row.finished_at)
        .map((row) => row.migration_name)
    );
    const pending = listMigrationNames(migrationsDir).filter(
      (name) => !appliedMigrations.has(name)
    );
    const failed = migrationRows
      .filter((row) => !row.finished_at && !row.rolled_back_at)
      .map((row) => row.migration_name);
    const migrationsOk = pending.length === 0 && failed.length === 0;

    return {
      status: migrationsOk ? 'ok' : 'degraded',
      commit,
      database: {
        ok: true,
      },
      migrations: {
        ok: migrationsOk,
        latestApplied: latestAppliedMigration(migrationRows),
        pending,
        failed,
      },
    };
  } catch (error) {
    return {
      status: 'degraded',
      commit,
      database: {
        ok: false,
        error: errorMessage(error),
      },
      migrations: {
        ok: false,
        latestApplied: null,
        pending: [],
        failed: [],
        error: 'Unable to read migration status',
      },
    };
  }
};
