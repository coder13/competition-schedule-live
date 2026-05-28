import { createHmac } from 'crypto';
import {
  signCompetitionGroupsPushSessionToken,
  verifyCompetitionGroupsPushSessionToken,
} from './competitionGroupsPushSessionToken';

const base64UrlJson = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const createToken = (payload: Record<string, unknown>, secret = 'secret') => {
  const encodedHeader = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
  const encodedPayload = base64UrlJson(payload);
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

describe('CompetitionGroups push session tokens', () => {
  const env = process.env;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    process.env = {
      ...env,
      COMPETITION_GROUPS_JWT_SECRET: 'secret',
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    process.env = env;
  });

  it('signs durable push session tokens', () => {
    const token = signCompetitionGroupsPushSessionToken({
      pushSubscriptionId: 10,
      sub: 'wca:123',
      wcaUserIds: [123],
    });

    expect(verifyCompetitionGroupsPushSessionToken(token)).toMatchObject({
      pushSubscriptionId: 10,
      sub: 'wca:123',
      wcaUserIds: [123],
      scope: 'competitiongroups.push_session',
    });
  });

  it('uses the dedicated push session secret when configured', () => {
    process.env.COMPETITION_GROUPS_PUSH_SESSION_SECRET = 'push-secret';

    const token = signCompetitionGroupsPushSessionToken({
      pushSubscriptionId: 10,
      sub: 'wca:123',
      wcaUserIds: [123],
    });

    expect(verifyCompetitionGroupsPushSessionToken(token).sub).toBe('wca:123');
    expect(() =>
      verifyCompetitionGroupsPushSessionToken(
        createToken({
          pushSubscriptionId: 10,
          sub: 'wca:123',
          scope: 'competitiongroups.push_session',
          wcaUserIds: [123],
        })
      )
    ).toThrow('Invalid push session token signature');
  });

  it('can enforce an optional session TTL', () => {
    process.env.COMPETITION_GROUPS_PUSH_SESSION_TTL_SECONDS = '60';

    const token = signCompetitionGroupsPushSessionToken({
      pushSubscriptionId: 10,
      sub: 'wca:123',
      wcaUserIds: [123],
    });

    jest.setSystemTime(new Date('2026-01-01T00:02:00Z'));

    expect(() => verifyCompetitionGroupsPushSessionToken(token)).toThrow(
      'Push session token expired'
    );
  });

  it('rejects invalid push session claims', () => {
    expect(() =>
      verifyCompetitionGroupsPushSessionToken(
        createToken({
          pushSubscriptionId: 10,
          sub: 'wca:123',
          scope: 'wrong',
          wcaUserIds: [123],
        })
      )
    ).toThrow('Invalid push session scope');

    expect(() =>
      verifyCompetitionGroupsPushSessionToken(
        createToken({
          pushSubscriptionId: 10,
          sub: 'wca:123',
          scope: 'competitiongroups.push_session',
          wcaUserIds: [1.5],
        })
      )
    ).toThrow('Invalid push session WCA user list');
  });
});
