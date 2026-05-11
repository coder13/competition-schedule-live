import { User } from './prisma/generated/client';
import { CompetitionGroupsClaims } from '../lib/competitionGroupsToken';

declare module 'express-session' {
  interface SessionData {
    auth: {
      number?: {
        number: string;
        code: string;
        expires: number; // Unix timestamp
        verified?: boolean;
      };
    };
    userId?: number;
  }
}

declare module 'express' {
  interface Request {
    user?: User;
    sid?: string;
    competitionGroups?: CompetitionGroupsClaims;
  }
}
