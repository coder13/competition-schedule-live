interface ActivityNotification {
  type: 'activity';
  id: number;
}

interface CompetitorNotification {
  type: 'competitor';
  /**
   * global wca user id of competitor
   */
  wcaUserId: number;
  /**
   * local competition id of competitor
   */
  registrantId: number;
  /**
   * name of competitor
   */
  name: string;
  wcaId?: string | null;
  activityId: number;
  assignmentCode: string;
}

interface PingNotification {
  type: 'ping';
}
