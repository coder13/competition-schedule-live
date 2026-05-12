import { createHmac, timingSafeEqual } from 'crypto';

export interface CompetitionGroupsClaims {
  sub: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nbf?: number;
  competitionIds?: string[];
  name?: string;
  scope?: string | string[];
  scopes?: string[];
  wcaUserId?: number;
  wcaUserIds: number[];
}

const decodeBase64Url = (value: string) =>
  Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

const parseJsonPart = <T>(value: string): T =>
  JSON.parse(decodeBase64Url(value).toString('utf8')) as T;

const sign = (input: string, secret: string) =>
  createHmac('sha256', secret).update(input).digest('base64url');

const audienceMatches = (
  actual: string | string[] | undefined,
  expected: string
) => {
  if (!actual) {
    return false;
  }

  return Array.isArray(actual)
    ? actual.includes(expected)
    : actual === expected;
};

export const verifyCompetitionGroupsToken = (
  token: string
): CompetitionGroupsClaims => {
  const secret = process.env.COMPETITION_GROUPS_JWT_SECRET;
  if (!secret) {
    throw new Error('CompetitionGroups JWT secret is not configured');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const header = parseJsonPart<{ alg?: string }>(encodedHeader);
  if (header.alg !== 'HS256') {
    throw new Error('Unsupported token algorithm');
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid token signature');
  }

  const claims = parseJsonPart<CompetitionGroupsClaims>(encodedPayload);
  const now = Math.floor(Date.now() / 1000);

  if (!claims.sub) {
    throw new Error('Missing token subject');
  }

  if (claims.exp && claims.exp <= now) {
    throw new Error('Token expired');
  }

  if (claims.nbf && claims.nbf > now) {
    throw new Error('Token is not active yet');
  }

  if (
    process.env.COMPETITION_GROUPS_JWT_ISSUER &&
    claims.iss !== process.env.COMPETITION_GROUPS_JWT_ISSUER
  ) {
    throw new Error('Invalid token issuer');
  }

  if (
    process.env.COMPETITION_GROUPS_JWT_AUDIENCE &&
    !audienceMatches(claims.aud, process.env.COMPETITION_GROUPS_JWT_AUDIENCE)
  ) {
    throw new Error('Invalid token audience');
  }

  if (
    !Array.isArray(claims.wcaUserIds) ||
    claims.wcaUserIds.some((id) => !Number.isInteger(id))
  ) {
    throw new Error('Invalid token WCA user list');
  }

  return claims;
};
