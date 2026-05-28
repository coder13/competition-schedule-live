import { createHmac, timingSafeEqual } from 'crypto';

export interface CompetitionGroupsPushSessionClaims {
  pushSubscriptionId: number;
  sub: string;
  wcaUserIds: number[];
  iat?: number;
  exp?: number;
  scope?: string;
}

const PUSH_SESSION_SCOPE = 'competitiongroups.push_session';

const decodeBase64Url = (value: string) =>
  Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

const parseJsonPart = <T>(value: string): T =>
  JSON.parse(decodeBase64Url(value).toString('utf8')) as T;

const sessionSecret = () => {
  const secret =
    process.env.COMPETITION_GROUPS_PUSH_SESSION_SECRET ??
    process.env.COMPETITION_GROUPS_JWT_SECRET;

  if (!secret) {
    throw new Error('CompetitionGroups push session secret is not configured');
  }

  return secret;
};

const sign = (input: string, secret: string) =>
  createHmac('sha256', secret).update(input).digest('base64url');

const base64UrlJson = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const parseTtlSeconds = () => {
  const raw = process.env.COMPETITION_GROUPS_PUSH_SESSION_TTL_SECONDS;
  if (!raw) {
    return null;
  }

  const ttl = Number(raw);
  if (!Number.isInteger(ttl) || ttl <= 0) {
    throw new Error('CompetitionGroups push session TTL is not valid');
  }

  return ttl;
};

export const signCompetitionGroupsPushSessionToken = ({
  pushSubscriptionId,
  sub,
  wcaUserIds,
}: {
  pushSubscriptionId: number;
  sub: string;
  wcaUserIds: number[];
}) => {
  const now = Math.floor(Date.now() / 1000);
  const ttl = parseTtlSeconds();
  const claims: CompetitionGroupsPushSessionClaims = {
    pushSubscriptionId,
    sub,
    wcaUserIds,
    iat: now,
    exp: ttl ? now + ttl : undefined,
    scope: PUSH_SESSION_SCOPE,
  };

  const encodedHeader = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
  const encodedPayload = base64UrlJson(claims);
  const signature = sign(`${encodedHeader}.${encodedPayload}`, sessionSecret());

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyCompetitionGroupsPushSessionToken = (
  token: string
): CompetitionGroupsPushSessionClaims => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid push session token format');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const header = parseJsonPart<{ alg?: string }>(encodedHeader);
  if (header.alg !== 'HS256') {
    throw new Error('Unsupported push session token algorithm');
  }

  const expectedSignature = sign(
    `${encodedHeader}.${encodedPayload}`,
    sessionSecret()
  );
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid push session token signature');
  }

  const claims =
    parseJsonPart<CompetitionGroupsPushSessionClaims>(encodedPayload);
  const now = Math.floor(Date.now() / 1000);

  if (!Number.isInteger(claims.pushSubscriptionId)) {
    throw new Error('Invalid push session subscription ID');
  }

  if (!claims.sub) {
    throw new Error('Missing push session subject');
  }

  if (claims.scope !== PUSH_SESSION_SCOPE) {
    throw new Error('Invalid push session scope');
  }

  if (claims.exp && claims.exp <= now) {
    throw new Error('Push session token expired');
  }

  if (
    !Array.isArray(claims.wcaUserIds) ||
    claims.wcaUserIds.some((id) => !Number.isInteger(id))
  ) {
    throw new Error('Invalid push session WCA user list');
  }

  return claims;
};
