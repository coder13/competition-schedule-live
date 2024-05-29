export const mapToBetterActivityCode = ({
  name,
  activityCode,
}: {
  name: string;
  activityCode: string;
}) => {
  if (activityCode === 'other-misc') {
    return `other-misc-${name.toLowerCase().replace(' ', '-')}`;
  }
  return activityCode;
};

export const filterBetterActivityCode =
  (activityCode: string) => (a: { activityCode: string; name: string }) => {
    if (activityCode.startsWith('other-misc-')) {
      return (
        a.activityCode === 'other-misc' &&
        a.name.toLowerCase().replace(' ', '-') ===
        activityCode.replace('other-misc-', '')
      );
    }
    return a.activityCode === activityCode;
  };

