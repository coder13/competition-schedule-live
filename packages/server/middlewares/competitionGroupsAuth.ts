import { NextFunction, Request, Response } from 'express';
import { verifyCompetitionGroupsToken } from '../lib/competitionGroupsToken';

export const competitionGroupsAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Missing bearer token' });
    return;
  }

  try {
    req.competitionGroups = verifyCompetitionGroupsToken(token);
    next();
  } catch (e) {
    res.status(401).json({
      success: false,
      message: e instanceof Error ? e.message : 'Invalid bearer token',
    });
  }
};
