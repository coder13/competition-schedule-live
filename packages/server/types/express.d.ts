declare namespace Express {
  export interface Request {
    user?: User;
    competitionGroups?: import('../lib/competitionGroupsToken').CompetitionGroupsClaims;
  }
}
