import { Competition } from '@wca/helpers';

const createActivityNotification = (
  activityId: number
): ActivityNotification => ({
  type: 'activity',
  id: activityId,
});

const createCompetitorNotificationsForActivity = (
  wcif: Competition,
  activityId: number
): CompetitorNotification[] => {
  const persons = wcif.persons.filter((p) =>
    p.assignments?.some((a) => a.activityId === activityId)
  );

  return persons.map((p) => ({
    type: 'competitor',
    activityId,
    wcaUserId: p.wcaUserId,
    registrantId: p.registrantId,
    name: p.name,
    wcaId: p.wcaId,
    assignmentCode:
      p.assignments?.find((a) => a.activityId === activityId)?.assignmentCode ??
      '',
  }));
};

export const createNotificationsForActivity = (
  wcif: Competition,
  activities: number[]
) => {
  const competitorActivities = activities.map((a) =>
    createCompetitorNotificationsForActivity(wcif, a)
  );

  return {
    competitionId: wcif.id,
    notifications: [
      ...activities.map(createActivityNotification),
      ...competitorActivities.flat(),
    ],
  };
};
