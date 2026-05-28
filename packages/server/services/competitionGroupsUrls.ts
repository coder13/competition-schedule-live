export const competitionGroupsPersonUrl = (
  competitionId: string,
  wcaUserId: number
) => {
  const origin = process.env.COMPETITION_GROUPS_ORIGIN;
  if (!origin) {
    return undefined;
  }

  return `${origin.replace(
    /\/$/,
    ''
  )}/competitions/${competitionId}/persons/${wcaUserId}`;
};
