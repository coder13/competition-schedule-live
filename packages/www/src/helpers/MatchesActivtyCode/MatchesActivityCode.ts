import { parseActivityCode } from '@wca/helpers';

const matchesActivityCode = (baseActivityCode: string) => {
  if (baseActivityCode === '*') return () => true;

  return (activityCode: string) => {
    if (
      baseActivityCode.startsWith('other') ||
      activityCode.startsWith('other')
    ) {
      return baseActivityCode === activityCode;
    }

    if (baseActivityCode === activityCode) return true;

    const {
      eventId: eventIdA,
      roundNumber: roundNumberA,
      groupNumber: groupNumberA,
    } = parseActivityCode(baseActivityCode);

    const {
      eventId: eventIdB,
      roundNumber: roundNumberB,
      groupNumber: groupNumberB,
    } = parseActivityCode(activityCode);

    return (
      eventIdA === eventIdB &&
      (!roundNumberA || roundNumberA === roundNumberB) &&
      (!groupNumberA || groupNumberA === groupNumberB)
    );
  };
};

export default matchesActivityCode;
