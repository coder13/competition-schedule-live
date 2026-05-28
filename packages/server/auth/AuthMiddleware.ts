import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  CompetitionGroupsClaims,
  verifyCompetitionGroupsToken,
} from '../lib/competitionGroupsToken';
const COMPETITION_GROUPS_REMOTE_SCOPE = 'notifycomp.remote';

let cachedPublicKey: string | Buffer | undefined;

const getPublicKey = () => {
  if (process.env.PUBLIC_KEY) {
    return process.env.PUBLIC_KEY;
  }

  cachedPublicKey ??= fs.readFileSync('public.key');
  return cachedPublicKey;
};

const scopesForClaims = (claims: CompetitionGroupsClaims) => [
  ...(Array.isArray(claims.scope)
    ? claims.scope
    : claims.scope
    ? [claims.scope]
    : []),
  ...(claims.scopes ?? []),
];

const competitionGroupsClaimsToUser = (
  claims: CompetitionGroupsClaims
): User => {
  const scopes = scopesForClaims(claims);
  if (!scopes.includes(COMPETITION_GROUPS_REMOTE_SCOPE)) {
    throw new Error('CompetitionGroups token is not valid for remote control');
  }

  const id = claims.wcaUserId ?? claims.wcaUserIds[0];
  if (!Number.isInteger(id)) {
    throw new Error('CompetitionGroups token is missing a WCA user ID');
  }

  return {
    type: 2,
    id,
    name: claims.name ?? claims.sub,
    wcaId: '',
    countryId: '',
    avatar: {
      url: '',
    },
    wca: {
      accessToken: '',
      expiration: 0,
      refreshToken: '',
      code: '',
    },
    competitionGroups: {
      competitionIds: claims.competitionIds,
      scopes,
    },
    iat: claims.iat ?? 0,
    exp: claims.exp ?? 0,
  };
};

export const authMiddlewareVerify = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const { headers } = req;

  const split = headers?.authorization?.split(/\s/);

  if (!split || split.length < 2) {
    next();
    return;
  }

  if (split[0] !== 'Bearer') {
    next(null);
    return;
  }

  const token = split[1];

  try {
    req.user = jwt.verify(token, getPublicKey()) as User | undefined;
    next(null);
  } catch (e) {
    try {
      const claims = verifyCompetitionGroupsToken(token);
      req.competitionGroups = claims;
      req.user = competitionGroupsClaimsToUser(claims);
      next(null);
    } catch {
      next(e);
    }
  }
};

export const authMiddlewareVerifyIgnoringExpiration = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const { headers } = req;

  const split = headers?.authorization?.split(/\s/);

  if (!split || split.length < 2) {
    next();
    return;
  }

  if (split[0] !== 'Bearer') {
    next(null);
    return;
  }

  try {
    req.user = jwt.verify(split[1], getPublicKey(), {
      ignoreExpiration: true,
    }) as User | undefined;
    next(null);
  } catch (e) {
    next(e);
  }
};

export const authMiddlewareDecode = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const { headers } = req;

  const split = headers?.authorization?.split(/\s/);

  if (!split || split.length < 2) {
    next();
    return;
  }

  if (split[0] !== 'Bearer') {
    next(null);
    return;
  }

  const token = split[1];

  req.user = jwt.decode(token) as User | undefined;
  next();
};
