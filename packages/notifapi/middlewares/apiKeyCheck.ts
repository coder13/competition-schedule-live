import { NextFunction, Request, Response } from 'express';

export const apikeyCheck = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers['x-api-key'] !== process.env.API_KEY) {
    res.status(401).json({ success: false, message: 'Invalid API key' });
    return;
  }

  next();
};
