// This function maps an activity code to a more descriptive version.
// If the activity code is 'other-misc', it appends the name to create a unique identifier.
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

// This function filters activities based on a given activity code.
// If the activity code starts with 'other-misc-', it checks if the activity
// code is 'other-misc' and the name matches the rest of the activity code.
// Otherwise, it checks if the activity code matches exactly.
export const filterBetterActivityCode =
  (activityCode: string) => (a: { activityCode: string; name: string }) => {
    if (a.activityCode === activityCode) {
      return true;
    }

    return (
      a.activityCode === 'other-misc' &&
      a.name.toLowerCase().replace(' ', '-') ===
        activityCode.replace('other-misc-', '')
    );
  };
