import { createHmac } from 'crypto';
import { verifyCompetitionGroupsToken } from './competitionGroupsToken';

const base64UrlJson = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const createToken = (payload: Record<string, unknown>, secret = 'secret') => {
  const encodedHeader = base64UrlJson({ alg: 'HS256' });
  const encodedPayload = base64UrlJson(payload);
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

describe('verifyCompetitionGroupsToken', () => {
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

  it('returns claims for a valid HS256 token', () => {
    const token = createToken({
      sub: 'remote-user',
      wcaUserIds: [123],
      exp: 1767229200,
    });

    expect(verifyCompetitionGroupsToken(token)).toMatchObject({
      sub: 'remote-user',
      wcaUserIds: [123],
    });
  });

  it('rejects malformed tokens', () => {
    expect(() => verifyCompetitionGroupsToken('not-a-token')).toThrow(
      'Invalid token format'
    );
  });

  it('rejects tokens with invalid signatures', () => {
    const token = createToken({ sub: 'remote-user', wcaUserIds: [123] });

    expect(() => verifyCompetitionGroupsToken(`${token}x`)).toThrow(
      'Invalid token signature'
    );
  });

  it('rejects expired and not-yet-active tokens', () => {
    expect(() =>
      verifyCompetitionGroupsToken(
        createToken({ sub: 'remote-user', wcaUserIds: [123], exp: 1 })
      )
    ).toThrow('Token expired');

    expect(() =>
      verifyCompetitionGroupsToken(
        createToken({
          sub: 'remote-user',
          wcaUserIds: [123],
          nbf: 1767229200,
        })
      )
    ).toThrow('Token is not active yet');
  });

  it('enforces configured issuer and audience', () => {
    process.env.COMPETITION_GROUPS_JWT_ISSUER = 'issuer';
    process.env.COMPETITION_GROUPS_JWT_AUDIENCE = 'audience';

    expect(() =>
      verifyCompetitionGroupsToken(
        createToken({
          sub: 'remote-user',
          iss: 'other',
          aud: 'audience',
          wcaUserIds: [123],
        })
      )
    ).toThrow('Invalid token issuer');

    expect(() =>
      verifyCompetitionGroupsToken(
        createToken({
          sub: 'remote-user',
          iss: 'issuer',
          aud: 'other',
          wcaUserIds: [123],
        })
      )
    ).toThrow('Invalid token audience');
  });

  it('rejects invalid WCA user lists', () => {
    expect(() =>
      verifyCompetitionGroupsToken(
        createToken({ sub: 'remote-user', wcaUserIds: [1.5] })
      )
    ).toThrow('Invalid token WCA user list');
  });
});
