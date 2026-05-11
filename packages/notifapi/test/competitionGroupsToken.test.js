/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const test = require('node:test');

const {
  verifyCompetitionGroupsToken,
} = require('../lib/competitionGroupsToken');

const originalEnv = { ...process.env };

const base64UrlJson = (value) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const createToken = (payload, secret = 'test-secret') => {
  const encodedHeader = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
  const encodedPayload = base64UrlJson(payload);
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

test.afterEach(() => {
  process.env = { ...originalEnv };
});

test('verifyCompetitionGroupsToken returns valid claims', () => {
  process.env.COMPETITION_GROUPS_JWT_SECRET = 'test-secret';
  process.env.COMPETITION_GROUPS_JWT_ISSUER = 'competitiongroups.com';
  process.env.COMPETITION_GROUPS_JWT_AUDIENCE = 'notifycomp';

  const exp = Math.floor(Date.now() / 1000) + 60;
  const token = createToken({
    sub: 'competitiongroups:user:123',
    iss: 'competitiongroups.com',
    aud: ['notifycomp'],
    exp,
    wcaUserIds: [123, 456],
  });

  assert.deepEqual(verifyCompetitionGroupsToken(token), {
    sub: 'competitiongroups:user:123',
    iss: 'competitiongroups.com',
    aud: ['notifycomp'],
    exp,
    wcaUserIds: [123, 456],
  });
});

test('verifyCompetitionGroupsToken rejects invalid signatures', () => {
  process.env.COMPETITION_GROUPS_JWT_SECRET = 'test-secret';
  const token = createToken(
    {
      sub: 'competitiongroups:user:123',
      wcaUserIds: [123],
    },
    'wrong-secret'
  );

  assert.throws(
    () => verifyCompetitionGroupsToken(token),
    /Invalid token signature/
  );
});

test('verifyCompetitionGroupsToken rejects unauthorized audiences', () => {
  process.env.COMPETITION_GROUPS_JWT_SECRET = 'test-secret';
  process.env.COMPETITION_GROUPS_JWT_AUDIENCE = 'notifycomp';
  const token = createToken({
    sub: 'competitiongroups:user:123',
    aud: 'other-service',
    wcaUserIds: [123],
  });

  assert.throws(
    () => verifyCompetitionGroupsToken(token),
    /Invalid token audience/
  );
});
