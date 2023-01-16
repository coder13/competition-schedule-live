import { NextFunction, Request, Response } from 'express';
import prisma from '../db';

export async function getUser(req: Request, _: Response, next: NextFunction) {
  if (!req.session.userId) {
    return next();
  }

  const user = await prisma.user.findFirst({
    where: {
      id: req.session.userId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  req.user = user;

  next();
}
