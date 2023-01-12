import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? fs.readFileSync('public.key');

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
  }

  const token = split[1];

  jwt.verify(token, PUBLIC_KEY, (err, decoded) => {
    if (err) {
      return next(err);
    }

    req.user = decoded as User | undefined;
    next(null);
  });
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
  }

  const token = split[1];

  req.user = jwt.decode(token) as User | undefined;
  next();
};
