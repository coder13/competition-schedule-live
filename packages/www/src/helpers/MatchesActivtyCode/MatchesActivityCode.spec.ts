import matchesActivityCode from './MatchesActivityCode';

describe('helpers/MatchesActivityCode', () => {
  it('Matches events', () => {
    expect(matchesActivityCode('333')('333')).toBe(true);
    expect(matchesActivityCode('333oh')('333oh')).toBe(true);
    expect(matchesActivityCode('444')('333')).toBe(false);
    expect(matchesActivityCode('333oh')('333')).toBe(false);
    expect(matchesActivityCode('333')('333oh')).toBe(false);
  });

  it('Matches sub activityCodes', () => {
    expect(matchesActivityCode('333')('333-r1')).toBe(true);
    expect(matchesActivityCode('333')('333-r2')).toBe(true);
    expect(matchesActivityCode('333oh')('333-r1')).toBe(false);
  });

  it('Matches other activity codes', () => {
    expect(matchesActivityCode('other-lunch')('other-lunch')).toBe(true);
    expect(matchesActivityCode('other-lunch')('other-awards')).toBe(false);
    expect(matchesActivityCode('333-r1')('other-awards')).toBe(false);
    expect(matchesActivityCode('other-awards')('333-r1')).toBe(false);
  });

  it('Matches all activity code token', () => {
    expect(matchesActivityCode('*')('333')).toBe(true);
    expect(matchesActivityCode('*')('333-r1')).toBe(true);
    expect(matchesActivityCode('*')('333-r1-g1')).toBe(true);
    expect(matchesActivityCode('*')('444-r1-g1-a2')).toBe(true);
  });
});
